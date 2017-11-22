(function(){
  'use strict';
  console.log('loaded netflix_content');
  var done = false;

  function executeWhenLoaded() {
    console.log('checking netflix progress');
    try {
      var elements = {
        showInfo: {
          className: 'PlayerControls--control-element text-control video-title PlayerControls--control-element-hidden'
        },

        progress: {
          className: 'current-progress',
          styleElement: 'width'
        }

      };

      var showInfoElement = document.getElementsByClassName(elements.showInfo.className)[0].children[0];
      var progressElement = document.getElementsByClassName(elements.progress.className)[0];


      // if the player is loaded
      if (showInfoElement && progressElement) {
        // if it is a show
        if (showInfoElement.childElementCount > 2) {
          // TODO better way to do this
          var tempEp = showInfoElement.children[1].innerText.split(':');
          // make numbers from the strings
          tempEp = tempEp.map(function(n) { return n.replace(/[^0-9]/g, ''); });
          var show = {
            name: showInfoElement.children[0].innerText,
            season: parseInt(tempEp[0], 10),
            ep: parseInt(tempEp[1], 10)
          };

          var progress = parseInt(progressElement.style.getPropertyValue(elements.progress.styleElement));

          // if more than 50% watched we send to background the info
          if (progress > 50) {
            if (!done) {
              console.log('sending message');
              chrome.runtime.sendMessage(show, function(res) {
                // after notified stop marking and sending notifications
                if (res.status === 'done') {
                  done = true;
                }
              });
            }
          }
        }
        // if not loaded, assume new ep
      } else {
        done = false;
      }
    } catch (err) {
      console.log(err);
    }
  }
  window.setInterval(executeWhenLoaded, 10000);
})();
