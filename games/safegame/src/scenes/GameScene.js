import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { DataManager } from '../utils/DataManager.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { UIHelper } from '../utils/UIHelper.js';
import { MessageBoxScene } from './MessageBoxScene.js';
import { GameGuide } from '../utils/GameGuide.js';

/**游戏主场景 */
export class GameScene extends Phaser.Scene {
    levelId;
    levelData;
    gameState;
    currentZoom;

    imgScene;     // 游戏场景图片
    btnDemo;      // 示例按钮
    lblProgress;  // 进度文本
    lblLevelName; // 关卡任务
    lblTimer;     // 倒计时文本


    constructor() {
        super({ key: 'GameScene' });
        this.guide = null;
    }

    /**init scene. data: {levelId: 'level2'} */
    init(data) {
        this.levelId = data.levelId;
        this.levelData = GameConfig.levels.filter(t => t.levelId == this.levelId)[0];
        this.currentZoom = 1;
        this.gameState = {
            isStarted: false,
            timeLeft: this.levelData.config.timeLimit,
            timer: null,
            missCount: 0,
            spots: this.levelData.config.spots.map(spot => ({
                ...spot,
                found: false
            }))
        };
    }

    preload() {
        UIHelper.showLoading(this);
        const basePath = GameConfig.ASSETS.LEVELS_PATH;
        this.load.image(`scene_${this.levelId}`, `${basePath}/${this.levelId}/scene.jpg`);
        this.load.image('arrow-left', 'assets/images/arrow-left.svg');
        this.load.audio('tick', 'assets/sounds/tick.mp3');
    }

    /**create scene */
    create() {
        this.createUI();
        this.createLevelScene();
        this.setPressEvent();
        //this.setZoomEvent();

        // 检查是否首次进入
        const data = DataManager.getData();
        if (data.guideShown) {
            // 直接开始游戏
            this.startGame();
        } else {
            // 设置引导步骤
            this.guide = new GameGuide(this, GameConfig.UI.DEPTHS.OVERLAY);
            this.guide.setSteps([
                {
                    target: this.lblProgress,
                    text: '此处为统计数据：发现数/总数/点错数'
                },
                {
                    // taget 为一个不可见的矩形，用于引导玩家点击场景图片
                    target: this.add.rectangle(0, 200, this.game.canvas.width, this.game.canvas.height-400, 0x000000, 0).setOrigin(0,0).setVisible(false),
                    text: '请点击场景图片，找到隐患'
                    //target: this.imgScene,
                    //text: '点击场景图片，找到隐患'
                },
                {
                    target: this.btnDemo,
                    text: '点击该按钮可显示正确示例'
                }
            ]);
            this.guide.start(() => { this.startGame();});    // 启动引导，结束后开始游戏

            
            // 标记引导已显示
            const data = DataManager.getData();
            data.guideShown = true;
            DataManager.saveData(data);
        }
    }

