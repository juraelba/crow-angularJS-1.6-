define([], function () {

    function PasswordResetController($http, $scope, authenticationSvc, $rootScope, getQueries, env, $window) {
        $scope.messageError = '';
        $scope.messageSuccess = '';

        $scope.email = '';
        $scope.newPassword = '';
        $scope.newPasswordRepeat = '';
        $scope.connectingString = '';
        const currentUrl = window.location.href.split('#')[0];
        $scope.resetPasswordBaseUrl = currentUrl + '#!/password-reset';
		$scope.resetPasswordEmailSuccessUrl = currentUrl + '#!/password-reset-email-success';
		
		$scope.showPasswordExpiryWarningMessage=false;
		
		var showWarning=  getUrlParameter('showWarning',window.location.href);
		if(showWarning !=null && showWarning =="true")
		{
			$scope.showPasswordExpiryWarningMessage=true;
		}

        $scope.resetPassword = function () {
            $("body").addClass("loading");

             $scope.sendResetRequest();
        };

        $scope.sendResetRequest = function () {
            $("body").addClass("loading");
            const data = {
                email: $scope.email,
                resetPasswordBaseUrl: $scope.resetPasswordBaseUrl,
            };

            getQueries.sendResetPasswordEmail(data).then(function (response) {
                $("body").removeClass("loading");
                window.location.href = $scope.resetPasswordEmailSuccessUrl;
            });
        };

        $scope.resetPasswordFinal = function () {
			$scope.messageError="";
			var code=$window.sessionStorage.PasswordResetToken;
            const data = {
                    Email: $scope.email,
                    Password: $scope.newPassword,
                    ConfirmPassword: $scope.newPasswordRepeat,
                    Code: code,
                };
				
			var resetPasswordEmailUrl=env.webservice + "/api/accountmanagemnet/ResetPassword";
			console.log(resetPasswordEmailUrl);
			
            return $http({
                url: resetPasswordEmailUrl,
                method: "POST",
				data:data				
               
            }).then(function (result) {
				$("body").removeClass("loading");
                window.location.href = '#!/password-reset-success';
            }, function (error) {
				 if(error && error.data && error.data.Message)
				 {
					$scope.messageError=error.data.Message;
				 }
				  
				 if(error && error.data && error.data.ModelState)
				 {
					var propStrings = Object.keys(error.data.ModelState);
					$.each(propStrings, function (i, propString) {
						var propErrors = error.data.ModelState[propString];
						$.each(propErrors, function (j, propError) {
							$scope.messageError += "\n"+ propError;
						});
					});

					
				 }
				 
                    $("body").removeClass("loading");
            });
        }

    }

    function getUrlParameter(name, url) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&]*)');
        var results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1]);
    }

    PasswordResetController.$inject = ["$http", "$scope", "authenticationSvc", "$rootScope", "getQueries", "env", "$window"];

    return PasswordResetController;
});