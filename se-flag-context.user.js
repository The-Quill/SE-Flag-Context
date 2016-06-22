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
// ==/UserScript==

(function(){
    document.addEventListener('DOMNodeInserted', function(){
        var link = null;
        var flagPopupBlocks = document.querySelectorAll('.flags-popup div');
        if (flagPopupBlocks.length == 0 || flagPopupBlocks.length != 3) return;
        for(var i = 0; i < flagPopupBlocks.length; i++){
            if (!flagPopupBlocks[i].classList.contains('content')){
                if (flagPopupBlocks[i].classList.contains('processed')) continue;
                flagPopupBlocks[i].classList.add('processed');
                var links = flagPopupBlocks[i].querySelectorAll('a');
                if (links.length == 0) continue;
                link = links[1];
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
                    for (var i = 6; i > 0; i--){
                        current = current.previousSibling;
                        if (current.nodeName == "#text") current = current.previousSibling;
                        contextMessages.push(current);
                    }
                    flagPopupBlocks.innerHTML = '<div class="block">' + contextMessages.map(function(msg){
                        return msg.innerHTML;
                    }).join('') + '</div>';
                    var objDiv = document.querySelector("div.block");
                    objDiv.scrollTop = objDiv.scrollHeight;
                }
                catch (c){ return; }
            }
        });
    });
})();
