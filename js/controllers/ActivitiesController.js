define([], function () {

    function ActivitiesController($scope, auth, $rootScope, getQueries, NgTableParams, filteredListService) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.search = '';

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getActiviteitenGrid").then(function (response) {
                    $scope.allItems = response;
                    $scope.searching();
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.searching = function () {
            var data = filteredListService.searched($scope.allItems, $scope.search);
            if ($scope.search === '') {
                data = $scope.allItems;
            }
            if (data.length > 0) {
                $scope.cols = $scope.generateColumns(data[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: 10
                }, {
                    filterDelay: 0,
                    dataset: data
                });
                $scope.cols[0].show = false;
            } else {
                $scope.tableParams = null;
                $scope.cols = null;
            }
        };

        $scope.showDetails = function (row) {
            $scope.row = row;
            $('.modalAdditional').show();
        };

        $scope.remove = function (row) {
            getQueries
                .addPost($scope.connectingString, 'deleteActiviteiten',
                    {
                        'id': row.key
                    }
                )
                .then(function (response) {
                    $scope.init();
                });
        };

        $scope.saveForm = function () {
            var sendFunction = $scope.row.key ? 'putActiviteit' : 'postActiviteit ';
            var data = {
                omschrijving: $scope.row.value
            };
            if ($scope.row.key) {
                data['id'] = $scope.row.key;
            }
            getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                if (response.data.Success) {
                    $scope.row = {};
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.init();
    }

    ActivitiesController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "filteredListService"];

    return ActivitiesController;
});