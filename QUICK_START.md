# 🚀 快速开始指南

欢迎使用 Free-VIP-Video-Unlock 优化版！本指南将帮助你快速上手。

## 📦 项目结构

```
Free-VIP-Video-Unlock/
├── index.html              # 主页面（优化版）
├── index-original.html     # 原始版本（备份）
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── config.js          # ✨ 配置模块
│   ├── utils.js           # ✨ 工具函数库
│   ├── ui.js              # ✨ UI交互模块
│   ├── script.js          # ✨ 优化后的主脚本
│   └── script-original.js # 原始脚本（备份）
├── images/                # Logo和图标
├── README.md              # 项目说明
├── QUICK_START.md         # 快速开始指南
└── LICENSE                # MIT许可证
```

## 🎯 使用方法

### 方法一：直接打开（推荐）

1. 下载或克隆项目到本地
2. 用浏览器打开 `index.html`
3. 开始使用！

### 方法二：本地服务器

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

### 方法三：部署到服务器

将所有文件上传到你的Web服务器，确保：
- 所有文件路径正确
- 服务器支持静态文件访问
- 配置正确的MIME类型

## 💡 基本使用

### 1. 解析视频

1. 从视频网站复制VIP视频链接
2. 粘贴到输入框
3. 点击"智能解析"或按 `Ctrl+Enter`
4. 等待解析完成，开始观看

### 2. 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Enter` / `Cmd+Enter` | 快速解析视频 |
| `Esc` | 关闭播放器 |

### 3. 功能按钮

- **详细测速** - 测试所有接口速度，查看详细报告
- **接口列表** - 查看所有可用接口，手动选择
- **历史记录** - 查看最近解析的视频（最多50条）
- **我的收藏** - 管理收藏的视频链接
- **使用帮助** - 查看详细的使用说明

### 4. 主题切换

点击右上角的月亮/太阳图标，在明亮和黑暗主题之间切换。

## 🔧 自定义配置

### 修改解析接口

编辑 `js/config.js` 文件：

```javascript
const CONFIG = {
    apiList: [
        { name: "你的接口名称", url: "https://your-api.com/?url=" },
        // 添加更多接口...
    ],
    // ...
};
```

### 添加视频平台

在 `js/config.js` 中添加平台：

```javascript
platforms: {
    'your-platform.com': '平台名称',
    // ...
}
```

### 调整性能参数

```javascript
speedTest: {
    timeout: 8000,          // 测试超时时间(ms)
    delayAfterLoad: 500,    // 加载后延迟(ms)
    maxRetries: 3           // 最大重试次数
}
```

### 修改存储限制

```javascript
storage: {
    maxHistoryItems: 50,    // 最大历史记录数
    maxFavorites: 100,      // 最大收藏数
}
```

## 🎨 自定义样式

编辑 `css/style.css` 文件来自定义外观：

```css
/* 修改主题色 */
:root {
    --primary-color: #2563eb;  /* 主色调 */
    --secondary-color: #1e40af; /* 次要色 */
    /* ... */
}

/* 黑暗模式 */
[data-theme="dark"] {
    --bg-color: #0f172a;
    --text-color: #f1f5f9;
    /* ... */
}
```

## 📱 移动端优化

项目已针对移动设备进行优化：

- 响应式设计，自动适配屏幕尺寸
- 触摸优化，防止双击缩放
- 移动端专用样式
- iOS和Android特殊适配

## 🔍 调试技巧

### 查看控制台日志

按 `F12` 打开浏览器开发者工具，查看：
- 错误信息
- 网络请求
- 性能指标

### 清除缓存

如果遇到问题，尝试：
1. 清除浏览器缓存
2. 硬刷新页面（`Ctrl+F5` / `Cmd+Shift+R`）
3. 清除本地存储（开发者工具 → Application → Local Storage）

### 测试接口

使用"详细测速"功能查看：
- 哪些接口可用
- 各接口的响应时间
- 推荐使用的接口

## 🐛 常见问题

### Q: 视频无法播放？
A: 尝试以下方法：
1. 点击"切换接口重试"
2. 手动选择其他接口
3. 检查网络连接
4. 确认视频链接有效

### Q: 解析速度慢？
A: 
1. 使用"详细测速"查看最快接口
2. 系统会自动缓存最快接口
3. 检查网络速度

### Q: 历史记录丢失？
A: 
- 历史记录保存在浏览器本地存储
- 清除浏览器数据会丢失记录
- 建议定期导出重要链接

### Q: 某些功能不可用？
A: 
- 确保使用现代浏览器
- 某些功能需要用户授权（如剪贴板）
- 检查浏览器控制台错误信息

## 🔐 隐私说明

- 所有数据保存在本地浏览器
- 不会上传任何个人信息
- 不使用Cookie追踪
- 完全开源，代码透明

## 📊 性能优化建议

### 1. 使用最新浏览器
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 2. 启用硬件加速
在浏览器设置中启用硬件加速，提升视频播放性能。

### 3. 关闭不必要的扩展
某些浏览器扩展可能影响性能。

### 4. 定期清理缓存
保持浏览器缓存清洁，提升加载速度。

## 🌟 高级功能

### 批量解析（即将推出）
```javascript
// 未来版本将支持
const urls = [
    'https://video1.com/...',
    'https://video2.com/...',
];
parseBatchVideos(urls);
```

### 播放进度记忆（即将推出）
自动记住上次播放位置，下次继续观看。

### PWA支持（即将推出）
安装到桌面，离线使用。

## 🤝 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)（如果有）

### 开发流程
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- 使用有意义的变量名
- 添加必要的注释
- 遵循现有代码风格
- 测试你的更改

## 📞 获取帮助

- 查看 [README.md](README.md)
- 阅读 [OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md)
- 提交 [GitHub Issues](https://github.com/zhikanyeye/Free-VIP-Video-Unlock/issues)
- 查看 [FAQ](README.md#常见问题)

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## ⚠️ 免责声明

本工具仅供学习交流使用，请勿用于商业用途。使用本工具时请遵守相关法律法规。

---

**祝你使用愉快！** 🎉

如有问题或建议，欢迎反馈！
