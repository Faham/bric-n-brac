
#===============================================================================

from PyQt4.QtCore import QDir, Qt
from PyQt4 import QtGui, QtCore, uic
import os, sys, logging
import entryutils

#===============================================================================

class ImageWidget(QtGui.QLabel):

	def __init__(self, imagePath, parent):
		self.icon = imagePath
		super(ImageWidget, self).__init__(parent)
		pic = QtGui.QPixmap(imagePath)
		self.setPixmap(pic)
		
#===============================================================================

class DialogSettings(QtGui.QDialog):

#-------------------------------------------------------------------------------

	def __init__(self, brac_sync):
		apply(QtGui.QMainWindow.__init__, (self,))
		self.setFixedSize(775, 479)
		uic.loadUi('resources/dialog_settings.ui', self)

		self.tvwSrc     = self.findChild(QtGui.QTreeView,    'tvwSrc')
		self.twgDest    = self.findChild(QtGui.QTableWidget, 'twgDest')
		self.cbxStartup = self.findChild(QtGui.QCheckBox,    'cbxStartup')
		
		# setting treeview source
		filter = ["*.brac"];
		model = QtGui.QFileSystemModel()
		model.setFilter(QtCore.QDir.AllDirs | QtCore.QDir.NoDotAndDotDot | QtCore.QDir.AllEntries)
		model.setNameFilters(filter)
		model.setNameFilterDisables(0)
		model.setRootPath(QtCore.QDir.rootPath())
		self.tvwSrc.setModel(model)
		self.tvwSrc.hideColumn(1)
		self.tvwSrc.hideColumn(2)
		self.tvwSrc.hideColumn(3)

		# setting tablewidget destination
		self.twgDest.itemClicked.connect(self.onRecursiveChanged)
		self.twgDest.setColumnCount(3)
		labels = QtCore.QStringList()
		labels.append('')
		labels.append('Path')
		labels.append('Recursive')
		self.twgDest.setHorizontalHeaderLabels(QtCore.QStringList(labels))
		header = self.twgDest.horizontalHeader()
		header.setClickable(False)
		header.setResizeMode(0, QtGui.QHeaderView.ResizeToContents)
		header.setResizeMode(1, QtGui.QHeaderView.Stretch)
		
		self.bracsync = brac_sync
		self.entries = self.bracsync.entries[:]
		self.loadEntries()

#-------------------------------------------------------------------------------

	def loadEntries(self):
		self.twgDest.clearContents()
				
		self.twgDest.setRowCount(len(self.entries))
		for i, e in enumerate(self.entries):
			self.twgDest.setCellWidget(i, 0, ImageWidget('resources/%s.png' % e['type'], self))
			self.twgDest.setItem(i, 1, QtGui.QTableWidgetItem(e['path']))

			if e['type'] == 'dir':
				chkBoxCell = QtGui.QTableWidgetItem()
				chkBoxCell.setFlags(QtCore.Qt.ItemIsUserCheckable | QtCore.Qt.ItemIsEnabled)
				chkBoxCell.setCheckState(QtCore.Qt.Unchecked if str(e['recursive']).lower() == 'false' else QtCore.Qt.Checked)
				self.twgDest.setItem(i, 2, chkBoxCell)

#-------------------------------------------------------------------------------

	def onRecursiveChanged(self, item):
		if not item.flags() == (QtCore.Qt.ItemIsUserCheckable | QtCore.Qt.ItemIsEnabled):
			return
			
		p = unicode(self.twgDest.item(item.row(), 1).text().toUtf8(), 'utf-8')
		for e in self.entries:
			if e['path'] == p:
				e['recursive'] = (item.checkState() == QtCore.Qt.Checked)
				
		tmp = dict([(e['path'], e['recursive']) for e in self.entries])

#-------------------------------------------------------------------------------

	def onCheckBoxStartup(self):
		return
		
		if self.cbxStartup.IsChecked():
			startup_path = os.path.join(os.environ['APPDATA'], r"Microsoft\Windows\Start Menu\Programs\Startup")
			path = os.path.join(startup_path, "BracSync.lnk")
			shell = Dispatch('WScript.Shell')
			shortcut = shell.CreateShortCut(path)
			shortcut.Targetpath = r"P:\Media\Media Player Classic\mplayerc.exe"
			shortcut.WorkingDirectory = r"P:\Media\Media Player Classic"
			shortcut.IconLocation = r"P:\Media\Media Player Classic\mplayerc.exe"
			shortcut.save()
	
