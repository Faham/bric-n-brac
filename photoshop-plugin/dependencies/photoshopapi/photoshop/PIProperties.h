// ADOBE SYSTEMS INCORPORATED
// Copyright  1993 - 2005 Adobe Systems Incorporated
// All Rights Reserved
//
// NOTICE:  Adobe permits you to use, modify, and distribute this 
// file in accordance with the terms of the Adobe license agreement
// accompanying it.  If you have received this file from a source
// other than Adobe, then your use, modification, or distribution
// of it requires the prior written permission of Adobe.
//-------------------------------------------------------------------
/**
 *	\file PIProperties.h
 *
 *	\brief This file contains the public definitions and structures
 *		for the properties callback suite.
 *
 *	\details
 *		If you are working with any properties via the properties
 *		or action get mechanisms, this documents what is available
 *		and its basic format.
 *
 *	Distribution:
 *		PUBLIC
 *
 */

#ifndef __PIProperties_h__ // Already defined?
#define __PIProperties_h__

#if PRAGMA_ONCE
#pragma once
#endif

//-------------------------------------------------------------------------------
/** @defgroup PropertyKeys Property Keys Recognized by Property Suite Callbacks
* Properties are either simple (represented by a 32 bit integer) or complex (represented 
* by a handle).  Some properties can be modified by calling @ref SetPropertyProc, others are
* read-only, and can only be used with @ref GetPropertyProc.
*/

///@ingroup PropertyKeys
///@{
/** Number of channels in the document; (Simple, read-only). */  
#define propNumberOfChannels  'nuch'

/** Name of the channel; (Complex, read-only). The channels are indexed from 0 and consist of the 
* composite channels, the transparency mask, the layer mask, and the alpha channels.
*/
#define propChannelName		  'nmch'

/**	Unicode characters for the name of the channel; (Complex, read-only).
*/
#define propUnicodeChannelName 'unch'

/** Lock bits for the target layer; (Simple, read-only). 
* See @ref TargetLayerLockBits "target layer lock bits".
*/
#define propTargetLayerLock	  'tllk'
///@}

///@defgroup TargetLayerLockBits Target Layer Lock Bits
///These are returned for @ref propTargetLayerLock. 

///@ingroup TargetLayerLockBits
//@{
#define propTargetLayerLockNone					0x0		  /**< No layer lock bit. */
#define	propTargetLayerLockTransparency			0x1 << 0  /**< Transparency layer lock bit. */
#define	propTargetLayerLockComposite			0x1 << 1  /**< Composite layer lock bit. */
#define	propTargetLayerLockPosition				0x1 << 2  /**< Position layer lock bit. */
//@}

///@ingroup PropertyKeys
///@{
/** Mode of the image, returned using the @ref ImageModes "Image Modes" constants; (Simple, read-only).
*/
#define propImageMode		  'mode'

/** Number of paths in the document; (Simple, read-only).
*/
#define propNumberOfPaths	  'nupa'

/** Name of the indexed path; (Complex, read-only). The paths are indexed starting with zero.
* A complex, read-only property.
*/
#define propPathName          'nmpa'

/** Unicode name of the indexed path; (Complex, read-only). 
*/
#define propUnicodePathName	  'unmp'

/// Returns the contents of the indexed path (zero-based). (Complex):
/**	 
* Contents of the indexed path in the format described 
* in the path resources documentation; (Complex, read-only). 
* The paths are indexed starting with zero. The data is stored in big 
* endian form. Refer to chapter 10 for more information on path data.
*/
#define propPathContents      'path'

/**	 
* Contents of the path as Illustrator data; (Complex, read-only).  The paths are indexed
* starting with zero.  
*/
#define propPathContentsAI	  'paAI'

/**  
* Index of the work path; (Simple, read-only).  The value of the property is -1 if no work path.
*/ 
#define propWorkPathIndex     'wkpa'

/**  
* Index of the clipping path; (Simple, read-only).  The value of the property is -1 if no clipping path.
*/ 
#define propClippingPathIndex 'clpa'

/**  
* Index of the target path; (Simple, read-only).  The value of the property is -1 if no target path.
*/ 
#define propTargetPathIndex   'tgpa'

/**  
* File caption information in a IPTC-NAA record; (Complex, modifiable). 
* For more information, see <em> Photoshop File Formats.pdf. </em>
*/ 
#define propCaption			  'capt'

/**  
* File XMP meta information in a IPTC-NAA record; (Complex, modifiable). 
*/ 
#define propXMP			  	  'xmpd'

