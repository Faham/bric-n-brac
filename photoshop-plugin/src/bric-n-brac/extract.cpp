

//==============================================================================

#include <extract.h>

//==============================================================================

void Display64BitsSize(ZPOS64_T n, int size_char)
{
  /* to avoid compatibility problem , we do here the conversion */
  char number[21];
  int offset=19;
  int pos_string = 19;
  number[20]=0;
  for (;;) {
	  number[offset]=(char)((n%10)+'0');
	  if (number[offset] != '0')
		  pos_string=offset;
	  n/=10;
	  if (offset==0)
		  break;
	  offset--;
  }
  {
	  int size_display_string = 19-pos_string;
	  while (size_char > size_display_string)
	  {
		  size_char--;
		  printf(" ");
	  }
  }

  printf("%s",&number[pos_string]);
}

//------------------------------------------------------------------------------

unzFile getUnzipFile (char * filename /*= NULL*/) {
	unzFile uf = NULL;

	if (!filename)
		return NULL;

#ifdef USEWIN32IOAPI
	zlib_filefunc64_def ffunc;
	fill_win32_filefunc64A(&ffunc);
	uf = unzOpen2_64(filename, &ffunc);
#else
	uf = unzOpen64(filename);
#endif

	return uf;
}

//------------------------------------------------------------------------------

StringVec list(unzFile uf)
{
	uLong i;
	unz_global_info64 gi;
	int err;
	StringVec ret;

	err = unzGetGlobalInfo64(uf,&gi);
	if (err!=UNZ_OK)
		printf("error %d with zipfile in unzGetGlobalInfo \n",err);
	printf("  Length  Method	 Size Ratio   Date	Time   CRC-32	 Name\n");
	printf("  ------  ------	 ---- -----   ----	----   ------	 ----\n");
	for (i=0;i<gi.number_entry;i++)
	{
		char filename_inzip[256];
		unz_file_info64 file_info;
		uLong ratio=0;
		const char *string_method;
		char charCrypt=' ';
		err = unzGetCurrentFileInfo64(uf,&file_info,filename_inzip,sizeof(filename_inzip),NULL,0,NULL,0);
		if (err!=UNZ_OK)
		{
			printf("error %d with zipfile in unzGetCurrentFileInfo\n",err);
			break;
		}
		if (file_info.uncompressed_size>0)
			ratio = (uLong)((file_info.compressed_size*100)/file_info.uncompressed_size);

		/* display a '*' if the file is crypted */
		if ((file_info.flag & 1) != 0)
			charCrypt='*';

		if (file_info.compression_method==0)
			string_method="Stored";
		else
			if (file_info.compression_method==Z_DEFLATED)
			{
				uInt iLevel=(uInt)((file_info.flag & 0x6)/2);
				if (iLevel==0)
					string_method="Defl:N";
				else if (iLevel==1)
					string_method="Defl:X";
				else if ((iLevel==2) || (iLevel==3))
					string_method="Defl:F"; /* 2:fast , 3 : extra fast*/
			}
			else
				if (file_info.compression_method==Z_BZIP2ED)
				{
					string_method="BZip2 ";
				}
				else
					string_method="Unkn. ";

		Display64BitsSize(file_info.uncompressed_size,7);
		printf("  %6s%c",string_method,charCrypt);
		Display64BitsSize(file_info.compressed_size,7);
		printf(" %3lu%%  %2.2lu-%2.2lu-%2.2lu  %2.2lu:%2.2lu  %8.8lx   %s\n",
			ratio,
			(uLong)file_info.tmu_date.tm_mon + 1,
			(uLong)file_info.tmu_date.tm_mday,
			(uLong)file_info.tmu_date.tm_year % 100,
			(uLong)file_info.tmu_date.tm_hour,(uLong)file_info.tmu_date.tm_min,
			(uLong)file_info.crc,filename_inzip);
		if ((i+1)<gi.number_entry)
		{
			err = unzGoToNextFile(uf);
			if (err!=UNZ_OK)
			{
				printf("error %d with zipfile in unzGoToNextFile\n",err);
				break;
			}
		}
	}

	return ret;
}

//------------------------------------------------------------------------------

StringVec list(char * filename) {
	unzFile uf = getUnzipFile(filename);
	StringVec ret = list(uf);
	unzClose(uf);
	return ret;
}

//------------------------------------------------------------------------------

