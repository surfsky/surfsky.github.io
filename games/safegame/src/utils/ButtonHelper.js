import { GameConfig } from '../GameConfig.js';
import { UIHelper } from './UIHelper.js';

/**
 * 按钮辅助类，用于创建统一风格的游戏按钮
 */
export class ButtonHelper {
    /**
     * 创建一个标准按钮
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - 按钮中心x坐标
     * @param {number} y - 按钮中心y坐标
     * @param {string} text - 按钮文本
     * @param {Object} options - 按钮配置选项
     * @param {number} [options.bgColor=GameConfig.UI.COLORS.PRIMARY] - 按钮背景颜色
     * @param {number} [options.width=380] - 按钮宽度
     * @param {number} [options.height=100] - 按钮高度
     * @param {number} [options.radius=50] - 圆角半径
     * @param {number} [options.depth=scene.depth + 1] - 渲染深度
     * @param {number} [options.fontSize=32] - 字体大小
     * @param {number} [options.scale=1.05] - 悬停时的缩放比例
     * @param {number} [options.padding=20] - 文本与按钮边缘的内边距
     * @param {number} [options.alpha=1] - 按钮透明度
     * @param {function} onClick - 点击回调函数
     * @returns {Phaser.GameObjects.Container} 按钮容器对象
     */
    static create(scene, x, y, text, options = {}, onClick) {
        const {
            bgColor = GameConfig.UI.COLORS.PRIMARY,
            width = 380,
            height = 100,
            radius = 50,
            depth = GameConfig.UI.DEPTHS.UI, 
            fontSize = 56,
            scale = 1.05,
            padding = 20,
            alpha = 1,
        } = options;

        const container = scene.add.container(x, y).setDepth(depth);

        // 创建背景
        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, alpha);
        bg.fillRoundedRect(-width/2, -height/2, width, height, radius);

        // 创建文本（添加自动换行）
        const buttonText = scene.add.text(
            0, 0,
            text,
            {
                fontSize: fontSize,
                color: '#ffffff',
                wordWrap: { width: width - padding * 2 },
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);

        // 如果文本高度超出按钮，调整字体大小
        if (buttonText.height > height - padding * 2) {
            const scale = (height - padding * 2) / buttonText.height;
            buttonText.setFontSize(fontSize * scale);
        }

        // 确保文本完全居中
        buttonText.setPosition(0, 0);
        container.add([bg, buttonText]);
        container.setSize(width, height);

        // 添加交互
        container.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', ()=> container.setScale(scale))
            .on('pointerout', () => container.setScale(1))
            .on('pointerup', () => {
                container.setScale(1);
                onClick();
            });

        return container;
    }

    /**
     * 创建一个带动画效果的按钮
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - 按钮x坐标
     * @param {number} y - 按钮y坐标
     * @param {string} text - 按钮文本
     * @param {Object} options - 按钮配置
     * @param {number} [options.bgColor=GameConfig.UI.COLORS.PRIMARY] - 按钮背景颜色
     * @param {number} [options.width=380] - 按钮宽度
     * @param {number} [options.height=100] - 按钮高度
     * @param {number} [options.radius=50] - 圆角半径
     * @param {number} [options.depth=GameConfig.UI.DEPTHS.UI] - 渲染深度
     * @param {number} [options.fontSize=32] - 字体大小
     * @param {number} [options.scale=1.05] - 悬停时的缩放比例
     * @param {number} [options.padding=20] - 文本与按钮边缘的内边距
     * @param {number} [options.alpha=1] - 按钮透明度
     * @param {function} onClick - 点击回调
     * @returns {Phaser.GameObjects.Container} 按钮容器对象
     */
    static createAnimated(scene, x, y, text, options = {}, onClick) {
        const button = this.create(scene, x, y, text, options, onClick);
        UIHelper.setAnimation(scene, button, 1.1);
        return button;
    }

    /**
     * 创建一个圆形按钮
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - 按钮x坐标
     * @param {number} y - 按钮y坐标
     * @param {string} iconKey - 图标文本（如 '<', '>', '+' 等）
     * @param {Object} options - 按钮配置
     * @param {number} [options.bgColor=GameConfig.UI.COLORS.PRIMARY] - 按钮背景颜色
     * @param {number} [options.size=80] - 按钮大小
     * @param {number} [options.depth=GameConfig.UI.DEPTHS.UI] - 渲染深度
     * @param {number} [options.clickScale=1.2] - 点击时的缩放比例
     * @param {number} [options.iconScale=2] - 图标缩放比例
     * @param {function} onClick - 点击回调
     * @returns {Phaser.GameObjects.Container} 按钮容器对象
     */
    static createCircle(scene, x, y, iconKey, options = {}, onClick) {
        const {
            bgColor = GameConfig.UI.COLORS.PRIMARY,
            size = 80,
            depth = GameConfig.UI.DEPTHS.UI,
            clickScale = 1.2,
            iconScale = 2
        } = options;


        // 创建圆形背景
        const bg = scene.add.graphics().setDepth(depth);
        drawBg(bgColor);

        /**Draw bg */
        function drawBg(color){
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillCircle(0, 0, size/2);
        }

        // 创建图标图片
        const iconImage = scene.add.image(0, 0, iconKey)
            .setScale(iconScale)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setDepth(depth + 1)
            ;

        // 
        const container = scene.add.container(x, y).setDepth(depth);
        container.add([bg, iconImage]);
        container.setSize(size, size);


        // 添加交互
        container.setInteractive({ cursor: 'pointer' })
            //.on('pointerover', () => {
            //    //drawBg(GameConfig.UI.COLORS.PRIMARY_HOVER);
            //    container.setScale(clickScale);
            //})
            .on('pointerdown', ()=>{
                //drawBg(GameConfig.UI.COLORS.PRIMARY_CLICK);
                container.setScale(clickScale);
            })
            .on('pointerup', ()=>{
                //drawBg(GameConfig.UI.COLORS.PRIMARY_HOVER);
                container.setScale(1);
                onClick();
            })
            .on('pointerout', () => {
                //drawBg(GameConfig.UI.COLORS.PRIMARY);
                container.setScale(1);
            })
            ;

        return container;
    }
}
