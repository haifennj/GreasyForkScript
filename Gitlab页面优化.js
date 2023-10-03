// ==UserScript==
// @name         Gitlab页面优化
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  优化Gitlab页面展示内容
// @author       Haifennj
// @match        http://192.168.0.22/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js
// @require      https://unpkg.com/@wcjiang/notify/dist/notify.min.js
// @resource     bootstrapCSS https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==

(function () {
    'use strict';

    let css = `
        .nav.navbar-nav li.user-counter.dropdown {
            width: 106px;
        }
        .header-search {
            width: 265px;
        }
        .title-container > ul {
            max-height:40px;
            overflow:auto;
        }
        .title-container > ul::-webkit-scrollbar {
            width: 6px;
            background-color: #2261a1;
        }
        .title-container > ul:hover ::-webkit-scrollbar-track-piece {
            /*鼠标移动上去再显示滚动条*/
             background-color: #2261a1;
             /* 滚动条的背景颜色 */
             border-radius: 6px;
             /* 滚动条的圆角宽度 */
        }
        .title-container > ul:hover::-webkit-scrollbar-thumb:hover {
            background-color: #c0cecc;
        }

        .title-container > ul:hover::-webkit-scrollbar-thumb:vertical {
            background-color: #c0cedc;
            border-radius: 6px;
        }
        a.nav-link.custom-link {
            height: 16px !important;
            margin: 2px 3px 0 0 !important;
        }
        /*流水线页面样式优化*/
        .gl-text-truncate {
            overflow: hidden;
            text-overflow: initial;
            white-space: initial;
        }
        /*仓库列表页面优化*/
        #last-commit {
            width: 300px;
        }
        #last-update {
            width: 180px;
        }
        .container-limited.limit-container-width {
            max-width: 1280px;
        }
        .open {
            background:#A3E4D770;
        }
        .apps {
            background:#BB8FCE70;
        }
        .security {
            background:#F1948A70;
        }
        .vue {
            background:#F8C47170;
        }
        .vue-apps {
            background:#D3540070;
        }
    `
    try {
        GM_addStyle(css);
    } catch (error) {
        let el = document.createElement('style')
        el.type = 'text/css'
        el.innerText = css
        document.head.appendChild(el);
    }

    var userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent)
    var isMobile = !!userAgent.match(/(mobile)/i);
    var isPC = !isMobile;
    var isiPad = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    var path = window.location.href;
    var isListPage = path.indexOf("dashboard/merge_requests") > -1;
    if (path.indexOf("state=merged") > -1 || path.indexOf("state=closed") > -1 || path.indexOf("state=all") > -1) {
        isListPage = false;
    }
    var isTodoPage = path.indexOf("dashboard/todos") > -1;
    var isMRPage = path.indexOf("-/merge_requests") > -1;
    var isCommits = path.indexOf("/commits") > -1;
    var isDiffs = path.indexOf("/diffs") > -1;

    // 列表页面，如果请求为0，则3s刷新页面一次
    // if (isListPage || isTodoPage) {
    //     var mrListUrl = "/api/v4/merge_requests?scope=assigned_to_me&state=opened";
    //     $.get(mrListUrl, function (data) {
    //         if (data.length == 0) {
    //             setTimeout(function () {
    //                 window.location.reload();
    //             }, 3 * 1000);
    //         }
    //     });
    // }

    var navbarNav = $(".navbar-nav");
    var merge_requests = navbarNav.find(".user-counter.dropdown");
    var links = merge_requests.find(".dropdown-menu").find("a");

    var mrCount = new Number(merge_requests.find(".js-merge-requests-count").text())
    var newTitle = "";
    var oldTitle = document.title;
    if (isListPage && mrCount > 0) {
        newTitle = mrCount + "个合并请求待处理";
        document.title = newTitle;
        try {
            GM_notification({
                text: newTitle,
                title: "合并请求",
                image:"http://192.168.0.22/assets/gitlab_logo-7ae504fe4f68fdebb3c2034e36621930cd36ea87924c11ff65dbcb8ed50dca58.png",
            });
        } catch (error) {
        }
        try {
            var notify = new Notify({
                //message: '有消息了。',//标题
                effect: 'flash', // flash | scroll 闪烁还是滚动
                //可选播放声音
                // audio:{
                //     //可以使用数组传多种格式的声音文件
                //     file: ['msg.mp4','msg.mp3','msg.wav']
                //     //下面也是可以的哦
                //     //file: 'msg.mp4'
                // },
                //标题闪烁，或者滚动速度
                // interval: 500,
                //可选，默认绿底白字的  Favicon
                updateFavicon:{
                    // favicon 字体颜色
                    textColor: "#fff",
                    //背景颜色，设置背景颜色透明，将值设置为“transparent”
                    backgroundColor: "#fc6d26"
                }
            });
            notify.setFavicon(mrCount).player();
            notify.setTitle(true);
            notify.setTitle(newTitle);

            var time = 0;
            setInterval(()=>{
                if (time % 2 == 0) {
                    notify.setTitle();
                    notify.setTitle(oldTitle);
                } else {
                    notify.setTitle();
                    notify.setTitle(newTitle);
                }
                time++;
            }, 500);
        } catch (error) {
        }
    } else {
        document.title = oldTitle;
    }


    // ************************************************************ //
    // 15秒定时刷新页面
    var totalCount = 0;
    if (isPC && !isiPad) {
        if (isListPage) {
            var assigneeLink = $(links[0]);
            var count = new Number(assigneeLink.find("span").text());
            totalCount += count;
            if (count > 0) {
                setTimeout(function () {
                    window.location.href = assigneeLink.attr("href");
                }, 15 * 1000);
            } else {
                var reviewerLink = $(links[1]);
                count = new Number(reviewerLink.find("span").text());
                totalCount += count;
                if (count > 0) {
                    setTimeout(function () {
                        window.location.href = reviewerLink.attr("href");
                    }, 15 * 1000);
                }
                if (totalCount == 0) {
                    setTimeout(function () {
                        window.location.href = assigneeLink.attr("href");
                    }, 3 * 1000);
                }
            }
        }
    }


    // ************************************************************ //
    // Merge Request页面，链接添加target标签
    if (isListPage && !isMobile) {
        document.querySelectorAll('span[class="merge-request-title-text js-onboarding-mr-item"]').forEach(linkTag => {
            var href = linkTag.children[0].getAttribute("href");
            linkTag.children[0].setAttribute("href", "#");
            linkTag.children[0].setAttribute("onclick", "javascript:window.open('" + href + "','" + href + "')");
        })
    }
    // 待办页面，链接添加target标签
    if (isTodoPage && !isMobile) {
        document.querySelectorAll('span[class="title-item todo-label todo-target-link"]').forEach(linkTag => {
            var href = linkTag.children[0].getAttribute("href");
            linkTag.children[0].setAttribute("href", "#");
            linkTag.children[0].setAttribute("onclick", "javascript:window.open('" + href + "','" + href + "')");
        })
    }

    // ************************************************************ //
    // 优化Merge Request页面，添加两个链接
    if (isPC && !isiPad) {
        merge_requests.find(".dashboard-shortcuts-merge_requests").hide();
        links.each(function () {
            var newLink = $(this);
            newLink.attr("target", "_self");
            newLink.css({ "height": "17px", "padding": "0 2px", "margin": "2px 2px 1px" });
            merge_requests.append(newLink);
        });
        merge_requests.find(".dashboard-shortcuts-merge_requests").remove();
    } else {
        var logo;
        if (isMobile) {
            logo = $("header").find(".title-container").find("h1");
        }
        if (isiPad) {
            logo = $("header").find(".title-container").find(".navbar-sub-nav")
        }
        var ul = $('<ul class="nav navbar-nav"></ul>');
        merge_requests.find(".dashboard-shortcuts-merge_requests").hide();
        links.each(function () {
            var newLink = $(this);
            newLink.attr("target", "_self");
            newLink.attr("class", "shortcuts-todos js-prefetch-document");
            newLink.css({ "padding": "0 4px", "margin-left": "5px" });
            var li = $('<li class="user-counter active"></li>');
            li.append(newLink);
            ul.append(li);
        });
        logo.append(ul);
    }

    // ************************************************************ //
    // 15分钟后检测是已经合并页面，关闭页面
    var delayCloseTime = 5 * 60 * 1000;
    if (isMobile || isiPad) {
        delayCloseTime = 3000;
    }
    setTimeout(function () {
        var totalCount = 0;
        if (isMRPage) {
            var apiHead = "/api/v4/projects/";
            var projectId = "";
            var mrId = 0;
            var mrUrl = "";
            var tmp = path.split("/-/");

            projectId = tmp[0].replace(location.origin + "/", "");
            projectId = projectId.replace("/", "%2F");
            //vue-aws%2Fawsui/merge_requests/168
            mrUrl = apiHead + projectId + "/" + tmp[1];
            // 检测是否有已经合并的标记
            $.get(mrUrl, function (data) {
                if (data.state == "merged" && $(".notes-tab.active").length > 0) {
                    window.opener = null;
                    window.open('', '_self');
                    window.close();
                }
            });
        }
    }, delayCloseTime);

    // ************************************************************ //
    // 常用仓库列表
    var repos = [
        {
            name: "open/aws",
            link: "/open/aws",
            class: "open",
        },
        {
            name: "open/aws流水线",
            link: "/open/aws/-/pipelines",
            class: "open",
        },
        {
            name: "open/web",
            link: "/open/web",
            class: "open",
        },
        {
            name: "open/release",
            link: "/open/release",
            class: "open",
        },
        {
            name: "apps/bpms",
            link: "/apps/bpms",
            class: "apps",
        },
        {
            name: "apps/basic-service",
            link: "/apps/basic-service",
            class: "apps",
        },
        {
            name: "apps/office",
            link: "/apps/office",
            class: "apps",
        },
        {
            name: "apps/yijingcloud",
            link: "/apps/yijingcloud",
            class: "apps",
        },
        {
            name: "security/engine",
            link: "/security/aws-bpmn-engine",
            class: "security",
        },
        {
            name: "security/core",
            link: "/security/aws-infrastructure-core",
            class: "security",
        },
        {
            name: "vue-aws/aws",
            link: "/vue-aws/aws",
            class: "vue",
        },
        {
            name: "vue-aws/aws流水线",
            link: "/vue-aws/aws/-/pipelines",
            class: "vue",
        },
        {
            name: "vue-aws/awsui",
            link: "/vue-aws/awsui",
            class: "vue",
        },
        {
            name: "vue-aws/awsui流水线",
            link: "/vue-aws/awsui/-/pipelines",
            class: "vue",
        }
    ];
    if (isPC && !isiPad) {
        var titleContainer = $(".title-container");
        var ul = $("<ul class='nav navbar-sub-nav'></ul>");
        titleContainer.append(ul);
        repos.forEach(element => {
            var li = $("<li class='nav-item'></li>");
            var a = $("<a></a>");
            a.text(element.name);
            a.attr("target", "_blank");
            a.attr("href", element.link);
            a.attr("class", "nav-link custom-link " + element.class);
            li.append(a);
            ul.append(li);
        });
    }

})();
