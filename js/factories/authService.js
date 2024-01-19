define([], function () {

    authService.$inject = [
        '$q',
        'authenticationSvc'
    ];

    function authService($q,
                         authenticationSvc) {

        var userInfo = authenticationSvc.getUserInfo();
        if (userInfo) {

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

    return authService;
});