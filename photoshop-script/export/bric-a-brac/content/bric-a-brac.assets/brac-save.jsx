//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// brac-save.jsx
//
//==============================================================================

#target photoshop 
#include "brac-save-base.jsx"

//==============================================================================
	
function BracSave() {
	if (app.documents.length == 0) {
		alert ('No active document');
		return;
	}
	var cur_doc = app.activeDocument;
	var dir = "" + cur_doc.path;
	var arr = dir.split('/');
	var id = arr[arr.length - 1];
	var desc = app.getCustomOptions(id);
	var temp_dir = new Folder(cur_doc.path);
	debugger;
	var target_filename = new File(desc.getString(0));
	
	if (!target_filename.exists)
		target_filename = File.saveDialog("Save As", "*.brac");

	if (target_filename)
		saveAs(temp_dir, target_filename)
};

//==============================================================================

BracSave();

//==============================================================================

// EOF
