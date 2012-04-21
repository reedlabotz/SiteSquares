
var tabcolors = {};



function tryIcon(faviconUrl, url, shouldsend) {
	function onImageLoaded() {
		//console.log("image loaded");
		colors = findColorOfIcon(img);
		setColor(url, colors, shouldsend);
	};
	var img = document.createElement("img");
	img.addEventListener("load", onImageLoaded);
	img.src = faviconUrl;
}

function findColorOfIcon(image) {
	var canvas = document.createElement("canvas");
	canvas.width = 16;
	canvas.height = 16;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(image,0,0,16,16);
	pix= ctx.getImageData(0,0,16,16).data;
	colors = {};
	for (var i = 0, n = pix.length; i < n; i += 4) {
		var r = pix[i  ]; // red
		var g = pix[i+1]; // green
		var b = pix[i+2]; // blue
		var a = pix[i+3];
		// i+3 is alpha (the fourth element)
		var amount = 10.0;
		r = Math.floor(r/amount)*amount;
		g = Math.floor(g/amount)*amount;
		b = Math.floor(b/amount)*amount;
		a = Math.floor(a/amount)*amount;
		if (isValidColor(r,g,b,a)) {
			var str = r.toString(16)+""+g.toString(16)+""+b.toString(16);
			//console.log("Str: "+str);
			if (colors[str]) {
				colors[str] = colors[str] + 1;
			} else {
				colors[str] = 1;
			}
		}
	}
	//console.log("color of icon: "+colors);
	return colors;
}
function isValidColor(r,g,b,a) {
	if (a < 20) return false;
	if (r < 20 && g < 20 && b < 20) return false;
	if (r > 240 && g > 240 && b > 240) return false;

	return true;
}





function findColorOfTab() {
	runOnCurrentTab(function(tab1) {
		tryIcon(tab1.favIconUrl, tab1.url, false);
		window.setTimeout(function() {
			runOnCurrentTab(function(tab2) {
				if (tab1.id == tab2.id) {
					console.log("Still on the page");
					console.log("url: "+this.url);
					console.log("this tab: "+tabcolors[this.url]);
					var color = tabcolors[this.url];
					if (color) 
						sendColor(color);
					else 
						tryIcon(tab2.favIconUrl, tab2.url, true);
				} else {
					console.log("Not teh same tab!");
				}
			});
		},5000); //make sure they'r eon the page for a while longer
	});
}

function runOnCurrentTab(run) {
	chrome.windows.getCurrent(function(current_window){
		chrome.tabs.getAllInWindow(current_window.id, function(tabs) {
			$.each(tabs, function() {
				if (this.active)  {
					run(this);
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
		//console.log("Color: "+key+" times: "+element);
		if (element > max) {
			max = element;
			argmax = key;
		}
	}

	//console.log(" Best color:" +argmax + " with "+max+" many");
	return argmax;
}


function sendColor(color) {
	var url = "http://sitesquares.herokuapp.com/color/"+color;
	console.log("Sending to url: "+url);
	$.get(url, function() {
		console.log("Success");
	});
}

function setColor(url, colors, send) {
	//console.log("Lots of colors! "+url);
	var color = getMaxColor(colors);
	tabcolors[url] = color;
	//console.log("color here: "+color);
	if (send)
		sendColor(color);
}
//recieve the colors from the pages
chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if (request.action == "onload") {
		findColorOfTab();
	}
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//console.log("Tab: "+tab+" tabId: "+tabId);
	findColorOfTab();
});
chrome.tabs.onCreated.addListener(function(tab) {
	//console.log("Tab: "+tab);
	findColorOfTab();
});
//chrome.tabs.OnRemoved.addListener(function(tab) {
//	console.log("Tab: "+tab);
//	findColorOfTab(tab);
//});
chrome.tabs.onActiveChanged.addListener(function(activeInfo) {
	//console.log("ACTIVATED: "+activeInfo);	
	findColorOfTab();	
});
//chrome.tabs.onActivated.addListener(function(activeInfo) {
//	console.log("ACTIVATED: "+activeInfo);
//	findColorOfTab();	
//});

