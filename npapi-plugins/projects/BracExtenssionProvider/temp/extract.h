
#ifndef __EXTRACT_H_
	#define __EXTRACT_H_

//==============================================================================

/*
 *	Modifications of sample part of the MiniZip project - ( http://www.winimage.com/zLibDll/minizip.html )
 *	Version 1.1, February 14h, 2010
 *	Copyright (C) 1998-2010 Gilles Vollant (minizip) ( http://www.winimage.com/zLibDll/minizip.html )
 *
 *	Modifications of Unzip for Zip64
 *	Copyright (C) 2007-2008 Even Rouault
 *
 *	Modifications for Zip64 support on both zip and unzip
 *	Copyright (C) 2009-2010 Mathias Svensson ( http://result42.com )
*/

//==============================================================================

#include "config.h"

//==============================================================================

#ifdef _WIN32
	#include <direct.h>
	#include <io.h>
#else
	#include <unistd.h>
	#include <utime.h>
#endif

#include <minizip/unzip.h>

#include "system.h"

#include <vector>
#include <string>

//==============================================================================

typedef std::vector<std::string> StringVec;

//==============================================================================

void Display64BitsSize(ZPOS64_T n, int size_char);

unzFile getUnzipFile (char * filename = NULL);

StringVec list(unzFile uf);
BNB_EXPORT StringVec list(char * filename);

int extractCurrentFile(unzFile uf
	, bool preserve_tree_structure = true
	, bool overwrite = false
	, const char* password = NULL);

BNB_EXPORT int extractFile(char * filename
	, char * archive_filename
	, bool preserve_tree_structure = true
	, char * password = NULL
	, char * extract_path = NULL
	, bool overwrite = false);

int extract(unzFile uf
	, bool preserve_tree_structure
	, bool overwrite
	, const char* password = NULL);
BNB_EXPORT int extract(char * archive_filename
	, bool preserve_tree_structure = true
	, char * password = NULL
	, char * extract_path = NULL
	, bool overwrite = false);


//==============================================================================

#endif //__EXTRACT_H_