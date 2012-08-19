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
//------------------------------------------------------------------------------
//
//	File:
//		brac.h
//
//	Description:
//		This file contains the header prototypes and macros for the
//		File Format module brac, 
//		which writes a flat file with merged document pixels.
//
//	Use:
//		Format modules are called from the Save, Save as,
//		and Save a copy dialogs.
//
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//	Includes
//------------------------------------------------------------------------------

#include <vector>
#include <sstream>
#include <time.h>
#include "brac/brac.h"
#include "PIUI.h"

#include <process.h> //used for calling bricker silently

DLLExport MACPASCAL void PluginMain (const int16 selector,
						             FormatRecordPtr formatParamBlock,
						             intptr_t * data,
						             int16 * result);

using namespace std;

//------------------------------------------------------------------------------
//	Prototypes
//------------------------------------------------------------------------------
static void DoReadPrepare (void);
static void DoReadStart (void);
static void DoReadContinue (void);
static void DoReadFinish (void);
static void DoOptionsPrepare (void);
static void DoOptionsStart (void);
static void DoOptionsContinue (void);
static void DoOptionsFinish (void);
static void DoEstimatePrepare (void);
static void DoEstimateStart (void);
static void DoEstimateContinue (void);
static void DoEstimateFinish (void);
static void DoWritePrepare (void);
static void DoWriteStart (void);
static void DoWriteContinue (void);
static void DoWriteFinish (void);
static void DoFilterFile (void);

static void DoReadLayerStart (void);
static void DoReadLayerContinue (void);
static void DoReadLayerFinish (void);
static void DoWriteLayerStart (void);
static void DoWriteLayerFinish (void);

static void AddComment (void);

const int32 HEADER_CANT_READ = 0;
const int32 HEADER_VER1 = 1;
const int32 HEADER_VER2 = 2;

// let's use the TIFF spec. to do cross platform files
const int16 BIGENDIAN = 0x4d4d;
const int16 LITTLEENDIAN = 0x4949;
const int16 TESTENDIAN = 0x002a;

const int32 DESIREDMATTING = 0;

static int CheckIdentifier (char identifier []);
static void SetIdentifier (char identifier []);
static unsigned32 RowBytes (void);

static void ReadSome (int32 count, void * buffer);
static void WriteSome (int32 count, void * buffer);
static void ReadRow (Ptr pixelData, bool needsSwap);
static void WriteRow (Ptr pixelData);
static void DisposeImageResources (void);
static void SwapRow(int32 rowBytes, Ptr pixelData);

static void DoReadICCProfile(void);
static void DoWriteICCProfile(void);

static void InitData(void);
static void CreateDataHandle(void);
static void LockHandles(void);
static void UnlockHandles(void);

static VPoint GetFormatImageSize(void);
static void SetFormatImageSize(VPoint inPoint);
static void SetFormatTheRect(VRect inRect);


template <typename Result>
inline Result GetBigEndian(uint8 *& source)
{
	Result result (0);
	
	for (int bytes (0); bytes < sizeof(Result); ++bytes) 
	{
		result = result << 8;
		result |= *source++;
	}
	
	return result;
}

static void CreateResourceInfoVector(int32 length, 
									 uint8 * resources, 
									 vector<ResourceInfo *> & rInfos);
static void DeleteResourceInfoVector(vector<ResourceInfo *> & rInfos);
static int32 RemoveResources(int32 resourceLength, 
							 const vector<ResourceInfo *> & rInfos, 
							 uint8 * resourcePtr);
static int32 RemoveResource(uint32 type, 
							uint16 id, 
							uint8 * imageResource, 
							int32 size, 
							uint8 * dest);
//------------------------------------------------------------------------------
//	Globals -- Define global variables for plug-in scope.
//------------------------------------------------------------------------------

SPBasicSuite * sSPBasic = NULL;
SPPluginRef gPluginRef = NULL;

FormatRecord * gFormatRecord = NULL;
intptr_t * gDataHandle = NULL;
Data * gData = NULL;
int16 * gResult = NULL;

#define gCountResources gFormatRecord->resourceProcs->countProc
#define gGetResources   gFormatRecord->resourceProcs->getProc
#define gAddResource	gFormatRecord->resourceProcs->addProc

//------------------------------------------------------------------------------
//
//	PluginMain / main
//
//	All calls to the plug-in module come through this routine.
//	It must be placed first in the resource.  To achieve this,
//	most development systems require this be the first routine
//	in the source.
//
//	The entrypoint will be "pascal void" for Macintosh,
//	"void" for Windows.
//
//	Inputs:
//		const int16 selector						Host provides selector indicating
//													what command to do.
//
//		FormatRecord * formatParamBlock				Host provides pointer to parameter
//													block containing pertinent data
//													and callbacks from the host.
//													See PIFormat.h.
//
//	Outputs:
//		FormatRecord * formatParamBlock				Host provides pointer to parameter
//													block containing pertinent data
//													and callbacks from the host.
//													See PIFormat.h.
//
//		void * data									Use this to store a handle or pointer to our
//													global parameters structure, which
//													is maintained by the host between
//													calls to the plug-in.
//
//		int16 * result								Return error result or noErr.  Some
//													errors are handled by the host, some
//													are silent, and some you must handle.
//													See PIGeneral.h.
//
//------------------------------------------------------------------------------

