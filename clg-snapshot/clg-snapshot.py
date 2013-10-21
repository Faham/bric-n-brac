#!/usr/bin/env python2.7

#===============================================================================

import sys
import logging
import time

logger = logging.getLogger('WebKitRenderer')

from PyQt4 import QtGui
from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import QWebPage

#===============================================================================

_useragent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) Qt/4.8.4 Chrome/534.34'

#===============================================================================

class UserAgentWebPage(QWebPage):
    def userAgentForUrl(self, url):
		#default is made like:
		#"Mozilla/5.0 (%Platform%%Security%%Subplatform%) AppleWebKit/%WebKitVersion% (KHTML, like Gecko) %AppVersion Safari/%WebKitVersion%"
		#default populated useragent is:
		#Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) Qt/4.8.4 Safari/534.34
		
		#return 'Mozilla/5.0 (X11; Linux x86_64; rv:7.0.1) Gecko/20100101 Firefox/7.0.1'
		#return 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) Qt/4.8.4 Chrome/534.34'
		global _useragent
		return _useragent

#-------------------------------------------------------------------------------

class WebkitRenderer(QObject):

#-------------------------------------------------------------------------------

	def __init__(self):
		logger.debug("Initializing class %s", self.__class__.__name__)
		self._page = UserAgentWebPage()
		self.connect(self._page, SIGNAL("loadFinished(bool)"), self.__on_load_finished)
		self.connect(self._page, SIGNAL("loadStarted()"), self.__on_load_started)
		self.connect(self._page.networkAccessManager(), SIGNAL("sslErrors(QNetworkReply *,const QList<QSslError>&)"), self.__on_ssl_errors)

		# Disabling scrollbars
		self._page.mainFrame().setScrollBarPolicy(Qt.Horizontal, Qt.ScrollBarAlwaysOff)
		self._page.mainFrame().setScrollBarPolicy(Qt.Vertical, Qt.ScrollBarAlwaysOff)
		
		# Helper for multithreaded communication through signals 
		self.__loading = False
		self.__loading_result = False
	
#-------------------------------------------------------------------------------

	def render(self, url, filename, width=0, height=0, scrollx=0, scrolly=0, timeout=60, ajaxtimeout=5):
		logger.debug("rendering %s (timeout: %d)", url, timeout)

		# This is an event-based application. So we have to wait until
		# "loadFinished(bool)" raised.
		cancelAt = time.time() + timeout

		#TODO: here you should insert user credentials
		qurl = QUrl(url)
		#qurl.setUserName('username')
		#qurl.setPassword('password')
		
		# Set initial viewport (the size of the "window")
		size = self._page.mainFrame().contentsSize()
		size.setWidth(width)
		size.setHeight(height)
		self._page.setViewportSize(size)
		
		# Start loading
		self._page.mainFrame().load(qurl)
		while self.__loading:
			if timeout > 0 and time.time() >= cancelAt:
				raise RuntimeError("Request timed out")
			QCoreApplication.processEvents()

		logger.debug("Fetching %s..." % url)

		if self.__loading_result == False:
			raise RuntimeError("Failed to load %s" % url)
		else:
			self._page.mainFrame().documentElement().evaluateJavaScript('window.scrollBy(%d, %d);' % (scrollx, scrolly))
			stopAt = time.time() + ajaxtimeout
			while time.time() < stopAt:
				QCoreApplication.processEvents()
			print 'scrolling done'

		# Paint this frame into an image
		img = QImage(self._page.viewportSize(), QImage.Format_ARGB32)
		painter = QPainter(img)
		self._page.mainFrame().render(painter)
		painter.end()
		img.save(filename, 'png')

		#return img

#-------------------------------------------------------------------------------
	
	def applyJS(self):
		#TODO
		#js_code = '''
		#	here you can apply you own js code
		#'''
		#self._page.mainFrame().documentElement().evaluateJavaScript(js_scroll)
		logger.debug('applyJS is not implemented')
	
#-------------------------------------------------------------------------------

	def __on_load_started(self):
		self.__loading = True

#-------------------------------------------------------------------------------

	def __on_load_finished(self, result):
		logger.debug("loading finished with status: %s", result)
		self.__loading = False

		self.applyJS()
		
		self.__loading_result = result

#-------------------------------------------------------------------------------

	def __on_ssl_errors(self, reply, errors):
		logger.warn("ssl error")
		#self.__loading = False
		#self.__loading_result = result
		reply.ignoreSslErrors()

#===============================================================================

class WebCapture(QtGui.QWidget):

	def capture(self, params):
		print 'capturing url'
		self.renderer.render(
			params['url'],
			params['filepath'],
			params['window_width'],
			params['window_height'],
			params['scrollx'],
			params['scrolly'],
			params['timeout']
			)
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

		if len(sys.argv) < 5:
			print 'usage: url filepath window_width window_height [scrollx] [scrolly] [timeout]'
			return
		global _useragent
		params = {
			'url'          : sys.argv[1], 
			'filepath'     : sys.argv[2], 
			'window_width' : int(sys.argv[ 3]), 
			'window_height': int(sys.argv[ 4]), 
			'scrollx'      : int(sys.argv[ 5]) if len(sys.argv) >=  6 else  0,
			'scrolly'      : int(sys.argv[ 6]) if len(sys.argv) >=  7 else  0,
			'timeout'      : int(sys.argv[ 7]) if len(sys.argv) >=  8 else 60,
			'useragent'    : sys.argv[ 8] if len(sys.argv) >=  9 else _useragent
		}
		_useragent = params['useragent']
		wc = WebCapture(params)
		sys.exit(app.exec_())
	except Exception as ex:
		print str(ex)
		

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#-------------------------------------------------------------------------------
