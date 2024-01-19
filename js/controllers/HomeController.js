define([], function () {

    function HomeController($scope, NgTableParams, auth, getQueries, $rootScope, filteredListService, $http) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.register = [];
        $rootScope.rootUser = auth;
        $scope.allItems = [];
        $scope.search = '';
        $scope.roles = [];
        $scope.currentRole = [];
        $scope.collapsed = true;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getRoles").then(function (response) {
                    $scope.roles = response;
                    getQueries.getQuery($scope.connectingString, "getUsers").then(function (response) {
                        $scope.allItems = response;
                        angular.forEach($scope.allItems, function (user) {
                            $scope.currentRole[user.Id] = user.RoleId;
                        });

                        if ($scope.allItems.length > 0) {
                            $scope.fillTable($scope.allItems);
                        }
                        $("body").removeClass("loading");
                    });
                });
            });
        };

        $scope.showRegister = function () {
            $('.modalWindow').show();
        };

        $scope.searching = function () {
            var data = filteredListService.searched($scope.allItems, $scope.search);
            if ($scope.search == '') {
                data = $scope.allItems;
            }
            if (data.length > 0) {
                $scope.cols = $scope.generateColumns(data[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1, // show first page
                    count: 10 // count per page
                }, {
                    filterDelay: 0,
                    dataset: data
                });
            } else {
                $scope.tableParams = null;
                $scope.cols = null;
            }
        };

        $scope.registration = function () {
            if ($scope.register.password == $scope.register.confirmPassword) {
                var data = {
                    email: $scope.register.email,
                    password: $scope.register.password,
                    confirmpassword: $scope.register.confirmPassword,
                    username: $scope.userInfo.userName
                };
                $("body").addClass("loading");
                getQueries.register(data).then(function (response) {
                    if (response.status == 200) {
                        $('.modalWindow').hide();
                        $scope.register = [];
                        $scope.init();
                    } else {
                        $scope.register.error = response.data.Message +
                            response.data.ModelState[""][0];
                    }
                    $("body").removeClass("loading");
                });
            } else {
                $scope.register.error = 'The password fields do not match';
            }
        };

        $scope.setActive = function (user) {
            getQueries.addUserPost('activateuser/' + user.Id, {}).then(function (response) {
                $scope.init();
                // if (response.statusText == 'Ok') {
                //     $scope.init();
                // } else {
                //     console.log(response);
                // }
            });
        };

        $scope.setInactive = function (user) {
            console.log('1111', user);
            getQueries.addPost($scope.connectingString, 'putInactiveUser', {loggedinuserid: user.Id}).then(function (response) {
                if (response.data.Success) {
                    $scope.init();
                }
            });
        };

        $scope.changeRole = function (userId) {
            getQueries.addPost($scope.connectingString, 'putRoleToUser',
                {
                    loggedinuserid: userId,
                    roleid: $scope.currentRole[userId]
                }
            ).then(function (response) {
                if (response.data.Success) {
                    $scope.init();
                }
            });
        };

        $scope.toggleActive = function () {
            $scope.collapsed = !$scope.collapsed;
            $scope.fillTable($scope.allItems);
        };

        $scope.fillTable = function (data) {
            var result = [];
            angular.forEach(data, function (row) {
                if ($scope.collapsed) {
                    if (row.IsActive) {
                        result.push(row);
                    }
                } else {
                    result.push(row);
                }
            });
            if (result.length > 0) {
                $scope.cols = $scope.generateColumns(result[0]);
                $scope.tableParams = new NgTableParams({
                    page: 1, // show first page
                    count: 10 // count per page
                }, {
                    filterDelay: 0,
                    dataset: result
                });
            }
        };

        $scope.editUser = function (row) {
            $scope.editEmail = row.Email;
            $('.modalEditWindow').show();
        };

        $scope.setPassword = function () {
            if ($scope.edit.password == $scope.edit.confirmPassword) {
                var data = {
                    Email: $scope.editEmail,
                    Password: $scope.edit.password,
                    ConfirmPassword: $scope.edit.confirmPassword
                };
                $("body").addClass("loading");
                getQueries.setPassword(data).then(function (response) {
                    if (response.data === "") {
                        $("body").removeClass("loading");
                        $('.modalEditWindow').hide();
                        $scope.edit = [];
                        $scope.init();
                    } else {
                        $scope.edit.error = response.data[""]._errors[0]["<ErrorMessage>k__BackingField"];
                    }
                    $("body").removeClass("loading");
                });
            } else {
                $scope.edit.error = 'The password fields do not match';
            }
        };

        $scope.init();
    }

    HomeController.$inject = ["$scope", "NgTableParams", "auth", "getQueries", "$rootScope", "filteredListService", "$http"];

    return HomeController;
});