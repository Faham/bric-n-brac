/**********************************************************\

  Auto-generated BracExtenssionProviderAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "BracExtenssionProviderAPI.h"

#include <string>
#include <iostream>
#include <stdio.h>
#include "DialogManager.h"
#include <stdlib.h>
#include <DOM.h>
//#define _X86_	1

#include <Windows.h>
#include <fstream>
#include <atlstr.h>

///////////////////////////////////////////////////////////////////////////////
/// @fn FB::variant BracExtenssionProviderAPI::echo(const FB::variant& msg)
///
/// @brief  Echos whatever is passed from Javascript.
///         Go ahead and change it. See what happens!
///////////////////////////////////////////////////////////////////////////////
FB::variant BracExtenssionProviderAPI::echo(const FB::variant& msg)
{
    static int n(0);
    fire_echo("So far, you clicked this many times: ", n++);

    // return "foobar";
    return msg;
}

FB::variant BracExtenssionProviderAPI::systemCall(const FB::variant& msg)
{
	std::string cmd = msg.convert_cast<std::string>();
	//system(cmd.c_str());
	FILE* pipe = _popen(cmd.c_str(), "r");
	if (!pipe) return "ERROR";
	char buffer[128];
	std::string result = "";
	while(!feof(pipe)) {
		if(fgets(buffer, 128, pipe) != NULL)
			result += buffer;
	}
	_pclose(pipe);
	return result;
}

std::wstring s2ws(const std::string& s)
{
	int len;
	int slength = (int)s.length() + 1;
	len = MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, 0, 0); 
	wchar_t* buf = new wchar_t[len];
	MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, buf, len);
	std::wstring r(buf);
	delete[] buf;
	return r;
}

FB::DOM::DocumentPtr document;
BracExtenssionProviderAPI * brac_extenssion_provider_api = NULL;

void onReturn(const std::string& path) {

	if (path.empty())
		return;

	//FB::DOM::ElementPtr ele = document->getElementById("brac_filepath");
	//ele->setInnerHTML(path);

	std::string root_dir = "D:\\faham\\tim\\bric-n-brac\\chrome-extension\\";
	//TCHAR temp_path_buffer[MAX_PATH];
	//DWORD ret_val = GetTempPath(MAX_PATH, temp_path_buffer);
	//std::string temp_path_buffer_std = std::string((CT2CA)CString(temp_path_buffer));
	//
	//if (ret_val > MAX_PATH)
	//{
	//	brac_extenssion_provider_api->echo("GetTempPath failed, path length is too large.");
	//	return;
	//}
	//
	//if (ret_val == 0)
	//{
	//	brac_extenssion_provider_api->echo("GetTempPath failed");
	//	return;
	//}
	//
	//brac_extenssion_provider_api->echo(temp_path_buffer_std);
	
	//std::string command = "erase /F /Q /S " + root_dir + "temp";

	//std::string app = root_dir + "bin\\7za.exe";
	//std::string command = " e -o" + root_dir + "temp \"" + path + "\" brac.xml";
	#define MAX_BUFFER	1024
	std::string command = root_dir + "bin\\7za.exe e -y -o" + root_dir + "temp \"" + path + "\" brac.xml";
	std::string content;

	//STARTUPINFOW si;
	//PROCESS_INFORMATION pi;
	//
	//ZeroMemory(&si, sizeof(si));
	//si.cb = sizeof(si);
	//ZeroMemory(&pi, sizeof(pi));

	//if (!CreateProcessW(s2ws(app).c_str(), (LPWSTR)command.c_str(), NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
	//	out = "Couldn't run the command";
	//} else {
	//	WaitForSingleObject(pi.hProcess, INFINITE);
	//	CloseHandle(pi.hProcess);
	//	CloseHandle(pi.hThread);

		system(command.c_str());

		std::ifstream infile;
		infile.open(root_dir + "temp\\brac.xml");

		if (infile.fail()) {
			content = "Error, file could not be opened";
			return;
		} else {
			std::string str_line;
			while(!infile.eof())
			{
				getline(infile, str_line);
				content += str_line + "\n";
			}
			infile.close();
		}
	//}

	command = std::string("rmdir /S /Q ") + root_dir + "temp";
	system(command.c_str());
	brac_extenssion_provider_api->fire_bracfileselect(path, content);

	return;

	//extractFile("brac.xml", "D:\\faham\\tim\\bric-n-brac\\temp\\mybrac.zip"
	//	, false, NULL, "D:\\faham\\tim\\bric-n-brac\\temp");

	//ShellExecute(NULL, TEXT("D:\\faham\\tim\\bric-n-brac\\browser-ext\\google-chrome\\screenshot\\bin\\7za.exe"), TEXT("diskmgmt.msc"), NULL, NULL, SW_SHOWNORMAL);
}

FB::variant BracExtenssionProviderAPI::selectBracFile(const FB::variant& msg) {
	document = m_host->getDOMDocument();
	brac_extenssion_provider_api = this;

	DialogManager* dlg_mgr = DialogManager::get();
	FB::PluginWindow* wh = m_plugin.lock()->GetWindow();
	dlg_mgr->OpenFileDialog(m_host, wh, "", "Brac files (*.brac)|*.brac|All files (*.*)|*.*|", &onReturn);
	
	return "done!";
}

///////////////////////////////////////////////////////////////////////////////
/// @fn BracExtenssionProviderPtr BracExtenssionProviderAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////

BracExtenssionProviderPtr BracExtenssionProviderAPI::getPlugin()
{
    BracExtenssionProviderPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

// Read/Write property testString
std::string BracExtenssionProviderAPI::get_testString()
{
    return m_testString;
}

void BracExtenssionProviderAPI::set_testString(const std::string& val)
{
    m_testString = val;
}

// Read-only property version
std::string BracExtenssionProviderAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void BracExtenssionProviderAPI::testEvent()
{
    fire_test();
}
