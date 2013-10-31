//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// brac-new.jsx
//
//==============================================================================

#target photoshop
#include "common.jsx"

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
var strLabelTimeinterval        = 'Timeinterval';
var strLabelDescription         = 'Description';
var strLabelTemplate            = 'Template';
var strButtonBrowse             = 'Browse';
var strLabelImportUrls          = 'Import URLs';

//Buttons
var newButtonID = 1;
var cancelButtonID = 2;

//==============================================================================

function docFill2Str(df) {
	if (df == DocumentFill.BACKGROUNDCOLOR)
		return 'Background Color';
	else if (df == DocumentFill.WHITE)
		return 'White';
	else if (df == DocumentFill.TRANSPARENT)
		return 'Transparent';
}

//==============================================================================

function Str2DocFill(df) {
	if (df == 'Background Color')
		return DocumentFill.BACKGROUNDCOLOR;
	else if (df == 'White')
		return DocumentFill.WHITE;
	else if (df == 'Transparent')
		return DocumentFill.TRANSPARENT;
}

//==============================================================================

function initBracInfo(bracInfo) {
	bracInfo.version    = '1.0';
	bracInfo.name       = '';
	bracInfo.artist     = '';
	bracInfo.tags       = '';
	bracInfo.width      = '1366';
	bracInfo.height     = '768';
	bracInfo.resolution = '72';
	bracInfo.template   = '';
	bracInfo.importUrls = false;
	bracInfo.timeinterval = '00-00 00:00:00';
	bracInfo.description = '';
	bracInfo.background = '';
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
    dlgMain.ddBackgroundContents.add('item', docFill2Str(DocumentFill.BACKGROUNDCOLOR));
    dlgMain.ddBackgroundContents.add('item', docFill2Str(DocumentFill.WHITE));
    dlgMain.ddBackgroundContents.add('item', docFill2Str(DocumentFill.TRANSPARENT));
    dlgMain.ddBackgroundContents.selection = 0;
	
	dlgMain.grpTimeinterval = dlgMain.grpTopLeft.add("group");
	dlgMain.grpTimeinterval.orientation = 'row';
	dlgMain.grpTimeinterval.alignChildren = 'left';
	dlgMain.grpTimeinterval.add("statictext", undefined, strLabelTimeinterval);
	dlgMain.etTimeinterval = dlgMain.grpTimeinterval.add("edittext", undefined, bracInfo.timeinterval.toString());
	dlgMain.etTimeinterval.preferredSize.width = 210;
	
	dlgMain.grpDescription = dlgMain.grpTopLeft.add("group");
	dlgMain.grpDescription.orientation = 'row';
	dlgMain.grpDescription.alignChildren = 'left';
	dlgMain.grpDescription.add("statictext", undefined, strLabelDescription);
	dlgMain.etDescription = dlgMain.grpDescription.add("edittext", undefined, bracInfo.description.toString());
	dlgMain.etDescription.preferredSize.width = 210;
	
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
		bracInfo.name         = dlgMain.etName        .text;
		bracInfo.artist       = dlgMain.etArtist      .text;
		bracInfo.tags         = dlgMain.etTags        .text;
		bracInfo.resolution   = parseInt(dlgMain.ddResolution.selection == 0 ? dlgMain.etResolution.text : dlgMain.etResolution.text / 2.54);
		bracInfo.width        = unit2pixel(dlgMain.ddWidth.selection, bracInfo.resolution, dlgMain.etWidth.text);
		bracInfo.height       = unit2pixel(dlgMain.ddHeight.selection, bracInfo.resolution, dlgMain.etHeight.text);
		bracInfo.template     = dlgMain.etTemplate    .text;
		bracInfo.importUrls   = dlgMain.cbImportUrls  .value;
		bracInfo.timeinterval = dlgMain.etTimeinterval.text;
		bracInfo.description  = dlgMain.etDescription .text;
		bracInfo.background   = dlgMain.ddBackgroundContents.selection.text;
		createNewBrac(bracInfo);
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

//------------------------------------------------------------------------------

function createNewBrac(bracInfo) {
	
	setEnv();
	
	var ts = new Date().getTime();
	var brac_dir = Folder.temp + "/" + ts;
	//brac_dir = "/C/Users/Faham/AppData/Local/Temp/" + ts;
	var out_dir = new Folder(brac_dir);
	out_dir.create();
	var doc_name = bracInfo.name;
	
	var brac_xml = new XML();
	brac_xml = XML('<brac><layers></layers></brac>');
	brac_xml.@artist       = bracInfo.artist;
	brac_xml.@dpi          = bracInfo.resolution;
	brac_xml.@name         = bracInfo.name;
	brac_xml.@resolution   = bracInfo.width + ' ' + bracInfo.height;
	brac_xml.@tags         = bracInfo.tags;
	brac_xml.@timeinterval = bracInfo.timeinterval;
	brac_xml.@version      = bracInfo.version;
	
	var brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	brac_xml_file.open("w");
	brac_xml_file.write(brac_xml);
	brac_xml_file.close();
	
	// Create and save the PSD file
	var new_doc = app.documents.add(
		parseInt(bracInfo.width),
		parseInt(bracInfo.height),
		bracInfo.resolution,
		doc_name,
		NewDocumentMode.RGB,
		Str2DocFill(bracInfo.background), 1);

	_saveoptions = new PhotoshopSaveOptions();
	_saveoptions.alphaChannels     = true;
	_saveoptions.annotations       = true;
	_saveoptions.embedColorProfile = true;
	_saveoptions.layers            = true;
	_saveoptions.spotColors        = true;

	var psd_file = new File(brac_dir + "/" + "brac.psd");
	new_doc.saveAs(psd_file, _saveoptions, false, Extension.LOWERCASE);
	// Set environment variables
	var desc = new ActionDescriptor();
	desc.putString(0, '');
	desc.putString(1, brac_dir);
	app.putCustomOptions(new_doc.fullName, desc, true);
	resetEnv();
}

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

//==============================================================================

main();

//==============================================================================
