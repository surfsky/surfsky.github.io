import { GameConfig } from '../GameConfig.js';


export class UIHelper{

    /** Set gameobject animation - breath
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.GameObject} gameObject 
     * @param {number} [size=1.5] 
     */
    static setAnimation(scene, gameObject, size=1.5){
        // 添加呼吸动画
        scene.tweens.add({
            targets: gameObject,
            scale: { from: 1, to: size },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 创建加载进度UI
     * @param {Phaser.Scene} scene - 场景实例
     */
    static showLoading(scene) {
        // 半透明背景
        const bg = scene.add.rectangle(
            0, 0,
            scene.cameras.main.width, scene.cameras.main.height,
            0x000000, 0.8
        ).setOrigin(0);

        // 进度条参数
        const barWidth = scene.cameras.main.width * 0.6;
        const barHeight = 20;
        const barRadius = barHeight / 2;  // 圆角半径等于高度的一半
        const barX = scene.cameras.main.width/2 - barWidth/2;
        const barY = scene.cameras.main.height/2 - barHeight/2;

        // 进度条背景
        const barBg = scene.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(
            barX,
            barY,
            barWidth,
            barHeight,
            barRadius
        );

        // 进度条
        const progressBar = scene.add.graphics();

        // 进度文本
        const progressText = scene.add.text(
            scene.cameras.main.width/2,
            scene.cameras.main.height/2 + 50,
            '加载中... 0%',
            {
                fontSize: '48px',
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT
            }
        ).setOrigin(0.5);

        // 监听加载进度
        scene.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            const progress = Math.min(Math.max(value, 0), 1);
            if (progress > 0) {
                progressBar.fillRoundedRect(
                    barX,
                    barY,
                    barWidth * progress,
                    barHeight,
                    barRadius
                );
            }
            progressText.setText(`加载中... ${Math.floor(progress * 100)}%`);
        });

        // 监听加载完成
        scene.load.on('complete', () => {
            scene.tweens.add({
                targets: [bg, barBg, progressBar, progressText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    bg.destroy();
                    barBg.destroy();
                    progressBar.destroy();
                    progressText.destroy();
                }
            });
        });
    }

    /**缩放全屏显示
     * @param {*} scene 场景
     * @param {*} gameObject 游戏对象
     */
    static scaleFit(scene, gameObject) {
        const scaleX = scene.game.canvas.width / gameObject.width;
        const scaleY = scene.game.canvas.height / gameObject.height;
        //const scale = Math.max(scaleX, scaleY);
        //gameObject.setScale(scale);
        gameObject.setScale(scaleX, scaleY);
    }


    /**创建半透明遮罩
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} depth - 深度
     * @param {number} alpha - 透明度
     */
    static createMask(scene, depth, alpha=0.7){
        const mask = scene.add.rectangle(
            0, 0,
            scene.cameras.main.width, scene.cameras.main.height,
            0x000000, alpha
        ).setOrigin(0, 0).setDepth(depth);
    }

    /**
     * 创建一个圆角矩形
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} w - 宽度
     * @param {number} h - 高度
     * @param {number} radius - 圆角半径
     * @param {number} bgColor - 背景颜色
     * @param {number} bgAlpha - 背景透明度
     * @param {number} borderColor - 边框颜色
     * @param {number} borderWidth - 边框宽度
     * @param {number} borderAlpha - 边框透明度
     * @return {Phaser.GameObjects.Graphics}
     */
    static createRoundRect(scene, x, y, w, h, radius, bgColor, bgAlpha=1, borderColor=-1, borderWidth=1, borderAlpha=1){
        const graphics = scene.add.graphics();
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, radius);
        }
        return graphics;
    }
    

    /**Create scroll container
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} w - 宽度
     * @param {number} h - 高度
     * @param {number} contentH - 内容区域高度
     * @return {Phaser.GameObjects.Container}
     **/
    static createScrollPanel(scene, x, y, w, h, contentH){
        // 创建容器
        const container = scene.add.container(x, y);
        container.setSize(w, h);

        // 设置同位置同尺寸遮罩
        //const mask = scene.add.rectangle(x, y, w, h, 0xffffff).setOrigin(0, 0).setVisible(false);
        const mask = UIHelper.createRoundRect(scene, x, y, w, h, 0, 0xffffff, 1).setVisible(false);
        container.setMask(new Phaser.Display.Masks.GeometryMask(scene, mask));

        // 右侧显示位置滑块
        const scrollBar = UIHelper.createRoundRect(scene, x + w - 10, y, 10, h/contentH*h, 5, 0xffffff, 0.3).setDepth(99);
        scrollBar.setMask(new Phaser.Display.Masks.GeometryMask(scene, mask));

        // 添加拖动逻辑（上下拖动容器时，移出遮罩的部分不显示）
        let isDragging = false;
        let lastY = 0;
        scene.input.on('pointerdown', (pointer) => {
            isDragging = true;
            lastY = pointer.y;
        });
        scene.input.on('pointerup', () => {
            isDragging = false;
        });
        scene.input.on('pointermove', (pointer) => {
            if (!isDragging) return;
            var dy = pointer.y - lastY;
            lastY = pointer.y;

            // 计算新的Y实际位置
            let newY = container.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            dy = newY - y;  // 计算实际移动距离

            // 更新容器和滑块位置
            container.y = newY;
            scrollBar.y = y - dy;
        });

        return container;
    }
}