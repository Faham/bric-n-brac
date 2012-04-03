//==============================================================================
//
// 7zip.jsx
//
//==============================================================================

#target photoshop 
#include "execute.jsx"

//==============================================================================

SevenZip = new Exec(new File("/c/Program Files/7-Zip/7z.exe"));
SevenZip.archive = function(zipFile, filelist) {
	var args = ["a", "-tzip", '\"' + zipFile.fsName + '\"'];
	for (var i = 0; i < filelist.length; i++) {
		args.push('\"' + filelist[i].fsName + '\"');
	}
	this.executeBlock(args, 10000);
};

//------------------------------------------------------------------------------

SevenZip.extract = function(zipFile, outDir) {
	if (outDir.exists)
		Exec.system("RD /S /Q " + outDir.fsName, 10000);

	var args = ["x", "-o\"" + outDir.fsName + '\"', '\"' + zipFile.fsName + '\"'];
	this.executeBlock(args, 10000);
};

//------------------------------------------------------------------------------

SevenZip.extract_v = function(zipFile, outDir) {
	if (outDir.exists)
		Exec.system("RD /S /Q " + outDir.fsName, 10000);

	var args = ["x", "-o\"" + outDir.fsName + '\"', '\"' + zipFile.fsName + '\"'];

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

//==============================================================================

// EOF
