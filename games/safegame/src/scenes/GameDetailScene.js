import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from '../utils/ButtonHelper.js';
import { UIHelper } from '../utils/UIHelper.js';
import { SceneHelper } from '../utils/SceneHelper.js';
import { MessageBoxScene } from './MessageBoxScene.js';

/**详情答案场景（包含地图和若干个点），供场景答案和示例场景共同使用 */
export class GameDetailScene extends Phaser.Scene {
    levelId;
    spots;
    levelData;
    detailCards;

    constructor() {
        super({ key: 'GameDetailScene' });
    }

    /**init. data: {levelData} */
    init(data) {
        this.levelData = data.levelData;

        //
        this.levelId = this.levelData.levelId;
        this.spots = this.levelData.config.spots;
        this.detailCards = []; // 存储所有详情卡片，用于管理层级
    }

    preload() {
        UIHelper.showLoading(this);
        const basePath = GameConfig.ASSETS.LEVELS_PATH;
        this.load.image(`scene_${this.levelId}`, `${basePath}/${this.levelId}/scene.jpg`);
        this.load.image('arrow-left', 'assets/images/arrow-left.svg');
    }

    create() {
        this.createBackground();
        this.createTitle();
        this.createSpotDetails();
        this.createBackButton();
    }

    //-------------------------------------------------
    // 创建UI
    //-------------------------------------------------
    /**创建返回按钮（由详情页返回游戏页面） */
    createBackButton() {
        ButtonHelper.createCircle(this, 60, 60, 'arrow-left', {}, () => {
            var levelId = this.levelData.levelId;
            if (this.levelData.type == 'demo')
                levelId = GameConfig.levels.filter(item => item.demoId == this.levelData.levelId)[0].levelId;
            SceneHelper.goScene(this, 'GameScene', { levelId: levelId });
        });
    }

    createBackground() {
        // 添加场景图片（原图显示）
        const sceneImage = this.add.image(
            this.game.canvas.width/2,
            this.game.canvas.height/2,
            `scene_${this.levelId}`
        );

        // 缩放图片以适应屏幕
        const scaleX = this.game.canvas.width / sceneImage.width;
        const scaleY = this.game.canvas.height / sceneImage.height;
        const scale = Math.max(scaleX, scaleY);
        sceneImage.setScale(scale);
    }

