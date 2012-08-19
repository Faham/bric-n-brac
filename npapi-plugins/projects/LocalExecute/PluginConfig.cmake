#/**********************************************************\ 
#
# Auto-Generated Plugin Configuration file
# for Local Execute
#
#\**********************************************************/

set(PLUGIN_NAME "LocalExecute")
set(PLUGIN_PREFIX "LEX")
set(COMPANY_NAME "UofS")

# ActiveX constants:
set(FBTYPELIB_NAME LocalExecuteLib)
set(FBTYPELIB_DESC "LocalExecute 1.0 Type Library")
set(IFBControl_DESC "LocalExecute Control Interface")
set(FBControl_DESC "LocalExecute Control Class")
set(IFBComJavascriptObject_DESC "LocalExecute IComJavascriptObject Interface")
set(FBComJavascriptObject_DESC "LocalExecute ComJavascriptObject Class")
set(IFBComEventSource_DESC "LocalExecute IFBComEventSource Interface")
set(AXVERSION_NUM "1")

# NOTE: THESE GUIDS *MUST* BE UNIQUE TO YOUR PLUGIN/ACTIVEX CONTROL!  YES, ALL OF THEM!
set(FBTYPELIB_GUID c996b115-2f98-5f1e-994a-195b32822516)
set(IFBControl_GUID 06281b89-717f-50d7-8353-1e522b270d29)
set(FBControl_GUID 0d3e8f9c-c52d-5091-8852-3cc89ba7cfe5)
set(IFBComJavascriptObject_GUID 07aaa881-095b-5e4f-b79d-ac0b65ce2942)
set(FBComJavascriptObject_GUID 47f26c51-67c8-50ee-981b-97039f7c5d13)
set(IFBComEventSource_GUID a98661a7-5997-5706-a90a-fa80ae06fd93)

# these are the pieces that are relevant to using it from Javascript
set(ACTIVEX_PROGID "UofS.LocalExecute")
set(MOZILLA_PLUGINID "www.uofs.ca/LocalExecute")

# strings
set(FBSTRING_CompanyName "University of Saskatchewan")
set(FBSTRING_FileDescription "Executes local system commands")
set(FBSTRING_PLUGIN_VERSION "1.0.0.0")
set(FBSTRING_LegalCopyright "Copyright 2012 University of Saskatchewan")
set(FBSTRING_PluginFileName "np${PLUGIN_NAME}.dll")
set(FBSTRING_ProductName "Local Execute")
set(FBSTRING_FileExtents "")
set(FBSTRING_PluginName "Local Execute")
set(FBSTRING_MIMEType "application/x-localexecute")

# Uncomment this next line if you're not planning on your plugin doing
# any drawing:

set (FB_GUI_DISABLED 1)

# Mac plugin settings. If your plugin does not draw, set these all to 0
set(FBMAC_USE_QUICKDRAW 0)
set(FBMAC_USE_CARBON 0)
set(FBMAC_USE_COCOA 0)
set(FBMAC_USE_COREGRAPHICS 0)
set(FBMAC_USE_COREANIMATION 0)
set(FBMAC_USE_INVALIDATINGCOREANIMATION 0)

# If you want to register per-machine on Windows, uncomment this line
#set (FB_ATLREG_MACHINEWIDE 1)
