/**********************************************************\

  Auto-generated BracExtenssionProviderAPI.h

\**********************************************************/

#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "BracExtenssionProvider.h"

#ifndef H_BracExtenssionProviderAPI
#define H_BracExtenssionProviderAPI

class BracExtenssionProviderAPI : public FB::JSAPIAuto
{
public:
    BracExtenssionProviderAPI(const BracExtenssionProviderPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        registerProperty("version", make_property(this, &BracExtenssionProviderAPI::get_version));
		registerMethod("systemCall", make_method(this, &BracExtenssionProviderAPI::systemCall));
		registerMethod("getLogMessage", make_method(this, &BracExtenssionProviderAPI::getLogMessage));
		registerMethod("getCalledCommand", make_method(this, &BracExtenssionProviderAPI::getCalledCommand));
		registerMethod("getSysCallResult", make_method(this, &BracExtenssionProviderAPI::getSysCallResult));
		registerMethod("selectBracFile", make_method(this, &BracExtenssionProviderAPI::selectBracFile));
		registerMethod("saveToBracFile", make_method(this, &BracExtenssionProviderAPI::saveToBracFile));
		registerMethod("setExtensionPath", make_method(this, &BracExtenssionProviderAPI::setExtensionPath));
    }

    virtual ~BracExtenssionProviderAPI() {};

    BracExtenssionProviderPtr getPlugin();

    // Read-only property ${PROPERTY.ident}
    std::string get_version();

	FB::variant systemCall(const FB::variant& msg);
	FB::variant getLogMessage(const FB::variant& msg);
	FB::variant getCalledCommand(const FB::variant& msg);
	FB::variant getSysCallResult(const FB::variant& msg);
	FB::variant selectBracFile(const FB::variant& msg);
	FB::variant saveToBracFile(const FB::variant& msg);
	FB::variant setExtensionPath(const FB::variant& msg);

	// Event helpers
    FB_JSAPI_EVENT(echo, 1, (const FB::variant&));
	FB_JSAPI_EVENT(bracfileselect, 2, (const FB::variant&, const FB::variant&));
	FB_JSAPI_EVENT(cleanup, 0, ());

	FB::BrowserHostPtr getBrowserHost() { return m_host; }
	const std::string & getExtensionPath() const { return m_extension_path; }

	void log(const std::string & message) { m_log_messages.push_back(message); }

private:
    BracExtenssionProviderWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;
	std::string m_extension_path;
	std::vector<std::string> m_syscall_results;
	std::vector<std::string> m_syscall_commands;
	std::vector<std::string> m_log_messages;
};

#endif // H_BracExtenssionProviderAPI

