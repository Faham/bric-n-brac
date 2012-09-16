//==============================================================================
//
// brac-open.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

//==============================================================================

function BracOpen() {

	var SevenZip = get7zip();
	if (!SevenZip)
		return;

	setEnv();

	var f = null;
	if ('windows' == getOS()) {
		f = File(openDialog("Open File", "Zip File:*.zip;All Files:*.*"));
	} else if ('macos' == getOS()) {
		f = File(openDialog("Open File", function (filename) {
			if (filename.substr(-3).toLowerCase() == 'zip')
				return true;
			else
				return false;
		}));
	}

	if(!f.exists)
		return;

	var brac = f;

	var ts = new Date().getTime();
	var extract_dir = Folder.temp + "/" + ts;
	var out_dir = new Folder(extract_dir);
	
	var info = SevenZip.extract_v(brac, out_dir);
	
	var brac_dir = extract_dir;
	var brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	if (!brac_xml_file.exists) {
		brac_dir = extract_dir + "/" + brac.name.split('.')[0];
		brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	}
	brac_xml_file.open("r");
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();

	// Create the multi-layered image
	//TODO: fix the add method parameters.
	var doc_name = ts + '-' + brac.name.split('.')[0];
	var resolution = brac_xml.@resolution.split(' ');
	var dpi = parseInt(brac_xml.@dpi);

	doc_w_px = parseInt(resolution[0]);
	doc_h_px = parseInt(resolution[1]);
	
	var new_brac_doc = app.documents.add(doc_w_px, doc_h_px, dpi, doc_name
		, NewDocumentMode.RGB
		, DocumentFill.TRANSPARENT, 1);
		
	var nbric = brac_xml.bric.length();
	for (var i = 0; i < nbric; ++i) {
		var bric = brac_xml.bric[i];
		var bric_dir = brac_dir + "/bric." + bric.@id;
		var bric_xml_file = new File(bric_dir + "/bric.xml");

		if (!bric_xml_file.exists) {
			alert("Bric XML file " + bric_xml_file.fsName + " not found!");
			continue;
		}

		bric_xml_file.open("r");
		var bric_xml = new XML(bric_xml_file.read());
		bric_xml_file.close();
		var bric_cur_snpsht_filename = bric_dir + "/" + bric.@revision + ".png";
		var bric_cur_snpsht = new File(bric_cur_snpsht_filename);

		if (!bric_cur_snpsht.exists) {
			alert("Snapshot " + bric_cur_snpsht.fsName + " could not be found!");
			continue;
		}

		var tmp_doc = open(bric_cur_snpsht);
		tmp_doc.flatten();
		tmp_doc.selection.selectAll();
		tmp_doc.selection.copy();
		tmp_doc.close(SaveOptions.DONOTSAVECHANGES);
		var layer = new_brac_doc.paste();
		layer.name = bric.@id;
		
		//This changes its type to SmartObject
		var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
		executeAction( idnewPlacedLayer, undefined, DialogModes.NO );
		
		// I'm getting the layer again, cause making it SmartObject changes its prior identification
		layer = new_brac_doc.artLayers[0];
		
		//var resolution = bric.@resolution.split(' ');
		//resolution[0] = parseInt(resolution[0]); resolution[1] = parseInt(resolution[1]);

		var scale = parseFloat(bric.@scale);
		var l_width = scale * 100;
		var l_height = scale * 100;
		layer.resize(l_width, l_height); //relative to layer's initial size (bric)
		
		//layer.rotate(parseFloat(bric.@rotate));
		
		var position = bric.@position.split(' ');
		pos_x_px = parseInt(position[0]);
		pos_y_px = parseInt(position[1]);
		layer.translate(pos_x_px - parseInt(layer.bounds[0]), pos_y_px - parseInt(layer.bounds[1])); //relative to layer's last position (bric)
	}

	// brac initial brac file object
	// brac_dir temporary extracted brac directory path string
	var desc = new ActionDescriptor();
	desc.putString(0, brac.fullName); // brac file name
	desc.putString(1, brac_dir); // brac temp directory
	app.putCustomOptions(doc_name, desc, true);

	resetEnv();
};

//==============================================================================

BracOpen();

//==============================================================================

// EOF
