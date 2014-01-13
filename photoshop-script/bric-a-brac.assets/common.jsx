//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// common.jsx
//
//==============================================================================

#target photoshop

//==============================================================================

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 1;
//debugger; // launch debugger on next line

//------------------------------------------------------------------------------

function getOS() {
	if ($.os.toLowerCase().search("macintosh") != -1)
		return 'macos';
	else if ($.os.toLowerCase().search("windows") != -1)
		return 'windows';
	else
		return 'unknown';
};

//------------------------------------------------------------------------------

function getRemoveCommand() {
	if ('windows' == getOS())
		return 'del';
	else if ('macos' == getOS())
		return 'rm';
}

//------------------------------------------------------------------------------

function getScriptExt() {
	if ('windows' == getOS())
		return 'bat';
	else if ('macos' == getOS())
		return 'sh';
}

//------------------------------------------------------------------------------

function getPWD() {
	deployed = true;

	if (deployed)
		return app.path + "/Plug-ins/Panels/bric-a-brac/content/bric-a-brac.assets";
	else {
		if ('windows' == getOS())
			return "D:/faham/tim/bric-a-brac/photoshop-script/bric-a-brac.assets"
		else if ('macos' == getOS())
			return "/Users/faham/development/bric-a-brac/photoshop-script/bric-a-brac.assets"
	}
}

//------------------------------------------------------------------------------

env_rulerunits = app.preferences.rulerUnits;
env_typeunits = app.preferences.typeUnits;

function setEnv() {
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
}

function resetEnv() {
	app.preferences.rulerUnits = env_rulerunits;
	app.preferences.typeUnits = env_typeunits;
}

//------------------------------------------------------------------------------

function prcsRes(res, num) {
	res = Math.pow(10, res)
	return Math.round(num * res) / res
}

//------------------------------------------------------------------------------

// Converts the given length in the given unit at the given dpi to pixels
function unit2pixel(unit, dpi, length) {
	if (unit == 0) {        // Pixels
		return length;
	} else if (unit == 1) { // Inches
		return length * dpi;
	} else if (unit == 2) { // Centimeters
		return length * dpi / 2.54;
	} else if (unit == 3) { // Millimeters
		return (length / 10) * dpi / 2.54;
	}
}

//------------------------------------------------------------------------------

function getLayerIndex(id, doc) {
	for (var i = 0; i < doc.layers.length; ++i) {
		if (parseInt(doc.layers[i].name) == parseInt(id)) {
			return i;
		}
	}
	
	return -1;
}

//==============================================================================

// EOF
