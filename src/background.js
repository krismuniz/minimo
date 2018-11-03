chrome.runtime.onInstalled.addListener(function () {
  // open a new tab after installing :)
  chrome.tabs.create({ active: true })
})