DLLExport MACPASCAL void PluginMain (const int16 selector,
						             FormatRecordPtr formatParamBlock,
						             intptr_t * data,
						             int16 * result)
{

	//---------------------------------------------------------------------------
	//	(1) Update our global parameters from the passed in values.
	// 
	//	We removed that nasty passing around of globals. It's global right! So
	//	why pass it around. This also removes the use of some those nasty #defines.
	//---------------------------------------------------------------------------
	gFormatRecord = reinterpret_cast<FormatRecordPtr>(formatParamBlock);
	gPluginRef = reinterpret_cast<SPPluginRef>(gFormatRecord->plugInRef);
	gResult = result;
	gDataHandle = data;

	//---------------------------------------------------------------------------
	//	(2) Check for about box request.
	//
	// 	The about box is a special request; the parameter block is not filled
	// 	out, none of the callbacks or standard data is available.  Instead,
	// 	the parameter block points to an AboutRecord, which is used
	// 	on Windows.
	//---------------------------------------------------------------------------
	if (selector == formatSelectorAbout)
	{
		AboutRecordPtr aboutRecord = reinterpret_cast<AboutRecordPtr>(formatParamBlock);
		sSPBasic = aboutRecord->sSPBasic;
		gPluginRef = reinterpret_cast<SPPluginRef>(aboutRecord->plugInRef);
		DoAbout(gPluginRef, AboutID);
	}
	else
	{ // do the rest of the process as normal:

		sSPBasic = ((FormatRecordPtr)formatParamBlock)->sSPBasic;

		if (gCountResources == NULL ||
            gGetResources == NULL ||
            gAddResource == NULL ||
			gFormatRecord->advanceState == NULL)
		{
			*gResult = errPlugInHostInsufficient;
			return;
		}

		// new for Photoshop 8, big documents, rows and columns are now > 30000 pixels
		if (gFormatRecord->HostSupports32BitCoordinates)
			gFormatRecord->PluginUsing32BitCoordinates = true;

		//-----------------------------------------------------------------------
		//	(3) Allocate and initalize globals.
		//
		//-----------------------------------------------------------------------

 		if ( ! (*gDataHandle) )
		{
			CreateDataHandle();
			if (*gResult != noErr) return;
			LockHandles();
			if (*gResult != noErr) return;
			InitData();
		}

		if (*gResult == noErr)
		{
			LockHandles();
			if (*gResult != noErr) return;
		}

		//-----------------------------------------------------------------------
		//	(4) Dispatch selector.
		//-----------------------------------------------------------------------
		switch (selector)
		{
			case formatSelectorReadPrepare:
				DoReadPrepare();
				break;
			case formatSelectorReadStart:
				DoReadStart();
				break;
			case formatSelectorReadContinue:
				DoReadContinue();
				break;
			case formatSelectorReadFinish:
				DoReadFinish();
				break;

			case formatSelectorReadLayerStart:
				DoReadLayerStart();
				break;
			case formatSelectorReadLayerContinue:
				DoReadLayerContinue();
				break;
			case formatSelectorReadLayerFinish:
				DoReadLayerFinish();
				break;
			case formatSelectorWriteLayerStart:
				DoWriteLayerStart();
				break;
			case formatSelectorWriteLayerContinue:
			case formatSelectorWriteLayerFinish:
				DoWriteLayerFinish();
				break;

			case formatSelectorOptionsPrepare:
				DoOptionsPrepare();
				break;
			case formatSelectorOptionsStart:
				DoOptionsStart();
				break;
			case formatSelectorOptionsContinue:
				DoOptionsContinue();
				break;
			case formatSelectorOptionsFinish:
				DoOptionsFinish();
				break;

			case formatSelectorEstimatePrepare:
				DoEstimatePrepare();
				break;
			case formatSelectorEstimateStart:
				DoEstimateStart();
				break;
			case formatSelectorEstimateContinue:
				DoEstimateContinue();
				break;
			case formatSelectorEstimateFinish:
				DoEstimateFinish();
				break;

			case formatSelectorWritePrepare:
				DoWritePrepare();
				break;
			case formatSelectorWriteStart:
				DoWriteStart();
				break;
			case formatSelectorWriteContinue:
				DoWriteContinue();
				break;
			case formatSelectorWriteFinish:
				DoWriteFinish();
				break;

			case formatSelectorFilterFile:
				DoFilterFile();
				break;
		}
			
		//-----------------------------------------------------------------------
		//	(5) Unlock data, and exit resource.
		//
		//	Result is automatically returned in *result, which is
		//	pointed to by gResult.
		//-----------------------------------------------------------------------	
		
		UnlockHandles();
	
	} // about selector special		

	*gResult = noErr;

	// release any suites that we may have acquired
	if (selector == formatSelectorAbout ||
		selector == formatSelectorWriteFinish ||
		selector == formatSelectorReadFinish ||
		selector == formatSelectorOptionsFinish ||
		selector == formatSelectorEstimateFinish ||
		selector == formatSelectorFilterFile ||
		*gResult != noErr)
	{
		PIUSuitesRelease();
	}

} // end PluginMain


//------------------------------------------------------------------------------
//
//	InitData
//	
//	Initalize any global values here.  Called only once when global
//	space is reserved for the first time.
//
//	Outputs:
//		Initializes any global values with their defaults.
//
//------------------------------------------------------------------------------

static void InitData (void)
{	
	gData->needsSwap = false;
	gData->openAsSmartObject = false;
} // end InitData


//------------------------------------------------------------------------------
//
//	CheckIdentifier
//	
//	Check the passed in character array for our identifier.
//
//  Inputs:
//		array of characters representing the identifier
//	Outputs:
//		HEADER_CANT_READ		= I have no idea what this file is
//		HEADER_VER1	= This is my old header, it has 16 bit rows and columns
//		HEADER_VER2	= This is my NEW header, it has 32 bit rows and columns
//
//------------------------------------------------------------------------------

static int CheckIdentifier (char identifier [])
{
	if (identifier[3] != 'b' ||
		identifier[4] != 'r' ||
		identifier[5] != 'a' ||
		identifier[6] != 'i' ||
		identifier[7] != 'n')
		return HEADER_CANT_READ;

	if (identifier[0] == 'o' && 
		identifier[1] == 'n' && 
		identifier[2] == 'e')
		return HEADER_VER1;

	if (identifier[0] == 'b' && 
		identifier[1] == 'i' && 
		identifier[2] == 'g')
		return HEADER_VER2;

	return HEADER_CANT_READ;
}

