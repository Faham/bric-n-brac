//==============================================================================
//
// Exec
//
//------------------------------------------------------------------------------

Exec = function(app){
	this.app = app;         // A File object to the application
	this.tmp = Folder.temp; // You can use a different folder here
};

//------------------------------------------------------------------------------

Exec.prototype.toCommandStr = function(args) {
	var str = '';

	if (this.app) {
		str = '\"' + this.app.fsName + '\"'; // the app
	}

	if (args) {
		// if a file or folder was passed in, convert it to an array of one
		if (args instanceof File || args instanceof Folder) {
		args = ['\"' + args+ '\"'];
		}

		// if its an array, appened it to the command (could use Array.join)
		if (args.constructor == Array) {
			for (var i = 0; i < args.length; i++) {
				str += ' ' + args[i];
			}
		} else {
			// if its something else (like a prebuilt command string), just append it.
			str += ' ' + args.toString();
		}
	}
	return str;
};

//------------------------------------------------------------------------------

Exec.prototype.getBatName = function() {
	var nm = '';
	var ts = new Date().getTime();

	if (this.app) {
		nm = this.tmp + '/' + this.app.name + '-' + ts + ".bat";
	} else {
		nm = this.tmp + "/exec-" + ts + ".bat";
	}
	return nm;
};

//------------------------------------------------------------------------------

Exec.system = function(cmd, timeout) {
	var ts = new Date().getTime();
	var e = new Exec();
	var outf = new File(e.tmp + "/exec-" + ts + ".out");
	e.executeBlock(cmd + "> \"" + outf.fsName + '\"', 5000);

	outf.open("r");
	var str = outf.read();
	outf.close();
	outf.remove();
	return str;
};

//------------------------------------------------------------------------------

Exec.prototype.execute = function(argList) {
	var str = this.toCommandStr(argList);
	var bat = new File(this.getBatName());
	bat.open("w");
	bat.writeln(str);
	bat.writeln("del \"" + bat.fsName + "\" >NUL");
	bat.close();
	bat.execute();
};

//------------------------------------------------------------------------------

Exec.prototype.block = function(semaphore, timeout) {
	if (timeout) {
		var parts = 10;            // wait for 1/10 of the timeout in a loop
		timeout = timeout / parts;

		while (!semaphore.exists && parts) {
			$.sleep(timeout);
			parts--;
		}

		if (!parts && !semaphore.exists) {
			throw "Timeout exceeded for program " + this.app.name;
		}
	}
};

//------------------------------------------------------------------------------

Exec.prototype.executeBlock = function(argList, timeout) {
	var str = this.toCommandStr(argList);

	var bat = new File(this.getBatName());
	var semaphore = new File(bat.toString() + ".sem")

	bat.open("w");
	bat.writeln(str);
	bat.writeln("echo Done > \"" + semaphore.fsName + '\"');
	bat.writeln("del \"" + bat.fsName + "\" >NUL");
	bat.close();
	bat.execute();

	try { 
		this.block(semaphore, timeout);
	} finally {
		semaphore.remove();
	}
};

//==============================================================================

//
// SevenZip
//
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
//
//XML
//
XML = function() {};

//------------------------------------------------------------------------------

XML.prototype.serialize = function() {
	var obj = app.activeDocument;
	var layers = obj.artLayers;
	var brics = [];
	for( var i = 0; i<layers.length; i++) {
		var layer = layers[i];
		brics.push(this.serializeLayer(layer));
	}
	//*
	alert(brics.join("\r"));
	/*/
	var out_file = new File();
	out_file.open("w");
	out_file.writeln(brics.join("\r"));
	bat.close();
	//*/
};

//------------------------------------------------------------------------------

XML.prototype.serializeLayer = function(layer) {
//	<bric id="1" position="1.0 1.9" rot="-27.3" scale="2.1 2.8" order="1" alpha="0.3"> comment </bric>
	var x = layer.bounds[0];
	var y = layer.bounds[1];
	var n = layer.name;
	var str = "\t<bric id='" + n + "' position='" + x + ' ' + y + "' />";
	return str;
};

//==============================================================================

function main() {
	// Bricing the brac file.
	var brac = File(openDialog());
	var ts = new Date().getTime();
	var out_dir = new Folder(Folder.temp + "/" + ts);
	var info = SevenZip.extract_v(brac, out_dir);

	// Create the multi-layered image
	//app.documents.add();
};

//==============================================================================

main();

"Exec.jsx";

//==============================================================================

// EOF
