OS="unknown"

if [ "${OSTYPE}" = "msys" -o "${OS}" = "Windows_NT" ]; then
	OS='win'
elif [[ "${OSTYPE}" == darwin* ]]; then
	OS='mac'
fi

rm -fr dist build

if [ "${OS}" = 'mac' ]; then
	python setup.py py2app
elif [ "${OS}" = 'win' ]; then
	python setup.py py2exe
else
	echo 'os not supported'
fi