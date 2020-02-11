
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
    width: 500,
    height: 400,
    iconHeight: 40,
    apiBase: "https://gpsgadget.buienradar.nl",
    endpoint: "data/raintext",
    updateInterval: 5 * 60 * 1000,
    chartType: 'bar',
    debug: true
  },

  msg: "LOADING",

  // Override start method.
  start: function() {
    console.log("Starting module: " + this.name);
    this.sendSocketNotification("RAIN_REQUEST", this.config);
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
    this.log("Socket Notification received: "+notification);

    // was not able to receive data
    if (notification == "ERROR") {
      this.msg = payload.error;
    } else if (notification == "RAIN_DATA") {

      // bugifixing option. Uncomment to change rain amount to

      /*payload.completeRain = 1.5163810192021259;
      payload.rainDrops = [0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536, 0.12409377607517195, 0.1, 0.0003924189758484536, 0.0003924189758484536, 0.0019109529749704406, 0.004869675251658631, 0.2053525026457146, 0.08659643233600653, 0.3924189758484536, 0.03651741272548377, 0.004531583637600818, 0.0220673406908459, 0.02053525026457146, 0.29427271762092816, 0.2053525026457146, 0.014330125702369627, 0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536, 0.0003924189758484536];
      payload.completeRain = 1.5163;
      payload.maxRain = [1,2];*/

      // no data received from node_helper.js
      if (!payload.times || payload.times.length == 0) {
        this.msg = this.translate("NODATA");
      } else if (payload.completeRain < 0.01) {
        //no rain calculated in node_helper.js
        this.log("No rain expected until " + moment(payload.times[payload.times.length-1]).format("HH:mm"));
        this.msg = this.translate("NORAIN") + moment(payload.times[payload.times.length-1]).format("HH:mm");
      } else {
        this.log(payload);

        var /*intensity = this.translate(rainIntensity),*/
            rain = this.translate("RAIN"),
            starts_at = this.translate("STARTS_AT"),
            and = this.translate("AND"),
            ends_at = this.translate("ENDS_AT");
        this.msg = rain;
        if (payload.startRain && payload.startRain[0] > moment().format()) {
          this.msg += (starts_at + moment(payload.startRain[0]).format("HH:mm"));
          if (payload.endRain && payload.endRain[0] > moment().format()) {
            this.msg += (and + ends_at + moment(payload.endRain[0]).format("HH:mm"));
          }
        } else if (payload.startRain[0] && payload.startRain[0] < moment().format()) {
          this.msg += (ends_at + moment(payload.endRain[0]).format("HH:mm"));
        } else {
          //this.msg = "";
        }
        this.log(this.msg);
      }
      //this.updateDom();
      var msgWrapper = document.getElementById("msg");
      msgWrapper.innerHTML = this.msg;
      if (payload.completeRain >= 0.1) {
        this.log("Drawing rain graph");
        this.drawChart(payload);
      }
    }
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "rainWrapper";
    wrapper.width = this.config.width;
    var msgWrapper = document.createElement("div");
    msgWrapper.id = "msg";
    msgWrapper.style.width = this.config.width + "px";
    msgWrapper.className = "small";
    msgWrapper.innerHTML = this.msg;
    wrapper.appendChild(msgWrapper);
    var graph = document.createElement("canvas");
    graph.className = "small thin light";
    graph.id = "rainGraph";
    graph.height = this.config.height;
    graph.width = this.config.width;
    graph.style.display = "none";

    var iconWrapper = document.createElement("div");
    iconWrapper.id = "iconWrapper";
    iconWrapper.style.width = this.config.width+"px";
    iconWrapper.style.height = this.config.height+"px";
    this.log("IconWrapper: "+iconWrapper.style);
    var iconPath = "url('" + this.file("icons/rain_light.svg") + "')";
    var lightRain = document.createElement("div");
    lightRain.className = "rainSVG";
    lightRain.id = "lightRain";
    lightRain.style.height = this.config.iconHeight+"px";
    lightRain.style.background = iconPath + " no-repeat";
    this.log("Background: "+lightRain.style.background);
    lightRain.style.display = "none";
    iconPath = "url('" + this.file("icons/rain_medium.svg") + "')";
    var medRain = document.createElement("div");
    medRain.className = "rainSVG";
    medRain.id = "medRain";
    medRain.style.height = this.config.iconHeight+"px";
    medRain.style.background = iconPath + " no-repeat";
    medRain.style.display = "none";
    iconPath = "url('" + this.file("icons/rain_heavy.svg") + "')";
    var heavyRain = document.createElement("div");
    heavyRain.className = "rainSVG";
    heavyRain.id = "heavyRain";
    heavyRain.style.height = this.config.iconHeight+"px";
    heavyRain.style.background = iconPath + " no-repeat";
    heavyRain.style.display = "none";
    iconWrapper.appendChild(lightRain);
    iconWrapper.appendChild(medRain);
    iconWrapper.appendChild(heavyRain);
    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(graph);
    return wrapper;
  },



  /* Draw chart using chart.js node module
  * For config options visit https://www.chartjs.org/docs/latest/
  */
  drawChart: function(data) {

    var graph = document.getElementById("rainGraph");
    graph.style.display = "block";
    graph.width = this.config.width;
    graph.height = this.config.height;
    var ctx = graph.getContext("2d");
    Chart.defaults.global.defaultFontSize = 14;
    var maxRain = 0;
    for (var m = 0; m < data.maxRain.length; m++) {
       maxRain = Math.max(maxRain, data.maxRain[m][0]);
    }


    var rainChart = new Chart(ctx, {
      type: this.config.chartType,
     	data: {
        labels: data.times,
        datasets: [{
          //label: "rain",
          data: data.rainDrops,
          backgroundColor: 'rgba(65, 105, 220, 1)',
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
              suggestedMax: 0.6,
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
              fontColor: '#eee',
              fontSize: 20,
            }
          }]
        },
        legend: { display: false, },
        borderColor: 'white',
        borderWidth: 1,
        cubicInterpolationMode: "default",
      }
    });
    this.drawIcons(maxRain);
  },


  drawIcons: function(maxRain) {
    var moveTo = 0;
    var graphHeight = this.config.height - 50 - this.config.iconHeight;
    this.log("MaxRain for icons: "+maxRain);
    if (maxRain > 2.5) {
      this.log("Drawing icons:heavy");
      moveTo = (graphHeight*(1-2.5/maxRain));
      heavyRain.style.display = "block";
      heavyRain.style.marginTop = Math.min(moveTo, graphHeight) + "px" ;
    } else {
      heavyRain.style.display = "none";
    }
    if (maxRain > 0.6 && maxRain < 4) {
      this.log("Drawing icons: med");
      moveTo = (graphHeight*(1-0.6/maxRain));
      medRain.style.display = "block";
      medRain.style.marginTop = Math.min(moveTo, graphHeight) +"px";
    } else {
      medRain.style.display = "none";
    }
    if (maxRain < 2) {
      this.log("Drawing icons: light");
      moveTo = (graphHeight*(1- 0.15/maxRain));
      lightRain.style.display = "block";
      lightRain.style.marginTop = Math.min(moveTo, graphHeight) +"px";
    } else {
      lightRain.style.display = "none";
    }
  },


  log: function (msg) {
    if (this.config && this.config.debug) {
      console.log(this.name + ": ", (msg));
    }
  }
});
