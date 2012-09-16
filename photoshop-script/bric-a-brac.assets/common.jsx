//==============================================================================
//
// common.jsx
//
//==============================================================================

#target photoshop 

//==============================================================================

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

//==============================================================================

// EOF
