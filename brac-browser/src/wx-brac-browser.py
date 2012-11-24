# -*- coding: utf-8 -*- 

###########################################################################
## Python code generated with wxFormBuilder (version Jun 30 2011)
## http://www.wxformbuilder.org/
##
## PLEASE DO "NOT" EDIT THIS FILE!
###########################################################################

import wx
import wx.xrc

###########################################################################
## Class wxFrameBracBrowser
###########################################################################

class wxFrameBracBrowser ( wx.Frame ):
	
	def __init__( self, parent ):
		wx.Frame.__init__ ( self, parent, id = wx.ID_ANY, title = u"Brac Browser", pos = wx.DefaultPosition, size = wx.Size( 475,497 ), style = 0|wx.TAB_TRAVERSAL )
		
		self.SetSizeHintsSz( wx.DefaultSize, wx.DefaultSize )
		
		bSizer1 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_panel_main = wx.Panel( self, wx.ID_ANY, wx.DefaultPosition, wx.DefaultSize, wx.NO_BORDER|wx.TAB_TRAVERSAL )
		bSizer11 = wx.BoxSizer( wx.VERTICAL )
		
		bSizer14 = wx.BoxSizer( wx.HORIZONTAL )
		
		self.m_staticText_filename = wx.StaticText( self.m_panel_main, wx.ID_ANY, u"Image's filename", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText_filename.Wrap( -1 )
		self.m_staticText_filename.SetForegroundColour( wx.SystemSettings.GetColour( wx.SYS_COLOUR_ACTIVEBORDER ) )
		
		bSizer14.Add( self.m_staticText_filename, 0, wx.ALL, 5 )
		
		
		bSizer14.AddSpacer( ( 0, 0), 1, wx.EXPAND, 5 )
		
		self.m_button_minimum = wx.Button( self.m_panel_main, wx.ID_ANY, u"_", wx.DefaultPosition, wx.DefaultSize, wx.BU_EXACTFIT|wx.NO_BORDER )
		bSizer14.Add( self.m_button_minimum, 0, wx.ALL, 0 )
		
		self.m_button_maximum = wx.Button( self.m_panel_main, wx.ID_ANY, u"[]", wx.DefaultPosition, wx.DefaultSize, wx.BU_EXACTFIT|wx.NO_BORDER )
		bSizer14.Add( self.m_button_maximum, 0, wx.ALL, 0 )
		
		self.m_button_close = wx.Button( self.m_panel_main, wx.ID_ANY, u"x", wx.DefaultPosition, wx.DefaultSize, wx.BU_EXACTFIT|wx.NO_BORDER|wx.TRANSPARENT_WINDOW )
		bSizer14.Add( self.m_button_close, 0, wx.ALL, 0 )
		
		bSizer11.Add( bSizer14, 1, wx.EXPAND, 0 )
		
		bSizer15 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_panel_image = wx.Panel( self.m_panel_main, wx.ID_ANY, wx.DefaultPosition, wx.DefaultSize, wx.TAB_TRAVERSAL )
		bSizer15.Add( self.m_panel_image, 1, wx.EXPAND |wx.ALL, 5 )
		
		bSizer11.Add( bSizer15, 1, wx.EXPAND, 5 )
		
		self.m_bitmap_background = wx.StaticBitmap( self.m_panel_main, wx.ID_ANY, wx.Bitmap( u"../resources/transparent_checkerboard_square_125.png", wx.BITMAP_TYPE_ANY ), wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer11.Add( self.m_bitmap_background, 1, wx.EXPAND|wx.ALL, 0 )
		
		self.m_panel_main.SetSizer( bSizer11 )
		self.m_panel_main.Layout()
		bSizer11.Fit( self.m_panel_main )
		bSizer1.Add( self.m_panel_main, 1, wx.EXPAND |wx.ALL, 0 )
		
		self.SetSizer( bSizer1 )
		self.Layout()
		
		self.Centre( wx.BOTH )
	
	def __del__( self ):
		pass
	