    createTitle() {
        if (this.levelData.type == 'game'){
            // 隐患详情页面
            this.add.text(
                this.game.canvas.width/2,
                55,
                '隐患详情',
                {
                    fontSize: 56,
                    color: '#ffff00',
                    fontFamily: GameConfig.UI.FONTS.DEFAULT,
                    stroke: '#FFFFFF',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            // 隐患详情页面顶部显示一个“查看正确示例”按钮
            //var demoData = GameConfig.levels.filter(item => item.levelId == this.levelData.demoId)[0];
            //ButtonHelper.createAnimated(
            //    this,
            //    this.game.canvas.width/2,
            //    70,
            //    '查看正确示例',
            //    {width: 450},
            //    () => {SceneHelper.goScene(this, 'GameDetailScene', {levelData : demoData});}
            //);
        }
        else{
            // 正确示例页面
            this.add.text(
                this.game.canvas.width/2,
                55,
                '正确示例',
                {
                    fontSize: 56,
                    color: '#ffff00',
                    fontFamily: GameConfig.UI.FONTS.DEFAULT,
                    stroke: '#FFFFFF',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
        }
    }    

    //-------------------------------------------------
    // 显示场景点详情
    //-------------------------------------------------
    /**创建所有点的详情 */
    createSpotDetails() {
        this.spots.forEach(spot => {
            // 创建标记点
            const x = spot.x * this.game.canvas.width;
            const y = spot.y * this.game.canvas.height;
            
            // 创建连接线
            const lineLength = 50; // 缩短连接线
            const lineEndX = x;
            const lineEndY = y + lineLength;
            
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xFFFFFF, 0.8);
            graphics.beginPath();
            graphics.moveTo(x, y);
            graphics.lineTo(lineEndX, lineEndY);
            graphics.strokePath();

            // 创建圆形标记
            const marker = this.add.circle(x, y, 10, 0xFF0000);
            marker.setInteractive({ cursor: 'pointer' });
            UIHelper.setAnimation(this, marker);

            // 创建详情卡片, 添加到数组中
            const card = this.createDetailCard(
                lineEndX,
                lineEndY + 10, // 位置调整到点的下方
                spot
            );
            this.detailCards.push(card);

            // 将点击卡片放到顶级
            const bringToTop = () => {
                this.detailCards.forEach(c => c.setDepth(1));
                card.setDepth(2);
            };
            marker.on('pointerdown', bringToTop);
            card.setInteractive({ cursor: 'pointer' })
                .on('pointerdown', bringToTop);
        });
    }

    /**创建详情卡标注 
     * @param {number} x
     * @param {number} y
     * @param {object} spot
    */
    createDetailCard(x, y, spot) {
        const padding = 30;
        const minWidth = 200;  // 最小宽度
        const maxWidth = 600;  // 最大宽度
        const height = 80;

        // 先创建文本以测量宽度
        const titleText = this.add.text(
            0, 0,
            spot.name,
            {
                fontSize: 56,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        );
        const textWidth = titleText.width;
        const actualWidth = Math.min(
            Math.max(textWidth + padding * 2, minWidth),
            maxWidth
        );

        // 创建背景：白色外框、黑色背景
        const bg = this.add.graphics();
        bg.lineStyle(2, 0xffffff, 1);
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(
            x - actualWidth/2,
            y - padding,
            actualWidth,
            height,
            20
        );
        bg.strokeRoundedRect(
            x - actualWidth/2,
            y - padding,
            actualWidth,
            height,
            20
        );

        // 设置文本位置
        titleText.setPosition(x, y + height/2 - padding).setOrigin(0.5);

        // 创建容器
        const container = this.add.container(0, 0, [bg, titleText]);
        container.setDepth(1);
        container.setInteractive(
            new Phaser.Geom.Rectangle(
                x - maxWidth/2,
                y - padding,
                maxWidth,
                height
            ),
            Phaser.Geom.Rectangle.Contains
        ).on('pointerdown', () => {
            // 改变背景色为蓝色、白色外框
            //bg.clear();
            //bg.fillStyle(0x87cefa, 0.9);
            //bg.fillRoundedRect(
            //    x - actualWidth/2,
            //    y - padding,
            //    actualWidth,
            //    height,
            //    20
            //);
            //bg.lineStyle(2, 0xffffff, 1);
            //bg.strokeRoundedRect(
            //    x - actualWidth/2,
            //    y - padding,
            //    actualWidth,
            //    height,
            //    20
            //);

            //if (this.levelData.type == 'game'){
            MessageBoxScene.show(this, spot.name, [spot.desc, '', '法律依据：', spot.law].join('\n'), ()=>{
                bg.clear();
                bg.fillStyle(0x000000, 0.9);
                bg.fillRoundedRect(
                    x - maxWidth/2,
                    y - padding,
                    maxWidth,
                    height,
                    20
                );
            })
        //}
        });

        // 添加悬停效果
        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x222222, 0.95);
            bg.fillRoundedRect(
                x - actualWidth/2,
                y - padding,
                actualWidth,
                height,
                20
            );
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeRoundedRect(
                x - actualWidth/2,
                y - padding,
                actualWidth,
                height,
                20
            );
        });
        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x000000, 0.9);
            bg.fillRoundedRect(
                x - actualWidth/2,
                y - padding,
                actualWidth,
                height,
                20
            );
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeRoundedRect(
                x - actualWidth/2,
                y - padding,
                actualWidth,
                height,
                20
            );
        });

        return container;
    }

}
