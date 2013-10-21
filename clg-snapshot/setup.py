
#===============================================================================

import platform
import sys
env = platform.system().lower()

#===============================================================================

if env == 'darwin':
	from setuptools import setup
elif env == 'windows':
	from distutils.core import setup
	import py2exe, sys, os
else:
	print 'unknown os!'
	sys.exit(1)
	
#===============================================================================

app                  = ['clg-snapshot.py']
optimize             = 2
# distutil options
data_files           = []
pkginfo_name         = 'clg-snapshot'
pkginfo_version      = '1.0.0'
pkginfo_url          = ''
pkginfo_license      = 'GNU General Public License'
pkginfo_author       = 'Faham Negini'
pkginfo_author_email = 'fan780@mail.usask.ca'

#===============================================================================

if env == 'darwin':
	py2app_options = {
		'argv_emulation': True,
		'dist_dir'      : 'dist',
		'iconfile'      : 'snapshot-icon.png',
		'optimize'      : optimize,
		'qt_plugins'    : 'imageformats'
	}
	
	setup(
		app            = app,
		options        = {'py2app': py2app_options},
		setup_requires = ['py2app'],
		# distutil options
		data_files     = data_files,
		name           = pkginfo_name,
		version        = pkginfo_version,
		url            = pkginfo_url,
		license        = pkginfo_license,
		author         = pkginfo_author,
		author_email   = pkginfo_author_email,
	)

#-------------------------------------------------------------------------------

elif env == 'windows':
	sys.argv.append('py2exe')

	# system dlls to include in the exe package
	include_dll = ["msvcp90.dll"]

	origIsSystemDLL = py2exe.build_exe.isSystemDLL
	def isSystemDLL(pathname):
			if os.path.basename(pathname).lower() in include_dll:
					return 0
			return origIsSystemDLL(pathname)
	py2exe.build_exe.isSystemDLL = isSystemDLL

	#------------------------------
	
	py2exe_options = {
		'optimize'    : optimize,
		'bundle_files': 1,
		'compressed'  : True,
		'includes'    : ['sip', 'PyQt4.QtNetwork'],
	}
	
	setup(
		options      = {'py2exe': py2exe_options },
		console      = app,
		zipfile      = None,
		# distutil options
		data_files   = data_files,
		name         = pkginfo_name,
		version      = pkginfo_version,
		url          = pkginfo_url,
		license      = pkginfo_license,
		author       = pkginfo_author,
		author_email = pkginfo_author_email,
	)
	
#===============================================================================
