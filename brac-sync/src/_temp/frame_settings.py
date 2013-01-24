#!/usr/bin/env python

import wx, os
from wxbrac_sync import wxFrameSettings
import wx.lib.agw.multidirdialog as mdd
import entryutils

#===============================================================================

class FrameSettings(wxFrameSettings):

#-------------------------------------------------------------------------------

	def __init__(self, brac_sync):
		wxFrameSettings.__init__(self, None)
		self.bracsync = brac_sync
		self.entries = self.bracsync.entries[:]
		self.loadEntries()

#-------------------------------------------------------------------------------

	def loadEntries(self):
		self.m_listCtrl_selected.ClearAll()
		w = self.m_listCtrl_selected.Size.width
		self.m_listCtrl_selected.InsertColumn(0, "Path")
		self.m_listCtrl_selected.SetColumnWidth(0, w * 0.7)

		self.m_listCtrl_selected.InsertColumn(1, "Recursive")
		self.m_listCtrl_selected.SetColumnWidth(1, w * 0.2)

		self.imgList = self.m_genericDirCtrl_select.GetTreeCtrl().GetImageList()
		self.m_listCtrl_selected.SetImageList(self.imgList, wx.IMAGE_LIST_SMALL)
		
		self.icons = {'dir': 0, 'file': 7, 'false': 2, 'true': 3}
		
		for i, e in enumerate(self.entries):
			index = self.m_listCtrl_selected.InsertStringItem(0, e['path'], self.icons[e['type']])
			if e['type'] == 'dir':
				self.m_listCtrl_selected.SetStringItem(index, 1, '', self.icons[str(e['recursive']).lower()])
			self.m_listCtrl_selected.SetItemData(index, i)
	
#-------------------------------------------------------------------------------

	def OnCheckBoxStart( self, event ):
		return
		
		if self.m_checkBox_startup.IsChecked():
			startup_path = os.path.join(os.environ['APPDATA'], r"Microsoft\Windows\Start Menu\Programs\Startup")
			path = os.path.join(startup_path, "BracSync.lnk")
			shell = Dispatch('WScript.Shell')
			shortcut = shell.CreateShortCut(path)
			shortcut.Targetpath = r"P:\Media\Media Player Classic\mplayerc.exe"
			shortcut.WorkingDirectory = r"P:\Media\Media Player Classic"
			shortcut.IconLocation = r"P:\Media\Media Player Classic\mplayerc.exe"
			shortcut.save()
	
#-------------------------------------------------------------------------------

	def OnButtonClickAdd( self, event ):
		path = self.m_genericDirCtrl_select.GetPath()
		
		for i, e in enumerate(self.entries):
			if path == e['path']:
				dlg = wx.MessageDialog(self, 'Path is already added', 'Error', wx.OK | wx.ICON_EXCLAMATION)
				dlg.ShowModal()
				return
		
		if os.path.isdir(path):
			icon = 'dir'
			recursive = True
		elif os.path.isfile(path) and path[-4:].lower() == 'brac':
			icon = 'file'
			recursive = None
		else:
			return

		self.entries.append({'type': icon, 'path': path, 'recursive': recursive})
		index = self.m_listCtrl_selected.InsertStringItem(0, path, self.icons[icon])
		if icon == 'dir':
			self.m_listCtrl_selected.SetStringItem(index, 1, '', self.icons[str(recursive).lower()])
		self.m_listCtrl_selected.SetItemData(index, len(self.entries) - 1)
	
#-------------------------------------------------------------------------------

	def OnLeftDownListCtrlSelected( self, event ):
		index, flags = self.m_listCtrl_selected.HitTest(event.GetPosition())

		if index != -1 and flags & wx.LIST_HITTEST_ONITEMLABEL:
			rect = self.m_listCtrl_selected.GetItemRect(index)
			if event.GetX() > rect.x + rect.width - self.m_listCtrl_selected.GetColumnWidth(1):
				entry = self.entries[self.m_listCtrl_selected.GetItemData(index)]
				if entry['recursive'] is not None:
					entry['recursive'] = not entry['recursive']
					self.m_listCtrl_selected.SetStringItem(index, 1, '', self.icons[str(entry['recursive']).lower()])
				return
		
		event.Skip()

#-------------------------------------------------------------------------------

	def OnButtonClickRemove( self, event ):
		if 0 == self.m_listCtrl_selected.GetSelectedItemCount():
			return
			
		i = self.m_listCtrl_selected.GetFirstSelected()
		while -1 != i:
			self.entries[self.m_listCtrl_selected.GetItemData(i)] = None
			self.m_listCtrl_selected.DeleteItem(i)
			i = self.m_listCtrl_selected.GetNextSelected(-1)
		
		self.entries = [x for x in self.entries if x != None]
		self.loadEntries()
	
#-------------------------------------------------------------------------------

	def OnButtonClickApply( self, event ):
		entryutils.updateTimeTable(self.entries)
		self.bracsync.setEntries(self.entries[:])

#-------------------------------------------------------------------------------

	def OnButtonClickClose( self, event ):
		self.Close()

#===============================================================================