#-------------------------------------------------------------------------------

	def onButtonAdd(self):
		index = self.tvwSrc.selectedIndexes()[0]
		info = index.model().fileInfo(index)
		path = info.filePath()

		for i, e in enumerate(self.entries):
			if path == e['path']:
				QtGui.QMessageBox.information(self, 'Error', "Path is already added.")
				return
		
		if os.path.isdir(path):
			icon = 'dir'
			recursive = True
		elif os.path.isfile(path) and path[-4:].toLower() == 'brac':
			icon = 'file'
			recursive = None
		else:
			return

		self.entries.append({'type': icon, 'path': unicode(path.toUtf8(), 'utf-8'), 'recursive': recursive})

		index = self.twgDest.rowCount()
		self.twgDest.setRowCount(index + 1)
		self.twgDest.setCellWidget(index, 0, ImageWidget('resources/%s.png' % icon, self))
		self.twgDest.setItem(index, 1, QtGui.QTableWidgetItem(path))

		if icon == 'dir':
			chkBoxCell = QtGui.QTableWidgetItem()
			chkBoxCell.setFlags(QtCore.Qt.ItemIsUserCheckable | QtCore.Qt.ItemIsEnabled)
			chkBoxCell.setCheckState(QtCore.Qt.Checked if recursive else QtCore.Qt.Unchecked)
			self.twgDest.setItem(index, 2, chkBoxCell)

#-------------------------------------------------------------------------------

	def onButtonRemove(self):
		selected_items = self.twgDest.selectedItems()

		if 0 == len(selected_items):
			return
		
		removeRows = []
		for item in selected_items:
			removeRows.append(item.row())
		removeRows = list(set(removeRows))
		removeRows.reverse()

		paths = dict([(e['path'], i) for i, e in enumerate(self.entries)])
		
		for rowid in removeRows:
			p = unicode(self.twgDest.item(rowid, 1).text().toUtf8(), 'utf-8')
			if p in paths.keys():
				self.entries[paths[p]] = None
			else:
				logging.error('couldn\'t find %s among entries' % p)
			self.twgDest.removeRow(rowid)
		
		self.entries = [x for x in self.entries if x != None]

#-------------------------------------------------------------------------------

	def onButtonApply(self):
		entryutils.updateTimeTable(self.entries)
		self.bracsync.setEntries(self.entries[:])

#-------------------------------------------------------------------------------

	def onButtonClose(self):
		self.hide()

#-------------------------------------------------------------------------------

	def onButtonUp(self):
		selected_items = self.twgDest.selectedItems()

		rows = []
		for item in selected_items:
			rows.append(item.row())
		rows = list(set(rows))
		rows.sort()

		for i, id in enumerate(rows):
			if id <= 0: continue
			
			newid = id - 1
			oldid = id + 1
			
			if (id - 1) in rows:
				continue

			self.twgDest.insertRow(newid)
			self.twgDest.setCellWidget(newid, 0, self.twgDest.cellWidget(oldid, 0))
			self.twgDest.setItem(newid, 1, self.twgDest.item(oldid, 1).clone())
			self.twgDest.setItem(newid, 2, self.twgDest.item(oldid, 2).clone())
			self.twgDest.setItemSelected(self.twgDest.item(newid, 1), True)
			self.twgDest.removeRow(oldid)
			rows[i] = id - 1

#-------------------------------------------------------------------------------

	def onButtonDown(self):
		selected_items = self.twgDest.selectedItems()

		rows = []
		for item in selected_items:
			rows.append(item.row())
		rows = list(set(rows))
		rows.reverse()

		for i, id in enumerate(rows):
			if id >= self.twgDest.rowCount() - 1: continue
			
			newid = id + 2
			oldid = id
			
			if (id + 1) in rows:
				continue

			self.twgDest.insertRow(newid)
			self.twgDest.setCellWidget(newid, 0, self.twgDest.cellWidget(oldid, 0))
			self.twgDest.setItem(newid, 1, self.twgDest.item(oldid, 1).clone())
			self.twgDest.setItem(newid, 2, self.twgDest.item(oldid, 2).clone())
			self.twgDest.setItemSelected(self.twgDest.item(newid, 1), True)
			self.twgDest.removeRow(oldid)
			rows[i] = id + 1

#===============================================================================

#if __name__ == '__main__':
#	app = QtGui.QApplication(sys.argv)
#
#	win = Settings(None)
#	win.show()
#
#	sys.exit(app.exec_())
