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

		mtimer = wx.Timer(self, -1)
		self.Bind(wx.EVT_TIMER, self.checkIfEntriesModified, mtimer)
		mtimer.Start(10000)

		stimer = wx.Timer(self, -1)
		self.Bind(wx.EVT_TIMER, self.sync, stimer)
		stimer.Start(20000)
				
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

	def checkIfEntriesModified(self, event):
		save = False
		toremove = []
		for e in self.entries:
			if not os.path.exists(e['path']):
				toremove.append(e['path'])
				continue
				
			if os.path.getmtime(e['path']) != e['mtime']:
				self.updateEntryTimeTable(e)
				save = True
		
		#I guess it's better not to remove them
		#I'll leave it up to the user to clean up the entries.
		#if len(toremove) > 0:
		#	self.entries = [x for x in self.entries if x['path'] not in toremove]
		#	save = True
		
		if save:
			self.saveEntries()
	
#-------------------------------------------------------------------------------

	def sync(self, event):
		self.syncBracs()
		self.setStatus("off")

#-------------------------------------------------------------------------------

	def setStatus(self, status, notice = None):
		self.icon.setStatus(status)
		if status == "on" and not self.popup.opened():
			self.popup.show(notice)

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

	def setEntries(self, entries):
		self.entries = entries
		self.updateTimeTable()
		self.syncBracs()

#-------------------------------------------------------------------------------

	def updateTimeTable(self):
		for e in self.entries:
			self.updateEntryTimeTable(e)
		self.saveEntries()

#-------------------------------------------------------------------------------

	def updateEntryTimeTable(self, entry):
		bracList = []
		if entry['type'] == 'dir':
			if entry['recursive']:
				bracs = self.locate('*.brac', entry['path'])
			elif not entry['recursive']:
				bracs = glob.glob(os.path.join(entry['path'], '*.brac'))
			for f in bracs:
				if f not in bracList:
					bracList.append(f)
		elif entry['type'] == 'file':
			if entry['path'][-4:].lower() == 'brac' and entry['path'] not in bracList:
				bracList.append(entry['path'])
		
		entry['bracList'] = []
		for b in bracList:
			timetbl = self.getBracTimeTable(b)
			entry['bracList'].append({
				'path': b,
				'mtime': os.path.getmtime(b),
				'timetable': timetbl,
			})
		
		entry['mtime'] = os.path.getmtime(entry['path'])

#-------------------------------------------------------------------------------

	def needUpdate(self, timeinterval, lastupdate):
		lastupdate = time.strptime(lastupdate, '%Y-%m-%d %H:%M:%S')
		dt_lastupdate = dt.datetime.fromtimestamp(time.mktime(lastupdate))
		interval = dict(zip(['week', 'day', 'hour', 'minute', 'second'], [int(x) for x in timeinterval.replace('-', ' ').replace(':', ' ').split()]))
		dt_deltatime = dt.timedelta(weeks = interval['week'], days = interval['day'], hours = interval['hour'], minutes = interval['minute'], seconds = interval['second'])
		dt_nexttime = dt_lastupdate + dt_deltatime
		dt_curtime = dt.datetime.fromtimestamp(time.time())
		if dt_nexttime > dt_curtime or dt_nexttime == dt_lastupdate:
			return False
		return True

#-------------------------------------------------------------------------------

	def syncBracs(self):
		for e in self.entries:
			if not e.get('bracList', False):
				continue
			
			toremove = []
			for b in e['bracList']:
				if not os.path.isfile(b['path']):
					toremove.append(b['path'])
					continue
				
				if os.path.getmtime(b['path']) != b['mtime']:
					b['timetable'] = self.getBracTimeTable(b['path'])
					b['mtime'] = os.path.getmtime(b['path'])
				
				needupdate = False
				for bric in b['timetable']:
					if self.needUpdate(bric['timeinterval'], bric['lastupdate']):
						needupdate = True
						break
				
				if needupdate:
					self.setStatus("on", "Synchronizing!\n%s" % b['path'])
					self.syncBrac(b['path'])
					b['timetable'] = self.getBracTimeTable(b['path'])
					b['mtime'] = os.path.getmtime(b['path'])
			
			if len(toremove) > 0:
				e['bracList'] = [x for x in e['bracList'] if x['path'] not in toremove]
			
		self.saveEntries()

#-------------------------------------------------------------------------------

	def getBracTimeTable(self, path):
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
		
		timetbl = []
		for bric in bracdef:
			id = bric.attrib['id']
			timeinterval = bric.attrib['timeinterval']
			lastupdate = bric.attrib['lastupdate']
			timetbl.append({'id': id, 'timeinterval': timeinterval, 'lastupdate': lastupdate})

		os.system('rmdir /S/Q "%(tempdir)s"' % vars)
		os.system('ren "%(bracpath-zip)s" "%(bracname-brac)s"' % vars)
		
		return timetbl
		
#-------------------------------------------------------------------------------

	def syncBrac(self, path):
		if not os.path.isfile(path): return False

		vars = {
			'tools': os.path.join(self.homedir, 'tools'),
			'bracpath-brac': path,
			'bracname-brac': os.path.split(path)[1],
			'bracname-zip': "%s.%s.zip" % (os.path.split(path)[1], time.time()),
			'bracpath-zip': "%s.%s.zip" % (path, time.time()),
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
			
			if not self.needUpdate(bric.attrib['timeinterval'], bricdef[len(bricdef) - 1].attrib['date']):
				continue
			
			bricregion = dict(zip(['w', 'h', 'x', 'y'], bricdef.attrib['region'].split()))
			
			vars['bracwidth']  = resolution['width']
			vars['bracheight'] = resolution['height']
			vars['bricurl']    = bricdef.attrib['url']
			vars['bricw']      = bricregion['w']
			vars['brich']      = bricregion['h']
			vars['bricx']      = '%s%s' % ('+' if int(bricregion['x']) > 0 else '-', bricregion['x'])
			vars['bricy']      = '%s%s' % ('+' if int(bricregion['y']) > 0 else '-', bricregion['y'])

			snapshot_time = time.strftime('%Y-%m-%d %H:%M:%S')
			snapshot = et.Element('snapshot', {'revision': revision, 'date': snapshot_time})
			bricdef.append(snapshot)
			self.indent(bricdef)
			bricxml.write(vars['bricdefpath'])
			bric.attrib['revision'] = revision
			bric.attrib['lastupdate'] = snapshot_time
			
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
