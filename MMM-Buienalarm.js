/* Magic Mirror
 * Module: MMM-RainForecast
 * Displays a scalable hihcharts graph of expected rain for a lon/lat pair based on the climacell free  API
 * By lavolp3, based on the module MMM-Buienalarm.
 */

Module.register("MMM-Buienalarm",{
    // Default module config.
    defaults: {
        lat: 52.222,
    lon: 5.555,
    width: 500,
    height: 400,
    iconHeight: 40,
    apiKey: '',
    forecastHours: 4,
    forecastSteps: 15,
    updateInterval: 5 * 60 * 1000,
    chartType: 'line',
    chartFillColor: 'rgba(65, 105, 220, 1)',
    hideWithNoRain: true,
    debug: false
    },
    msg: "LOADING",

  // Override start method.
  start: function() {
      console.log("Starting module: " + this.name);
      this.sendSocketNotification("RAIN_REQUEST", this.config);
      if (![1,5,15,30].includes(this.config.forecastSteps)) { this.config.forecastSteps = 15; }
  },

  // Define required scripts. Chart.js needed for the graph.
  getScripts: function() {
      return [
          'modules/MMM-Buienalarm/node_modules/highcharts/highstock.js',
      ];
  },

  // Define required styles.
  getStyles: function() {
      return ["MMM-Buienalarm.css"];
  },

  getTranslations: function() {
      return {
          en: "translations/en.json",
          nl: "translations/nl.json",
          de: "translations/de.json"
      };
  },

  socketNotificationReceived: function(notification, payload) {
      this.log("Socket Notification received: "+notification);

      // was not able to receive data
      if (notification == "ERROR") {
          this.msg = payload.error;
      } else if (notification == "RAIN_DATA") {

      /*payload.completeRain = 1.5163810192021259;
      payload.rainDrops = [0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536, 0.12409377607517195, 0.1, 0.0003924189758484536, 0.0003924189758484536, 0.0019109529749704406, 0.004869675251658631, 0.2053525026457146, 0.08659643233600653, 0.3924189758484536, 0.03651741272548377, 0.004531583637600818, 0.0220673406908459, 0.02053525026457146, 0.29427271762092816, 0.2053525026457146, 0.014330125702369627, 0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536];
      payload.completeRain = 1.5163;
      payload.maxRain = [1,2];
      payload.rainData = [0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536, 0.12409377607517195, 0.1, 0.0003924189758484536, 0.0003924189758484536, 0.001910952974970440]
      */
          this.log(payload);
          if (payload.data) { this.processData(payload); }


    }
  },


  processData: function(payload) {
    var endOfForecast = moment().add(this.config.forecastHours, "hours").format("x");
    var rainData = payload.data.timelines[0].intervals;
    this.rainData = {
        times: [],
        rain: [],
        completeRain: 0,
        cloudCover: [],
        pressure: [],
        visibility: [],
        windSpeed: [],
        windGust: [],
        windDirection: [],
        rainProb: [],
        temp: [],
        appTemp: []
    };
    var i = 0;
    for (var i = 0; i < rainData.length; i++) {
        if (moment(rainData[i].startTime).format("x") < endOfForecast) {
            var time = parseInt(moment(rainData[i].startTime).add(moment().utcOffset(), "minutes").format("x"));
            this.rainData.times.push(time);
            this.rainData.rain.push([time, rainData[i].values.precipitationIntensity]);
            this.rainData.completeRain += rainData[i].values.precipitationIntensity;
            this.rainData.cloudCover.push([time, rainData[i].values.cloudCover]);
            this.rainData.pressure.push([time, rainData[i].values.pressureSurfaceLevel]);
            this.rainData.visibility.push([time, rainData[i].values.visibility]);
            this.rainData.windSpeed.push([time, rainData[i].values.windSpeed]);
            this.rainData.windGust.push([time, rainData[i].values.windGust]);
            this.rainData.windDirection.push([time, rainData[i].values.windDirection]);
            this.rainData.rainProb.push([time, rainData[i].values.precipitationProbability]);
            this.rainData.temp.push([time, rainData[i].values.temperature]);
            this.rainData.appTemp.push([time, rainData[i].values.temperatureApparent]);
        }
    }
    this.log(this.rainData);
    // no data received from node_helper.js
    if (!this.rainData.times || this.rainData.times.length === 0) {
        this.log("Wrong or no data received: "+payload);
        this.msg = this.translate("NODATA");
    } else if (this.rainData.completeRain < 0.01) {
        //no rain calculated in node_helper.js
        this.log("No rain expected!");
        this.log("No rain expected before " + moment(this.rainData.times[this.rainData.times.length-1]).format("LT"));
        this.msg = this.translate("NORAIN") + moment(this.rainData.times[this.rainData.times.length-1]).format("LT");
        if (this.config.hideWithNoRain) {
            document.getElementById("rainGraph").style.display = "none"
        } else {
            this.drawChart(this.rainData)
        }
    } else {
        var
            rain = this.translate("RAIN"),
            starts_at = this.translate("STARTS_AT"),
            and = this.translate("AND"),
            ends_at = this.translate("ENDS_AT");
        this.msg = rain;
        /*if (payload.startRain && payload.startRain[0] >= moment().format()) {
          this.msg += (starts_at + moment(payload.startRain[0]).format("HH:mm"));
          if (payload.endRain && payload.endRain[0] > payload.startRain[0]) {
            this.msg += (and + ends_at + moment(payload.endRain[0]).format("HH:mm"));
          }
        } else if (payload.startRain[0] && payload.startRain[0] < moment().format()) {
          this.msg += (ends_at + moment(payload.endRain[0]).format("HH:mm"));
        } else {
          //this.msg = "";
        }*/
        this.log(this.msg);
        this.log("Drawing rain graph");
        this.drawChart(this.rainData);
    }
    var msgWrapper = document.getElementById("rainforecast-msg");
    msgWrapper.innerHTML = this.msg;
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "rainWrapper";
    wrapper.width = this.config.width;
    var msgWrapper = document.createElement("div");
    msgWrapper.id = "rainforecast-msg";
    msgWrapper.style.width = this.config.width + "px";
    msgWrapper.className = "small";
    msgWrapper.innerHTML = this.msg;
    wrapper.appendChild(msgWrapper);
    var graph = document.createElement("div");
    graph.className = "small thin light";
    graph.id = "rainGraph";
    graph.height = this.config.height;
    graph.width = this.config.width;
    graph.style.display = "none";
    wrapper.appendChild(graph);
    return wrapper;
  },



  /* Draw chart using highcharts node module
  * For config options visit https://api.highcharts.com/highcharts
  */
  drawChart: function(data) {

    var graph = document.getElementById("rainGraph");
    graph.style.display = "block";
    graph.width = this.config.width;
    graph.height = this.config.height;
    /*var maxRain = 0;
    for (var m = 0; m < data.maxRain.length; m++) {
       maxRain = Math.max(maxRain, data.maxRain[m][0]);
    }*/


    Highcharts.chart("rainGraph", {
      chart: {
        type: 'areaspline',
        backgroundColor: '#000',
        plotBackgroundColor: '#000',
        plotBorderWidth: '0',
        style: {
          fontSize: "0.9em",
          fontColor: "#eee",
        }
      },
      title: {
        //enabled: false,
        text: undefined,
        //align: 'left'
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        labels: {
          overflow: 'justify',
          style: {
            fontSize: '1em'
          }
        }
      },
      yAxis: {
        labels: {
          enabled: false,
          //title: undefined,
          style: {
            fontSize: '1em'
          }
        },
        title: {
          text: null
        },
        min: 0,
        softMax: this.config.forecastSteps / 20,
        startOnTick: false,
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        //alternateGridColor: null,
        //Light rain — when the precipitation rate is < 2.5 mm (0.098 in) per hour
        //Moderate rain — when the precipitation rate is between 2.5 mm (0.098 in) - 7.6 mm (0.30 in) or 10 mm (0.39 in) per hour[106][107]
        //Heavy rain — when the precipitation rate is > 7.6 mm (0.30 in) per hour,[106] or between 10 mm (0.39 in) and 50 mm (2.0 in) per hour[107]
        //Violent rain — when the precipitation rate is > 50 mm (2.0 in) per hour[107]
        plotBands: [
          {
          from: 0,
          to: 2.5*(this.config.forecastSteps/60),
          //color: '#000',
          color: 'rgba(68, 170, 213, 0.1)',
          label: {
            useHTML: true,
            text: '<img src=' + this.file('icons/rain_light.svg') + ' height="' + this.config.iconHeight +'" >',
            style: {
              color: '#fafafa'
            }
          }
        }, {
          from: 2.5*(this.config.forecastSteps/60),
          to: 7.6*(this.config.forecastSteps/60),
          color: '#000',
          //color: 'rgba(68, 170, 213, 0.2)',
          label: {
            useHTML: true,
            text: '<img src=' + this.file('icons/rain_medium.svg') + ' height="' + this.config.iconHeight +'" >',
            style: {
              color: '#fafafa'
            }
          }
        }, {
          from: 7.6*(this.config.forecastSteps/60),
          to: 50*(this.config.forecastSteps/60),
          //color: '#000',
          color: 'rgba(68, 170, 213, 0.1)',
          label: {
            useHTML: true,
            text: '<img src=' + this.file('icons/rain_heavy.svg') + ' height="' + this.config.iconHeight +'" >',
            style: {
              color: '#fafafa'
            }
          }
        }, {
          from: 50*(this.config.forecastSteps/60),
          to: 200*(this.config.forecastSteps/60),
          color: '#000',
          //borderColor: 'rgba(68, 170, 213, 0.4)',
          label: {
            useHTML: true,
            text: '<img src=' + this.file('icons/rain_heavy.svg') + ' height="' + this.config.iconHeight +'" >',
            style: {
              color: '#fafafa'
            }
          }
        }]
      },
      plotOptions: {
        areaspline: {
          lineWidth: 3,
          marker: {
            enabled: false
          },
        }
      },
      series: [{
        data: data.rain,
        lineColor: this.config.chartFillColor,
      }],
      navigation: {
        enabled: false,
      },
    });
  },

  log: function (msg) {
    if (this.config && this.config.debug) {
      console.log(this.name + ": ", (msg));
    }
  }
});
