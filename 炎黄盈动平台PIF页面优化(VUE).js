// ==UserScript==
// @name         炎黄盈动平台PIF页面优化(VUE)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  PIF表单图片直接展示
// @author       haifennj
// @match        https://my.awspaas.com/*

// ==/UserScript==

(function() {
	'use strict';
	const pageCheck = settingParam && settingParam.processDefId == 'obj_24996ee732df448fac828927be204952'
	if(!pageCheck){
		return;
	}

	function setNewTitle() {
		var titleElement = document.querySelector('.title-name');
		var toolbarText = titleElement.textContent;
		var title = toolbarText;
		var pattern = /PIF(\d+)/;
		var match = pattern.exec(toolbarText);
		var pifNo = "";
		var shortNo = '';//$("#PIFNO_Readonly").text().substring(9);
		if (match) {
			pifNo = match[0];
		}
		shortNo = pifNo.substring(9);
		var pifQueryUrl = "https://my.awspaas.com/r/w?sid=" + settingParam.sessionId + "&msaDefSvcId=oa&&msaAppId=com.crmpaas.apps.service&cmd=CLIENT_DW_PORTAL&processGroupId=obj_40522b2a44c44d55bf264b968d1da3af&appId=com.crmpaas.apps.service&hideToolbar=true&hideTitle=true&condition=";
		pifQueryUrl += encodeURIComponent("[{cp:'=',fd:'PIFNOOBJ_936301EB43D341D0A3421927FE05E80D',cv:'" + pifNo + "'}]");
		var aTag = '<a href="' + pifQueryUrl + '" target="' + pifNo + '">' + shortNo + '</a>';
		titleElement.innerHTML = aTag + "-" + toolbarText;
		title = shortNo + "-" + toolbarText
		document.title = title;
	}
	
	function addXMLRequestCallback(callback) {
		var oldSend, i;
		if (XMLHttpRequest.callbacks) {
			XMLHttpRequest.callbacks.push(callback);
		} else {
			XMLHttpRequest.callbacks = [callback];
			oldSend = XMLHttpRequest.prototype.send;
			XMLHttpRequest.prototype.send = function () {
				for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
					XMLHttpRequest.callbacks[i](this);
				}
				oldSend.apply(this, arguments);
			}
		}
	}
	addXMLRequestCallback(function (xhr) {
		xhr.addEventListener("load", function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var r = JSON.parse(xhr.response)
				console.log('拦截返回：', r.data);
				if (r.data && r.data["formToolbar"]) {
					setTimeout(function () {
						setNewTitle();
					}, 300);
				}
			}
		});
	});
})();