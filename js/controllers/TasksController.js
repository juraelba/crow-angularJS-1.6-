define([], function () {

    function TasksController($scope, auth, $rootScope, getQueries, NgTableParams, Flash, helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.employees = [{
            key: 'All',
            value: 'All'
        }];
        $scope.task = 'Niet ingediende projecten';
        $scope.tasks = [{
            key: 'Niet ingediende projecten',
            value: 'Niet ingediende projecten',
            function: 'getTakenNietIngediendeProjecten'
        }, {
            key: 'Afgekeurde projecten',
            value: 'Afgekeurde projecten',
            function: 'getTakenAfgekeurdeProjecten'
        }, {
            key: 'Goedkeuren projecten',
            value: 'Goedkeuren projecten',
            function: 'getTakenGoedkeurenProjecten'
        }, {
            key: 'Niet ingediende uren',
            value: 'Niet ingediende uren',
            function: 'getTakenNietIngediendeUren'
        }
        // , {
        //     key: 'Nog niet goedgekeurde uren',
        //     value: 'Nog niet goedgekeurde uren',
        //     function: 'getTakenGoedkeurenUren'
        // }
        ];
        $scope.onClick = 'project';
        $scope.data = [];

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getMedewerkers").then(function (response) {
                    angular.forEach(response, function (value) {
                        $scope.employees.push({
                            key: value.key,
                            value: value.value
                        });
                    });
                    getQueries.getQuery($scope.connectingString, "getDefaultMedewerker?username=" + $scope.userInfo.userName).then(function (response) {
                        if (response[0]) {
                            $scope.employee = response[0].id;
                            $scope.changeTask($scope.task);
                        }
                        $("body").removeClass("loading");
                    });
                });
            });
        };

        $scope.changeTask = function (task) {
            if ($scope.connectingString !== null) {
                var getFunction;

                getFunction = _.where($scope.tasks, {'key': task})[0]['function'];

                if (task === 'Niet ingediende uren') {
                    $scope.onClick = 'week';
                } else {
                    $scope.onClick = 'project';
                }

                $("body").addClass("loading");
                getQueries.getQuery($scope.connectingString, getFunction + '?username=' + $scope.userInfo.userName)
                    .then(function (response) {
                        $("body").removeClass("loading");

                        var data = response;
                        if (data.length > 0) {
                            $scope.data = data;
                            $scope.setFilter($scope.employee);
                        }
                    });
            }
        };

        $scope.fillGrid = function (data) {
            if (data.length > 0) {
                data = helpers.changeNameColumn(data, 'Aangemaakt door', 'Aangemaakt_door');
                $scope.nonSubmitCols = $scope.generateColumns(data[0]);
                $scope.nonSubmitCols = helpers.hideColumns($scope.nonSubmitCols, ['versieid', 'MedewerkerId', 'medewerkerId', 'id']);

                $scope.nonSubmitTableParams = new NgTableParams({
                    page: 1,
                    count: data.length
                }, {
                    filterDelay: 0,
                    dataset: data,
                    counts: []
                });

            } else {
                $scope.nonSubmitCols = [];
            }
        };

        $scope.setFilter = function (employee) {
            var data = [];

            if (employee === 'All') {
                data = $scope.data;
            } else {
                data = $scope.data.filter(function (value, key) {
                    return value['MedewerkerId'] === employee || value['medewerkerId'] === employee;
                });
            }

            $scope.fillGrid(data);
        };

        $scope.goToDetails = function (row) {
            var path;
            if ($scope.onClick === 'project') {
                path = '/page/3/' + row.versieid;
            } else {
                path = '/hours/' + row.Week + '/' + $scope.employee;
            }
            if ($scope.employee === 'All' && $scope.onClick === 'week') {
                var message = '<strong>Kies alstublieft medewerker</strong>';
                Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
            } else {
                $scope.go(path);
            }
        };

        $scope.$watch('employee', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.setFilter(newValue);
            }
        });

        $scope.$watch('task', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.changeTask(newValue);
            }
        });

        $scope.init();
    }

    TasksController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "Flash", "helpers"];

    return TasksController;
});