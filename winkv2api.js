// A Node.JS client for the Wink V2 API

const util = require('util');
var Client = require('node-rest-client').Client;

// Create a WinkV2API Object
// Note: In order to get V2 responses, your credentials must be enabled for V2 and you must specify a User-Agent that
// the API does not recognize
//
// config - A configuration object containing the login credentials

function WinkV2API(config) {

    // Configure the REST client

    var options = {
        mimetypes:{
            json:["application/json","application/json; charset=utf-8"]
        },
    };
    this.credentials = config.wink.credentials;
    this.client = new Client(options);

    // Register the REST Methods

    this.client.registerMethod('login', 'https://api.wink.com/oauth2/token', 'POST');
    this.client.registerMethod('getDevices', 'https://api.wink.com/users/me/wink_devices', 'GET');
    this.client.registerMethod('setLock', 'https://api.wink.com/locks/${lock}', 'PUT');

    this.oauth2 = {};
};

// Method to log into the Wink service
//
// A callback function that is called on successful login

WinkV2API.prototype.login = function(callback) {

    var self = this;

    // Setup the login request

    var args = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'lordpengwin-winkv2api'
        },
        data: {
            username: this.credentials.username,
            password: this.credentials.password,
            client_id: this.credentials.client_id,
            client_secret: this.credentials.client_secret,
            grant_type: "password"
        }
    };

    // Login and save the oauth2 token returned

    self.client.methods.login(args, function(data, response) {

        if (response.statusCode != 200) {
            console.log("response %j",  util.inspect(response));
            throw new Error('Unsuccessful response: ' + response.statusCode);
        }


        //console.log('data %j', data);
        self.oauth2 = data;
        callback();
    });
};

// Method to get a list of the Wink devices
//
// callback - A function called with the list of devices

WinkV2API.prototype.devices = function(callback) {

    var self = this;

    // Setup the request

    var args = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.oauth2.access_token,
            'User-Agent': 'YOUR_USER_AGENT'
        }
    };

    // Request the list of devices

    self.client.methods.getDevices(args, function(data, response) {

        if (response.statusCode != 200)
            throw new Error('Unsuccessful response: ' + response.statusCode);

//        console.log('data"' + JSON.stringify(data, null, 4));
        callback(data.data)
    });
};

// Set the state of a lock.
// NOTE: This seems to happen asynchronously with the state of the lock changing well after the call returns.
//
// lockId - The numeric ID of the lock
// locked - The desired state of the lock
// callback - A function that is called with the current state of the lock and the desired state

WinkV2API.prototype.setLock = function(lockId, locked, callback) {

    var self = this;

    // Setup the request

    var args = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + self.oauth2.access_token,
            'User-Agent': 'YOUR_USER_AGENT'
        },
        path: {
            'lock': lockId
        },
        data: {
            'desired_state': {
                'locked': locked
            }
        }
    };

    self.client.methods.setLock(args, function(data, response) {

        if (response.statusCode != 200)
            throw new Error('Unsuccessful response: ' + response.statusCode);

        //console.log('data"' + JSON.stringify(data, null, 4));
        callback(data.data.desired_state.locked, data.data.last_reading.locked);
    });
};

// Find devices of a specific type.
//
// devices - The list of devices to check
// deviceType - The type of devices to return
// returns An array of matching devices

WinkV2API.prototype.findDevices = function(devices, deviceType) {

    var result = [];
    for (var i in devices)
        if (deviceType === devices[i].object_type)
            result.push(devices[i]);

    return result;
}

exports.WinkV2API = WinkV2API;
