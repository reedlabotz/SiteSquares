Color = 
   getColorFromIcon: (favIconUrl, url, callback) ->
      onImageLoaded = () ->
         colors = findColorOfIcon(img)