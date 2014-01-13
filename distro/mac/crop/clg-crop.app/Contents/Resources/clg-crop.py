#!/usr/bin/env python2.7

#===============================================================================

import sys
import os
import traceback
from PIL import Image

#===============================================================================

def cropImage(filename, left, top, width, height):
	img = Image.open(filename)
	box = (left, top, left + width, top + height)
	area = img.crop(box)
	area.save(filename, 'png')
	
#===============================================================================

def main():
	try:
		strusage = 'usage: filepath left top width height'
		if len(sys.argv) < 5:
			print strusage
			return
		
		filepath = sys.argv[1]
		l = int(sys.argv[2]) if len(sys.argv) >= 3 else  0
		t = int(sys.argv[3]) if len(sys.argv) >= 4 else  0
		w = int(sys.argv[4]) if len(sys.argv) >= 5 else  0
		h = int(sys.argv[5]) if len(sys.argv) >= 6 else  0
		
		if not os.path.exists(filepath) or (not l and not t and not w and not h):
			print strusage
			print 'no crop region is available'
			return
		
		cropImage(filepath, l, t, w, h)

	except Exception:
		traceback.print_exc(file=sys.stdout)

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#-------------------------------------------------------------------------------
