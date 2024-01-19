define([], function () {

    function TagGroupsController($scope, auth, $rootScope, NgTableParams, getQueries) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.row = {};

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getTagGroups").then(function (response) {
                    var data = response;
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
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.showDetails = function () {
            $('.modalAdditional').show();
        };

        $scope.remove = function (row) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                getQueries.addPost($scope.connectingString, 'deleteTagGroup', {id: row}).then(function (response) {
                    if (response.data.Success) {
                        $scope.init();
                    } else {
                        $scope.row.error = response.data.ErrorMessage;
                    }
                });
            }
        };

        $scope.saveForm = function () {
            getQueries.addPost($scope.connectingString, 'postTagGroup', {groep: $scope.row.Groep}).then(function (response) {
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

    TagGroupsController.$inject = ["$scope", "auth", "$rootScope", "NgTableParams", "getQueries"];

    return TagGroupsController;
});