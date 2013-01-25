#!/usr/bin/env python

#===============================================================================

import os, sys, zipfile, logging, shutil, time
import xml.etree.ElementTree as et

from PyQt4 import QtGui, QtCore, uic
from PIL import Image

#===============================================================================

class MouseEvent(QtCore.QObject):

#-------------------------------------------------------------------------------
	
	def __init__(self, parent):
		super(MouseEvent, self).__init__(parent)

#-------------------------------------------------------------------------------
	
	def eventFilter(self, object, event):
		if event.type() == QtCore.QEvent.Enter:
			anim = QtCore.QPropertyAnimation(object.m_hslider_age, "geometry")
			anim.setDuration(500)
			anim.setStartValue(QtCore.QRect(20, 30, 250, 20))
			anim.setEndValue(QtCore.QRect(20, 30, 250, 0))
			anim.start()
			return True
		elif event.type() == QtCore.QEvent.Leave:
			anim = QtCore.QPropertyAnimation(object.m_hslider_age, "geometry")
			anim.setDuration(500)
			anim.setStartValue(QtCore.QRect(20, 30, 250, 0))
			anim.setEndValue(QtCore.QRect(20, 30, 250, 20))
			anim.start()
			return True
			
		return False

#===============================================================================

class MainWindow(QtGui.QMainWindow):

#-------------------------------------------------------------------------------

	def __init__(self, *args):
		apply(QtGui.QMainWindow.__init__, (self,) + args)
		uic.loadUi('brac-browser.ui', self)

		if getattr(sys, 'frozen', False):
			self.homedir = os.path.dirname(sys.executable)
		elif __file__:
			file_path = os.path.dirname(__file__)
			self.homedir = os.path.abspath(os.path.join(file_path, os.path.pardir))
		
		self.actionOpen        .triggered.connect(self.onOpen)
		self.actionPrint       .triggered.connect(self.onPrint)
		self.actionZoomIn      .triggered.connect(self.onZoomIn)
		self.actionZoomOut     .triggered.connect(self.onZoomOut)
		self.actionFitToWindow .triggered.connect(self.onFitToWindow)
		self.actionNormalSize  .triggered.connect(self.onNormalSize)
		self.actionProperties  .triggered.connect(self.onProperties)
		self.actionAbout       .triggered.connect(self.onAbout)
		
		#self.m_age_widget.m_hslider_age = self.m_hslider_age
		#self.m_age_widget.installEventFilter(MouseEvent(self))

		anim = QtCore.QPropertyAnimation(self, "windowOpacity", self);
		anim.setDuration(500)
		anim.setStartValue(0)
		anim.setEndValue(1)
		anim.start()

		#self.m_frame_main.setBackgroundRole(QtGui.QPalette.Dark);
		#self.m_widget_content.setStyleSheet('''
		#	background-image: url(../resources/transparent_checkerboard_square_125.png);
		#	background-repeat: repeat-xy;
		#	background-position: center center;
		#''');

		self.scroll  = {
			'scrolling': False,
			'start': None,
			'offset': None,	
		}
		
		self.openbrac = None
		self.onOpen(None)
	
#-------------------------------------------------------------------------------

	def onBracMousePress(self, event):
		if self.openbrac['scrollable'] and event.buttons() == QtCore.Qt.LeftButton:
			self.openbrac['container'].setCursor(QtGui.QCursor(QtCore.Qt.ClosedHandCursor))

			initial_offset = self.openbrac['position']
			
			self.scroll  = {
				'scrolling': True,
				'start': event.globalPos(),
				'offset': initial_offset,	
			}
	
#-------------------------------------------------------------------------------

	def onBracMouseRelease(self, event):
		if self.scroll['scrolling']:
			self.openbrac['container'].setCursor(QtGui.QCursor(QtCore.Qt.OpenHandCursor))
			self.scroll['scrolling'] = False
	
#-------------------------------------------------------------------------------

	def onBracMouseMove(self, event):
		if self.scroll['scrolling']:
			diff = event.globalPos() - self.scroll['start']
			pos = self.openbrac['position']
			pos = [self.scroll['offset'][0] + diff.x(), self.scroll['offset'][1] + diff.y()]
			self.openbrac['position'] = pos
			geo = self.openbrac['container'].geometry()
			self.openbrac['container'].setGeometry(pos[0], pos[1], geo.width(), geo.height())
	
