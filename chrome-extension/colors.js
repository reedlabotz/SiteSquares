



var tabcolors = {};


function findColorOfTab(tab) {
	chrome.windows.getCurrent(function(current_window){
		chrome.tabs.getAllInWindow(current_window.id, function(tabs) {
			$.each(tabs, function() {
				if (this.active)  {
					var tab = this;
					var url = tab.favIconUrl;
					console.log("url: "+url);
					myimage = new Image();
					myimage.onload = function() {
						console.log("Image finished loading!");
						findColorOfIcon(myimage);
					};
					myimage.src=url;
				}
			});
		});
	});
}



function setup() {
	$("#image").load(function() {
		console.log("Image finished loading!");
	});
}

var id = "canvas"+Math.random();
function findColorOfIcon(image) {
	if ($("#"+id).length == 0) $("body").append("<canvas id='"+id+"'> </canvas>");
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext('2d');
	console.log("size: "+canvas.width+ "height:"+canvas.height);
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
		var str = "#"+r.toString(16)+""+g.toString(16)+""+b.toString(16)+""+a.toString(16);
		//console.log("Str: "+str);
		if (colors[str]) {
			colors[str] = colors[str] + 1;
		} else {
			colors[str] = 1;
		}
	}
	var max = 0;
	var argmax;
	$.each(colors, function(key, element) {
		console.log("Color: "+key+" times: "+element);
		if (element > max) {
			max = element;
			argmax = key;
		}
	});

	console.log(" Best color:" +argmax + " with "+max+" many");
}





setup();



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

