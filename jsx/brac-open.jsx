//==============================================================================
//
// brac-open.jsx
//
//==============================================================================

#target photoshop 
#include "7zip.jsx"

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

//==============================================================================

// EOF
