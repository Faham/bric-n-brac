#/**********************************************************\ 
#
# Auto-Generated Plugin Configuration file
# for Brac Extenssion Provider
#
#\**********************************************************/

set(PLUGIN_NAME "BracExtenssionProvider")
set(PLUGIN_PREFIX "BEP")
set(COMPANY_NAME "UofS")

# ActiveX constants:
set(FBTYPELIB_NAME BracExtenssionProviderLib)
set(FBTYPELIB_DESC "BracExtenssionProvider 1.0 Type Library")
set(IFBControl_DESC "BracExtenssionProvider Control Interface")
set(FBControl_DESC "BracExtenssionProvider Control Class")
set(IFBComJavascriptObject_DESC "BracExtenssionProvider IComJavascriptObject Interface")
set(FBComJavascriptObject_DESC "BracExtenssionProvider ComJavascriptObject Class")
set(IFBComEventSource_DESC "BracExtenssionProvider IFBComEventSource Interface")
set(AXVERSION_NUM "1")

# NOTE: THESE GUIDS *MUST* BE UNIQUE TO YOUR PLUGIN/ACTIVEX CONTROL!  YES, ALL OF THEM!
set(FBTYPELIB_GUID 7d02cd29-3406-5c7b-8919-b2e302e63969)
set(IFBControl_GUID 6a2715b0-2865-5d59-87b0-a8368a824b7a)
set(FBControl_GUID f4949555-610e-5bb5-9925-6e8f16ea1508)
set(IFBComJavascriptObject_GUID 4832bb9a-f5c2-5428-a27c-e9a652ca11da)
set(FBComJavascriptObject_GUID 2e9e6362-69be-547e-839c-14eabc55d694)
set(IFBComEventSource_GUID b66cede7-29cd-5458-8fdb-bbf50b0766de)

# these are the pieces that are relevant to using it from Javascript
set(ACTIVEX_PROGID "UofS.BracExtenssionProvider")
set(MOZILLA_PLUGINID "www.uofs.ca/BracExtenssionProvider")

# strings
set(FBSTRING_CompanyName "University of Saskatchewan")
set(FBSTRING_FileDescription "Provides basic functionalities to Brac extenssion")
set(FBSTRING_PLUGIN_VERSION "1.0.0.0")
set(FBSTRING_LegalCopyright "Copyright 2012 University of Saskatchewan")
set(FBSTRING_PluginFileName "np${PLUGIN_NAME}.dll")
set(FBSTRING_ProductName "Brac Extenssion Provider")
set(FBSTRING_FileExtents "")
set(FBSTRING_PluginName "Brac Extenssion Provider")
set(FBSTRING_MIMEType "application/x-bep")

# Uncomment this next line if you're not planning on your plugin doing
# any drawing:

#set (FB_GUI_DISABLED 1)

# Mac plugin settings. If your plugin does not draw, set these all to 0
set(FBMAC_USE_QUICKDRAW 0)
set(FBMAC_USE_CARBON 1)
set(FBMAC_USE_COCOA 1)
set(FBMAC_USE_COREGRAPHICS 1)
set(FBMAC_USE_COREANIMATION 0)
set(FBMAC_USE_INVALIDATINGCOREANIMATION 0)

# If you want to register per-machine on Windows, uncomment this line
#set (FB_ATLREG_MACHINEWIDE 1)
