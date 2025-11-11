export class TestImage extends Phaser.Scene {
    constructor() {
        super('TestImage');
        this.image = null;
        this.isZoomed = false;
        this.zoomScale = 2;
    }

    preload() {
        this.load.image('test_image', 'assets/images/office.jpg');
    }

    create() {
        // 添加图片并设置交互
        this.image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'test_image');
        this.image.setOrigin(0.5);

        // 调整图片大小以适应屏幕
        const scaleX = this.cameras.main.width / this.image.width;
        const scaleY = this.cameras.main.height / this.image.height;
        const scale = Math.min(scaleX, scaleY);
        this.image.setScale(scale);

        // 添加点击事件
        this.image.setInteractive();
        this.image.on('pointerdown', this.handleImageClick, this);
    }

    handleImageClick(pointer) {
        if (this.isZoomed) {
            // 如果已经放大，则恢复原始大小
            this.resetZoom();
        } else {
            // 获取点击位置相对于图片的坐标
            const localX = (pointer.x - this.image.x) / this.image.scale + this.image.width / 2;
            const localY = (pointer.y - this.image.y) / this.image.scale + this.image.height / 2;

            // 放大图片
            this.zoomAt(localX, localY);
        }
    }

    zoomAt(x, y) {
        // 计算放大后的位置偏移
        const offsetX = (x - this.image.width / 2) * (this.zoomScale - 1);
        const offsetY = (y - this.image.height / 2) * (this.zoomScale - 1);

        // 应用放大效果
        this.image.setScale(this.image.scale * this.zoomScale);
        this.image.setPosition(
            this.image.x - offsetX,
            this.image.y - offsetY
        );

        this.isZoomed = true;
    }

    resetZoom() {
        // 恢复原始大小和位置
        const scaleX = this.cameras.main.width / this.image.width;
        const scaleY = this.cameras.main.height / this.image.height;
        const scale = Math.min(scaleX, scaleY);

        this.image.setScale(scale);
        this.image.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        this.isZoomed = false;
    }
}