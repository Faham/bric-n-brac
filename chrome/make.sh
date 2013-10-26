
#-------------------------------------------------------------------------------

OS="unknown"

if [ "${OSTYPE}" = "msys" -o "${OS}" = "Windows_NT" ]; then
	OS='win'
elif [[ "${OSTYPE}" == darwin* ]]; then
	OS='mac'
fi

#-------------------------------------------------------------------------------

CURPATH=`pwd`
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null
cd $SCRIPTPATH

rm -fr ext/bin
mkdir ext/bin

#-------------------------------------------------------------------------------

# copy plugin
if [ "${OS}" = 'mac' ]; then
	#xcodebuild ARCHS=i386 ONLY_ACTIVE_ARCH=NO -project plugin/build/projects/BracExtenssionProvider/BracExtenssionProvider.xcodeproj -configuration MinSizeRel clean build
	cp -r plugin/build/projects/BracExtenssionProvider/MinSizeRel/BracExtenssionProvider.plugin ext/bin/
elif [ "${OS}" = 'win' ]; then
	cp plugin/build/bin/BracExtenssionProvider/MinSizeRel/npBracExtenssionProvider.dll ext/bin/
fi

#-------------------------------------------------------------------------------

# copy 7z
if [ "${OS}" = 'mac' ]; then
	cp ../tools/external/7za ext/bin/
elif [ "${OS}" = 'win' ]; then
	cp ../tools/external/7za.exe ext/bin/
fi

#-------------------------------------------------------------------------------

# copy crop
../tools/crop/make.sh
cp -r ../distro/$OS/crop/clg-crop* ext/bin/

#-------------------------------------------------------------------------------

# copy snapshot
../tools/snapshot/make.sh
cp -r ../distro/$OS/snapshot/clg-snapshot* ext/bin/

#-------------------------------------------------------------------------------

#set extension manifest plugin name
python -c """
import json
import platform

jsndt = open('ext/manifest.json')
dt = json.load(jsndt)

if platform.system() == 'Windows': dt['plugins'] = [{u'path': u'bin/npBracExtenssionProvider.dll', u'public': True}]
elif platform.system() == 'Darwin': dt['plugins'] = [{u'path': u'bin/BracExtenssionProvider.plugin', u'public': True}]

dtout = json.dumps(dt, indent=4, sort_keys=True)
jsndt.close()
outfl = open('ext/manifest.json', 'w')
outfl.write(dtout)
outfl.close()
"""

rm ../distro/$OS/bracollage.crx

MakeCRX='buildcrx.exe'
if [ "${OS}" = 'mac' ]; then
	MakeCRX='buildcrx.bin'
fi
cd ext/
../../tools/external/7za.exe a -tzip ../ext.zip *
cd ..
$MakeCRX ext.zip ext.pem
rm ext.zip
mv $SCRIPTPATH/ext.crx ../distro/$OS/bracollage.crx

#-------------------------------------------------------------------------------

cd $CURPATH
