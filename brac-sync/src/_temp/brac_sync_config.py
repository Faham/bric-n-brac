#!/usr/bin/env python

#===============================================================================

import wx, os, sys, json
import xml.etree.ElementTree as et
import common

from frame_settings import FrameSettings

#===============================================================================

class BracSyncConfig(wx.App):

#-------------------------------------------------------------------------------

	def __init__(self):
		wx.App.__init__(self, redirect = 0)
		
		if getattr(sys, 'frozen', False):
			self.homedir = os.path.dirname(sys.executable)
		elif __file__:
			file_path = os.path.dirname(__file__)
			self.homedir = os.path.abspath(os.path.join(file_path, os.path.pardir))

		if common.getos() == 'win':
			p = os.path.join(os.environ['APPDATA'], 'uofs/bric-a-brac')
		elif common.getos() == 'mac':
			p = os.path.join('/Users', os.environ['USER'])
			p = os.path.join(p, 'Library/Application Support')
			p = os.path.join(p, 'uofs/bric-a-brac')
			
		if not os.path.exists(p):
			os.makedirs(p)
			
		self.entries_path = os.path.join(p, 'bracList.json')
		self.loadEntries()
		
		settings_dlg = FrameSettings(self);
		settings_dlg.Show();
		
		self.MainLoop()
		
#-------------------------------------------------------------------------------

	def loadEntries(self):
		self.entries = []

		try:
			with open(self.entries_path, 'r') as f:
				self.entries = json.loads(f.read())
				f.close()
		except IOError as e:
			f = open(self.entries_path, 'w')
			f.close()

#-------------------------------------------------------------------------------

	def setEntries(self, entries):
		self.entries = entries
		self.saveEntries()

#-------------------------------------------------------------------------------

	def saveEntries(self):
		out_str = json.dumps(self.entries, sort_keys = True, indent = 2)
		f = open(self.entries_path, 'w')
		f.write(out_str)
		f.close()
	
#-------------------------------------------------------------------------------

bracSyncConfig = BracSyncConfig()

#===============================================================================
