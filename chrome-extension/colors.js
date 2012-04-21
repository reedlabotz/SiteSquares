
var tabcolors = {};



function tryIcon(faviconUrl, url, shouldsend) {
	if (!faviconUrl) {
		console.log("could not find favicon for "+url);
		return;
	}
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
		//r = Math.floor(r/amount)*amount;
		//g = Math.floor(g/amount)*amount;
		//b = Math.floor(b/amount)*amount;
		//a = Math.floor(a/amount)*amount;
		var weight = getWeight(r,g,b,a)
		var str = toHex(r,g,b);
		//console.log("Str: "+str);
		if (colors[str]) {
			colors[str] = colors[str] + weight;
		} else {
			colors[str] = weight;
		}
	
	}
	//console.log("color of icon: "+colors);
	return colors;
}
function getWeight(r,g,b,a) {
	var opacity = a/255.0;
	var hsv = rgbToHsv(r,g,b);
	var h = hsv[0]; var s = hsv[1]; var v = hsv[2];

	var value = v * s;
	value = value * value;

	return value * opacity; //scale down - if transparent - don't weight
}

function toHex(r,g,b) {
   var str="";
   if (r < 16)
	   str=str+"0";
	str = str + r.toString(16);
   if (g < 16)
	   str=str+"0";
	str = str + g.toString(16);
   if (b < 16)
	   str=str+"0";
	str = str + b.toString(16);
	return str;
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
					console.log("Not teh same tab! "+tab1.url+"  and "+tab2.url);
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

var lastUrl;
function setColor(url, colors, send) {
	//console.log("Lots of colors! "+url);
	var color = getMaxColor(colors);
	tabcolors[url] = color;
	//console.log("color here: "+color);
	if (send) {
		if (lastUrl != url)
			sendColor(color);
		lastUrl = url;
	}
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

