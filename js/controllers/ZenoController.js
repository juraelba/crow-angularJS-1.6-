define(['moment'], function (moment) {

    function ZenoController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $rootScope.rootUser = auth;
        $scope.connectingString = null;

        $scope.checkbox1 = false;

        $scope.init = function () {
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.getData();
            });
        };

        $scope.$watch('checkbox1', function () {
            $scope.getData();
        });

        $scope.getData = function () {
            if ($scope.connectingString) {
                $("body").addClass("loading");

                if (!$scope.checkbox1) {
                    getQueries.getQuery($scope.connectingString, "getGekoppeldeZenoArtikelen").then(function (response) {
                        $scope.buildTable(response);
                        $("body").removeClass("loading");
                    });
                } else {
                    getQueries.getQuery($scope.connectingString, "getNietGekoppeldeZenoArtikelen").then(function (response) {
                        $scope.buildTable(response);
                        $("body").removeClass("loading");
                    });
                }
            }
        };

        $scope.buildTable = function (data) {
            if (data.length > 0) {
                $scope.cols = $scope.generateColumns(data[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: 10
                }, {
                    filterDelay: 0,
                    dataset: data
                });
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

        $scope.init();
    }

    ZenoController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return ZenoController;
});