//==============================================================================
//
// bric-a-brac.jsx
//
//==============================================================================

#target photoshop 
#include "brac-open.jsx"
#include "brac-save.jsx"
#include "brac-save-as.jsx"
#include "brac-close.jsx"

//==============================================================================

function setupUI() {
	var dlg = new Window("dialog{"
			+ "text:'Bric-n-Brac',bounds:[100,100,360,140],"
			+ "btnSave:Button{bounds:[70,10,120,31] , text:'Save' },"
			+ "btnSaveAs:Button{bounds:[130,10,190,30] , text:'Save As' },"
			+ "btnClose:Button{bounds:[200,10,250,30] , text:'Close' },"
			+ "btnOpen:Button{bounds:[10,10,60,30] , text:'Open' }"
		+ "}");

	dlg.btnSave.onClick = BracSave;
	dlg.btnSaveAs.onClick = BracSaveAs;
	dlg.btnClose.onClick = BracClose;
	dlg.btnOpen.onClick = BracOpen;
	dlg.show();
}

//------------------------------------------------------------------------------

function main() {
	setupUI();
}

//==============================================================================

// EOF
