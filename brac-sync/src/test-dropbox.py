
#===============================================================================

import sys
import logging
import os
import traceback

#===============================================================================

def main():
	# Include the Dropbox SDK libraries
	from dropbox import client, rest, session

	# Get your app key and secret from the Dropbox developer website
	APP_KEY = 'INSERT_APP_KEY_HERE'
	APP_SECRET = 'INSERT_SECRET_HERE'

	# ACCESS_TYPE should be 'dropbox' or 'app_folder' as configured for your app
	ACCESS_TYPE = 'INSERT_ACCESS_TYPE_HERE'

	sess = session.DropboxSession(APP_KEY, APP_SECRET, ACCESS_TYPE)

	request_token = sess.obtain_request_token()

	# Make the user sign in and authorize this token
	url = sess.build_authorize_url(request_token)
	print "url:", url
	print "Please authorize in the browser. After you're done, press enter."
	raw_input()

	# This will fail if the user didn't visit the above URL and hit 'Allow'
	access_token = sess.obtain_access_token(request_token)

	client = client.DropboxClient(sess)
	print "linked account:", client.account_info()

	f = open('working-draft.txt')
	response = client.put_file('/magnum-opus.txt', f)
	print "uploaded:", response

	folder_metadata = client.metadata('/')
	print "metadata:", folder_metadata

	f, metadata = client.get_file_and_metadata('/magnum-opus.txt')
	out = open('magnum-opus.txt', 'w')
	out.write(f.read())
	out.close()
	print(metadata)

#===============================================================================

if __name__ == '__main__':
	main()

#===============================================================================
