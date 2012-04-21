


//send the data to the extension
chrome.extension.sendRequest({url:document.location.href, action:"onload"}, function(response) {
});

