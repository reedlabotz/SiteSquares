

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

	//send the data to the extension
	chrome.extension.sendRequest({url:document.location.href, colors: colors}, function(response) {
	});
}


function isValidColor(r,g,b,a) {
	if (a < 20) return false;
	if (r < 20 && g < 20 && b < 20) return false;
	if (r > 240 && g > 240 && b > 240) return false;

	return true;
}





function calculateColor() {

	var link = document.querySelector("link[rel~='icon']");
	if (!link) {
	  link = document.createElement("link");
	  link.setAttribute("rel", "shortcut icon");
	  document.head.appendChild(link);
	}
	var faviconUrl = link.href || window.location.origin + "/favicon.ico";
	function onImageLoaded() {
		findColorOfIcon(img);
	};
	var img = document.createElement("img");
	img.addEventListener("load", onImageLoaded);
	img.src = faviconUrl;

}


function smarterIcon() {
	var link = document.querySelector("link[rel~='icon']");
	if (!link) {
	  link = document.createElement("link");
	  link.setAttribute("rel", "icon");
	  document.body.appendChild(link);
	}
	var betterFavicon = localStorage["better-favicon"];
	if (betterFavicon) {
	  link.type = "image/x-icon";
	  link.href = betterFavicon;
	} else {
	  var payload = {url: window.location.href};
	  chrome.extension.sendRequest(payload, function(response) {
		link.type = "image/x-icon";
		link.href = response;
		localStorage["better-favicon"] = response;
	  });
	}
}
calculateColor();


chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log("Request: "+request);
	});
}
