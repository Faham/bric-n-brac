#!/usr/bin/env python

#===============================================================================

import os
import fnmatch
import platform

#===============================================================================

def getos():
	_sys = 'unknown'

	if platform.mac_ver() != ('', ('', '', ''), ''):
			_sys = 'mac'
	elif platform.win32_ver() != ('', '', '', ''):
			_sys = 'win'

	return _sys
		
#-------------------------------------------------------------------------------

def indent(elem, level=0):
	i = "\n" + level*"	"
	if len(elem):
		if not elem.text or not elem.text.strip():
			elem.text = i + "	"
		if not elem.tail or not elem.tail.strip():
			elem.tail = i
		for elem in elem:
			indent(elem, level+1)
		if not elem.tail or not elem.tail.strip():
			elem.tail = i
	else:
		if level and (not elem.tail or not elem.tail.strip()):
			elem.tail = i
				
#-------------------------------------------------------------------------------

def locate(pattern, root = os.curdir):
	'''Locate all files matching supplied filename pattern in and below
	supplied root directory.'''
	for path, dirs, files in os.walk(os.path.abspath(root)):
		for filename in fnmatch.filter(files, pattern):
			yield os.path.join(path, filename)
			
#-------------------------------------------------------------------------------

def subdirs(root = os.curdir):
	'''Locate all subdirectories in and below supplied root directory.'''
	for path, dirs, files in os.walk(os.path.abspath(root)):
		for dir in dirs:
			yield os.path.join(path, dir)
	

#-------------------------------------------------------------------------------



#===============================================================================
