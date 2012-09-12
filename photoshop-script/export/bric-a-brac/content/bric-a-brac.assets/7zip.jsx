//==============================================================================
//
// 7zip.jsx
//
//==============================================================================

#target photoshop 
#include "execute.jsx"

//==============================================================================

function get7zip() {

	SevenZip = null;

	//alert($.os);

	if ($.os.toLowerCase().search("windows") != -1)
		SevenZip = new Exec(new File("7za.exe"));
	else if ($.os.toLowerCase().search("macintosh") != -1)
		SevenZip = new Exec(new File("7za"));

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

//------------------------------------------------------------------------------

	return SevenZip;
}

//==============================================================================

// EOF
