//==============================================================================
//
// brac-save-as.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

//==============================================================================

function pixel2centimeter(length, dpi) {
	return length * 2.54 / dpi;
}

//------------------------------------------------------------------------------

function main() {
	var cur_doc = app.activeDocument;
	var desc = app.getCustomOptions(cur_doc.name);
	var temp_dir = new Folder(desc.getString(1));

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
				var init_width = pixel2centimeter(resolution[0], brac_xml.@dpi);
				var init_height = pixel2centimeter(resolution[1], brac_xml.@dpi);
				var new_width = layer.bounds[2] - layer.bounds[0];
				var new_height = layer.bounds[3] - layer.bounds[1];
				var resolution = brac_xml.bric[j].@resolution.split(' ');
				resolution[0] = parseInt(resolution[0]); resolution[1] = parseInt(resolution[1]); 
				var scale = parseFloat(new_width / resolution[0]) + ' ' + parseFloat(new_height / resolution[1]);
				brac_xml.bric[j].@scale = scale;

				//var new_x = parseFloat((layer.bounds[0] + layer.bounds[2]) * 0.5 / cur_doc.width);
				//new_x = new_x - 0.5;
				//var new_y = parseFloat((layer.bounds[1] + layer.bounds[3]) * 0.5 / cur_doc.height);
				//new_y = new_y - 0.5;
				//var position = new_x + ' ' + new_y;
				brac_xml.bric[j].@position = parseInt(layer.bounds[0]) + ' ' + parseInt(layer.bounds[1]);
			}
		}
		//alert(brac_xml.bric[0].@position);
	}
	
	brac_xml_file.open('w');
	brac_xml_file.write(brac_xml);
	brac_xml_file.close();
	
	var target_filename = new File(desc.getString(0));
	if (target_filename.exists)
		target_filename.remove();
	SevenZip.archive(target_filename, temp_dir.getFiles());
	//app.eraseCustomOptions(cur_doc.name);
};

//==============================================================================

main();

//==============================================================================

// EOF
