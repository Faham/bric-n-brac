
#include <string>
#include <boost/thread.hpp>
#include <AppKit/AppKit.h>
#include <Cocoa/Cocoa.h>
#include "logging.h"

#include "DialogManagerMac.h"
#include "BrowserHost.h"

DialogManager* DialogManager::get()
{
    static DialogManagerMac inst;
    return &inst;
}


void DialogManagerMac::OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb)
{
    host->ScheduleOnMainThread(boost::shared_ptr<DialogManagerMac>(), boost::bind(&DialogManagerMac::_showFolderDialog, this, win, cb));
}

void DialogManagerMac::OpenFileDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const std::string& path, const std::string& filter, const PathCallback& cb)
{
}

void DialogManagerMac::_showFolderDialog(FB::PluginWindow* win, const PathCallback& cb)
{
    FBLOG_INFO("DialogManagerMac", "Showing folder dialog");
    std::string out;
    int result;
    NSAutoreleasePool* pool = [NSAutoreleasePool new];
    NSOpenPanel *oPanel = [NSOpenPanel openPanel];
    
    [oPanel setAllowsMultipleSelection:NO];
    [oPanel setCanChooseFiles:NO];
    [oPanel setCanChooseDirectories:YES];
    result = [oPanel runModalForDirectory:nil
                                     file:nil types:nil];
    
    if (result == NSOKButton) {
        NSArray *filesToOpen = [oPanel filenames];
        NSString *aFile = [filesToOpen objectAtIndex:0];
        out = [aFile cStringUsingEncoding:[NSString defaultCStringEncoding]];
        FBLOG_INFO("DialogManagerMac", "Folder selected: " << out);
    }
    [pool release];
    cb(out);
}
