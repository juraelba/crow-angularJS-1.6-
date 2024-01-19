define(['angular', 'domReady'], function (angular, domReady) {
    'use strict';
    domReady(function () {
        return angular.bootstrap(document.body, ['securityApp']);
    });
});