int extractCurrentFile(unzFile uf
	, bool preserve_tree_structure /*= True*/
	, bool overwrite /*= False*/
	, const char* password /*= NULL*/) {

	char filename_inzip[256];
	char* filename_withoutpath;
	char* p;
	int err = UNZ_OK;
	FILE *fout = NULL;
	void* buf;
	uInt size_buf;

	unz_file_info64 file_info;
	uLong ratio = 0;
	err = unzGetCurrentFileInfo64(uf, &file_info, filename_inzip
		, sizeof(filename_inzip), NULL, 0, NULL, 0);

	if (UNZ_OK != err)
	{
		printf("error %d with zipfile in unzGetCurrentFileInfo\n", err);
		return err;
	}

	size_buf = WRITEBUFFERSIZE;
	buf = (void*)malloc(size_buf);
	if (NULL == buf)
	{
		printf("Error allocating memory\n");
		return UNZ_INTERNALERROR;
	}

	p = filename_withoutpath = filename_inzip;
	while ((*p) != '\0')
	{
		if (((*p) == '/') || ((*p) == '\\'))
			filename_withoutpath = p+1;
		p++;
	}

	if ((*filename_withoutpath) == '\0')
	{
		if (preserve_tree_structure)
		{
			printf("creating directory: %s\n", filename_inzip);
			mymkdir(filename_inzip);
		}
	}
	else
	{
		const char* write_filename;
		int skip = 0;

		if (preserve_tree_structure)
			write_filename = filename_inzip;
		else
			write_filename = filename_withoutpath;

		err = unzOpenCurrentFilePassword(uf, password);
		if (err!=UNZ_OK)
		{
			printf("error %d with zipfile in unzOpenCurrentFilePassword\n",err);
		}

		if ((!overwrite) && (err == UNZ_OK))
		{
			char rep = 0;
			FILE* ftestexist;
			ftestexist = FOPEN_FUNC(write_filename, "rb");
			if (ftestexist!=NULL)
			{
				fclose(ftestexist);
				do
				{
					char answer[128];
					int ret;

					printf("The file %s exists. Overwrite ? [y]es, [n]o, [A]ll: ",write_filename);
					ret = scanf("%1s",answer);
					if (ret != 1)
					{
					   exit(EXIT_FAILURE);
					}
					rep = answer[0] ;
					if ((rep>='a') && (rep<='z'))
						rep -= 0x20;
				}
				while ((rep!='Y') && (rep!='N') && (rep!='A'));
			}

			if (rep == 'N')
				skip = 1;
		}

		if ((skip == 0) && (err == UNZ_OK))
		{
			fout = FOPEN_FUNC(write_filename, "wb");
			/* some zipfile don't contain directory alone before file */
			if ((fout == NULL) && (preserve_tree_structure) 
					&& (filename_withoutpath != (char*)filename_inzip))
			{
				char c = *(filename_withoutpath - 1);
				*(filename_withoutpath - 1) = '\0';
				makedir(write_filename);
				*(filename_withoutpath - 1) = c;
				fout = FOPEN_FUNC(write_filename, "wb");
			}

			if (fout == NULL)
			{
				printf("error opening %s\n", write_filename);
			}
		}

		if (fout != NULL)
		{
			printf(" extracting: %s\n", write_filename);

			do
			{
				err = unzReadCurrentFile(uf, buf, size_buf);
				if (err < 0)
				{
					printf("error %d with zipfile in unzReadCurrentFile\n", err);
					break;
				}
				if (err > 0)
					if (fwrite(buf, err, 1, fout) != 1)
					{
						printf("error in writing extracted file\n");
						err = UNZ_ERRNO;
						break;
					}
			}
			while (err > 0);
			if (fout)
				fclose(fout);

			if (err == 0)
				change_file_date(write_filename, file_info.dosDate,
								 file_info.tmu_date);
		}

		if (err==UNZ_OK)
		{
			err = unzCloseCurrentFile (uf);
			if (err!=UNZ_OK)
			{
				printf("error %d with zipfile in unzCloseCurrentFile\n",err);
			}
		}
		else
			unzCloseCurrentFile(uf); /* don't lose the error */
	}

	free(buf);
	return err;
}

//------------------------------------------------------------------------------

int extractFile(unzFile uf, const char* filename, bool preserve_tree_structure /*= True*/, bool overwrite /*= False*/, const char* password /*= NULL*/) {
	int err = UNZ_OK;
	if (UNZ_OK != unzLocateFile(uf, filename, CASESENSITIVITY)) {
		printf("file %s not found in the zipfile\n", filename);
		return 2;
	}

	if (extractCurrentFile(uf, preserve_tree_structure, overwrite, password)
		== UNZ_OK)
		return 0;
	else
		return 1;
}

//------------------------------------------------------------------------------

int extractFile(char * filename, char * archive_filename
	, bool preserve_tree_structure /*= True*/
	, char * password /*= NULL*/
	, char * extract_path /*= NULL*/
	, bool overwrite /*= False*/) {

	unzFile uf = getUnzipFile(archive_filename);

#ifdef _WIN32
	if (extract_path && _chdir(extract_path))
#else
	if (extract_path && chdir(extract_path))
#endif
	{
		printf("Error changing into %s, aborting\n", extract_path);
		return 0;
	}

	int ret_value = extractFile(uf, filename, preserve_tree_structure, overwrite, password);

	unzClose(uf);

	return ret_value;
}

//------------------------------------------------------------------------------

int extract(unzFile uf
	, bool preserve_tree_structure
	, bool overwrite
	, const char* password) {

	uLong i;
	unz_global_info64 gi;
	int err;
	FILE* fout=NULL;

	err = unzGetGlobalInfo64(uf,&gi);
	if (UNZ_OK != err)
		printf("error %d with zipfile in unzGetGlobalInfo \n",err);

	for (i=0; i < gi.number_entry; ++i)
	{
		if (extractCurrentFile(uf, preserve_tree_structure
				, overwrite, password) != UNZ_OK)
			break;

		if ((i+1) < gi.number_entry)
		{
			err = unzGoToNextFile(uf);
			if (UNZ_OK != err)
			{
				printf("error %d with zipfile in unzGoToNextFile\n",err);
				break;
			}
		}
	}

	return 0;
}

//------------------------------------------------------------------------------

int extract(char * archive_filename
	, bool preserve_tree_structure /*= True*/
	, char * password /*= NULL*/
	, char * extract_path /*= NULL*/
	, bool overwrite /*= False*/) {
	
	unzFile uf = getUnzipFile(archive_filename);

#ifdef _WIN32
	if (extract_path && _chdir(extract_path))
#else
	if (extract_path && chdir(extract_path))
#endif
	{
		printf("Error changing into %s, aborting\n", extract_path);
		exit(-1);
	}

	int ret_value = extract(uf, preserve_tree_structure, overwrite, password);

	unzClose(uf);

	return ret_value;
}

//==============================================================================