//------------------------------------------------------------------------------
//
//	SetIdentifier
//	
//	Set the passed in character array to our identifier.
//
//  Inputs:
//		array of characters representing the identifier
//	Outputs:
//		array of characters = "bigbrain"
//
//------------------------------------------------------------------------------

static void SetIdentifier (char identifier [])
{
	
	identifier[0] = 'b';
    identifier[1] = 'i';
    identifier[2] = 'g';
    identifier[3] = 'b';
    identifier[4] = 'r';
    identifier[5] = 'a';
    identifier[6] = 'i';
    identifier[7] = 'n';
	
}

/*****************************************************************************/

static unsigned32 RowBytes (void)
{
	VPoint imageSize = GetFormatImageSize();
	return (imageSize.h * gFormatRecord->depth + 7) >> 3;
	
}

/*****************************************************************************/

static void DoReadPrepare (void)
{
	gFormatRecord->maxData = 0;
}

/*****************************************************************************/

static void ReadSome (int32 count, void * buffer)
{
	
	int32 readCount = count;
	
	if (*gResult != noErr)
		return;

	*gResult = PSSDKRead (gFormatRecord->dataFork, &readCount, buffer);

	if (*gResult == noErr && readCount != count)
		*gResult = eofErr;
	
}

/*****************************************************************************/

static void WriteSome (int32 count, void * buffer)
{
	
	int32 writeCount = count;
	
	if (*gResult != noErr)
		return;
	
	*gResult = PSSDKWrite (gFormatRecord->dataFork, &writeCount, buffer);
	
	if (*gResult == noErr && writeCount != count)
		*gResult = dskFulErr;
	
}

/*****************************************************************************/

static void ReadRow (Ptr pixelData, bool needsSwap)
{
	ReadSome (RowBytes(), pixelData);
	if (gFormatRecord->depth == 16 && needsSwap)
		SwapRow(RowBytes(), pixelData);
}

static void SwapRow(int32 rowBytes, Ptr pixelData)
{
	uint16 * bigPixels = reinterpret_cast<uint16 *>(pixelData);
	for (int32 a = 0; a < rowBytes; a+=2, bigPixels++)
		Swap(*bigPixels);
}

/*****************************************************************************/

static void WriteRow (Ptr pixelData)
{
	WriteSome (RowBytes(), pixelData);
}

/*****************************************************************************/

static void DisposeImageResources (void)
{
	
	if (gFormatRecord->imageRsrcData)
	{
		
		sPSHandle->Dispose(gFormatRecord->imageRsrcData);
		
		gFormatRecord->imageRsrcData = NULL;
		
		gFormatRecord->imageRsrcSize = 0;
		
	}
	
}

/*****************************************************************************/

