



var tabcolors = {};


function findColorOfTab(tab) {
	chrome.windows.getCurrent(function(current_window){
		chrome.tabs.getAllInWindow(current_window.id, function(tabs) {
			$.each(tabs, function() {
				if (this.active)  {
					console.log("url: "+this.url);
					console.log("this tab: "+tabcolors[this.url]);
					var color = tabcolors[this.url];
					if (color) sendColor(color);
				}
			});
		});
	});
}


function getMaxColor(colors) {
	var max = 0;
	var argmax;
	for (key in colors) {
		var element = colors[key];
		console.log("Color: "+key+" times: "+element);
		if (element > max) {
			max = element;
			argmax = key;
		}
	}

	console.log(" Best color:" +argmax + " with "+max+" many");
	return argmax;
}


function sendColor(color) {
	$.get("http://sitesquares.herokuapp.com/color/"+color);
}

//recieve the colors from the pages
chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	console.log("Lots of colors! "+request.url);
	tabcolors[request.url] = getMaxColor(request.colors);
	console.log(tabcolors);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("Tab: "+tab+" tabId: "+tabId);
	findColorOfTab(tab);
});
chrome.tabs.onCreated.addListener(function(tab) {
	console.log("Tab: "+tab);
	findColorOfTab(tab);
});
//chrome.tabs.OnRemoved.addListener(function(tab) {
//	console.log("Tab: "+tab);
//	findColorOfTab(tab);
//});
chrome.tabs.onActiveChanged.addListener(function(activeInfo) {
	console.log("ACTIVATED: "+activeInfo);	
	findColorOfTab();	
});
//chrome.tabs.onActivated.addListener(function(activeInfo) {
//	console.log("ACTIVATED: "+activeInfo);
//	findColorOfTab();	
//});

