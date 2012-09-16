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
	deployed = false;

	if (deployed)
		return "Plug-ins/Panels/bric-a-brac/content/bric-a-brac.assets"
	else {
		if ('windows' == getOS())
			return "D:/faham/tim/bric-a-brac/photoshop-script/bric-a-brac.assets"
		else if ('macos' == getOS())
			return "/Users/faham/development/bric-a-brac/photoshop-script/bric-a-brac.assets"
	}
}

//==============================================================================

// EOF