static void DoReadStart (void)
{
	// If you add fmtCanCreateThumbnail to the FormatFlags PiPL property
	// you will get called to create a thumbnail. The only way to tell
	// that you are processing a thumbnail is to check openForPreview in the
	// FormatRecord. You do not need to parse the entire file. You need to
	// process enough for a thumbnail view and you need to do it quickly.

	if (!gFormatRecord->openForPreview) {
		//int result = system("C:\faham\tim\bric-n-brac\temp\extract.bat");
		//_spawnlp(_P_NOWAIT, "C:\faham\tim\bric-n-brac\out\bricker\Win32\Debug\bricker.exe", "C:\faham\tim\bric-n-brac\out\bricker\Win32\Debug\mybrac.zip", "-d", "C:\faham\tim\bric-n-brac\temp", NULL);
		//ShellExecute(NULL, "open", "C:\faham\tim\bric-n-brac\temp", NULL, NULL, SW_SHOWNORMAL);
		// FHM: saying how many layers are loading.
		//gFormatRecord->layerData = 2;
	}

	FileHeader header;
	
	Boolean showDialog = ReadScriptParamsOnRead (); // override params here
	
	/* Exit if we have already encountered an error. */

    if (*gResult != noErr) return;
		
	/* If we have not encountered an error, then we want to read
	   the file header. */

	*gResult = PSSDKSetFPos (gFormatRecord->dataFork, fsFromStart, 0);
	if (*gResult != noErr) return;
	
	ReadSome (sizeof (header.identifier), &header.identifier);
	if (*gResult != noErr) return;

	gData->needsSwap = false;
	
	int headerID = CheckIdentifier (header.identifier);
	
	if (headerID == HEADER_CANT_READ)
	{
		*gResult = formatCannotRead;
	}
	else if (headerID == HEADER_VER1)
	{
		HeaderVer1 headerVer1;
		
		ReadSome(sizeof(HeaderVer1), &headerVer1);
		
		header.mode = headerVer1.mode;
		header.depth = headerVer1.depth;
		header.rows = headerVer1.rows;
		header.cols = headerVer1.cols;
		header.planes = headerVer1.planes;
		header.transparencyPlane = 0;
		header.resourceLength = headerVer1.resourceLength;
	}
	else if (headerID == HEADER_VER2)
	{
		ReadSome(sizeof(HeaderVer2) - sizeof(header.identifier), &header.endian);
		// determine machine endian-ness
		uint32 tempLong = 0x11223344;
		uint8 tempChar = *(reinterpret_cast<uint8 *>(&tempLong) + 3);
		bool isLittleEndian = (tempChar == 0x11);
		if ((header.endian == LITTLEENDIAN) != isLittleEndian)
		{
			gData->needsSwap = true;
			Swap(header.testendian);
			Swap(header.mode);
			Swap(header.depth);
			Swap(header.rows);
			Swap(header.cols);
			Swap(header.planes);
			Swap(header.transparencyPlane);
			Swap(header.resourceLength);
		}
		
		if (header.testendian != TESTENDIAN)
		{
			*gResult = formatCannotRead;
			return;
		}
	}
	else
	{
		*gResult = formatCannotRead;
	}

	if (*gResult != noErr) return;

	gFormatRecord->imageMode = header.mode;
	VPoint imageSize;
	imageSize.v = header.rows;
	imageSize.h = header.cols;
	SetFormatImageSize(imageSize);
	gFormatRecord->depth = header.depth;
	gFormatRecord->planes = header.planes;
	gFormatRecord->transparencyPlane = header.transparencyPlane;
	gFormatRecord->transparencyMatting = DESIREDMATTING;
	
	/* Next, we will try to read the image resources. */
	/* If there is none then create an empty resource. */
	
	if (header.resourceLength > 0)
	{
		gFormatRecord->imageRsrcData = sPSHandle->New(header.resourceLength);
		
		if (gFormatRecord->imageRsrcData == NULL)
		{
			*gResult = memFullErr;
			return;
		}
			
		Ptr resourcePtr = NULL;
		sPSHandle->SetLock(gFormatRecord->imageRsrcData, true, &resourcePtr, NULL);
		
		if (resourcePtr != NULL)
		{
			ReadSome (header.resourceLength, resourcePtr);

			if (!gFormatRecord->openForPreview)
			{
				vector<ResourceInfo *> resources;
				CreateResourceInfoVector(header.resourceLength, 
					                     reinterpret_cast<uint8 *>(resourcePtr), 
										 resources);

				// see if the user wants to remove some resources
				if (showDialog && DoUI(resources))
				{
					header.resourceLength = RemoveResources(header.resourceLength, 
							                                resources, 
															reinterpret_cast<uint8 *>(resourcePtr));
					Handle h = sPSHandle->New(header.resourceLength);
					if (h == NULL)
					{
						*gResult = memFullErr;
						sPSHandle->Dispose(gFormatRecord->imageRsrcData);
						return;
					}
					Ptr newResourcePtr = NULL;
					sPSHandle->SetLock(h, true, &newResourcePtr, NULL);
					if (newResourcePtr != NULL)
					{
						copy(resourcePtr, resourcePtr + header.resourceLength, newResourcePtr);
						sPSHandle->Dispose(gFormatRecord->imageRsrcData);
						gFormatRecord->imageRsrcData = h;
					}
				}
				DeleteResourceInfoVector(resources);
			}

			sPSHandle->SetLock(gFormatRecord->imageRsrcData, false, &resourcePtr, NULL);
		
			if (*gResult != noErr)
				goto CleanUp;
			
			gFormatRecord->imageRsrcSize = header.resourceLength;
			}
		
	}
	else
	{

		if (sPSHandle->New != NULL)
			gFormatRecord->imageRsrcData = sPSHandle->New(0);
		gFormatRecord->imageRsrcSize = 0;

	}
		
	/* Next, we will will read the lookup tables if in indexed color mode. */
	
	if (header.mode == plugInModeIndexedColor)
	{
		
		ReadSome (3 * sizeof (LookUpTable), &gFormatRecord->redLUT);
		
		if (*gResult != noErr)
			goto CleanUp;
		
	}
		
	return;
		
	/* The following code does any clean-up work in the event of an error. */
	
	CleanUp:
	
	DisposeImageResources ();
}

/*****************************************************************************/

static void DoReadContinue (void)
{
	
	int32 done;
	int32 total;
	int16 plane;
	int32 row;
	
	/* Dispose of the image resource data if it exists. */
	
	DisposeImageResources ();
	
	/* Set up the progress variables. */
	
	done = 0;
	VPoint imageSize = GetFormatImageSize();
	total = imageSize.v * gFormatRecord->planes;
		
	/* Next, we will allocate the pixel buffer. */

	unsigned32 bufferSize = RowBytes();
	Ptr pixelData = sPSBuffer->New( &bufferSize, bufferSize );
	if (pixelData == NULL)
	{
		*gResult = memFullErr;
		return;
	}
	
	/* Set up to start returning chunks of data. */
	
	VRect theRect;

	theRect.left = 0;
	theRect.right = imageSize.h;
	gFormatRecord->colBytes = (gFormatRecord->depth + 7) >> 3;
	gFormatRecord->rowBytes = RowBytes();
	gFormatRecord->planeBytes = 0;
	gFormatRecord->data = pixelData;
	if (gFormatRecord->depth == 16)
		gFormatRecord->maxValue = 0x8000; // I read them like Photoshop writes them

	for (plane = 0; *gResult == noErr && plane < gFormatRecord->planes; ++plane)
	{
		
		gFormatRecord->loPlane = gFormatRecord->hiPlane = plane;
		
		for (row = 0; *gResult == noErr && row < imageSize.v; ++row)
		{
			
			theRect.top = row;
			theRect.bottom = row + 1;

			SetFormatTheRect(theRect);
			
			ReadRow (pixelData, gData->needsSwap);
			
			if (*gResult == noErr)
				*gResult = gFormatRecord->advanceState();
				
			gFormatRecord->progressProc(++done, total);
			
		}
		
	}
		
	gFormatRecord->data = NULL;
	
	sPSBuffer->Dispose(&pixelData);

	DoReadICCProfile ();
}

/*****************************************************************************/

static void DoReadFinish (void)
{
	/* Test the ability to create the file inside a smart object */
	/* This flag also tells you which menu item was selected */

	// if openAsSmartObject is already true then you cannot turn it off
	gFormatRecord->openAsSmartObject = gData->openAsSmartObject;
	
	// every other time we open as smart, that should be confusing enough for a user!
	gData->openAsSmartObject = !gData->openAsSmartObject;
	
	/* Dispose of the image resource data if it exists. */
	DisposeImageResources ();
	WriteScriptParamsOnRead (); // should be different for read/write
	AddComment (); // write a history comment
	
}

/*****************************************************************************/

static void DoOptionsPrepare (void)
{
	gFormatRecord->maxData = 0;
}

/*****************************************************************************/

