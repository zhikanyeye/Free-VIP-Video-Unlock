// 配置文件 - 集中管理所有配置项
const CONFIG = {
    // API 接口配置
    apiList: [
        { name: "蜜糖解析", url: "https://mtjiexi.cc:966/?url=" },
        { name: "盖子解析", url: "https://gayzyjiexi.com/play/?url=" },
        { name: "豆瓣解析", url: "https://www.dbjiexi.com:966/jx/?url=" },
        { name: "雨兔解析", url: "https://yutujx.com/?url=" },
        { name: "1907解析", url: "https://z1.im1907.top/?jx=" },
        { name: "全民解析", url: "https://api.quanminjiexi.com/index.php?url=" },
        { name: "爱你解析", url: "https://video.isyour.love/player/getplayer?url=" },
        { name: "夜幕解析", url: "https://www.yemu.xyz/?url=" },
        { name: "973解析", url: "https://jx.973973.xyz/?url=" },
        { name: "小蚂蚁解析", url: "https://jx.xmflv.com/?url=" },
        { name: "唐僧解析", url: "https://jx.xmflv.cc/?url=" },
        { name: "七哥解析", url: "https://jx.nnxv.cn/tv.php?url=" },
        { name: "PlayerJY", url: "https://jx.playerjy.com/?url=" },
        { name: "CK解析", url: "https://www.ckplayer.vip/jiexi/?url=" },
        { name: "八戒解析", url: "https://jx.m3u8.tv/jiexi/?url=" },
        { name: "悟空解析", url: "https://bd.jx.cn/?url=" }
    ],

    // 平台配置
    platforms: {
        'iqiyi.com': '爱奇艺',
        'v.qq.com': '腾讯视频',
        'youku.com': '优酷',
        'mgtv.com': '芒果TV',
        'tv.sohu.com': '搜狐视频',
        'bilibili.com': '哔哩哔哩',
        '1905.com': '1905电影网',
        'pptv.com': 'PPTV'
    },

    // 测速配置
    speedTest: {
        timeout: 8000,          // 单个接口测试超时时间(ms)
        delayAfterLoad: 500,    // 加载后延迟时间(ms)
        maxRetries: 3           // 最大重试次数
    },

    // 存储配置
    storage: {
        maxHistoryItems: 50,    // 最大历史记录数
        maxFavorites: 100,      // 最大收藏数
        keys: {
            history: 'videoHistory',
            favorites: 'videoFavorites',
            theme: 'theme',
            lastUsedApi: 'lastUsedApi'
        }
    },

    // 通知配置
    notification: {
        duration: 3000,         // 通知显示时长(ms)
        position: 'top-right'   // 通知位置
    },

    // 性能评级标准
    performanceGrades: {
        excellent: 3000,        // 优秀: < 3s
        good: 6000,            // 良好: 3s-6s
        average: 10000         // 一般: 6s-10s, 超过为差
    }
};

// 冻结配置对象，防止被修改
Object.freeze(CONFIG);
Object.freeze(CONFIG.apiList);
Object.freeze(CONFIG.platforms);
Object.freeze(CONFIG.speedTest);
Object.freeze(CONFIG.storage);
Object.freeze(CONFIG.notification);
Object.freeze(CONFIG.performanceGrades);