    /**创建固定UI */
    createUI() {
        // 返回按钮
        ButtonHelper.createCircle( this, 60, 60, 'arrow-left', {},
            () => {
                if (this.gameState.timer) {
                    clearInterval(this.gameState.timer);
                }
                SceneHelper.goScene(this, 'LevelSelectScene');
            }
        ).setDepth(GameConfig.UI.DEPTHS.UI);

        // 显示示例按钮
        var demoData = GameConfig.levels.filter(item => item.levelId == this.levelData.demoId)[0];
        this.btnDemo = ButtonHelper.createAnimated(
            this,
            this.game.canvas.width/2,
            this.game.canvas.height - 100,
            '正确示例',
            {width: 450, bgColor: GameConfig.UI.COLORS.WARN},
            () => {
                if (this.gameState.timer)
                    clearInterval(this.gameState.timer);
                SceneHelper.goScene(this, 'GameDetailScene', {levelData : demoData});
            }
        ).setDepth(GameConfig.UI.DEPTHS.UI);

        // 状态栏背景
        this.statusBar = this.add.rectangle(
            0, 0,
            this.game.canvas.width,
            GameConfig.HEADER_HEIGHT,
            0x000000,
            0.2
        ).setOrigin(0, 0).setDepth(GameConfig.UI.DEPTHS.UI);
        
        // 关卡任务（居中）
        this.lblLevelName = this.add.text(
            this.game.canvas.width/2,
            GameConfig.HEADER_HEIGHT/2,
            this.levelData.config.task || '',
            {
                fontSize: 56,
                color: 'yellow',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(GameConfig.UI.DEPTHS.UI);

        // 倒计时（左对齐，向右移动避开返回按钮）
        this.lblTimer = this.add.text(
            120,
            GameConfig.HEADER_HEIGHT/2,
            `${this.gameState.timeLeft}秒`,
            {
                fontSize: 56,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        ).setOrigin(0, 0.5).setDepth(GameConfig.UI.DEPTHS.UI);

        // 进度（右对齐）
        const totalSpots = this.levelData.config.spots.length;  // 从配置获取总数
        this.lblProgress = this.add.text(
            this.game.canvas.width - 20,
            GameConfig.HEADER_HEIGHT/2,
            `0/${totalSpots}/0`,  // 精简显示
            {
                fontSize: 56,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        ).setOrigin(1, 0.5).setDepth(GameConfig.UI.DEPTHS.UI);
    }

    /**创建游戏主场景，放置游戏图片 */
    createLevelScene() {
        const gameHeight = this.game.canvas.height - GameConfig.HEADER_HEIGHT;

        // 创建游戏场景图片
        this.imgScene = this.add.image(
            0,
            GameConfig.HEADER_HEIGHT,
            `scene_${this.levelId}`
        ).setOrigin(0, 0)
        .setDisplaySize(this.game.canvas.width, gameHeight)
        ;

        // 保存场景尺寸，用于计算点击位置
        this.gameScene = {
            image: this.imgScene,
            width: this.game.canvas.width,
            height: gameHeight
        };
    }
    


    //-------------------------------------------------------
    // 游戏逻辑和绘制
    //-------------------------------------------------------
    /**开始游戏（开启定时器、游戏结束判定） */
    startGame() {
        // 开启倒计时时钟
        this.gameState.isStarted = true;
        this.gameState.playedTickSound = false; // 添加音效控制标志
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            if (this.lblTimer) {
                this.lblTimer.setText(`${this.gameState.timeLeft}秒`);  // 精简显示
                // 在剩余10秒时播放滴滴声
                if (this.gameState.timeLeft <= 10 && !this.gameState.playedTickSound) {
                    this.sound.play('tick');
                    this.gameState.playedTickSound = true;
                }
            }
            if (this.gameState.timeLeft <= 0) {
                this.sound.stopByKey('tick');
                this.endGame(false);
            }
        }, 1000);
    }

    /**游戏结束（统计和跳转） 
     * @param {boolean} isWin 是否胜利
    */
    endGame(isWin) {
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        this.gameState.isStarted = false;
        
        // 计算和保存成绩
        const timeUsed = this.levelData.config.timeLimit - this.gameState.timeLeft;
        let starCount = timeUsed < 45 ? 3 : (timeUsed < 75 ? 2 : 1);
        // 如果错误点击超过5次，最多只能获得2星
        if (this.gameState.missCount > 5) {
            starCount = Math.min(starCount, 2);
        }
        if (isWin) {
            DataManager.setStars(this.levelId, starCount);
        }

        // 暂停当前场景并启动结果场景
        SceneHelper.showScene(this, 'GameResultScene', {
            result: isWin,
            timeUsed: timeUsed,
            starCount: isWin? starCount : 0,
            levelData : this.levelData
        }, false);
    }    

    /**设置缩放逻辑（有bug） */
    setZoomEvent() {
        this.minZoom = 1;
        this.maxZoom = 3;
        this.activePointers = [];

        // 监听触摸开始事件
        this.input.addPointer(2); // 启用多点触控支持


        // 多指触控放缩逻辑
        this.input.on('pointerdown', (pointer) => {
            if (!this.activePointers.includes(pointer)) {
                this.activePointers.push(pointer);
                console.log(`触控点添加: ID=${pointer.id}, x=${pointer.x}, y=${pointer.y}, 当前触控点数量: ${this.activePointers.length}`);
            }

            // 如果有两个触摸点，记录初始距离
            if (this.activePointers.length === 2) {
                const p1 = this.activePointers[0];
                const p2 = this.activePointers[1];
                this.initialPinchDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
                this.initialZoom = this.currentZoom;
                console.log(`双指触控开始: 初始距离=${this.initialPinchDistance}, 初始缩放=${this.initialZoom}`);
            }
        });

        // 监听触摸移动事件（先屏蔽，手机实测有bug）
        this.input.on('pointermove', (pointer) => {
            if (this.activePointers.length === 2) {
                const p1 = this.activePointers[0];
                const p2 = this.activePointers[1];
                const currentDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);

                // 计算缩放比例
                const scaleFactor = currentDistance / this.initialPinchDistance;
                const newZoom = this.initialZoom * scaleFactor;
                console.log(`缩放计算: 当前距离=${currentDistance}, 缩放因子=${scaleFactor}, 新缩放值=${newZoom}`);
                if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
                    this.currentZoom = newZoom;
                    this.imgScene.setScale(this.currentZoom);

                    // 调整图片位置，使缩放以双指中心点为基准
                    const centerX = (p1.x + p2.x) / 2;
                    const centerY = (p1.y + p2.y) / 2;
                    this.imgScene.x = centerX - (centerX - this.imgScene.x) * scaleFactor;
                    this.imgScene.y = centerY - (centerY - this.imgScene.y) * scaleFactor;
                    console.log(`图片调整: 中心点=(${centerX}, ${centerY}), 新位置=(${this.imgScene.x}, ${this.imgScene.y})`);
                }
            }
        });

        // 监听触摸结束事件
        this.input.on('pointerup', (pointer) => {
            const index = this.activePointers.indexOf(pointer);
            if (index > -1) {
                this.activePointers.splice(index, 1);
                console.log(`触控点移除: ID=${pointer.id}, 剩余触控点数量: ${this.activePointers.length}`);
            }
        });

        // 监听触摸取消事件
        this.input.on('pointerout', (pointer) => {
            const index = this.activePointers.indexOf(pointer);
            if (index > -1) {
                this.activePointers.splice(index, 1);
            }
        });
    }

    
    /**设置点按事件 */
    setPressEvent() {
        this.input.on('pointerdown', (pointer) => {
            if (this.gameState.isStarted) {
                this.handlePress(pointer.x, pointer.y);
            }
        });
    }

