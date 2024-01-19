var envData = {
    // "webservice": "http://crow-web01:8080",
    "webservice": "http://brandnewkey.sohosted-vps.nl:8080",
    "env": "MASTER",
    "color": "green",
    "version": "1.20180305.0"
};



/*----------------------------------------------------------*/

/*
* 8080 - master
* 8088 - dev
* 8089 - bug
* */

define([], function () {
    var env = function () {
        return envData;
    };
    env.$inject = [];
    return env;
});