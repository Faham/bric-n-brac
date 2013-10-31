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
	var desc = app.getCustomOptions(cur_doc.fullName);
	var temp_dir = new Folder(desc.getString(1));

	for(var w = 0; w < 20; ++w) {
		if(temp_dir.exists)
			folderDelete(temp_dir);
		else
			break;
	}

	app.eraseCustomOptions(cur_doc.name);
	cur_doc.close(SaveOptions.DONOTSAVECHANGES);
};

//------------------------------------------------------------------------------

BracClose();

//==============================================================================

// EOF
