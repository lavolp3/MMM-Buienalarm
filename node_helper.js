var NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({

  // Override start method.
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.isRunning = false;
    this.rainData = {};
  },

  // Override socketNotificationReceived method.
  socketNotificationReceived: function(notification, payload) {
    this.log("Socket Notification received. Title: "+notification+", Payload: "+payload);
    if (notification == "RAIN_REQUEST") {
      if (!this.isRunning) {
        this.isRunning = true;
        this.config = payload;
        var self = this;
        this.getData();
        setInterval(function() {
           self.getData();
        }, payload.updateInterval);
      } else {
        this.log("Node Helper already running, sending data...");
        this.sendSocketNotification('RAIN_DATA', this.rainData);
      }
    }
  },

  getData: function() {
    var self = this;
    var url = 'https://data.climacell.co/v4/timelines?location=';
    url += this.config.lat + ',' + this.config.lon;
    url += '&fields=precipitationIntensity,precipitationType,pressureSurfaceLevel,humidity,temperature,temperatureApparent,'
    + 'cloudCover,precipitationProbability,visibility,weatherCode,windDirection,windSpeed,windGust'
    + '&timesteps=' + this.config.forecastSteps + 'm'
    + '&apikey=' + this.config.apiKey;
    console.log(url);
    request(url, function (error, response, body) {
      if (error) throw new Error(error);
      console.log(body);
      self.rainData = JSON.parse(body);
      self.sendSocketNotification('RAIN_DATA', JSON.parse(body));
    });
  },

  /*processData: function(data) {
    this.log("Processing rain data...");
    var rain = [], rainData = [];
    var times = []

    var rainCount = 0;
    var itRains = false;
    var startRain = [], endRain = [], expectedRain = [0], maxRain = [[0, ""]];
    var completeRain = 0;

    var endForecast = moment().add(this.config.forecastHours, "hours").format("X");
    console.log(endForecast);
    var i=0;
    //for (var i = 0; i < data.length; i++) {
    while (moment(data[i].observation_time.value).format("X") < endForecast) {
      rain.push(data[i].precipitation.value);
      completeRain += rain[i];
      times.push(moment(data[i].observation_time.value).format());
      rainData.push([parseInt(moment(data[i].observation_time.value).format("X")), data[i].precipitation.value]);
      if (rain[i] > maxRain[rainCount][0]) { maxRain[rainCount] = [rain[i], times[i]]; }
      expectedRain[rainCount] += rain[i];
      if ((rain[i] >= 0.01) && !itRains) {
        startRain.push(times[i]);
        itRains = true;
      } else if ((rain[i] < 0.01) && itRains) {
        endRain.push(times[i]);
        itRains = false;
        rainCount++;
        expectedRain.push(0);
        maxRain.push([rainCount, times[i]]);
      }
      i++;
    };


    if (itRains) {
      endRain.push(times[times.length-1]);
    }
    this.log("RainDrops: "+rain
             +"\nStartRain: "+startRain
             +"\nEndRain: "+endRain
             +"\nExpected rain: "+expectedRain
             +"\nComplete rain: "+completeRain
             +"\nTimes: "+times);
    this.log(rainData);

    this.rainData = {
      rainDrops:  rain,
      times:      times,
      rainData:   rainData,
      completeRain: completeRain,
      expectedRain: expectedRain,
      startRain: startRain,
      maxRain: maxRain,
      endRain: endRain
    };
    this.sendSocketNotification('RAIN_DATA', this.rainData);
  },*/

  log: function (msg) {
    if (this.config && this.config.debug) {
      console.log(this.name + ": ", (msg));
    }
  }

});