    /**点按事件处理（判定是否点击到隐患位置） */
    handlePress(x, y) {
        if (!this.gameState.isStarted) return;

        // 计算相对坐标, 考虑缩放和位置偏移
        const relativeX = (x - this.imgScene.x) / (this.gameScene.width * this.currentZoom);
        const relativeY = (y - this.imgScene.y) / (this.gameScene.height * this.currentZoom);
        for (let spot of this.gameState.spots) {
            if (spot.found) continue;
            const distance = Phaser.Math.Distance.Between(relativeX, relativeY, spot.x, spot.y);
            if (distance < spot.radius) {
                spot.found = true;
                this.sound.play('find');
                
                // 创建粒子效果
                this.createFoundEffect(x, y);
                const { lineEndX, lineEndY } = this.createMarkerPoint(x, y);
                const card = this.createMarkerText(lineEndX, lineEndY + 10, spot);

                // 更新进度
                this.showProgress();

                // 如果找到所有隐患点，则显示结果弹窗
                const foundCount = this.gameState.spots.filter(h => h.found).length;
                const totalSpots = this.levelData.config.spots.length;
                if (foundCount === totalSpots) {
                    this.gameState.isStarted = false;
                    setTimeout(() => {this.endGame(true);}, 1000);
                }
                return;
            }
        }
        
        this.gameState.missCount++;
        this.sound.play('wrong');
        this.createMissMarker(x, y);

        // 更新进度显示，包含错误点击次数
        this.showProgress();
    }


