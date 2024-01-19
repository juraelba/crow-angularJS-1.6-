define([], function () {

    authServiceAlternative.$inject = ['$q', 'authenticationSvc', "$rootScope"];

    function authServiceAlternative($q, authenticationSvc, $rootScope) {

        function getAuth() {
            var userInfo = authenticationSvc.getUserInfo();
            if (userInfo) {

                $rootScope.rootUser = userInfo;

                if (new Date(userInfo.expires) < new Date()) {
                    window.location.href = '#!/login';

                    return $q.reject({authenticated: false});
                } else {
                    $('body').removeClass('skin-blue login-page').addClass('skin-blue');
                    return $q.when(userInfo);
                }


            } else {
                $('body').removeClass('skin-blue login-page').addClass('login-page');

                window.location.href = '#!/login';

                return $q.reject({authenticated: false});
            }
        }

        return {
            getAuth: getAuth
        }
    }

    return authServiceAlternative;
});