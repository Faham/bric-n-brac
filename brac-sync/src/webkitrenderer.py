#!/usr/bin/env python
#
# webkit2png.py
#
# Creates screenshots of webpages using by QtWebkit.
#
# Copyright (c) 2008 Roland Tapken <roland@dau-sicher.de>
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA

#===============================================================================

import sys
import signal
import os
import logging
import time

logger = logging.getLogger('WebKitRenderer')

from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import QWebPage

#===============================================================================

class WebkitRenderer(QObject):

#-------------------------------------------------------------------------------

	def __init__(self):
		logger.debug("Initializing class %s", self.__class__.__name__)
		self._page = QWebPage()
		self.connect(self._page, SIGNAL("loadFinished(bool)"), self.__on_load_finished)
		self.connect(self._page, SIGNAL("loadStarted()"), self.__on_load_started)
		self.connect(self._page.networkAccessManager(), SIGNAL("sslErrors(QNetworkReply *,const QList<QSslError>&)"), self.__on_ssl_errors)

		# The way we will use this, it seems to be unesseccary to have Scrollbars enabled
		self._page.mainFrame().setScrollBarPolicy(Qt.Horizontal, Qt.ScrollBarAlwaysOff)
		self._page.mainFrame().setScrollBarPolicy(Qt.Vertical, Qt.ScrollBarAlwaysOff)

		# Helper for multithreaded communication through signals 
		self.__loading = False
		self.__loading_result = False

#-------------------------------------------------------------------------------

	def render(self, url, width=0, height=0, timeout=0):
		logger.debug("rendering %s (timeout: %d)", url, timeout)

		# This is an event-based application. So we have to wait until
		# "loadFinished(bool)" raised.
		cancelAt = time.time() + timeout
		self._page.mainFrame().load(QUrl(url))
		while self.__loading:
			if timeout > 0 and time.time() >= cancelAt:
				raise RuntimeError("Request timed out")
			QCoreApplication.processEvents()

		logger.debug("Processing result")

		if self.__loading_result == False:
			raise RuntimeError("Failed to load %s" % url)

		# Set initial viewport (the size of the "window")
		size = self._page.mainFrame().contentsSize()
		if width > 0:
			size.setWidth(width)
		if height > 0:
			size.setHeight(height)
		self._page.setViewportSize(size)

		# Paint this frame into an image
		image = QImage(self._page.viewportSize(), QImage.Format_ARGB32)
		painter = QPainter(image)
		self._page.mainFrame().render(painter)
		painter.end()

		return image

#-------------------------------------------------------------------------------

	def __on_load_started(self):
		logger.debug("loading started")
		self.__loading = True

#-------------------------------------------------------------------------------

	def __on_load_finished(self, result):
		logger.debug("loading finished with result %s", result)
		self.__loading = False
		self.__loading_result = result

#-------------------------------------------------------------------------------

	def __on_ssl_errors(self, reply, errors):
		logger.warn("ssl error")
		#self.__loading = False
		#self.__loading_result = result
		reply.ignoreSslErrors()

#===============================================================================

