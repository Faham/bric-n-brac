//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// 7zip.jsx
//
//==============================================================================

#target photoshop 
#include "execute.jsx"
#include "common.jsx"

//==============================================================================

function get7zip() {

	SevenZip = null;

	if ('windows' == getOS())
		SevenZip = new Exec(new File(getPWD() + '/7za.exe'));
	else if ('macos' == getOS())
		SevenZip = new Exec(new File(getPWD() + '/7za'));

	if (null == SevenZip) {
		alert('OS \'' + $.os + '\' is not supported');
		return null;
	}

//------------------------------------------------------------------------------

	SevenZip.archive = function(zipFile, filelist) {
		var args = ["a", "-tzip", '\"' + zipFile.fsName + '\"'];
		for (var i = 0; i < filelist.length; i++) {
			args.push('\"' + filelist[i].fsName + '\"');
		}
		this.executeBlock(args, 10000);
	};

//------------------------------------------------------------------------------

	SevenZip.extract = function(zipFile, outDir) {
		if (outDir.exists) {
			if ('windows' == getOS())
				Exec.system("RD /S /Q " + outDir.fsName, 10000);
			else if ('macos' == getOS())
				Exec.system("rm -rf " + outDir.fsName, 10000);
		}

		var args = ["x", "-y", "-o\"" + outDir.fsName + '\"', '\"' + zipFile.fsName + '\"'];
		this.executeBlock(args, 10000);
	};

//------------------------------------------------------------------------------

	SevenZip.extract_v = function(zipFile, outDir) {
		if (outDir.exists) {
			if ('windows' == getOS())
				Exec.system("RD /S /Q " + outDir.fsName, 10000);
			else if ('macos' == getOS())
				Exec.system("rm -rf " + outDir.fsName, 10000);
		}

		var args = ["x", "-y", "-o\"" + outDir.fsName + '\"', '\"' + zipFile.fsName + '\"'];

		var ifile = new File(this.tmp + "/info.txt");

		args.push('>');
		args.push('\"' + ifile.fsName + '\"');
		this.executeBlock(args, 10000);

		ifile.open("r");
		var str = ifile.read();
		ifile.close();
		ifile.remove();

		return str;
	};

//------------------------------------------------------------------------------

	return SevenZip;
}

//==============================================================================

// EOF
