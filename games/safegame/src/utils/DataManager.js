import { GameConfig } from '../GameConfig.js';

export class DataManager {
    static STORAGE_KEY = "safeGame";

    static getStars(levelId) {
        const data = this.getData();
        return data.stars[levelId] || 0;
    }

    static setStars(levelId, stars) {
        const data = this.getData();
        data.stars[levelId] = Math.max(stars, data.stars[levelId] || 0);
        this.saveData(data);

        // 如果获得了星星，解锁下一关
        if (stars > 0) {
            this.unlockNextLevel(levelId);
        }
    }

    static isLevelUnlocked(levelId) {
        const data = this.getData();
        return data.unlockedLevels ? data.unlockedLevels.includes(levelId) : levelId === 'level1';
    }

    static unlockNextLevel(currentLevelId) {
        const data = this.getData();
        if (!data.unlockedLevels) {
            data.unlockedLevels = ['level1'];
        }

        // 从当前关卡ID中提取数字
        const currentNumber = parseInt(currentLevelId.replace('level', ''));
        const nextLevelId = `level${currentNumber + 1}`;

        // 检查下一关是否存在于GameConfig中
        const nextLevelExists = GameConfig.levels.some(level => level.levelId === nextLevelId && level.type === 'game');

        // 如果下一关存在且还没解锁，则解锁它
        if (nextLevelExists && !data.unlockedLevels.includes(nextLevelId)) {
            data.unlockedLevels.push(nextLevelId);
            this.saveData(data);
        }
    }

    static getData() {
        const defaultData = {
            stars: {},
            unlockedLevels: ['level1']
        };
        // 确保第一关始终解锁
        if (!defaultData.unlockedLevels.includes('level1')) {
            defaultData.unlockedLevels.push('level1');
        }
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : defaultData;
        } catch (e) {
            return defaultData;
        }
    }

    static saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save game data:', e);
        }
    }

    /**计算称号 */
    static calculateTitle() {
        const levels = GameConfig.levels.filter(t => t.type=='game');
        const data = this.getData();
        const stars = levels.map(level => data.stars[level.levelId] || 0);

        // 获取总星星数目
        const totalStars = levels.length * 3;
        const gainStars = stars.reduce((a, b) => a + b, 0);

        // 根据星星数目计算称号
        if (gainStars >= totalStars)       return '安全专家';
        if (gainStars >= totalStars * 0.8) return '安全侦探';
        if (gainStars >= totalStars * 0.6) return '助理侦探';
        return '实习侦探';

        //if (stars.every(s => s === 3))  return '安全专家';
        //if (stars.every(s => s >= 2))   return '安全侦探';
        //if (stars.every(s => s >= 1))   return '助理侦探';
        //return '实习侦探';
    }

    static clearData() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static hasProgress() {
        const data = this.getData();
        return Object.keys(data.stars).length > 0;
    }
}