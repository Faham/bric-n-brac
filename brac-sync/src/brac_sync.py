#!/usr/bin/env python

#===============================================================================

import os, sys, json, time
import shutil, glob, zipfile, tempfile
import datetime as dt
import xml.etree.ElementTree as et
import entryutils
import common
import captureurl

from threading       import Thread
from dialog_settings import DialogSettings
from PyQt4           import QtGui, QtCore, uic

#===============================================================================

class BracSynchronizer(QtGui.QSystemTrayIcon):

#-------------------------------------------------------------------------------

	def __init__(self, icon, parent=None):
		QtGui.QSystemTrayIcon.__init__(self, icon, parent)
		
		self.trayMenu = QtGui.QMenu(parent)

		self.actionStartStop   = self.trayMenu.addAction("Start/Stop")
		self.actionSynchronize = self.trayMenu.addAction("Synchronize")
		self.actionSettings    = self.trayMenu.addAction("Settings")
		self.actionExit        = self.trayMenu.addAction("Exit")

		self.actionStartStop  .triggered.connect(self.start)
		self.actionSynchronize.triggered.connect(self.syncBracs)
		self.actionSettings   .triggered.connect(self.settings)
		self.actionExit       .triggered.connect(self.exit)
		
		self.setContextMenu(self.trayMenu)
		
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

		if not os.path.exists(p): os.makedirs(p)
		self.entries_path = os.path.join(p, 'bracList.json')

		self.loadEntries()
		
		mtimer = QtCore.QTimer(self)
		mtimer.timeout.connect(self.checkIfEntriesModified)
		mtimer.start(10000)
		
		stimer = QtCore.QTimer(self)
		stimer.timeout.connect(self.sync)
		stimer.start(20000)

#-------------------------------------------------------------------------------

	def loadEntries(self):
		self.entries = []

		try:
			with open(self.entries_path, 'r') as f:
				self.entries = json.loads(f.read())
				f.close()
		except ValueError as e:
			pass
		except IOError as e:
			f = open(self.entries_path, 'w')
			f.close()
		
#-------------------------------------------------------------------------------

	def saveEntries(self):
		out_str = json.dumps(self.entries, sort_keys = True, indent = 2)
		f = open(self.entries_path, 'w')
		f.write(out_str)
		f.close()
	
#-------------------------------------------------------------------------------

	def checkIfEntriesModified(self):
		print '%s -> %s' % (common.function(1), common.function(0))

		save = False
		toremove = []
		for e in self.entries:
			if not os.path.exists(e['path']) \
				or (e['type'] == 'dir' and not os.path.isdir(e['path'])) \
				or (e['type'] == 'file' and not os.path.isfile(e['path'])):
				toremove.append(e['path'])
				continue
				
			do_update = False

			if os.path.getmtime(e['path']) != e['mtime']:
				do_update = True
			elif e['type'] == 'dir':
			
				for b in e['bracList']:
					if not os.path.isfile(b['path']) or os.path.getmtime(b['path']) != b['mtime']:
						do_update = True
						break
					
				if not do_update and e.has_key('subdirs'):
					for sd in e['subdirs']:
						if not os.path.isdir(sd):
							do_update = True
							break
						elif os.path.getmtime(sd) != e['subdirs'][sd]:
							do_update = True
							break
						
			if do_update:
				entryutils.updateEntryTimeTable(e)
				save = True
				break
		
		#I guess it's better not to remove them
		#I'll leave it up to the user to clean up the entries.
		#if len(toremove) > 0:
		#	self.entries = [x for x in self.entries if x['path'] not in toremove]
		#	save = True
		
		if save:
			self.saveEntries()
	
#-------------------------------------------------------------------------------

	def sync(self):
		print '%s -> %s' % (common.function(1), common.function(0))

		self.syncBracs()
		self.setStatus('off')

#-------------------------------------------------------------------------------

	def setStatus(self, status, notice = None):
		#self.icon.setStatus(status)
		if status == "off":
			self.setIcon(QtGui.QIcon("../resources/brac-syncing-16x16.png"))
		elif status == "on":
			self.setIcon(QtGui.QIcon("../resources/brac-16x16.png"))
		#if status == "on" and not self.popup.opened():
		#	self.popup.show(notice)

#-------------------------------------------------------------------------------

	def start(self):
		print "again"

#-------------------------------------------------------------------------------

	def settings(self):
		settings_dlg = DialogSettings(self);
		settings_dlg.exec_();

#-------------------------------------------------------------------------------

	def exit(self):
		QtCore.QCoreApplication.instance().quit()

#-------------------------------------------------------------------------------

	def setEntries(self, entries):
		self.entries = entries
		self.saveEntries()
		self.syncBracs()

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
		print '%s -> %s' % (common.function(1), common.function(0))
		
		for e in self.entries:
			if not e.get('bracList', False):
				continue
			
			toremove = []
			for b in e['bracList']:
				if not os.path.isfile(b['path']):
					toremove.append(b['path'])
					continue
				
				if os.path.getmtime(b['path']) != b['mtime']:
					b['timetable'] = entryutils.getBracTimeTable(b['path'])
					b['mtime'] = os.path.getmtime(b['path'])
				
				needupdate = False
				for bric in b['timetable']:
					if self.needUpdate(bric['timeinterval'], bric['lastupdate']):
						needupdate = True
						break
				
				if needupdate:
					self.setStatus('on', 'Synchronizing!\n%s' % b['path'])
					self.syncBrac(b['path'])
					b['timetable'] = entryutils.getBracTimeTable(b['path'])
					b['mtime'] = os.path.getmtime(b['path'])
			
			if needupdate:
				e['mtime'] = os.path.getmtime(e['path'])
			
			if len(toremove) > 0:
				e['bracList'] = [x for x in e['bracList'] if x['path'] not in toremove]
			
		self.saveEntries()
		
