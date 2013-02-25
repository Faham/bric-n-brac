// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini

//==============================================================================

#target photoshop

//==============================================================================

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 1;
//debugger; // launch debugger on next line

//==============================================================================

//UI Strings
var strLabelVersion             = 'Version: ';
var strTitle                    = 'New Brac';
var strLabelName                = 'Name';
var strLabelArtist              = 'Artist';
var strLabelTags                = 'Tags';
var strButtonOK                 = 'OK';
var strButtonCancel             = 'Cancel';
var strLabelWidth               = 'Width';
var strLabelHeight              = 'Height';
var strLabelPixel               = 'Pixels';
var strLabelInches              = 'Inches';
var strLabelCentimeters         = 'Centimeters';
var strLabelMillimeters         = 'Millimeters';
var strLabelPixelsPerInch       = 'Pixels/Inch';
var strLabelPixelsPerCentimeter = 'Pixels/Centimeter';
var strLabelResolution          = 'Resolution';
var strLabelBackgroundContents  = 'Background Contents';
var strLabelWhite               = 'White';
var strLabelTransparent         = 'Transparent';
var strLabelTemplate            = 'Template';
var strButtonBrowse             = 'Browse';
var strLabelImportUrls          = 'Import URLs';

//Buttons
var newButtonID = 1;
var cancelButtonID = 2;

//==============================================================================

main();

//==============================================================================

function main() {
    var bracInfo = new Object();

    initBracInfo(bracInfo);
	
	//if ( DialogModes.ALL == app.playbackDisplayDialogs ) {
		if (cancelButtonID == settingDialog(bracInfo)) {
			return 'cancel';
		}
	//}
	
	try {
	} catch (e) {
		if ( DialogModes.NO != app.playbackDisplayDialogs ) {
			alert(e);
		}
		return 'cancel';
	}
}

//------------------------------------------------------------------------------

function initBracInfo(bracInfo) {
	bracInfo.version    = 1.0;
	bracInfo.name       = '';
	bracInfo.artist     = '';
	bracInfo.tags       = '';
	bracInfo.width      = 1366;
	bracInfo.height     = 768;
	bracInfo.resolution = 72;
	bracInfo.template   = '';
	bracInfo.importUrls = false;
}

//------------------------------------------------------------------------------

