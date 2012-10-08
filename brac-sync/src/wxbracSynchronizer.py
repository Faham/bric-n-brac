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
## Class wxFrameSettings
###########################################################################

class wxFrameSettings ( wx.Frame ):
	
	def __init__( self, parent ):
		wx.Frame.__init__ ( self, parent, id = wx.ID_ANY, title = u"Brac Synchronizer", pos = wx.DefaultPosition, size = wx.Size( 847,464 ), style = wx.DEFAULT_FRAME_STYLE|wx.TAB_TRAVERSAL )
		
		self.SetSizeHintsSz( wx.DefaultSize, wx.DefaultSize )
		
		bSizer1 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_panel_main = wx.Panel( self, wx.ID_ANY, wx.DefaultPosition, wx.DefaultSize, wx.TAB_TRAVERSAL )
		bSizer7 = wx.BoxSizer( wx.VERTICAL )
		
		bSizer10 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_checkBox_startup = wx.CheckBox( self.m_panel_main, wx.ID_ANY, u"Start on OS startup", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer10.Add( self.m_checkBox_startup, 0, wx.ALL, 5 )
		
		bSizer7.Add( bSizer10, 0, wx.EXPAND, 5 )
		
		bSizer2 = wx.BoxSizer( wx.HORIZONTAL )
		
		bSizer3 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_staticText_toselect = wx.StaticText( self.m_panel_main, wx.ID_ANY, u"Choose brac directories or files to be added to the synchronizing queue.", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText_toselect.Wrap( 300 )
		bSizer3.Add( self.m_staticText_toselect, 0, wx.ALL|wx.ALIGN_CENTER_VERTICAL|wx.EXPAND, 5 )
		
		self.m_genericDirCtrl_select = wx.GenericDirCtrl( self.m_panel_main, wx.ID_ANY, wx.EmptyString, wx.DefaultPosition, wx.DefaultSize, wx.DIRCTRL_SHOW_FILTERS|wx.SUNKEN_BORDER, u"Brac files (*.brac)|*.brac|All files (*.*)|*.*", 0 )
		
		self.m_genericDirCtrl_select.ShowHidden( False )
		bSizer3.Add( self.m_genericDirCtrl_select, 1, wx.EXPAND |wx.ALL, 0 )
		
		bSizer2.Add( bSizer3, 1, wx.EXPAND, 0 )
		
		bSizer4 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_button_add = wx.BitmapButton( self.m_panel_main, wx.ID_ANY, wx.Bitmap( u"../resources/arr_right.png", wx.BITMAP_TYPE_ANY ), wx.DefaultPosition, wx.DefaultSize, wx.BU_AUTODRAW )
		self.m_button_add.SetDefault() 
		bSizer4.Add( self.m_button_add, 0, wx.ALL, 5 )
		
		bSizer2.Add( bSizer4, 0, wx.ALIGN_CENTER_VERTICAL, 5 )
		
		bSizer6 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_staticText_selected = wx.StaticText( self.m_panel_main, wx.ID_ANY, u"Selected brac files and directories", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText_selected.Wrap( -1 )
		bSizer6.Add( self.m_staticText_selected, 0, wx.ALL, 5 )
		
		bSizer9 = wx.BoxSizer( wx.HORIZONTAL )
		
		self.m_listCtrl_selected = wx.ListCtrl( self.m_panel_main, wx.ID_ANY, wx.DefaultPosition, wx.DefaultSize, wx.LC_REPORT )
		bSizer9.Add( self.m_listCtrl_selected, 1, wx.ALL|wx.EXPAND, 0 )
		
		bSizer101 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_button_up = wx.BitmapButton( self.m_panel_main, wx.ID_ANY, wx.Bitmap( u"../resources/arr_up.png", wx.BITMAP_TYPE_ANY ), wx.DefaultPosition, wx.Size( -1,-1 ), wx.BU_AUTODRAW )
		bSizer101.Add( self.m_button_up, 0, wx.ALL, 5 )
		
		self.m_button_down = wx.BitmapButton( self.m_panel_main, wx.ID_ANY, wx.Bitmap( u"../resources/arr_down.png", wx.BITMAP_TYPE_ANY ), wx.DefaultPosition, wx.Size( -1,-1 ), wx.BU_AUTODRAW )
		bSizer101.Add( self.m_button_down, 0, wx.ALL, 5 )
		
		self.m_button_remove = wx.BitmapButton( self.m_panel_main, wx.ID_ANY, wx.Bitmap( u"../resources/remove.png", wx.BITMAP_TYPE_ANY ), wx.DefaultPosition, wx.DefaultSize, wx.BU_AUTODRAW )
		bSizer101.Add( self.m_button_remove, 0, wx.ALL, 5 )
		
		bSizer9.Add( bSizer101, 0, wx.EXPAND, 5 )
		
		bSizer6.Add( bSizer9, 1, wx.EXPAND, 5 )
		
		bSizer8 = wx.BoxSizer( wx.HORIZONTAL )
		
		
		bSizer8.AddSpacer( ( 0, 0), 1, wx.EXPAND, 5 )
		
		self.m_button_apply = wx.Button( self.m_panel_main, wx.ID_ANY, u"&Apply", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer8.Add( self.m_button_apply, 0, wx.ALL, 5 )
		
		self.m_button_close = wx.Button( self.m_panel_main, wx.ID_ANY, u"&Close", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer8.Add( self.m_button_close, 0, wx.ALL, 5 )
		
		bSizer6.Add( bSizer8, 0, wx.EXPAND, 5 )
		
		bSizer2.Add( bSizer6, 1, wx.EXPAND, 5 )
		
		bSizer7.Add( bSizer2, 1, wx.EXPAND, 5 )
		
		self.m_panel_main.SetSizer( bSizer7 )
		self.m_panel_main.Layout()
		bSizer7.Fit( self.m_panel_main )
		bSizer1.Add( self.m_panel_main, 1, wx.EXPAND |wx.ALL, 0 )
		
		self.SetSizer( bSizer1 )
		self.Layout()
		
		self.Centre( wx.BOTH )
		
		# Connect Events
		self.m_checkBox_startup.Bind( wx.EVT_CHECKBOX, self.OnCheckBoxStart )
		self.m_button_add.Bind( wx.EVT_BUTTON, self.OnButtonClickAdd )
		self.m_listCtrl_selected.Bind( wx.EVT_LEFT_DOWN, self.OnLeftDownListCtrlSelected )
		self.m_button_up.Bind( wx.EVT_BUTTON, self.OnButtonClickUp )
		self.m_button_down.Bind( wx.EVT_BUTTON, self.OnButtonClickDown )
		self.m_button_remove.Bind( wx.EVT_BUTTON, self.OnButtonClickRemove )
		self.m_button_apply.Bind( wx.EVT_BUTTON, self.OnButtonClickApply )
		self.m_button_close.Bind( wx.EVT_BUTTON, self.OnButtonClickClose )
	
	def __del__( self ):
		pass
	
	
	# Virtual event handlers, overide them in your derived class
	def OnCheckBoxStart( self, event ):
		event.Skip()
	
	def OnButtonClickAdd( self, event ):
		event.Skip()
	
	def OnLeftDownListCtrlSelected( self, event ):
		event.Skip()
	
	def OnButtonClickUp( self, event ):
		event.Skip()
	
	def OnButtonClickDown( self, event ):
		event.Skip()
	
	def OnButtonClickRemove( self, event ):
		event.Skip()
	
	def OnButtonClickApply( self, event ):
		event.Skip()
	
	def OnButtonClickClose( self, event ):
		event.Skip()
	

