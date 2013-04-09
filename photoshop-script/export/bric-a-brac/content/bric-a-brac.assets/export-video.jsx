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
var strLabelVersion    = 'Version: ';
var strTitle           = 'Bric Info';
var strLabelArtist     = 'Artist';
var strLabelDpi        = 'Dpi';
var strLabelName       = 'Name';
var strLabelResolution = 'Resolution';
var strLabelTags       = 'Tags';
var strLabelVersion    = 'Version';
var strButtonOK        = 'OK';
var strButtonCancel    = 'Cancel';

//Buttons
var applyButtonID  = 1;
var cancelButtonID = 2;

//==============================================================================

function editDialog(bracInfo) {
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
	
	dlgMain.grpArtist = dlgMain.grpTopLeft.add("group");
	dlgMain.grpArtist.orientation = 'row';
	dlgMain.grpArtist.alignChildren = 'left';
	dlgMain.grpArtist.add("statictext", undefined, strLabelArtist);
	dlgMain.etArtist = dlgMain.grpArtist.add("edittext", undefined, bracInfo.artist.toString());
	dlgMain.etArtist.preferredSize.width = 210;

	dlgMain.grpDpi = dlgMain.grpTopLeft.add("group");
	dlgMain.grpDpi.orientation = 'row';
	dlgMain.grpDpi.alignChildren = 'left';
	dlgMain.grpDpi.add("statictext", undefined, strLabelDpi);
	dlgMain.etDpi = dlgMain.grpDpi.add("edittext", undefined, bracInfo.dpi.toString());
	dlgMain.etDpi.preferredSize.width = 210;

	dlgMain.grpName = dlgMain.grpTopLeft.add("group");
	dlgMain.grpName.orientation = 'row';
	dlgMain.grpName.alignChildren = 'left';
	dlgMain.grpName.add("statictext", undefined, strLabelName);
	dlgMain.etName = dlgMain.grpName.add("edittext", undefined, bracInfo.name.toString());
	dlgMain.etName.preferredSize.width = 210;

	dlgMain.grpResolution = dlgMain.grpTopLeft.add("group");
	dlgMain.grpResolution.orientation = 'row';
	dlgMain.grpResolution.alignChildren = 'left';
	dlgMain.grpResolution.add("statictext", undefined, strLabelResolution);
	dlgMain.etResolution = dlgMain.grpResolution.add("edittext", undefined, bracInfo.resolution.toString());
	dlgMain.etResolution.preferredSize.width = 210;
	
	dlgMain.grpTags = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTags.orientation = 'row';
	dlgMain.grpTags.alignChildren = 'left';
	dlgMain.grpTags.add("statictext", undefined, strLabelTags);
	dlgMain.etTags = dlgMain.grpTags.add("edittext", undefined, bracInfo.tags.toString());
	dlgMain.etTags.preferredSize.width = 210;
	
	dlgMain.grpVersion = dlgMain.grpTopLeft.add("group");
	dlgMain.grpVersion.orientation = 'row';
	dlgMain.grpVersion.alignChildren = 'left';
	dlgMain.grpVersion.add("statictext", undefined, strLabelVersion);
	dlgMain.stVersion = dlgMain.grpVersion.add("statictext", undefined, bracInfo.version.toString());
	dlgMain.stVersion.preferredSize.width = 210;
		
	// -- group top right
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'center';
	
	dlgMain.btnApply = dlgMain.grpTopRight.add("button", undefined, strButtonOK);
	dlgMain.btnApply.onClick = function() {
		//TODO: create the new brac here
		bracInfo.artist       = dlgMain.etArtist      .text;
		bracInfo.dpi          = dlgMain.etDpi         .text;
		bracInfo.name         = dlgMain.etName        .text;
		bracInfo.resolution   = dlgMain.etResolution  .text;
		bracInfo.tags         = dlgMain.etTags        .text;
		bracInfo.timeinterval = dlgMain.stTimeInterval.text;
		bracInfo.version      = dlgMain.stVersion     .text;
		dlgMain.close(applyButtonID);
	}
	
	dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel);
	dlgMain.btnCancel.onClick = function() {
		dlgMain.close(cancelButtonID);
	}

	dlgMain.grpTopRight.add("statictext", undefined, strLabelVersion + bracInfo.version.toString());
	
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

	var brac_xml_file = new File(temp_dir + "/brac.xml");
	if (!brac_xml_file.exists) {
		alert("Bric XML file not found! Are you sure you've selected a Bric group? \n\n" + brac_xml_file.fsName);
		return;
	}
	brac_xml_file.open('r');
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();

	var bracInfo          = new Object();
	bracInfo.artist       = brac_xml.@artist;
	bracInfo.dpi          = brac_xml.@dpi;
	bracInfo.name         = brac_xml.@name;
	bracInfo.resolution   = brac_xml.@resolution;
	bracInfo.tags         = brac_xml.@tags;
	bracInfo.timeinterval = brac_xml.@timeinterval;
	bracInfo.version      = brac_xml.@version;

	if (cancelButtonID == editDialog(bracInfo)) {
		return 'cancel';
	} else {
		brac_xml.@artist       = bracInfo.artist;
		brac_xml.@dpi          = bracInfo.dpi;
		brac_xml.@name         = bracInfo.name;
		brac_xml.@resolution   = bracInfo.resolution;
		brac_xml.@tags         = bracInfo.tags;
		brac_xml.@timeinterval = bracInfo.timeinterval;
		brac_xml.@version      = bracInfo.version;

		brac_xml_file.open('w');
		brac_xml_file.write(brac_xml);
		brac_xml_file.close();
	}
};

//==============================================================================

BracExport();

//==============================================================================

// EOF
