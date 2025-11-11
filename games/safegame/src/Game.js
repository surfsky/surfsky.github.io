import { WelcomeScene }     from './scenes/WelcomeScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameScene }        from './scenes/GameScene.js';
import { GameResultScene }  from './scenes/GameResultScene.js';
import { GameDetailScene }  from './scenes/GameDetailScene.js';
import { AboutScene }       from './scenes/AboutScene.js';
import { MessageBoxScene }  from './scenes/MessageBoxScene.js';



try {
    /**计算游戏宽度 */
    function calcWidth(height) {
        var width = window.innerWidth;
        const ratio = width / height;
        const targetRatio = 9.0 / 16.0;
        // 横屏设备：以高度为基准，计算宽度并水平居中
        if (ratio > 1) {
            width = height * targetRatio;
        }
        return width;
    }

    /**设置游戏大小 */
    function resize() {
        var height = window.innerHeight;
        var width = calcWidth(height);
        game.scale.resize(width, height);
        game.canvas.style.width = width + 'px';
        game.canvas.style.height = height + 'px';
    }

    // 创建游戏对象
    var height = window.innerHeight;
    var width = calcWidth(height);
    var game = new Phaser.Game({
        type: Phaser.AUTO,
        width: width,
        height: height,
        scene: [
            WelcomeScene,
            LevelSelectScene,
            GameScene,
            GameResultScene,
            GameDetailScene,
            AboutScene,
            MessageBoxScene
        ],
        scale: {
            mode: Phaser.Scale.RESIZE,
            parent: 'game',
            width: '100%',
            height: '100%'
        }
    });
    game.canvas.style.margin = '0 auto';
    game.canvas.style.display = 'block';

    // 检测和监听屏幕变化
    window.addEventListener('orientationchange', resize);
    //window.addEventListener('resize', checkSize);
    document.getElementById('result').style.display = 'none';
} catch (e) {
    document.getElementById('result').innerHTML = '❌ 游戏加载失败，请使用最新版本的Chrome、Firefox或Safari浏览器打开本页面，错误原因: ' + e.message;
    document.getElementById('result').style.display = 'block';
    console.error(e.message);
}