static void DoOptionsStart (void)
{
	gFormatRecord->data = NULL;
}

/*****************************************************************************/

static void DoOptionsContinue (void)
{
}

/*****************************************************************************/

static void DoOptionsFinish (void)
{
}

/*****************************************************************************/

static void DoEstimatePrepare (void)
{
	gFormatRecord->maxData = 0;
}

/*****************************************************************************/

static void DoEstimateStart (void)
{
	
	int32 dataBytes;
	
	VPoint imageSize = GetFormatImageSize();

	dataBytes = sizeof (FileHeader) +
				gFormatRecord->imageRsrcSize +
				RowBytes () * gFormatRecord->planes * imageSize.v;
					  
	if (gFormatRecord->imageMode == plugInModeIndexedColor)
		dataBytes += 3 * sizeof (LookUpTable);
		
	gFormatRecord->minDataBytes = dataBytes;
	gFormatRecord->maxDataBytes = dataBytes;
	
	gFormatRecord->data = NULL;

}

/*****************************************************************************/

static void DoEstimateContinue (void)
{
}

/*****************************************************************************/

static void DoEstimateFinish (void)
{
}

/*****************************************************************************/

static void DoWritePrepare (void)
{
	gFormatRecord->maxData = 0;	
}

/*****************************************************************************/

static void DoWriteStart (void)
{

	FileHeader header;
	int32 done;
	int32 total;
	int16 plane;
	int32 row;
	
	/* See if I have any of my comments in this file */
	/* I don't do anything with them but it was fun. */

	int16 resourceCount = gCountResources(histResource);

	while (resourceCount)
	{
		// a read only handle, no need to dispose
		Handle resourceHandle = gGetResources(histResource,resourceCount--);
		Ptr resourcePtr = NULL;
		sPSHandle->SetLock(resourceHandle, true, &resourcePtr, NULL);
		sPSHandle->SetLock(resourceHandle, false, &resourcePtr, NULL);
	}

	Boolean showDialog = ReadScriptParamsOnWrite (); // read script params here
	
    if (*gResult != noErr) return;

	/* Write the header. */
	
	*gResult = PSSDKSetFPos (gFormatRecord->dataFork, fsFromStart, 0);
	if (*gResult != noErr) return;
	
	SetIdentifier (header.identifier);
	VPoint imageSize = GetFormatImageSize();

	uint32 tempLong = 0x11223344;
	uint8 tempChar = *(reinterpret_cast<uint8 *>(&tempLong) + 3);
	bool isLittleEndian = (tempChar == 0x11);
	header.endian = isLittleEndian ? LITTLEENDIAN : BIGENDIAN;
	header.testendian = TESTENDIAN;
	header.mode = gFormatRecord->imageMode;
	header.rows = imageSize.v;
	header.cols = imageSize.h;
	header.depth = gFormatRecord->depth;
	header.planes = gFormatRecord->planes;
	header.transparencyPlane = gFormatRecord->transparencyPlane;
	
	if (gFormatRecord->imageRsrcData)
	{
		header.resourceLength = gFormatRecord->imageRsrcSize;
	}
	else
	{
		header.resourceLength = 0;
		WriteSome (sizeof (FileHeader), &header);
	}
	
	if (*gResult != noErr) return;
	
	/* Write the image resources if any. */
	
	if (header.resourceLength > 0)
	{
		Ptr p = NULL;
		sPSHandle->SetLock(gFormatRecord->imageRsrcData, true, &p, NULL);
		if (p != NULL)
		{
			vector<ResourceInfo *> resources;
			CreateResourceInfoVector(header.resourceLength, 
				                     reinterpret_cast<uint8 *>(p), 
									 resources);
			// see if the user wants to remove some resources
			if (showDialog && DoUI(resources))
			{
				header.resourceLength = RemoveResources(header.resourceLength, 
					                                    resources, 
														reinterpret_cast<uint8 *>(p));
			}
			DeleteResourceInfoVector(resources);

			WriteSome (sizeof (FileHeader), &header);
			WriteSome (header.resourceLength, p);
			sPSHandle->SetLock(gFormatRecord->imageRsrcData, false, &p, NULL);
		}
		
		if (*gResult != noErr) return;
		
	}
		
	/* Write the lookup tables if appropriate. */
	
	if (header.mode == plugInModeIndexedColor)
	{
		
		WriteSome (3 * sizeof (LookUpTable), &gFormatRecord->redLUT);
		
		if (*gResult != noErr) return;
		
	}
		
	/* Set up the progress variables. */
	
	done = 0;
	total = header.rows * header.planes;
		
	/* Next, we will allocate the pixel buffer. */
	unsigned32 bufferSize = RowBytes();
	Ptr pixelData = sPSBuffer->New( &bufferSize, bufferSize );
	if (pixelData == NULL)
	{
		*gResult = memFullErr;
		return;
	}
		
	/* Set up to start receiving chunks of data. */
	
	VRect theRect;

	theRect.left = 0;
	theRect.right = header.cols;
	gFormatRecord->colBytes = (gFormatRecord->depth + 7) >> 3;
	gFormatRecord->rowBytes = RowBytes();
	gFormatRecord->planeBytes = 0;
	gFormatRecord->data = pixelData;
	gFormatRecord->transparencyMatting = DESIREDMATTING;

	for (plane = 0; *gResult == noErr && plane < gFormatRecord->planes; ++plane)
	{
		
		gFormatRecord->loPlane = gFormatRecord->hiPlane = plane;
		
		for (row = 0; *gResult == noErr && row < imageSize.v; ++row)
		{
			
			theRect.top = row;
			theRect.bottom = row + 1;

			SetFormatTheRect(theRect);
			
			if (*gResult == noErr)
				*gResult = gFormatRecord->advanceState ();
				
			if (*gResult == noErr)
				WriteRow (pixelData);
			
			gFormatRecord->progressProc (++done, total);
			
		}
		
	}
		
	gFormatRecord->data = NULL;
	
	sPSBuffer->Dispose(&pixelData);

	DoWriteICCProfile ();
}

