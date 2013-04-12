#!/usr/bin/env python2.7

#-------------------------------------------------------------------------------

import sys
import logging
import os
import traceback
import shutil
import tempfile
import zipfile
import time
import cv, cv2
from PIL import Image
import xml.etree.ElementTree as et

#-------------------------------------------------------------------------------

def exportBrac(bracpath, outpath, timesff = 30, fps = 24):

	#tempdir = tempfile.mkdtemp()
	tempdir = 'temp'
	if os.path.isdir(tempdir):
		shutil.rmtree(tempdir)
	os.mkdir(tempdir)

	try:
		if not os.path.isdir(tempdir):
			logging.error('cannot create the temp directory (%s)' % tempdir)
			return
		else:
			logging.debug('created temp directory (%s)' % tempdir)

		if not os.path.isfile(bracpath):
			logging.error('cannot open \'%s\' (No such file exists)' % bracpath)
			return False

		zf_brac = zipfile.ZipFile(bracpath, 'a')

		zf_brac.extractall(tempdir)
		bracxml = et.parse(os.path.join(tempdir, 'brac.xml'))
		bracdef = bracxml.getroot()
		resolution = dict(zip(['width', 'height'], [int(i) for i in bracdef.attrib['resolution'].split()]))

		# generating timeline
		# TODO: add support for order, static layers
		layers = bracdef.find('layers');

		if layers == None:
			logging.error('brac has no layer node!' % path)
			return False
		
		timeline = []

		brics = {}

		for layer in layers:

			if layer.tag != 'bric':
				continue

			brics[layer.attrib['id']] = layer
			bricdir = os.path.join(tempdir, 'bric.%s' % layer.attrib['id'])

			if not os.path.isdir(bricdir):
				logging.error('brac file is broken, bric id %s cannot be found (%s)' % (layer.attrib['id'], bracpath))
				return False

			bricxml = et.parse(os.path.join(bricdir, 'bric.xml'))
			bricdef = bricxml.getroot()

			for sn in bricdef.findall('snapshot'):

				ent = {}
				ent['time'] = time.strptime(sn.attrib['date'], '%Y-%m-%d %H:%M:%S')
				imgPath = os.path.join(bricdir, '%s.png' % sn.attrib['revision'])

				inserted = False

				for k, v in enumerate(timeline):
					if ent['time'] < v['time']:
						ent['images'] = {layer.attrib['id']: imgPath}
						timeline.insert(k, ent)
						inserted = True
						break

				if not inserted:
					ent['images'] = {layer.attrib['id']: imgPath}
					timeline.append(ent)

		for i, t in enumerate(timeline):
			if i > 0:
				imgs = timeline[i - 1]['images'].copy()
				imgs.update(t['images'])
				timeline[i]['images'] = imgs

		# generating images
		images = []
		imagesdir = os.path.join(tempdir, 'out')
		os.mkdir(imagesdir)

		for i, t in enumerate(timeline):

			newImg = Image.new('RGBA', (resolution['width'], resolution['height']), (0,0,0,0))

			for bricid in t['images']:

				imgpath = t['images'][bricid]
				mskpath = os.path.join(os.path.abspath(os.path.join(imgpath, os.pardir)), 'mask.png')
				img = Image.open(imgpath)
				msk = Image.open(mskpath)

				alpha   = int(float(brics[bricid].attrib['alpha' ]))
				rot     = int(float(brics[bricid].attrib['rotate']))
				pos     = tuple([int(float(j)) for j in brics[bricid].attrib['position'    ].split()])
				mskpos  = tuple([int(float(j)) for j in brics[bricid].attrib['maskposition'].split()])
				scl     = tuple([    float(j)  for j in brics[bricid].attrib['scale'       ].split()])
				scl     = (int(scl[0] * img.size[0]), int(scl[1] * img.size[1]))

				tmpImg = Image.new('RGBA', (resolution['width'], resolution['height']), (0,0,0,0))
				tmpImg.paste(img.resize(scl).rotate(rot), pos)

				tmp2Img = Image.new('RGBA', (resolution['width'], resolution['height']), (0,0,0,0))
				tmp2Img.paste(msk, mskpos)

				newImg.paste(tmpImg, mask=tmp2Img)

			pth = os.path.join(imagesdir, '%d.png' % i)
			newImg.save(pth)
			images.append({'time': t['time'], 'path': pth})

		# generating out video
		writer = cv2.VideoWriter(
			filename  = outpath, 
			fourcc    = cv.CV_FOURCC('I','4', '2', '0'), #this is the codec that works for me
			fps       = fps,                             #frames per second, I suggest 15 as a rough initial estimate
			frameSize = (resolution['width'], resolution['height']))

		# TODO: set the duration for each fram
		for img in images:
			imgDuration = 1 * fps

			cap = cv2.VideoCapture(img['path'])
			retval = cap.grab()
			retval, image = cap.retrieve()

			if image is None:
				logging.error('cannot retrieve image for file (%s)' % img['path'])
				continue

			for i in range(imgDuration):
				writer.write(image)

		return True

	except Exception:

		logging.error('unknown error occured!')
		traceback.print_exc(file=sys.stdout)
		return False

	finally:
		pass
		#shutil.rmtree(tempdir)

#===============================================================================

def main():

	if len(sys.argv) < 2:
		print 'usage: export.py bracfile [outfile]'
		return;

	bracfile = sys.argv[1]

	if len(sys.argv) >= 3:
		outfile = sys.argv[2]
		if outfile[-4:] != '.avi':
			outfile += '.avi'
	else:
		outfile = 'out.avi'

	res = exportBrac(bracfile, outfile)

	if res:
		logging.info('output generated successfully at: %s' % outfile)
	else:
		logging.info('could not generate the output (error occured!)')

#-------------------------------------------------------------------------------

if __name__ == '__main__':
	main()

#-------------------------------------------------------------------------------
