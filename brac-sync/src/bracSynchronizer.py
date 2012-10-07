#!/usr/bin/env python

#===============================================================================

import wx, os, sys, json, time, fnmatch, glob
import datetime as dt
import xml.etree.ElementTree as et
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
			("Synchronize", self.syncBracs),
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
		
		self.syncBracs()
		
		self.MainLoop()
		
#-------------------------------------------------------------------------------

	def loadEntries(self):
		f = open(self.entries_path, 'r')
		self.entries = json.loads(f.read())
		f.close()
		self.updateBracList()
		
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

	def indent(self, elem, level=0):
		i = "\n" + level*"	"
		if len(elem):
			if not elem.text or not elem.text.strip():
				elem.text = i + "	"
			if not elem.tail or not elem.tail.strip():
				elem.tail = i
			for elem in elem:
				self.indent(elem, level+1)
			if not elem.tail or not elem.tail.strip():
				elem.tail = i
		else:
			if level and (not elem.tail or not elem.tail.strip()):
				elem.tail = i

#-------------------------------------------------------------------------------

	def locate(self, pattern, root=os.curdir):
		'''Locate all files matching supplied filename pattern in and below
		supplied root directory.'''
		for path, dirs, files in os.walk(os.path.abspath(root)):
			for filename in fnmatch.filter(files, pattern):
				yield os.path.join(path, filename)

#-------------------------------------------------------------------------------

	def updateBracList(self):
		self.bracList = []
		for e in self.entries:
			if e['type'] == 'dir':
				if e['recursive']:
					bracs = self.locate('*.brac', e['path'])
				elif not e['recursive']:
					bracs = glob.glob(os.path.join(e['path'], '*.brac'))
				for f in bracs:
					if f not in self.bracList:
						self.bracList.append(f)
			elif e['type'] == 'file':
				if e['path'] not in self.bracList:
					self.bracList.append(e['path'])

#-------------------------------------------------------------------------------

	def syncBracs(self):
		for b in self.bracList:
			self.syncBrac(b)

#-------------------------------------------------------------------------------

	def syncBrac(self, path):
		if not os.path.isfile(path): return False

		vars = {
			'tools': os.path.join(self.homedir, 'tools'),
			'bracpath-brac': path,
			'bracname-brac': os.path.split(path)[1],
			'bracname-zip': "%s.zip" %  os.path.split(path)[1],
			'bracpath-zip': "%s.zip" %  path,
			'tempdir': os.path.join(self.homedir, 'temp'),
		}

		os.system('ren "%(bracpath-brac)s" "%(bracname-zip)s"' % vars)
		os.system('cd /d %(tools)s & 7za.exe e -yo"%(tempdir)s" "%(bracpath-zip)s" brac.xml' % vars)

		vars['bracdefpath'] = os.path.join(vars['tempdir'], 'brac.xml')
		bracxml = et.parse(vars['bracdefpath'])
		bracdef = bracxml.getroot()
		resolution = dict(zip(['width', 'height'], bracdef.attrib['resolution'].split()))
		
		for bric in bracdef:
			vars['bricid']      = bric.attrib['id']
			vars['bricdir']     = os.path.join(vars['tempdir'], r'bric.%s' % vars['bricid'])
			revision = str(int(bric.attrib['revision']) + 1)
			vars['bricpath']    = os.path.join(vars['bricdir'], r'%s.png' % revision)
			vars['bricdefpath'] = os.path.join(vars['bricdir'], 'bric.xml')
			
			os.system('cd /d %(tools)s & 7za.exe e -yo"%(bricdir)s" "%(bracpath-zip)s" bric.%(bricid)s/bric.xml' % vars)
			
			bricxml = et.parse(vars['bricdefpath'])
			bricdef = bricxml.getroot()
			
			lasttime = time.strptime(bricdef[len(bricdef) - 1].attrib['date'], '%Y-%m-%d %H:%M:%S')
			dt_lasttime = dt.datetime.fromtimestamp(time.mktime(lasttime))
			interval = dict(zip(['week', 'day', 'hour', 'minute', 'second'], [int(x) for x in bricdef.attrib['timeinterval'].replace('-', ' ').replace(':', ' ').split()]))
			dt_deltatime = dt.timedelta(weeks = interval['week'], days = interval['day'], hours = interval['hour'], minutes = interval['minute'], seconds = interval['second'])
			dt_nexttime = dt_lasttime + dt_deltatime
			dt_curtime = dt.datetime.fromtimestamp(time.time())
			if dt_nexttime > dt_curtime or dt_nexttime == dt_lasttime:
				continue
			
			bricregion = dict(zip(['w', 'h', 'x', 'y'], bricdef.attrib['region'].split()))
			
			vars['bracwidth']  = resolution['width']
			vars['bracheight'] = resolution['height']
			vars['bricurl']    = bricdef.attrib['url']
			vars['bricw']      = bricregion['w']
			vars['brich']      = bricregion['h']
			vars['bricx']      = '%s%s' % ('+' if int(bricregion['x']) > 0 else '-', bricregion['x'])
			vars['bricy']      = '%s%s' % ('+' if int(bricregion['y']) > 0 else '-', bricregion['y'])

			snapshot = et.Element('snapshot', {'revision': revision, 'date': time.strftime('%Y-%m-%d %H:%M:%S')})
			bricdef.append(snapshot)
			self.indent(bricdef)
			bricxml.write(vars['bricdefpath'])
			bric.attrib['revision'] = revision
			
			os.system('cd /d %(tools)s & cutycapt.exe --print-backgrounds=on --javascript=on --plugins=on --js-can-access-clipboard=on --min-width=%(bracwidth)s --min-height=%(bracheight)s --url=%(bricurl)s --out-format=png --out="%(bricpath)s"' % vars)
			os.system('cd /d %(tools)s & convert.exe "%(bricpath)s" -crop %(bricw)sx%(brich)s%(bricx)s%(bricy)s "%(bricpath)s"' % vars)

		self.indent(bracdef)
		bracxml.write(vars['bracdefpath'])
		os.system('cd /d %(tools)s & 7za.exe a "%(bracpath-zip)s" "%(tempdir)s/*"' % vars)
		os.system('rmdir /S/Q "%(tempdir)s"' % vars)
		os.system('ren "%(bracpath-zip)s" "%(bracname-brac)s"' % vars)
		
		return True
	
#-------------------------------------------------------------------------------

bracSynchronizer = BracSynchronizer()

#===============================================================================