function settingDialog(bracInfo) {
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
	
	dlgMain.grpName = dlgMain.grpTopLeft.add("group");
	dlgMain.grpName.orientation = 'row';
	dlgMain.grpName.alignChildren = 'left';
	dlgMain.grpName.add("statictext", undefined, strLabelName);
	dlgMain.etName = dlgMain.grpName.add("edittext", undefined, bracInfo.name.toString());
	dlgMain.etName.preferredSize.width = 210;

	dlgMain.grpArtist = dlgMain.grpTopLeft.add("group");
	dlgMain.grpArtist.orientation = 'row';
	dlgMain.grpArtist.alignChildren = 'left';
	dlgMain.grpArtist.add("statictext", undefined, strLabelArtist);
	dlgMain.etArtist = dlgMain.grpArtist.add("edittext", undefined, bracInfo.artist.toString());
	dlgMain.etArtist.preferredSize.width = 210;

	dlgMain.grpTags = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTags.orientation = 'row';
	dlgMain.grpTags.alignChildren = 'left';
	dlgMain.grpTags.add("statictext", undefined, strLabelTags);
	dlgMain.etTags = dlgMain.grpTags.add("edittext", undefined, bracInfo.tags.toString());
	dlgMain.etTags.preferredSize.width = 210;

	dlgMain.grpWidth = dlgMain.grpTopLeft.add("group");
	dlgMain.grpWidth.orientation = 'row';
	dlgMain.grpWidth.alignChildren = 'left';
	dlgMain.grpWidth.add("statictext", undefined, strLabelWidth);
	dlgMain.etWidth = dlgMain.grpWidth.add("edittext", undefined, bracInfo.width.toString());
	dlgMain.etWidth.preferredSize.width = 80;
	dlgMain.ddWidth = dlgMain.grpWidth.add("dropdownlist");
    dlgMain.ddWidth.preferredSize.width = 120;
    dlgMain.ddWidth.alignment = 'left';
    dlgMain.ddWidth.add('item', strLabelPixel);
    dlgMain.ddWidth.add('item', strLabelInches);
    dlgMain.ddWidth.add('item', strLabelCentimeters);
    dlgMain.ddWidth.add('item', strLabelMillimeters);
    dlgMain.ddWidth.selection = 0;

	dlgMain.grpHeight = dlgMain.grpTopLeft.add("group");
	dlgMain.grpHeight.orientation = 'row';
	dlgMain.grpHeight.alignChildren = 'left';
	dlgMain.grpHeight.add("statictext", undefined, strLabelHeight);
	dlgMain.etHeight = dlgMain.grpHeight.add("edittext", undefined, bracInfo.height.toString());
	dlgMain.etHeight.preferredSize.width = 80;
	dlgMain.ddHeight = dlgMain.grpHeight.add("dropdownlist");
    dlgMain.ddHeight.preferredSize.width = 120;
    dlgMain.ddHeight.alignment = 'left';
    dlgMain.ddHeight.add('item', strLabelPixel);
    dlgMain.ddHeight.add('item', strLabelInches);
    dlgMain.ddHeight.add('item', strLabelCentimeters);
    dlgMain.ddHeight.add('item', strLabelMillimeters);
    dlgMain.ddHeight.selection = 0;

	dlgMain.grpResolution = dlgMain.grpTopLeft.add("group");
	dlgMain.grpResolution.orientation = 'row';
	dlgMain.grpResolution.alignChildren = 'left';
	dlgMain.grpResolution.add("statictext", undefined, strLabelResolution);
	dlgMain.etResolution = dlgMain.grpResolution.add("edittext", undefined, bracInfo.resolution.toString());
	dlgMain.etResolution.preferredSize.width = 80;
	dlgMain.ddResolution = dlgMain.grpResolution.add("dropdownlist");
    dlgMain.ddResolution.preferredSize.width = 120;
    dlgMain.ddResolution.alignment = 'left';
    dlgMain.ddResolution.add('item', strLabelPixelsPerInch);
    dlgMain.ddResolution.add('item', strLabelPixelsPerCentimeter);
    dlgMain.ddResolution.selection = 0;
	
	dlgMain.grpBackgroundContents = dlgMain.grpTopLeft.add("group");
	dlgMain.grpBackgroundContents.orientation = 'row';
	dlgMain.grpBackgroundContents.alignChildren = 'left';
	dlgMain.grpBackgroundContents.add("statictext", undefined, strLabelBackgroundContents);
	dlgMain.ddBackgroundContents = dlgMain.grpBackgroundContents.add("dropdownlist");
    dlgMain.ddBackgroundContents.preferredSize.width = 210;
    dlgMain.ddBackgroundContents.alignment = 'left';
    dlgMain.ddBackgroundContents.add('item', strLabelWhite);
    dlgMain.ddBackgroundContents.add('item', strLabelTransparent);
    dlgMain.ddBackgroundContents.selection = 0;
	
	dlgMain.grpTemplate = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTemplate.orientation = 'row';
	dlgMain.grpTemplate.alignChildren = 'left';
	dlgMain.grpTemplate.add("statictext", undefined, strLabelTemplate);
	dlgMain.etTemplate = dlgMain.grpTemplate.add("edittext", undefined, bracInfo.template.toString());
	dlgMain.etTemplate.preferredSize.width = 170;
	dlgMain.btnBrowse = dlgMain.grpTemplate.add("button", undefined, strButtonBrowse);
	dlgMain.btnBrowse.onClick = function() {
		//TODO: choose the template file
		dlgMain.cbImportUrls.enabled = true;
	}
	
	dlgMain.grpImportUrls = dlgMain.grpTopLeft.add("group");
	dlgMain.grpImportUrls.orientation = 'row';
	dlgMain.grpImportUrls.alignChildren = 'left';
	dlgMain.cbImportUrls = dlgMain.grpImportUrls.add("checkbox", undefined, strLabelImportUrls);
	dlgMain.cbImportUrls.enabled = false;
	
	// -- group top right
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'center';
	
	dlgMain.btnNew = dlgMain.grpTopRight.add("button", undefined, strButtonOK);
	dlgMain.btnNew.onClick = function() {
		//TODO: create the new brac here
		dlgMain.close(newButtonID);
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
	
	// get setting from dialog
	//exportInfo.artist = ;

	return result;
}

//==============================================================================
