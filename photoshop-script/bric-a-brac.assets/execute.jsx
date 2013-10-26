//==============================================================================
// Copyright 2013.  University of Saskatchewan.  All rights reserved.
// This script incorporates brac files editing operations into Adobe Photoshop.
// Written by Faham Negini
//==============================================================================
//
// execute.jsx
//
//==============================================================================

#target photoshop 
#include "common.jsx"

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

	if (this.app) {
		nm = this.tmp + '/' + this.app.name + '-' + ts + "." + getScriptExt();
	} else {
		nm = this.tmp + "/exec-" + ts + "." + getScriptExt();
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

	temp_script.writeln(getRemoveCommand() + " \"" + temp_script.fsName + "\" >NUL");
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
	var temp_script = null;
	var semaphore = null;

	if ('macos' == getOS()) {
		temp_script = new File(getPWD() + '/script.sh');
		semaphore = new File(this.tmp + '/bric-a-brac-script.sh.sem')
		if (semaphore.exists)
			semaphore.remove();
		temp_script.lineFeed = 'Unix';
		temp_script.open("w", 'shlb');
		temp_script.writeln('#!/bin/bash');
		temp_script.writeln(str);
		temp_script.writeln("echo Done > \"" + semaphore.fsName + '\"');
		temp_script.close();
		temp_script.execute();
	} else if ('windows' == getOS()) {
		temp_script = new File(this.getScriptName());
		semaphore = new File(temp_script.toString() + ".sem")
		if (semaphore.exists)
			semaphore.remove();
		temp_script.open("w");
		temp_script.writeln(str);
		temp_script.writeln("echo Done > \"" + semaphore.fsName + '\"');
		temp_script.writeln(getRemoveCommand() + " \"" + temp_script.fsName + "\" >NUL");
		temp_script.close();
		
		//using vbs to avoid command window poping up
		vbs_runner = new File(temp_script.fsName + '.vbs');
		vbs_runner.open("w");
		vbs_runner.writeln("Set WshShell = CreateObject(\"WScript.Shell\")");
		vbs_runner.writeln("WshShell.Run chr(34) & \"" + temp_script.fsName + "\" & Chr(34), 0");
		vbs_runner.writeln("Set WshShell = Nothing");
		vbs_runner.close();
		vbs_runner.execute();
		
	} else {
		alert ('OS is not supported');
		return;
	}

	try {
		this.block(semaphore, timeout);
	} finally {
		semaphore.remove();
	}
};

//==============================================================================

// EOF
