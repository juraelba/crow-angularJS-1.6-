define([], function () {

    function CompleteController($scope, auth, $rootScope, getQueries, Flash) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $("body").removeClass("loading");
            });
        };

        $scope.showAdditional = function () {
            $('.modalAdditional').show();
        };

        $scope.complete = function () {
            getQueries.getQuery($scope.connectingString, "bulkGoedkeurenUren").then(function (response) {
                $('.modalAdditional').hide();
                if (response[0]) {
                    var message = '<strong>'+response[0].statusUpdate+'</strong>';
                    Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                } else {
                    var message = '<strong>Something went wrong</strong>';
                    Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                }
            });
        };

        $scope.init();
    }

    CompleteController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "Flash"];

    return CompleteController;
});