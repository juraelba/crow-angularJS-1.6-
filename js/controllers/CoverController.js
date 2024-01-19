define([], function () {

    function CoverController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.cover = {};

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getArtikelenFromDWH").then(function (response) {
                    $scope.items = response;
                });
                getQueries.getQuery($scope.connectingString, "getDekking").then(function (response) {
                    var data = response;
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
                        $scope.cols[0].show = false;
                    }
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.showDetails = function (cover) {
            $scope.cover = cover;
            angular.forEach($scope.items, function (item) {
                if (item.value == cover.Artikel) {
                    cover.Artikel = item.key;
                }
            });
            $('.modalAdditional').show();
        };

        $scope.saveForm = function () {
            var sendFunction = $scope.cover.id ? 'putDekking' : '';
            var data = {
                Naam: $scope.cover.Omschrijving,
                Artikel: $scope.cover.Artikel,
                Percentage: $scope.cover.percentage
            };
            if($scope.cover.id){
                data['Id'] = $scope.cover.id;
            }
            getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                if (response.data.Success) {
                    $scope.cover = {};
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.cover.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.init();
    }

    CoverController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return CoverController;
});