# MMM-Buienalarm
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module forecasting rain in the Netherlands and western Germany.

This module is based on MMM-rainfc by Cirdan and MMM-rain-forecast by Spoturdeal, many thanks for their great work!
I wanted to make it bigger and more prominent on the mirror and use a chartjs graph because of their great library.
I also tried to have it look a bit more like the Buienalarm Android App.

The module now uses chart.js for the chart and a gradient fill to show intensity of the rain.


## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/lavolp3/MMM-Buienalarm.git`.
2. Navigate into the module folder and install npm dependencies: `cd MMM-Buienalarm && npm install`
3. Add the module in `config.js` placing it where you prefer


## Config options

|Option|Description|
|---|---|
|`lat`|The latitude of your position.<br>**Type:** `Float`<br>**Default:** <i>52.15</i>|
|`lon`|The longitude of your position.<br>**Type:** `Float`<br>**Default:** <i>5.55</i>|
|`width`|Width of the graph<br>**Type:** `String`<br>**Default:** <i>"500"</i>|
|`height`|Height of the graph<br>**Type:** `String`<br>**Default:** <i>"400"</i>|
|`iconHeight`|Height of the weather icons<br>**Type:** `Integer`<br>**Default:** <i>40</i>|
|`chartType`|Determines type of the chart<br>**Type:** `string`<br>**Values:** 'line', 'bar'<br>**Default:** <i>"line"</i>|
|`debug`|Debug mode (increased console output)<br>**Type:** `boolean`<br>**Default:** <i>false</i>|



Here is an example of an entry in `config.js`
```
{
    module: "MMM-Buienalarm",
    position: "top_right",   // see mirror setting for options
    header: "Buienalarm",
    config: {
        lat: 52.15,
        lon: 5.55,
        width: "500",
        height: "400",
        chartType: "bar",
    }
}
```

## Screenshot
![Screenshot](/rainImage.png?raw=true "Predicted rain")


## Notes
Data provided by <a href="https://www.buienradar.nl/">Buienradar</a>.
- Update every 5 minutes.

## Contributors

<a href="https://github.com/73cirdan/MMM-rainfc">Cirdan</a> and <a href="https://github.com/Spoturdeal/MMM-rain-forecast">Spoturdeal</a> have laid the groundwork for this module.




The MIT License (MIT)
=====================

Copyright © 2019 lavolp3

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
