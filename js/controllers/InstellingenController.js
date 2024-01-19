define(['moment'], function (moment) {

    function InstellingenController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getInstellingen").then(function (response) {
                    var data = response;
                    if (data.length > 0) {
                        $scope.allItems = data;

                        $scope.cols = $scope.generateColumns(data[0]);
                        $scope.tableParams = new NgTableParams({
                            page: 1,
                            count: 10
                        }, {
                            filterDelay: 0,
                            dataset: data
                        });
                    }
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.showDetails = function (row) {
            $scope.row = row;
            $('.modalAdditional').show();
        };

        $scope.saveForm = function () {
            var sendFunction = 'putInstelling';
            var data = {
                waarde: $scope.row.Waarde,
                label: $scope.row.Label
            };

            getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                $scope.row = {};
                $('.modalAdditional').hide();
                $scope.init();
            });
        };

        $scope.init();
    }

    InstellingenController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return InstellingenController;
});