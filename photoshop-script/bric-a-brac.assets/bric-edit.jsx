//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// bric-edit.jsx
//
//==============================================================================

#target photoshop
#include "common.jsx"
#include "7zip.jsx"

//==============================================================================

//UI Strings
var strLabelVersion             = 'Version: ';
var strTitle                    = 'Bric Info';
var strLabelTitle               = 'Title';
var strLabelURL                 = 'URL';
var strLabelTags                = 'Tags';
var strButtonOK                 = 'OK';
var strButtonCancel             = 'Cancel';
var strLabelRegion              = 'Region';
var strLabelTimeinterval        = 'Timeinterval';
var strLabelStartDate           = 'Start Date';

//Buttons
var applyButtonID = 1;
var cancelButtonID = 2;

//==============================================================================

function editDialog(bricInfo) {
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
	
	dlgMain.grpTitle = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTitle.orientation = 'row';
	dlgMain.grpTitle.alignChildren = 'left';
	dlgMain.grpTitle.add("statictext", undefined, strLabelTitle);
	dlgMain.etTitle = dlgMain.grpTitle.add("edittext", undefined, bricInfo.title.toString());
	dlgMain.etTitle.preferredSize.width = 210;

	dlgMain.grpUrl = dlgMain.grpTopLeft.add("group");
	dlgMain.grpUrl.orientation = 'row';
	dlgMain.grpUrl.alignChildren = 'left';
	dlgMain.grpUrl.add("statictext", undefined, strLabelURL);
	dlgMain.etUrl = dlgMain.grpUrl.add("edittext", undefined, bricInfo.url.toString());
	dlgMain.etUrl.preferredSize.width = 210;

	dlgMain.grpTags = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTags.orientation = 'row';
	dlgMain.grpTags.alignChildren = 'left';
	dlgMain.grpTags.add("statictext", undefined, strLabelTags);
	dlgMain.etTags = dlgMain.grpTags.add("edittext", undefined, bricInfo.tags.toString());
	dlgMain.etTags.preferredSize.width = 210;

	dlgMain.grpRegion = dlgMain.grpTopLeft.add("group");
	dlgMain.grpRegion.orientation = 'row';
	dlgMain.grpRegion.alignChildren = 'left';
	dlgMain.grpRegion.add("statictext", undefined, strLabelRegion);
	dlgMain.etRegion = dlgMain.grpRegion.add("edittext", undefined, bricInfo.region.toString());
	dlgMain.etRegion.preferredSize.width = 210;
	
	dlgMain.grpTimeinterval = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTimeinterval.orientation = 'row';
	dlgMain.grpTimeinterval.alignChildren = 'left';
	dlgMain.grpTimeinterval.add("statictext", undefined, strLabelTimeinterval);
	dlgMain.etTimeinterval = dlgMain.grpTimeinterval.add("edittext", undefined, bricInfo.timeinterval.toString());
	dlgMain.etTimeinterval.preferredSize.width = 210;
	
	dlgMain.grpStartDate = dlgMain.grpTopLeft.add("group");
	dlgMain.grpStartDate.orientation = 'row';
	dlgMain.grpStartDate.alignChildren = 'left';
	dlgMain.grpStartDate.add("statictext", undefined, strLabelStartDate);
	dlgMain.stStartDate = dlgMain.grpStartDate.add("statictext", undefined, bricInfo.startdate.toString());
	dlgMain.stStartDate.preferredSize.width = 210;
		
	// -- group top right
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'center';
	
	dlgMain.btnApply = dlgMain.grpTopRight.add("button", undefined, strButtonOK);
	dlgMain.btnApply.onClick = function() {
		//TODO: create the new brac here
		bricInfo.title        = dlgMain.etTitle        .text;
		bricInfo.url          = dlgMain.etUrl          .text;
		bricInfo.tags         = dlgMain.etTags         .text;
		bricInfo.region       = dlgMain.etRegion       .text;
		bricInfo.timeinterval = dlgMain.etTimeinterval .text;
		bricInfo.startdate    = dlgMain.stStartDate    .text;
		dlgMain.close(applyButtonID);
	}
	
	dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel);
	dlgMain.btnCancel.onClick = function() {
		dlgMain.close(cancelButtonID);
	}

	dlgMain.grpTopRight.add("statictext", undefined, strLabelVersion + bricInfo.version.toString());
	
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

function BricEdit() {
	if (app.documents.length == 0) {
		alert ('No active document');
		return;
	}
	var cur_doc = app.activeDocument;
	var desc = app.getCustomOptions(cur_doc.name);
	var temp_dir = new Folder(desc.getString(1));
	var bric_id = parseInt(cur_doc.activeLayer.name);

	if (bric_id.toString() == 'NaN') {
		alert("Selected layer has no bric id, is it a newly added layer?");
		return;
	}

	var bric_xml_file = new File(temp_dir + "/bric." + bric_id + "/bric.xml");
	if (!bric_xml_file.exists) {
		alert("Bric XML file not found! Are you sure you've selected a Bric group? \n\n" + bric_xml_file.fsName);
		return;
	}
	
	bric_xml_file.open('r');
	var bric_xml = new XML(bric_xml_file.read());
	bric_xml_file.close();
	
	var brac_xml_file = new File(temp_dir + "/brac.xml");
	if (!brac_xml_file.exists) {
		alert("Brac XML file not found! \n\n" + brac_xml_file.fsName);
		return;
	}
	
	brac_xml_file.open('r');
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();

	var bricInfo          = new Object();
	bricInfo.version      = bric_xml.@version;
	bricInfo.title        = bric_xml.@title;
	bricInfo.timeinterval = bric_xml.@timeinterval;
	bricInfo.startdate    = bric_xml.@startdate;
	bricInfo.url          = bric_xml.@url;
	bricInfo.region       = bric_xml.@region;
	bricInfo.tags         = bric_xml.@tags;

	if (cancelButtonID == editDialog(bricInfo)) {
		return 'cancel';
	} else {
		bric_xml.@version      = bricInfo.version;
		bric_xml.@title        = bricInfo.title;
		bric_xml.@timeinterval = bricInfo.timeinterval;
		bric_xml.@startdate    = bricInfo.startdate;
		bric_xml.@url          = bricInfo.url;
		bric_xml.@region       = bricInfo.region;
		bric_xml.@tags         = bricInfo.tags;
		bric_xml_file.open('w');
		bric_xml_file.write(bric_xml);
		bric_xml_file.close();

		for (var i = 0; i < brac_xml.layers.children().length(); ++i) {
			var lyr = brac_xml.layers.children()[i];
			if (lyr.@id == bric_id) {
				lyr.@timeinterval = bricInfo.timeinterval;
				brac_xml_file.open('w');
				brac_xml_file.write(brac_xml);
				brac_xml_file.close();
				break;
			}
		}
	}
};

//==============================================================================

BricEdit();

//==============================================================================

// EOF
