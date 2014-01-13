
//==============================================================================

#if !defined _COMMON_H_
#define _COMMON_H_

//==============================================================================

#if defined _WIN32
	#include <windows.h>
	#include <atlstr.h>
	#include <stdlib.h>
#elif defined __APPLE__
	#include <unistd.h>
#endif

//==============================================================================

//#if defined _WIN32
//std::wstring s2ws(const std::string& s) {
//	int len;
//	int slength = (int)s.length() + 1;
//	len = MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, 0, 0); 
//	wchar_t* buf = new wchar_t[len];
//	std::wstring r(buf);
//	delete[] buf;
//	return r;
//}
//#endif

//------------------------------------------------------------------------------

std::string escape_path(const std::string & s)
{
#if defined _WIN32
	std::string escaped_s = s;
	int pos = 0;
	while ((pos = escaped_s.find("/", pos)) != std::string::npos) {
		escaped_s.replace(pos, 1, "\\");
		pos += 1;
	}
#elif defined __APPLE__
	std::string escaped_s = s;
	std::string::size_type pos = 0;
	while ((pos = escaped_s.find(" ", pos)) != std::string::npos) {
		escaped_s.replace(pos, 1, "\\ ");
		pos += 2;
	}
#endif
	return escaped_s;
}

//------------------------------------------------------------------------------

#if defined _WIN32
	#define popen _popen
	#define pclose _pclose
#endif

std::string system_call (const std::string & cmd) {
	FILE* pipe = popen(cmd.c_str(), "r");
	if (!pipe) return "ERROR";
	char buffer[128];
	std::string result = "";
	while(!feof(pipe)) {
		if(fgets(buffer, 128, pipe) != NULL)
			result += buffer;
	}
	pclose(pipe);
	return result;
}

//------------------------------------------------------------------------------

std::vector<std::string> split(const std::string &s, char delim) {
	std::vector<std::string> elems;
	std::stringstream ss(s);
	std::string item;
	while(std::getline(ss, item, delim)) {
		elems.push_back(item);
	}
	return elems;
}

//------------------------------------------------------------------------------

const char * get_env( const char * var ) {
	const char * val = ::getenv(var);
	if ( val == 0 )
		return "";
	else
		return val;
}

//------------------------------------------------------------------------------

#endif // _COMMON_H_

//==============================================================================
