define([], function () {

    permissions.$inject = ['$route', 'authenticationSvc', '$q'];

    function permissions($route, authenticationSvc, $q) {

        // in the rules the route.name field (e.g. "PageControllerProjectPage" for the "/page/:id/:versionId?" route)
        var permissionRules = {
            'Administrator': {},
            'Directie': {
                'PageControllerMain': true,
                'PageControllerProjectPage': true,
                'HoursController': true,
                'KpiController': true,
                'KpiProjectsController': true,
                'ResultsController': true,
                'ReportController': true,
                'OverviewController': true,
                'TasksController': true,
                'ApproveController': true,
                'CompleteController': true,
                'PowersController': true
            },
            'Financiele administratie': {
                'PageControllerMain': true,
                'PageControllerProjectPage': true,
                'HoursController': true,
                'ProjectsControllerMain': true,
                'KpiController': true,
                'ResultsController': true,
                'ForecastController': true,
                'ReportController': true,
                'OverviewController': true,
                'TasksController': true,
                'BillingController': true,
                'PowersController': true
            },
            'Producent': {
                'PageControllerMain': true,
                'PageControllerProjectPage': true,
                'HoursController': true,
                'ProjectsControllerMain': true,
                'KpiController': true,
                'ResultsController': true,
                'ForecastController': true,
                'ReportController': true,
                'OverviewController': true,
                'TasksController': true,
                'ApproveController': true,
                'PowersController': true,
                'KpiProjectsController': true
            },
            'Projectleider': {
                'PageControllerMain': true,
                'PageControllerProjectPage': true,
                'HoursController': true,
                'ProjectsControllerMain': true,
                'KpiController': true,
                'ResultsController': true,
                'ForecastController': true,
                'ReportController': true,
                'OverviewController': true,
                'TasksController': true,
                'ApproveController': true,
                'PowersController': true,
                'KpiProjectsController': true
            },
            'Project control': {
                'PageControllerMain': true,
                'PageControllerProjectPage': true,
                'HoursController': true,
                'ProjectsControllerMain': true,
                'KpiController': true,
                'ResultsController': true,
                'ForecastController': true,
                'ReportController': true,
                'OverviewController': true,
                'TasksController': true,
                'ApproveController': true,
                'PowersController': true,
                'KpiProjectsController': true,
                'DocumentController': true,
                'TagsController': true,

            },
            'RegularUser': {
                // 'HoursController': true,
                // 'OverviewController': true,
                // 'PageControllerProjectPage': true,
            },
            'Teamleider': {},
            'Urenschrijver':{
                'HoursController': true,
                'OverviewController': true,
                'PageControllerProjectPage': true,
            }
        };

        var can = function (roleName, routeName) {
            if (roleName === 'Administrator') {
                return true; //admin can do everything
            } else {
                var existingRulesForRole = permissionRules[roleName];
                if (existingRulesForRole === undefined) {
                    return false; //undefined role
                } else {
                    return existingRulesForRole[routeName] === true; //conclusion for the founded permission rule
                }
            }
        };

        var canCurrentUserCurrentController = function () {
            var roleName = authenticationSvc.getUserInfo().roleName;
            var routeName = $route.current.$$route.name;
            var canResult = can(roleName, routeName);

            // console.log('Permissions log:', roleName, routeName, canResult);

            return canResult ? $q.when(canResult) : $q.reject({hasPermissions: false});
        };


        return {
            can: can,
            canCurrentUserCurrentController: canCurrentUserCurrentController
        };
    }

    return permissions;
});