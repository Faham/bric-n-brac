#!/usr/bin/env python

#===============================================================================

import wx
from lib.tools import file

#===============================================================================

class Icon(wx.TaskBarIcon):

#-------------------------------------------------------------------------------

	def __init__(self, menu):

		wx.TaskBarIcon.__init__(self)

		# menu options
		self.menu = menu

		# event handlers
		self.Bind(wx.EVT_TASKBAR_LEFT_DOWN, self.click)
		self.Bind(wx.EVT_TASKBAR_RIGHT_DOWN, self.click)
		self.Bind(wx.EVT_MENU, self.select)

		# icon state
		self.states = {
			"on": wx.Icon(file("../resources/sync_started.png", "p"), wx.BITMAP_TYPE_PNG),
			"off": wx.Icon(file("../resources/sync_stopped.png", "p"), wx.BITMAP_TYPE_PNG)
		}
		self.setStatus("off")

#-------------------------------------------------------------------------------

	def click(self, event):
		#shows the menu

		menu = wx.Menu()
		for id, item in enumerate(self.menu):
			menu.Append(id, item[0])
		self.PopupMenu(menu)

#-------------------------------------------------------------------------------

	def select(self, event):
		#handles menu item selection

		self.menu[event.GetId()][1]()

#-------------------------------------------------------------------------------

	def setStatus(self, which):
		#sets the icon status

		self.SetIcon(self.states[which])

#-------------------------------------------------------------------------------

	def close(self):
		#destroys the icon

		self.Destroy()

#===============================================================================
