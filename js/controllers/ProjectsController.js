define([], function () {

    function ProjectsController($scope, NgTableParams, auth, getQueries, constructForm, $rootScope,  helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.newProject = [];
        $scope.versionId = false;
        $rootScope.rootUser = auth;
        $scope.init = function () {
            // console.log('1231231231')
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getProjects").then(function (response) {
                    var data = response;
                    data = data.filter(function (item) {
                        if (item['Indirect']===true){
                            if (helpers.userHasRole(['Administrator', 'Directie'])){
                                return item;
                            }
                        } else {
                            return item;
                        }
                    });

                    if (data.length > 0) {
                        $scope.cols = $scope.generateColumns(data[0]);
                        $scope.cols[helpers.getIdByFieldName(data[0], 'Indirect')].show = false;

                        $scope.tableParams = new NgTableParams({
                            page: 1, // show first page
                            count: 10 // count per page
                        }, {
                            filterDelay: 0,
                            dataset: data
                        });
                        
                    }
                    
                    $("body").removeClass("loading");
                });
                getQueries.getQuery($scope.connectingString, "getFormFields?form=projectMaster").then(function (response) {
                    $scope.projectForm = constructForm.init($scope.connectingString, response);
                    // console.log($scope.projectForm);
                    $("body").removeClass("loading");
                });
                // getQueries.getQuery($scope.connectingString, "getProjectManagers").then(function (response) {
                //     $scope.projectManagers = response;
                // });
                getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                    $scope.projectTeams = response;
                });
            });
        };

        $scope.showProjectForm = function () {
            if ($scope.userInfo.roleName === 'Project control') $('.modalWindow').show();
        };

        $scope.addProject = function () {
            var data = {
                naam: $scope.newProject.Projectnaam,
                programma: $scope.newProject.Programma,
                projectmanager: $scope.newProject.Projectmanager,
                team: $scope.newProject.Team,
                autorisatie: 'test',
                // $scope.newProject['Autorisatie door']
                projectnummer: 'test'
                // $scope.newProject.projectnummer
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, "postProjectMaster", data).then(function (response) {
                if (response.data.Success) {
                    $scope.versionId = response.data.NewId;
                    $scope.newProject = [];
                    $('.modalWindow').hide();
                    $('.modalAdditional').show();
                    $("body").removeClass("loading");
                } else {
                    $scope.newProject.error = response.data.ErrorMessage;
                    $("body").removeClass("loading");
                }
            });
        };

        $scope.addAfgestemdMet = function () {
            angular.forEach($scope.newProject.afgestemdMet, function (value, key) {
                $("body").addClass("loading");
                var data = {
                    versieid: Number($scope.versionId),
                    afgestemdmet: Number(value)
                };
                getQueries.addPost($scope.connectingString, "postProjectAfgestemdMet", data).then(function (response) {
                    // console.log(response);
                });
            });
            $('.modalAdditional').hide();
            $("body").removeClass("loading");
            $scope.init();
        };

        $scope.init();
    }

    ProjectsController.$inject = ["$scope", "NgTableParams", "auth", "getQueries", "constructForm", "$rootScope", "helpers"];

    return ProjectsController;
});