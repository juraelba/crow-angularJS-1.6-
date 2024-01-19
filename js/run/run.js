define([], function () {

    function run($rootScope, $location, $window, getQueries, authenticationSvc, env) {
        $rootScope.formActive = false;
        $rootScope.query = false;
        $rootScope.childKey = 0;
        $rootScope.date = new Date();
        // $rootScope.rootUser = null;
        $rootScope.countTasks = 0;
        $rootScope.dashboardUri = '';

        $rootScope.env = env;

        $rootScope.$on("$routeChangeSuccess", function (userInfo) {
            if ($window.sessionStorage["userInfo"]) {
                userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            }
            if (userInfo.userName) {
                getQueries.getConnectionStrings().then(function (response) {
                    $rootScope.connectingString = response;
                    if(typeof $window.sessionStorage["userInfo"] === 'string') {
                        console.log(userInfo)
                        getQueries.getQuery($rootScope.connectingString, "getMenu").then(function (response) {
                            console.log(response)
                            getQueries.getQuery($rootScope.connectingString, "getDashboardUrl").then(function (response) {
                                if (response) {
                                    $rootScope.dashboardUri = response[0] ? response[0].dashboardUrl : '';
                                }
                            });

                            $rootScope.menu = response;
                            getQueries.getQuery($rootScope.connectingString, "getDashboards").then(function (response) {
                                $rootScope.dashboard = response;
                            });

                            if ($rootScope.rootUser!== null){
                                getQueries.getQuery($rootScope.connectingString, "getAantalTakenMedewerker?username=" + $rootScope.rootUser.userName).then(function (response) {
                                    if (response[0]) {
                                        $rootScope.countTasks = response[0].aantalTaken;
                                    }
                                });
                            }
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                        ;
                    }
                });
            }
        });

        $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
            if (eventObj.authenticated === false) {
                $location.path("/login");
            }
        });

        $rootScope.go = function (path) {
            $location.path(path);
        };

        $rootScope.generateColumns = function (sampleData) {
            var colNames = Object.getOwnPropertyNames(sampleData);
            return colNames.map(function (name, idx) {
                var filter = {};
                filter[name] = 'text';
                return {
                    title: name,
                    sortable: name,
                    filter: filter,
                    show: true,
                    field: name
                };
            });
        };

        $rootScope.canSeeMenuItem = function(label, roles_ = []) {
            const rootUser = $rootScope.rootUser;

            if (roles_.length) {
                return roles_.indexOf(rootUser.roleName) !== -1;
            }

            if (label === 'Dashboard') {
                const roles = [
                    'Administrator',
                    'Projectleider',
                    'Financiele administratie',
                    'Producent',
                    'Directie',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Taken') {
                const roles = [
                    'Administrator',
                    'Projectleider',
                    'Financiele administratie',
                    'Producent',
                    'Directie',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Uren') {
                const roles = [
                    'Administrator',
                    'Projectleider',
                    'Financiele administratie',
                    'Producent',
                    'Directie',
                    'Urenschrijver',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Uren invoeren') {
                const roles = [
                    'Administrator',
                    'Projectleider',
                    'Financiele administratie',
                    'Producent',
                    'Directie',
                    'Urenschrijver',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Uren goedkeuren') {
                const roles = [
                    'Administrator',
                    'Projectleider',
                    'Financiele administratie',
                    'Producent',
                    'Directie',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Beheer') {
                const roles = [
                    'Administrator',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            } else if (label === 'Tags') {
                const roles = [
                    'Administrator',
                    'Project control',
                ];
                return roles.indexOf(rootUser.roleName) !== -1;
            }

            return false;
        };

        $rootScope.logout = function () {
            authenticationSvc.logout()
                .then(function (result) {
                    $rootScope.userInfo = null;
                    $rootScope.rootUser = null;

                    $window.sessionStorage["userInfo"] = JSON.stringify({});

                    $location.path("/login");
                }, function (error) {
                    console.log(error);
                });
        };
    }

    run.$inject = ["$rootScope", "$location", "$window", "getQueries", "authenticationSvc", "env"];

    return run;
});