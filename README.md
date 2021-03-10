# MMM-Buienalarm
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module using the climacell api to forecast rain amounts over the next several hours.

This module is based on MMM-rainfc by Cirdan and MMM-rain-forecast by Spoturdeal, many thanks for their work!


## Updates

1.0.0 2021-01-12
- stable version published.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/lavolp3/MMM-Buienalarm.git`.
2. Navigate into the module folder and install npm dependencies: `cd MMM-Buienalarm && npm install`
3. Get a free climacell API Key ![here](https://www.climacell.co/weather-api/)
3. Add the module in `config.js` placing it where you prefer, and include your API Key, latitude and longitude


## Config options

|Option|Description|
|---|---|
|`apiKey`|ClimaCell API Key.<br>Get it here!|
|`lat`|The latitude of your position.<br>**Type:** `Float`<br>**Default:** `52.15`|
|`lon`|The longitude of your position.<br>**Type:** `Float`<br>**Default:** `5.55`|
|`width`|Width of the graph<br>**Type:** `Integer`<br>**Default:** `500`|
|`height`|Height of the graph<br>**Type:** `Integer`<br>**Default:** `400`|
|`forecastHours`|Number of hours to forecast, max 6 hours<br>**Type:** `Integer`<br>**Default:** `4`|
|`forecastSteps`|Steps for the forecast interval (in minutes). Choose between `1`, `5` and `15` <br>**Type:** `Integer`<br>**Default:**  `15`|
|`iconHeight`|Height of the weather icons<br>**Type:** `Integer`<br>**Default:**  `40`|
|`chartType`|Determines type of the chart<br>**Type:** `string`<br>**Values:** 'line', 'bar'<br>**Default:**  `"line"`|
|`hideWithNoRain`|Hides the chart when no rain is expected<br>**Type:** `boolean`<br>**Default:**  `true`|
|`debug`|Debug mode (increased console output)<br>**Type:** `boolean`<br>**Default:**  `false`|



Here is an example of an entry in `config.js`
```
{
    module: "MMM-Buienalarm",
    position: "top_right",   // see mirror setting for options
    header: "Buienalarm",
    config: {
        apiKey: 'APIKEYHERE',
        lat: 52.15,
        lon: 5.55,
        width: 500,
        forecastHours: 4,
        forecastSteps: 15,
        height: 400,
        hideWithNoRain: true,
        chartType: "line",  //use "line" or "bar"
    }
},
```

## Screenshot
![Screenshot](/rainImage.PNG?raw=true "Predicted rain")


## Notes
Data provided by <a href="https://www.climacell.co/">climacell</a>.


## TODO

- [ ] include cloud coverage
- [ ] include pressure
- [ ] include wind and wind gusts



The MIT License (MIT)
=====================

Copyright © 2021 lavolp3

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability,
whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
