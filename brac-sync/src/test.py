
#-------------------------------------------------------------------------------

from PyQt4 import QtGui, QtCore, uic
import sys, logging, os, traceback
from webkitrenderer import WebkitRenderer
from PyQt4.QtWebKit import QWebPage

#-------------------------------------------------------------------------------

class WebCapture(QtGui.QWidget):

	def capture(self, params):
		print 'capturing url'
		self.renderer.render(
			params['url'],
			params['filepath'],
			params['window_width'],
			params['window_height'],
			params['region_left'],
			params['region_top'],
			params['region_width'],
			params['region_height'],
			params['timeout'])
		print 'image file generated'
		sys.exit(0)

	def __init__(self, params, parent=None):
		QtGui.QWidget.__init__(self, parent)
		self.renderer = WebkitRenderer()
		self.capture(params)

#===============================================================================

def main():
	try:
		app = QtGui.QApplication(sys.argv)
		print 'syntax: url, filepath, window_width, window_height, region_left, region_top, region_width, region_height, timeout'

		params = {
			'url'          : sys.argv[1], 
			'filepath'     : sys.argv[2], 
			'window_width' : int(sys.argv[3]), 
			'window_height': int(sys.argv[4]), 
			'region_left'  : int(sys.argv[5]), 
			'region_top'   : int(sys.argv[6]), 
			'region_width' : int(sys.argv[7]), 
			'region_height': int(sys.argv[8]), 
			'timeout'      : int(sys.argv[9]), 
		}
		wc = WebCapture(params)
		sys.exit(app.exec_())
	except Exception:
		traceback.print_exc(file=sys.stdout)

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#-------------------------------------------------------------------------------
