/**********************************************************\

  Auto-generated LocalExecuteAPI.h

\**********************************************************/

#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "LocalExecute.h"

#ifndef H_LocalExecuteAPI
#define H_LocalExecuteAPI

class LocalExecuteAPI : public FB::JSAPIAuto
{
public:
    ////////////////////////////////////////////////////////////////////////////
    /// @fn LocalExecuteAPI::LocalExecuteAPI(const LocalExecutePtr& plugin, const FB::BrowserHostPtr host)
    ///
    /// @brief  Constructor for your JSAPI object.
    ///         You should register your methods, properties, and events
    ///         that should be accessible to Javascript from here.
    ///
    /// @see FB::JSAPIAuto::registerMethod
    /// @see FB::JSAPIAuto::registerProperty
    /// @see FB::JSAPIAuto::registerEvent
    ////////////////////////////////////////////////////////////////////////////
    LocalExecuteAPI(const LocalExecutePtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        registerMethod("echo",      make_method(this, &LocalExecuteAPI::echo));
        registerMethod("testEvent", make_method(this, &LocalExecuteAPI::testEvent));
        
        // Read-write property
        registerProperty("testString",
                         make_property(this,
                                       &LocalExecuteAPI::get_testString,
                                       &LocalExecuteAPI::set_testString));
        
        // Read-only property
        registerProperty("version",
                         make_property(this,
                                       &LocalExecuteAPI::get_version));
		registerMethod("systemCall",      make_method(this, &LocalExecuteAPI::systemCall));
		registerMethod("selectBracFile",      make_method(this, &LocalExecuteAPI::selectBracFile));
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn LocalExecuteAPI::~LocalExecuteAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~LocalExecuteAPI() {};

    LocalExecutePtr getPlugin();

    // Read/Write property ${PROPERTY.ident}
    std::string get_testString();
    void set_testString(const std::string& val);

    // Read-only property ${PROPERTY.ident}
    std::string get_version();

    // Method echo
	FB::variant echo(const FB::variant& msg);
    
	FB::variant systemCall(const FB::variant& msg);
	FB::variant selectBracFile(const FB::variant& msg);
    
    // Event helpers
    FB_JSAPI_EVENT(test, 0, ());
    FB_JSAPI_EVENT(echo, 2, (const FB::variant&, const int));

    // Method test-event
    void testEvent();

private:
    LocalExecuteWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;

    std::string m_testString;
};

#endif // H_LocalExecuteAPI

