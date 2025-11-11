import { GameConfig } from '../GameConfig.js';
import { ButtonHelper } from './ButtonHelper.js';

/**
 * 游戏引导类
 * 用于显示游戏引导界面，包含遮罩、高亮区域和提示文本
 */
export class GameGuide {
     depth = 999; ///GameConfig.UI.DEPTHS.OVERLAY;

    /**
     * @param {Phaser.Scene} scene - 当前场景
     * @param {number} depth - 层级
     */
    constructor(scene, depth) {
        this.scene = scene;
        this.depth = depth;
        this.currentStep = 0;
        this.steps = [];
        this.isActive = false;
        this.onEndCallback = null;

        // 创建遮罩层
        this.gray = scene.add.graphics()
            .setDepth(this.depth)
            //.setW(this.scene.game.canvas.width)
            .setVisible(false);

        // 创建高亮区域（初始不可见）
        this.highlight = scene.add.graphics()
            .setDepth(this.depth)
            .setVisible(false);

        // 创建提示文本容器（初始不可见）
        this.tipContainer = scene.add.container(0, 0)
            .setDepth(this.depth + 1)
            .setVisible(false);

        // 创建导航按钮
        this.createNaviButtons();
    }

    /**
     * 设置引导步骤
     * @param {Array<{target: Phaser.GameObjects.GameObject, text: string}>} steps - 引导步骤数组
     */
    setSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
    }

    /**
     * 开始引导
     * @param {Function} onEnd - 引导结束时的回调函数
     */
    start(onEnd) {
        if (this.steps.length === 0) return;
        this.isActive = true;
        this.onEndCallback = onEnd;
        this.showStep(0);
    }

    /**
     * 显示指定步骤
     * @param {number} index - 步骤索引
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        this.currentStep = index;

        // 显示遮罩和高亮
        this.gray.setVisible(true);
        this.highlight.setVisible(true);
        this.tipContainer.setVisible(true);

        const step = this.steps[index];
        const target = step.target;

        // 清除之前的遮罩和高亮
        this.gray.clear();
        this.gray.fillStyle(0x000000, 0.9);
        this.gray.fillRect(0, 0, this.scene.game.canvas.width, this.scene.game.canvas.height);
        this.highlight.clear();

        // 创建遮罩和高亮区域
        if (target) {
            const bounds = target.getBounds();
            const padding = 10;
            
            // 绘制遮罩（整个屏幕减去目标区域）
            const maskGraphics = this.scene.make.graphics();
            maskGraphics.fillStyle(0x000000, 0);
            maskGraphics.fillRect(
                bounds.x - padding,
                bounds.y - padding,
                bounds.width + padding * 2,
                bounds.height + padding * 2
            );
            const mask = maskGraphics.createGeometryMask();
            mask.setInvertAlpha();  // 反向
            this.gray.setMask(mask);

            // 绘制高亮边框
            this.highlight.lineStyle(2, 0xff0000, 1);
            this.highlight.strokeRect(
                bounds.x - padding,
                bounds.y - padding,
                bounds.width + padding * 2,
                bounds.height + padding * 2
            );

            // 在高亮区域下方显示提示文本
            this.updateTipText(step.text, bounds);
        }

        // 更新按钮状态
        this.updateNaviButtons();

        // 给gray增加点击事件，跳到下一步
        this.gray.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.scene.game.canvas.width, this.scene.game.canvas.height),
            Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', (pointer, localX, localY, event) => {
            this.nextStep();
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
        });
    }

    /**
     * 更新提示文本
     * @param {string} text - 提示文本
     * @param {Phaser.Geom.Rectangle} targetBounds - 目标对象边界
     */
    updateTipText(text, targetBounds) {
        // 清除之前的提示
        this.tipContainer.removeAll(true);

        // 创建提示文本背景
        const padding = 20;
        const maxWidth = 600;
        const lblTip = this.scene.add.text(
            0, 0,
            text,
            {
                fontSize: 48,
                color: '#ffffff',
                fontFamily: GameConfig.UI.FONTS.DEFAULT,
                wordWrap: { width: maxWidth - padding * 2, useAdvancedWrap: true }
            }
        );

        const bgWidth = Math.min(lblTip.width + padding * 2, maxWidth);
        const bgHeight = lblTip.height + padding * 2;
        //const bg = this.scene.add.rectangle(
        //    0, 0,
        //    bgWidth,
        //    bgHeight,
        //    0x000000, 0.8
        //).setOrigin(0, 0);

        // 计算提示文本的最佳位置
        let tipX = targetBounds.centerX - bgWidth / 2;
        let tipY = targetBounds.bottom + 20;

        // 确保提示框不会超出屏幕边界
        if (tipX < 10) tipX = 10;
        if (tipX + bgWidth > this.scene.game.canvas.width - 10) {
            tipX = this.scene.game.canvas.width - bgWidth - 10;
        }

        // 如果提示框会超出底部边界，则显示在目标上方
        if (tipY + bgHeight > this.scene.game.canvas.height - 150) {
            tipY = targetBounds.top - bgHeight - 20;
        }

        this.tipContainer.setPosition(tipX, tipY);

        // 将背景和文本添加到容器
        lblTip.setPosition(padding, padding);
        this.tipContainer.add([lblTip]);
    }

    /**
     * 创建导航按钮
     */
    createNaviButtons() {
        // 创建按钮容器
        this.buttonContainer = this.scene.add.container(0, 0)
            .setDepth(this.depth + 1)
            .setVisible(false);

        // 创建"下一步"按钮
        this.nextButton = ButtonHelper.create(
            this.scene,
            this.scene.game.canvas.width - 200,
            this.scene.game.canvas.height - 100,
            '下一步',
            { width: 300 },
            () => this.nextStep()
        );

        // 创建"跳过"按钮
        this.skipButton = ButtonHelper.create(
            this.scene,
            200,
            this.scene.game.canvas.height - 100,
            '跳过',
            { width: 300, bgColor: GameConfig.UI.COLORS.WARN },
            () => this.end()
        );

        // 将按钮添加到容器
        this.buttonContainer.add([this.nextButton, this.skipButton]);
    }

    /**
     * 更新导航按钮状态
     */
    updateNaviButtons() {
        this.buttonContainer.setVisible(true);
        if (this.currentStep === this.steps.length - 1) {
            const buttonText = this.nextButton.list.find(item => item instanceof Phaser.GameObjects.Text);
            if (buttonText) buttonText.setText('完成');
        }
    }

    /**
     * 下一步
     */
    nextStep() {
        if (this.currentStep === this.steps.length - 1) {
            this.end();
        } else {
            this.showStep(this.currentStep + 1);
        }
    }

    /**
     * 结束引导
     */
    end() {
        this.isActive = false;
        this.gray.setVisible(false);
        this.highlight.setVisible(false);
        this.tipContainer.setVisible(false);
        this.buttonContainer.setVisible(false);

        // 调用结束回调
        if (this.onEndCallback) {
            this.onEndCallback();
        }
    }
}