/*****************************************************************************/

static void DoWriteContinue (void)
{
}

/*****************************************************************************/

static void DoWriteFinish (void)
{
	WriteScriptParamsOnWrite (); // should be different for read/write
}

/*****************************************************************************/

static void DoFilterFile (void)
{
	
	FileHeader header;
	
	/* Exit if we have already encountered an error. */

    if (*gResult != noErr) return;

	/* Read the file header. */

	*gResult = PSSDKSetFPos (gFormatRecord->dataFork, fsFromStart, 0);
	if (*gResult != noErr) return;
	
	ReadSome (sizeof (FileHeader), &header);
	
	if (*gResult != noErr) return;
	
	/* Check the identifier. */
	
	if (!CheckIdentifier (header.identifier))
	{
		*gResult = formatCannotRead;
		return;
	}
	
}

/*****************************************************************************/

static void DoReadLayerStart (void)
{
#if defined (LAYERED)
	// If you add fmtCanCreateThumbnail to the FormatFlags PiPL property
	// you will get called to create a thumbnail. The only way to tell
	// that you are processing a thumbnail is to check openForPreview in the
	// FormatRecord. You do not need to parse the entire file. You need to
	// process enough for a thumbnail view and you need to do it quickly.

	FileHeader header;
	
	Boolean showDialog = ReadScriptParamsOnRead (); // override params here
	
	/* Exit if we have already encountered an error. */

    if (*gResult != noErr) return;
		
	/* If we have not encountered an error, then we want to read
	   the file header. */

	*gResult = PSSDKSetFPos (gFormatRecord->dataFork, fsFromStart, 0);
	if (*gResult != noErr) return;
	
	ReadSome (sizeof (header.identifier), &header.identifier);
	if (*gResult != noErr) return;

	gData->needsSwap = false;
	
	int headerID = CheckIdentifier (header.identifier);
	
	if (headerID == HEADER_CANT_READ)
	{
		*gResult = formatCannotRead;
	}
	else if (headerID == HEADER_VER1)
	{
		HeaderVer1 headerVer1;
		
		ReadSome(sizeof(HeaderVer1), &headerVer1);
		
		header.mode = headerVer1.mode;
		header.depth = headerVer1.depth;
		header.rows = headerVer1.rows;
		header.cols = headerVer1.cols;
		header.planes = headerVer1.planes;
		header.transparencyPlane = 0;
		header.resourceLength = headerVer1.resourceLength;
	}
	else if (headerID == HEADER_VER2)
	{
		ReadSome(sizeof(HeaderVer2) - sizeof(header.identifier), &header.endian);
		// determine machine endian-ness
		uint32 tempLong = 0x11223344;
		uint8 tempChar = *(reinterpret_cast<uint8 *>(&tempLong) + 3);
		bool isLittleEndian = (tempChar == 0x11);
		if ((header.endian == LITTLEENDIAN) != isLittleEndian)
		{
			gData->needsSwap = true;
			Swap(header.testendian);
			Swap(header.mode);
			Swap(header.depth);
			Swap(header.rows);
			Swap(header.cols);
			Swap(header.planes);
			Swap(header.transparencyPlane);
			Swap(header.resourceLength);
		}
		
		if (header.testendian != TESTENDIAN)
		{
			*gResult = formatCannotRead;
			return;
		}
	}
	else
	{
		*gResult = formatCannotRead;
	}

	if (*gResult != noErr) return;

	gFormatRecord->imageMode = header.mode;
	VPoint imageSize;
	imageSize.v = header.rows;
	imageSize.h = header.cols;
	SetFormatImageSize(imageSize);
	gFormatRecord->depth = header.depth;
	gFormatRecord->planes = header.planes;
	gFormatRecord->transparencyPlane = header.transparencyPlane;
	gFormatRecord->transparencyMatting = DESIREDMATTING;
	
	/* Next, we will try to read the image resources. */
	/* If there is none then create an empty resource. */
	
	if (header.resourceLength > 0)
	{
		gFormatRecord->imageRsrcData = sPSHandle->New(header.resourceLength);
		
		if (gFormatRecord->imageRsrcData == NULL)
		{
			*gResult = memFullErr;
			return;
		}
			
		Ptr resourcePtr = NULL;
		sPSHandle->SetLock(gFormatRecord->imageRsrcData, true, &resourcePtr, NULL);
		
		if (resourcePtr != NULL)
		{
			ReadSome (header.resourceLength, resourcePtr);

			if (!gFormatRecord->openForPreview)
			{
				vector<ResourceInfo *> resources;
				CreateResourceInfoVector(header.resourceLength, 
					                     reinterpret_cast<uint8 *>(resourcePtr), 
										 resources);

				// see if the user wants to remove some resources
				if (showDialog && DoUI(resources))
				{
					header.resourceLength = RemoveResources(header.resourceLength, 
							                                resources, 
															reinterpret_cast<uint8 *>(resourcePtr));
					Handle h = sPSHandle->New(header.resourceLength);
					if (h == NULL)
					{
						*gResult = memFullErr;
						sPSHandle->Dispose(gFormatRecord->imageRsrcData);
						return;
					}
					Ptr newResourcePtr = NULL;
					sPSHandle->SetLock(h, true, &newResourcePtr, NULL);
					if (newResourcePtr != NULL)
					{
						copy(resourcePtr, resourcePtr + header.resourceLength, newResourcePtr);
						sPSHandle->Dispose(gFormatRecord->imageRsrcData);
						gFormatRecord->imageRsrcData = h;
					}
				}
				DeleteResourceInfoVector(resources);
			}

			sPSHandle->SetLock(gFormatRecord->imageRsrcData, false, &resourcePtr, NULL);
		
			if (*gResult != noErr)
				goto CleanUp;
			
			gFormatRecord->imageRsrcSize = header.resourceLength;
			}
		
	}
	else
	{

		if (sPSHandle->New != NULL)
			gFormatRecord->imageRsrcData = sPSHandle->New(0);
		gFormatRecord->imageRsrcSize = 0;

	}
		
	/* Next, we will will read the lookup tables if in indexed color mode. */
	
	if (header.mode == plugInModeIndexedColor)
	{
		
		ReadSome (3 * sizeof (LookUpTable), &gFormatRecord->redLUT);
		
		if (*gResult != noErr)
			goto CleanUp;
		
	}
		
	return;
		
	/* The following code does any clean-up work in the event of an error. */
	
	CleanUp:
	
	DisposeImageResources ();
#endif
}

