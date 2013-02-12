## Add listener for icon click
chrome.browserAction.onClicked.addListener (tab) ->
   chrome.tabs.create {'url': chrome.extension.getURL('display.html')}, (tab) ->
      true


### For future use
## Add listener for tab updates
chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
   findColorOfTab()

chrome.tabs.onCreated.addListener (tab) ->
   findColorOfTab()

chrome.tabs.onActiveChanged.addListener (activeInfo) ->
   findColorOfTab()

setTimeout = (time, callback) ->
   window.setTimeout callback, time

findColorOfTab = () ->
   runOnCurrentTab (tab1) ->
      setTimeout 5000, () ->
         runOnCurrentTab (tab2) ->
            if (tab1.id == tab2.id)
               Color.getColorFromIcon tab1.favIconUrl, tab2.url, (color) ->
                  send(color)

runOnCurrentTab = (run) ->
   chrome.windows.getCurrent (current_window) ->
      chrome.tabs.getAllInWindow current_window.id, (tabs) ->
         $.each tabs, () ->
            if (this.active)
               run(this)

###



