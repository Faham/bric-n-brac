
#-------------------------------------------------------------------------------

import os, glob, shutil, zipfile
import xml.etree.ElementTree as et
import tempfile
import common

#-------------------------------------------------------------------------------

def updateEntryTimeTable(entry):
	bracList = []
	if entry['type'] == 'dir':
		if entry['recursive']:
			bracs = common.locate('*.brac', entry['path'])
		elif not entry['recursive']:
			bracs = glob.glob(os.path.join(entry['path'], '*.brac'))
		for f in bracs:
			if f not in bracList:
				bracList.append(f)
		
	elif entry['type'] == 'file':
		if entry['path'][-4:].lower() == 'brac' and entry['path'] not in bracList:
			bracList.append(entry['path'])
	
	entry['bracList'] = []
	for b in bracList:
		timetbl = getBracTimeTable(b)
		entry['bracList'].append({
			'path': b,
			'mtime': os.path.getmtime(b),
			'timetable': timetbl,
		})

	if entry['type'] == 'dir':
		entry['subdirs'] = {}
		subdirs = common.subdirs(entry['path'])
		for sd in subdirs:
			entry['subdirs'][sd] = os.path.getmtime(sd)
		
	entry['mtime'] = os.path.getmtime(entry['path'])

#-------------------------------------------------------------------------------

def updateTimeTable(entries):
	for e in entries:
		updateEntryTimeTable(e)

#-------------------------------------------------------------------------------

def getBracTimeTable(path):	
	if not os.path.isfile(path): return False

	tempdir = tempfile.mkdtemp()
	
	zf_brac = zipfile.ZipFile(path, 'r')
	zf_brac.extract('brac.xml', tempdir)
	zf_brac.close()
	bracxml = et.parse(os.path.join(tempdir, 'brac.xml'))
	
	shutil.rmtree(tempdir)
	
	timetbl = []

	bracdef = bracxml.getroot()
	layers = bracdef.find('layers');

	if layers == None:
		logger.error('brac %s has no layers node!' % path)
		return
			
	for layer in layers:
		if layer.tag != 'bric':
			continue

		bric = layer
		id = bric.attrib['id']
		timeinterval = bric.attrib['timeinterval']
		lastupdate = bric.attrib['lastupdate']
		timetbl.append({'id': id, 'timeinterval': timeinterval, 'lastupdate': lastupdate})
	
	return timetbl

#-------------------------------------------------------------------------------
