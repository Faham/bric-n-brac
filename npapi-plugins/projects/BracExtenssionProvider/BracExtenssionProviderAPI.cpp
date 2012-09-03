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

#include <sstream>
#include "jsonxx.h"

#include "pugixml.hpp"

namespace jsonxx {
	extern bool parse_string(std::istream& input, std::string* value);
	extern bool parse_number(std::istream& input, number* value);
	extern bool match(const char* pattern, std::istream& input);
}

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

FB::variant BracExtenssionProviderAPI::saveToBracFile(const FB::variant& msg) {
	std::string root_dir = "D:\\faham\\tim\\bric-n-brac\\chrome-extension\\";
	#define MAX_BUFFER	1024
	std::string command = "";

	std::string msg_str = msg.cast<std::string>();
	std::istringstream input(msg_str);
	jsonxx::Object o;
	if(!jsonxx::Object::parse(input, o))
		return "Couldn't parse the JSON message.";
	
	if(!o.has<jsonxx::Object>("brac"))
		return "Couldn't find the brac JSON object.";

	jsonxx::Object & brac_info = o.get<jsonxx::Object>("brac");
	jsonxx::Object & bric_info = o.get<jsonxx::Object>("bric");
	std::string path = brac_info.get<std::string>("filepath");

	command = root_dir + "bin\\7za.exe e -y -o" + root_dir + "temp \"" + path + "\" brac.xml";
	system(command.c_str());

	std::string in_file = root_dir + "temp\\brac.xml";

	pugi::xml_document brac;
	pugi::xml_parse_result result = brac.load_file(in_file.c_str());
	if (!result)
		return result.description();
	int new_brac_num = 1 + brac.child("brac").last_child().attribute("id").as_int();
	pugi::xml_node new_bric = brac.child("brac").append_child("bric");
	new_bric.append_attribute("id").set_value(new_brac_num);
	new_bric.append_attribute("resolution").set_value(bric_info.get<std::string>("resolution").c_str());
	new_bric.append_attribute("position").set_value(bric_info.get<std::string>("position").c_str());
	new_bric.append_attribute("rotate").set_value(bric_info.get<std::string>("rotation").c_str());
	new_bric.append_attribute("scale").set_value(bric_info.get<std::string>("scale").c_str());
	new_bric.append_attribute("order").set_value(bric_info.get<std::string>("order").c_str());
	new_bric.append_attribute("alpha").set_value(bric_info.get<std::string>("alpha").c_str());
	new_bric.append_attribute("revision").set_value(0);
	new_bric.set_value(bric_info.get<std::string>("comment").c_str());

	std::string out_file = root_dir + "temp\\brac.xml";
	
	if (!brac.save_file(out_file.c_str()))
		return "Error occurred while creating the new brac file: " + out_file;

	command = root_dir + "bin\\7za.exe u \"" + path + "\" " + root_dir + "temp\\brac.xml";
	system(command.c_str());

	char buf[33];
	itoa(new_brac_num, buf, 10);
	std::string new_bric_path = root_dir + "temp\\bric." + buf;
	command = "mkdir \"" + new_bric_path + "\"";
	system(command.c_str());

	pugi::xml_document bric_xml;
	pugi::xml_node bric_node = bric_xml.append_child("bric");
	bric_node.append_attribute("version").set_value("1.0");
	bric_node.append_attribute("title").set_value(bric_info.get<std::string>("title").c_str());
	bric_node.append_attribute("timeinterval").set_value(bric_info.get<std::string>("timeInterval").c_str());
	bric_node.append_attribute("startdate").set_value(bric_info.get<std::string>("startDate").c_str());
	bric_node.append_attribute("url").set_value(bric_info.get<std::string>("url").c_str());
	bric_node.append_attribute("region").set_value(bric_info.get<std::string>("region").c_str());
	bric_node.append_attribute("tags").set_value(bric_info.get<std::string>("tags").c_str());

	std::string new_bric_filepath = new_bric_path + "\\bric.xml";

	if (!bric_xml.save_file(new_bric_filepath.c_str()))
		return "Error occurred while creating the new bric file: " + new_bric_filepath;

	command = root_dir + "bin\\7za.exe a \"" + path + "\" \"" + new_bric_path + "\"";
	system(command.c_str());

	command = std::string("rmdir /S /Q ") + root_dir + "temp";
	system(command.c_str());
	fire_cleanup();

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
