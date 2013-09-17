BracCollage
===================
Chrome extension and Photoshop plugin coupled with a Python app to 
generate digital collages incorporating dynamic contents from web


Usage
=====


Example
-------


Installation
============
--------------------------------------------------------------------------------

Windows Installation
-------

	Installing Python 2.7.3 and required modules
	Settings environment variables

- Installing Python 2.7.3 and required modules
	- Install "Windows x86 MSI Installer"                   from http://www.python.org/download/releases/2.7.3/
	- Install "PyQt-Py2.7-x86-gpl-4.9.6-1.exe"              from http://www.riverbankcomputing.co.uk/software/pyqt/download
	- Install "distribute-0.6.36.win32-py2.7.‌exe"           from http://www.lfd.uci.edu/~gohlke/pythonlibs/#distribute
	- Install "pip-1.3.1.win32-py2.7.‌exe"                   from http://www.lfd.uci.edu/~gohlke/pythonlibs/#distribute
	- Install "Python Imaging Library 1.1.7 for Python 2.7" from http://www.pythonware.com/products/pil/
	- Install "numpy-MKL-1.7.1.win32-py2.7.‌exe"             from http://www.lfd.uci.edu/~gohlke/pythonlibs/#opencv
	- Install "opencv-python-2.4.5.win32-py2.7.‌exe"         from http://www.lfd.uci.edu/~gohlke/pythonlibs/#opencv

- Set environment variables:
	- Control Panel -> View Advanced System Settings
	- Click the "Environment Variables..." button
	- Choose "Path" variable in the "System Variables" list box and then press "Edit"
	- Add ";C:\Python27;C:\Python27\Scripts" (without qoutes) to the end of variable value textbox.
		Note: if you chose to install python in a different directory that C:\Python27, you need to use that directory instead.
	- Press all OK buttons to close all dialog boxes.

Mac OS X Installation:
-------

- Installing Python 2.7.3 and required modules
Run the following commands
	brew install python --framework
it will probably install pyqt4 and pil but if it didn't:
	brew install pyqt4
	brew install pil

- Then to install OpenCV:
	pip install numpy
	brew install opencv 
if it couldn't find the formula then run the following first:
	brew tap homebrew/science

Note that Python 2.7.3 with installed modules should be either the default accible python or set specifically for the .py files.

- Installing Chrome Extension
drag the crx file onto chrome and install it
within this file there are three executable files which require special access permissions (permission should be set for 555):
./bin/7za
./bin/convert
./bin/snapshot.py

- Installing Photoshop Panel
copy the bric-a-brac directory from ./distro/photoshop-panel into the /Applications/Adobe Photoshop CS5.1~6/Plug-ins/Panels
you should set permission access for following files specifically
555 for content/bric-a-brac.assets/7za
777 for content/bric-a-brac.assets/script.sh

- Install iTerm as you default terminal and set that and the default application for opening *.sh files.

Developed By
============
* Faham Negini - <faham.negini@gmail.com>

Git repository located at
[https://github.com/Faham/bric-n-brac.git](https://github.com/Faham/bric-n-brac.git)


Thanks
======
*   __Tim Nowlin__

    For his support to this project

*   __Jeff Smith__

    For the technical insight and ideas he contributed to this project
	
*   __Jon Bath__

    For his feedbacks to the project
	
License
=======
    Copyright 2013.  University of Saskatchewan.  All rights reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.