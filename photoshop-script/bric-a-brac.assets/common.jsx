﻿//==============================================================================
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

//==============================================================================

// EOF
