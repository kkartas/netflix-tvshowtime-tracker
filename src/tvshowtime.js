(function(){
  'use strict';

  var tvshowtime = function(user, pass, clientId) {
    this.user = user;
    this.pass = pass;
    this.clientId = clientId;
    this.baseUrl = "https://api.tvshowtime.com";
    this.xhttp = new XMLHttpRequest();
  };

  tvshowtime.prototype.makeCall = function(httpVerb, url, data, callback) {
    // some way to do this
    this.data = new FormData(data);
    this.xhttp.open(httpVerb, url, true);
    if (httpVerb === 'POST') {
      this.xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    this.xhttp.onload = function (res) {
      callback(parseResponse(res))
    };
    this.xhttp.send(data ? serialize(data) : undefined);
  };

  tvshowtime.prototype.register = function() {
    data = {
      clientId: this.clientId,
      // redirectUri: '',
      state: ''
    };

    this.makeCall("GET", "https://www.tvshowtime.com/oauth/authorize", data, function(res) {
      // get the code returned by the request and save it 
      data.code = res.code;
    });

    this.makeCall("POST", this.baseUrl + '/v1/oauth/access_token', data, function(res){
      this.accessToken = res.accessToken;
    });
  };

  function parseResponse(progressEvent) {
    return JSON.parse(progressEvent.currentTarget.response);
  }

  function serialize(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
})();
