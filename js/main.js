requirejs.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        'jquery': 'vendor/jquery/dist/jquery.min',
        'jquery-ui': 'vendor/jquery-ui/jquery-ui.min',
        'underscore': 'vendor/underscore/underscore',
        'bootstrap': 'vendor/bootstrap/dist/js/bootstrap.min',
        'chosen.jquery': 'vendor/chosen/chosen.jquery',
        'angular': 'vendor/angular/angular.min',
        'domReady': 'vendor/requirejs-domready/domReady',
        'ngRoute': 'vendor/angular-route/angular-route.min',
        'ngTable': 'vendor/ng-table/dist/ng-table.min',
        'am.multiselect': 'vendor/amitava82-angular-multiselect/dist/multiselect',
        'ngAria': 'vendor/angular-aria/angular-aria.min',
        'ngAnimate': 'vendor/angular-animate/angular-animate.min',
        'ngMaterial': 'vendor/angular-material/angular-material.min',
        'ngMessages': 'vendor/angular-messages/angular-messages.min',
        'localytics.directives': 'vendor/angular-chosen-localytics/dist/angular-chosen.min',
        'moment': 'vendor/moment/min/moment-with-locales.min',
        'ngFlash': 'vendor/angular-flash-alert/dist/angular-flash',
        'securityApp': 'securityApp',
        // 'lteApp': 'app',
        'bootstrapper': 'bootstrapper',
        'soapclient': 'vendor/angular-soap/soapclient',
        'bootbox' : 'vendor/bootbox/bootbox',
        'ngBootbox' :'vendor/ngBootbox/dist/ngBootbox.min',
        'angular-tooltips': 'vendor/angular-tooltips/dist/angular-tooltips',
        'chart':'vendor/chart.js/dist/Chart.min',
        'angular-chart':'vendor/angular-chart.js/dist/angular-chart.min'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'underscore': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'chosen.jquery': {
            deps: ['jquery']
        },
        'chart': {
            deps: ['jquery']
        },
        // 'lteApp': {
        //     deps: ['jquery', 'bootstrap']
        // },
        'angular': {
            deps: ['jquery', 'chosen.jquery'],
            exports: 'angular'
        },
        'angular-tooltips': {
            deps: ['jquery', 'angular']
        },
        'angular-chart': {
            deps: ['chart', 'angular']
        },
        'bootbox' : {
            deps: ['jquery', 'bootstrap']
        },
        'ngBootbox': {
            deps:['jquery', 'angular', 'bootstrap', 'bootbox']
        },
        'ngRoute': {
            deps: ['angular']
        },
        'ngTable': {
            deps: ['angular']
        },
        'ngFlash': {
            deps: ['angular']
        },
        'am.multiselect': {
            deps: ['angular']
        },
        'ngAria': {
            deps: ['angular']
        },
        'ngAnimate': {
            deps: ['angular']
        },
        'ngMessages': {
            deps: ['angular']
        },
        'ngMaterial': {
            deps: ['angular']
        },
        'soapclient': {
            deps: ['angular']
        },
        'localytics.directives': {
            deps: ['angular', 'chosen.jquery']
        },
        'securityApp': {
            deps: [
                'angular',
                'ngRoute',
                'ngMaterial',
                'ngTable',
                'am.multiselect',
                'ngAria',
                'ngAnimate',
                'ngMessages',
                'localytics.directives',
                'ngFlash',
                'ngBootbox',
                'angular-tooltips'
            ]
        },
        'bootstrapper': {
            deps: [
                'angular',
                'ngRoute',
                'ngTable',
                'am.multiselect',
                'ngAria',
                'ngAnimate',
                'ngMessages',
                'ngMaterial',
                'localytics.directives',
                'ngFlash',
                'ngBootbox',
                'securityApp',
                'angular-tooltips'
            ]
        }
    },
    deps: ['bootstrapper']
});
require([
    'jquery',
    'jquery-ui',
    'moment',
    'underscore',
    'bootstrap',
    'chosen.jquery',
    'angular-tooltips',
    'chart',
    'angular-chart'
    // 'lteApp'
], function () {
    'use strict';
    $(function () {

        var modal = document.getElementsByClassName('modalWindow');
        // When the user clicks anywhere outside of the modal, close it
        // window.onclick = function (event) {
        //     $('.modalAdditional').each(function (i, obj) {
        //         if (event.target == obj) {
        //             hidePopup($(obj));
        //         }
        //     });
        //     $('.modalStatus').each(function (i, obj) {
        //         if (event.target == obj) {
        //             hidePopup($(obj));
        //         }
        //     });
        //     if (event.target == modal[0]) {
        //         hidePopup($(modal[0]));
        //     }
        // };

        $(document).on('click', '.close', function () {
            hidePopup($(this).parents('.modal'));
        });

        function hidePopup($object) {
            if (!$object.hasClass('redModalAdditionalClose') && !$object.hasClass('confirmDisabled')) {
                if (confirm("Weet u zeker dat u dit formulier, zonder op te slaan, wilt afsluiten?")) {
                    $object.css('display', 'none');
                }
            } else {
                $object.css('display', 'none');
            }
        }

        $(document).on('click', 'td', function () {
            var i = $(this).find('i');
            if (i.hasClass('fa-plus')) {
                i.removeClass('fa-plus').addClass('fa-minus');
            } else {
                if (i.hasClass('fa-minus')) {
                    i.removeClass('fa-minus').addClass('fa-plus');
                }
            }
        });
    });
});