#-------------------------------------------------------------------------------

	def onBracMouseWheel(self, event):
		degrees = event.delta() / 8;
		steps = degrees / 15;
		self.zoom(steps)
	
#-------------------------------------------------------------------------------

	def checkScrollability(self, brac):
		geo = brac['container'].geometry()
		if geo.width() * geo.height() > self.m_frame_main.width() * self.m_frame_main.height():
			brac['scrollable'] = True
			brac['container'].setCursor(QtGui.QCursor(QtCore.Qt.OpenHandCursor))
		else:
			brac['scrollable'] = False
			brac['container'].setCursor(QtGui.QCursor(QtCore.Qt.OpenHandCursor))
		brac['scrollable'] = True
	
#-------------------------------------------------------------------------------

	def zoomstep(self, factor):
		ratio = 1.3
		scale = factor * ratio if factor > 0 else - factor / ratio
		self.zoom(scale)
	
#-------------------------------------------------------------------------------

	def zoom(self, value):
		scale = self.openbrac['scale'] * value
		
		if   scale > 50.0: scale = 50.0
		elif scale < 0.05: scale = 0.05

		pos = self.openbrac['position']
		res = self.openbrac['resolution']
		pos = [pos[0] * scale, pos[1] * scale]
		res = [res[0] * scale, res[1] * scale]
		self.openbrac['scale']    = scale
		self.openbrac['position'] = pos
		self.openbrac['container'].setGeometry(pos[0], pos[1], res[0], res[1])

		for k in self.openbrac['brics']:
			bric = self.openbrac['brics'][k]
			bscl = scale * bric['scale']
			bpos = bric['position']
			bres = bric['resolution']
			bpos = [bpos[0] * scale, bpos[1] * scale]
			bres = [bres[0] * bscl,  bres[1] * bscl]
			bric['label'].setGeometry(bpos[0], bpos[1], bres[0], bres[1])
			
		self.checkScrollability(self.openbrac)
	
#-------------------------------------------------------------------------------

	def focusInEvent(self, event):
		if self.openbrac and self.openbrac['mtime'] != os.path.getmtime(self.openbrac['path']):
			QMessageBox.question('Message',
				'%s has changed, do you like to reload the file?' % self.current_brac['path'],
				QtGui.QMessageBox.Yes | QtGui.QMessageBox.No,
				QtGui.QMessageBox.Yes)
				
			reloadBrac(self.openbrac['path'])

#-------------------------------------------------------------------------------

	def onClose(self, ev):
		return
	
#-------------------------------------------------------------------------------

	def closeBrac(self):
		if self.openbrac and self.openbrac.get('snapshots', False):
			brics = self.openbrac['brics']
			for key in brics:
				self.openbrac['container'].removeWidget(brics[key]['label'])
		
		self.m_frame_main.removeWidget(self.openbrac['container'])
		
		try:
			if os.path.isdir(self.openbrac['tempdir']):
				shutil.rmtree(self.openbrac['tempdir'])
		except Exception, ex:
			logging.error(ex)
			return
			
		self.openbrac = None
	
#-------------------------------------------------------------------------------

	def onOpen(self, ev):
		filename = QtGui.QFileDialog.getOpenFileName(self,
			'Open Brac', '', 'Brac Files (*.brac)');
		
		self.openBrac(str(filename))
		#self.openBrac('D:/faham/tim/bric-a-brac/distro/brac.brac')
	
#-------------------------------------------------------------------------------

	def reloadBrac(path):
		self.closeBrac()
		self.openBrac(path)
	