/*****************************************************************************/

static void DoReadLayerContinue (void)
{
#if defined (LAYERED)
	DoReadContinue();
#endif
}

/*****************************************************************************/

static void DoReadLayerFinish (void)
{
#if defined (LAYERED)
	DoReadFinish();
#endif
}

/*****************************************************************************/

static void DoWriteLayerStart (void)
{
}

/*****************************************************************************/

static void DoWriteLayerFinish (void)
{
}

/*****************************************************************************/

/* This routine adds a history entry with the current system date and time
   to the file when incoming. */

static void AddComment (void)
{
	time_t ltime;
	time( &ltime);
	
	string currentTime = ctime(&ltime);

	size_t length = currentTime.size();

	Handle h = sPSHandle->New((int32)length);
	
	if (h != NULL)
	{
		Ptr p = NULL;
		sPSHandle->SetLock(h, true, &p, NULL);
		if (p != NULL)
		{
			for (size_t a = 0; a < length; a++)
				*p++ = currentTime.at(a);
			gAddResource(histResource, h);
			sPSHandle->SetLock(h, false, &p, NULL);
		}
		sPSHandle->Dispose(h);
	}
} // end AddComment

/**************************************************************************/
static void DoReadICCProfile(void)
{
	if (gFormatRecord->canUseICCProfiles)
	{
		ReadSome(sizeof(gFormatRecord->iCCprofileSize), &gFormatRecord->iCCprofileSize);
		if (*gResult == noErr)
		{
			gFormatRecord->iCCprofileData = sPSHandle->New(gFormatRecord->iCCprofileSize);
			Ptr data = NULL;
			sPSHandle->SetLock(gFormatRecord->iCCprofileData, true, &data, NULL);
			if (gFormatRecord->iCCprofileData != NULL && data != NULL)
			{
				ReadSome(gFormatRecord->iCCprofileSize, data);
				sPSHandle->SetLock(gFormatRecord->iCCprofileData, false, &data, NULL);
			}
		}
		else
		{
			*gResult = noErr; // it's an old file or one without ICC info, no worries
		}
	}
}

static void DoWriteICCProfile(void)
{
	if (gFormatRecord->canUseICCProfiles)
	{
		if (gFormatRecord->iCCprofileSize && gFormatRecord->iCCprofileData)
		{
			WriteSome(sizeof(gFormatRecord->iCCprofileSize), &gFormatRecord->iCCprofileSize);
			Ptr data = NULL;
			sPSHandle->SetLock(gFormatRecord->iCCprofileData, true, &data, NULL);
			if (data != NULL)
			{
				WriteSome(gFormatRecord->iCCprofileSize, data);
				sPSHandle->SetLock(gFormatRecord->iCCprofileData, false, &data, NULL);
			}
		}
	}
}

static VPoint GetFormatImageSize(void)
{
	VPoint returnPoint = { 0, 0};
	if (gFormatRecord->HostSupports32BitCoordinates && gFormatRecord->PluginUsing32BitCoordinates)
	{
		returnPoint.v = gFormatRecord->imageSize32.v;
		returnPoint.h = gFormatRecord->imageSize32.h;
	}
	else
	{
		returnPoint.v = gFormatRecord->imageSize.v;
		returnPoint.h = gFormatRecord->imageSize.h;
	}
	return returnPoint;
}

static void SetFormatImageSize(VPoint inPoint)
{
	if (gFormatRecord->HostSupports32BitCoordinates && 
		gFormatRecord->PluginUsing32BitCoordinates)
	{
		gFormatRecord->imageSize32.v = inPoint.v;
		gFormatRecord->imageSize32.h = inPoint.h;
	}
	else
	{
		gFormatRecord->imageSize.v = static_cast<int16>(inPoint.v);
		gFormatRecord->imageSize.h = static_cast<int16>(inPoint.h);
	}
}
static void SetFormatTheRect(VRect inRect)
{
	if (gFormatRecord->HostSupports32BitCoordinates && 
		gFormatRecord->PluginUsing32BitCoordinates)
	{
		gFormatRecord->theRect32.top = inRect.top;
		gFormatRecord->theRect32.left = inRect.left;
		gFormatRecord->theRect32.bottom = inRect.bottom;
		gFormatRecord->theRect32.right = inRect.right;
	}
	else
	{
		gFormatRecord->theRect.top = static_cast<int16>(inRect.top);
		gFormatRecord->theRect.left = static_cast<int16>(inRect.left);
		gFormatRecord->theRect.bottom = static_cast<int16>(inRect.bottom);
		gFormatRecord->theRect.right = static_cast<int16>(inRect.right);
	}
}

//------------------------------------------------------------------------------
//
// CreateDataHandle
//
// Create a handle to our Data structure. Photoshop will take ownership of this
// handle and delete it when necessary.
//------------------------------------------------------------------------------
static void CreateDataHandle(void)
{
	Handle h = sPSHandle->New(sizeof(Data));
	if (h != NULL)
		*gDataHandle = reinterpret_cast<intptr_t>(h);
	else
		*gResult = memFullErr;
}

