#ifndef DialogManager_h__
#define DialogManager_h__

#include <boost/noncopyable.hpp>
#include <boost/function.hpp>
#include "BrowserHost.h"

typedef boost::function<void (const std::string&)> PathCallback;

namespace FB { class PluginWindow; }

class DialogManager
{
public:
    static DialogManager* get();
    virtual void OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb) = 0;
	virtual void OpenFileDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const std::string& path, const std::string& filter, const PathCallback& cb) = 0;

protected:
    DialogManager() {}
    virtual ~DialogManager() {}
};

#endif // DialogManager_h__
