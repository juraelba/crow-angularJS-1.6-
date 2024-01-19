define([], function () {

    function ApproveController($scope, auth, $rootScope, getQueries, NgTableParams, $timeout, Flash, helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.initVariables = function () {
            $scope.tableParams = new NgTableParams({
                page: 1,
                count: 0
            }, {
                filterDelay: 0,
                dataset: [],
                counts: []
            });
            $scope.listOfId = [];
            $scope.approves = [];
            $scope.data = [];
            $scope.checkbox = [];

            $scope.checkboxAll = {};
            $scope.checkboxAll['value'] = false;

            $scope.filter = {
                employees: [{
                    key: 'All',
                    value: 'All'
                }],
                projects: [{
                    key: 'All',
                    value: 'All'
                }],
                activities: [{
                    key: 'All',
                    value: 'All'
                }]
            };
        };

        // $scope.nullData = false;

        $scope.init = function () {
            $scope.initVariables();

            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getUrenGoedkeuren?username=" + $scope.userInfo.userName).then(function (response) {
                    var data = response;

                    if (data.length > 0) {
                        $scope.data = data;
                        $scope.approves = data;
                    } else {
                        $scope.approves = [];
                        $scope.data = [];
                    }

                    $scope.fillFilters();
                    $scope.fillGrid(data);

                    $("body").removeClass("loading");
                });
            });
        };

        $scope.fillGrid = function (data) {
            if (data.length > 0) {
                $scope.listOfId = [];
                // $scope.checkboxAll['value'] = 0;
                $scope.checkbox = [];
                angular.forEach(data, function (value) {
                    $scope.checkbox[value.id] = 0;
                });
                // $scope.cols = $scope.generateColumns(data[0]);
                $scope.cols = helpers.mapColumns([], [
                    'Medewerker',
                    'Project',
                    'Fase',
                    'Activiteit',
                    'Datum',
                    'Aantal',
                    'Opmerking'
                ]);
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: data.length
                }, {
                    filterDelay: 0,
                    dataset: data,
                    counts: []
                });


                // $scope.cols[0].show = false;
                // if ($scope.cols[7]) {
                //     $scope.cols[7].show = false;
                // }
            } else {
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: 0
                }, {
                    filterDelay: 0,
                    dataset: [],
                    counts: []
                });
                $scope.cols = null;
            }
        };

        $scope.setFilter = function (employee, project, activity) {
            var data = [],
                employees = [],
                projects = [],
                activities = [],
                final = [];
            angular.forEach($scope.approves, function (value, key) {
                if (employee !== undefined && (value.Medewerker == employee || employee == 'All')) {
                    employees.push(key);
                }
                if (project !== undefined && (value.Project == project || project == 'All')) {
                    projects.push(key);
                }
                if (activity !== undefined && (value.Activiteit == activity || activity == 'All')) {
                    activities.push(key);
                }
            });
            if (employees.length && projects.length && activities.length) {
                var array = employees.filter(function (obj) {
                    return projects.indexOf(obj) >= 0;
                });
                data = array.filter(function (obj) {
                    return activities.indexOf(obj) >= 0;
                });
            } else {
                if (employees.length && projects.length) {
                    data = employees.filter(function (obj) {
                        return projects.indexOf(obj) >= 0;
                    });
                }
                if (employees.length && activities.length) {
                    data = employees.filter(function (obj) {
                        return activities.indexOf(obj) >= 0;
                    });
                }
                if (projects.length && activities.length) {
                    data = projects.filter(function (obj) {
                        return activities.indexOf(obj) >= 0;
                    });
                }
                if (!data.length) {
                    if (employees.length) {
                        data = employees;
                    }
                    if (projects.length) {
                        data = projects;
                    }
                    if (activities.length) {
                        data = activities;
                    }
                }
            }
            angular.forEach($scope.approves, function (value, key) {
                if (data.indexOf(key) >= 0) {
                    delete value['$$hashKey'];
                    final.push(value);
                }
            });
            $scope.data = final;
            $scope.fillGrid(final);
        };

        $scope.$watch('employee', function (newValue, oldValue) {
            if (newValue !== null) {
                $scope.project = null;
                $scope.activity = null;
                $scope.setFilter(newValue, $scope.project, $scope.activity);
            }
        });

        $scope.$watch('project', function (newValue, oldValue) {
            if (newValue !== null) {
                $scope.employee = null;
                $scope.activity = null;
                $scope.setFilter($scope.employee, newValue, $scope.activity);
            }
        });

        $scope.$watch('activity', function (newValue, oldValue) {
            if (newValue !== null) {
                $scope.employee = null;
                $scope.project = null;
                $scope.setFilter($scope.employee, $scope.project, newValue);
            }
        });

        $scope.fillFilters = function () {
            var employees = [],
                projects = [],
                activities = [];
            angular.forEach($scope.approves, function (approve) {
                if (!employees.length || employees.indexOf(approve.Medewerker) < 0) {
                    employees.push(approve.Medewerker);
                    $scope.filter.employees.push({
                        key: approve.Medewerker,
                        value: approve.Medewerker
                    });
                }
                if (!projects.length || projects.indexOf(approve.Project) < 0) {
                    projects.push(approve.Project);
                    $scope.filter.projects.push({
                        key: approve.Project,
                        value: approve.Project
                    });
                }
                if (!activities.length || activities.indexOf(approve.Activiteit) < 0) {
                    activities.push(approve.Activiteit);
                    $scope.filter.activities.push({
                        key: approve.Activiteit,
                        value: approve.Activiteit
                    });
                }
            });
        };

        $scope.$watch('checkboxAll.value', function (newvalue, oldvalue) {
            if (!newvalue) {
                $scope.listOfId = [];
                angular.forEach($scope.data, function (value) {
                    $scope.checkbox[value.hourid] = 0;
                });
            } else {
                $scope.listOfId = [];
                angular.forEach($scope.data, function (value) {
                    $scope.listOfId.push(value.hourid);
                    $scope.checkbox[value.hourid] = 1;
                });
            }
        });

        $scope.toggleId = function (hourid) {
            if (hourid !== 0) {
                if ($scope.listOfId.indexOf(hourid) < 0) {
                    $scope.listOfId.push(hourid);
                } else {
                    $scope.listOfId = $scope.listOfId.filter(function (el) {
                        return el != hourid;
                    });
                }
            }
        };

        $scope.approve = function () {
            if ($scope.listOfId.length > 0) {
                angular.forEach($scope.listOfId, function (value) {
                    getQueries.addPost($scope.connectingString, 'urenGoedkeuren', {id: value, username: $scope.userInfo.userName}).then(function (response) {
                        if (response.data.Success) {
                            var message = '<strong> Done!</strong>';
                            Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        } else {
                            var message = '<strong>' + response.data.ErrorMessage + '!</strong>';
                            Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        }

                        $scope.init();
                    });
                });
                angular.forEach($scope.data, function (value) {
                    $scope.checkbox[value.hourid] = 0;
                });
                $scope.listOfId = [];
                $scope.checkboxAll['value'] = 0;
            } else {
                var message = '<strong>Please select rows</strong>';
                Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
            }
        };

        $scope.showAdditional = function () {
            if ($scope.listOfId.length > 0) {
                $('.modalAdditional').show();
            } else {
                var message = '<strong>Please select rows</strong>';
                Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
            }
        };

        $scope.negative = function () {
            angular.forEach($scope.listOfId, function (value) {
                var data = {
                    id: value,
                    reden: $scope.reden,
                    username: $scope.userInfo.userName
                };
                getQueries.addPost($scope.connectingString, 'urenAfkeuren', data).then(function (response) {
                    $('.modalAdditional').hide();
                    $scope.reden = '';
                    if (response.data.Success) {
                        var message = '<strong> Done!</strong>';
                        Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                    } else {
                        var message = '<strong>' + response.data.ErrorMessage + '!</strong>';
                        Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                    }

                    $scope.init()
                });
            });
            angular.forEach($scope.data, function (value) {
                $scope.checkbox[value.hourid] = 0;
            });
            $scope.listOfId = [];
            $scope.checkboxAll['value'] = 0;
        };

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                $('table.approve').find('thead tr').prepend('<th></th>').removeClass('approve');
                $('.checkboxAll').show();
            }, 2000);
        });

        $scope.init();
    }

    ApproveController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "$timeout", "Flash", "helpers"];

    return ApproveController;
});