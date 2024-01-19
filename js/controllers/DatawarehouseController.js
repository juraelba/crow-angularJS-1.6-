define([], function () {

    function DatawarehouseController($scope, auth, getQueries, getFromWebService, $rootScope) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.init = function () {
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;

            });
        };

        $scope.postData = function () {
            angular.forEach($scope.dwhs, function (item) {
                if (item.getWebservice && item.getFunctie) {
                    getFromWebService.getUserToken(item.getWebservice).then(function (response) {
                        var user = response;
                        getFromWebService.getConnectionStrings(item.getWebservice, user).then(function (response) {
                            var connectString = response;
                            getFromWebService.getQuery(item.getWebservice, user, connectString, item.getFunctie).then(function (response) {
                                $scope.data = response;
                                $("body").removeClass("loading");
                                if ($scope.data) {
                                    $("body").addClass("loading");
                                    var flag = false;
                                    angular.forEach($scope.data, function (data) {
                                        flag = false;
                                        angular.forEach(data, function (value) {
                                            if (value == '') {
                                                flag = true;
                                            }
                                        });
                                        if (flag) {
                                            angular.forEach(data, function (value, key) {
                                                data[key] = '';
                                            });
                                        }
                                        if (item.postwebservice == 'http://brandnewkey.sohosted-vps.nl:8080') {
                                            getQueries.addPost($scope.connectingString, item.postFunctie, data).then(function (response) {
                                                $("body").removeClass("loading");
                                                $('.modalAdditional').show();
                                            });
                                        } else {
                                            getFromWebService.addPost(item.postwebservice, user, connectingString, item.postFunctie, data).then(function (response) {
                                                $("body").removeClass("loading");
                                                $('.modalAdditional').show();
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                }
            });
        };

        $scope.getDWHSync = function () {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getDWHSync").then(function (response) {
                $scope.dwhs = response;
                var count = 0;
                angular.forEach($scope.dwhs, function (item) {
                    if (item.deleteFunctie) {
                        count += 1;
                    }
                });
                angular.forEach($scope.dwhs, function (item, key) {
                    if (item.deleteWebservice == 'http://brandnewkey.sohosted-vps.nl:8080' && item.deleteFunctie) {
                        getQueries.getQuery($scope.connectingString, item.deleteFunctie).then(function (response) {
                            if ((key + 1) == count) {
                                $scope.postData();
                            }
                        });
                    } else {
                        if (item.deleteFunctie) {
                            getFromWebService.getUserToken('http://brandnewkey.sohosted-vps.nl:2017').then(function (response) {
                                var user = response;
                                getFromWebService.getConnectionStrings('http://brandnewkey.sohosted-vps.nl:2017', user).then(function (response) {
                                    var connectString = response;
                                    getFromWebService.getQuery('http://brandnewkey.sohosted-vps.nl:2017', user, connectString, item.deleteFunctie).then(function (response) {
                                        if ((key + 1) == count) {
                                            $scope.postData();
                                        }
                                    });
                                });
                            });
                        }
                    }
                });

            });
        };

        $scope.getApprovedProjectsUnit = function () {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getApprovedProjectsUnit4").then(function (response) {
                $scope.data = response;
                if ($scope.data) {
                    getFromWebService.getUserToken('http://brandnewkey.sohosted-vps.nl:2017').then(function (response) {
                        var user = response;
                        getFromWebService.getConnectionStrings('http://brandnewkey.sohosted-vps.nl:2017', user).then(function (response) {
                            var connectString = response;
                            angular.forEach($scope.data, function (data) {
                                getFromWebService.addPost('http://brandnewkey.sohosted-vps.nl:2017', user, connectString, 'postProject', data).then(function (response) {
                                    $("body").removeClass("loading");
                                    $('.modalAdditional').show();
                                });
                            });
                        });
                    });
                }
            });
        };

        $scope.getApprovedProjectBudgetsUnit = function () {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getApprovedProjectBudgetsUnit4").then(function (response) {
                $scope.data = response;
                if ($scope.data) {
                    getFromWebService.getUserToken('http://brandnewkey.sohosted-vps.nl:2017').then(function (response) {
                        var user = response;
                        getFromWebService.getConnectionStrings('http://brandnewkey.sohosted-vps.nl:2017', user).then(function (response) {
                            var connectString = response;
                            angular.forEach($scope.data, function (data) {
                                getFromWebService.addPost('http://brandnewkey.sohosted-vps.nl:2017', user, connectString, 'postProjectBudget', data).then(function (response) {
                                    $("body").removeClass("loading");
                                    $('.modalAdditional').show();
                                });
                            });
                        });
                    });
                }
            });
        };

        $scope.init();
    }

    DatawarehouseController.$inject = ["$scope", "auth", "getQueries", "getFromWebService", "$rootScope"];

    return DatawarehouseController;
});