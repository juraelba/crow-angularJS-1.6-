define([], function () {

    function authenticationSvc($http, $q, $window, getQueries, $rootScope, env) {
        var userInfo;
        // function login(userName, password, fakeUsername) {
            function login(userName, password, fakeUsername,otp) {
            var deferred = $q.defer();

            var data = {
                grant_type: "password",
                userName: userName,
                password: password,
				otp:otp
            };

            $http({
                url: env.webservice + "/token",
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                data: $.param(data)
            }).then(function (result) {
                userInfo = {
                    access_token: result.data.access_token,
                    expires: result.data['.expires'],
                    token_type: result.data.token_type,
                    userName: fakeUsername,
                    roleName: '',
                    roleId: ''
                };

                getQueries.getConnectionStringByUserInfo(userInfo).then(function (connectingString) {
                    if (connectingString) {
                        userInfo['connectingString'] = connectingString;

                        $http({
                            url: getQueries.webservice + "/api/factory/execute/" + connectingString + "/getLoggedInUserDetails?username=" + fakeUsername,
                            method: "GET",
                            headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                        }).then(function (userRoles) {
                            $http({
                                method: 'GET',
                                url: getQueries.webservice + "/api/factory/execute/" + connectingString + "/getRoles",
                                headers: {
                                    'Authorization': userInfo.token_type + " " + userInfo.access_token
                                }
                            }).then(function (roles) {
                                var userRoleId = userRoles['data']['Items']['0']['RoleId'] || 0;
                                var userRoleName = "";

                                var restriction = userRoles['data']['Items']['0']['Restriction'];
                                restriction = parseInt(restriction);
                                if (isNaN(restriction)){
                                    restriction = 1;
                                }


                                angular.forEach(roles['data']['Items'], function (role) {
                                    if (role['key'] === userRoleId) {
                                        userRoleName = role['value'];
                                    }
                                });

                                userInfo['roleId'] = userRoleId;

                                userInfo['roleName'] = userRoleName;

                                userInfo['restriction'] = restriction;

                                // userInfo['roleName'] = 'Administrator';
                                // userInfo['roleName'] = 'Urenschrijver';
                                // userInfo['roleName'] = 'Projectleider';
                                // userInfo['roleName'] = 'Producent';
                                // userInfo['roleName'] = 'Directie';
                                // userInfo['roleName'] = 'Financiele administratie';

                                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                                $rootScope.rootUser = userInfo;
                                deferred.resolve(userInfo);
                            });
                        });
                    } else {
                        deferred.reject('Connecting string getting error');
                    }
                });

            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function logout() {
            var deferred = $q.defer();
            userInfo = null;
            delete $window.sessionStorage["userInfo"];
            deferred.resolve(null);

            return deferred.promise;
        }

        function getUserInfo() {
            return userInfo;
        }
		
        function init() {
            if ($window.sessionStorage["userInfo"]) {
                userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            }

            $.get('manifest.json', function (manifest) {
                $rootScope.projectVersion = manifest[0].version
            })
        }

        init();

        return {
            login: login,
            logout: logout,
            getUserInfo: getUserInfo
        };
    }

    authenticationSvc.$inject = ["$http", "$q", "$window", "getQueries", "$rootScope", "env"];

    return authenticationSvc;
});