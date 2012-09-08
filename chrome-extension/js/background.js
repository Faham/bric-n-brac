var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = Math.ceil( (3*input.length) / 4.0);
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));		 

		var bytes = Math.ceil( (3*input.length) / 4.0);
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;	
	}
}		

//var seconds = 5 * 1000;
//setInterval(function() { 
//	alert("test");
//}, seconds);

chrome.browserAction.onClicked.addListener(function(tab) {
	// select image region
	chrome.tabs.executeScript(null, {file:"js\\overlay.js"});
	
	//file_io = document.createElement('embed')
	//file_io.type = "application/x-npapi-file-io"
	//file_io.id = 'npapi-file-io'
	//document.body.appendChild(file_io);
	//file_io.saveTextFile(
	//	"D:\\faham\\tim\\bric-n-brac\\browser-ext\\google-chrome\\screenshot\\test.txt"
	//	, "This is a test text!"
	//);
	
	//lex = document.createElement('embed')
	//lex.type = "application/x-localexecute"
	//lex.id = 'local-execute'
	//document.body.appendChild(lex);
	
	//Mac: /Users/username/Library/Application Support/Google/Chrome/Default/Extensions
	//Windows 7: C:\Users\username\AppData\Local\Google\Chrome\User Data\Default\Extensions
	
	//extid = chrome.extension.getURL('').split('/')[2];
	//extpath = "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Extensions\\" + extid
	//cutycapt_path = extpath + '\\bin\\cutycapt.exe'
	//lex.systemCall('"%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Extensions\\' + qtcap_path + '" --delay=5 --javascript=on --plugins=on --js-can-access-clipboard=on --min-width=1366 --min-height=768 --url=http://www.google.com --out=out\\test.png')
	
	// take screenshot and save to file
	//chrome.tabs.captureVisibleTab(null, {format: "png"}, function(img) {				
	//	var plugin = document.getElementById("npapi-file-io");
	//	plugin.saveBinaryFile(
	//		"D:\\faham\\tim\\bric-n-brac\\browser-ext\\google-chrome\\screenshot\\dummy10.png"
	//		, Base64Binary.decode(img.substr(img.search(',') + 1))
	//	);
	//});
});

//chrome.extension.onMessage.addListener(
//  function(request, sender, sendResponse) {
//	if ('request-brac-file' == request) {
//		//lex = document.getElementById('local-execute');
//		//console.log(lex.selectBracFile());
//	}
//    //  sendResponse({farewell: "goodbye"});
//});
