
#include "win_common.h"
#include <commdlg.h>
#include <string>
#include <boost/thread.hpp>
#include "utf8_tools.h"
#include "Win/PluginWindowlessWin.h"
#include "Win/PluginWindowWin.h"

#include "DialogManagerWin.h"
#include <shlobj.h>
#include "precompiled_headers.h" // Anything before this is PCH on windows

DialogManager* DialogManager::get()
{
    static DialogManagerWin inst;
    return &inst;
}

void DialogManagerWin::OpenFolderDialog(const FB::BrowserHostPtr& host, FB::PluginWindow* win, const PathCallback& cb) {
    FB::PluginWindowWin* wndWin = dynamic_cast<FB::PluginWindowWin*>(win);
    FB::PluginWindowlessWin* wndlessWin = dynamic_cast<FB::PluginWindowlessWin*>(win);

    HWND browserWindow = wndWin ? wndWin->getBrowserHWND() : wndlessWin->getHWND();
    boost::thread dlgThread(&DialogManagerWin::_showFolderDialog, this, browserWindow, cb);
}

void DialogManagerWin::_showFolderDialog(HWND wnd, const PathCallback& cb) {
    BROWSEINFO bi = { 0 };
    bi.lpszTitle = _T("Select a folder to import");
    bi.hwndOwner = wnd;
    LPITEMIDLIST pidl = SHBrowseForFolder ( &bi );
    if ( pidl != 0 )
    {
        std::wstring out;
        // get the name of the folder
        TCHAR path[MAX_PATH];
        if ( SHGetPathFromIDList ( pidl, path ) )
        {
            out = path;
        }

        // free memory used
        IMalloc * imalloc = 0;
        if ( SUCCEEDED( SHGetMalloc ( &imalloc )) )
        {
            imalloc->Free ( pidl );
            imalloc->Release ( );
        }
        cb(FB::wstring_to_utf8(path));
    } else {
        cb("");
    }
}
void DialogManagerWin::_showFileDialog(HWND wnd, const std::string& path, const std::string& filter, const PathCallback& cb)
{
    wchar_t Filestring[256];
    std::string out;

    std::wstring wFilter(FB::utf8_to_wstring(filter));
    std::wstring wPath(FB::utf8_to_wstring(filter));

    OPENFILENAME opf;
    opf.hwndOwner = wnd;
    opf.lpstrFilter = wFilter.c_str();
    opf.lpstrCustomFilter = 0;
    opf.nMaxCustFilter = 0L;
    opf.nFilterIndex = 1L;
    opf.lpstrFile = Filestring;
    opf.lpstrFile[0] = '\0';
    opf.nMaxFile = 256;
    opf.lpstrFileTitle = 0;
    opf.nMaxFileTitle=50;
    opf.lpstrInitialDir = wPath.c_str();
    opf.lpstrTitle = L"Choose directory to import";
    opf.nFileOffset = 0;
    opf.nFileExtension = 0;
    opf.lpstrDefExt = L"*.*";
    opf.lpfnHook = NULL;
    opf.lCustData = 0;
    opf.Flags = (OFN_PATHMUSTEXIST | OFN_OVERWRITEPROMPT) & ~OFN_ALLOWMULTISELECT;
    opf.lStructSize = sizeof(OPENFILENAME);

    if(GetOpenFileName(&opf))
    {
        out = FB::wstring_to_utf8(std::wstring(opf.lpstrFile));
    }

    cb(out);
}
