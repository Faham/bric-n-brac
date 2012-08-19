
//------------------------------------------------------------------------------

#include <system.h>

//------------------------------------------------------------------------------

#include <config.h>

#ifdef _WIN32
	#define USEWIN32IOAPI
	#include "minizip/iowin32.h"
#endif

#ifdef _WIN32
	#include <direct.h>
	#include <io.h>
#else
	#include <unistd.h>
	#include <utime.h>
	#include <sys/types.h>
	#include <sys/stat.h>
#endif

//------------------------------------------------------------------------------

/* mymkdir and change_file_date are not 100 % portable
   As I don't know well Unix, I wait feedback for the unix portion */

int mymkdir(const char* dirname) {
	int ret=0;
#ifdef _WIN32
	ret = _mkdir(dirname);
#elif unix
	ret = mkdir (dirname, 0775);
#elif __APPLE__
	ret = mkdir (dirname, 0775);
#endif
	return ret;
}

//------------------------------------------------------------------------------

int makedir (const char *newdir) {
	char *buffer ;
	char *p;
	int  len = (int)strlen(newdir);

	if (len <= 0)
		return 0;

	buffer = (char*)malloc(len+1);
	if (buffer == NULL) {
		printf("Error allocating memory\n");
		return 0;
	}
	strcpy(buffer,newdir);

	if (buffer[len-1] == '/')
		buffer[len-1] = '\0';

	if (mymkdir(buffer) == 0) {
		free(buffer);
		return 1;
	}

	p = buffer+1;
	while (1) {
		char hold;

		while(*p && *p != '\\' && *p != '/')
			p++;
		hold = *p;
		*p = 0;
		if ((mymkdir(buffer) == -1) && (errno == ENOENT)) {
			printf("couldn't create directory %s\n",buffer);
			free(buffer);
			return 0;
		}
		if (hold == 0)
			break;
		*p++ = hold;
	}
	free(buffer);
	return 1;
}

//------------------------------------------------------------------------------

int check_exist_file(const char* filename) {
	FILE* ftestexist;
	int ret = 1;
	ftestexist = FOPEN_FUNC(filename,"rb");
	if (ftestexist==NULL)
		ret = 0;
	else
		fclose(ftestexist);
	return ret;
}

//------------------------------------------------------------------------------

/*
	f		name of file to get info on
	tmzip	return value: access, modific. and creation times
	dt		dostime
*/
uLong filetime(char * f, tm_zip * tmzip, uLong * dt) {
#ifdef _WIN32
	int ret = 0;

	FILETIME ftLocal;
	HANDLE hFind;
	WIN32_FIND_DATAA ff32;

	hFind = FindFirstFileA(f,&ff32);
	if (hFind != INVALID_HANDLE_VALUE) {
		FileTimeToLocalFileTime(&(ff32.ftLastWriteTime),&ftLocal);
		FileTimeToDosDateTime(&ftLocal,((LPWORD)dt)+1,((LPWORD)dt)+0);
		FindClose(hFind);
		ret = 1;
	}
	return ret;
#elif defined(unix) || defined(__APPLE__)
	int ret=0;
	struct stat s;		/* results of stat() */
	struct tm* filedate;
	time_t tm_t=0;

	if (strcmp(f,"-")!=0) {
		char name[MAXFILENAME+1];
		int len = strlen(f);
		if (len > MAXFILENAME)
			len = MAXFILENAME;

		strncpy(name, f,MAXFILENAME-1);
		/* strncpy doesnt append the trailing NULL, of the string is too long. */
		name[ MAXFILENAME ] = '\0';

		if (name[len - 1] == '/')
			name[len - 1] = '\0';
		/* not all systems allow stat'ing a file with / appended */
		if (stat(name,&s)==0) {
			tm_t = s.st_mtime;
			ret = 1;
		}
	}
	filedate = localtime(&tm_t);

	tmzip->tm_sec  = filedate->tm_sec;
	tmzip->tm_min  = filedate->tm_min;
	tmzip->tm_hour = filedate->tm_hour;
	tmzip->tm_mday = filedate->tm_mday;
	tmzip->tm_mon  = filedate->tm_mon ;
	tmzip->tm_year = filedate->tm_year;

	return ret;
#else
	return 0;
#endif
}

//------------------------------------------------------------------------------

int isLargeFile(const char* filename) {
	int largeFile = 0;
	ZPOS64_T pos = 0;
	FILE* pFile = FOPEN_FUNC(filename, "rb");

	if(pFile != NULL)
	{
		int n = FSEEKO_FUNC(pFile, 0, SEEK_END);
		pos = FTELLO_FUNC(pFile);

		printf("File : %s is %lld bytes\n", filename, pos);

		if(pos >= 0xffffffff)
			largeFile = 1;

		fclose(pFile);
	}

	return largeFile;
}

//------------------------------------------------------------------------------

void change_file_date(const char *filename, uLong dosdate, tm_unz tmu_date) {
#ifdef _WIN32
	HANDLE hFile;
	FILETIME ftm,ftLocal,ftCreate,ftLastAcc,ftLastWrite;

	hFile = CreateFileA(filename,GENERIC_READ | GENERIC_WRITE,
		0,NULL,OPEN_EXISTING,0,NULL);
	GetFileTime(hFile,&ftCreate,&ftLastAcc,&ftLastWrite);
	DosDateTimeToFileTime((WORD)(dosdate>>16),(WORD)dosdate,&ftLocal);
	LocalFileTimeToFileTime(&ftLocal,&ftm);
	SetFileTime(hFile,&ftm,&ftLastAcc,&ftm);
	CloseHandle(hFile);
#elif defined(unix) || defined(__APPLE__)
	struct utimbuf ut;
	struct tm newdate;
	newdate.tm_sec = tmu_date.tm_sec;
	newdate.tm_min=tmu_date.tm_min;
	newdate.tm_hour=tmu_date.tm_hour;
	newdate.tm_mday=tmu_date.tm_mday;
	newdate.tm_mon=tmu_date.tm_mon;
	if (tmu_date.tm_year > 1900)
		newdate.tm_year=tmu_date.tm_year - 1900;
	else
		newdate.tm_year=tmu_date.tm_year ;
	newdate.tm_isdst=-1;

	ut.actime=ut.modtime=mktime(&newdate);
	utime(filename,&ut);
#endif
}

//------------------------------------------------------------------------------
