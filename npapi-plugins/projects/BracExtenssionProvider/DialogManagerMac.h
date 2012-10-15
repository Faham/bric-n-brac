#ifndef DialogManagerMac_h__
#define DialogManagerMac_h__

#include <boost/noncopyable.hpp>
#include <string>

#include "DialogManager.h"

class DialogManagerMac : public DialogManager
{
public:
    void OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb);
	void OpenFileDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const std::string& path, const std::string& filter, const PathCallback& cb);

protected:
    DialogManagerMac() {};
    ~DialogManagerMac() {};
    void _showFolderDialog(FB::PluginWindow* win, const PathCallback& cb);
	void _showFileDialog(FB::PluginWindow* win, const std::string& path, const std::string& filter, const PathCallback& cb);
    friend class DialogManager;
};
#endif // DialogManagerMac_h__
