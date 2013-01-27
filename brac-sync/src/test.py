
#-------------------------------------------------------------------------------

from PyQt4 import QtGui, QtCore, uic
import sys, logging
from webkitrenderer import WebkitRenderer
from PyQt4.QtWebKit import QWebPage

#-------------------------------------------------------------------------------

class BracSynchronizer(QtGui.QWidget):

	def capture(self):
		print 'capturing url'
		
		#url = 'https://www.google.ca/search?q=game&hl=en&tbo=d&source=lnms&tbm=isch&sa=X&ei=1ycCUf3cE4PAyAHI2oCIDg&ved=0CAcQ_AUoAA&biw=1439&bih=802'
		#url = 'http://www.google.ca/search?q=benjamin+franklin&rlz=1C1LENN_enCA520CA520&aq=f&oq=benjamin+franklin&sourceid=chrome&ie=UTF-8'
		#url = 'http://www.youtube.com/'
			
		image = self.renderer.render(url, 0, 4000, 1366, 768, 60)
		image.save('test.png', 'png')

	def __init__(self, parent=None):
		QtGui.QWidget.__init__(self, parent)
		
		#mtimer = QtCore.QTimer(self)
		#mtimer.timeout.connect(self.capture)
		#mtimer.start(2000)
		
		self.renderer = WebkitRenderer()
		self.capture()
		sys.exit()

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
