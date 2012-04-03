//==============================================================================
//
// execute.jsx
//
//==============================================================================

#target photoshop 

//==============================================================================

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

// EOF
