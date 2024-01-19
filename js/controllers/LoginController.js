define([], function () {

    function LoginController($scope, $location, authenticationSvc, $rootScope, $window) {
        $scope.userInfo = null;
        $scope.messsageError = null;
        $scope.otpError = null;
		
        $window.sessionStorage["userInfo"] = JSON.stringify({});
		
		$scope.checkForResetPasswordCode = function() {
			var code = getUrlParameter('code',window.location.href);
			$window.sessionStorage.PasswordResetToken=code;
			if(code != null && code.length > 0)
			{
				window.location.href = '/#!/password-reset';
			}
        };

        $scope.login = function () {
			
            $("body").addClass("loading");
            // authenticationSvc.login('johan@example.com', 'Pass@word1', $scope.userName)
            authenticationSvc.login($scope.userName, $scope.password, $scope.userName, $scope.otp)
            // authenticationSvc.login($scope.userName, $scope.password, $scope.userName)
                .then(function (result) {
                    // console.log('5555', result)
                    $scope.userInfo = result;
                    $rootScope.rootUser = result;

                    // if ($scope.userInfo.roleName === 'Urenschrijver' || $scope.userInfo.roleName === 'Financiele administratie'){
                        window.location.href = '#!/hours';
                    // } else {
                    //     window.location.href = '/';
                    // }

                    $("body").removeClass("loading");
                }, function (error) {
                    // $scope.messsageError = error.data.error_description;

                    if(error && error.data && error.data.error=="otp_required")
					{
						//show otp popup
						$('.modalOTP').show();
					}
					else if(error && error.data && error.data.error=="invalid_otp")
					{
						$scope.otpError = error.data.error_description;
					}
					else if(error && error.data && error.data.error === "reset_password")
					{
						$scope.otpError = error.data.error_description;
                        window.location.href = '#!/password-reset-email?showWarning=true';
					}
					else{
						$scope.messsageError = error.data.error_description;
					}
                    $("body").removeClass("loading");
                });
        };

        $scope.cancel = function () {
            $scope.userName = "";
            $scope.password = "";
        };
		
		function getUrlParameter(name, url) {
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			var regex = new RegExp('[\\?&]' + name + '=([^&]*)');
			var results = regex.exec(url);
			return results === null ? '' : decodeURIComponent(results[1]);
		}
		
		$scope.checkForResetPasswordCode();
    }

    LoginController.$inject = ["$scope", "$location", "authenticationSvc", "$rootScope", '$window'];

    return LoginController;
});

