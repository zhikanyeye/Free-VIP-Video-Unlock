document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const videoUrlInput = document.getElementById('videoUrl');
    const parseBtn = document.getElementById('parseBtn');
    const playerSection = document.getElementById('playerSection');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoTitle = document.getElementById('videoTitle');
    const closePlayer = document.getElementById('closePlayer');
    const speedTestBtn = document.getElementById('speedTestBtn');
    const apiListBtn = document.getElementById('apiListBtn');
    const historyBtn = document.getElementById('historyBtn');
    const helpBtn = document.getElementById('helpBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const statusInfo = document.getElementById('statusInfo');
    const statusText = document.getElementById('statusText');
    const apiNameBadge = document.getElementById('apiNameBadge');
    const dplayerContainer = document.getElementById('dplayer-container');
    const iframeContainer = document.getElementById('iframe-container');

    // DPlayer 实例
    let dplayer = null;

    // 设备检测
    const deviceInfo = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isMac: /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform),
        isWindows: /Win32|Win64|Windows|WinCE/.test(navigator.platform)
    };

    // 解析API接口数组
    const apiList = [
        {
            name: "蜜糖解析",
            url: "https://mtjiexi.cc:966/?url="
        },
        {
            name: "盖子解析",
            url: "https://gayzyjiexi.com/play/?url="
        },
        {
            name: "豆瓣解析",
            url: "https://www.dbjiexi.com:966/jx/?url="
        },
        {
            name: "雨兔解析",
            url: "https://yutujx.com/?url="
        },
        {
            name: "大奶子解析",
            url: "https://jiexidanaizi.com/?url="
        },
        {
            name: "973解析",
            url: "https://jx.973973.xyz/?url="
        },
        {
            name: "小蚂蚁解析1",
            url: "https://jx.xmflv.com/?url="
        },
        {
            name: "小蚂蚁解析2",
            url: "https://jx.xmflv.cc/?url="
        },
        {
            name: "M1907解析",
            url: "https://z1.m1907.top/?jx="
        }
    ];

    // 全局变量
    let speedTestResults = [];
    let bestApiIndex = 0;
    let isSpeedTesting = false;

    // 历史记录和主题相关
    let videoHistory = JSON.parse(localStorage.getItem('videoHistory')) || [];
    const maxHistoryItems = 50; // 最大历史记录数量

    // 初始化主题和设备优化
    initializeTheme();
    initializeDeviceOptimizations();

    // 事件监听器
    parseBtn.addEventListener('click', parseVideo);
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            parseVideo();
        }
    });
    closePlayer.addEventListener('click', closeVideoPlayer);
    speedTestBtn.addEventListener('click', performSpeedTestManual);
    apiListBtn.addEventListener('click', showApiList);
    historyBtn.addEventListener('click', showVideoHistory);
    themeToggle.addEventListener('click', toggleTheme);
    helpBtn.addEventListener('click', showHelpModal);

    // 主要功能函数

    // 主题切换功能
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        showNotification(`已切换到${newTheme === 'dark' ? '黑暗' : '明亮'}模式`, 'success');
    }

    function updateThemeIcon(theme) {
        const icon = themeIcon;
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = '切换到明亮模式';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = '切换到黑暗模式';
        }
    }

    // 历史记录功能
    function addToHistory(videoInfo) {
        const historyItem = {
            id: Date.now(),
            url: videoInfo.originalUrl,
            platform: videoInfo.platform,
            apiName: videoInfo.apiName,
            timestamp: new Date().toISOString(),
            title: `${videoInfo.platform} 视频`
        };

        // 检查是否已存在相同的URL
        const existingIndex = videoHistory.findIndex(item => item.url === historyItem.url);
        if (existingIndex !== -1) {
            videoHistory.splice(existingIndex, 1);
        }

        // 添加到历史记录开头
        videoHistory.unshift(historyItem);

        // 限制历史记录数量
        if (videoHistory.length > maxHistoryItems) {
            videoHistory = videoHistory.slice(0, maxHistoryItems);
        }

        // 保存到本地存储
        localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
    }

    function showVideoHistory() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-history"></i> 解析历史记录
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${videoHistory.length === 0 ? 
                            '<div class="text-center py-4"><i class="fas fa-inbox fa-3x text-muted mb-3"></i><p class="text-muted">暂无解析历史记录</p></div>' :
                            `<div class="d-flex justify-content-between align-items-center mb-3">
                                <small class="text-muted">共 ${videoHistory.length} 条记录</small>
                                <button type="button" class="btn btn-outline-danger btn-sm clear-history-btn" onclick="clearVideoHistory()">
                                    <i class="fas fa-trash"></i> 清空记录
                                </button>
                            </div>
                            <div class="list-group">
                                ${videoHistory.map(item => `
                                    <div class="list-group-item history-item" style="cursor: pointer;" onclick="useHistoryItem('${item.url}', '${item.platform}')">
                                        <div class="d-flex w-100 justify-content-between align-items-start">
                                            <div class="flex-grow-1">
                                                <div class="d-flex align-items-center mb-1">
                                                    <span class="badge bg-primary history-platform me-2">${item.platform}</span>
                                                    <span class="badge bg-secondary me-2">${item.apiName}</span>
                                                    <small class="history-date">${formatDate(item.timestamp)}</small>
                                                </div>
                                                <div class="history-url small">${item.url}</div>
                                            </div>
                                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); removeHistoryItem(${item.id})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 2) {
            return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays <= 7) {
            return `${diffDays-1}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    // 设备优化初始化
    function initializeDeviceOptimizations() {
        if (deviceInfo.isMobile) {
            document.body.classList.add('mobile-device');
            if (deviceInfo.isIOS) {
                document.body.classList.add('ios-device');
            }
            if (deviceInfo.isAndroid) {
                document.body.classList.add('android-device');
            }
            addTouchOptimizations();
        }
        
        if (deviceInfo.isMac) {
            document.body.classList.add('mac-device');
        }
        
        if (deviceInfo.isWindows) {
            document.body.classList.add('windows-device');
        }
        
        updateStatus('系统已优化适配您的设备', 'success');
    }

    // 触摸设备优化
    function addTouchOptimizations() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // 视频解析主函数
    async function parseVideo() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showNotification('请输入视频链接', 'error');
            return;
        }
        
        if (!isValidUrl(url)) {
            showNotification('请输入有效的视频链接', 'error');
            return;
        }
        
        const platform = detectPlatform(url);
        if (!platform) {
            showNotification('不支持的视频平台，请尝试其他链接', 'error');
            return;
        }
        
        parseBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 智能解析中...';
        parseBtn.disabled = true;
        updateStatus('开始智能解析视频...', 'info');

        try {
            // 智能测速选择最佳接口
            updateStatus('正在智能检测最佳解析接口，请稍候...', 'info');
            await performSpeedTest();
            
            const bestApi = apiList[bestApiIndex];
            updateStatus(`使用最佳接口 ${bestApi.name} 解析视频...`, 'info');
            
            const fullVideoUrl = bestApi.url + encodeURIComponent(url);
            const videoInfo = {
                platform: platform,
                apiName: bestApi.name,
                originalUrl: url,
                fullUrl: fullVideoUrl
            };
            
            videoTitle.textContent = `正在播放: ${platform} 视频`;
            apiNameBadge.textContent = `${bestApi.name} (最佳)`;
            
            // 尝试使用 DPlayer，失败则使用 iframe
            const dplayerSuccess = await tryDPlayerFirst(fullVideoUrl, videoInfo);
            
            if (!dplayerSuccess) {
                fallbackToIframe(videoInfo);
            }
            
            playerSection.classList.remove('d-none');
            parseBtn.innerHTML = '<i class="fas fa-search"></i> 智能解析';
            parseBtn.disabled = false;
            
            playerSection.scrollIntoView({ behavior: 'smooth' });
            
            const responseTime = speedTestResults.find(r => r.index === bestApiIndex)?.responseTime;
            const timeDisplay = responseTime ? ` (${Math.round(responseTime)}ms)` : '';
            
            showNotification(`视频解析成功！使用接口：${bestApi.name}${timeDisplay}`, 'success');
            updateStatus(`解析成功，正在播放 ${platform} 视频`, 'success');
            
            // 添加到历史记录
            addToHistory(videoInfo);
            
            addRetryMechanism(url, platform);
            
        } catch (error) {
            parseBtn.innerHTML = '<i class="fas fa-search"></i> 智能解析';
            parseBtn.disabled = false;
            showNotification('智能解析失败，请稍后重试', 'error');
            updateStatus('解析失败，请检查链接或网络连接', 'error');
        }
    }

    // 智能测速功能
    async function performSpeedTest() {
        if (isSpeedTesting) return;
        
        isSpeedTesting = true;
        speedTestResults = [];
        
        const testVideoUrl = videoUrlInput.value.trim();
        if (!testVideoUrl) {
            isSpeedTesting = false;
            return;
        }
        
        const testPromises = apiList.map(async (api, index) => {
            try {
                const startTime = performance.now();
                const fullParseUrl = api.url + encodeURIComponent(testVideoUrl);
                
                const testResult = await testParseInterface(fullParseUrl, api.name, index);
                
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                return {
                    index: index,
                    responseTime: responseTime,
                    available: testResult.success,
                    error: testResult.error,
                    loadTime: testResult.loadTime
                };
            } catch (error) {
                return {
                    index: index,
                    responseTime: 15000,
                    available: false,
                    error: error.message,
                    loadTime: 0
                };
            }
        });
        
        try {
            speedTestResults = await Promise.all(testPromises);
            
            const availableResults = speedTestResults.filter(r => r.available);
            
            if (availableResults.length > 0) {
                availableResults.sort((a, b) => a.responseTime - b.responseTime);
                bestApiIndex = availableResults[0].index;
            } else {
                bestApiIndex = 0;
                updateStatus('所有接口测试失败，使用默认接口', 'warning');
            }
            
        } catch (error) {
            bestApiIndex = 0;
            updateStatus('智能测速失败，使用默认接口', 'error');
        } finally {
            isSpeedTesting = false;
        }
    }

    // 测试解析接口
    async function testParseInterface(parseUrl, apiName, apiIndex) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const iframe = document.createElement('iframe');
            
            iframe.style.display = 'none';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            
            let resolved = false;
            
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        success: false,
                        error: '响应超时',
                        loadTime: performance.now() - startTime
                    });
                }
            }, 8000);
            
            const cleanup = () => {
                clearTimeout(timeout);
                if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
            };
            
            iframe.onload = () => {
                if (!resolved) {
                    resolved = true;
                    const loadTime = performance.now() - startTime;
                    cleanup();
                    
                    setTimeout(() => {
                        resolve({
                            success: true,
                            error: null,
                            loadTime: loadTime
                        });
                    }, 500);
                }
            };
            
            iframe.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        success: false,
                        error: '加载失败',
                        loadTime: performance.now() - startTime
                    });
                }
            };
            
            document.body.appendChild(iframe);
            
            try {
                iframe.src = parseUrl;
            } catch (error) {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        success: false,
                        error: '设置URL失败',
                        loadTime: performance.now() - startTime
                    });
                }
            }
        });
    }

    // 手动详细测速
    async function performSpeedTestManual() {
        if (isSpeedTesting) {
            showNotification('正在进行智能测速，请稍候...', 'info');
            return;
        }

        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            showNotification('请先输入视频链接再进行测速', 'warning');
            return;
        }

        if (!isValidUrl(videoUrl)) {
            showNotification('请输入有效的视频链接', 'error');
            return;
        }
        
        speedTestBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> 详细测速中...';
        speedTestBtn.disabled = true;
        updateStatus('正在基于当前视频链接进行详细接口测速...', 'info');
        
        try {
            await performSpeedTest();
            const bestApi = apiList[bestApiIndex];
            const responseTime = speedTestResults.find(r => r.index === bestApiIndex)?.responseTime;
            const timeDisplay = responseTime ? ` (${Math.round(responseTime)}ms)` : '';
            
            updateStatus(`详细测速完成！推荐接口：${bestApi.name}${timeDisplay}`, 'success');
            showNotification(`推荐使用：${bestApi.name}${timeDisplay}`, 'success');
            
            showDetailedSpeedResults();
        } catch (error) {
            updateStatus('详细测速失败，请稍后重试', 'error');
            showNotification('详细测速失败，请检查网络连接', 'error');
        } finally {
            speedTestBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> 详细测速';
            speedTestBtn.disabled = false;
        }
    }

    // 显示详细测速结果
    function showDetailedSpeedResults() {
        const availableApis = speedTestResults.filter(r => r.available);
        const failedApis = speedTestResults.filter(r => !r.available);
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-tachometer-alt"></i> 详细测速结果</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i> 
                            基于当前视频链接的实际解析测试结果。解析视频时将自动使用最快的可用接口。
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4 text-center">
                                <div class="h4 text-success">${availableApis.length}</div>
                                <div class="text-muted">可用接口</div>
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="h4 text-danger">${failedApis.length}</div>
                                <div class="text-muted">失败接口</div>
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="h4 text-primary">${availableApis.length > 0 ? Math.round(availableApis[0].responseTime) : '-'}</div>
                                <div class="text-muted">最快响应(ms)</div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>排名</th>
                                        <th>接口名称</th>
                                        <th>响应时间</th>
                                        <th>状态</th>
                                        <th>评级</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${speedTestResults.map((result, index) => {
                                        const availableIndex = availableApis.findIndex(a => a.index === result.index);
                                        const rank = availableIndex >= 0 ? availableIndex + 1 : '-';
                                        const responseTime = result.available ? Math.round(result.responseTime) + 'ms' : '失败';
                                        const status = result.available ? '正常' : (result.error || '测试失败');
                                        const grade = result.available ? 
                                            (result.responseTime < 3000 ? '优秀' :
                                             result.responseTime < 6000 ? '良好' : '一般') : '不可用';
                                        const gradeClass = result.available ?
                                            (result.responseTime < 3000 ? 'text-success' :
                                             result.responseTime < 6000 ? 'text-warning' : 'text-info') : 'text-danger';
                                        const bestBadge = result.index === bestApiIndex && result.available ? ' 🏆' : '';
                                        
                                        return '<tr class="' + (result.index === bestApiIndex && result.available ? 'table-success' : '') + '">' +
                                            '<td>' + rank + bestBadge + '</td>' +
                                            '<td>' + apiList[result.index].name + '</td>' +
                                            '<td>' + responseTime + '</td>' +
                                            '<td><small>' + status + '</small></td>' +
                                            '<td class="' + gradeClass + '"><small>' + grade + '</small></td>' +
                                            '</tr>';
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="fas fa-lightbulb"></i> 
                                智能解析会自动选择最快的接口。如果播放失败，系统会提供切换其他接口的选项。
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="performSpeedTestManualAgain(); bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();">
                            <i class="fas fa-redo"></i> 重新测速
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    }

    // 播放器相关函数

    // 初始化 DPlayer
    function initializeDPlayer(videoUrl, videoInfo) {
        if (dplayer) {
            dplayer.destroy();
            dplayer = null;
        }
        
        dplayerContainer.style.display = 'block';
        iframeContainer.classList.add('d-none');
        
        const dplayerConfig = {
            container: dplayerContainer,
            video: {
                url: videoUrl,
                type: 'auto',
                customType: {
                    'customHls': function (video, player) {
                        if (window.Hls && Hls.isSupported()) {
                            const hls = new Hls();
                            hls.loadSource(video.src);
                            hls.attachMedia(video);
                        }
                    }
                }
            },
            autoplay: false, // 不自动播放，避免错误
            theme: '#2563eb',
            loop: false,
            lang: 'zh-cn',
            screenshot: false,
            hotkey: !deviceInfo.isMobile,
            preload: 'metadata', // 只预加载元数据
            volume: 0.8,
            mutex: true,
            contextmenu: [
                {
                    text: '视频解析工具',
                    link: window.location.href
                }
            ]
        };
        
        try {
            dplayer = new DPlayer(dplayerConfig);
            bindDPlayerEvents(videoInfo);
            
            // 添加额外的错误检测
            setTimeout(() => {
                if (dplayer && dplayer.video && dplayer.video.error) {
                    console.warn('DPlayer 视频加载错误，切换到备用播放器');
                    fallbackToIframe(videoInfo);
                    return false;
                }
            }, 3000);
            
            return true;
        } catch (error) {
            console.error('DPlayer 初始化失败:', error);
            showNotification('DPlayer 加载失败，使用备用播放器', 'warning');
            return false;
        }
    }

    // 绑定 DPlayer 事件
    function bindDPlayerEvents(videoInfo) {
        if (!dplayer) return;
        
        dplayer.on('loadstart', function () {
            updateStatus('视频开始加载...', 'info');
        });
        
        dplayer.on('loadeddata', function () {
            updateStatus('视频加载完成，可以播放', 'success');
        });
        
        dplayer.on('error', function (e) {
            console.error('DPlayer 播放错误:', e);
            showNotification('播放失败，正在切换备用播放器...', 'error');
            fallbackToIframe(videoInfo);
        });
    }

    // 尝试使用 DPlayer
    async function tryDPlayerFirst(videoUrl, videoInfo) {
        try {
            if (typeof DPlayer === 'undefined') {
                console.warn('DPlayer 未加载');
                return false;
            }
            
            // 检测是否为直接视频流URL
            const isDirectVideo = /\.(mp4|m3u8|flv|avi|mkv|webm)(\?.*)?$/i.test(videoUrl);
            
            if (!isDirectVideo) {
                // 如果不是直接视频流，尝试提取或直接使用iframe
                console.log('检测到解析页面URL，优先使用iframe播放器');
                return false;
            }
            
            return initializeDPlayer(videoUrl, videoInfo);
        } catch (error) {
            console.error('DPlayer 尝试失败:', error);
            return false;
        }
    }

    // 备用播放器
    function fallbackToIframe(videoInfo) {
        dplayerContainer.style.display = 'none';
        iframeContainer.classList.remove('d-none');
        videoPlayer.src = videoInfo.fullUrl;
        updateStatus('使用网页播放器播放视频', 'info');
        showNotification('已启用网页播放器，兼容性更好', 'info');
    }

    // 关闭播放器
    function closeVideoPlayer() {
        if (dplayer) {
            dplayer.destroy();
            dplayer = null;
        }
        
        videoPlayer.src = '';
        playerSection.classList.add('d-none');
        dplayerContainer.style.display = 'none';
        iframeContainer.classList.add('d-none');
        
        const retryContainer = document.querySelector('.retry-container');
        if (retryContainer) {
            retryContainer.remove();
        }
        
        updateStatus('播放器已关闭', 'info');
    }

    // 添加重试机制
    function addRetryMechanism(url, platform) {
        const retryContainer = document.createElement('div');
        retryContainer.className = 'text-center mt-3 retry-container';
        retryContainer.innerHTML = `
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="retryWithNextApi('${url}', '${platform}')">
                    <i class="fas fa-redo"></i> 换个接口重试
                </button>
                <button type="button" class="btn btn-outline-info btn-sm" onclick="showApiList()">
                    <i class="fas fa-list"></i> 查看所有接口
                </button>
                <button type="button" class="btn btn-outline-success btn-sm" onclick="performSpeedTestManualAgain()">
                    <i class="fas fa-tachometer-alt"></i> 重新测速
                </button>
            </div>
        `;
        
        const oldRetry = document.querySelector('.retry-container');
        if (oldRetry) {
            oldRetry.remove();
        }
        
        document.querySelector('#playerSection .card-body').appendChild(retryContainer);
    }

    // 工具函数

    // 检测视频平台
    function detectPlatform(url) {
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

    // 更新状态显示
    function updateStatus(message, type) {
        statusText.textContent = message;
        statusInfo.className = `status-info mt-4 show`;
        
        const alertDiv = statusInfo.querySelector('.alert');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 
                                          type === 'warning' ? 'warning' : 
                                          type === 'info' ? 'info' : 'success'} d-inline-block`;
        
        setTimeout(() => {
            statusInfo.classList.remove('show');
        }, 5000);
    }

    // 显示通知
    function showNotification(message, type) {
        const notification = document.createElement('div');
        const alertType = type === 'error' ? 'danger' : 
                         type === 'warning' ? 'warning' : 
                         type === 'info' ? 'info' : 'success';
        
        notification.className = `alert alert-${alertType} notification`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '350px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        notification.style.backdropFilter = 'blur(10px)';
        notification.style.border = 'none';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 
                                   type === 'warning' ? 'exclamation-circle' : 
                                   type === 'info' ? 'info-circle' : 'check-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // 显示接口列表
    function showApiList() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-list"></i> 解析接口列表</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i> 
                                点击接口可切换使用，绿色表示速度快，黄色表示中等，红色表示较慢
                            </small>
                        </div>
                        <div class="list-group">
                            ${apiList.map((api, index) => {
                                const result = speedTestResults.find(r => r.index === index);
                                const responseTime = result ? Math.round(result.responseTime) : '未测试';
                                const available = result ? result.available : true;
                                const isBest = index === bestApiIndex;
                                
                                let statusClass = 'slow';
                                let statusText = '较慢';
                                if (result && result.responseTime < 2000) {
                                    statusClass = 'fast';
                                    statusText = '快速';
                                } else if (result && result.responseTime < 5000) {
                                    statusClass = 'medium';
                                    statusText = '中等';
                                }
                                
                                return `
                                    <div class="list-group-item list-group-item-action ${isBest ? 'active' : ''}" onclick="selectApi(${index})" style="cursor: pointer;">
                                        <div class="d-flex w-100 justify-content-between align-items-center">
                                            <div class="d-flex align-items-center">
                                                <span class="api-status ${statusClass}"></span>
                                                <div>
                                                    <h6 class="mb-1">
                                                        ${api.name} 
                                                        ${isBest ? '<span class="badge bg-primary ms-2">当前最佳</span>' : ''}
                                                        ${!available ? '<span class="badge bg-danger ms-2">不可用</span>' : ''}
                                                    </h6>
                                                    <small class="text-muted">${api.url}</small>
                                                </div>
                                            </div>
                                            <div class="text-end">
                                                <div class="fw-bold">${responseTime === '未测试' ? responseTime : responseTime + 'ms'}</div>
                                                <small class="text-muted">${result ? statusText : '未测试'}</small>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    }

    // 显示帮助模态框
    function showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-question-circle"></i> 使用帮助</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="accordion" id="helpAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help1">
                                        <i class="fas fa-play me-2"></i> 如何使用智能解析？
                                    </button>
                                </h2>
                                <div id="help1" class="accordion-collapse collapse show" data-bs-parent="#helpAccordion">
                                    <div class="accordion-body">
                                        <ol>
                                            <li>复制您想要观看的VIP视频链接</li>
                                            <li>将链接粘贴到输入框中</li>
                                            <li>点击"智能解析"按钮</li>
                                            <li>系统会自动测试所有解析接口的速度</li>
                                            <li>自动选择最快的接口进行播放</li>
                                            <li>如果播放失败，可以尝试切换其他接口</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help2">
                                        <i class="fas fa-tachometer-alt me-2"></i> 智能测速原理
                                    </button>
                                </h2>
                                <div id="help2" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                    <div class="accordion-body">
                                        <p>智能测速功能会基于您输入的视频链接，实际测试每个解析接口的响应速度：</p>
                                        <ul>
                                            <li>🟢 绿色：响应速度快（&lt;2秒）</li>
                                            <li>🟡 黄色：响应速度中等（2-5秒）</li>
                                            <li>🔴 红色：响应速度慢（&gt;5秒）</li>
                                        </ul>
                                        <p>系统会自动选择最快且可用的接口为您提供最佳播放体验。</p>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help3">
                                        <i class="fas fa-list me-2"></i> 支持哪些平台？
                                    </button>
                                </h2>
                                <div id="help3" class="accordion-collapse collapse" data-bs-parent="#helpAccordion">
                                    <div class="accordion-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <ul class="list-unstyled">
                                                    <li><i class="fas fa-check text-success"></i> 爱奇艺 (iqiyi.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> 腾讯视频 (v.qq.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> 优酷 (youku.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> 芒果TV (mgtv.com)</li>
                                                </ul>
                                            </div>
                                            <div class="col-md-6">
                                                <ul class="list-unstyled">
                                                    <li><i class="fas fa-check text-success"></i> 搜狐视频 (tv.sohu.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> 哔哩哔哩 (bilibili.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> 1905电影网 (1905.com)</li>
                                                    <li><i class="fas fa-check text-success"></i> PPTV (pptv.com)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <a href="https://github.com/zhikanyeye/Free-VIP-Video-Unlock" class="btn btn-primary" target="_blank">
                            <i class="fab fa-github"></i> 查看源码
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    }

    // 全局函数定义
    window.retryWithNextApi = async function(url, platform) {
        bestApiIndex = (bestApiIndex + 1) % apiList.length;
        const api = apiList[bestApiIndex];
        
        const fullVideoUrl = api.url + encodeURIComponent(url);
        const videoInfo = {
            platform: platform,
            apiName: api.name,
            originalUrl: url,
            fullUrl: fullVideoUrl
        };
        
        videoTitle.textContent = `正在播放: ${platform} 视频`;
        apiNameBadge.textContent = api.name;
        
        const dplayerSuccess = deviceInfo.isMobile ? 
            false : 
            await tryDPlayerFirst(fullVideoUrl, videoInfo);
        
        if (!dplayerSuccess) {
            fallbackToIframe(videoInfo);
        }
        
        showNotification(`已切换到 ${api.name}`, 'info');
        updateStatus(`正在使用 ${api.name} 播放视频`, 'info');
    };

    window.selectApi = function(index) {
        bestApiIndex = index;
        const url = videoUrlInput.value.trim();
        const platform = detectPlatform(url);
        
        if (url && platform) {
            window.retryWithNextApi(url, platform);
        }
        
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        if (modal) {
            modal.hide();
        }
    };

    window.showApiList = showApiList;
    window.performSpeedTestManualAgain = performSpeedTestManual;

    // 历史记录全局函数
    window.useHistoryItem = function(url, platform) {
        videoUrlInput.value = url;
        showNotification(`已加载历史记录：${platform} 视频`, 'info');
        // 关闭历史记录模态框
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        if (modal) {
            modal.hide();
        }
        // 滚动到输入框
        videoUrlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        videoUrlInput.focus();
    };

    window.removeHistoryItem = function(id) {
        const index = videoHistory.findIndex(item => item.id === id);
        if (index !== -1) {
            videoHistory.splice(index, 1);
            localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
            showNotification('已删除历史记录', 'success');
            // 刷新历史记录模态框
            const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
            if (modal) {
                modal.hide();
                setTimeout(() => showVideoHistory(), 300);
            }
        }
    };

    window.clearVideoHistory = function() {
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            videoHistory = [];
            localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
            showNotification('历史记录已清空', 'success');
            // 刷新历史记录模态框
            const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
            if (modal) {
                modal.hide();
                setTimeout(() => showVideoHistory(), 300);
            }
        }
    };

    // 初始化检查剪贴板
    function checkClipboard() {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(text => {
                    if (text && isValidUrl(text) && detectPlatform(text)) {
                        videoUrlInput.value = text;
                        showNotification('已自动粘贴剪贴板中的视频链接', 'success');
                    }
                })
                .catch(() => {
                    // 静默失败
                });
        }
    }

    // 页面加载完成后检查剪贴板
    document.addEventListener('click', function() {
        if (!window.clipboardChecked) {
            checkClipboard();
            window.clipboardChecked = true;
        }
    }, { once: true });

    // 移动端优化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && dplayer) {
            dplayer.pause();
        }
    });

    // 网络状态监测
    if ('connection' in navigator) {
        function updateNetworkStatus() {
            const connection = navigator.connection;
            const speed = connection.effectiveType;
            
            if (speed === 'slow-2g' || speed === '2g') {
                showNotification('网络较慢，建议使用较低质量的解析接口', 'warning');
            }
        }
        
        navigator.connection.addEventListener('change', updateNetworkStatus);
        updateNetworkStatus();
    }

    // 设备方向变化处理
    if (deviceInfo.isMobile) {
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                if (dplayer) {
                    dplayer.resize();
                }
            }, 500);
        });
    }
});
