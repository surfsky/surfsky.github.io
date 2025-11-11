export const GameConfig = {
    // 基础配置
    HEADER_HEIGHT: 120,  // 顶部状态栏高度

    // 资源路径配置
    ASSETS: {
        IMAGES: {
            BG: 'assets/images/bg.png',
            STAR: 'assets/images/star.png'
        },
        SOUNDS: {
            FIND: 'assets/sounds/find.mp3',
            CLAP: 'assets/sounds/clap.mp3',
            WIN: 'assets/sounds/win.mp3',
            BGM: 'assets/sounds/bgm.mp3',
            LOSE: 'assets/sounds/lose-mario.mp3',
            WRONG: 'assets/sounds/wrong.mp3'
        },
        LEVELS_PATH: 'assets/levels'  // 关卡资源基础路径
    },


    // UI配置
    UI: {
        COLORS: {
            PRIMARY: 0x4a90e2,
            PRIMARY_HOVER: 0x5ba1f3,
            SUCCESS: 0x00ff00,
            ERROR: 0xff0000,
            WARN: 0xff9900,
        },
        FONTS: {
            DEFAULT: '"仿宋", "SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
            TITLE: 'AlimamaDaoLiTi'
        },
        DEPTHS: {
            BACKGROUND: 0,
            GAME: 100,
            UI: 200,
            OVERLAY: 300,
            POPUP: 400,
            TOP: 900
        },
        TEXTS:{
            COPYRIGHT: '龙港市安委办 @2025',
            TITLE: '安全小侦探',
            SUBTITLE: '找出所有安全隐患',
            SHARE_TEXT: '我在玩安全小侦探游戏，快来一起找出安全隐患吧！'
        }
    }
};
