//==============================================================================
//
// brac-save-as.jsx
//
//==============================================================================

#target photoshop 
#include "brac-save-base.jsx"

//==============================================================================

function BracSaveAs() {
	if (app.documents.length == 0) {
		alert ('No active document');
		return;
	}
	var cur_doc = app.activeDocument;
	var desc = app.getCustomOptions(cur_doc.name);
	var temp_dir = new Folder(desc.getString(1));
	var target_filename = File.saveDialog("Save As", "*.brac");
	if (target_filename)
		saveAs(temp_dir, target_filename)
};

//==============================================================================

BracSaveAs();

//==============================================================================

// EOF
