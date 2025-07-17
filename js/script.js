$(document).ready(function() {
    // 解析播放按钮点击事件
    $("#play-btn").click(function() {
        play();
    });

    // 回车键播放
    $("#url").keydown(function(e) {
        if (e.keyCode === 13) {
            play();
        }
    });

    // 返回顶部按钮
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });
    
    $('#back-to-top').click(function() {
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });
    
    // 自动填充视频地址（如果存在）
    var url = getQueryVariable('url');
    if (url) {
        $("#url").val(decodeURIComponent(url));
        play();
    }
});

// 获取URL参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}

// 播放视频函数
function play() {
    var url = $("#url").val();
    if (url == "") {
        alert("请输入视频链接!");
        return;
    }
    
    // 检查URL格式
    if (url.indexOf("http") === -1) {
        url = "https://" + url;
    }
    
    var jxApi = $("#jk").val();
    var finalUrl = jxApi + url;
    
    // 更新播放器
    $("#player").attr("src", finalUrl);
    
    // 更新标题
    var videoTitle = getVideoTitle(url);
    $("#tittext").html(videoTitle);
    
    // 更新历史记录，方便分享
    window.history.pushState({}, 0, window.location.pathname + "?url=" + encodeURIComponent(url));
}

// 尝试提取视频标题
function getVideoTitle(url) {
    var title = "正在播放视频，请稍候...";
    
    // 从URL中提取可能的标题信息
    try {
        var domain = new URL(url).hostname;
        if (domain.indexOf("iqiyi.com") !== -1) {
            title = "爱奇艺视频";
        } else if (domain.indexOf("qq.com") !== -1) {
            title = "腾讯视频";
        } else if (domain.indexOf("youku.com") !== -1) {
            title = "优酷视频";
        } else if (domain.indexOf("mgtv.com") !== -1) {
            title = "芒果视频";
        } else if (domain.indexOf("bilibili.com") !== -1) {
            title = "哔哩哔哩视频";
        } else if (domain.indexOf("le.com") !== -1) {
            title = "乐视视频";
        } else {
            title = "正在播放: " + domain;
        }
    } catch (e) {
        console.log("提取标题失败", e);
    }
    
    return title;
}
