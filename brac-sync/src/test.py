
#-------------------------------------------------------------------------------

from PyQt4 import QtGui, QtCore, uic
import sys, logging
import captureurl

#-------------------------------------------------------------------------------

class BracSynchronizer(QtGui.QWidget):

	def capture(self):
		print 'capturing url'
		captureurl.capture('https://www.google.ca/search?q=game&hl=en&tbo=d&source=lnms&tbm=isch&sa=X&ei=1ycCUf3cE4PAyAHI2oCIDg&ved=0CAcQ_AUoAA&biw=1439&bih=802',
			'test.png', None)

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
