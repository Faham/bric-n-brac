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
#include <ctime>
#include "jsonxx.h"

#include "pugixml.h"

namespace jsonxx {
	extern bool parse_string(std::istream& input, std::string* value);
	extern bool parse_number(std::istream& input, number* value);
	extern bool match(const char* pattern, std::istream& input);
}

std::string system_call (const std::string & cmd) {
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

FB::variant BracExtenssionProviderAPI::systemCall(const FB::variant& msg)
{
	std::string cmd = msg.convert_cast<std::string>();
	m_syscall_commands.push_back(cmd);
	std::string res = system_call(cmd);
	m_syscall_results.push_back(res);
	return res;
}

FB::variant BracExtenssionProviderAPI::getLogMessage(const FB::variant& msg)
{
	int max_id = m_log_messages.size() - 1;
	if (msg.empty() && max_id >= 0)
		return m_log_messages[max_id];
	else {
		int msg_id = msg.convert_cast<int>();
		if (msg_id >= 0 && msg_id <= max_id) 
			return m_log_messages[max_id - msg_id];
	}

	return "Invalid index";
}

FB::variant BracExtenssionProviderAPI::getCalledCommand(const FB::variant& msg)
{
	int max_id = m_syscall_commands.size() - 1;
	if (msg.empty() && max_id >= 0)
		return m_syscall_commands[max_id];
	else {
		int msg_id = msg.convert_cast<int>();
		if (msg_id >= 0 && msg_id <= max_id) 
			return m_syscall_commands[max_id - msg_id];
	}

	return "Invalid index";
}

FB::variant BracExtenssionProviderAPI::getSysCallResult(const FB::variant& msg)
{
	int max_id = m_syscall_results.size() - 1;
	if (msg.empty() && max_id >= 0)
		return m_syscall_results[max_id];
	else {
		int msg_id = msg.convert_cast<int>();
		if (msg_id >= 0 && msg_id <= max_id) 
			return m_syscall_results[max_id - msg_id];
	}

	return "Invalid index";
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
	BracExtenssionProviderAPI * api_ptr = brac_extenssion_provider_api;

	if (path.empty()) {
		api_ptr->log("No brac file found at: " + path);
		return;
	}

	std::string root_dir = api_ptr->getExtensionPath();
	std::string command = "cd /d \"" + root_dir + "\" & bin\\7za.exe e -y \"" + path + "\" brac.xml";
	api_ptr->systemCall(command);

	std::string content;

	std::string brac_path = root_dir + "\\brac.xml";
	pugi::xml_document brac_xml;
	std::stringstream out_stream(std::stringstream::out);
	pugi::xml_parse_result res = brac_xml.load_file(brac_path.c_str());
	if (!res) {
		api_ptr->log("Couldn't load the brac.xml at " + brac_path + ": " + res.description());
		return;
	}
	brac_xml.save(out_stream);
	content = out_stream.str();

	command = std::string("del /F /Q \"") + root_dir + "\\brac.xml\"";
	api_ptr->systemCall(command);

	brac_extenssion_provider_api->fire_bracfileselect(path, content);
	return;
}

FB::variant BracExtenssionProviderAPI::selectBracFile(const FB::variant& msg) {
	document = m_host->getDOMDocument();
	brac_extenssion_provider_api = this;

	DialogManager* dlg_mgr = DialogManager::get();
	FB::PluginWindow* wh = m_plugin.lock()->GetWindow();
	dlg_mgr->OpenFileDialog(m_host, wh, "", "Zip files (*.zip)|*.zip|All files (*.*)|*.*|", &onReturn);
	
	return "done!";
}

std::vector<std::string> split(const std::string &s, char delim) {
	std::vector<std::string> elems;
	std::stringstream ss(s);
	std::string item;
	while(std::getline(ss, item, delim)) {
		elems.push_back(item);
	}
	return elems;
}

FB::variant BracExtenssionProviderAPI::saveToBracFile(const FB::variant& msg) {
	std::string command = "";

	if (msg.empty())
		log("Received message is empty.");

	std::string msg_str = msg.cast<std::string>();
	std::istringstream input(msg_str);
	jsonxx::Object o;
	if(!jsonxx::Object::parse(input, o))
		log("Couldn't parse the JSON message.");
	
	if(!o.has<jsonxx::Object>("brac"))
		log("Couldn't find the brac JSON object.");

	jsonxx::Object & brac_info = o.get<jsonxx::Object>("brac");
	jsonxx::Object & bric_info = o.get<jsonxx::Object>("bric");
	std::string path = brac_info.get<std::string>("filepath");

	command = "cd /d \"" + m_extension_path + "\" & bin\\7za.exe e -y \"" + path + "\" brac.xml";
	systemCall(command);

	std::string in_file = m_extension_path + "\\brac.xml";

	pugi::xml_document brac_xml;
	pugi::xml_parse_result result = brac_xml.load_file(in_file.c_str());
	if (!result)
		log(result.description());
	pugi::xml_node brac_node = brac_xml.child("brac");
	pugi::xml_object_range<pugi::xml_named_node_iterator> brics = brac_node.children("bric");
	pugi::xml_named_node_iterator last_bric_itr;
	for (pugi::xml_named_node_iterator itr = brics.begin(); itr != brics.end(); ++itr)
		last_bric_itr = itr;
	pugi::xml_node & last_bric = *last_bric_itr;

	int new_brac_num = 1 + last_bric.attribute("id").as_int();
	pugi::xml_node bric_node = brac_node.insert_child_after("bric", last_bric);
	bric_node.append_attribute("id").set_value(new_brac_num);
	bric_node.append_attribute("resolution").set_value(bric_info.get<std::string>("resolution").c_str());
	bric_node.append_attribute("position").set_value(bric_info.get<std::string>("position").c_str());
	bric_node.append_attribute("rotate").set_value(bric_info.get<std::string>("rotation").c_str());
	bric_node.append_attribute("scale").set_value(bric_info.get<std::string>("scale").c_str());
	bric_node.append_attribute("order").set_value(bric_info.get<std::string>("order").c_str());
	bric_node.append_attribute("alpha").set_value(bric_info.get<std::string>("alpha").c_str());
	bric_node.append_attribute("revision").set_value(1);
	bric_node.append_child(pugi::node_pcdata).set_value(bric_info.get<std::string>("comment").c_str());

	brac_node.attribute("name").set_value(brac_info.get<std::string>("name").c_str());
	brac_node.attribute("artist").set_value(brac_info.get<std::string>("artist").c_str());
	brac_node.attribute("tags").set_value(brac_info.get<std::string>("tags").c_str());
	
	pugi::xml_object_range<pugi::xml_node_iterator> children = brac_node.children();
	for (pugi::xml_node_iterator itr = children.begin(); itr != children.end(); ++itr)
		if (itr->type() == pugi::xml_node_type::node_pcdata) {
			brac_node.remove_child(*itr);
			itr = children.begin();
		}
	brac_node.append_child(pugi::node_pcdata).set_value(brac_info.get<std::string>("comment").c_str());

	std::string out_file = m_extension_path + "\\brac.xml";
	
	if (!brac_xml.save_file(out_file.c_str()))
		log("Error occurred while creating the new brac file: " + out_file);

	command = "cd /d \"" + m_extension_path + "\" & bin\\7za.exe u \"" + path + "\" brac.xml & del /F /Q brac.xml";
	systemCall(command);

	char buf[33];
	itoa(new_brac_num, buf, 10);
	std::string new_bric_path = m_extension_path + "\\temp\\bric." + buf;
	command = "mkdir \"" + new_bric_path + "\"";
	systemCall(command);

	pugi::xml_document bric_xml;
	pugi::xml_node root_node = bric_xml.append_child("bric");
	root_node.append_attribute("version").set_value("1.0");
	root_node.append_attribute("title").set_value(bric_info.get<std::string>("title").c_str());
	root_node.append_attribute("timeinterval").set_value(bric_info.get<std::string>("timeInterval").c_str());
	root_node.append_attribute("startdate").set_value(bric_info.get<std::string>("startDate").c_str());
	root_node.append_attribute("url").set_value(bric_info.get<std::string>("url").c_str());
	root_node.append_attribute("region").set_value(bric_info.get<std::string>("region").c_str());
	root_node.append_attribute("tags").set_value(bric_info.get<std::string>("tags").c_str());

	pugi::xml_node snapshot_node = root_node.append_child("snapshot");
	snapshot_node.append_attribute("revision").set_value("1");
	
	time_t t = time(0);   // get current time
	struct tm * now = localtime( &t );
	char buf2[50];
	sprintf(buf2, "%d-%02d-%02d %02d:%02d:%02d"
		, now->tm_year + 1900
		, now->tm_mon + 1
		, now->tm_mday
		, now->tm_hour
		, now->tm_min
		, now->tm_sec);
	
	snapshot_node.append_attribute("date").set_value(buf2);

	std::string new_bric_filepath = new_bric_path + "\\bric.xml";
	std::string bric_screenshot = new_bric_path + "\\1.png";

	if (!bric_xml.save_file(new_bric_filepath.c_str()))
		log("Error occurred while creating the new bric file: " + new_bric_filepath);

	std::vector<std::string> brac_resolution = split(brac_info.get<std::string>("resolution"), ' ');
	if (brac_resolution.size() != 2)
		log("Brac resolution should be a pair of integer numbers, separated by space character.");

	std::vector<std::string> bric_region = split(bric_info.get<std::string>("region"), ' ');
	if (bric_region.size() != 4)
		log("Bric region should be four integer numbers, separated by space character.");
	
	/*
		cutycapt.exe 
			--print-backgrounds=on 
			--javascript=on 
			--plugins=on 
			--js-can-access-clipboard=on 
			--min-width=1024 
			--min-height=768 
			--url=http://www.google.ca/ 
			--out-format=png 
			--out="D:\faham\tim\bric-n-brac\chrome-extension\temp\bric.1\1.png"
	*/

	command = "cd /d \"" + m_extension_path + "\" & bin\\cutycapt.exe"
		+ " --print-backgrounds=on --javascript=on --plugins=on --js-can-access-clipboard=on"
		+ " --min-width=" + brac_resolution[0]
		+ " --min-height=" + brac_resolution[1]
		+ " --url=" + bric_info.get<std::string>("url")
		+ " --out-format=png"
		+ " --out=\"" + bric_screenshot + "\"";
	systemCall(command);

	command = "cd /d \"" + m_extension_path + "\" & bin\\convert.exe"
		+ " \"" + bric_screenshot + "\""
		+ " -crop " + bric_region[2] + "x" + bric_region[3] + "+" + bric_region[0] + "+" + bric_region[1]
		+ " \"" + bric_screenshot + "\"";
	systemCall(command);

	command = "cd /d \"" + m_extension_path + "\" & bin\\7za.exe a \"" + path + "\" \"" + new_bric_path + "\"";
	systemCall(command);

	command = "rmdir /S /Q \"" + m_extension_path + "\\temp\"";
	systemCall(command);
	fire_cleanup();

	return "done!";
}

FB::variant BracExtenssionProviderAPI::setExtensionPath(const FB::variant& msg) {
	m_extension_path = msg.cast<std::string>();
	size_t index = 0;
	char * env_var = "LOCALAPPDATA";
	index = m_extension_path.find(env_var, index);
	if (std::string::npos != index)
		m_extension_path.replace(index - 1, std::strlen(env_var) + 2, getenv(env_var));
	log("Extension path is set to: " + m_extension_path);
	return m_extension_path;
}

BracExtenssionProviderPtr BracExtenssionProviderAPI::getPlugin()
{
    BracExtenssionProviderPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

std::string BracExtenssionProviderAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}
