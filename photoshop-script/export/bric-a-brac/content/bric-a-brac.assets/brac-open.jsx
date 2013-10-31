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
#include "common.jsx"
#include "7zip.jsx"

//==============================================================================

function loadImage(doc, filepath) {
	var idPlc = charIDToTypeID( "Plc " );
		var desc4 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
		desc4.putPath( idnull, new File( filepath ) );
		var idFTcs = charIDToTypeID( "FTcs" );
		var idQCSt = charIDToTypeID( "QCSt" );
		var idQcsa = charIDToTypeID( "Qcsa" );
		desc4.putEnumerated( idFTcs, idQCSt, idQcsa );
	executeAction( idPlc, desc4, DialogModes.NO );
}

//------------------------------------------------------------------------------

function addLayerMask() {
	var idMk = charIDToTypeID( "Mk  " );
		var desc256 = new ActionDescriptor();
		var idNw = charIDToTypeID( "Nw  " );
		var idChnl = charIDToTypeID( "Chnl" );
		desc256.putClass( idNw, idChnl );
		var idAt = charIDToTypeID( "At  " );
			var ref165 = new ActionReference();
			var idChnl = charIDToTypeID( "Chnl" );
			var idChnl = charIDToTypeID( "Chnl" );
			var idMsk = charIDToTypeID( "Msk " );
			ref165.putEnumerated( idChnl, idChnl, idMsk );
		desc256.putReference( idAt, ref165 );
		var idUsng = charIDToTypeID( "Usng" );
		var idUsrM = charIDToTypeID( "UsrM" );
		var idRvlA = charIDToTypeID( "RvlA" );
		desc256.putEnumerated( idUsng, idUsrM, idRvlA );
	executeAction( idMk, desc256, DialogModes.NO );
}

//------------------------------------------------------------------------------

