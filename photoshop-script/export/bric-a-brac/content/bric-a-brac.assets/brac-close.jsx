//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// brac-open.jsx
//
//==============================================================================

#target photoshop 

//==============================================================================

function folderDelete(topLevel){
	var folders =[];
	folders = findAllFolders(topLevel, folders);
	folders.unshift(topLevel);
	for(var a in folders){
		var fList=folders[a].getFiles();
		for(var f in fList)
			fList[f].remove();
	}
	folders.reverse();
	for(var z in folders)
		folders[z].remove();
}

//------------------------------------------------------------------------------

function findAllFolders(srcFolderStr, destArray) {
	var fileFolderArray = Folder( srcFolderStr ).getFiles();
	for ( var i = 0; i < fileFolderArray.length; i++ ) {
		var fileFoldObj = fileFolderArray[i];
		if ( !(fileFoldObj instanceof File) ) {
			destArray.push( Folder(fileFoldObj) );
			findAllFolders( fileFoldObj.toString(), destArray );
		}
	}
	return destArray;
}

//------------------------------------------------------------------------------

function BracClose() {
	if (app.documents.length == 0) {
		alert ('No active document');
		return;
	}
	var cur_doc = app.activeDocument;
	var dir = "" + cur_doc.path;
	var arr = dir.split('/');
	var id = arr[arr.length - 1];
	var temp_dir = new Folder(cur_doc.path);

	app.eraseCustomOptions(id);
	cur_doc.close(SaveOptions.DONOTSAVECHANGES);
    
	if(temp_dir.exists)
		folderDelete(temp_dir);

};

//------------------------------------------------------------------------------

BracClose();

//==============================================================================

// EOF
