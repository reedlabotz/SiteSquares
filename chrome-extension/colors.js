



tabcolors = {};


function findColorOfTab(tab) {
	var url = tab.favIconUrl;
}








chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("Tab: "+tab+" tabId: "+tabId);
});
chrome.tabs.onCreated.addListener(function(tab) {
	console.log("Tab: "+tab);
});
chrome.tabs.OnRemoved.addListener(function(tab) {
	console.log("Tab: "+tab);
});
chrome.tabs.onActiveChanged.addListener(function(activeInfo) {
	console.log("ACTIVATED: "+activeInfo);
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log("ACTIVATED: "+activeInfo);
});

