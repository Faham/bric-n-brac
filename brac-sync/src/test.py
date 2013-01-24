
#-------------------------------------------------------------------------------

from PyQt4 import QtGui, QtCore, uic
import sys, logging
import captureurl

#-------------------------------------------------------------------------------

class BracSynchronizer(QtGui.QWidget):

	def capture(self):
		print 'capturing url'
		captureurl.capture('http://www.google.com', 'D:/faham/tim/bric-a-brac/distro/test.png', None)

	def __init__(self, parent=None):
		QtGui.QWidget.__init__(self, parent)
		mtimer = QtCore.QTimer(self)
		mtimer.timeout.connect(self.capture)
		mtimer.start(2000)

#===============================================================================

def main():
	app = QtGui.QApplication(sys.argv)

	trayIcon = BracSynchronizer()

	trayIcon.show()
	sys.exit(app.exec_())

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#-------------------------------------------------------------------------------
