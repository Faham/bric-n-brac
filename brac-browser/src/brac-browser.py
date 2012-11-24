#!/usr/bin/env python

#===============================================================================

import os, sys
import xml.etree.ElementTree as et
from PyQt4 import QtGui, QtCore, uic
from PIL import Image
import zipfile
import logging
import shutil

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
		self.actionAbout       .triggered.connect(self.onAbout)
		
		#self.m_age_widget.m_hslider_age = self.m_hslider_age
		#self.m_age_widget.installEventFilter(MouseEvent(self))

		anim = QtCore.QPropertyAnimation(self, "windowOpacity", self);
		anim.setDuration(500)
		anim.setStartValue(0)
		anim.setEndValue(1)
		anim.start()
		
		self.onOpen(None)
	
#-------------------------------------------------------------------------------

	def onOpen(self, ev):
		path = 'D:\\faham\\tim\\bric-a-brac\\distro\\brac.brac'
		tempdir = os.path.join(self.homedir, 'temp')

		try:
			if os.path.isdir(tempdir):
				shutil.rmtree(tempdir)
		except Exception, ex:
			logging.error(ex)
			return

		zf_brac = zipfile.ZipFile(path, 'r')
		zf_brac.extractall(tempdir)
		zf_brac.close()

		brics = [b for b in os.listdir(tempdir) if os.path.isdir(os.path.join(tempdir, b)) and b[:4] == 'bric']
		self.snapshots = {}

		bracxml = et.parse(os.path.join(tempdir, 'brac.xml'))
		bracdef = bracxml.getroot()
		res = [int(i) for i in bracdef.attrib['resolution'].split()]
		self.image = Image.new('RGBA', res)
		
		scroll_area = self.scrollAreaWidgetContents
		scroll_area.setStyleSheet('''
			QLabel {
				font-size: 400px;
				color: blue;
				background-image: url('../resources/background.jpg');
			}
		''');

		for b in brics:
			bricdir = os.path.join(tempdir, b)
			bricxml = et.parse(os.path.join(bricdir, 'bric.xml'))
			bricdef = bricxml.getroot()
			r = dict(zip(['x', 'y', 'w', 'h'], [int(i) for i in bricdef.attrib['region'].split()]))
			region = (r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h'])

			new_lbl = QtGui.QLabel(scroll_area)
			#self.new_lbl.clicked.connect(self.lableClicked)
			new_lbl.setGeometry(r['x'], r['y'], r['w'], r['h'])
			new_lbl.show()

			for snapshot in bricdef:
				d = snapshot.attrib['date']
				rev = snapshot.attrib['revision']
				if not self.snapshots.get(d, False):
					self.snapshots[d] = [{'brac': b, 'revision': rev, 'region': region, 'label': new_lbl}]
				else:
					self.snapshots[d].append({'brac': b, 'revision': rev, 'region': region, 'label': new_lbl})

		if len(self.snapshots) > 0:
			self.updateBrac(self.snapshots.keys()[0])

#-------------------------------------------------------------------------------

	def onBracAgeChanged(self, value):
		if value < len(self.snapshots.keys()):
			self.updateBrac(self.snapshots.keys()[value])
		
		#for k in sorted(self.snapshots):
		#	for snp in self.snapshots[k]:
		#		bric = snp[0]
		#		revision = snp[1]
		#		date = k

#-------------------------------------------------------------------------------

	def updateBrac(self, date):
		tempdir = os.path.join(self.homedir, 'temp')

		for b in self.snapshots[date]:
			bric_dir = os.path.join(tempdir, b['brac'])
			img_dir = os.path.join(bric_dir, '%s.png' % b['revision'])
			
			if not os.path.isfile(img_dir):
				b['label'].setStyleSheet('''
					background-image: url('../resources/no-image.gif');
				''');
			else:
				b['label'].setPixmap(QtGui.QPixmap(img_dir));

#-------------------------------------------------------------------------------

	def onPrint(self, ev):
		print 'print menu item triggered'

#-------------------------------------------------------------------------------

	def onZoomIn(self, ev):
		print 'zoom in menu item triggered'

#-------------------------------------------------------------------------------

	def onZoomOut(self, ev):
		print 'zoom out menu item triggered'

#-------------------------------------------------------------------------------

	def onFitToWindow(self, ev):
		print 'fit to window menu item triggered'

#-------------------------------------------------------------------------------

	def onNormalSize(self, ev):
		print 'normal size menu item triggered'

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
