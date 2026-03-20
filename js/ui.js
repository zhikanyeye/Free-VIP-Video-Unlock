// UI 交互模块 - 处理所有UI相关的操作

const UI = {
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 类型: success, error, warning, info
     * @param {number} duration - 显示时长(ms)
     */
    showNotification(message, type = 'info', duration = CONFIG.notification.duration) {
        const notification = document.createElement('div');
        const alertType = type === 'error' ? 'danger' : type;
        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.className = `alert alert-${alertType} alert-dismissible fade show notification`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <i class="fas ${icons[alertType]} me-2"></i>
            <span>${Utils.escapeHtml(message)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    /**
     * 更新状态显示
     * @param {string} message - 状态消息
     * @param {string} type - 类型: success, error, warning, info
     */
    updateStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        const statusInfo = document.getElementById('statusInfo');
        
        if (!statusText || !statusInfo) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        statusText.innerHTML = `<i class="fas ${icons[type]} me-2"></i>${Utils.escapeHtml(message)}`;
        statusInfo.className = `status-info mt-4 show`;
        
        const alertClass = type === 'error' ? 'alert-danger' : `alert-${type}`;
        const alert = statusInfo.querySelector('.alert');
        if (alert) {
            alert.className = `alert ${alertClass} d-inline-block`;
        }
    },

    /**
     * 创建模态框
     * @param {Object} options - 模态框配置
     * @returns {Object} {modal: Element, bsModal: Bootstrap.Modal}
     */
    createModal({ title, body, footer = '', size = 'lg', onHidden = null }) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-${size}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${body}</div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);

        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
            if (onHidden) onHidden();
        });

        return { modal, bsModal };
    },

    /**
     * 显示加载状态
     * @param {HTMLElement} button - 按钮元素
     * @param {boolean} loading - 是否加载中
     * @param {string} loadingText - 加载中的文本
     * @param {string} normalText - 正常状态的文本
     */
    setButtonLoading(button, loading, loadingText = '加载中...', normalText = '') {
        if (!button) return;

        if (loading) {
            button.dataset.originalHtml = button.innerHTML;
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
            button.disabled = true;
        } else {
            button.innerHTML = normalText || button.dataset.originalHtml || normalText;
            button.disabled = false;
            delete button.dataset.originalHtml;
        }
    },

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @param {string} title - 标题
     * @returns {Promise<boolean>}
     */
    async confirm(message, title = '确认操作') {
        return new Promise((resolve) => {
            const { modal, bsModal } = this.createModal({
                title: `<i class="fas fa-question-circle text-warning me-2"></i>${title}`,
                body: `<p class="mb-0">${Utils.escapeHtml(message)}</p>`,
                footer: `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="confirmBtn">确定</button>
                `,
                size: 'md'
            });

            modal.querySelector('#confirmBtn').addEventListener('click', () => {
                bsModal.hide();
                resolve(true);
            });

            modal.addEventListener('hidden.bs.modal', () => {
                resolve(false);
            });

            bsModal.show();
        });
    },

    /**
     * 显示空状态
     * @param {string} icon - 图标类名
     * @param {string} message - 提示消息
     * @returns {string} HTML字符串
     */
    emptyState(icon = 'fa-inbox', message = '暂无数据') {
        return `
            <div class="text-center py-5">
                <i class="fas ${icon} fa-3x text-muted mb-3"></i>
                <p class="text-muted">${Utils.escapeHtml(message)}</p>
            </div>
        `;
    },

    /**
     * 平滑滚动到元素
     * @param {HTMLElement|string} element - 元素或选择器
     * @param {Object} options - 滚动选项
     */
    scrollTo(element, options = { behavior: 'smooth', block: 'start' }) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.scrollIntoView(options);
        }
    },

    /**
     * 切换元素显示/隐藏
     * @param {HTMLElement} element - 元素
     * @param {boolean} show - 是否显示
     */
    toggle(element, show) {
        if (!element) return;
        
        if (show) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    },

    /**
     * 添加加载动画
     * @param {HTMLElement} container - 容器元素
     * @returns {HTMLElement} 加载元素
     */
    showLoading(container) {
        const loading = document.createElement('div');
        loading.className = 'text-center py-5';
        loading.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-3 text-muted">加载中，请稍候...</p>
        `;
        container.appendChild(loading);
        return loading;
    },

    /**
     * 移除加载动画
     * @param {HTMLElement} loading - 加载元素
     */
    hideLoading(loading) {
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    },

    /**
     * 高亮显示文本
     * @param {string} text - 原文本
     * @param {string} keyword - 关键词
     * @returns {string} 高亮后的HTML
     */
    highlightText(text, keyword) {
        if (!keyword) return Utils.escapeHtml(text);
        
        const escapedText = Utils.escapeHtml(text);
        const escapedKeyword = Utils.escapeHtml(keyword);
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');
        
        return escapedText.replace(regex, '<mark>$1</mark>');
    },

    /**
     * 创建进度条
     * @param {number} percent - 百分比 (0-100)
     * @param {string} type - 类型: success, info, warning, danger
     * @returns {string} HTML字符串
     */
    progressBar(percent, type = 'primary') {
        const safePercent = Math.max(0, Math.min(100, percent));
        return `
            <div class="progress">
                <div class="progress-bar bg-${type}" role="progressbar" 
                     style="width: ${safePercent}%" 
                     aria-valuenow="${safePercent}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    ${safePercent}%
                </div>
            </div>
        `;
    }
};

// 冻结UI对象
Object.freeze(UI);