function BracOpen() {

	var SevenZip = get7zip();
	if (!SevenZip)
		return;

	setEnv();

	var f = null;
	if ('windows' == getOS()) {
		f = File(openDialog("Open File", "Brac File:*.brac;All Files:*.*"));
	} else if ('macos' == getOS()) {
		f = File(openDialog("Open File", function (filename) {
			if (filename.substr(-4).toLowerCase() == 'brac')
				return true;
			else
				return false;
		}));
	}

	if (!f.exists) {
		//alert("Brac file " + f.fsName + " not found!");
		return;
	}

	var brac = f;
	var ts = new Date().getTime();
	var brac_dir = Folder.temp + "/" + ts;
	var out_dir = new Folder(brac_dir);
	var info = SevenZip.extract_v(brac, out_dir);
	var doc_name = ts + '-' + brac.name.split('.')[0];
	
	var psd_file = new File(brac_dir + "/" + "brac.psd");
	if (!psd_file.exists) {
		alert("Brac definition PSD file (brac.psd) not found!");
		return;
	}
	var new_brac_doc = app.open(psd_file);
	
	// brac initial brac file object
	// brac_dir temporary extracted brac directory path string
	var desc = new ActionDescriptor();
	desc.putString(0, brac.fullName); // brac file name
	desc.putString(1, brac_dir); // brac temp directory
	app.putCustomOptions(new_brac_doc.fullName, desc, true);

	var brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	if (!brac_xml_file.exists) {
		alert("Brac definition file (brac.xml) not found!");
		return;
	}
	brac_xml_file.open("r");
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();

	// Create the multi-layered image
	//TODO: fix the add method parameters.
	/*
	var resolution = brac_xml.@resolution.split(' ');
	var dpi = parseInt(brac_xml.@dpi);

	doc_w_px = parseInt(resolution[0]);
	doc_h_px = parseInt(resolution[1]);
	
	var new_brac_doc = app.documents.add(doc_w_px, doc_h_px, dpi, doc_name
		, NewDocumentMode.RGB
		, DocumentFill.TRANSPARENT, 1);
	*/
	
	var first_bric = true;
	
	// sorting by zindex
	var ordered_lyrs = [];
	for (var i = 0; i < brac_xml.layers.children().length(); ++i)
		ordered_lyrs[i] = [i, brac_xml.layers.children()[i].@order]
	
	for (var i = 0; i < ordered_lyrs.length; ++i) {
		for (var j = i + 1; j < ordered_lyrs.length; ++j) {
			if (ordered_lyrs[i][1] > ordered_lyrs[j][1]) {
				temp = ordered_lyrs[j];
				ordered_lyrs[j] = ordered_lyrs[i];
				ordered_lyrs[i] = temp;
			}
		}
	}
	
	for (var i = 0; i < ordered_lyrs.length; ++i) {
		var lyr = brac_xml.layers.children()[ordered_lyrs[i][0]];
		
		if (lyr.name() == 'static') {
			/*
			var filepath = brac_dir + '/' + lyr.@name + '.' + lyr.@id + '.png';
			
			var f = new File(filepath);
			if (!f.exists) {
				alert("Image file not found! \n\n" + f.fsName);
				continue;
			}
			
			loadImage(new_brac_doc, filepath);
			static_img = new_brac_doc.artLayers[0];
			static_img.rasterize(RasterizeType.ENTIRELAYER);
			
			static_img.name    = lyr.@id + ' - ' + lyr.@name;
			static_img.opacity = lyr.@alpha * 100;
			var position       = lyr.@position.split(' ');
			var mv_x           = parseFloat(position[0]);
			var mv_y           = parseFloat(position[1]);
			
			static_img.translate(mv_x - parseInt(static_img.bounds[0]), mv_y - parseInt(static_img.bounds[1]));
			new_brac_doc.activeLayer = static_img;
			first_bric = false;
			*/
		} else if (lyr.name() == 'bric') {
		
			var bric = lyr;
			
			if (getLayerIndex(bric.@id, new_brac_doc) != -1)
				continue;
			
			// extracting bric details
			var bric_dir = brac_dir + "/bric." + bric.@id;
			var bric_xml_file = new File(bric_dir + "/bric.xml");

			if (!bric_xml_file.exists) {
				alert("Bric XML file not found! \n\n" + bric_xml_file.fsName);
				continue;
			}

			bric_xml_file.open("r");
			var bric_xml = new XML(bric_xml_file.read());
			bric_xml_file.close();

			var title              = bric_xml.@title;
			var scale              = bric.@scale.split(' ');
			var sc_w               = parseFloat(scale[0]);
			var sc_h               = parseFloat(scale[1]);
			var position           = bric.@position.split(' ');
			var mv_x               = parseFloat(position[0]);
			var mv_y               = parseFloat(position[1]);
			var rt_deg             = parseFloat(bric.@rotate);
			var bric_snapshot_path = bric_dir + "/thumb.png";
			var bric_mask_path     = bric_dir + "/mask.png";
			
			var bric_snapshot = new File(bric_snapshot_path);
			if (!bric_snapshot.exists) {
				alert("Snapshot could not be found! \n\n" + bric_snapshot.fsName);
				continue;
			}
			
			var bric_layerset = null;
			// creating bric layer group
			if (!first_bric)
				bric_layerset = new_brac_doc.layerSets.add();
			
			loadImage(new_brac_doc, bric_snapshot_path);
			lyr_screenshot = new_brac_doc.artLayers[0];
			lyr_screenshot.name = 'snapshot';
			
			w_n = lyr_screenshot.bounds[2] - lyr_screenshot.bounds[0];
			h_n = lyr_screenshot.bounds[3] - lyr_screenshot.bounds[1];
			w_o = parseInt(bric_xml.@region.split(' ')[2]);
			h_o = parseInt(bric_xml.@region.split(' ')[3]);
			sc_w_n = sc_w * w_o / w_n;
			sc_h_n = sc_h * h_o / h_n;
			
			lyr_screenshot.resize(sc_w_n * 100.0, sc_h_n * 100.0); //relative to layer's initial size (bric)
			lyr_screenshot.translate(mv_x - parseInt(lyr_screenshot.bounds[0]), mv_y - parseInt(lyr_screenshot.bounds[1])); //relative to layer's last position (bric)
			lyr_screenshot.rotate(rt_deg);

			// creating bric layer group
			if (first_bric)
				bric_layerset = new_brac_doc.layerSets.add();
				
			bric_layerset.name = bric.@id + ' - ' + title;
			bric_layerset.opacity = bric.@alpha * 100.0;
			
			//loading layer mask
			var bric_mask = new File(bric_mask_path);
			
			if (!bric_mask.exists) {
				lyr_screenshot.move(bric_layerset, ElementPlacement.INSIDE);
			} else {
				loadImage(new_brac_doc, bric_mask_path);
				var lyr_mask = new_brac_doc.artLayers[0];
				lyr_mask.move(bric_layerset, ElementPlacement.INSIDE);
								
				var maskposition       = bric.@maskposition.split(' ');
				var mmv_x              = parseFloat(maskposition[0]);
				var mmv_y              = parseFloat(maskposition[1]);
				
				lyr_mask.translate(mmv_x - parseInt(lyr_mask.bounds[0]), mmv_y - parseInt(lyr_mask.bounds[1]));
				lyr_mask.rotate(rt_deg);

				lyr_mask.rasterize(RasterizeType.ENTIRELAYER);
				lyr_screenshot.move(bric_layerset, ElementPlacement.INSIDE);
				lyr_screenshot.grouped = true;
			}
			
			new_brac_doc.activeLayer = bric_layerset;
			first_bric = false;
		}
	}

	resetEnv();
};

//==============================================================================

BracOpen();

//==============================================================================

// EOF
