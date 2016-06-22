// ==UserScript==
// @name           SE Flag Context
// @namespace      https://github.com/The-Quill
// @version        1.0.0
// @description    This script adds some message context to the chat flags
// @author         @Quill
// @match          chat.stackexchange.com/rooms/*
// @connect        rawgit.com
// @connect        github.com
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @resource       theme    https://raw.githubusercontent.com/The-Quill/SE-Flag-Context/master/se-flag-context.user.css
// ==/UserScript==

GM_addStyle(GM_getResourceText('theme'));

(function(){
    document.addEventListener('DOMNodeInserted', function(){
        var link = null;
        var buttons;
        var flagPopupBlocks = document.querySelectorAll('.flags-popup div');
        if (flagPopupBlocks.length == 0 || flagPopupBlocks.length != 3) return;
        for(var i = 0; i < flagPopupBlocks.length; i++){
            if (!flagPopupBlocks[i].classList.contains('content')){
                if (flagPopupBlocks[i].classList.contains('processed')) continue;
                flagPopupBlocks[i].classList.add('processed');
                var links = flagPopupBlocks[i].querySelectorAll('a');
                if (links.length == 0) continue;
                link = links[1];
                buttons = links[2];
            }
        }
        if (link == null) return;
        GM_xmlhttpRequest({
            method: "GET",
            url: link.href,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function(response) {
                if (response.status != 200) return;
                try {
                    var fakeElement = document.createElement('div');
                    fakeElement.innerHTML = response.responseText;
                    var messages = fakeElement.querySelector('#transcript').children;
                    var messageId = link.href.match(/http[s]*:\/\/chat.[meta\.]*stack[exchange|overflow]+\.com[\/]+transcript\/message\/([\d]+)/)[1];
                    var selectedMessage = fakeElement.querySelector('#message-' + messageId).parentNode.parentNode;
                    var contextMessages = [
                        selectedMessage
                    ];
                    var current = selectedMessage;
                    for (var i = 24; i > 0; i--){
                        current = current.previousSibling;
                        if (current.nodeName == "#text") current = current.previousSibling;
                        contextMessages.push(current);
                    }
                    var rows = [];
                    // contextMessages.forEach(function(messageBlock){
                    //     var author = messageBlock.querySelector('.signature').innerText;
                    //     var content = messageBlock.querySelectorAll('.message').map(function(msg){
                    //         return msg.querySelector('.content').innerText;
                    //     }).forEach(function(msg){
                    //         rows.push(author + ': ' + msg);
                    //     })
                    // });
                    flagPopupBlocks.innerHTML = '<div class="block">' + contextMessages.map(function(msg){
                        return '<div class="monologue">' + msg.innerHTML + '</div>';
                    }).join('') + '</div>' +
                    '<div>' +
                        '<button class="button reflag" title="agree that this message is spam or offensive">valid</button>' +
                        '<button class="button counterflag" title="this message is neither spam nor offensive">invalid</button>' +
                        '<button class="button mehflag" title="no strong opinion">not sure</button>' +
                    '</div>';
                    var objDiv = document.querySelector("div.block");
                    objDiv.scrollTop = objDiv.scrollHeight;
                }
                catch (c){ return; }
            }
        });
    });
})();
