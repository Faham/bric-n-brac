/**********************************************************\

  Auto-generated LocalExecuteAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "LocalExecuteAPI.h"

#include <string>
#include <iostream>
#include <stdio.h>
#include "DialogManager.h"

///////////////////////////////////////////////////////////////////////////////
/// @fn FB::variant LocalExecuteAPI::echo(const FB::variant& msg)
///
/// @brief  Echos whatever is passed from Javascript.
///         Go ahead and change it. See what happens!
///////////////////////////////////////////////////////////////////////////////
FB::variant LocalExecuteAPI::echo(const FB::variant& msg)
{
    static int n(0);
    fire_echo("So far, you clicked this many times: ", n++);

    // return "foobar";
    return msg;
}

FB::variant LocalExecuteAPI::systemCall(const FB::variant& msg)
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

void onReturn(const std::string& path) {
	return;
}

FB::variant LocalExecuteAPI::selectBracFile(const FB::variant& msg) {
	DialogManager* dlg_mgr = DialogManager::get();
	FB::PluginWindow* wh = m_plugin.lock()->GetWindow();
	dlg_mgr->OpenFolderDialog(m_host, wh, &onReturn);
	return "done!";
}

///////////////////////////////////////////////////////////////////////////////
/// @fn LocalExecutePtr LocalExecuteAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////
LocalExecutePtr LocalExecuteAPI::getPlugin()
{
    LocalExecutePtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

// Read/Write property testString
std::string LocalExecuteAPI::get_testString()
{
    return m_testString;
}

void LocalExecuteAPI::set_testString(const std::string& val)
{
    m_testString = val;
}

// Read-only property version
std::string LocalExecuteAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void LocalExecuteAPI::testEvent()
{
    fire_test();
}
