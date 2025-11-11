/**
 * 小侦探游戏 - 欢迎屏
 * 
 * 玩法：在限时内，点击屏幕找到找到所有安全隐患
 * 作者：程建和 2024-12-28
 * 联系：微信 surfsky
 * All rights reserved.
 */


import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { UIHelper } from '../utils/UIHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { DataManager } from '../utils/DataManager.js';

export class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
    }

    preload() {
        UIHelper.showLoading(this);
        this.load.image('star', GameConfig.ASSETS.IMAGES.STAR);
        this.load.image('bg', GameConfig.ASSETS.IMAGES.BG);
        this.load.audio('find', GameConfig.ASSETS.SOUNDS.FIND);
        this.load.audio('win', GameConfig.ASSETS.SOUNDS.WIN);
        this.load.audio('clap', GameConfig.ASSETS.SOUNDS.CLAP);
        this.load.audio('lose', GameConfig.ASSETS.SOUNDS.LOSE);
        this.load.audio('wrong', GameConfig.ASSETS.SOUNDS.WRONG);
        this.load.audio('bgm', GameConfig.ASSETS.SOUNDS.BGM);
        this.load.image('arrow-left', 'assets/images/arrow-left.svg');
        this.load.image('share', 'assets/images/share.svg');
        this.load.json('levels', `${GameConfig.ASSETS.LEVELS_PATH}/levels.json`);
    }

    create() {
        GameConfig.levels = this.cache.json.get('levels');  // 关卡配置信息保存在GAMECONFIG.levels中
        this.createBackground();
        this.createTitle();
        this.createButtons();
        this.createCopyright();
        this.playBgm();
    }

    /**播放背景音乐（如果被锁定，点击屏幕后解锁） */
    playBgm() {
        this.sound.play('bgm', { loop: true });
        if (this.sound.locked) {
            const unlock = () => {
                this.sound.unlock();
                window.removeEventListener('click', unlock);
                window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock);
            window.addEventListener('touchstart', unlock);
        }
    }

    /**创建背景 */
    createBackground() {
        this.bg = this.add.image(
            this.game.canvas.width/2,
            this.game.canvas.height/2,
            'bg'
            )
        .setDepth(GameConfig.UI.DEPTHS.BACKGROUND)
        //.setSize(this.game.canvas.width, this.game.canvas.height)
        ;
        UIHelper.scaleFit(this, this.bg);
    }

    /**创建标题 */
    createTitle() {
        this.title = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height * 0.22,
            "找出所有安全隐患",
            {
                fontSize: 64,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        ).setOrigin(0.5).setDepth(GameConfig.UI.DEPTHS.OVERLAY);
    }

    /**创建按钮 */
    createButtons() {
        // 开始游戏按钮
        const buttonText = DataManager.hasProgress() ? "继 续" : "开 始";
        this.btnStart = ButtonHelper.createAnimated(
            this,
            this.game.canvas.width/2,
            this.game.canvas.height * 0.65,
            buttonText,
            {},
            () => {
                SceneHelper.goScene(this, 'LevelSelectScene');
            }
        );

        // 重新开始按钮
        if (DataManager.hasProgress()) {
            this.btnRestart = ButtonHelper.create(
                this,
                this.game.canvas.width/2,
                this.game.canvas.height * 0.65 + 140,
                "重新开始",
                {bgColor: GameConfig.UI.COLORS.WARN},
                () => {
                    DataManager.clearData();
                    SceneHelper.goScene(this, 'LevelSelectScene');
                }
            );
        }
    }

    /**创建版权文本 */
    createCopyright() {
        this.copyright = this.add.text(
            this.game.canvas.width/2,
            this.game.canvas.height - 60,
            "v1.0\n龙港市安委办\n龙港市应急管理局",
            {
                fontSize: 32,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                stroke: 'yellow',
                strokeThickness: 1,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(GameConfig.UI.DEPTHS.OVERLAY)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => {
            SceneHelper.showScene(this, 'AboutScene');
        });
    }
}
