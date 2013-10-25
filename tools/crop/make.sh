
OS="unknown"

if [ "${OSTYPE}" = "msys" -o "${OS}" = "Windows_NT" ]; then
	OS='win'
elif [[ "${OSTYPE}" == darwin* ]]; then
	OS='mac'
fi

CURPATH=`pwd`
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null
cd $SCRIPTPATH

rm -fr dist build

if [ "${OS}" = 'mac' ]; then
	python setup.py py2app
elif [ "${OS}" = 'win' ]; then
	python setup.py py2exe
else
	echo 'os not supported'
fi

rm -fr ../../distro/$OS/crop
mkdir ../../distro/$OS/crop
cp -r dist/* ../../distro/$OS/crop/

cd $CURPATH
