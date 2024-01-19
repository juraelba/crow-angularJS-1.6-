define([], function () {

    function PasswordChangeController($scope, authenticationSvc, $rootScope, getQueries) {
        $scope.messageError = '';
        $scope.messageSuccess = '';

        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.newPasswordRepeat = '';

        $scope.changePassword = function () {
            $("body").addClass("loading");
            $scope.messageError = '';
            $scope.messageSuccess = '';

            getQueries.postQueryWithAuth(
                '/api/Account/ChangePassword',
                {
                    'OldPassword': $scope.oldPassword,
                    'NewPassword': $scope.newPassword,
                    'ConfirmPassword': $scope.newPasswordRepeat
                })
                .then(function (result) {
                    console.log();
                    if (result.status === 200) {
                        $scope.messageSuccess = 'Success';
                    } else {
                        if(result.data.ModelState["model.NewPassword"]) {
                            $scope.messageError = result.data.Message + ' ' + result.data.ModelState["model.NewPassword"][0];
                        }
                        else if(result.data.ModelState["model.ConfirmPassword"]) {
                            $scope.messageError = result.data.Message + ' ' + result.data.ModelState["model.ConfirmPassword"][0];
                        }
                        else if(result.data.ModelState[""]) {
                            $scope.messageError = result.data.Message + ' ' + result.data.ModelState[""][0];
                        }
                        else {
                            $scope.messageError = 'Something went wrong.';
                        }
                    }

                    $("body").removeClass("loading");
                }, function (error) {

                    $scope.messageError = 'Error';
                    $("body").removeClass("loading");
                })
        }

    }

    PasswordChangeController.$inject = ["$scope", "authenticationSvc", "$rootScope", "getQueries"];

    return PasswordChangeController;
});