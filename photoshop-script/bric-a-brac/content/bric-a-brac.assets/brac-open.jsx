//==============================================================================
//
// brac-open.jsx
//
//==============================================================================

#target photoshop 
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
	
	// brac initial brac file object
	// brac_dir temporary extracted brac directory path string
	var desc = new ActionDescriptor();
	desc.putString(0, brac.fullName); // brac file name
	desc.putString(1, brac_dir); // brac temp directory
	app.putCustomOptions(doc_name, desc, true);

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
	var resolution = brac_xml.@resolution.split(' ');
	var dpi = parseInt(brac_xml.@dpi);

	doc_w_px = parseInt(resolution[0]);
	doc_h_px = parseInt(resolution[1]);
	
	var new_brac_doc = app.documents.add(doc_w_px, doc_h_px, dpi, doc_name
		, NewDocumentMode.RGB
		, DocumentFill.TRANSPARENT, 1);
		
	var nbric = brac_xml.bric.length();
	
	var first_bric = true;
	
	for (var i = 0; i < nbric; ++i) {
		var bric = brac_xml.bric[i];

		// extracting bric details
		var bric_dir = brac_dir + "/bric." + bric.@id;
		var bric_xml_file = new File(bric_dir + "/bric.xml");

		if (!bric_xml_file.exists) {
			alert("Bric XML file " + bric_xml_file.fsName + " not found!");
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
			alert("Snapshot " + bric_snapshot.fsName + " could not be found!");
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
		
		//loading layer mask
		var bric_mask = new File(bric_mask_path);
		
		if (!bric_mask.exists) {
			lyr_screenshot.move(bric_layerset, ElementPlacement.INSIDE);
		} else {
			loadImage(new_brac_doc, bric_mask_path);
			var lyr_mask = new_brac_doc.artLayers[0];
			lyr_mask.move(bric_layerset, ElementPlacement.INSIDE);
			
			w_n = lyr_mask.bounds[2] - lyr_mask.bounds[0];
			h_n = lyr_mask.bounds[3] - lyr_mask.bounds[1];
			w_o = parseInt(bric_xml.@region.split(' ')[2]);
			h_o = parseInt(bric_xml.@region.split(' ')[3]);
			sc_w_n = sc_w * w_o / w_n;
			sc_h_n = sc_h * h_o / h_n;
			
			lyr_mask.resize(sc_w_n * 100.0, sc_h_n * 100.0);
			lyr_mask.translate(mv_x - parseInt(lyr_mask.bounds[0]), mv_y - parseInt(lyr_mask.bounds[1]));
			lyr_mask.rotate(rt_deg);

			lyr_mask.rasterize(RasterizeType.ENTIRELAYER);
			lyr_screenshot.move(bric_layerset, ElementPlacement.INSIDE);
			lyr_screenshot.grouped = true;
		}
		
		first_bric = false;
	}

	resetEnv();
};

//==============================================================================

BracOpen();

//==============================================================================

// EOF
