﻿//==============================================================================
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
	var desc = app.getCustomOptions(cur_doc.name);
	var temp_dir = new Folder(desc.getString(1));
	var target_filename = new File(desc.getString(0));

	saveAs(temp_dir, target_filename)
};

//==============================================================================

BracSave();

//==============================================================================

// EOF
