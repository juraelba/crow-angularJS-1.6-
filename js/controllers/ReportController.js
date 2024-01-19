define([], function () {

    function ReportController($scope, auth, getQueries, constructReport, $timeout, $rootScope) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.data = {};
        $scope.pullRight = [
            'Omschrijving1',
            'Omschrijving2',
            'Header'
        ];
        $rootScope.rootUser = auth;
        $scope.teams = null;
        $scope.projects = null;
        $scope.fases = null;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                    $scope.teams = response;
                });
                getQueries.getQuery($scope.connectingString, "getProjectDropdown").then(function (response) {
                    $scope.projects = response;
                });
                $scope.getReport();
                $("body").removeClass("loading");
            });
        };

        $scope.getReport = function () {
            var project = ($scope.project !== undefined ? $scope.project : ''),
                fase = ($scope.fase !== undefined ? ($scope.fase == null ? '' : $scope.fase) : '');
            constructReport.fromQuery($scope.connectingString, "getReportVerantwoording?projectid=" +
                project + '&faseid=' + fase
            ).then(function (response) {
                var result = response;
                $scope.data.table = result[0];
                $scope.data.tableCols = result[1];
            });
        };

        $scope.$watch('team', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                getQueries.getQuery($scope.connectingString, "getProjectDropdownByTeam?teamid=" + newValue).then(function (response) {
                    $scope.projects = response;
                    $scope.fases = null;
                    $scope.fase = null;
                });
            }
        });

        $scope.$watch('project', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                getQueries.getQuery($scope.connectingString, "getProjectVersies?projectid=" + $scope.project).then(function (response) {
                    $scope.versions = response;
                    angular.forEach($scope.versions, function (value) {
                        $scope.versionValue = value.Value;
                        $scope.versionId = value.versieid;
                    });
                    getQueries.getQuery($scope.connectingString, "getFaseDropdownByProject?projectid=" + $scope.project).then(function (response) {
                        $scope.fases = response;
                        $scope.getReport();
                    });
                });
            }
        });

        $scope.$watch('fase', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.getReport();
            }
        });

        $scope.showResultsDetails = function (type, fase_key) {

            if (type == 'fase') {
                angular.forEach($scope.data.table.data, function (valueTable) {
                    if (valueTable.fase_key == fase_key && !valueTable.header) {
                        valueTable.visible = valueTable.visible ? 0 : 1;
                    }
                });
            }
        };

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                $('table.report').find('thead tr').prepend('<th></th>').removeClass('report');
                $('table').find('thead tr th').each(function () {
                    var td = $(this),
                        index = td.index();
                    if (index > 2) {
                        $(this).addClass('pullRight');
                    }
                });
            }, 3000);
        });

        $scope.init();
    }

    ReportController.$inject = ["$scope", "auth", "getQueries", "constructReport", "$timeout", "$rootScope"];

    return ReportController;
});