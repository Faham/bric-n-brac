#!/usr/bin/env python

#===============================================================================

import wx, time
from lib.tools import file

#===============================================================================

class Popup(wx.Frame):

#-------------------------------------------------------------------------------

	def __init__(self):

		wx.Frame.__init__(self, None, -1, style=wx.NO_BORDER|wx.FRAME_NO_TASKBAR)
		self.padding = 12 # padding between edge, icon and text
		self.popped = 0 # the time popup was opened
		self.delay = 4 # time to leave the popup opened

		# platform specific hacks
		lines = 2
		lineHeight = wx.MemoryDC().GetTextExtent(" ")[1]
		if wx.Platform == "__WXGTK__":
			# use the popup window widget on gtk as the
			# frame widget can't animate outside the screen
			self.popup = wx.PopupWindow(self, -1)
		elif wx.Platform == "__WXMSW__":
			# decrement line height on windows as the text calc below is off otherwise
			self.popup = self
			lineHeight -= 3
		elif wx.Platform == "__WXMAC__":
			# untested
			self.popup = self

		self.popup.SetSize((250, (lineHeight * (lines + 1)) + (self.padding * 2)))
		self.panel = wx.Panel(self.popup, -1, size=self.popup.GetSize())

		# popup's click handler
		self.panel.Bind(wx.EVT_LEFT_DOWN, self.click)

		# popup's logo
		self.logo = wx.Bitmap(file("../resources/sync_notice.png", "p"))
		wx.StaticBitmap(self.panel, -1, pos=(self.padding, self.padding)).SetBitmap(self.logo)

		# main timer routine
		self.timer = wx.Timer(self, -1)
		self.Bind(wx.EVT_TIMER, self.main, self.timer)
		self.timer.Start(500)

#-------------------------------------------------------------------------------

	def main(self, event):

		if self.focused():
			# maintain opened state if focused
			self.popped = time.time()
		elif self.opened() and self.popped + self.delay < time.time():
			# hide the popup once delay is reached
			self.hide()

#-------------------------------------------------------------------------------

	def click(self, event):
		#handles popup click

		self.popped = 0
		self.hide()

#-------------------------------------------------------------------------------

	def show(self, text):
		#shows the popup

		# create new text
		if hasattr(self, "text"):
			self.text.Destroy()
		popupSize = self.popup.GetSize()
		logoSize = self.logo.GetSize()
		self.text = wx.StaticText(self.panel, -1, text)
		self.text.Bind(wx.EVT_LEFT_DOWN, self.click)
		self.text.Move((logoSize.width + (self.padding * 2), self.padding))
		self.text.SetSize((
			popupSize.width - logoSize.width - (self.padding * 3),
			popupSize.height - (self.padding * 2)
		))

		# animate the popup
		screen = wx.GetClientDisplayRect()
		self.popup.Show()
		for i in range(1, popupSize.height + 1):
			self.popup.Move((screen.width - popupSize.width, screen.height - i))
			self.popup.SetTransparent(int(float(240) / popupSize.height * i))
			self.popup.Update()
			self.popup.Refresh()
			time.sleep(0.01)
		self.popped = time.time()

#-------------------------------------------------------------------------------

	def hide(self):
		#hides the popup

		self.popup.Hide()
		self.popped = 0

#-------------------------------------------------------------------------------

	def focused(self):
		#returns true if popup has mouse focus

		mouse = wx.GetMousePosition()
		popup = self.popup.GetScreenRect()
		return (
			self.popped and
			mouse.x in range(popup.x, popup.x + popup.width)
			and mouse.y in range(popup.y, popup.y + popup.height)
		)

#-------------------------------------------------------------------------------

	def opened(self):
		#returns true if popup is open

		return self.popped != 0

#===============================================================================