//------------------------------------------------------------------------------
//
// LockHandles
//
// Lock the handles and get the pointers for gData and gParams
// Set the global error, *gResult, if there is trouble
//
//------------------------------------------------------------------------------
static void LockHandles(void)
{
	if ( ! (*gDataHandle) )
	{
		*gResult = formatBadParameters;
		return;
	}
	
	sPSHandle->SetLock(reinterpret_cast<Handle>(*gDataHandle), true, 
		               reinterpret_cast<Ptr *>(&gData), NULL);
	
	if (gData == NULL)
	{
		*gResult = memFullErr;
		return;
	}
}

//------------------------------------------------------------------------------
//
// UnlockHandles
//
// Unlock the handles used by the data and params pointers
//
//------------------------------------------------------------------------------
static void UnlockHandles(void)
{
	if (*gDataHandle)
		sPSHandle->SetLock(reinterpret_cast<Handle>(*gDataHandle), false, 
		                   reinterpret_cast<Ptr *>(&gData), FALSE);
}

static void CreateResourceInfoVector(int32 length, 
									 uint8 * resources, 
									 vector<ResourceInfo *> & rInfos)
{
	rInfos.clear();

	int32 calculatedLength = 0;

	uint8 * resourcesEnd = resources + length;

	while (resources < resourcesEnd)
	{
		ResourceInfo * thisResource = new ResourceInfo;

		thisResource->totalSize = 0;
		
		thisResource->type = GetBigEndian<uint32>(resources);
		thisResource->totalSize += sizeof(thisResource->type);
		
		thisResource->id = GetBigEndian<uint16>(resources);
		thisResource->totalSize += sizeof(thisResource->id);

		uint8 nameLength = *resources++;
		thisResource->totalSize++;

		thisResource->name.reserve(nameLength);
		ostringstream inputName;
		for (int a = 0; a < nameLength; a++)
		{
			inputName << *resources++;
			thisResource->totalSize++;
		}
		thisResource->name = inputName.str();

		resources += nameLength | uint8(1); // Add one if even for alignment;
		thisResource->totalSize += nameLength | uint8(1);

		thisResource->size = GetBigEndian<uint32>(resources);
		thisResource->totalSize += sizeof(thisResource->size);

		resources += (thisResource->size + 1) & ~uint32(1); // Add one if odd for alignment;
		thisResource->totalSize += (thisResource->size + 1) & ~uint32(1); // Add one if odd for alignment;

		thisResource->keep = true;
		
		rInfos.push_back(thisResource);
		
		calculatedLength += thisResource->totalSize;
	} 
}

static void DeleteResourceInfoVector(vector<ResourceInfo *> & rInfos)
{
	size_t count = rInfos.size();
	for (size_t a = 0; a < count; a++)
	{
		ResourceInfo * thisResource = rInfos.at(a);
		delete thisResource;
	}
}

static int32 RemoveResources(int32 resourceLength, 
							 const vector<ResourceInfo *> & rInfos, 
							 uint8 * resourcePtr)
{
	size_t count = rInfos.size();

	for (size_t a = 0; a < count; a++)
	{
		if (! rInfos.at(a)->keep)
		{
			resourceLength = RemoveResource(rInfos.at(a)->type,
				                            rInfos.at(a)->id,
											resourcePtr,
											resourceLength,
											resourcePtr);
		}
	}
		
	return resourceLength;
}

static int32 RemoveResource(uint32 type,
							uint16 id,
							uint8 * imageResource,
							int32 size,
							uint8 * dest)
{
	/*
	[first, last) is the source range. first will close on last as we
	search for the resource.
	*/
	uint8 * first  = imageResource;
	uint8 * last  = first + size;
	
	/*
	[resFirst, resLast) marks the range enclosing the found resource
	if the resource has not been found then the range is empty but within
	[first, last).
	*/
	
	uint8 * resFirst  = first;
	uint8 * resLast = first;
	
	// min bytes is the minimum number of bytes in the resource header.
	
	const ptrdiff_t minBytes(sizeof(uint32) + sizeof(uint16) + sizeof(int8));

	while ((last - first) >= minBytes) 
	{
		resFirst = first;
		resLast = first;
	
		// Read the type
		uint32 readType = GetBigEndian<uint32>(first);
		
		// Read the id
		uint16 readID (GetBigEndian<uint16>(first));
		
		// Skip the name
		uint8 length = *first++;
		first += length | uint8(1); // Add one if even for alignment;
		
		// Make sure we have enough space to read the blockSize
		if ((last - first) < sizeof(uint32)) break;
		
		// Read the block size
		uint32 blockSize (GetBigEndian<uint32>(first));
		
		// Skip the block
		first += (blockSize + 1) & ~uint32(1); // Add one if odd for alignment;
		
		if ((readType == type) && (readID == id)) {
			resLast = first;
			break;
		}
	}
	
	/*
	Handle the copy as two pieces. If the resource was found then this will omit it.
	Otherwise it is simply copied as all but the last resoruce, and then the last resource.
	*/
	
	uint8 * destEnd = NULL;

	if (resFirst == resLast)
	{
		if (dest != imageResource)
		{
			// nothing was found and I need to copy everything
			destEnd = copy(imageResource, imageResource + size, dest);
		}
		else
		{
			// nothing was found and I don't need to copy anything
			destEnd = imageResource + size;
		}
	}
	else
	{
		if (dest != imageResource)
		{
			// something was found and I need to copy over the start
			destEnd = copy(imageResource, resFirst, dest);
			// skipping the resource that I found
			destEnd = copy(resLast, last, destEnd);
		}
		else
		{
			// skip over the resource only
			destEnd = copy(resLast, last, resFirst); //destEnd);
		}
	}

	return int32(destEnd - dest);
}

#if Macintosh
bool DoUI (vector<ResourceInfo *> & rInfos)
{
	return false;
}
void DoAbout(SPPluginRef plugin, int dialogID)
{
}
#endif
// end brac.cpp