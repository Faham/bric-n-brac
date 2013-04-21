//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// brac-edit.jsx
//
//==============================================================================

#target photoshop
#include "common.jsx"
#include "7zip.jsx"

//==============================================================================

//UI Strings
var strTitle            = 'Video Setting';
var strLabelFilename    = 'Filename';
var strLabelFPS         = 'FPS';
var strLabelFastForward = 'FastForward';
var strButtonBrowse     = 'Browse';
var strButtonOK         = 'OK';
var strButtonCancel     = 'Cancel';

//Buttons
var applyButtonID  = 1;
var cancelButtonID = 2;
var browseButtonID = 3;

//==============================================================================

function editDialog(videoInfo) {
	dlgMain = new Window("dialog", strTitle);
	
	// match our dialog background color to the host application
	var brush = dlgMain.graphics.newBrush (dlgMain.graphics.BrushType.THEME_COLOR, "appDialogBackground");
	dlgMain.graphics.backgroundColor = brush;
	dlgMain.graphics.disabledBackgroundColor = dlgMain.graphics.backgroundColor;

	dlgMain.orientation = 'column';
	dlgMain.alignChildren = 'left';
	
	// -- two groups, one for left and one for right ok, cancel
	dlgMain.grpTop = dlgMain.add("group");
	dlgMain.grpTop.orientation = 'row';
	dlgMain.grpTop.alignChildren = 'top';
	dlgMain.grpTop.alignment = 'fill';

	// -- group top left 
	dlgMain.grpTopLeft = dlgMain.grpTop.add("group");
	dlgMain.grpTopLeft.orientation = 'column';
	dlgMain.grpTopLeft.alignChildren = 'right';
	dlgMain.grpTopLeft.alignment = 'fill';
	
	dlgMain.grpFilename = dlgMain.grpTopLeft.add("group");
	dlgMain.grpFilename.orientation = 'row';
	dlgMain.grpFilename.alignChildren = 'left';
	dlgMain.grpFilename.add("statictext", undefined, strLabelFilename);
	dlgMain.etFilename = dlgMain.grpFilename.add("edittext", undefined, videoInfo.filename.toString());
	dlgMain.etFilename.preferredSize.width = 210;

	dlgMain.grpFPS = dlgMain.grpTopLeft.add("group");
	dlgMain.grpFPS.orientation = 'row';
	dlgMain.grpFPS.alignChildren = 'left';
	dlgMain.grpFPS.add("statictext", undefined, strLabelFPS);
	dlgMain.etFPS = dlgMain.grpFPS.add("edittext", undefined, videoInfo.fps.toString());
	dlgMain.etFPS.preferredSize.width = 210;
	
	dlgMain.grpFastForward = dlgMain.grpTopLeft.add("group");
	dlgMain.grpFastForward.orientation = 'row';
	dlgMain.grpFastForward.alignChildren = 'left';
	dlgMain.grpFastForward.add("statictext", undefined, strLabelFastForward);
	dlgMain.stFastForward = dlgMain.grpFastForward.add("edittext", undefined, videoInfo.fastforward.toString());
	dlgMain.stFastForward.preferredSize.width = 210;
		
	// -- group top right
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'center';
	
	dlgMain.btnBrowse = dlgMain.grpTopRight.add("button", undefined, strButtonBrowse);
	dlgMain.btnBrowse.onClick = function() {
		dlgMain.etFilename.text = File.saveDialog("Save As", "*.avi");
	}

	dlgMain.btnApply = dlgMain.grpTopRight.add("button", undefined, strButtonOK);
	dlgMain.btnApply.onClick = function() {
		videoInfo.filename    = dlgMain.etFilename    .text;
		videoInfo.fps         = dlgMain.etFPS         .text;
		videoInfo.fastforward = dlgMain.stFastForward .text;
		dlgMain.close(applyButtonID);
	}
	
	dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel);
	dlgMain.btnCancel.onClick = function() {
		dlgMain.close(cancelButtonID);
	}
	
	// give the hosting app the focus before showing the dialog
	app.bringToFront();

	dlgMain.center();
	
	var result = dlgMain.show();
	
	if (cancelButtonID == result) {
		return result;  // close to quit
	}

	return result;
}

//------------------------------------------------------------------------------

function BracExport() {
	if (app.documents.length == 0) {
		alert ('No active document');
		return;
	}
	var cur_doc = app.activeDocument;
	var desc = app.getCustomOptions(cur_doc.name);
	var temp_dir = new Folder(desc.getString(1));

	var videoInfo         = new Object();
	videoInfo.filename    = '';
	videoInfo.fps         = '24';
	videoInfo.fastforward = '1000';

	if (cancelButtonID == editDialog(videoInfo)) {
		return 'cancel';
	} else {
		//Exec.system("RD /S /Q " + outDir.fsName, 10000);
	}
};

//==============================================================================

BracExport();

//==============================================================================

// EOF
