import { GameConfig } from '../GameConfig.js';

export class SceneHelper {
    static DURATION = 500;  // 过渡动画持续时间

    /**
     * Close current scene and go to new scene.
     * @param {Phaser.Scene} currentScene 
     * @param {string} targetSceneKey 
     * @param {object} data 
     */
    static goScene(currentScene, targetSceneKey, data, animation=true){
        if (!animation){
            currentScene.scene.stop();
            currentScene.scene.start(targetSceneKey, data);
        }
        else{
            currentScene.cameras.main.fadeOut(this.DURATION);
            currentScene.time.delayedCall(this.DURATION, () => {
                currentScene.scene.stop();
                currentScene.scene.start(targetSceneKey, data);
            });
       }
    }

    /**
     * Pause current scene, and load new scene. Use backScene to resume old scene.
     * 叠加显示场景，暂停当前场景，加载新场景。使用closeScene()方法恢复旧场景。
     * @param {Phaser.Scene} currentScene 
     * @param {string} newSceneKey 
     * @param {object} data 
     */
    static showScene(currentScene, newSceneKey, data, animation=true){
        if (!animation){
            currentScene.scene.pause();
            currentScene.scene.launch(newSceneKey, data);
        }
        else{
            currentScene.cameras.main.fadeOut(this.DURATION);
            currentScene.time.delayedCall(this.DURATION, () => {
                currentScene.scene.pause();
                currentScene.scene.launch(newSceneKey, data);
            });
        }
    }
    
    /**
     * Close current scene and resume old scene.
     * @param {Phaser.Scene} currentScene 
     * @param {string} oldSceneKey 
     * @param {boolean} animation
     */
    static closeScene(currentScene, oldSceneKey, animation=true){
        if (!animation){
            currentScene.scene.stop();
            currentScene.scene.resume(oldSceneKey);
        }
        else{
            currentScene.cameras.main.fadeOut(this.DURATION);
            currentScene.time.delayedCall(this.DURATION, () => {
                currentScene.scene.stop();
                currentScene.scene.resume(oldSceneKey);
            });
        }
    }
}