#-------------------------------------------------------------------------------

	def syncBrac(self, path):

		if not os.path.isfile(path): return False

		tempdir = tempfile.mkdtemp()

		if not os.path.isdir(tempdir):
			print 'tempdir %s does not exists' % tempdir

		zf_brac = zipfile.ZipFile(path, 'a')
		zf_brac.extract('brac.xml', tempdir)
		bracxml = et.parse(os.path.join(tempdir, 'brac.xml'))
		bracdef = bracxml.getroot()
		
		resolution = dict(zip(['width', 'height'], bracdef.attrib['resolution'].split()))
		
		vars = {
			'tools': os.path.join(self.homedir, 'tools'),
			'bracpath-brac': path,
			'bracname-brac': os.path.split(path)[1],
			'bracname-zip': "%s.%s.zip" % (os.path.split(path)[1], time.time()),
			'bracpath-zip': "%s.%s.zip" % (path, time.time()),
			'tempdir': tempdir,
		}

		for bric in bracdef:
			revision = str(int(bric.attrib['revision']) + 1)
			
			vars['bricid']      = bric.attrib['id']
			vars['bricdir']     = os.path.join(vars['tempdir'], r'bric.%s' % vars['bricid'])
			vars['bricpath']    = os.path.join(vars['bricdir'], r'%s.png' % revision)
			vars['bricdefpath'] = os.path.join(vars['bricdir'], 'bric.xml')
			
			bricid = bric.attrib['id']

			newbricdir = os.path.join(tempdir, r'bric.%s' % bricid)
			zf_brac.extract(r'bric.%s/bric.xml' % bricid, tempdir)
			bricxml = et.parse(os.path.join(newbricdir, 'bric.xml'))
			bricdef = bricxml.getroot()
			
			if not self.needUpdate(bric.attrib['timeinterval'], bricdef[len(bricdef) - 1].attrib['date']):
				continue
			
			snapshot_time = time.strftime('%Y-%m-%d %H:%M:%S')
			snapshot = et.Element('snapshot', {'revision': revision, 'date': snapshot_time})
			bricdef.append(snapshot)
			common.indent(bricdef)
			bricxml.write(os.path.join(newbricdir, 'bric.xml'))
			
			bric.attrib['revision'] = revision
			bric.attrib['lastupdate'] = snapshot_time
			
			
			bricregion = dict(zip(['x', 'y', 'w', 'h'], bricdef.attrib['region'].split()))
			
			vars['bracwidth']  = resolution['width']
			vars['bracheight'] = resolution['height']
			vars['bricurl']    = bricdef.attrib['url']
			vars['bricw']      = bricregion['w']
			vars['brich']      = bricregion['h']
			vars['bricx']      = '%s%s' % ('+' if int(bricregion['x']) > 0 else '-', bricregion['x'])
			vars['bricy']      = '%s%s' % ('+' if int(bricregion['y']) > 0 else '-', bricregion['y'])
			
			params = {
				'width' : int(resolution['width']),
				'height': int(resolution['height']),
			}
			
			if common.getos() == 'win':
				#os.system('cd /d %(tools)s & cutycapt.exe --print-backgrounds=on --javascript=on --plugins=on --js-can-access-clipboard=on --min-width=%(bracwidth)s --min-height=%(bracheight)s --url="%(bricurl)s" --out-format=png --out="%(bricpath)s"' % vars)
				captureurl.capture(vars['bricurl'], vars['bricpath'], params)
				os.system('cd /d %(tools)s & convert.exe "%(bricpath)s" -crop %(bricw)sx%(brich)s%(bricx)s%(bricy)s "%(bricpath)s"' % vars)
			if common.getos() == 'mac':
				os.system('cd %(tools)s ; python2.6 ./webkit2png --fullsize --width=%(bracwidth)s --height=%(bracheight)s --dir=%(bricdir)s --filename=temp "%(bricurl)s"' % vars);
				os.system('mv %(bricdir)s/temp-full.png %(bricpath)s' % vars);
				os.system('cd %(tools)s ; ./convert "%(bricpath)s" -crop %(bricw)sx%(brich)s%(bricx)s%(bricy)s "%(bricpath)s"' % vars)

		common.indent(bracdef)
		bracxml.write(os.path.join(tempdir, 'brac.xml'))
		zf_brac.close()

		if common.getos() == 'win':
			os.system('ren "%(bracpath-brac)s" "%(bracname-zip)s"' % vars)
			os.system('cd /d %(tools)s & 7za.exe a "%(bracpath-zip)s" "%(tempdir)s/*"' % vars)
			os.system('ren "%(bracpath-zip)s" "%(bracname-brac)s"' % vars)
		if common.getos() == 'mac':
			os.system('mv "%(bracpath-brac)s" "%(bracpath-zip)s"' % vars)
			os.system('cd %(tools)s ; ./7za a "%(bracpath-zip)s" "%(tempdir)s/*"' % vars)
			os.system('mv "%(bracpath-zip)s" "%(bracpath-brac)s"' % vars)
			
		shutil.rmtree(tempdir)

		print 'sync done'
		
		return True
	
#===============================================================================

def main():
	app = QtGui.QApplication(sys.argv)

	w = QtGui.QWidget()
	trayIcon = BracSynchronizer(QtGui.QIcon("../resources/brac-16x16.png"), w)

	trayIcon.show()
	sys.exit(app.exec_())

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#===============================================================================
