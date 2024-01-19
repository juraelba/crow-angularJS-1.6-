define(['config/config',
        'run/run',
        'factories/authService',
        'factories/authenticationSvc',
        'factories/getQueries',
        'factories/getFromWebService',
        'factories/angularSoap',
        'factories/constructTable',
        'factories/constructTab',
        'factories/constructForm',
        'factories/typeGrid',
        'factories/typeProjectdetail',
        'factories/constructFormTab',
        'factories/constructResults',
        'factories/constructForecast',
        'factories/constructReport',
        'factories/constructTotalResults',

        'factories/permissions',
        'factories/authServiceAlternative',
        'factories/helpers',
        'factories/constructPowers',

        'controllers/LoginController',
        'controllers/HomeController',
        'controllers/ProjectsController',
        'controllers/ProjectController',
        'controllers/DashboardController',
        'controllers/PageController',
        'controllers/KpiController',
        'controllers/DatawarehouseController',
        'controllers/ResultsController',
        'controllers/ForecastController',
        'controllers/HoursController',
        'controllers/AllHoursController',
        'controllers/RollController',
        'controllers/ApproveController',
        'controllers/OverviewController',
        'controllers/PurchaseController',
        'controllers/ExploitationController',
        'controllers/CoverController',
        'controllers/TasksController',
        'controllers/EmployeesController',
        'controllers/CompleteController',
        'controllers/ReportController',
        'controllers/BillingController',
        'controllers/ZenoController',
        'controllers/ActivitiesController',
        'controllers/ProfileController',
        'controllers/PasswordChangeController',
        'controllers/AuditController',
        'controllers/KpiProjectsController',
        'controllers/PowersController',
        'controllers/ConsistencyController',
        'controllers/InstellingenController',
        'controllers/HoursSendController',
        'controllers/TagsController',
        'controllers/TagGroupsController',
        'controllers/PasswordResetController',
        'controllers/DocumentController',

        'directives/limitTo',
        'directives/tabs',
        'directives/formUpdate',
        'directives/formCreate',
        'directives/chosen',
        'directives/datepicker',
        'services/filteredListService',

        'directives/trackedTable',
        'directives/trackedTableRow',
        'directives/trackedTableCell',
        'directives/batcheditable',

        // subtabs batcheditable configs
        'batchEditTableConfig/kostenOOP',
        'batchEditTableConfig/kostenUren',
        'batchEditTableConfig/opbrengstenUren',
        'batchEditTableConfig/opbrengstenOOP',

        '../env'
    ],

    function (config,
              run,
              authService,
              authenticationSvc,
              getQueries,
              getFromWebService,
              angularSoap,
              constructTable,
              constructTab,
              constructForm,
              typeGrid,
              typeProjectdetail,
              constructFormTab,
              constructResults,
              constructForecast,
              constructReport,
              constructTotalResults,

              permissions,
              authServiceAlternative,
              helpers,
              constructPowers,

              LoginController,
              HomeController,
              ProjectsController,
              ProjectController,
              DashboardController,
              PageController,
              KpiController,
              DatawarehouseController,
              ResultsController,
              ForecastController,
              HoursController,
              AllHoursController,
              RollController,
              ApproveController,
              OverviewController,
              PurchaseController,
              ExploitationController,
              CoverController,
              TasksController,
              EmployeesController,
              CompleteController,
              ReportController,
              BillingController,
              ZenoController,
              ActivitiesController,
              ProfileController,
              PasswordChangeController,
              AuditController,
              KpiProjectsController,
              PowersController,
              ConsistencyController,
              InstellingenController,
              HoursSendController,
              TagsController,
              TagGroupsController,
              PasswordResetController,
              DocumentController,

              limitTo,
              tabs,
              formUpdate,
              formCreate,
              chosen,
              datepicker,
              filteredListService,
              trackedTable,
              trackedTableRow,
              trackedTableCell,
              batcheditable,
              kostenOOPConfig,
              kostenUrenConfig,
              opbrengstenUrenConfig,
              opbrengstenOOPConfig,
              env) {

        'use strict';
        var app = angular.module("securityApp", [
            "ngRoute",
            "ngTable",
            "am.multiselect",
            "ngMaterial",
            "ngMessages",
            "localytics.directives",
            "ngFlash",
            'ngBootbox',
            '720kb.tooltips',
            'chart.js'
        ]);
        app.config(config);
        app.run(run);
        app.factory('authService', authService);
        app.factory('authenticationSvc', authenticationSvc);
        app.factory('getQueries', getQueries);
        app.factory('getFromWebService', getFromWebService);
        app.factory('angularSoap', angularSoap);
        app.factory('constructTable', constructTable);
        app.factory('constructTab', constructTab);
        app.factory('constructForm', constructForm);
        app.factory('typeGrid', typeGrid);
        app.factory('typeProjectdetail', typeProjectdetail);
        app.factory('constructFormTab', constructFormTab);
        app.factory('constructResults', constructResults);
        app.factory('constructForecast', constructForecast);
        app.factory('constructReport', constructReport);
        app.factory('constructTotalResults', constructTotalResults);

        app.factory('permissions', permissions);
        app.factory('authServiceAlternative', authServiceAlternative);
        app.factory('helpers', helpers);
        app.factory('constructPowers', constructPowers);

        app.controller('LoginController', LoginController);
        app.controller('HomeController', HomeController);
        app.controller('ProjectsController', ProjectsController);
        app.controller('ProjectController', ProjectController);
        app.controller('DashboardController', DashboardController);
        app.controller('PageController', PageController);
        app.controller('KpiController', KpiController);
        app.controller('DatawarehouseController', DatawarehouseController);
        app.controller('ResultsController', ResultsController);
        app.controller('ForecastController', ForecastController);
        app.controller('HoursController', HoursController);
        app.controller('AllHoursController', AllHoursController);
        app.controller('RollController', RollController);
        app.controller('ApproveController', ApproveController);
        app.controller('OverviewController', OverviewController);
        app.controller('PurchaseController', PurchaseController);
        app.controller('ExploitationController', ExploitationController);
        app.controller('CoverController', CoverController);
        app.controller('TasksController', TasksController);
        app.controller('EmployeesController', EmployeesController);
        app.controller('CompleteController', CompleteController);
        app.controller('ReportController', ReportController);
        app.controller('BillingController', BillingController);
        app.controller('ZenoController', ZenoController);
        app.controller('ActivitiesController', ActivitiesController);
        app.controller('ProfileController', ProfileController);
        app.controller('PasswordChangeController', PasswordChangeController);
        app.controller('AuditController', AuditController);
        app.controller('KpiProjectsController', KpiProjectsController);
        app.controller('PowersController', PowersController);
        app.controller('ConsistencyController', ConsistencyController);
        app.controller('InstellingenController', InstellingenController);
        app.controller('HoursSendController', HoursSendController);
        app.controller('TagsController', TagsController);
        app.controller('TagGroupsController', TagGroupsController);
        app.controller('PasswordResetController', PasswordResetController);
        app.controller('DocumentController', DocumentController);

        app.directive('limitTo', limitTo);
        app.directive('tabs', tabs);
        app.directive('formUpdate', formUpdate);
        app.directive('formCreate', formCreate);
        app.directive('chosen', chosen);
        app.directive('datepicker', datepicker);
        app.service('filteredListService', filteredListService);

        app.directive('trackedTable', trackedTable);
        app.directive('trackedTableRow', trackedTableRow);
        app.directive('trackedTableCell', trackedTableCell);
        app.directive('batcheditable', batcheditable);

        app.factory('kostenOOPConfig', kostenOOPConfig);
        app.factory('kostenUrenConfig', kostenUrenConfig);
        app.factory('opbrengstenUrenConfig', opbrengstenUrenConfig);
        app.factory('opbrengstenOOPConfig', opbrengstenOOPConfig);
        app.factory('env', env);
    });