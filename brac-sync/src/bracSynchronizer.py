#!/usr/bin/env python

#===============================================================================

import wx, os, sys, json
from icon import Icon
from popup import Popup
from threading import Thread
from frameSettings import FrameSettings
from bracList import BracList

#===============================================================================

class BracSynchronizer(wx.App):

#-------------------------------------------------------------------------------

	def __init__(self):
		wx.App.__init__(self, redirect = 0)
		
		if getattr(sys, 'frozen', False):
			self.homedir = os.path.dirname(sys.executable)
		elif __file__:
			file_path = os.path.dirname(__file__)
			self.homedir = os.path.abspath(os.path.join(file_path, os.path.pardir))

		# menu handlers
		menu = [
			("Start/Stop", self.start),
			("Settings", self.settings),
			("Exit", self.exit),
		]

		# main objects
		self.icon = Icon(menu, self)
		self.popup = Popup()

		p = os.path.join(os.environ['APPDATA'], 'uofs/bric-a-brac')
		if not os.path.exists(p): os.makedirs(p)
		self.entries_path = os.path.join(p, 'bracList.json')
		self.loadEntries()

		# main timer routine
		timer = wx.Timer(self, -1)
		self.Bind(wx.EVT_TIMER, self.main, timer)
		timer.Start(500)
		
		self.updateBrac(r'D:\faham\tim\bric-a-brac\distro\brac.zip')

		self.MainLoop()
		
#-------------------------------------------------------------------------------

	def loadEntries(self):
		f = open(self.entries_path, 'r')
		self.entries = json.loads(f.read())
		f.close()
		
#-------------------------------------------------------------------------------

	def saveEntries(self):
		out_str = json.dumps(self.entries, sort_keys = True, indent = 2)
		f = open(self.entries_path, 'w')
		f.write(out_str)
		f.close()
	
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
		settings_dlg = FrameSettings(self);
		settings_dlg.Show();

#-------------------------------------------------------------------------------

	def exit(self):
		self.icon.close()
		self.Exit()

#-------------------------------------------------------------------------------

	def updateBrac(self, path):
		if not os.path.isfile(path): return False

		import pdb; pdb.set_trace()
		
		vars1 = {
			'tools': os.path.join(self.homedir, 'tools'),
			'brac_path': path,
			'out': os.path.join(self.homedir, 'temp'),
		}
		os.system('cd /d %(tools)s & 7za.exe e -yo"%(out)s" "%(brac_path)s" brac.xml' % vars1)
		
		for bric in range(1):
			bric_id = 1;
			bric_revision = 1;
			
			vars2 = {
				'tools': vars1['tools'],
				'width': 1024,
				'height': 768,
				'url': 'http://www.google.com',
				'out': os.path.join(self.homedir, r'temp\bric.%s\%s.png' % (bric_id, bric_revision)),
			}
			os.system('cd /d %(tools)s & cutycapt.exe --print-backgrounds=on --javascript=on --plugins=on --js-can-access-clipboard=on --min-width=%(width)s --min-height=%(height)s --url=%(url)s --out-format=png --out="%(out)s"' % vars2)

			vars3 = {
				'tools': vars1['tools'],
				'bric': vars2['out'],
				'w': 10,
				'h': 20,
				'x': '+10',
				'y': '-10',
			}
			os.system('cd /d %(tools)s & convert.exe "%(bric)s" -crop %(w)sx%(h)s%(x)s%(y)s "%(bric)s"' % vars3);
			
			vars4 = {
				'7z': vars1['7z'],
				'brac_path': path,
				'new_bric_dir': os.path.dirname(vars2['out']),
			}
			os.system('%(7z)s a "%(brac_path)s" "%(new_bric_dir)s"' % vars4)

		return True
	
#-------------------------------------------------------------------------------

bracSynchronizer = BracSynchronizer()

#===============================================================================
