//==============================================================================

#define ZLIB	1

//==============================================================================

#include <iostream>
#include <windows.h>

#include <tinyxml/tinyxml.h>
#if defined (NDEBUG)
	#pragma	comment(lib, "tinyxml")
#else
	#pragma	comment(lib, "tinyxmld")
#endif

#if defined (ZLIB)
	#include <zlib.h>
	#if defined (NDEBUG)
		#pragma	comment(lib, "zlib")
	#else
		#pragma	comment(lib, "zlibd")
	#endif
#endif

//==============================================================================

void main (int argc, char * argv[]) {
	if (argc <= 1) {
		std::cout << "Provide a target directory as an argument.\n";
		return;
	}

	char * target_dir = argv[1];

	DWORD ftyp = GetFileAttributesA(target_dir);
	if (ftyp == INVALID_FILE_ATTRIBUTES) {
		std::cout << "Couldn't access directory: " << target_dir << "\n";
		return;
	}

	if (!(ftyp & FILE_ATTRIBUTE_DIRECTORY)) {
		std::cout << "Couldn't find directory: " << target_dir << "\n";
		return;
	}

	std::cout << "Bracking directory: " << target_dir << "\n";
}

//==============================================================================