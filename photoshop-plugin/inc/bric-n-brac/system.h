
#ifndef __SYSTEM_H_
	#define __SYSTEM_H_

//------------------------------------------------------------------------------

#include <minizip/zip.h>
#include <minizip/unzip.h>

// mymkdir and change_file_date are not 100 % portable
// As I don't know well Unix, I wait feedback for the unix portion
int mymkdir(const char* dirname);
int makedir (const char *newdir);
int check_exist_file(const char* filename);

// f		name of file to get info on
// tmzip	return value: access, modific. and creation times
// dt		dostime
uLong filetime(char * f, tm_zip * tmzip, uLong * dt);
int isLargeFile(const char* filename);

//change_file_date : change the date/time of a file
//filename : the filename of the file where date/time must be modified
//dosdate : the new date at the MSDos format (4 bytes)
//tmu_date : the SAME new date at the tm_unz format
void change_file_date(const char *filename, uLong dosdate, tm_unz tmu_date);

//------------------------------------------------------------------------------

#endif	//__SYSTEM_H_