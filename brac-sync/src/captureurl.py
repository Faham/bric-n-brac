#!/usr/bin/env python

#===============================================================================

import sys, logging
from webkit2png import WebkitRenderer
#from PyQt4 import QtGui, QtCore, uic

#-------------------------------------------------------------------------------

renderer = None

def capture(url, filename, params = None):
	global renderer
	if renderer == None:
		renderer = WebkitRenderer()
		
	if params == None:
		params = {}
	
	renderer.width                       = params.get('width'                       ,1024   )
	renderer.height                      = params.get('height'                      ,768    )
	renderer.timeout                     = params.get('timeout'                     ,10     )
	renderer.wait                        = params.get('wait'                        ,1      )
	renderer.scaleToWidth                = params.get('scaleToWidth'                ,0      )
	renderer.scaleToHeight               = params.get('scaleToHeight'               ,0      )
	renderer.scaleRatio                  = params.get('scaleRatio'                  ,'keep' )
	renderer.format                      = params.get('format'                      ,'png'  )
	renderer.logger                      = params.get('logger'                      ,logging)
	renderer.grabWholeWindow             = params.get('grabWholeWindow'             ,False  )
	renderer.renderTransparentBackground = params.get('renderTransparentBackground' ,False  )
	renderer.ignoreAlert                 = params.get('ignoreAlert'                 ,True   )
	renderer.ignoreConfirm               = params.get('ignoreConfirm'               ,True   )
	renderer.ignorePrompt                = params.get('ignorePrompt'                ,True   )
	renderer.interruptJavaScript         = params.get('interruptJavaScript'         ,True   )
	renderer.encodedUrl                  = params.get('encodedUrl'                  ,False  )

	image = renderer.render(url)
	image.save(filename)
	print 'saved to ' + filename

#-------------------------------------------------------------------------------

#app = QtGui.QApplication(sys.argv)
#capture()
#QtCore.QTimer.singleShot(0, capture)
#app.exit(0)
#sys.exit(app.exec_())

#===============================================================================
