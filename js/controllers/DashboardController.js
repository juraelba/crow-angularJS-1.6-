define([], function () {

    function DashboardController($scope, auth, $rootScope) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.register = [];
        $rootScope.rootUser = auth;

        $scope.init = function () {
            
        };

        $scope.init();
    }

    DashboardController.$inject = ["$scope", "auth", "$rootScope"];

    return DashboardController;
});