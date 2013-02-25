
//==============================================================================

#target photoshop

//==============================================================================

//UI Strings
var strLabelVersion = 'Version: ';
var strTitle        = 'New Brac';
var strLabelName    = 'Name';
var strLabelArtist  = 'Artist';
var strLabelTags    = 'Tags';
var strButtonNew    = 'New';
var strButtonCancel = 'Cancel';

//Buttons
var newButtonID = 1;
var cancelButtonID = 2;

//==============================================================================

function main() {
    var bracInfo = new Object();
    initBracInfo(bracInfo);
	
	if ( DialogModes.ALL == app.playbackDisplayDialogs ) {
		if (cancelButtonID == settingDialog(bracInfo)) {
			return 'cancel';
		}
	}
	
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
	bracInfo.version = 1.0;
	bracInfo.name   = '';
	bracInfo.artist = '';
	bracInfo.tags   = '';
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
	dlgMain.grpTopLeft.alignChildren = 'left';
	dlgMain.grpTopLeft.alignment = 'fill';
	
	dlgMain.grpTopLeft.add("statictext", undefined, strLabelVersion + bracInfo.version.toString());

	dlgMain.grpTopLeft.add("statictext", undefined, strLabelName);
	dlgMain.etName = dlgMain.grpTopLeft.add("edittext", undefined, bracInfo.name.toString());
	dlgMain.etName.preferredSize.width = 160;

	dlgMain.grpTopLeft.add("statictext", undefined, strLabelArtist);
	dlgMain.etArtist = dlgMain.grpTopLeft.add("edittext", undefined, bracInfo.artist.toString());
	dlgMain.etArtist.preferredSize.width = 160;

	dlgMain.grpTopLeft.add("statictext", undefined, strLabelTags);
	dlgMain.etTags = dlgMain.grpTopLeft.add("edittext", undefined, bracInfo.tags.toString());
	dlgMain.etTags.preferredSize.width = 160;

	dlgMain.btnNew = dlgMain.grpSecondLine.add("button", undefined, strButtonNew);
	dlgMain.btnNew.onClick = function() {
		//TODO: create the new brac here
		dlgMain.close(newButtonID);
	}
	
	dlgMain.btnCancel = dlgMain.grpSecondLine.add("button", undefined, strButtonCancel);
	dlgMain.btnCancel.onClick = function() {
		dlgMain.close(cancelButtonID); 
	}
/*

	// -- the third line in the dialog
	dlgMain.grpTopLeft.add("statictext", undefined, strLabelFileNamePrefix);

	// -- the fourth line in the dialog
	dlgMain.etFileNamePrefix = dlgMain.grpTopLeft.add("edittext", undefined, exportInfo.fileNamePrefix.toString());
	dlgMain.etFileNamePrefix.alignment = 'fill';
	dlgMain.etFileNamePrefix.preferredSize.width = StrToIntWithDefault( stretDestination, 160 );

	// -- the fifth line in the dialog
	dlgMain.cbVisible = dlgMain.grpTopLeft.add("checkbox", undefined, strCheckboxVisibleOnly);
	dlgMain.cbVisible.value = exportInfo.visibleOnly;

	// -- the sixth line is the panel
	dlgMain.pnlFileType = dlgMain.grpTopLeft.add("panel", undefined, strLabelFileType);
	dlgMain.pnlFileType.alignment = 'fill';
	
	// -- now a dropdown list
	dlgMain.ddFileType = dlgMain.pnlFileType.add("dropdownlist");
	dlgMain.ddFileType.preferredSize.width = StrToIntWithDefault( strddFileType, 100 );
	dlgMain.ddFileType.alignment = 'left';

	dlgMain.ddFileType.add("item", "BMP");
	dlgMain.ddFileType.add("item", "JPEG");
	dlgMain.ddFileType.add("item", "PDF");
	dlgMain.ddFileType.add("item", "PSD");
	dlgMain.ddFileType.add("item", "Targa");
	dlgMain.ddFileType.add("item", "TIFF");
	dlgMain.ddFileType.add("item", "PNG-8");
	dlgMain.ddFileType.add("item", "PNG-24");

	dlgMain.ddFileType.onChange = function() {
	}
	
	dlgMain.ddFileType.items[exportInfo.fileType].selected = true;

	// -- now after all the radio buttons
	dlgMain.cbIcc = dlgMain.pnlFileType.add("checkbox", undefined, strCheckboxIncludeICCProfile);
	dlgMain.cbIcc.value = exportInfo.icc;
	dlgMain.cbIcc.alignment = 'left';

	// -- now the options panel that changes
	dlgMain.pnlFileType.pnlOptions = dlgMain.pnlFileType.add("panel", undefined, "Options");
	dlgMain.pnlFileType.pnlOptions.alignment = 'fill';
	dlgMain.pnlFileType.pnlOptions.orientation = 'stack';
	dlgMain.pnlFileType.pnlOptions.preferredSize.height = StrToIntWithDefault( strpnlOptions, 100 );

	// PSD options
	dlgMain.pnlFileType.pnlOptions.grpPSDOptions = dlgMain.pnlFileType.pnlOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpPSDOptions.cbMax = dlgMain.pnlFileType.pnlOptions.grpPSDOptions.add("checkbox", undefined, strCheckboxMaximizeCompatibility);
	dlgMain.pnlFileType.pnlOptions.grpPSDOptions.cbMax.value = exportInfo.psdMaxComp;
	dlgMain.pnlFileType.pnlOptions.grpPSDOptions.visible = (exportInfo.fileType == psdIndex);
	
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.onChange = function() {
		if (this.selection.index == compJPEGIndex) {
			dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = true;
			dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = true;
		} else {
			dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = false;
			dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = false;
		}
	}

	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.alignment = 'left';
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.add("statictext", undefined, strLabelQuality);
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.add("edittext", undefined, exportInfo.tiffJpegQuality.toString());
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.preferredSize.width = StrToIntWithDefault( stretQuality, 30 );
	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.graphics.disabledBackgroundColor = brush;

	var index;
	switch (exportInfo.tiffCompression) {
		case TIFFEncoding.NONE:	 index = compNoneIndex; break;
		case TIFFEncoding.TIFFLZW:  index = compLZWIndex; break;
		case TIFFEncoding.TIFFZIP:  index = compZIPIndex; break;
		case TIFFEncoding.JPEG:	 index = compJPEGIndex; break;
		default: index = compNoneIndex;	break;
	}

	dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.items[index].selected = true;

	if (TIFFEncoding.JPEG != exportInfo.tiffCompression) { // if not JPEG
		dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = false;
		dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = false;
	}
	

	// PDF options
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions = dlgMain.pnlFileType.pnlOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.orientation = 'column';
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.visible = (exportInfo.fileType == pdfIndex);

	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.alignment = 'left';
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("statictext", undefined, strLabelEncoding);

	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("radiobutton", undefined, "ZIP");
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip.onClick = function() {
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = false;   
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = false;   
	}

	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("radiobutton", undefined, "JPEG");
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg.onClick = function() {
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = true;   
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = true;   
	}
	
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.alignment = 'left';
	
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.add("statictext", undefined, strLabelQuality);

	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.add("edittext", undefined, exportInfo.pdfJpegQuality.toString());
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.preferredSize.width = StrToIntWithDefault( stretQuality, 30 );
	dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.graphics.disabledBackgroundColor = brush;

	switch (exportInfo.pdfEncoding) {
		case PDFEncoding.PDFZIP: 
			dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip.value  = true;	break;
		case PDFEncoding.JPEG:
		default: 
			dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg.value = true;	break;
	}
	
	if (PDFEncoding.JPEG != exportInfo.pdfEncoding) {
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = false;
		dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = false;
	}

	// Targa options
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions = dlgMain.pnlFileType.pnlOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add("statictext", undefined, strLabelDepth);
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions.visible = (exportInfo.fileType == targaIndex);
	
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb16bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add( "radiobutton", undefined, strRadiobutton16bit);
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add( "radiobutton", undefined, strRadiobutton24bit);
	dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb32bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add( "radiobutton", undefined, strRadiobutton32bit);

	switch (exportInfo.targaDepth) {
		case TargaBitsPerPixels.SIXTEEN:	 dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb16bit.value = true;   break;
		case TargaBitsPerPixels.TWENTYFOUR:  dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit.value = true;   break;
		case TargaBitsPerPixels.THIRTYTWO:   dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb32bit.value = true;   break;
		default: dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit.value = true;   break;
	}


	// BMP options
	dlgMain.pnlFileType.pnlOptions.grpBMPOptions = dlgMain.pnlFileType.pnlOptions.add("group");
	dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add("statictext", undefined, strLabelDepth);
	dlgMain.pnlFileType.pnlOptions.grpBMPOptions.visible = (exportInfo.fileType == bmpIndex);

	dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb16bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add( "radiobutton", undefined, strRadiobutton16bit);
	dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add( "radiobutton", undefined, strRadiobutton24bit);
	dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb32bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add( "radiobutton", undefined, strRadiobutton32bit);

	switch (exportInfo.bmpDepth) {
		case BMPDepthType.SIXTEEN:   dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb16bit.value = true;   break;
		case BMPDepthType.TWENTYFOUR:dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit.value = true;   break;
		case BMPDepthType.THIRTYTWO: dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb32bit.value = true;   break;
		default: dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit.value = true;   break;
	}

	// the right side of the dialog, the ok and cancel buttons
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'fill';
	
	dlgMain.btnRun = dlgMain.grpTopRight.add("button", undefined, strButtonRun );

	dlgMain.btnRun.onClick = function() {
		// check if the setting is properly
		var destination = dlgMain.etDestination.text;
		if (destination.length == 0) {
			alert(strAlertSpecifyDestination);
			return;
		}
		var testFolder = new Folder(destination);
		if (!testFolder.exists) {
			alert(strAlertDestinationNotExist);
			return;
		}
	
		dlgMain.close(runButtonID);
	}

	dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel );

	dlgMain.btnCancel.onClick = function() { 
		dlgMain.close(cancelButtonID); 
	}

	dlgMain.defaultElement = dlgMain.btnRun;
	dlgMain.cancelElement = dlgMain.btnCancel;

   	// the bottom of the dialog
	dlgMain.grpBottom = dlgMain.add("group");
	dlgMain.grpBottom.orientation = 'column';
	dlgMain.grpBottom.alignChildren = 'left';
	dlgMain.grpBottom.alignment = 'fill';
	
	dlgMain.pnlHelp = dlgMain.grpBottom.add("panel");
	dlgMain.pnlHelp.alignment = 'fill';

	dlgMain.etHelp = dlgMain.pnlHelp.add("statictext", undefined, strHelpText, {multiline:true});
	dlgMain.etHelp.alignment = 'fill';
	
	dlgMain.onShow = function() {
		dlgMain.ddFileType.onChange();
	}
*/
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
