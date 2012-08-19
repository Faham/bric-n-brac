#ifndef DialogManagerMac_h__
#define DialogManagerMac_h__

#include <boost/noncopyable.hpp>
#include <string>

#include "DialogManager.h"

class DialogManagerMac : public DialogManager
{
public:
    void OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb);
    void _showFolderDialog(FB::PluginWindow* win, const PathCallback& cb);

protected:
    DialogManagerMac() {};
    ~DialogManagerMac() {};
    friend class DialogManager;
};
#endif // DialogManagerMac_h__
