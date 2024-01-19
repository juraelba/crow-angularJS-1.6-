define(['moment'], function (moment) {

    function config($routeProvider, $mdDateLocaleProvider) {
        $routeProvider
        .when('/', {
            templateUrl: "templates/kpi.html",
            controller: "KpiController",
            name: "KpiController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        })
        .when('/kpi-projects', {
        templateUrl: "templates/kpiProjects.html",
        controller: "KpiProjectsController",
        name: "KpiProjectsController",
        resolve: {
            auth: function (authServiceAlternative) {
                return authServiceAlternative.getAuth();
            },
            permissions: function (permissions) {
                return permissions.canCurrentUserCurrentController();
            }
        }
        }).when("/projects", {
            templateUrl: "templates/page.html",
            controller: "PageController",
            name: 'PageControllerMain',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/audit", {
            templateUrl: "templates/audit.html",
            controller: "AuditController",
            name: 'AuditController',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/page/:id/:versionId/:projectId?", {
            templateUrl: "templates/page.html",
            controller: "PageController",
            name: 'PageControllerProjectPage',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/users", {
            templateUrl: "templates/home.html",
            controller: "HomeController",
            name: 'HomeController',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/hours/:week?/:employee?", {
            templateUrl: "templates/hours.html",
            controller: "HoursController",
            name: "HoursController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/all-hours", {
            templateUrl: "templates/allHours.html",
            controller: "AllHoursController",
            name: "AllHoursController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/projects", {
            templateUrl: "templates/projects.html",
            controller: "ProjectsController",
            name: "ProjectsControllerMain",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/project/:id', {
            templateUrl: "templates/project.html",
            controller: "ProjectController",
            name: "ProjectsControllerProjectPage",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/datawarehouse', {
            templateUrl: "templates/datawarehouse.html",
            controller: "DatawarehouseController",
            name: "DatawarehouseController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/results', {
            templateUrl: "templates/results.html",
            controller: "ResultsController",
            name: "ResultsController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/consistency', {
            templateUrl: "templates/consistency.html",
            controller: "ConsistencyController",
            name: "ConsistencyController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/powers', {
            templateUrl: "templates/powers.html",
            controller: "PowersController",
            name: "PowersController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/forecast', {
            templateUrl: "templates/forecast.html",
            controller: "ForecastController",
            name: "ForecastController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/report', {
            templateUrl: "templates/report.html",
            controller: "ReportController",
            name: "ReportController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/roll', {
            templateUrl: "templates/roll.html",
            controller: "RollController",
            name: "RollController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/approve', {
            templateUrl: "templates/approve.html",
            controller: "ApproveController",
            name: "ApproveController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/overview', {
            templateUrl: "templates/overview.html",
            controller: "OverviewController",
            name: "OverviewController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/purchase', {
            templateUrl: "templates/purchase.html",
            controller: "PurchaseController",
            name: "PurchaseController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/exploitation', {
            templateUrl: "templates/exploitation.html",
            controller: "ExploitationController",
            name: "ExploitationController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/cover', {
            templateUrl: "templates/cover.html",
            controller: "CoverController",
            name: "CoverController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/tasks', {
            templateUrl: "templates/tasks.html",
            controller: "TasksController",
            name: "TasksController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/instellingen', {
            templateUrl: "templates/instellingen.html",
            controller: "InstellingenController",
            name: "InstellingenController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/employees', {
            templateUrl: "templates/employees.html",
            controller: "EmployeesController",
            name: "EmployeesController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/complete', {
            templateUrl: "templates/complete.html",
            controller: "CompleteController",
            name: "CompleteController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/billing', {
            templateUrl: "templates/billing.html",
            controller: "BillingController",
            name: "BillingController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/hours-send', {
            templateUrl: "templates/hoursSend.html",
            controller: "HoursSendController",
            name: "HoursSendController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/zeno', {
            templateUrl: "templates/zeno.html",
            controller: "ZenoController",
            name: "ZenoController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/activities', {
            templateUrl: "templates/activities.html",
            controller: "ActivitiesController",
            name: "ActivitiesController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/documents', {
            templateUrl: "templates/documents.html",
            controller: "DocumentController",
            name: "DocumentController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when('/profile', {
            templateUrl: "templates/profile.html",
            controller: "ProfileController",
            name: "ProfileController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                }
            }
        }).when('/password-change', {
            templateUrl: "templates/password-change.html",
            controller: "PasswordChangeController",
            name: "PasswordChangeController",
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                }
            }
        }).when('/password-reset', {
            templateUrl: "templates/password-reset.html",
            controller: "PasswordResetController",
            name: "PasswordResetController",
        }).when('/password-reset-email', {
            templateUrl: "templates/password-reset-email.html",
            controller: "PasswordResetController",
            name: "PasswordResetControllerEmail",
        }).when('/password-reset-email-success', {
            templateUrl: "templates/password-reset-email-success.html",
            controller: "PasswordResetController",
            name: "PasswordResetControllerEmail",
        }).when('/password-reset-success', {
            templateUrl: "templates/password-reset-success.html",
            controller: "PasswordResetController",
            name: "PasswordResetControllerEmail",
        }).when("/tags", {
            templateUrl: "templates/tags.html",
            controller: "TagsController",
            name: 'TagsController',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/tag-groups", {
            templateUrl: "templates/tagGroups.html",
            controller: "TagGroupsController",
            name: 'TagGroupsController',
            resolve: {
                auth: function (authServiceAlternative) {
                    return authServiceAlternative.getAuth();
                },
                permissions: function (permissions) {
                    return permissions.canCurrentUserCurrentController();
                }
            }
        }).when("/login", {
            templateUrl: "templates/login.html",
            controller: "LoginController"
        });

        $mdDateLocaleProvider.formatDate = function (date) {
            return moment(date).format('DD/MM/YYYY');
        };
    }

    config.$inject = ['$routeProvider', '$mdDateLocaleProvider'];

    return config;
});