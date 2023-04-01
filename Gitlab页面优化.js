// ==UserScript==
// @name         Gitlab页面优化
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  优化Gitlab页面展示内容
// @author       Haifennj
// @match        http://192.168.0.22/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js
// @resource     bootstrapCSS https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    let css = `
        .nav.navbar-nav li.user-counter.dropdown {
            width: 105px;
        }
        .header-search {
            width: 266px;
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
    GM_addStyle(css);

    // $("head").append($(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">`));
    // //加载外部CSS，资源已在上方resource中
    // var newCSS = GM_getResourceText ("bootstrapCSS");
    // GM_addStyle (newCSS);

    var path = window.location.href;
    var isListPage = path.indexOf("dashboard/merge_requests") > -1;
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

    // 15秒定时刷新页面
    var totalCount = 0;
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



    // Merge Request页面，链接添加target标签
    if (path.indexOf("dashboard/merge_requests") > -1) {
        document.querySelectorAll('span[class="merge-request-title-text js-onboarding-mr-item"]').forEach(linkTag => {
            var href = linkTag.children[0].getAttribute("href");
            linkTag.children[0].setAttribute("href", "#");
            linkTag.children[0].setAttribute("onclick", "javascript:window.open('" + href + "')");
        })
    }
    // 待办页面，链接添加target标签
    if (path.indexOf("dashboard/todos") > -1) {
        document.querySelectorAll('span[class="title-item todo-label todo-target-link"]').forEach(linkTag => {
            var href = linkTag.children[0].getAttribute("href");
            linkTag.children[0].setAttribute("href", "#");
            linkTag.children[0].setAttribute("onclick", "javascript:window.open('" + href + "')");
        })
    }

    // 优化Merge Request页面，添加两个链接
    try {
        merge_requests.find(".dashboard-shortcuts-merge_requests").hide();
        links.each(function () {
            var newLink = $(this);
            newLink.attr("target", "_self");
            newLink.css({ "height": "17px", "padding": "0 2px", "margin": "2px 2px 1px" });
            merge_requests.append(newLink);
        });
        merge_requests.find(".dashboard-shortcuts-merge_requests").remove();
    } catch (error) {
        console.log(error)
    }

    // 15分钟后检测是已经合并页面，关闭页面
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
    }, 5 * 60 * 1000);

    try {
        function sendNotification() {
            new Notification("通知标题：", {
                body: '通知内容',
                icon: 'https://pic1.zhuanstatic.com/zhuanzh/50b6ffe4-c7e3-4317-bc59-b2ec4931f325.png'
            })
        }
        if (window.Notification.permission == "granted") { // 判断是否有权限
            sendNotification();
        } else if (window.Notification.permission != "denied") {
            window.Notification.requestPermission(function (permission) { // 没有权限发起请求
                sendNotification();
            });
        }
    } catch (error) {

    }

    // 常用仓库列表
    var repos = [
        {
            name: "open/aws",
            link: "/open/aws",
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
            name: "vue-aws/awsui",
            link: "/vue-aws/awsui",
            class: "vue",
        },
        {
            name: "vue-apps/yijingcloud",
            link: "/vue-apps/yijingcloud",
            class: "vue-apps",
        }
    ];
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

})();
