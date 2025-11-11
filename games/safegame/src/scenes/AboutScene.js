import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { UIHelper } from '../utils/UIHelper.js';

export class AboutScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AboutScene' });
    }
    
    preload() {
        this.load.image('arrow-left', 'assets/images/arrow-left.svg');
        this.load.image('code', 'assets/images/code.png');
    }

    create() {
        // 半透明背景
        this.add.rectangle(
            0, 0,
            this.game.canvas.width, this.game.canvas.height, // window.innerWidth, window.innerHeight,
            0x000000, 0.9
        ).setOrigin(0, 0);

        // 标题
        this.add.text(
            this.game.canvas.width/2,
            10,
            '关于',
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
        ).setOrigin(0.5, 0);

        // 内容
        this.scrollContainer = UIHelper
            .createScrollPanel(
                this, 
                0, 
                150, 
                this.game.canvas.width, 
                this.game.canvas.height, 
                this.game.canvas.height*2
            )
            .setDepth(GameConfig.UI.DEPTHS.OVERLAY)
            ;
        var code = this.add.image((this.game.canvas.width-400)/2, 10, 'code')
            .setOrigin(0, 0)
            .setSize(400, 400)
            .setDepth(GameConfig.UI.DEPTHS.TOP)
            ;
        var txt = this.add.text(
            this.game.canvas.width/2,
            430,
            [
                GameConfig.UI.TEXTS.TITLE,
                '版本：1.0.0',
                '',
                '作者：程建和',
                '联系：微信 surfsky',
                '版权所有 © 2025',
                '',
                '反馈建议请发邮件：',
                'surfsky@189.cn',
                '',
                '鸣谢',
                '（排名不分前后）',
                '',
                '策划', 
                '李选文', 
                '',
                '测试',
                '程曦、彭婷婷、林文貌、黄开作、肖瑶瑶、林甲兴、王飞、林乾数、徐瑞泽、欧倩倩',
                '',
                '编程', 
                'CursorAI, DeepSeek V3, Phaser GameEngine, CJH', 
                '',
                '美工', 
                'DouBao AI',
                '',
                '音乐', 
                'mixkit.co, 剪映',
                '',
            ].join('\n'),
            {
                fontSize: 48,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                align: 'center',
                lineSpacing: 20,
                wordWrap: {
                    width: this.game.canvas.width - 40,
                    useAdvancedWrap: true
                },
                padding: {
                    x: 20,
                    y: 20
                }
            }
        ).setOrigin(0.5, 0);
        this.scrollContainer.add([code, txt]);

        // 返回按钮
        ButtonHelper.createCircle(
            this,
            60,
            60,
            'arrow-left',
            {},
            () => {
                SceneHelper.goScene(this, 'WelcomeScene');
            }
        );
    }
}