/**	Horizontal component of the nudge distance, represented as a 16.16 value; (Simple, modifiable). 
* This is the value used when moving around using the shift key. 
* The default value is ten pixels. 
*/
#define propBigNudgeH		  'bndH'												 
/**	Vertical component of the nudge distance, represented as a 16.16 value; (Simple, modifiable). 
* This is the value used when moving around using the shift key. 
* The default value is ten pixels. 
*/
#define propBigNudgeV		  'bndV'

/**	 
* Current interpolation method; (Simple, read-only). 1=point sample, 2=bilinear, 3=bicubic.
*/
#define propInterpolationMethod 'intp'

/**	 
* Current ruler units; (Simple, read-only). For values, see @ref RulerUnits.
*/
#define propRulerUnits		    'rulr'
///@}

/** Types of ruler units. */
typedef enum
	{
	kRulerPixels,			   /**< Ruler units in pixels */
	kRulerInches,			   /**< Ruler units in inches */
	kRulerCm,				   /**< Ruler units in centimeters */
	kRulerMillimeters,		   /**< Rule units in millimeters. Type units in Japan (Q/Ha saved for 7) */
	kRulerPoints,			   /**< Ruler units in points */
	kRulerPicas,			   /**< Ruler units in picas */
	kRulerPercent			   /**< Ruler units in percent */
	} RulerUnits;

///@ingroup PropertyKeys
///@{
/**	
* Horizontal component of the current ruler origin, represented as a 16.16 value; (Simple, modifiable).
*/
#define propRulerOriginH		'rorH'
/**	 
* Vertical component of the current ruler origin, represented as a 16.16 value; (Simple, modifiable).
*/
#define propRulerOriginV		'rorV'

/**	
* Current major grid rules, in inches, unless \c propRulerUnits is pixels, and
* then pixels; (Simple, modifiable).  Represented as 16.16 value. 
*/
#define propGridMajor			'grmj'

/**	 The current number of grid subdivisions per major rule; (Simple, modifiable).
*/
#define propGridMinor			'grmn'

/**	
* The serial number string shown to the user; (Complex, read-only).
* DEPRECATED - Use propSerialString2 below 
*/
#define propSerialString		'sstr'

/**	
* The serial number string shown to the user; (Complex, read-only). 
*/
#define propSerialString2		'sstR'

/**	 
* Hardware gamma table.	Only valid for Windows; (Complex, read-only).
*/
#define propHardwareGammaTable	'hgam'

/**	
* The interface color scheme; (Complex, read-only). Allows a plug-in interface to mimic system colors. 
* The handle returned from \c getPropertyProc can be cast as a \c PIInterfaceColor structure.
* @note Currently, user-selected system colors are supported on Windows; 
* when they are available on MAC OS, they will likely be supported in future 
* versions of Photoshop through this same mechanism.
* 
* The color scheme is indexed, see @ref InterfaceColorIndex 
* "Interface Color Indexes" for index values to pass into \c getPropertyProc.	
* These interface color values map onto Photoshop system colors according to the following diagram:
*
* <DIV> <IMG SRC="InterfaceScheme.gif"></DIV>
*
* Constants are remapped to create the system look. Use the indexed color scheme to draw PICTs.
* <DIV> <IMG SRC="InterfaceSystem.gif"></DIV>
* 
*/
#define propInterfaceColor		'iclr'

/**
* The watch suspension level; (Simple, modifiable). When non-zero, a plug-in can make callbacks to the host 
* without fear that the watch will start spinning. It is reset to zero at the beginning 
* of each call from the host to the plug-in. 
*/
#define propWatchSuspension		'wtch'

/**
* Whether the current image is considered under copywrite; (Simple, modifiable).
* This property key can only be used to set the flag.
*/
#define propCopyright			'cpyr'
/**
* Whether the current image is considered under copywrite; (Simple, modifiable).
*/
#define propCopyright2			'cpyR'

/**	 
* Indicates whether a digital signature or watermark is present; (Simple, modifiable). 
* The (c) copyright symbol will appear if this is set, or if the user has checked 
* the copyrightproperty in the File Info dialog. Do not turn the copyright flag off, ever. 
* Use to indicate if you�ve found your digital signature.
*/
#define propWatermark			'watr'

/**	The URL for the current image; (Complex, modifiable). 
*/
#define propURL					'URL '

/**	
* The title of the current document; (Complex, read-only).
*/
#define propTitle				'titl'

/**
* The width of the current document in pixels; (Simple, read-only). 
*/
#define propDocumentWidth		'docW'

/**
* The height of the current document in pixels; (Simple, read-only).
*/
#define propDocumentHeight		'docH'

/**
* The slices for the document; (Complex, modifiable).
* See the Slices resource format documented in <em> Photoshop File Formats.pdf. </em>
*/
#define propSlices				'slcs'

/**
* The currently selected slice ID; (Simple, modifiable).
*/
#define propSelectedSliceID		'slid'

