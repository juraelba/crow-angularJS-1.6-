define([], function () {

    function getFromWebService($http) {

        var getUserToken = function (webService) {
            return $http({
                url: webService + "/token",
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                data: $.param({
                    grant_type: "password",
                    userName: 'johan@example.com',
                    password: 'Pass@word1'
                })
            }).then(function (result) {
                return result.data;
            }, function (error) {
                alert(JSON.stringify(error));
            });
        };

        var getConnectionStrings = function (webService, user) {
            return $http({
                url: webService + "/api/ConnectionStrings",
                method: "GET",
                headers: {'Authorization': user.token_type + " " + user.access_token}
            }).then(function (result) {
                return result.data[0].Name;
            }, function (error) {
                alert(JSON.stringify(error));
            });
        };

        var getQuery = function (webService, user, connectingString, nameQuery) {
            return $http({
                url: webService + "/api/factory/execute/" + connectingString + "/" + nameQuery,
                method: "GET",
                headers: {'Authorization': user.token_type + " " + user.access_token}
            }).then(function (result) {
                if (!result.data.Success) {
                    alert(webService + "/api/factory/execute/" + connectingString + "/" + nameQuery + ' - ' + result.data.ErrorMessage);
                }
                return result.data.Items;
            }, function (error) {
                alert(JSON.stringify(error));
            });
        };

        var addPost = function (webService, user, connectingString, queryName, data) {
            return $http({
                url: webService + "/api/factory/execute/" + connectingString + "/" + queryName,
                method: "POST",
                headers: {'Authorization': user.token_type + " " + user.access_token},
                data: data
            }).then(function (result) {
                if (!result.data.Success) {
                    alert(webService + "/api/factory/execute/" + connectingString + "/" + queryName + ' - ' + result.data.ErrorMessage);
                }
                return result;
            }, function (error) {
                alert(JSON.stringify(error));
            });
        };

        return {
            getUserToken: getUserToken,
            getConnectionStrings: getConnectionStrings,
            getQuery: getQuery,
            addPost: addPost
        };
    }

    getFromWebService.$inject = ['$http'];

    return getFromWebService;
});