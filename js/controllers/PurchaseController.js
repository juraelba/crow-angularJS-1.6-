define([], function () {

    function PurchaseController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.purchase = {};

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getArtikelenFromDWH").then(function (response) {
                    $scope.items = response;
                });
                getQueries.getQuery($scope.connectingString, "getInkoop").then(function (response) {
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

        $scope.showDetails = function (purchase) {
            $scope.purchase = purchase;
            angular.forEach($scope.items, function (item) {
                if (item.value == purchase.Artikel) {
                    purchase.Artikel = item.key;
                }
            });
            $('.modalAdditional').show();
        };

        $scope.saveForm = function () {
            var sendFunction = $scope.purchase.id ? 'putInkoop' : 'postInkoop';
            var data = {
                Naam: $scope.purchase.Omschrijving,
                Artikel: $scope.purchase.Artikel
            };
            if($scope.purchase.id){
                data['Id'] = $scope.purchase.id;
            }
            getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                if (response.data.Success) {
                    $scope.purchase = {};
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.purchase.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.init();
    }

    PurchaseController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return PurchaseController;
});