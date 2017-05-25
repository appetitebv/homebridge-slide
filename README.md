# homebridge-slide
[Homebridge](https://github.com/nfarina/homebridge) plugin for [Slide by Innovation In Motion](http://goslide.io/).

Plugin voor [Slide by Innovation In Motion](http://goslide.io/).

## Install plugin
```
npm install -g appetitebv/homebridge-slide
```
## Configure homebridge
Add this to your homebridge configuration:
```
    "accessories": [
	     {
            "accessory": "Slide",
            "name": "Slide",
            "address": "http://127.0.0.1"
        }
    ]
```