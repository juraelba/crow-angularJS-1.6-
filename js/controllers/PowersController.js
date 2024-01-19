define([], function () {

    function PowersController($scope, auth, getQueries, $rootScope, NgTableParams, constructPowers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.tableParams = null;
        $scope.cols = [];
        $scope.complex = {};
        $scope.showBigTable = false;
        $scope.data = [];

        $scope.years = [
            {key:2015, value:2015},
            {key:2016, value:2016},
            {key:2017, value:2017},
            {key:2018, value:2018},
            {key:2019, value:2019},
            {key:2020, value:2020},
            {key:2021, value:2021},
            {key:2022, value:2022},
            {key:2023, value:2023},
            {key:2024, value:2024},
            {key:2025, value:2025}
        ];
        $scope.selectedYear = new Date().getFullYear();

        $scope.complex = {
            cols:[],
            report:[]
        };

        $scope.init = function () {
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.getCapaciteitsplanning();
            });
        };

        $scope.getCapaciteitsplanning = function () {
            getQueries.getQuery($scope.connectingString, "getCapaciteitsplanning")
                .then(function (response) {
                    $scope.data = response;

                    fillSimpleTable(response);
                });
        };

        $scope.bigTableToggle = function () {
            if ($scope.showBigTable) {
                fillComplexTable($scope.data);
            }
        };

        function fillSimpleTable(data) {
            if (data.length > 0) {
                $scope.cols = $rootScope.generateColumns(data[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: 10
                }, {
                    filterDelay: 0,
                    dataset: data
                });
            } else {
                $scope.cols = [];
                $scope.tableParams = new NgTableParams({}, {dataset: []});
            }
        }

        function fillComplexTable(data) {
            $scope.complex = {
                cols:[],
                report:[]
            };

            constructPowers.getReportByMonths(data, $scope.selectedYear)
                .then(function (result) {
                    $scope.complex = result;
                })
        }

        $scope.init();
    }

    PowersController.$inject = ["$scope", "auth", "getQueries", "$rootScope", "NgTableParams", "constructPowers"];

    return PowersController;
});