define(['moment'], function (moment) {

    function BillingController($scope, auth, $rootScope, getQueries, NgTableParams, $timeout, Flash, helpers) {
        $scope.userInfo = auth;
        $rootScope.rootUser = auth;
        $scope.connectingString = null;
        $scope.checkbox = [];
        $scope.listOfId = [];
        $scope.checkboxAll = {
            all: 0
        };
        $scope.year = 0;
        $scope.period = 0;

        $scope.allData = [];
        $scope.data = [];
        $scope.projects = [];
        $scope.projectCode = null;
        $scope.showCheckbox = false;

        $scope.init = function () {
            $scope.filterDate = moment().format("DD-MM-YYYY");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.getProjects();
                getQueries.getQuery($scope.connectingString, "getMedewerkers").then(function (response) {
                    $scope.employees = response;
                    $scope.employees.unshift({
                        'key': 'All',
                        'value': 'All'
                    });
                });
                $scope.getUren();
            });
        };

        $scope.getProjects = function () {
            getQueries.getQuery($scope.connectingString, "getFacturatieProject?enddate=" + changeFormat($scope.filterDate)).then(function (response) {
                $scope.projects = response.map(function (item) {
                    return {
                        'key': item['projectcode'],
                        'value': item['projectcode']
                    }
                });
                $scope.projects.unshift({
                    'key': 'All',
                    'value': 'All'
                });
            });
        };

        $scope.getUren = function () {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getUrenVerwerken").then(function (response) {
                if (response[0]) {
                    $scope.cols = helpers.mapColumns([], [
                        'Medewerker',
                        'Project',
                        'Fase',
                        'Activitiet',
                        'Datum',
                        'Aantak',
                        'Opmerking'
                    ]);
                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10 // count per page
                        // count: $scope.data.length
                    }, {
                        filterDelay: 0,
                        dataset: response,
                        counts: []
                    });
                }
                $("body").removeClass("loading");
            });
        };

        $scope.setDate = function () {
            $scope.getUren();
            $scope.getProjects();
        };

        function changeFormat(date) {
            var array = date.split('-');
            return array[2] + '-' + array[1] + '-' + array[0];
        }

        $scope.init();
    }

    BillingController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "$timeout", "Flash", "helpers"];

    return BillingController;
});