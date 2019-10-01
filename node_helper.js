var NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');


module.exports = NodeHelper.create({
  // Override start method.
  start: function() {
    console.log("Starting node helper for: " + this.name);
    return;
  },

  // Override socketNotificationReceived method.
  socketNotificationReceived: function(notification, payload) {
    var self = this;
    this.url = payload.apiBase+"/" + payload.endpoint + "?lat=" + payload.lat + "&lon="+ payload.lon;
    setInterval(function() {
      self.getData(self);
    }, payload.updateInterval);

    //this.getData(this);
    //return;
  },

  getData: function(self) {
 		request({url: self.url, method: 'GET'}, function(error, response, body) {
      self.processData(error, response, body, self);
    });
  },

  processData: function(error, response, body, self) {
    // First handle server side errors
    if (error) {
      self.sendSocketNotification("ERROR", {
        error: "Error ",
      });
      return;
    }
    // Page or url has not been found
    if (response.statusCode != 200) {
      self.sendSocketNotification("ERROR", {
        error: body,
      });
      return;
    }

    // This is test data just to see the graph if there is no rain
    //body="000|10:05\n000|10:10\n000|10:15\n080|10:20\n077|10:25\n000|10:30\n000|10:35\n022|10:40\n035|10:45\n087|10:50\n75|10:55\n096|11:00\n063|11:05\n034|11:10\n056|11:15\n055|11:20\n092|11:25\n087|11:30\n050|11:35\n000|11:40\n000|11:45\n000|11:50\n000|11:55\n000|12:00\n";
    // Make an array with the amount of rain  077|10:05 = rain|time
    var rainDrops = [];
        // Make an array with the times received
    var times = [];
        // Count all rain together
    var expectedRain = 0;
    var rainCount = 0;    //bad programming ahead!!!
    var startRain, endRain = 0;
        // Make separate lines
    var lines = body.split('\n');
    for(var i = 0; i < lines.length-1; i++){
      var values = lines[i].split('|');
      // split rain from time
      rainDrops.push(values[0] == "NaN" ? 0 : (Math.pow(10,(parseInt(values[0])-109)/32)));
      times.push((i == 0) ? moment(values[1],"HH:mm").format() : moment(times[0]).add(i*5, "minutes").format());
      expectedRain += parseInt(values[0]);
      if ((parseInt(values[0]) > 0.1) && (rainCount == 0)) {
        startRain = times[i];
        rainCount = 1;
      } else if ((parseInt(values[0]) < 0.1) && (rainCount == 1)) {
        endRain = times[i];
        rainCount = 2;
      }
    }
    if (rainCount == 1) {
      endRain = times[lines.length-1];
    }

    // Send all to script
    self.sendSocketNotification('RAIN_DATA', {
      rainDrops:  rainDrops,
      times:      times,
      expectRain: expectedRain,
      startRain: startRain,
      endRain: endRain
    });
  }
});
