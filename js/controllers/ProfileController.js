define([], function () {

    function ProfileController($http,$scope,$window, auth, $rootScope, getQueries, Flash,$ngBootbox,env) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
		$scope.userDetails = null;
		$scope.countries=[{country:"Netherlands",countryCode:"+31"},{country:"India",countryCode:"+91"}];
		$scope.errorMessage=null;
		$scope.phoneNumber=null;
		$scope.otp=null;
		$scope.selectedCountry=	$scope.countries[0];
		
		var userInfo = null;
		var webservice = env.webservice;

        $scope.init = function () {
            //$("body").addClass("loading");
            // getQueries.getConnectionStrings().then(function (response) {
                // $scope.connectingString = response;
                // //$("body").removeClass("loading");
            // });
			getProfileInfo();
        };

        $scope.addUpdateMobileNumber = function () {
           sendOTP();
        };
		
		$scope.showAddUpdateMobileNumberPopup = function () {
            $('.modalAddUpdatePhoneNumber').show();
        };
		
		$scope.verifyOtpAndUpdatePhoneNumber=verifyOtpAndUpdatePhoneNumber;

		$scope.init();
		
		function showErrorBootbox() {
            // if ($rootScope.showedErrorBootbox !== true) {
            //     $rootScope.showedSuccessBootbox = true;
            //     $ngBootbox.alert(bootboxErrorMessage).then(function () {
            //         $rootScope.showedErrorBootbox = false;
            //     });
            // }
        }
		 function setUserInfo($force){
            if (typeof $window.sessionStorage["userInfo"] === 'string') {
                if (null === userInfo || $force) {
                    userInfo = JSON.parse($window.sessionStorage["userInfo"]);
                }
            }
		 }
		 function getProfileInfo() {
            setUserInfo(false);

            return $http({
                url: webservice + "/api/accountmanagemnet/GetProfileInfo",
                method: "GET",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token}
            }).then(function (result) {
				$scope.userDetails = result.data;
            }, function (error) {
				showErrorBootbox();
                return error;                
            });
        };
		
		function sendOTP() {
            setUserInfo(false);

            return $http({
                url: webservice + "/api/accountmanagemnet/AddPhoneNumber",
                method: "POST",
				data: {Number:$scope.phoneNumber, CountryCode:$scope.selectedCountry.countryCode},
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token}
            }).then(function (result) {
				 $('.modalAddUpdatePhoneNumber').hide();
				 $('.modalOTP').show();
            }, function (error) {
				showErrorBootbox();
                return error;                
            });
        };
		
		function verifyOtpAndUpdatePhoneNumber() {
            setUserInfo(false);

            return $http({
                url: webservice + "/api/accountmanagemnet/VerifyPhoneNumber",
                method: "POST",
				data: {PhoneNumber:$scope.phoneNumber, Code:$scope.otp, CountryCode:$scope.selectedCountry.countryCode},
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token}
            }).then(function (result) {
				 $('.modalOTP').hide();
				 $window.location.reload();
				 
            }, function (error) {
				showErrorBootbox();
                return error;                
            });
        };
        
    }

    ProfileController.$inject = ["$http","$scope",'$window', "auth", "$rootScope", "getQueries", "Flash","$ngBootbox", "env"];

    return ProfileController;
});