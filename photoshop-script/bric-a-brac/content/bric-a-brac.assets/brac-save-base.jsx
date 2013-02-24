//==============================================================================
//
// brac-save.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

//==============================================================================

function saveFile( filename, outpath, interlacedValue, transparencyValue) {
	var id6 = charIDToTypeID( "Expr" );
	var desc3 = new ActionDescriptor();
	var id7 = charIDToTypeID( "Usng" );
		var desc4 = new ActionDescriptor();
		var id8 = charIDToTypeID( "Op  " );
		var id9 = charIDToTypeID( "SWOp" );
		var id10 = charIDToTypeID( "OpSa" );
		desc4.putEnumerated( id8, id9, id10 );
		var id11 = charIDToTypeID( "Fmt " );
		var id12 = charIDToTypeID( "IRFm" );
		var id13 = charIDToTypeID( "PN24" );
		desc4.putEnumerated( id11, id12, id13 );
		var id14 = charIDToTypeID( "Intr" );
		desc4.putBoolean( id14, interlacedValue );
		var id15 = charIDToTypeID( "Trns" );
		desc4.putBoolean( id15, transparencyValue );
		var id16 = charIDToTypeID( "Mtt " );
		desc4.putBoolean( id16, true );
		var id17 = charIDToTypeID( "MttR" );
		desc4.putInteger( id17, 255 );
		var id18 = charIDToTypeID( "MttG" );
		desc4.putInteger( id18, 255 );
		var id19 = charIDToTypeID( "MttB" );
		desc4.putInteger( id19, 255 );
		var id20 = charIDToTypeID( "SHTM" );
		desc4.putBoolean( id20, false );
		var id21 = charIDToTypeID( "SImg" );
		desc4.putBoolean( id21, true );
		var id22 = charIDToTypeID( "SSSO" );
		desc4.putBoolean( id22, false );
		var id23 = charIDToTypeID( "SSLt" );
			var list1 = new ActionList();
		desc4.putList( id23, list1 );
		var id24 = charIDToTypeID( "DIDr" );
		desc4.putBoolean( id24, false );
		var id25 = charIDToTypeID( "In  " );
		desc4.putPath( id25, new File( outpath + "/" + filename + ".png") );
	var id26 = stringIDToTypeID( "SaveForWeb" );
	desc3.putObject( id7, id26, desc4 );
	executeAction( id6, desc3, DialogModes.NO );
}


//------------------------------------------------------------------------------

function px2cm(length, dpi) {
	return length * 2.54 / dpi;
}

//------------------------------------------------------------------------------

function setInvisibleAllArtLayers(obj) {
    for( var i = 0; i < obj.artLayers.length; i++) {
        obj.artLayers[i].allLocked = false;
        obj.artLayers[i].visible = false;
    }
    for( var i = 0; i < obj.layerSets.length; i++) {
        setInvisibleAllArtLayers(obj.layerSets[i]);
    }
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
	
	for (var j = 1; j < brac_xml.bric.length(); ++j) {
		try {
			var id_str = brac_xml.bric[j].@id;
			var layerset = cur_doc.layerSets.getByName(id_str);
			var bric = brac_xml.bric[j];
			var resolution = bric.@resolution.split(' ');
			var res_w = parseInt(resolution[0]);
			var res_h = parseInt(resolution[1]);
			layer = layerset.artLayers.getByName('snapshot');
			var new_w = layer.bounds[2] - layer.bounds[0];
			var new_h = layer.bounds[3] - layer.bounds[1];

			var scl_x = prcsRes(3, new_w / res_w);
			var scl_y = prcsRes(3, new_h / res_h);

			bric.@scale = scl_x; // + ' ' + scl_y;
			bric.@position = parseInt(layer.bounds[0]) + ' ' + parseInt(layer.bounds[1]);
			
			var mask = null;
			try {
				mask = layerset.artLayers.getByName('mask');
				mask.copy();
				var newdoc = app.documents.add(
					mask.bounds[2] - mask.bounds[0],
					mask.bounds[3] - mask.bounds[1],
					72, 'mask',
					NewDocumentMode.RGB,
					DocumentFill.TRANSPARENT,
				);
				newdoc.paste();
				newdoc.trim(TrimType.TRANSPARENT);
				saveFile('mask', temp_dir + '/bric.' + id_str, true, true);
				newdoc.close( SaveOptions.DONOTSAVECHANGES );
			} catch(e) {
				// there is no mask
			}
		} catch(e) {
			var id_str = brac_xml.bric[j].@id;
			delete brac_xml.bric[j];
			var dir = new Folder(temp_dir + "/bric." + id_str);
			dir.remove()
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
