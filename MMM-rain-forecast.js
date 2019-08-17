/* global Module */

/* Magic Mirror
 * Module: Rain-forecast
 * Version 29th April 2018 decreased by request the width of the graph by 25% was 400px now 305px
 * Displays a scalable vector graph of expected rain for a lon/lat pair based on a Dutch public Api (Buienradar)
 *  https://gpsgadget.buienradar.nl/data/raintext?lat=52.15&lon=5.5
 * By Spoturdeal.
 */

Module.register("MMM-rain-forecast",{
  // Default module config.
	defaults: {
		lat: 52.15,
    lon: 5.5,
		noRainText: 'Until %s no rain',    // write %s where you like to add the time example Until 17:15 no rain
    pleaseWait: 'Please wait',
    fillColour: '#00ffff',
		width: 400,
		height: 400
	},
  // Override start method.

	start: function() {
		Log.log("Starting module: " + this.name);
		this.payload = false;
		this.sendSocketNotification("RAIN_REQUEST", {
			updateInterval: 60 * 1000,
      apiBase: "https://gpsgadget.buienradar.nl",
      endpoint: "data/raintext",
      lat: this.config.lat,
      lon: this.config.lon,
		});

	},
	// Define required scripts. No extra scripts needed
	getScripts: function() {
		return [
			'modules/MMM-rain-forecast/node_modules/chart.js/dist/Chart.bundle.js',
			'modules/MMM-rain-forecast/node_modules/chartjs-lines-plugin/dist/chartjs-lines-plugin.js'
		];
	},
	// Define required styles for chart only.
	getStyles: function() {
		return ["MMM-rain-forecast.css"];
	},
	socketNotificationReceived: function(notification, payload) {
	        var msg = document.getElementById("msg");
        	// was not able to receive data
        	if (notification == "ERROR") {
			msg.innerHTML=payload.error;
			return;
		}
        	// no data received from node_helper.js
	        if (!payload.times || payload.times.length == 0) {
        		msg.innerHTML="No Data";
	        	return;
        	}
        	// no rain calculated from in node_helper.js
	        if (payload.expectRain == 0) {
            		noRainText = this.sprintf(this.config.noRainText,payload.times[payload.times.length-1]);
            		msg.innerHTML = noRainText;
								var canvas = document.getElementById("rainGraph");
								canvas.style.display = "none";
        	} else {
            		console.log("Succesfully loaded rain data, drawing chart!")
		    				msg.innerHTML = "";
        	    	this.drawChart(payload.rainDrops,payload.times)
					}
	},
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "rainWrapper";
		var msgWrapper = document.createElement("div");
		msgWrapper.id = "msg";
		msgWrapper.className = "small thin light";
		wrapper.appendChild(msgWrapper);
		msgWrapper.innerHTML = this.config.pleaseWait;
		var graph = document.createElement("canvas");
		graph.className = "small thin light";
		graph.id = "rainGraph";
		graph.width = this.config.width;
		graph.style.display = "none";
		wrapper.appendChild(graph);
		return wrapper;
	},

    /* Draw chart using chart.js node module
    * For config options visit https://www.chartjs.org/docs/latest/
    */
	drawChart: function(raining, times) {
		console.log(times, raining)
		var canvas = document.getElementById("rainGraph");
		canvas.style.display = "block";
		canvas.height = this.config.height;
		var ctx = canvas.getContext("2d");
		Chart.defaults.global.defaultFontSize = 16;
		var gradient = ctx.createLinearGradient(0, 0, 0, 400);
		var maxRain = Math.max.apply(null, raining);		//get max value from raining array
		console.log("Max Rain: "+maxRain)
		//gradient.addColorStop(1, "rgba(140,170,250,1)");
		gradient.addColorStop(((10/maxRain < 1) ? 10/maxRain : 1), "rgba(140,170,250,1)");
		//gradient.addColorStop(0.5, "rgba(65,105,220,1)");
		gradient.addColorStop(((5/maxRain < 1) ? 5/maxRain : 1), "rgba(140,170,250,1)");
		//gradient.addColorStop(0.25, "rgba(0,0,200,1)");
		gradient.addColorStop(((2/maxRain < 1) ? 2/maxRain : 1), "rgba(140,170,250,1)");
		gradient.addColorStop(0, "rgba(0,0,100,1)");
		var rainChart = new Chart(ctx, {
			type: 'line',
	 		data: {
				labels: times,
				datasets: [{
					//label: "rain",
					data: raining,
					backgroundColor: gradient, //'blue',
					borderWidth: 1,
				  	pointRadius: 0,
					fill: 'origin'
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 0,
				},
				scales: {
					yAxes: [{
						display: false,
						ticks: {
							suggestedMin: 10,
						}
					}],
					xAxes: [{
						type: "time",
						time: {
							parser: "HH:mm",
							displayFormats: {
                minute: 'HH:mm'
              }
						},
						ticks: {
							fontColor: '#DDD',
							fontSize: 16,
							//maxTicksLimit: 7,
							//source: 'auto'
						}
					}]
				},
				"horizontalLine": [{
					"y": 2,
					"style": "rgba(255, 255, 255, 1)",
					"text": "Leicht",
					"textPosition": 0
				},{
					"y": 5,
					"style": "rgba(255, 255, 255, 1)",
					"text": "Mittel",
					"textPosition": 200
				},{
					"y": 10,
					"style": "rgba(255, 255, 255, 1)",
					"text": "Schwer",
					"textPosition": 400
				}],
				legend: { display: false, },
				borderColor: 'white',
				borderWidth: 1,
				cubicInterpolationMode: "default",
			}
		})
	},

    sprintf: function() {
    var args = arguments,
    string = args[0],
    i = 1;
    return string.replace(/%((%)|s|d)/g, function (m) {
        // m is the matched format, e.g. %s, %d
        var val = null;
        if (m[2]) {
            val = m[2];
        } else {
            val = args[i];
            // A switch statement so that the formatter can be extended. Default is %s
            switch (m) {
                case '%d':
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    break;
            }
            i++;
        }
        return val;
    });
}
});
