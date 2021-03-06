﻿//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// brac-save.jsx
//
//==============================================================================

#target photoshop
#include "common.jsx"
#include "7zip.jsx"

//==============================================================================

function saveAsPNG( filename, outpath, interlacedValue, transparencyValue) {
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

function copy() {
	var idcopy = charIDToTypeID( "copy" );
	executeAction( idcopy, undefined, DialogModes.NO );
}

//------------------------------------------------------------------------------

function px2cm(length, dpi) {
	return length * 2.54 / dpi;
}

//------------------------------------------------------------------------------

function saveLayerAsPNG(doc, layer, outpath, filename) {
	var area = {
		'x1': layer.bounds[0], 'y1': layer.bounds[1],
		'x2': layer.bounds[2], 'y2': layer.bounds[3]
	}
	var shapeRef = [
		[area.x1, area.y1],
		[area.x1, area.y2],
		[area.x2, area.y2],
		[area.x2, area.y1]
	];
	doc.selection.select(shapeRef);
	doc.activeLayer = layer
	copy();
	doc.selection.select([[0, 0], [0, 0], [0, 0], [0, 0]]);
	
	var newdoc = app.documents.add(
		layer.bounds[2] - layer.bounds[0],
		layer.bounds[3] - layer.bounds[1],
		72, 'temp',
		NewDocumentMode.RGB,
		DocumentFill.TRANSPARENT,
	);
	newdoc.paste();
	newdoc.trim(TrimType.TRANSPARENT);
	saveAsPNG(filename, outpath, true, true);
	newdoc.close( SaveOptions.DONOTSAVECHANGES );
}

//------------------------------------------------------------------------------

function saveAs(temp_dir, target_filename) {

	var SevenZip = get7zip();
	if (!SevenZip)
		return;

	setEnv();

	var cur_doc = app.activeDocument;

	// Saving the PSD file
	cur_doc.save();

	// Updating Brac XML files
	var brac_xml_file = new File(temp_dir + "/" + "brac.xml");
	brac_xml_file.open('rw');
	var brac_xml = new XML(brac_xml_file.read());
	brac_xml_file.close();
	var toremove = [];
	var storedLayers = [];
	for (var j = 0; j < brac_xml.layers.children().length(); ++j) {
		try {
			var lyr = brac_xml.layers.children()[j];
			if (lyr.name() == 'static') {
				//*/
				var index = getLayerIndex(lyr.@id, cur_doc);
				storedLayers.push(index);
				continue
				/*/
				var index = getLayerIndex(lyr.@id, cur_doc);
				if (index < 0) { //layer is removed
					toremove.push(j);
				} else {
					var ps_lyr      = cur_doc.layers[index];
					lyr.@resolution = parseFloat(ps_lyr.bounds[2] - ps_lyr.bounds[0]) + ' ' + parseFloat(ps_lyr.bounds[3] - ps_lyr.bounds[1]);
					lyr.@position   = parseFloat(ps_lyr.bounds[0]) + ' ' + parseFloat(ps_lyr.bounds[1]);
					lyr.@alpha      = ps_lyr.opacity / 100.0;
					lyr.@order      = cur_doc.layers.length - index;
					saveLayerAsPNG(cur_doc, ps_lyr, temp_dir, lyr.@name + '.' + lyr.@id);
					storedLayers.push(index);
				}
				//*/
			
			} else if (lyr.name() == 'bric') {
			
				var bric = lyr;
				var id_str = bric.@id;
				var index = getLayerIndex(id_str, cur_doc);
				
				if (index < 0) { //bric is removed
					toremove.push(j);
				} else {
					var bric_xml_file = new File(temp_dir + "/bric." + bric.@id + "/bric.xml");
					if (!bric_xml_file.exists) {
						alert("Bric XML file not found! \n\n" + bric_xml_file.fsName);
						continue;
					}
					bric_xml_file.open("r");
					var bric_xml = new XML(bric_xml_file.read());
					bric_xml_file.close();

					var layerset = cur_doc.layers[index];
					var region   = bric_xml.@region.split(' ');
					var reg_w    = parseInt(region[2]);
					var reg_h    = parseInt(region[3]);
					layer        = layerset.artLayers.getByName('snapshot');
					var new_w    = layer.bounds[2] - layer.bounds[0];
					var new_h    = layer.bounds[3] - layer.bounds[1];
					var scl_x    = prcsRes(3, new_w / reg_w);
					var scl_y    = prcsRes(3, new_h / reg_h);

					bric.@alpha = layerset.opacity / 100.0;
					bric.@order = cur_doc.layers.length - index;
					bric.@scale = scl_x + ' ' + scl_y;
					bric.@position = parseFloat(layer.bounds[0]) + ' ' + parseFloat(layer.bounds[1]);
					//bric.@rotate = layer.;
					
					var mask = null;
					mask = layerset.artLayers.getByName('mask');
					bric.@maskposition = parseFloat(mask.bounds[0]) + ' ' + parseFloat(mask.bounds[1]);
					saveLayerAsPNG(cur_doc, mask, temp_dir + '/bric.' + id_str, 'mask');
					storedLayers.push(index);
				}
			}
		} catch(e) {
			alert(e)
		}
	}

	// cleaning removed layers and brics.
	while (toremove.length > 0) {
		id = toremove.pop()
		lyr = brac_xml.layers.children()[id];
		id_str = lyr.@id;
		_name = lyr.@name;
		type = lyr.name();
		delete brac_xml.layers.children()[id];

		if (type == 'static') {
			//var f = new File(temp_dir + '/' + _name + '.' + id_str + '.png');
			//if ('windows' == getOS())
			//	Exec.system("DEL /F /Q " + f.fsName, 10000);
			//else if ('macos' == getOS())
			//	Exec.system("rm -f " + f.fsName, 10000);
		} else if (type == 'bric') {
			var dir = new Folder(temp_dir + "/bric." + id_str);
			if ('windows' == getOS())
				Exec.system("RD /S /Q " + dir.fsName, 10000);
			else if ('macos' == getOS())
				Exec.system("rm -rf " + dir.fsName, 10000);
		}
	}

	// adding new layers
	/*
	var max_id = -1;
	for (var i = 0; i < brac_xml.layers.children().length(); ++i)
		if (max_id < parseInt(brac_xml.layers.children()[i].@id))
			max_id = brac_xml.layers.children()[i].@id;
	
	for (var i = 0; i < cur_doc.layers.length; ++i) {
		var lyr_stored = false;
		for (var j = 0; j < storedLayers.length; ++j)
			if (storedLayers[j] == i) {
				lyr_stored = true;
				break;
			}
		
		if (!lyr_stored) {
			var lyr = cur_doc.layers[i];
			new_layer = XML('<static></static>');
			new_layer.@name       = lyr.name.toLowerCase().split(' ').join('_');
			new_layer.@id         = ++max_id;
			new_layer.@order      = cur_doc.layers.length - i;
			new_layer.@alpha      = lyr.opacity / 100.0;
			new_layer.@resolution = parseFloat(lyr.bounds[2] - lyr.bounds[0]) + ' ' + parseFloat(lyr.bounds[3] - lyr.bounds[1]);
			new_layer.@position   = parseFloat(lyr.bounds[0]) + ' ' + parseFloat(lyr.bounds[1]);
			brac_xml.layers.appendChild(new_layer);
			saveLayerAsPNG(cur_doc, lyr, temp_dir, new_layer.@name + '.' + new_layer.@id);
			lyr.name = new_layer.@id + ' - ' + new_layer.@name;
		}
	}
	*/

	brac_xml_file.open('w');
	brac_xml_file.write(brac_xml);
	brac_xml_file.close();
	
	if (target_filename.exists)
		target_filename.remove();
     
	SevenZip.archive(target_filename, temp_dir.fsName + "/*");

	resetEnv();
}

//------------------------------------------------------------------------------


//==============================================================================

// EOF