    /**显示关卡进度信息 */
    showProgress() {
        const foundCount = this.gameState.spots.filter(h => h.found).length;
        const missCount = this.gameState.missCount;
        const totalSpots = this.levelData.config.spots.length;
        if (this.lblProgress) {
            this.lblProgress.setText(`${foundCount}/${totalSpots}/${missCount}`);
        }
    }

    /**创建找到特效 */
    createFoundEffect(x, y) {
        // 创建简单的星形粒子
        const particles = this.add.particles(x, y, 'star', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.1, end: 0 },
            lifespan: 600,
            gravityY: 200,
            quantity: 1,
            frequency: 50,
            duration: 400,
            emitting: true,
            tint: 0xffff00
        });

        // 添加简单的闪光效果
        const flash = this.add.circle(x, y, 30, 0xffff00, 0.6);
        this.tweens.add({
            targets: flash,
            scale: 1.5,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
                particles.destroy();
            }
        });
    }

    /**创建点击失败标签 */
    createMissMarker(x, y) {
        const marker = this.add.circle(x, y, 30, 0x00FF00, 0.6);
        marker.setDepth(50);
        this.tweens.add({
            targets: marker,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => marker.destroy()
        });
    }

    /**创建点击成功标签 */
    createMarkerPoint(x, y) {
        // 创建连接线
        const lineLength = 50;
        const lineEndX = x;
        const lineEndY = y + lineLength;
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xFFFFFF, 0.8);
        graphics.beginPath();
        graphics.moveTo(x, y);
        graphics.lineTo(lineEndX, lineEndY);
        graphics.strokePath();
        graphics.setDepth(GameConfig.UI.DEPTHS.UI);

        // 创建圆形标记
        const marker = this.add.circle(x, y, 10, 0xFF0000);
        marker.setDepth(GameConfig.UI.DEPTHS.UI);
        marker.setInteractive({ cursor: 'pointer' });
        //UIHelper.setAnimation(this, marker);

        return { lineEndX, lineEndY };
    }

    /**创建隐患详情卡 */
    createMarkerText(x, y, spot) {
        const padding = 30;
        const minWidth = 200;
        const maxWidth = 600;
        const height = 80;

        // 先创建文本以测量宽度
        const lbl = this.add.text(
            0, 0,
            spot.name,
            {
                fontSize: 56,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        );
        const textWidth = lbl.width;
        const actualWidth = Math.min(Math.max(textWidth + padding * 2, minWidth), maxWidth);

        // 创建背景（白色外框、黑色背景），设置文本位置
        const bg = UIHelper.createRoundRect(this, x - actualWidth/2, y - padding, actualWidth, height, 20, 0x000000, 0.9, 0xffffff, 1).setDepth(GameConfig.UI.DEPTHS.UI);
        lbl.setPosition(x, y + height/2 - padding).setOrigin(0.5);
        UIHelper.setAnimation(this, lbl, 0.9);

        // 创建容器，点击后显示详情
        const container = this.add.container(0, 0, [bg, lbl]);
        container.setDepth(GameConfig.UI.DEPTHS.UI);
        container.setInteractive(new Phaser.Geom.Rectangle(
            x - actualWidth/2,
            y - padding,
            actualWidth,
            height
        ), Phaser.Geom.Rectangle.Contains);
        container.on('pointerdown', () => {
            MessageBoxScene.show(
                this,
                spot.name,
                [spot.desc, '', '法律依据：', spot.law].join('\n'),
                () => {}
            )
        });

        return container;
    }


}
