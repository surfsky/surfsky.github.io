import { GameConfig } from "../GameConfig.js";

export class Sharer {
    /**截图游戏 
     * @param {Phaser.Scene} scene 要截图的场景
    */
    static snap(scene) {
        scene.renderer.snapshot((image) => {
            Sharer.downImage(image);
        });
    }


    /**下载图片
     * @param {any} image HTMLImageElement
     */
    static downImage(image) {
        if (image instanceof HTMLImageElement) {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = `screenshot-${new Date().toISOString()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**截图分享 
     * @param {Phaser.Scene} scene
     * @param {string} text
    */
    static shareSnap(scene, text) {
        scene.renderer.snapshot((image) => {
            this.downImage(image);
            this.share(text, null);
        });
    }

    /**截图分享 
     * @param {Phaser.Scene} scene
     * @param {string} text
    */
    static shareSnap2(scene, text) {
        scene.renderer.snapshot((image) => {
            if (image instanceof HTMLImageElement) {
                // 创建canvas并绘制图片
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);

                // 将canvas内容转换为Blob并分享
                canvas.toBlob((blob) => {this.share(text, blob);}, 'image/png');
            }
        });
    }

    /**分享游戏 
     * @param {string} txt 分享文本
     * @param {Blob} blob 分享图片
    */
    static share(txt, blob=null) {
        // 该方法不能设置断点，会报错：NotAllowedError: Failed to execute'share' on 'Navigator': Must be handling a user gesture to perform a share request.
        if (blob) {
            // PC测试失败：NotAllowedError: Permission denied
            navigator.share({
                title: GameConfig.UI.TEXTS.TITLE,
                text: GameConfig.UI.TEXTS.SHARE_TEXT || txt,
                url: window.location.href,
                files: [new File([blob], `${new Date().toISOString()}.png`)]
            }).catch((reason) => {
                console.log('Share fail: ', reason);  
            });
        }
        else {
            // PC 和手机测试成功
            navigator.share({
                title: GameConfig.UI.TEXTS.TITLE,
                text: GameConfig.UI.TEXTS.SHARE_TEXT || txt,
                url: window.location.href
            }).catch((reason) => {
                console.log('Share fail: ', reason);
            });
        }
    }    
}