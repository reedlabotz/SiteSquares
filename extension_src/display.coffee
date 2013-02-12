getHistory = () ->
  microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7
  oneWeekAgo = (new Date).getTime() - microsecondsPerWeek

  chrome.history.search {
    'text': '',
    'startTime': oneWeekAgo,
    'maxResults': 10000000
    }, (historyItems) ->
      for item in historyItems
        url = item.url;
        processWithUrl = (url) ->
          (res) ->
            console.log(url,res);
        chrome.history.getVisits({url: url}, processWithUrl(url));

getHistory()

