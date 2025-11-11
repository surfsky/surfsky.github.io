import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { UIHelper } from '../utils/UIHelper.js';

/**消息对话框场景 */
export class MessageBoxScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MessageBoxScene' });
        this.isSpeaking = false;
    }

    /**
     * Show module messagebox
     * @param {Phaser.Scene} scene 
     * @param {string} title 
     * @param {string} content 
     * @param {function} closeFx 
     */
    static show(scene, title, content, closeFx){
        SceneHelper.showScene(scene, 'MessageBoxScene', {
            title: title,
            content: content,
            fromSceneKey: scene.scene.key,
            width: scene.cameras.main.width * 0.95,  // 可选，设置宽度
            height: scene.cameras.main.height * 0.60,  // 可选，设置高度
            onClose: closeFx
        }, false);
    }


    preload() {
        this.load.image('speaker', 'assets/images/speaker.svg');
    }

    init(data) {
        this.title = data.title;
        this.content = data.content;
        this.fromSceneKey = data.fromSceneKey;
        // 允许调用者设置尺寸，同时提供默认值
        this.boxWidth = data.width || this.game.canvas.width * 0.95;  // 加大默认宽度
        this.boxHeight = data.height || this.game.canvas.height * 0.85;  // 加大默认高度
    }

    /** speak text by tts */
    speakText() {
        if (window.speechSynthesis === undefined || SpeechSynthesisUtterance === undefined)
            return;

        if (!this.isSpeaking) {
            this.isSpeaking = true;
            this.speakerButton.setTint(0x00ff00);

            const utterance = new SpeechSynthesisUtterance(this.content);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            utterance.onend = () => {
                this.isSpeaking = false;
                this.speakerButton.clearTint();
            };
            window.speechSynthesis.speak(utterance);
            console.log('speak ok');
        } else {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.speakerButton.clearTint();
            console.log('speak stop');
        }
    }

    //---------------------------------------------------
    create() {
        // 半透明背景
        this.add.rectangle(
            0, 0,
            this.game.canvas.width, this.game.canvas.height,
            0x000000, 0.7
        ).setOrigin(0);

        // 消息框背景和边框（居中数据）
        const boxX = this.game.canvas.width/2 - this.boxWidth/2;
        const boxY = this.game.canvas.height/2 - this.boxHeight/2;

        // 主背景（深色背景 + 白色边框）
        this.add.graphics()
            .fillStyle(0x222222, 1)
            .fillRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 20)
            .lineStyle(2, 0xFFFFFF, 1)  // 改为白色细边框
            .strokeRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 20);

        // 标题
        this.add.text(
            this.game.canvas.width/2,
            boxY + 60,
            this.title,
            {
                fontSize: '54px',
                color: '#ffff00',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 内容区域
        const contentPadding = 40;
        const contentWidth = this.boxWidth - contentPadding * 2;
        const contentHeight = Math.max(300, this.boxHeight - 240 - contentPadding * 2);  // 设置最小高度


        // 创建可滚动文本
        const area = UIHelper.createScrollPanel(this, boxX, boxY+130, contentWidth, contentHeight, contentHeight*2);
        var text = this.add.text(
            boxX + contentPadding,  // 居中
            20, //boxY - 100, 相对于panel的y值
            this.content,
            {
                fontSize: '48px',
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                lineSpacing: 15,
                align: 'left',
                wordWrap: {
                    width: contentWidth-84,
                    useAdvancedWrap: true
                },
                padding: {
                    x: 10,
                    y: 10
                }
            }
        ).setOrigin(0, 0);
        area.add(text);


        // 确认按钮
        ButtonHelper.create(
            this,
            this.game.canvas.width/2,
            boxY + this.boxHeight - 80,
            '确定',
            {
                width: 300,
                height: 100,
                depth: GameConfig.UI.DEPTHS.TOP,
            },
            () => {
                SceneHelper.closeScene(this, this.fromSceneKey, false);
                //if (window.speechSynthesis)
                //    window.speechSynthesis.cancel();
            }
        );



        // 语音播报按钮
        this.speakerButton = this.add.image(boxX + 60, boxY + 60, 'speaker')
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.speakText())
            .setScale(1.2)
            .setVisible(window.speechSynthesis != undefined ? true : false)
            ;

    }

}
