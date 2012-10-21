#if defined _WIN32

#ifndef DialogManagerWin_h__
#define DialogManagerWin_h__

#include <boost/noncopyable.hpp>
#include <string>

#include "DialogManager.h"

class DialogManagerWin : public DialogManager
{
public:
    void OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb);
	void OpenFileDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const std::string& path, const std::string& filter, const PathCallback& cb);

protected:
    DialogManagerWin() {};
    ~DialogManagerWin() {};
    void _showFileDialog(HWND wnd, const std::string& path, const std::string& filter, const PathCallback& cb);
    void _showFolderDialog(HWND wnd, const PathCallback& cb);
    friend class DialogManager;
};
#endif // DialogManagerWin_h__

#endif