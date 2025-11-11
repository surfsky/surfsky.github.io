import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { DataManager } from '../utils/DataManager.js';
import { UIHelper } from '../utils/UIHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { Sharer } from '../utils/Sharer.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.levelPanel = null;
        this.isDragging = false;
        this.lastY = 0;
    }

    /**预加载 */
    preload() {
        UIHelper.showLoading(this);
        // 读取所有关卡的配置信息
        GameConfig.levels.forEach(level => {
            this.load.json("levelconfig-" + level.levelId, `${GameConfig.ASSETS.LEVELS_PATH}/${level.levelId}/config.json`);
        });
        this.load.image('arrow-left', 'assets/images/arrow-left.svg');
        this.load.image('camera', 'assets/images/camera.svg');
        this.load.image('lock', 'assets/images/lock.svg');
    }


    /**创建 */
    create() {
        // 将关卡配置文件保存到全局变量中去，以后即可用 GameConfig.levels进行访问
        GameConfig.levels.forEach(level => {
            level.config = this.cache.json.get("levelconfig-" + level.levelId);
        });
        const gameLevels = GameConfig.levels.filter(t => t.type=='game');

        // 显示游戏关卡列表
        this.createBackground();
        this.createTitle(gameLevels);
        this.createBackButton();
        this.createScreenshotButton();
        this.createLevelButtons(gameLevels);
    }

    /**创建背景 */
    createBackground() {
        // 背景图片
        this.bg = this.add.image(
            this.game.canvas.width/2,
            this.game.canvas.height/2,
            'bg'
        ).setDepth(GameConfig.UI.DEPTHS.BACKGROUND);
        UIHelper.scaleFit(this, this.bg);
        UIHelper.createMask(this, GameConfig.UI.DEPTHS.BACKGROUND+1, 0.5);
    }


    /**创建标题区域 */
    createTitle(levels) {
        const title = DataManager.calculateTitle();
        
        // 标题背景
        //this.add.rectangle(
        //    0, 0, 
        //    this.game.canvas.width, 200,
        //    0x000000, 0.5
        //).setOrigin(0, 0).setDepth(GameConfig.UI.DEPTHS.OVERLAY - 1);

        // 主标题
        this.add.text(
            this.game.canvas.width/2,
            60,
            GameConfig.UI.TEXTS.TITLE,
            {
                fontSize: 96,
                color: 'yellow',
                fontFamily: GameConfig.UI.FONTS.TITLE,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5).setDepth(GameConfig.UI.DEPTHS.UI);

        // 称号
        this.add.text(
            this.game.canvas.width/2,
            150,
            `称号：${title}`,
            {
                fontSize: 56,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(0.5).setDepth(GameConfig.UI.DEPTHS.UI);
    }

    /**创建返回按钮 */
    createBackButton() {
        ButtonHelper.createCircle(this, 60, 60, 'arrow-left', {}, () => {
            SceneHelper.goScene(this, 'WelcomeScene');
        });
    }

    /**创建分享按钮 */
    createScreenshotButton() {
        // 分享按钮
        if (navigator.share) {
            const btnShare = ButtonHelper.createCircle(
                this,
                window.innerWidth - 160,
                60,
                'share',
                {iconScale: 2},
                () => {Sharer.share(GameConfig.UI.TEXTS.TITLE, null);}
            );
        }

        // 截图按钮
        ButtonHelper.createCircle(
            this,
            this.game.canvas.width - 60,
            60,
            'camera',
            {},
            () => {Sharer.snap(this);}
        );
    }


    /**创建关卡按钮 */
    createLevelButtons(levels) {
        // 创建可滚动容器
        this.levelPanel = UIHelper.createScrollPanel(this, 0, 300, this.game.canvas.width, this.game.canvas.height/0.8, this.game.canvas.height*1.5)
            .setDepth(GameConfig.UI.DEPTHS.UI);

        // 添加关卡按钮
        const startX = this.game.canvas.width * 0.15;
        const startY = 50; // 从容器顶部开始
        const padding = 80;
        const btnWidth = 700;
        const btnHeight = 120;

        GameConfig.levels.filter(t => t.type=='game').forEach((level, index) => {
            const x = startX;
            const y = startY + index * (btnHeight + padding);
            const formattedName = `${index + 1}. ${level.name}`.replace(/[，。：]/g, '\n');
            const isUnlocked = DataManager.isLevelUnlocked(level.levelId);

            // 创建关卡按钮
            const button = ButtonHelper.create(
                this,
                x + btnWidth/2,
                y + btnHeight/2,
                formattedName,
                {
                    width: btnWidth,
                    height: btnHeight,
                    radius: 25,
                    fontSize: 64,
                    padding: 20,
                    //alpha: isUnlocked ? 1 : 0.5,
                    bgColor: isUnlocked ? GameConfig.UI.COLORS.PRIMARY : 0x666666
                },
                () => {
                    if (isUnlocked) {
                        SceneHelper.goScene(this, 'GameScene', { levelId: level.levelId});
                    }
                }
            );
            this.levelPanel.add(button);

            // 如果关卡未解锁，添加锁定图标
            if (!isUnlocked) {
                const lock = this.add.image(90, y + btnHeight/2, 'lock').setOrigin(0, 0.5).setScale(2);
                this.levelPanel.add(lock);
            }

            // 添加星星评分
            const stars = DataManager.getStars(level.levelId);
            const starSpacing = 60;
            const startStarX = x + btnWidth - 170;
            const starY = y;
            for (let i = 0; i < 3; i++) {
                const star = this.add.image(startStarX + (i * starSpacing), starY, 'star').setScale(0.03);
                if (i >= stars) {
                    star.setTint(0x666666);
                } 
                this.levelPanel.add(star);
            }
        });

        // 设置容器高度
        const totalHeight = startY + levels.length * (btnHeight + padding);
        this.levelPanel.setSize(this.game.canvas.width, totalHeight);
    }




}
