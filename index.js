var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-slide", "Slide", Slide);
};

class Slide {
	constructor(log, config) {
		this.log = log;
		
		this.name = config.name;
		this.username = config.username;
		this.password = config.password;
		this.address = config.address + "/api/v1.0/slide/";
		
		// Default set to open
		this.targetPosition = 100;
		this.currentPosition = 100;
		this.positionState = Characteristic.PositionState.STOPPED;
		
		this.service = new Service.WindowCovering(this.name);
	}
	
	getCurrentPosition(callback) {
		var error = null;
		callback(error, this.currentPosition);
	}
	
	getTargetPosition(callback) {
		var error = null;
		callback(error, this.targetPosition);
	}
	
	setTargetPosition(value, callback) {
		this.targetPosition = value;
		
		var url = this.address;
		
		if (this.targetPosition == this.currentPosition) {
			this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
			this.log("target == current");
			callback(null);
		} else {
			
			if (this.targetPosition > this.currentPosition) {
				this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.INCREASING);
				url += "open/";
			} else if (this.targetPosition < this.currentPosition) {
				this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.DECREASING);
				url += "close/";
			}
			
			request.post({
				url: url
			}, function (err, response, body) {
				this.log(err);
				this.log(body);
				if (!err && response.statusCode == 200) {
					this.currentPosition = this.targetPosition;
					this.service.setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);
					this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentPosition);
					this.log("done.");
					var error = null;
					callback(error);
				} else {
					this.log(err);
					callback(err);
				}
			}.bind(this));
		}
	}
	
	getPositionState(callback) {
		var error = null;
		callback(error, this.positionState);
	}
		
	getName(callback) {
		//	/api/v1.0/slide/info
		
		request.get({
			url: this.address + "info/"
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				var json = JSON.parse(body);
				this.name = json.device_name;
				callback(null, this.name);
			} else {
				this.log(err);
				callback(err);
			}
		}.bind(this));
	}
	
	getServices() {		
		var informationService = new Service.AccessoryInformation();
		
		informationService
			.setCharacteristic(Characteristic.Manufacturer, 'Innovation In Motion')
			.setCharacteristic(Characteristic.Model, 'Slide')
			.setCharacteristic(Characteristic.SerialNumber, 'unknown');
			
		this.service
			.getCharacteristic(Characteristic.CurrentPosition)
			.on('get', this.getCurrentPosition.bind(this));
			
		this.service
			.getCharacteristic(Characteristic.TargetPosition)
			.on('get', this.getTargetPosition.bind(this))
			.on('set', this.setTargetPosition.bind(this));
			
		this.service
			.getCharacteristic(Characteristic.PositionState)
			.on('get', this.getPositionState.bind(this));
			
        this.service
            .getCharacteristic(Characteristic.Name)
            .on('get', this.getName.bind(this));
            
        return [informationService, this.service];
	}
}