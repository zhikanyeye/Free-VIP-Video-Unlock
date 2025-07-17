document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const videoUrlInput = document.getElementById('videoUrl');
    const parseBtn = document.getElementById('parseBtn');
    const playerSection = document.getElementById('playerSection');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const closePlayer = document.getElementById('closePlayer');
    
    // 解析API接口数组
    const apiList = [
        {
            name: "默认接口",
            url: "https://jx.jsonplayer.com/player/?url="
        },
        {
            name: "备用接口1",
            url: "https://jx.m3u8.tv/jiexi/?url="
        },
        {
            name: "备用接口2",
            url: "https://jx.bozrc.com:4433/player/?url="
        }
    ];
    
    // 点击解析按钮事件
    parseBtn.addEventListener('click', function() {
        parseVideo();
    });
    
    // 输入框回车事件
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            parseVideo();
        }
    });
    
    // 关闭播放器
    closePlayer.addEventListener('click', function() {
        playerSection.classList.add('d-none');
        videoPlayer.src = '';
    });
    
    // 视频解析函数
    function parseVideo() {
        const url = videoUrlInput.value.trim();
        
        // 验证URL
        if (!url) {
            showNotification('请输入视频链接', 'error');
            return;
        }
        
        if (!isValidUrl(url)) {
            showNotification('请输入有效的视频链接', 'error');
            return;
        }
        
        // 检测视频平台
        const platform = detectPlatform(url);
        if (!platform) {
            showNotification('不支持的视频平台，请尝试其他链接', 'error');
            return;
        }
        
        // 显示加载状态
        parseBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 正在解析...';
        parseBtn.disabled = true;
        
        // 模拟解析过程
        setTimeout(function() {
            // 使用第一个API接口解析
            const api = apiList[0];
            
            // 设置播放器
            videoPlayer.src = api.url + encodeURIComponent(url);
            videoTitle.textContent = `正在播放: ${platform} 视频`;
            
            // 显示播放器
            playerSection.classList.remove('d-none');
            
            // 恢复按钮状态
            parseBtn.innerHTML = '<i class="fas fa-search"></i> 解析播放';
            parseBtn.disabled = false;
            
            // 滚动到播放器
            playerSection.scrollIntoView({ behavior: 'smooth' });
            
            // 显示成功通知
            showNotification('视频解析成功，开始播放', 'success');
            
        }, 1500);
    }
    
    // 检测视频平台
    function detectPlatform(url) {
        // 支持的视频平台域名
        const platforms = {
            'iqiyi.com': '爱奇艺',
            'v.qq.com': '腾讯视频',
            'youku.com': '优酷',
            'mgtv.com': '芒果TV',
            'tv.sohu.com': '搜狐视频',
            'bilibili.com': '哔哩哔哩',
            '1905.com': '1905电影网',
            'pptv.com': 'PPTV'
        };
        
        try {
            const domain = new URL(url).hostname;
            
            // 检查URL是否包含支持的平台域名
            for (const key in platforms) {
                if (domain.includes(key)) {
                    return platforms[key];
                }
            }
        } catch (e) {
            return null;
        }
        
        return null;
    }
    
    // 验证URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // 显示通知
    function showNotification(message, type) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} notification`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '300px';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后自动删除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // 初始化检查剪贴板
    function checkClipboard() {
        // 请求剪贴板权限并检查是否有视频URL
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(text => {
                    if (text && isValidUrl(text) && detectPlatform(text)) {
                        videoUrlInput.value = text;
                        showNotification('已自动粘贴剪贴板中的视频链接', 'success');
                    }
                })
                .catch(() => {
                    // 用户未授予权限或其他错误，静默失败
                });
        }
    }
    
    // 页面加载完成后检查剪贴板
    // 注：许多浏览器需要用户交互后才能访问剪贴板
    document.addEventListener('click', function() {
        // 首次点击页面时尝试检查剪贴板
        if (!window.clipboardChecked) {
            checkClipboard();
            window.clipboardChecked = true;
        }
    }, { once: true });
});
