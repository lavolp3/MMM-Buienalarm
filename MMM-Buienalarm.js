/* global Module */

/* Magic Mirror
 * Module: MMM-Buienalarm
 * Displays a scalable chart.js graph of expected rain for a lon/lat pair based on a Dutch public Api (Buienradar)
 *  https://gpsgadget.buienradar.nl/data/raintext?lat=52.15&lon=5.5
 * By lavolp3, based on the work of Spoturdeal's MMM-rain-forecast.
 */

Module.register("MMM-Buienalarm",{
  // Default module config.
  defaults: {
    lat: 52.15,
    lon: 5.5,
    width: "500",
    height: "400"
  },

  // Override start method.
  start: function() {
    console.log("Starting module: " + this.name);
    this.payload = false;
    this.sendSocketNotification("RAIN_REQUEST", {
      updateInterval: 5 * 60 * 1000,
      apiBase: "https://gpsgadget.buienradar.nl",
      endpoint: "data/raintext",
      lat: this.config.lat,
      lon: this.config.lon,
    });
  },

  // Define required scripts. Chart.js needed for the graph.
  getScripts: function() {
    return [
      'modules/MMM-Buienalarm/node_modules/chart.js/dist/Chart.bundle.js',
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
    var msg = document.getElementById("msg");
    // was not able to receive data
    if (notification == "ERROR") {
      msg.innerHTML=payload.error;
      return;
    } else if (notification == "RAIN_DATA") {
      // no data received from node_helper.js
      if (!payload.times || payload.times.length == 0) {
        msg.innerHTML = this.translate("NODATA");
        return;
      } else if (payload.expectRain == 0) {
        //no rain calculated in node_helper.js
        msg.innerHTML = this.translate("NORAIN") + moment(payload.times[payload.times.length-1]).format("HH:mm");
        var canvas = document.getElementById("rainGraph");
        canvas.style.display = "none";
      } else {
        var rain = this.translate("RAIN")+" ",
            starts_at = this.translate("STARTS_AT")+" ",
            and = this.translate("AND")+" ",
            ends_at = this.translate("ENDS_AT");

        msg.innerhtml = rain;
        if (payload.startRain && payload.startRain > moment().format()) {
          msg.innerHTML += starts_at + moment(payload.startRain).format("HH:mm");
          if (payload.endRain && payload.endRain > moment().format()) {
            msg.innerHTML += and + ends_at + moment(payload.startRain).format("HH:mm");
          }
        } else if (payload.startRain && payload.startRain < moment()) {
          msg.innerHTML += ends_at + moment(payload.endRain).format("HH:mm");
        } else {
          msg.innerHTML = "";
        }
        this.drawChart(payload.rainDrops, payload.times);
      }
    }
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "rainWrapper";
    var msgWrapper = document.createElement("div");
    msgWrapper.id = "msg";
    msgWrapper.className = "small bright";
    wrapper.appendChild(msgWrapper);
    msgWrapper.innerHTML = this.translate("LOADING");
    var graph = document.createElement("canvas");
    graph.className = "small thin light";
    graph.id = "rainGraph";
    //graph.height = this.config.height-50;
    graph.width = this.config.width;
    graph.style.display = "none";
    wrapper.appendChild(graph);
    return wrapper;
  },

  /* Draw chart using chart.js node module
  * For config options visit https://www.chartjs.org/docs/latest/
  */
  drawChart: function(raining, times) {
    //console.log(times, raining);
    var graph = document.getElementById("rainGraph");
    graph.style.display = "block";
    graph.width = this.config.width;
    graph.height = this.config.height;
    var ctx = graph.getContext("2d");
    Chart.defaults.global.defaultFontSize = 14;
    var gradient = ctx.createLinearGradient(0, 0, 0, this.config.height);
    var maxRain = Math.max.apply(null, raining);		//get max value from raining array
    //console.log("Max Rain: "+maxRain)
    gradient.addColorStop(0, "rgba(0,0,150,1)"); //dark blue
    gradient.addColorStop(Math.max((1 - 10/maxRain * 0.75), 0), "rgba(0,0,220,1)");
    gradient.addColorStop(Math.max((1 - 10/maxRain * 0.5), 0), "rgba(65,105,220,1)");
    gradient.addColorStop(Math.max((1 - 10/maxRain * 0.25), 0), "rgba(140,170,250,1)"); //light blue

    var rainChart = new Chart(ctx, {
      type: 'line',
     	data: {
        labels: times,
        datasets: [{
          //label: "rain",
          data: raining,
          backgroundColor: gradient,
          borderWidth: 1,
      	  pointRadius: 0,
          fill: 'origin'
        }],
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        animation: {
          duration: 0,
        },
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              suggestedMax: 2,
              display: false,
            }
          }],
          xAxes: [{
            type: "time",
            time: {
              unit: 'hour',
              unitStepSize: 0.5,
              //parser: "HH:mm",
              displayFormats: {
                hour: 'HH:mm'
              },
            },
            gridLines: {
              display: true,
              borderDash: [5, 5]
            },
            ticks: {
              fontColor: '#DDD',
              fontSize: 16,
            }
          }]
        },
        /*"horizontalLine": [{
          "y": 2,
          "style": "rgba(160, 160, 160, 0.5)",
          "text": "l",
          "textPosition": 0
        },{
          "y": 5,
          "style": "rgba(160, 160, 160, 0.5)",
          "text": "m",
          "textPosition": 0
        },{
          "y": 10,
          "style": "rgba(160, 160, 160, 0.5)",
          "text": "s",
          "textPosition": 0
        }],*/
        legend: { display: false, },
        borderColor: 'white',
        borderWidth: 1,
        cubicInterpolationMode: "default",
      }
    });
  },
});
