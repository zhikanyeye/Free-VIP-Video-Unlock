// 工具函数库 - 提取可复用的工具函数

const Utils = {
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间(ms)
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 时间限制(ms)
     * @returns {Function}
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 验证URL格式
     * @param {string} url - 要验证的URL
     * @returns {boolean}
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    },

    /**
     * 检测视频平台
     * @param {string} url - 视频URL
     * @returns {string|null} 平台名称
     */
    detectPlatform(url) {
        for (const [domain, name] of Object.entries(CONFIG.platforms)) {
            if (url.includes(domain)) {
                return name;
            }
        }
        return null;
    },

    /**
     * 格式化日期为相对时间
     * @param {string} timestamp - ISO时间戳
     * @returns {string}
     */
    formatRelativeTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 2) {
            return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays <= 7) {
            return `${diffDays - 1}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    },

    /**
     * 安全的HTML转义，防止XSS攻击
     * @param {string} str - 要转义的字符串
     * @returns {string}
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*}
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    },

    /**
     * 获取性能评级
     * @param {number} responseTime - 响应时间(ms)
     * @returns {Object} {grade: string, className: string}
     */
    getPerformanceGrade(responseTime) {
        const { excellent, good, average } = CONFIG.performanceGrades;
        
        if (responseTime < excellent) {
            return { grade: '优秀', className: 'text-success' };
        } else if (responseTime < good) {
            return { grade: '良好', className: 'text-warning' };
        } else if (responseTime < average) {
            return { grade: '一般', className: 'text-info' };
        } else {
            return { grade: '较慢', className: 'text-danger' };
        }
    },

    /**
     * 本地存储操作封装
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('读取本地存储失败:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('保存到本地存储失败:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('删除本地存储失败:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('清空本地存储失败:', error);
                return false;
            }
        }
    },

    /**
     * 设备检测
     */
    device: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isMac: /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform),
        isWindows: /Win32|Win64|Windows|WinCE/.test(navigator.platform),
        
        /**
         * 获取设备类型描述
         * @returns {string}
         */
        getType() {
            if (this.isMobile) {
                return this.isIOS ? 'iOS' : this.isAndroid ? 'Android' : 'Mobile';
            }
            return this.isMac ? 'Mac' : this.isWindows ? 'Windows' : 'Desktop';
        }
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('复制失败:', error);
            return false;
        }
    },

    /**
     * 生成唯一ID
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 延迟执行
     * @param {number} ms - 延迟时间(ms)
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// 冻结工具对象，防止被修改
Object.freeze(Utils);
Object.freeze(Utils.storage);
Object.freeze(Utils.device);
