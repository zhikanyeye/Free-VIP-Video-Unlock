// 优化后的主脚本 - 使用模块化架构
document.addEventListener('DOMContentLoaded', function() {
    // ==================== DOM 元素引用 ====================
    const DOM = {
        videoUrlInput: document.getElementById('videoUrl'),
        parseBtn: document.getElementById('parseBtn'),
        playerSection: document.getElementById('playerSection'),
        videoPlayer: document.getElementById('videoPlayer'),
        videoTitle: document.getElementById('videoTitle'),
        closePlayer: document.getElementById('closePlayer'),
        speedTestBtn: document.getElementById('speedTestBtn'),
        apiListBtn: document.getElementById('apiListBtn'),
        historyBtn: document.getElementById('historyBtn'),
        favoritesBtn: document.getElementById('favoritesBtn'),
        helpBtn: document.getElementById('helpBtn'),
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.getElementById('themeIcon'),
        apiNameBadge: document.getElementById('apiNameBadge'),
        dplayerContainer: document.getElementById('dplayer-container'),
        iframeContainer: document.getElementById('iframe-container'),
        favoriteBtnPlayer: document.getElementById('favoriteBtnPlayer')
    };

    // ==================== 应用状态 ====================
    const AppState = {
        dplayer: null,
        speedTestResults: [],
        bestApiIndex: 0,
        isSpeedTesting: false,
        currentVideoUrl: '',
        videoHistory: Utils.storage.get(CONFIG.storage.keys.history, []),
        videoFavorites: Utils.storage.get(CONFIG.storage.keys.favorites, [])
    };

    // ==================== 初始化 ====================
    function initialize() {
        initializeTheme();
        initializeDeviceOptimizations();
        bindEventListeners();
        checkClipboard();
    }

    // ==================== 事件绑定 ====================
    function bindEventListeners() {
        DOM.parseBtn.addEventListener('click', parseVideo);
        DOM.videoUrlInput.addEventListener('keypress', handleInputKeypress);
        DOM.closePlayer.addEventListener('click', closeVideoPlayer);
        DOM.speedTestBtn.addEventListener('click', performSpeedTestManual);
        DOM.apiListBtn.addEventListener('click', showApiList);
        DOM.historyBtn.addEventListener('click', showVideoHistory);
        DOM.favoritesBtn.addEventListener('click', showVideoFavorites);
        DOM.themeToggle.addEventListener('click', toggleTheme);
        DOM.helpBtn.addEventListener('click', showHelpModal);
        DOM.favoriteBtnPlayer.addEventListener('click', toggleFavorite);

        // 键盘快捷键
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // 网络状态监听
        window.addEventListener('online', () => UI.showNotification('网络已连接', 'success'));
        window.addEventListener('offline', () => UI.showNotification('网络已断开', 'error'));
    }

    // ==================== 键盘快捷键 ====================
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: 快速解析
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            parseVideo();
        }
        // Esc: 关闭播放器
        if (e.key === 'Escape' && !DOM.playerSection.classList.contains('d-none')) {
            closeVideoPlayer();
        }
    }

    function handleInputKeypress(e) {
        if (e.key === 'Enter') {
            parseVideo();
        }
    }

    // ==================== 主题管理 ====================
    function initializeTheme() {
        const savedTheme = Utils.storage.get(CONFIG.storage.keys.theme, 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        Utils.storage.set(CONFIG.storage.keys.theme, newTheme);
        updateThemeIcon(newTheme);
        
        UI.showNotification(`已切换到${newTheme === 'dark' ? '黑暗' : '明亮'}模式`, 'success');
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            DOM.themeIcon.className = 'fas fa-sun';
            DOM.themeToggle.title = '切换到明亮模式';
        } else {
            DOM.themeIcon.className = 'fas fa-moon';
            DOM.themeToggle.title = '切换到黑暗模式';
        }
    }

    // ==================== 设备优化 ====================
    function initializeDeviceOptimizations() {
        const device = Utils.device;
        
        if (device.isMobile) {
            document.body.classList.add('mobile-device');
            if (device.isIOS) document.body.classList.add('ios-device');
            if (device.isAndroid) document.body.classList.add('android-device');
            addTouchOptimizations();
        }
        
        if (device.isMac) document.body.classList.add('mac-device');
        if (device.isWindows) document.body.classList.add('windows-device');
        
        UI.updateStatus(`系统已优化适配您的 ${device.getType()} 设备`, 'success');
    }

    function addTouchOptimizations() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // ==================== 剪贴板检测 ====================
    async function checkClipboard() {
        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) return;
            
            const text = await navigator.clipboard.readText();
            if (Utils.isValidUrl(text) && Utils.detectPlatform(text)) {
                const platform = Utils.detectPlatform(text);
                UI.showNotification(`检测到剪贴板中的${platform}视频链接`, 'info');
            }
        } catch (error) {
            // 用户未授权剪贴板权限，忽略
        }
    }

    // ==================== 视频解析 ====================
    async function parseVideo() {
        const url = DOM.videoUrlInput.value.trim();
        
        // 验证输入
        if (!url) {
            UI.showNotification('请输入视频链接', 'error');
            return;
        }
        
        if (!Utils.isValidUrl(url)) {
            UI.showNotification('请输入有效的视频链接', 'error');
            return;
        }
        
        const platform = Utils.detectPlatform(url);
        if (!platform) {
            UI.showNotification('不支持的视频平台，请尝试其他链接', 'error');
            return;
        }
        
        // 设置加载状态
        UI.setButtonLoading(DOM.parseBtn, true, '智能解析中...', '<i class="fas fa-search"></i> 智能解析');
        UI.updateStatus('开始智能解析视频...', 'info');

        try {
            // 智能测速选择最佳接口
            UI.updateStatus('正在智能检测最佳解析接口，请稍候...', 'info');
            await performSpeedTest();
            
            const bestApi = CONFIG.apiList[AppState.bestApiIndex];
            UI.updateStatus(`使用最佳接口 ${bestApi.name} 解析视频...`, 'info');
            
            const fullVideoUrl = bestApi.url + encodeURIComponent(url);
            const videoInfo = {
                platform: platform,
                apiName: bestApi.name,
                originalUrl: url,
                fullUrl: fullVideoUrl
            };
            
            DOM.videoTitle.textContent = `正在播放: ${platform} 视频`;
            DOM.apiNameBadge.textContent = `${bestApi.name} (最佳)`;
            
            // 尝试使用 DPlayer，失败则使用 iframe
            const dplayerSuccess = await tryDPlayerFirst(fullVideoUrl, videoInfo);
            
            if (!dplayerSuccess) {
                fallbackToIframe(videoInfo);
            }
            
            UI.toggle(DOM.playerSection, true);
            UI.scrollTo(DOM.playerSection);
            
            const responseTime = AppState.speedTestResults.find(r => r.index === AppState.bestApiIndex)?.responseTime;
            const timeDisplay = responseTime ? ` (${Math.round(responseTime)}ms)` : '';
            
            UI.showNotification(`视频解析成功！使用接口：${bestApi.name}${timeDisplay}`, 'success');
            UI.updateStatus(`解析成功，正在播放 ${platform} 视频`, 'success');
            
            // 添加到历史记录
            addToHistory(videoInfo);
            
            // 更新收藏按钮状态
            AppState.currentVideoUrl = url;
            updateFavoriteButton();
            
            // 添加重试机制
            addRetryMechanism(url, platform);
            
        } catch (error) {
            console.error('解析失败:', error);
            UI.showNotification('智能解析失败，请稍后重试', 'error');
            UI.updateStatus('解析失败，请检查链接或网络连接', 'error');
        } finally {
            UI.setButtonLoading(DOM.parseBtn, false, '', '<i class="fas fa-search"></i> 智能解析');
        }
    }

    // ==================== 智能测速（带并发控制）====================
    async function performSpeedTest() {
        if (AppState.isSpeedTesting) return;
        
        AppState.isSpeedTesting = true;
        AppState.speedTestResults = [];
        
        const testVideoUrl = DOM.videoUrlInput.value.trim();
        if (!testVideoUrl) {
            AppState.isSpeedTesting = false;
            return;
        }

        // 检查缓存
        const cachedApi = getCachedBestApi();
        if (cachedApi !== null) {
            AppState.bestApiIndex = cachedApi;
            AppState.isSpeedTesting = false;
            UI.updateStatus(`使用缓存的最佳接口: ${CONFIG.apiList[cachedApi].name}`, 'info');
            return;
        }
        
        try {
            // 并发控制：每次测试5个接口
            const batchSize = 5;
            const results = [];
            
            for (let i = 0; i < CONFIG.apiList.length; i += batchSize) {
                const batch = CONFIG.apiList.slice(i, i + batchSize);
                const batchPromises = batch.map((api, batchIndex) => 
                    testParseInterface(api, i + batchIndex)
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults.map((result, idx) => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    } else {
                        return {
                            index: i + idx,
                            responseTime: 15000,
                            available: false,
                            error: result.reason?.message || '测试失败'
                        };
                    }
                }));
                
                // 短暂延迟，避免过载
                if (i + batchSize < CONFIG.apiList.length) {
                    await Utils.sleep(100);
                }
            }
            
            AppState.speedTestResults = results;
            
            // 选择最快的可用接口
            const availableResults = results.filter(r => r.available);
            
            if (availableResults.length > 0) {
                availableResults.sort((a, b) => a.responseTime - b.responseTime);
                AppState.bestApiIndex = availableResults[0].index;
                
                // 缓存最佳接口
                cacheBestApi(AppState.bestApiIndex);
            } else {
                AppState.bestApiIndex = 0;
                UI.updateStatus('所有接口测试失败，使用默认接口', 'warning');
            }
            
        } catch (error) {
            console.error('测速失败:', error);
            AppState.bestApiIndex = 0;
            UI.updateStatus('智能测速失败，使用默认接口', 'error');
        } finally {
            AppState.isSpeedTesting = false;
        }
    }

    // ==================== 接口缓存 ====================
    function getCachedBestApi() {
        const cache = Utils.storage.get('apiCache', null);
        if (!cache) return null;
        
        const now = Date.now();
        const cacheAge = now - cache.timestamp;
        const cacheValid = cacheAge < 3600000; // 1小时
        
        return cacheValid ? cache.apiIndex : null;
    }

    function cacheBestApi(apiIndex) {
        Utils.storage.set('apiCache', {
            apiIndex: apiIndex,
            timestamp: Date.now()
        });
    }

    // ==================== 测试单个接口 ====================
    async function testParseInterface(api, index) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const testVideoUrl = DOM.videoUrlInput.value.trim();
            const fullParseUrl = api.url + encodeURIComponent(testVideoUrl);
            
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'display:none;width:1px;height:1px;position:absolute;left:-9999px';
            
            let resolved = false;
            
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        index: index,
                        responseTime: CONFIG.speedTest.timeout,
                        available: false,
                        error: '响应超时'
                    });
                }
            }, CONFIG.speedTest.timeout);
            
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
                            index: index,
                            responseTime: loadTime,
                            available: true,
                            error: null
                        });
                    }, CONFIG.speedTest.delayAfterLoad);
                }
            };
            
            iframe.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        index: index,
                        responseTime: performance.now() - startTime,
                        available: false,
                        error: '加载失败'
                    });
                }
            };
            
            document.body.appendChild(iframe);
            
            try {
                iframe.src = fullParseUrl;
            } catch (error) {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    resolve({
                        index: index,
                        responseTime: performance.now() - startTime,
                        available: false,
                        error: '设置URL失败'
                    });
                }
            }
        });
    }

    // ==================== 手动详细测速 ====================
    async function performSpeedTestManual() {
        if (AppState.isSpeedTesting) {
            UI.showNotification('正在进行智能测速，请稍候...', 'info');
            return;
        }

        const videoUrl = DOM.videoUrlInput.value.trim();
        if (!videoUrl) {
            UI.showNotification('请先输入视频链接再进行测速', 'warning');
            return;
        }

        if (!Utils.isValidUrl(videoUrl)) {
            UI.showNotification('请输入有效的视频链接', 'error');
            return;
        }
        
        UI.setButtonLoading(DOM.speedTestBtn, true, '详细测速中...', '<i class="fas fa-tachometer-alt"></i> 详细测速');
        UI.updateStatus('正在基于当前视频链接进行详细接口测速...', 'info');
        
        // 清除缓存以进行完整测速
        Utils.storage.remove('apiCache');
        
        try {
            await performSpeedTest();
            const bestApi = CONFIG.apiList[AppState.bestApiIndex];
            const responseTime = AppState.speedTestResults.find(r => r.index === AppState.bestApiIndex)?.responseTime;
            const timeDisplay = responseTime ? ` (${Math.round(responseTime)}ms)` : '';
            
            UI.updateStatus(`详细测速完成！推荐接口：${bestApi.name}${timeDisplay}`, 'success');
            UI.showNotification(`推荐使用：${bestApi.name}${timeDisplay}`, 'success');
            
            showDetailedSpeedResults();
        } catch (error) {
            UI.updateStatus('详细测速失败，请稍后重试', 'error');
            UI.showNotification('详细测速失败，请检查网络连接', 'error');
        } finally {
            UI.setButtonLoading(DOM.speedTestBtn, false, '', '<i class="fas fa-tachometer-alt"></i> 详细测速');
        }
    }


    // ==================== 显示详细测速结果 ====================
    function showDetailedSpeedResults() {
        const availableApis = AppState.speedTestResults.filter(r => r.available);
        const failedApis = AppState.speedTestResults.filter(r => !r.available);
        
        const tableRows = AppState.speedTestResults.map((result) => {
            const availableIndex = availableApis.findIndex(a => a.index === result.index);
            const rank = availableIndex >= 0 ? availableIndex + 1 : '-';
            const responseTime = result.available ? Math.round(result.responseTime) + 'ms' : '失败';
            const status = result.available ? '正常' : (result.error || '测试失败');
            const gradeInfo = result.available ? Utils.getPerformanceGrade(result.responseTime) : 
                { grade: '不可用', className: 'text-danger' };
            const bestBadge = result.index === AppState.bestApiIndex && result.available ? ' 🏆' : '';
            const rowClass = result.index === AppState.bestApiIndex && result.available ? 'table-success' : '';
            
            return `
                <tr class="${rowClass}">
                    <td>${rank}${bestBadge}</td>
                    <td>${CONFIG.apiList[result.index].name}</td>
                    <td>${responseTime}</td>
                    <td><small>${status}</small></td>
                    <td class="${gradeInfo.className}"><small>${gradeInfo.grade}</small></td>
                </tr>
            `;
        }).join('');

        const body = `
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
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <small class="text-muted">
                    <i class="fas fa-lightbulb"></i> 
                    智能解析会自动选择最快的接口。如果播放失败，系统会提供切换其他接口的选项。
                </small>
            </div>
        `;

        const { bsModal } = UI.createModal({
            title: '<i class="fas fa-tachometer-alt"></i> 详细测速结果',
            body: body,
            footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>'
        });

        bsModal.show();
    }

    // ==================== DPlayer 播放器 ====================
    async function tryDPlayerFirst(videoUrl, videoInfo) {
        try {
            if (typeof DPlayer === 'undefined') {
                console.warn('DPlayer 未加载，使用备用播放器');
                return false;
            }

            initializeDPlayer(videoUrl, videoInfo);
            bindDPlayerEvents(videoInfo);
            
            DOM.dplayerContainer.style.display = 'block';
            UI.toggle(DOM.iframeContainer, false);
            
            return true;
        } catch (error) {
            console.error('DPlayer 初始化失败:', error);
            return false;
        }
    }

    function initializeDPlayer(videoUrl, videoInfo) {
        if (AppState.dplayer) {
            AppState.dplayer.destroy();
        }

        AppState.dplayer = new DPlayer({
            container: DOM.dplayerContainer,
            video: {
                url: videoUrl,
                type: 'auto',
                customType: {
                    'customHls': function(video, player) {
                        if (window.Hls && Hls.isSupported()) {
                            const hls = new Hls();
                            hls.loadSource(video.src);
                            hls.attachMedia(video);
                        }
                    }
                }
            },
            autoplay: true,
            theme: '#2563eb',
            loop: false,
            lang: 'zh-cn',
            screenshot: true,
            hotkey: true,
            preload: 'auto',
            volume: 0.7
        });
    }

    function bindDPlayerEvents(videoInfo) {
        if (!AppState.dplayer) return;
        
        AppState.dplayer.on('loadstart', () => {
            UI.updateStatus('视频开始加载...', 'info');
        });
        
        AppState.dplayer.on('loadeddata', () => {
            UI.updateStatus('视频加载完成，可以播放', 'success');
        });
        
        AppState.dplayer.on('error', (e) => {
            console.error('DPlayer 播放错误:', e);
            UI.showNotification('播放失败，正在切换备用播放器...', 'error');
            fallbackToIframe(videoInfo);
        });
    }

    function fallbackToIframe(videoInfo) {
        DOM.dplayerContainer.style.display = 'none';
        UI.toggle(DOM.iframeContainer, true);
        DOM.videoPlayer.src = videoInfo.fullUrl;
    }

    function closeVideoPlayer() {
        if (AppState.dplayer) {
            AppState.dplayer.destroy();
            AppState.dplayer = null;
        }
        
        DOM.videoPlayer.src = '';
        UI.toggle(DOM.playerSection, false);
        
        // 移除重试容器
        const retryContainer = document.querySelector('.retry-container');
        if (retryContainer) {
            retryContainer.remove();
        }
    }

    // ==================== 重试机制 ====================
    function addRetryMechanism(url, platform) {
        const existingRetry = document.querySelector('.retry-container');
        if (existingRetry) existingRetry.remove();

        const retryContainer = document.createElement('div');
        retryContainer.className = 'text-center mt-3 retry-container';
        retryContainer.innerHTML = `
            <p class="text-muted mb-2">播放遇到问题？</p>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-primary" onclick="window.retryWithNextApi('${url}', '${platform}')">
                    <i class="fas fa-redo"></i> 切换接口重试
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.selectApi()">
                    <i class="fas fa-list"></i> 手动选择接口
                </button>
            </div>
        `;
        
        DOM.playerSection.querySelector('.container').appendChild(retryContainer);
    }

    // ==================== 历史记录管理 ====================
    function addToHistory(videoInfo) {
        const historyItem = {
            id: Utils.generateId(),
            url: videoInfo.originalUrl,
            platform: videoInfo.platform,
            apiName: videoInfo.apiName,
            timestamp: new Date().toISOString(),
            title: `${videoInfo.platform} 视频`
        };

        // 检查是否已存在相同的URL
        const existingIndex = AppState.videoHistory.findIndex(item => item.url === historyItem.url);
        if (existingIndex !== -1) {
            AppState.videoHistory.splice(existingIndex, 1);
        }

        // 添加到历史记录开头
        AppState.videoHistory.unshift(historyItem);

        // 限制历史记录数量
        if (AppState.videoHistory.length > CONFIG.storage.maxHistoryItems) {
            AppState.videoHistory = AppState.videoHistory.slice(0, CONFIG.storage.maxHistoryItems);
        }

        // 保存到本地存储
        Utils.storage.set(CONFIG.storage.keys.history, AppState.videoHistory);
    }

    function showVideoHistory() {
        const historyItems = AppState.videoHistory.map(item => `
            <div class="list-group-item history-item" style="cursor: pointer;" onclick="window.useHistoryItem('${item.url}', '${item.platform}')">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-1">
                            <span class="badge bg-primary history-platform me-2">${item.platform}</span>
                            <span class="badge bg-secondary me-2">${item.apiName}</span>
                            <small class="history-date">${Utils.formatRelativeTime(item.timestamp)}</small>
                        </div>
                        <div class="history-url small">${Utils.escapeHtml(item.url)}</div>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); window.removeHistoryItem('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const body = AppState.videoHistory.length === 0 ? 
            UI.emptyState('fa-inbox', '暂无解析历史记录') :
            `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">共 ${AppState.videoHistory.length} 条记录</small>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="window.clearVideoHistory()">
                        <i class="fas fa-trash"></i> 清空记录
                    </button>
                </div>
                <div class="list-group">${historyItems}</div>
            `;

        const { bsModal } = UI.createModal({
            title: '<i class="fas fa-history"></i> 解析历史记录',
            body: body,
            footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>'
        });

        bsModal.show();
    }

    // ==================== 收藏夹管理 ====================
    function showVideoFavorites() {
        const favoriteItems = AppState.videoFavorites.map(item => `
            <div class="list-group-item favorite-item" style="cursor: pointer;" onclick="window.useFavoriteItem('${item.url}', '${item.platform}')">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-1">
                            <span class="badge bg-warning history-platform me-2">${item.platform}</span>
                            <small class="history-date">${Utils.formatRelativeTime(item.timestamp)}</small>
                        </div>
                        <div class="history-url small">${Utils.escapeHtml(item.url)}</div>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); window.removeFavoriteItem('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const body = AppState.videoFavorites.length === 0 ? 
            UI.emptyState('fa-star-half-alt', '暂无收藏') :
            `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">共 ${AppState.videoFavorites.length} 条收藏</small>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="window.clearVideoFavorites()">
                        <i class="fas fa-trash"></i> 清空收藏
                    </button>
                </div>
                <div class="list-group">${favoriteItems}</div>
            `;

        const { bsModal } = UI.createModal({
            title: '<i class="fas fa-star"></i> 我的收藏',
            body: body,
            footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>'
        });

        bsModal.show();
    }

    function toggleFavorite() {
        const videoInfo = {
            id: Utils.generateId(),
            url: AppState.currentVideoUrl,
            platform: Utils.detectPlatform(AppState.currentVideoUrl),
            timestamp: new Date().toISOString()
        };

        const existingIndex = AppState.videoFavorites.findIndex(item => item.url === videoInfo.url);

        if (existingIndex !== -1) {
            AppState.videoFavorites.splice(existingIndex, 1);
            UI.showNotification('已取消收藏', 'info');
        } else {
            AppState.videoFavorites.unshift(videoInfo);
            UI.showNotification('已添加到收藏夹', 'success');
        }

        Utils.storage.set(CONFIG.storage.keys.favorites, AppState.videoFavorites);
        updateFavoriteButton();
    }

    function updateFavoriteButton() {
        const isFavorited = AppState.videoFavorites.some(item => item.url === AppState.currentVideoUrl);
        const icon = DOM.favoriteBtnPlayer.querySelector('i');
        const text = DOM.favoriteBtnPlayer.querySelector('span');

        if (isFavorited) {
            icon.className = 'fas fa-star';
            if (text) text.textContent = '已收藏';
            DOM.favoriteBtnPlayer.classList.add('active');
            DOM.favoriteBtnPlayer.title = '取消收藏';
        } else {
            icon.className = 'far fa-star';
            if (text) text.textContent = '收藏';
            DOM.favoriteBtnPlayer.classList.remove('active');
            DOM.favoriteBtnPlayer.title = '收藏此视频';
        }
    }

    // ==================== 接口列表 ====================
    function showApiList() {
        const apiItems = CONFIG.apiList.map((api, index) => {
            const isBest = index === AppState.bestApiIndex;
            const badge = isBest ? '<span class="badge bg-success ms-2">推荐</span>' : '';
            
            return `
                <div class="list-group-item ${isBest ? 'active' : ''}" style="cursor: pointer;" onclick="window.selectApi(${index})">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1">${api.name}${badge}</h6>
                        <small>${isBest ? '当前使用' : '点击选择'}</small>
                    </div>
                    <small class="text-muted">${api.url}</small>
                </div>
            `;
        }).join('');

        const body = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> 
                共有 ${CONFIG.apiList.length} 个解析接口可用。点击接口可手动选择使用。
            </div>
            <div class="list-group">${apiItems}</div>
        `;

        const { bsModal } = UI.createModal({
            title: '<i class="fas fa-list"></i> 解析接口列表',
            body: body,
            footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>'
        });

        bsModal.show();
    }

    // ==================== 帮助信息 ====================
    function showHelpModal() {
        const body = `
            <div class="help-content">
                <h6><i class="fas fa-question-circle text-primary"></i> 如何使用？</h6>
                <ol>
                    <li>从视频网站复制您想要观看的VIP视频链接</li>
                    <li>将链接粘贴到上方的输入框中</li>
                    <li>点击"智能解析"按钮或按 <kbd>Ctrl+Enter</kbd></li>
                    <li>等待解析完成后，即可免费观看视频内容</li>
                </ol>

                <h6 class="mt-4"><i class="fas fa-keyboard text-success"></i> 键盘快捷键</h6>
                <ul>
                    <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - 快速解析视频</li>
                    <li><kbd>Esc</kbd> - 关闭播放器</li>
                </ul>

                <h6 class="mt-4"><i class="fas fa-lightbulb text-warning"></i> 使用技巧</h6>
                <ul>
                    <li>系统会自动测速并选择最快的解析接口</li>
                    <li>如果播放失败，可以尝试切换其他接口</li>
                    <li>支持的平台：爱奇艺、腾讯视频、优酷、芒果TV等</li>
                    <li>历史记录和收藏会自动保存在本地</li>
                    <li>支持明暗主题切换，保护您的眼睛</li>
                </ul>

                <h6 class="mt-4"><i class="fas fa-exclamation-triangle text-danger"></i> 常见问题</h6>
                <dl>
                    <dt>Q: 为什么有些视频无法播放？</dt>
                    <dd>A: 可能是接口暂时不可用，请尝试切换其他接口或稍后再试。</dd>
                    
                    <dt>Q: 解析速度慢怎么办？</dt>
                    <dd>A: 系统会自动选择最快的接口。您也可以点击"详细测速"查看各接口速度。</dd>
                    
                    <dt>Q: 支持哪些视频平台？</dt>
                    <dd>A: 支持爱奇艺、腾讯视频、优酷、芒果TV、搜狐视频、哔哩哔哩、1905电影网、PPTV等主流平台。</dd>
                </dl>

                <div class="alert alert-warning mt-4">
                    <i class="fas fa-info-circle"></i> 
                    <strong>免责声明：</strong>本工具仅供学习交流使用，请勿用于商业用途。
                </div>
            </div>
        `;

        const { bsModal } = UI.createModal({
            title: '<i class="fas fa-question-circle"></i> 使用帮助',
            body: body,
            footer: '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">我知道了</button>'
        });

        bsModal.show();
    }

    // ==================== 全局函数（供 HTML onclick 调用）====================
    window.useHistoryItem = function(url, platform) {
        DOM.videoUrlInput.value = url;
        UI.showNotification(`已加载历史记录：${platform} 视频`, 'info');
        
        // 关闭模态框
        const modal = document.querySelector('.modal.show');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        
        // 自动解析
        parseVideo();
    };

    window.removeHistoryItem = function(id) {
        AppState.videoHistory = AppState.videoHistory.filter(item => item.id !== id);
        Utils.storage.set(CONFIG.storage.keys.history, AppState.videoHistory);
        
        // 刷新显示
        const modal = document.querySelector('.modal.show');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        showVideoHistory();
    };

    window.clearVideoHistory = async function() {
        const confirmed = await UI.confirm('确定要清空所有历史记录吗？', '清空历史记录');
        if (confirmed) {
            AppState.videoHistory = [];
            Utils.storage.remove(CONFIG.storage.keys.history);
            UI.showNotification('历史记录已清空', 'success');
            
            // 刷新显示
            const modal = document.querySelector('.modal.show');
            if (modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
            showVideoHistory();
        }
    };

    window.useFavoriteItem = function(url, platform) {
        DOM.videoUrlInput.value = url;
        UI.showNotification(`已加载收藏：${platform} 视频`, 'info');
        
        // 关闭模态框
        const modal = document.querySelector('.modal.show');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        
        // 自动解析
        parseVideo();
    };

    window.removeFavoriteItem = function(id) {
        AppState.videoFavorites = AppState.videoFavorites.filter(item => item.id !== id);
        Utils.storage.set(CONFIG.storage.keys.favorites, AppState.videoFavorites);
        
        // 刷新显示
        const modal = document.querySelector('.modal.show');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        showVideoFavorites();
    };

    window.clearVideoFavorites = async function() {
        const confirmed = await UI.confirm('确定要清空所有收藏吗？', '清空收藏');
        if (confirmed) {
            AppState.videoFavorites = [];
            Utils.storage.remove(CONFIG.storage.keys.favorites);
            UI.showNotification('收藏已清空', 'success');
            
            // 刷新显示
            const modal = document.querySelector('.modal.show');
            if (modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
            showVideoFavorites();
        }
    };

    window.retryWithNextApi = async function(url, platform) {
        AppState.bestApiIndex = (AppState.bestApiIndex + 1) % CONFIG.apiList.length;
        const api = CONFIG.apiList[AppState.bestApiIndex];
        
        UI.showNotification(`正在使用 ${api.name} 重试...`, 'info');
        
        const fullVideoUrl = api.url + encodeURIComponent(url);
        const videoInfo = {
            platform: platform,
            apiName: api.name,
            originalUrl: url,
            fullUrl: fullVideoUrl
        };
        
        DOM.apiNameBadge.textContent = api.name;
        
        const dplayerSuccess = await tryDPlayerFirst(fullVideoUrl, videoInfo);
        if (!dplayerSuccess) {
            fallbackToIframe(videoInfo);
        }
    };

    window.selectApi = function(index) {
        if (index !== undefined) {
            AppState.bestApiIndex = index;
            const url = DOM.videoUrlInput.value.trim();
            
            if (url) {
                // 关闭模态框
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    bootstrap.Modal.getInstance(modal).hide();
                }
                
                // 使用选中的接口解析
                parseVideo();
            }
        } else {
            // 显示接口列表供选择
            showApiList();
        }
    };

    // ==================== 启动应用 ====================
    initialize();
});
