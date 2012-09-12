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

Exec.prototype.getScriptName = function() {
	var nm = '';
	var ts = new Date().getTime();

	var ext = 'bat';
	if ($.os.toLowerCase().search("macintosh") != -1)
		ext = 'sh';

	if (this.app) {
		nm = this.tmp + '/' + this.app.name + '-' + ts + "." + ext;
	} else {
		nm = this.tmp + "/exec-" + ts + "." + ext;
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
	var temp_script = new File(this.getScriptName());
	temp_script.open("w");
	temp_script.writeln(str);

	var del_cmd = 'del';
	if ($.os.toLowerCase().search("macintosh") != -1)
		del_cmd = 'rm';

	temp_script.writeln(del_cmd + " \"" + temp_script.fsName + "\" >NUL");
	temp_script.close();
	temp_script.execute();
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

	var temp_script = new File(this.getScriptName());
	var semaphore = new File(temp_script.toString() + ".sem")

	temp_script.open("w");
	temp_script.writeln(str);
	temp_script.writeln("echo Done > \"" + semaphore.fsName + '\"');


	var del_cmd = 'del';
	if ($.os.toLowerCase().search("macintosh") != -1)
		del_cmd = 'rm';

	temp_script.writeln(del_cmd + " \"" + temp_script.fsName + "\" >NUL");
	temp_script.close();
	if ($.os.toLowerCase().search("windows") != -1)
		temp_script.execute();
	else  if ($.os.toLowerCase().search("macintosh") != -1) {
		var bash = new File('/bin/bash');
		bash.execute(); //TODO: I need to execute te inexecutable file, but how should I change its permission.
	}

	try { 
		this.block(semaphore, timeout);
	} finally {
		semaphore.remove();
	}
};

//==============================================================================

// EOF
