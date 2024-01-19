define([], function () {

    function TagsController($scope, auth, $rootScope, NgTableParams, getQueries) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.row = {};
        $scope.groups = [];
        $scope.tagDropdown = [];
        $scope.projectDropdown = [];
        $scope.project = {};
        $scope.selectedTagId = 0;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getTagDropdown").then(function (response) {
                    $scope.tagDropdown = response;
                    getQueries.getQuery($scope.connectingString, "getProjectDropdown?username=" + $scope.userInfo.userName).then(function (response) {
                        $scope.projectDropdown = response;
                        getQueries.getQuery($scope.connectingString, "getTagGroups").then(function (response) {
                            $scope.groups = response;
                            getQueries.getQuery($scope.connectingString, "getTags").then(function (response) {
                                var data = response;
                                if (data.length > 0) {
                                    $scope.cols = $scope.generateColumns(data[0]);
                                    $scope.tableParams = new NgTableParams({
                                        page: 1,
                                        count: 10
                                    }, {
                                        filterDelay: 0,
                                        dataset: data
                                    });
                                    $scope.cols[0].show = false;
                                } else {
                                    $scope.tableParams = null;
                                    $scope.cols = null;
                                }
                                $("body").removeClass("loading");
                            });
                        });
                    });
                });
            });
        };

        $scope.showDetails = function () {
            $('.modalAdditional').show();
        };

        $scope.edit = function(id){
            $scope.selectedTagId = id;
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getProjectsByTag?tagid=" + $scope.selectedTagId).then(function (response) {
                var data = [];

                angular.forEach($scope.projectDropdown, function (value, key) {
                    angular.forEach(response, function (get) {
                        if (value.key === get.ProjectId) {
                            data.push({
                                id: get.ProjectId,
                                Project: value.value
                            });
                        }
                    });
                });

                if (data.length > 0) {
                    $scope.colsProjects = $scope.generateColumns(data[0]);
                    $scope.tableParamsProjects = new NgTableParams({
                        page: 1,
                        count: 10
                    }, {
                        filterDelay: 0,
                        dataset: data
                    });
                    $scope.colsProjects[0].show = false;
                } else {
                    $scope.tableParams = null;
                    $scope.cols = null;
                }
                $('.modalAdditionalEdit').show();
                $("body").removeClass("loading");
            });
        };

        $scope.remove = function (row) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                getQueries.addPost($scope.connectingString, 'deleteTag', {tag: row}).then(function (response) {
                    if (response.data.Success) {
                        $scope.init();
                    } else {
                        $scope.row.error = response.data.ErrorMessage;
                    }
                });
            }
        };

        $scope.saveForm = function () {
            getQueries.addPost($scope.connectingString, 'postTag', {
                tag: $scope.row.Tag,
                groupid: $scope.row.Group
            }).then(function (response) {
                if (response.data.Success) {
                    $scope.row = {};
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.editForm = function() {
            getQueries.addPost($scope.connectingString, 'postTagProject', {
                tagid: $scope.selectedTagId,
                projectid: $scope.project
            }).then(function (response) {
                if (response.data.Success) {
                    $scope.project = {};
                    $scope.edit($scope.selectedTagId);
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.removeProject = function (projectId) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                getQueries.addPost($scope.connectingString, 'deleteTagProject', {tagid: $scope.selectedTagId, projectid: projectId}).then(function (response) {
                    if (response.data.Success) {
                        $scope.edit($scope.selectedTagId);
                    } else {
                        $scope.row.error = response.data.ErrorMessage;
                    }
                });
            }
        };

        $scope.init();
    }

    TagsController.$inject = ["$scope", "auth", "$rootScope", "NgTableParams", "getQueries"];

    return TagsController;
});