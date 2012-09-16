//==============================================================================
//
// brac-save.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

//==============================================================================

function px2cm(length, dpi) {
	return length * 2.54 / dpi;
}

//------------------------------------------------------------------------------

function saveAs(temp_dir, target_filename) {

	var SevenZip = get7zip();
	if (!SevenZip)
		return;

	setEnv();

	var cur_doc = app.activeDocument;
	var brac_xml_file = new File(temp_dir + "/" + "brac.xml");
	brac_xml_file.open('rw');
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();
	
	for (var i = 0; i < cur_doc.artLayers.length; ++i) {
		for (var j = 0; j < brac_xml.bric.length(); ++j) {
			var bric = brac_xml.bric[j];
			var id = bric.@id;
			var layer = cur_doc.artLayers[i];
			if (id == layer.name) {
				var resolution = bric.@resolution.split(' ');
				var res_w = parseInt(resolution[0]);
				var res_h = parseInt(resolution[1]);

				var new_w = layer.bounds[2] - layer.bounds[0];
				var new_h = layer.bounds[3] - layer.bounds[1];

				var scl_x = prcsRes(3, new_w / res_w);
				var scl_y = prcsRes(3, new_h / res_h);

				brac_xml.bric[j].@scale = scl_x;// + ' ' + scl_y;
				brac_xml.bric[j].@position = parseInt(layer.bounds[0]) + ' ' + parseInt(layer.bounds[1]);
			}
		}
	}
	
	brac_xml_file.open('w');
	brac_xml_file.write(brac_xml);
	brac_xml_file.close();
	
	if (target_filename.exists)
		target_filename.remove();

	SevenZip.archive(target_filename, temp_dir.getFiles());

	resetEnv();
}

//------------------------------------------------------------------------------
	

//==============================================================================

// EOF
