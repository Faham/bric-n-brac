// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
var id = 100;

function takeScreenshot() {
  chrome.tabs.captureVisibleTab(null, {format: "png"}, function(img) {
    var screenshotUrl = img;
    var viewTabUrl = [chrome.extension.getURL('screenshot.html'),
                      '?id=', id++].join('');

    chrome.tabs.create({url: viewTabUrl}, function(tab) {
      var targetId = tab.id;

      var addSnapshotImageToTab = function(tabId, changedProps) {
        // We are waiting for the tab we opened to finish loading.
        // Check that the the tab's id matches the tab we opened,
        // and that the tab is done loading.
        if (tabId != targetId || changedProps.status != "complete")
          return;

        // Passing the above test means this is the event we were waiting for.
        // There is nothing we need to do for future onUpdated events, so we
        // use removeListner to stop geting called when onUpdated events fire.
        chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);

        // Look through all views to find the window which will display
        // the screenshot.  The url of the tab which will display the
        // screenshot includes a query parameter with a unique id, which
        // ensures that exactly one view will have the matching URL.
        var views = chrome.extension.getViews();
        for (var i = 0; i < views.length; i++) {
          var view = views[i];
          if (view.location.href == viewTabUrl) {
            view.setScreenshotUrl(screenshotUrl);
            break;
          }
        }
      };
      chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);

    });
  });
}

// Listen for a click on the camera icon.  On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function(tab) {
	//takeScreenshot();
		//var fileObj = fso.GetFile("C:\\Temp\\textfile.txt");
		//fileObj.Copy("C:\\Temp\\copy_of_textfile.txt", true); 
	//chrome.tabs.captureVisibleTab(null, {format: "png"}, function(img) {
	//	//alert(img);
	//	//$comma = strpos($img, ',');
	//	//$data = base64_decode(substr($img, $comma+1));
	//	//file_put_contents("fahamnewimage.png", $data);
	//});

	//fs.root.getFile('C:\log.txt', { create: true, exclusive: true }, function (fileEntry) {
	//	fileEntry.isFile = true;
	//	fileEntry.name = 'log.txt';
	//	fileEntry.fullPath = 'C:\log.txt';
	//	fileEntry.createWriter(function (fileWriter) {
	//		fileWriter.seek(fileWriter.length);
	//		var bb = new BlobBuilder();
	//		bb.append("Test\n");
	//		fileWriter.write(bb.getBlob('text/plain'));
	//	});
	//});
	
	
	//chrome.tabs.executeScript(null, {file:"overlay.js"});
});

