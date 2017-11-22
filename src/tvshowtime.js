(function(){
  'use strict';

  var tvshowtime = function (user, pass, clientId) {
    this.user = user;
    this.pass = pass;
    this.clientId = clientId;
    this.baseUrl = "https://api.tvshowtime.com";
    this.xhttp = new XMLHttpRequest();
  };

  tvshowtime.prototype.makeCall = function (httpVerb, url, data, callback) {
    var client = this;
    // some way to do this
    this.data = new FormData(data);
    this.xhttp.open(httpVerb, url, true);
    if (httpVerb === 'POST') {
      this.xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    this.xhttp.setRequestHeader('Authorization', 'Basic ' + this.clientId);

    this.xhttp.onload = function (res) {
      var response = client.xhttp.status === 200 ? parseResponse(res) : null;
      callback(response);
    };
    this.xhttp.send(data ? serialize(data) : undefined);
  };

  tvshowtime.prototype.register = function () {
    data = {
      clientId: this.clientId,
      // redirectUri: '',
      state: ''
    };

    this.makeCall("GET", "https://www.tvshowtime.com/oauth/authorize", data, function (res) {
      // get the code returned by the request and save it 
      data.code = res.code;
    });

    this.makeCall("POST", this.baseUrl + '/v1/oauth/access_token', data, function (res) {
      this.accessToken = res.accessToken;
    });
  };

  tvshowtime.prototype.postShow = function (netflixShow, success, error) {
    var client = this;

    this.makeCall("GET", this.baseUrl + "/v1/show?show_name=" + netflixShow.name, null, function (res) {
      if (res == null) {
        error("Unable to find show: " + netflixShow.name);
        return;
      }
      var show = {
        show_id: res.show.id,
        season: netflixShow.season,
        episode: netflixShow.ep
      };
      client.makeCall("POST", client.baseUrl + '/v1/show_progress', show, function (res) {
        if (res == null) {
          error("Unable to send " + netflixShow.name + "S" + netflixShow.season + "E" + netflixShow.ep + " to TvShowTime");
        } else if (res.result === "OK") {
          success("Sent " + netflixShow.name + "S" + netflixShow.season + "E" + netflixShow.ep + " to TvShowTime");
        } else {
          error("Unable to send " + netflixShow.name + "S" + netflixShow.season + "E" + netflixShow.ep + " to TvShowTime");
        }
      });
    });
  }

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
