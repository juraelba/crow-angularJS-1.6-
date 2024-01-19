define([], function () {

    function OverviewController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.data = [];
        $scope.filter = {
            projects: [{
                key: 'All',
                value: 'All'
            }],
            activities: [{
                key: 'All',
                value: 'All'
            }]
        };

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getUrenOverzicht?username=" + $scope.userInfo.userName).then(function (response) {
                    var data = response;
                    if (data.length > 0) {
                        $scope.data = data;
                        $scope.fillFilters();
                        $scope.fillGrid(data);
                    }
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.fillGrid = function (data) {
            if (data.length > 0) {
                $scope.cols = $scope.generateColumns(data[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: data.length
                }, {
                    filterDelay: 0,
                    dataset: data,
                    counts: []
                });
                $scope.cols[5].show = false;
                $scope.cols[6].show = false;
                $scope.cols[7].show = false;
                $scope.cols[8].show = false;
                if ($scope.cols[9]) {
                    $scope.cols[9].show = false;
                }
            }
        };

        $scope.fillFilters = function () {
            var projects = [],
                activities = [];
            angular.forEach($scope.data, function (approve) {
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

        $scope.setFilter = function (project, activity) {
            var data = [],
                projects = [],
                activities = [],
                final = [];
            angular.forEach($scope.data, function (value, key) {
                if (project !== undefined && (value.Project == project || project == 'All')) {
                    projects.push(key);
                }
                if (activity !== undefined && (value.Activiteit == activity || activity == 'All')) {
                    activities.push(key);
                }
            });
            if (projects.length && activities.length) {
                data = projects.filter(function (obj) {
                    return activities.indexOf(obj) >= 0;
                });
            }
            if (!data.length) {
                if (projects.length) {
                    data = projects;
                }
                if (activities.length) {
                    data = activities;
                }
            }
            angular.forEach($scope.data, function (value, key) {
                if (data.indexOf(key) >= 0) {
                    final.push(value);
                }
            });
            $scope.fillGrid(final);
        };

        $scope.showDetails = function (row) {
            if (row.ProjectId && row.Versieid && row.FaseId && row.RolId) {
                getQueries.getQuery($scope.connectingString, "getUrenOverzichtDetails?username=" + $scope.userInfo.userName +
                    '&projectid=' + parseInt(row.ProjectId) + '&versieid=' + parseInt(row.Versieid) + '&faseid=' + parseInt(row.FaseId) +
                    '&rolid=' + parseInt(row.RolId)).then(function (response) {
                    var data = response;
                    if (data.length > 0) {
                        $scope.detailsCols = $scope.generateColumns(data[0]);
                        $scope.tableDetailsParams = new NgTableParams({
                            page: 1,
                            count: data.length
                        }, {
                            filterDelay: 0,
                            dataset: data,
                            counts: []
                        });
                    }
                    $('.modalAdditional').show();
                    $("body").removeClass("loading");
                });
            }
        };

        $scope.$watch('project', function (newValue, oldValue) {
            if (newValue !== null) {
                $scope.setFilter(newValue, $scope.activity);
            }
        });

        $scope.$watch('activity', function (newValue, oldValue) {
            if (newValue !== null) {
                $scope.setFilter($scope.project, newValue);
            }
        });

        $scope.init();
    }

    OverviewController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return OverviewController;
});