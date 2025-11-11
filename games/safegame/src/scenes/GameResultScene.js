import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { DataManager } from '../utils/DataManager.js';
import { Sharer } from '../utils/Sharer.js';

/**游戏结果场景 */
export class GameResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameResultScene' });
    }
    
    preload() {
        // 加载分享和庆祝动画所需的图标
        this.load.image('camera', 'assets/images/camera.svg');
        this.load.image('share', 'assets/images/share.svg');
        this.load.image('trumpet', 'assets/images/trumpet.svg');
    }

    /**init. data: {resut, timeUsed, starcount, levelData} */
    init(data) {
        this.result = data.result;
        this.timeUsed = data.timeUsed;
        this.starCount = data.starCount;
        this.levelData = data.levelData;

        //
        this.levelId = data.levelData.levelId;
        this.gameLevels = GameConfig.levels.filter(t=>t.type == "game");
    }

    create() {
        this.createMask();
        this.createResultTitle();
        this.createTimeText();
        this.createStars();
        this.createBackButton();
        this.createTitleBadge();
        
        // 只在成功时显示结果按钮
        if (this.result) {
            this.createResultButtons();

            // 如果是最后一关通关，显示称号
            if (this.isLastLevel()) {
                // 分享按钮
                const userTitle = DataManager.calculateTitle();
                const startY = this.game.canvas.height * 0.65;
                const spacing = 0.08;
                var text = `我通关了 ${GameConfig.UI.TEXTS.TITLE} 游戏, 获得 ${userTitle} 称号！`;
                ButtonHelper.createAnimated(
                    this,
                    this.game.canvas.width/2,
                    startY + this.game.canvas.height * spacing * 3,
                    '分享成绩',
                    {bgColor: GameConfig.UI.COLORS.WARN},
                    () => { Sharer.shareSnap(this, text);}
                );

                // 通过特效
                this.createCelebrationEffects();
            }
        } else {
            // 失败时只显示重试按钮
            ButtonHelper.create(
                this,
                this.game.canvas.width/2,
                this.game.canvas.height * 0.7,
                '重新尝试',
                {},
                () => this.scene.start('GameScene', { levelId: this.levelData.levelId })
            );
        }
    }

    /** draw mask */
    createMask() {
        this.resultMask = this.add.rectangle(
            0, 0,
            this.game.canvas.width, this.game.canvas.height,
            0x000000, 0.7
        ).setOrigin(0, 0);//.setDepth(GameConfig.UI.DEPTHS.GAME+1);
    }

    // 新增方法：判断是否是最后一关
    isLastLevel() {
        const currentLevelIndex = this.gameLevels.findIndex(level => 
            level.levelId === this.levelData.levelId
        );
        return currentLevelIndex === this.gameLevels.length - 1;
    }

    createResultTitle() {
        const isLastLevelCompleted = this.isLastLevel() && this.result;
        
        let txt;
        if (this.result) {
            txt = isLastLevelCompleted ? '恭喜通关' : '恭喜过关';
            this.sound.play(isLastLevelCompleted ? 'win' : 'clap');
        } else {
            txt = '时间到';
            this.sound.play('lose');
        }

        this.resultTitle = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height * 0.25,
            txt,
            {
                fontSize: 180,
                fontFamily: GameConfig.UI.FONTS.TITLE,
                fontStyle: 'bold',
                color: 'yellow',
                stroke: '#000000',
                strokeThickness: 4,
            }
        ).setOrigin(0.5).setDepth(400);
    }
    
    // 新增方法：创建庆祝动画效果
    createCelebrationEffects() {
        // 创建彩带粒子效果
        const confettiColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        
        // 左侧彩带
        const leftConfetti = this.add.particles(0, 0, 'star', {
            x: this.game.canvas.width * 0.2,
            y: this.game.canvas.height * 0.1,
            angle: { min: 0, max: 60 },
            speed: { min: 200, max: 300 },
            gravityY: 300,
            lifespan: 3000,
            quantity: 1,
            scale: { start: 0.05, end: 0.01 },
            tint: confettiColors,
            emitting: false
        }).setDepth(390);
        
        // 右侧彩带
        const rightConfetti = this.add.particles(0, 0, 'star', {
            x: this.game.canvas.width * 0.8,
            y: this.game.canvas.height * 0.1,
            angle: { min: 120, max: 180 },
            speed: { min: 200, max: 300 },
            gravityY: 300,
            lifespan: 3000,
            quantity: 1,
            scale: { start: 0.05, end: 0.01 },
            tint: confettiColors,
            emitting: false
        }).setDepth(390);
        
        // 添加喇叭图标
        const leftTrumpet = this.add.image(
            100,
            200,
            'trumpet'
        ).setScale(0).setDepth(999).setRotation(0);
        
        const rightTrumpet = this.add.image(
            this.game.canvas.width - 100,
            200,
            'trumpet'
        ).setScale(0).setDepth(999).setFlipX(true);
        
        // 动画效果
        this.tweens.add({
            targets: [leftTrumpet, rightTrumpet],
            scale: 8.0,
            duration: 1000,
            ease: 'Back.out',
            yoyo: true,
            onComplete: () => {
                // 播放彩带效果
                leftConfetti.start();
                rightConfetti.start();
                
                // 3秒后停止彩带效果
                this.time.delayedCall(3000, () => {
                    leftConfetti.stop();
                    rightConfetti.stop();
                    leftTrumpet.destroy();
                    rightTrumpet.destroy();
                });
            }
        });
        
        // 添加旋转动画
        //this.tweens.add({
        //    targets: [leftTrumpet, rightTrumpet],
        //    angle: 360,
        //    duration: 2000,
        //    repeat: 2
        //});
    }

    createTimeText() {
        this.resultTime = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height * 0.35,
            `用时: ${this.timeUsed}秒`,
            {
                fontSize: 64,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(400);
    }

    createStars() {
        this.resultStars = [];
        const starSpacing = 260;
        const startX = this.game.canvas.width/2 - starSpacing;
        
        for (let i = 0; i < 3; i++) {
            const star = this.add.image(
                startX + (i * starSpacing),
                this.game.canvas.height * 0.45,
                'star'
            )
            .setDepth(400)
            .setScale(0);

            if (i < this.starCount) {
                this.tweens.add({
                    targets: star,
                    scale: { from: 0, to: 0.2 },
                    duration: 500,
                    delay: i * 200,
                    ease: 'Back.out'
                });
            } else {
                star.setTint(0x666666);
                star.setScale(0.2);
            }
            this.resultStars.push(star);
        }
    }

    /**创建相关按钮 */
    createResultButtons() {
        const currentLevelIndex = this.gameLevels.findIndex(level => level.levelId === this.levelData.levelId);
        const hasNextLevel = currentLevelIndex < this.gameLevels.length - 1;
        
        // 计算按钮位置
        const startY = this.game.canvas.height * 0.65;
        const spacing = 0.08;

        // 如果有下一关且当前关卡已通关，显示下一关按钮
        if (hasNextLevel) {
            const nextLevel = this.gameLevels[currentLevelIndex + 1];
            ButtonHelper.createAnimated(
                this,
                this.game.canvas.width/2,
                startY,
                '下一关',
                {bgColor: GameConfig.UI.COLORS.WARN},
                () => {SceneHelper.goScene(this, 'GameScene', { levelId: nextLevel.levelId});}
            );
        }

        // 重新开始按钮
        ButtonHelper.create(
            this,
            this.game.canvas.width/2,
            startY + this.game.canvas.height * spacing * 1,
            '再来一次',
            {},
            () => {SceneHelper.goScene(this, 'GameScene', { levelId: this.levelId });}
        );

        // 查看详情按钮
        ButtonHelper.create(
            this,
            this.game.canvas.width/2,
            startY + this.game.canvas.height * spacing * 2,
            '隐患详情',
            {},
            () => {SceneHelper.goScene(this, 'GameDetailScene', {levelData : this.levelData});}
        );
    }



    // 返回按钮
    createBackButton() {
        ButtonHelper.createCircle(this, 60, 60, 'arrow-left', {},
            () => {
                this.scene.stop('GameScene');  // 停止游戏场景
                SceneHelper.goScene(this, 'LevelSelectScene');
            }
        );
    }

    // 创建称号徽章
    createTitleBadge() {
        const userTitle = DataManager.calculateTitle();
        const titleText = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height * 0.12,
            userTitle,
            {
                fontSize: 72,
                fontFamily: GameConfig.UI.FONTS.TITLE,
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setDepth(400)
        .setAlpha(0);

        this.tweens.add({
            targets: titleText,
            alpha: 1,
            duration: 1000,
            delay: 1200
        });
    }
}