#-------------------------------------------------------------------------------

	def openBrac(self, path):
		print path
		container = QtGui.QWidget(self.m_frame_main)
		container.mousePressEvent   = self.onBracMousePress
		container.mouseReleaseEvent = self.onBracMouseRelease
		container.mouseMoveEvent    = self.onBracMouseMove
		container.wheelEvent        = self.onBracMouseWheel
		container.setBackgroundRole(QtGui.QPalette.Dark)

		container.setStyleSheet('''
			QWidget {
				background-color: gray;
			}
			
			QLabel {
				font-size: 400px;
				background-color: lightgray;
			}
		''');
		
		newbrac = {
			'path'      : path,
			'mtime'     : os.path.getmtime(path),
			'snapshots' : {},
			'brics'     : {},
			'tempdir'   : os.path.join(self.homedir, 'temp_%s' % time.time()),
			'container' : container,
			'scale'     : 1.0,
			'position'  : [0.0, 0.0],
		}

		zf_brac = zipfile.ZipFile(newbrac['path'], 'r')
		zf_brac.extractall(newbrac['tempdir'])
		zf_brac.close()
		
		bracxml = et.parse(os.path.join(newbrac['tempdir'], 'brac.xml'))
		bracdef = bracxml.getroot()
		res = [int(i) for i in bracdef.attrib['resolution'].split()]
		newbrac['resolution'] = res
		newbrac['container'].setGeometry(0, 0, res[0], res[1])
		
		self.checkScrollability(newbrac)

		for bric in bracdef:
			bricid = bric.attrib['id']
			bricdir = os.path.join(newbrac['tempdir'], 'bric.%s' % bricid)

			if not os.path.isdir(bricdir):
				logging.error('Bric directory %s could not be found!' % bricdir)
				continue

			bricxml = et.parse(os.path.join(bricdir, 'bric.xml'))
			bricdef = bricxml.getroot()
			pos = [float(i) for i in bric.attrib['position'].split()]
			res = [float(i) for i in bric.attrib['resolution'].split()]
			scl = float(bric.attrib['scale'])

			new_lbl = QtGui.QLabel(newbrac['container'])
			#self.new_lbl.clicked.connect(self.lableClicked)
			new_lbl.setGeometry(pos[0], pos[1], res[0] * scl, res[1] * scl)
			new_lbl.show()
			new_lbl.setScaledContents(True)
			
			newbrac['brics'][bricid] = {'label': new_lbl, 'resolution': res, 'position': pos, 'scale': scl}
			
			for snapshot in bricdef:
				d = snapshot.attrib['date']
				rev = snapshot.attrib['revision']
				if not newbrac['snapshots'].get(d, False):
					newbrac['snapshots'][d] = [{'bricid': bricid, 'revision': rev}]
				else:
					newbrac['snapshots'][d].append({'bricid': bricid, 'revision': rev})
					
		self.openbrac = newbrac

		if len(newbrac['snapshots']) > 0:
			self.updateBrac(newbrac['snapshots'].keys()[0])
		else:
			QMessageBox.about(self
				, 'No Snapshot'
				, 'No snapshot could be found in %s' % newbrac['path'])
		
#-------------------------------------------------------------------------------

	def onBracAgeChanged(self, value):
		if value < len(self.openbrac['snapshots'].keys()):
			self.updateBrac(self.openbrac['snapshots'].keys()[value])
		
		#for k in sorted(self.openbrac['snapshots']):
		#	for snp in self.openbrac['snapshots'][k]:
		#		bric = snp[0]
		#		revision = snp[1]
		#		date = k

#-------------------------------------------------------------------------------

	def updateBrac(self, date):
		for b in self.openbrac['snapshots'][date]:
			bric_dir = os.path.join(self.openbrac['tempdir'], 'bric.%s' % b['bricid'])
			img_dir = os.path.join(bric_dir, '%s.png' % b['revision'])
			image_label = self.openbrac['brics'][b['bricid']]['label']
			if not os.path.isfile(img_dir):
				image_label.setStyleSheet('''
					background-image: url('../resources/no-image.gif');
				''');
			else:
				image_label.setPixmap(QtGui.QPixmap(img_dir));

#-------------------------------------------------------------------------------

	def onPrint(self, ev):
		print 'print menu item triggered'

#-------------------------------------------------------------------------------

	def onZoomIn(self, ev):
		self.zoomstep(1)

#-------------------------------------------------------------------------------

	def onZoomOut(self, ev):
		self.zoomstep(-1)

#-------------------------------------------------------------------------------

	def onFitToWindow(self, ev):
		scale = self.openbrac['scale'] * value
		pos = self.openbrac['position']
		res = self.openbrac['resolution']
		pos = [pos[0] * scale, pos[1] * scale]
		res = [res[0] * scale, res[1] * scale]
		self.zoom(-1)

#-------------------------------------------------------------------------------

	def onNormalSize(self, ev):
		print 'normal size menu item triggered'

#-------------------------------------------------------------------------------

	def onProperties(self, ev):
		print 'properties menu item triggered'

#-------------------------------------------------------------------------------

	def onAbout(self, ev):
		print 'open menu item triggered'

#===============================================================================

def main():
	app = QtGui.QApplication(sys.argv)

	win = MainWindow()
	win.show()

	app.connect(app, QtCore.SIGNAL("lastWindowClosed()"), app, QtCore.SLOT("quit()"))
	app.exec_()

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#===============================================================================
