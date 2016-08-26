var WinkV2API = require('./winkv2api.js');


var config = {
    wink: {
        credentials: {
            username: "xxx@xxx.xxx",
            password: "xxx",
            client_id: "xxx",
            client_secret: "xxx"
        }
    }
};

var wink = new WinkV2API.WinkV2API(config);
wink.login(function() {

    console.log("in callback");
    wink.devices(function(devices) {
        console.log(JSON.stringify(devices, null, 4));
        //wink.findDevices(devices, 'lock_id');

    });
//    winkapi.setLock('64566', false, function(desired_state, current_state) {
//        console.log("current_state = " + current_state + ", desired_state = " + desired_state);
//    });
});

