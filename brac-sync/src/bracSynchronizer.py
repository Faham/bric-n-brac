#!/usr/bin/env python

#===============================================================================

import wx
from icon import Icon
from popup import Popup
from threading import Thread
from frameSettings import FrameSettings

#===============================================================================

class BracSynchronizer(wx.App):

#-------------------------------------------------------------------------------

	def __init__(self):

		wx.App.__init__(self, redirect=0)

		# menu handlers
		menu = [
			("Start/Stop", self.start),
			("Settings", self.settings),
			("Exit", self.exit),
		]

		# main objects
		self.icon = Icon(menu)
		self.popup = Popup()

		# main timer routine
		timer = wx.Timer(self, -1)
		self.Bind(wx.EVT_TIMER, self.main, timer)
		timer.Start(500)
		self.MainLoop()

#-------------------------------------------------------------------------------

	def main(self, event):

		#if not self.popup.opened():
		#	self.popup.show("test")
		#	status = "on"
		status = "off"
		self.icon.setStatus(status)

#-------------------------------------------------------------------------------

	def start(self):
		print "again"

#-------------------------------------------------------------------------------

	def settings(self):
		settings_dlg = FrameSettings();
		settings_dlg.Show();

#-------------------------------------------------------------------------------

	def exit(self):

		# close objects and end
		self.icon.close()
		self.Exit()

#-------------------------------------------------------------------------------

bracSynchronizer = BracSynchronizer()

#===============================================================================
