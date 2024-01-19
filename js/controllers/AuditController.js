define([], function () {

    function AuditController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;

                getQueries.getQuery($scope.connectingString, "getAudit").then(function (response) {
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
                    }
                    $("body").removeClass("loading");
                });
            });
        };


        $scope.init();
    }

    AuditController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return AuditController;
});