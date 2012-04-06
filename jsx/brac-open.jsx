//==============================================================================
//
// brac-open.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

//==============================================================================

function main() {
	// Bricing the brac file.
	var brac = File(openDialog());
	var ts = new Date().getTime();
	var extract_dir = Folder.temp + "/" + ts;
	var out_dir = new Folder(extract_dir);
	var info = SevenZip.extract_v(brac, out_dir);

	var brac_dir = extract_dir;
	//alert(brac_dir);
	brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	if (!brac_xml_file.exists) {
		brac_dir = extract_dir + "/" + brac.name.split('.')[0];
		//alert(brac_dir);
		brac_xml_file = new File(brac_dir + "/" + "brac.xml");
	}
	brac_xml_file.open("r");
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();
	//alert(brac_xml);

	// Create the multi-layered image
	//TODO: fix the add method parameters.
	var new_brac_doc = app.documents.add(100, 100, 72, "Merged Samples", NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
	var nbric = brac_xml.bric.length();
	for (var i = 0; i < nbric; ++i) {
		var bric = brac_xml.bric[i];
		var bric_dir = brac_dir + "/bric." + bric.@id;
		var bric_xml_file = new File(bric_dir + "/bric." + bric.@id + ".xml");
		if (!bric_xml_file.exists) {
			alert("Bric XML file " + bric_xml_file.fsName + " could not be found!");
			continue;
		}
		bric_xml_file.open("r");
		var bric_xml = new XML(bric_xml_file.read());
		bric_xml_file.close();
		var bric_cur_snpsht_filename = bric_dir + "/" + bric.@revision + "." + bric_xml.@snapshot_ext;
		//alert (bric_cur_snpsht_filename);
		var bric_cur_snpsht = new File(bric_cur_snpsht_filename);
		//alert(bric_cur_snpsht.fsName);
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
		//layer.kind = LayerKind.SMARTOBJECT;
		layer.name = bric.@id;
		
		//*/
		//This changes its kind to SmartObject
		var idnewPlacedLayer = stringIDToTypeID( "newPlacedLayer" );
		executeAction( idnewPlacedLayer, undefined, DialogModes.NO );
		
		// I'm getting the layer again, cause making it SmartObject changes its prior identification
		layer = new_brac_doc.artLayers[0];
		//*/

		var scale = bric.@scale.split(' ');
		var l_width = layer.bounds[2] - layer.bounds[0];
		var l_height = layer.bounds[3] - layer.bounds[1];
		layer.resize(new_brac_doc.width * scale[0] * 100.0 / l_width, new_brac_doc.height * scale[1] * 100.0 / l_height); //relative to document (brac)
		layer.rotate(parseFloat(bric.@rotate));
		var position = bric.@position.split(' ');
		layer.translate(new_brac_doc.width * position[0], new_brac_doc.height * position[1]); //relative to document (brac)
		alert(layer.bounds);
	}
};

//==============================================================================

main();

//==============================================================================

// EOF
