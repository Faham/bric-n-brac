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
    ////////////////////////////////////////////////////////////////////////////
    /// @fn BracExtenssionProviderAPI::BracExtenssionProviderAPI(const BracExtenssionProviderPtr& plugin, const FB::BrowserHostPtr host)
    ///
    /// @brief  Constructor for your JSAPI object.
    ///         You should register your methods, properties, and events
    ///         that should be accessible to Javascript from here.
    ///
    /// @see FB::JSAPIAuto::registerMethod
    /// @see FB::JSAPIAuto::registerProperty
    /// @see FB::JSAPIAuto::registerEvent
    ////////////////////////////////////////////////////////////////////////////
    BracExtenssionProviderAPI(const BracExtenssionProviderPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        registerMethod("echo", make_method(this, &BracExtenssionProviderAPI::echo));
        registerMethod("testEvent", make_method(this, &BracExtenssionProviderAPI::testEvent));
        
        // Read-write property
        registerProperty("testString", make_property(this,
                                       &BracExtenssionProviderAPI::get_testString,
                                       &BracExtenssionProviderAPI::set_testString));
        
        // Read-only property
        registerProperty("version", make_property(this, &BracExtenssionProviderAPI::get_version));
		registerMethod("systemCall", make_method(this, &BracExtenssionProviderAPI::systemCall));
		registerMethod("selectBracFile", make_method(this, &BracExtenssionProviderAPI::selectBracFile));
		registerMethod("saveToBracFile", make_method(this, &BracExtenssionProviderAPI::saveToBracFile));
		registerMethod("setExtensionPath", make_method(this, &BracExtenssionProviderAPI::setExtensionPath));
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn BracExtenssionProviderAPI::~BracExtenssionProviderAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~BracExtenssionProviderAPI() {};

    BracExtenssionProviderPtr getPlugin();

    // Read/Write property ${PROPERTY.ident}
    std::string get_testString();
    void set_testString(const std::string& val);

    // Read-only property ${PROPERTY.ident}
    std::string get_version();

    // Method echo
    FB::variant echo(const FB::variant& msg);
    
	FB::variant systemCall(const FB::variant& msg);
	FB::variant selectBracFile(const FB::variant& msg);
	FB::variant saveToBracFile(const FB::variant& msg);
	FB::variant setExtensionPath(const FB::variant& msg);

	// Event helpers
    FB_JSAPI_EVENT(test, 0, ());
    FB_JSAPI_EVENT(echo, 2, (const FB::variant&, const int));
	FB_JSAPI_EVENT(bracfileselect, 2, (const FB::variant&, const FB::variant&));
	FB_JSAPI_EVENT(cleanup, 0, ());

	// Method test-event
    void testEvent();

	FB::BrowserHostPtr getBrowserHost() { return m_host; }

	const std::string & getExtensionPath() const { return m_extension_path; }

private:
    BracExtenssionProviderWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;

    std::string m_testString;
	std::string m_extension_path;
};

#endif // H_BracExtenssionProviderAPI