/**	
* The currently selected slice ID list; (Complex, modifiable).
*/
#define propSelectedSliceIDList	'slis'

/**
* The currently selected slice index; (Simple, read-only).
*/
#define propSelectedSliceIndex	'slin'

// Whether the slice numers are show (Simple)
/**
* Indicate whether the user has set slice numbers to show; (Simple, read-only). 
*/
#define propShowSliceNumbers	'slsh'

/**
* The color of the slice lines; (Complex, read-only).
*/
#define propSliceLineColor		'sllc'

/**	 
* Tool tip display; (Simple, read-only). The value is 0 if off, 1 if on. 
*/
#define propToolTips			'tltp'

/**	
* Type of paint cursor being used; (Simple, read-only). 1 = standard; 2 = precise; 3 = brush size.
*/
#define propPaintCursorKind		'PCrK'

/**	 
* Cursor options being used; (Simple, read-only). 1 = normal; 2 = full sized.
*/
#define propPaintCursorShape	'PCrS'

// Is the cursor crosshair always visible (Simple)
// 0 - no
// 1 - yes
/**
* Cursor crosshair visibility; (Simple, read-only). 
* 0 = not visible; 1 = visible.
*/
#define propPaintCursorCrosshair	'PCrC'


/**
* EXIF camera and device data; (Complex, modifiable).
* The EXIF property is controlled by The Japan Electronic Industry Development 
* Association (JEIDA) and Electronic Industries Association of Japan (EIAJ) 
* which merged in November of 2000. The EXIF specification can be downloaded from 
* their web site at the following location:
* http://it.jeita.or.jp/jhistory/document/standard/exif_eng/jeida49eng.htm
*/
#define propEXIFData			'EXIF'

// current version of photoshop Major.Minor.Fix
/**
* Current version of Photoshop.  
* Major.Minor.Fix 
*/
#define propVersion				'vers'

// Is an action play in progress? actions palette or automation plug in(Simple)
/**
* Action play information, for actions palette or automation plug in; (Simple, read-only).
*/
#define propPlayInProgress		'plip'

// Get the unicode name of the document
/**
* Unicode name of the document; (Complex, read-only).
*/
#define propUnicodeName			'unnm'

// Get the unicode name of the document
/**
* Unicode name of the document; (Complex, read-only).
*/
#define propUniStr255Name		'u25n'

/**
* Unicode name of the document without extension; (Complex, read-only).
*/
#define propUnicodeNameWithoutExtension 'neun'

/**
* Global "Don't show again" counter for dialog boxes; (Simple, read-only).  
* The property value is incremented
* every time these dialogs are reset.  Each dialog that supports this feature
* should maintain its own unsigned32 counter in the preferences file.  It
* should be initialized to zero.  Before showing the dialog, the local counter
* should be compared to the global counter.  If equal, don't show the dialog.
* When the user checks the "Don't show again" check box, the local counter
* should be set to the master counter. 
*/
#define propDontShowAgainCount	'DSAC'

/**
* Number of layers in the document; (Simple, read-only).
*/
#define propNumberOfLayers		'nuly'

/**
* Index of the target layer; (Simple, read-only).
*/
#define propTargetLayerIndex	'tgly'

/**
* Layer name of the layer with a given index; (Complex, read-only).
*/
#define propLayerName			'lynm'

/**
* Layer name as a unicode string of the layer with a given index; (Complex, read-only).
*/
#define propUnicodeLayerName	'lynu'

/**
* Pixel aspect ratio for the document; (Simple, read-only).
*/
#define propPixelScaleFactor	'pxsf'

/**
* Current operation is part of a place command; (Simple, read-only).
* Provided for file formats that need to record descriptors differently when placing.
*/
#define propDoingPlace			'DPlc'

/**
* Current operation is part of rasertizing a smart object; (Simple, read-only).
* Provided for file formats that need to read/obey descriptors differently when rasterizing.
*/
#define propRasterizingSmartObject	'RsSO'

/**
* Use this property to tell if Photoshop is in a modal dialog or a modal tool. (Simple)
*/
#define propAppIsModal			'aism'

/**
* measurement scale pixel length (Simple)
*/
#define propPixelLength				'MSpl'

/**
* measurement scale logical length(Simple)
*/
#define propLogicalLength				'MSll'

/**
* measurement scale units in unicode string (Complex)
*/
#define propMUnits				'MSun'

/*
* tile size in bytes (Simple, read-only)
*/
#define propTileSize		'TSiz'

/*
* APE library has initialized correctly (Simple, read-only)
*/
#define propAPEIsInitialized	'mnky'

///@}
//-------------------------------------------------------------------------------

#endif // __PIProperties_h__
