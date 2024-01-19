define(['moment'], function (moment) {

    function KpiController($scope, auth, getQueries, $routeParams, constructTable, $rootScope, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.kpiId = 0;
        $scope.kpi = [];
        $scope.data = {};
        $rootScope.rootUser = auth;
        $scope.startDate = '';
        $scope.endDate = '';

        $scope.KPIUsers = [];
        $scope.tempobject = {};
        $scope.tempobject.KPIUser = '';

        $scope.KPITeams = [];
        $scope.KPITeamsKeys = [];
        $scope.tempobject.KPITeam = '';


        $scope.urenTableParams = null;
        $scope.urenTableCols = null;

        $scope.init = function () {
            window.location.href = '#!/hours';
            $scope.startDate = moment('01-01-2018').format("DD-MM-YYYY");
            $scope.endDate = moment().format("DD-MM-YYYY");

            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;

                getQueries.getQuery($scope.connectingString, 'getUsers').then(function (response) {
                    angular.forEach(response, function (item) {
                        if (item.RoleId === $rootScope.rootUser.roleId) {
                            $scope.kpiId = item.Id;
                            $scope.getKPI();
                        }
                    });
                });

                $scope.getKPIUsers();

                if ($scope.isAdminRole()) {
                    $scope.getKPITeams();
                }
            });
        };

        $scope.isAdminRole = function () {
            var adminRoles = ['Producent', 'Administrator', 'Directie'];
            return adminRoles.indexOf($scope.userInfo.roleName) !== -1;
        };

        $scope.employeeSelected = function () {
            $scope.getKPI();
        };

        $scope.teamSelected = function () {
            $scope.getKPI();
            $scope.getKPIUsers();
        };

        $scope.getKPITeams = function () {
            getQueries.getQuery($scope.connectingString, "getKPIProjectenTeamDropdown?username=" + $scope.userInfo.userName).then(function (response) {
                $scope.KPITeamsKeys = response.map(function (item) {
                    return item.key;
                });

                $scope.KPITeams = response;
                $scope.KPITeams.unshift({key: "all", value: "all"});

                if ($scope.KPITeams.length === 2) {
                    $scope.tempobject.KPITeam = $scope.KPITeams[1].key;
                    $scope.teamSelected();
                }
            });
        };

        $scope.getKPIUsers = function () {
            if ($scope.tempobject.KPITeam !== undefined && $scope.tempobject.KPITeam) {
                getQueries.getQuery($scope.connectingString, "getKPIProjectenEmpDropdown" +
                    "?team=" + $scope.tempobject.KPITeam +
                    "&username=" + $scope.userInfo.userName
                ).then(function (response) {
                    $scope.KPIUsers = response;
                    $scope.KPIUsers.unshift({key: "all", value: "all"});

                    if ($scope.KPIUsers.length === 2) {
                        $scope.tempobject.KPIUser = $scope.KPIUsers[1].key;
                        $scope.employeeSelected();
                    }
                });
            } else {
                getQueries.getQuery($scope.connectingString, "getKPIUsers" +
                    "?username=" + $scope.userInfo.userName
                ).then(function (response) {
                    $scope.KPIUsers = response;
                    $scope.KPIUsers.unshift({key: "all", value: "all"});

                    if ($scope.KPIUsers.length === 2) {
                        $scope.tempobject.KPIUser = $scope.KPIUsers[1].key;
                        $scope.employeeSelected();
                    }
                });
            }
        };

        $scope.getKPI = function () {
            $scope.getUrenTable();

            var query = '';

            if ($scope.isAdminRole()) {
                if ($scope.tempobject.KPIUser && $scope.tempobject.KPIUser !== 'all') {
                    query = "getKPIProductiviteitEmp?employee=" + $scope.tempobject.KPIUser + $scope.getParams();
                } else if ($scope.tempobject.KPITeam) {
                    query = "getKPIProductiviteitTeam?team=" + getKPITeamValue() + $scope.getParams();
                } else {
                    query = "getKPIProductiviteitUser?medewerkerid=" + $scope.kpiId + $scope.getParams();
                }
            } else {
                if ($scope.tempobject.KPIUser && $scope.tempobject.KPIUser !== 'all') {
                    query = "getKPIProductiviteitEmp?employee=" + $scope.tempobject.KPIUser + $scope.getParams();
                } else {
                    query = "getKPIProductiviteitUser?medewerkerid=" + $scope.kpiId + $scope.getParams();
                }
            }

            getQueries.getQuery($scope.connectingString, query)
                .then(function (response) {
                    if (_.isArray(response) && response.length === 0) {
                        $scope.kpi = [{"Productiviteit": 0.0}];
                    } else {
                        $scope.kpi = response;
                    }

                });
        };

        function fillUrenTable(response) {
            if (response.length > 0) {
                $scope.urenTableCols = $rootScope.generateColumns(response[0]);
                $scope.urenTableParams = new NgTableParams({
                    page: 1,
                    count: 10
                }, {
                    filterDelay: 0,
                    dataset: response
                });
            } else {
                $scope.urenTableCols = [];
                $scope.urenTableParams = new NgTableParams({}, {dataset: []});
            }
        }

        $scope.getUrenTable = function () {
            $scope.urenTableCols = null;
            $scope.urenTableParams = null;

            if ($scope.tempobject.KPIUser && $scope.tempobject.KPIUser !== 'all') {
                $("body").addClass("loading");
                getQueries.getQuery($scope.connectingString, "getNietGeschrevenUrenEmp" +
                    "?employee=" + $scope.tempobject.KPIUser +
                    '&startdate=' + moment($scope.startDate, "DD-MM-YYYY").format("MM-DD-YYYY") +
                    '&enddate=' + moment($scope.endDate, "DD-MM-YYYY").format("MM-DD-YYYY"))
                    .then(function (response) {
                        fillUrenTable(response);
                        $("body").removeClass("loading");
                    });
            } else if ($scope.tempobject.KPITeam && $scope.tempobject.KPITeam !== 'all') {
                $("body").addClass("loading");
                getQueries.getQuery($scope.connectingString, "getNietGeschrevenUrenTeam" +
                    "?team=" + $scope.tempobject.KPITeam +
                    '&startdate=' + moment($scope.startDate, "DD-MM-YYYY").format("MM-DD-YYYY") +
                    '&enddate=' + moment($scope.endDate, "DD-MM-YYYY").format("MM-DD-YYYY"))
                    .then(function (response) {
                        fillUrenTable(response);
                        $("body").removeClass("loading");
                    });
            }
        };

        $scope.getParams = function () {
            return "&username=" + $scope.userInfo.userName +
                '&startdate=' + moment($scope.startDate, "DD-MM-YYYY").format("MM-DD-YYYY") +
                '&enddate=' + moment($scope.endDate, "DD-MM-YYYY").format("MM-DD-YYYY");
        };

        function getKPITeamValue() {
            return $scope.tempobject.KPITeam === 'all' || !$scope.tempobject.KPITeam ? '' : $scope.tempobject.KPITeam;
        }

        $scope.setDate = function () {
            $scope.getKPI();
        };

        $scope.init();
    }

    KpiController.$inject = ["$scope", "auth", "getQueries", "$routeParams", "constructTable", "$rootScope", 'NgTableParams'];

    return KpiController;
});