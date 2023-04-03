// ==UserScript==
// @name         禅道页面优化
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  禅道页面优化1
// @author       You
// @match        http://111.200.241.83:3383/zentao/*
// @match        http://192.168.0.35:81/zentao/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    let css = `
        .page-title {
            display: flex;
            height: 50px;
            line-height: 50px;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
        }
        .page-title .label.label-id {
            display: inline-block;
            min-width: 30px;
            padding: 0 5px;
            font-size: 36px;
            font-weight: bold;
            line-height: 38px;
            color: red;
            text-align: center;
            vertical-align: middle;
            background-color: #fff;
            border: 1px solid red;
            border-radius: 2px;
        }
        .page-title .text {
            margin-left: 10px;
            font-size: 20px;
            line-height: 38px;
        }

        .main-actions-fixed #mainContent .main-col>.main-actions {
            position: static;
            margin-top: -44px;
            bottom: initial !important;
            padding: 0 0 0 0;
            text-align: center;
        }
        #mainMenu .btn-toolbar:last {
            display: inline-block;
            padding: 4px 15px;
            color: #fff;
            pointer-events: auto;
            background: #717171;
            background-color: rgba(90,90,90,.85);
            border-radius: 4px;
        }

        .text-center.form-actions .label {
            line-height: 24px;
            padding: 0 20px 0 8px;
            display: inline-block;
            background-color: #EEEEEE;
            color: #A6AAB8;
            border-radius: 12px;
            max-width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            position: relative;
        }

        .text-center.form-actions ul,.text-center.form-actions li{
            list-style-type: none;
            display: flex;
        }
    `
    GM_addStyle(css);
    /*
        // 定向
        let url = window.location.href;
        if (url.indexOf("zentao/my/")>-1) {
            url = url.replace("zentao/my/","zentao/bug-browse.html");
            //window.location.replace(url);
        }
        if ($ == undefined) {
            return;
        }
    
        let back = $("#back");
        if (back.length>0) {
            let toolbarHtml = back.parent()[0].outerHTML;
            //back.parent().hide();
    
            // 原来带有返回和标题的工具条
            let mainMenu = $("#mainMenu");
            let pageTitle = mainMenu.find(".page-title");
            let pageTitleHtml = pageTitle[0].outerHTML;
            // 将返回和标题部分删除
            mainMenu.find("div[class='btn-toolbar pull-left']").remove();
    
            let navbar = $("#navbar");
            // "我的"，"Bug"页签
            navbar.find("ul[class='nav nav-default']").remove();
            navbar.append(pageTitle);
    
            //mainMenu.append(toolbarHtml);
    
            $("#mainContent").find(".main-actions").insertBefore($("#mainContent").find(".cell:first"));
    
            $("#poweredBy").hide();
        }*/

    //添加固定指派人员，有需要可以自行修改数组。

    let teamMember = ["wangzw", "zhangxl", "zhaok", "chenzt", "lishan", "zhaof", "lixs", "xias", "haozy", "lifq", "mahuilin", "fulp", "chengxg"];
    if (typeof (page) != 'undefined' && page == 'assignedto') {
        var lastTd = $("#assignedTo").parent().next();
        for (const key in teamMember) {
            const element = teamMember[key];
            var assignedObj = {};
            $('#assignedTo').find("option").each(function () {
                assignedObj[$(this).attr("value")] = $(this).text();
            });
            var eachUser = $("<a href='#' style='padding-right:5px;' user='" + element + "'>" + assignedObj[element] + "</a> ");
            eachUser.on("click", function () {
                var span = $(this);
                //var assignedTo = .data('zui.picker');
                $('#assignedTo').val(span.attr("user"));
                $('#assignedTo').trigger('chosen:updated');
            });
            $(lastTd).append(eachUser);
        }
    }

    // 添加快速查询条件
    if (window.flow != 'full') {
        $('.querybox-toggle').off("click").on("click", function () {
            $(this).parent().toggleClass('active');
            $(".btn-reset-form").after($("#userQueries").find("ul"));
        });
    }
    setTimeout(function () {
        if ($(".btn-reset-form").length > 0) {
            $(".btn-reset-form").after($("#userQueries").find("ul"));
        }
    }, 300);

    // XX解决的
    // XX人X级别的


    // 数据初始化
    if (typeof (page) != 'undefined' && page == 'resolve') {
        $("#resolution").val("fixed");
        $("#resolution").trigger('chosen:updated');

        $("#resolvedBuild").val("5");
        $("#resolvedBuild").trigger('chosen:updated');
    }
})();