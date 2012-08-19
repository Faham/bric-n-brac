// ADOBE SYSTEMS INCORPORATED
// Copyright  1993 - 2002 Adobe Systems Incorporated
// All Rights Reserved
//
// NOTICE:  Adobe permits you to use, modify, and distribute this 
// file in accordance with the terms of the Adobe license agreement
// accompanying it.  If you have received this file from a source
// other than Adobe, then your use, modification, or distribution
// of it requires the prior written permission of Adobe.
//-------------------------------------------------------------------
//-------------------------------------------------------------------------------
//
//	File:
//		FileUtilities.h
//
//	Description:
//		This library contains prototypes and macros
//		to simplify the use of extremely common file
//		functions for plug-ins. 
//
//	Use:
//		FileUtilities is intended to group common functions
//		into higher-level macros and routines to simplify
//		plug-in programming.
//
//-------------------------------------------------------------------------------

#ifndef __FileUtilities_H__			// Have we defined this yet?
#define __FileUtilities_H__			// Define once.

#include "PITypes.h"				// Standard Photoshop types.
#include "PIUtilities.h"			// Utilities header.
#include "PIDefines.h"				// Plug-in definitions.
#include "PIFormat.h"

//-------------------------------------------------------------------------------
//	Structures -- Platform specific structures.
//-------------------------------------------------------------------------------

#ifdef __PIWin__
	typedef Handle					PIPlatformFileHandle;
	typedef	HFILE					FileHandle;
	typedef Handle					AliasHandle;
	typedef struct
	{	
		char fileName [256];
	
	} SFReply;
	
	// Mac toolbox routines need to be implemented for Windows:

	#define fsFromStart	0
	#define FSIORefNum int32

#elif defined(__PIMac__)

	// On Macintosh systems, FileHandle is a typedef for RefNum
	typedef short			FileHandle;
	typedef AliasHandle		PIPlatformFileHandle;

	Boolean PIOpenFile (FSSpec& fsSpec,
					  	  FileHandle *fRefNum,
					  	  short *result);

	Boolean PICloseFileAndMakeAlias (FSSpec& fsSpec,
					 	 	         FileHandle fRefNum, 
					 	 	         Boolean sameNames,
					 	 	         Boolean *dirty, 
					 	 	         AliasHandle *alias,
					 	 	         short *result);
									 
	
#endif

//OSErr PSSDKOpen(FormatRecord * formatRecord, bool forReading, FSIORefNum * refNum);
//OSErr PSSDKClose(FSIORefNum * refNum);								 
OSErr PSSDKWrite(int32 refNum,int32 * count, void * buffPtr); 
OSErr PSSDKRead(int32 refNum,int32 * count, void * buffPtr); 
OSErr PSSDKSetFPos(int32 refNum, short posMode, long posOff);

//-------------------------------------------------------------------------------
//	Prototypes
//-------------------------------------------------------------------------------

Boolean TestAndStoreResult (short *res, OSErr result);
#define TSR(x) TestAndStoreResult (&gResult, x)

Boolean TestAndStoreCancel (short *res, Boolean tocancel);
#define TSC(x) TestAndStoreCancel (&gResult, x)

//-------------------------------------------------------------------------------

#endif // __FileUtilites_H__
