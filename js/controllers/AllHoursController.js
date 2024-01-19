define(['moment'], function (moment) {
    function AllHoursController($scope, auth, $rootScope, getQueries, Flash, NgTableParams, $routeParams, $timeout, $mdDateLocale, $filter, helpers) {
        $scope.userInfo = auth;
        console.log('111111', $scope.userInfo);
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.cols = [];
        $scope.checkbox = [];
        $scope.listOfId = [];
        $scope.search = '';
        $scope.data = '';
        $scope.filterDateBegin = moment().startOf('year').subtract(2, 'years').format("DD-MM-YYYY");
        $scope.filterDateEnd = moment().format("DD-MM-YYYY");

        $mdDateLocale.parseDate = function (dateString) {
            var m = moment(dateString, 'DD/MM/YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getHoursList").then(function (response) {
                    var data = response;
                    $scope.data = data;
                    if (data.length > 0) {

                        let dateBegin = changeFormat($scope.filterDateBegin);
                        let dateEnd = changeFormat($scope.filterDateEnd);

                        data = data.filter(function (item) {

                            return moment(item.Datum).isBetween(dateBegin, dateEnd, null, '[]');
                        });

                        data = data.map(function (item, key) {
                            item['Datum'] = moment(item['Datum']).format("DD-MM-YYYY");
                            $scope.checkbox[item.Id] = 0;

                            return item;
                        });

                        $scope.cols = helpers.mapColumns([], [
                            '',
                            'Id',
                            'medewerker',
                            'Projectcode',
                            'Datum',
                            'Week',
                            'jaar',
                            'Uren',
                            'status',
                        ]);
                        $scope.cols[0].filter = false;

                        $scope.hoursTable = new NgTableParams({
                            page: 1, // show first page
                            count: 8
                        }, {
                            filterDelay: 0,
                            dataset: data,
                            counts: []
                        });
                    }
                    $("body").removeClass("loading");
                });
            });
        };

        $scope.init();

        $scope.filterData = function() {
            $scope.init();
        };

        $scope.toggleId = function (id) {
            if ($scope.listOfId.indexOf(id) < 0) {
                $scope.listOfId.push(id);
            } else {
                $scope.listOfId = $scope.listOfId.filter(function (el) {
                    return el !== id;
                });
            }
        };

        $scope.rejectAll = function() {
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.listOfId.forEach(function (id) {
                    getQueries.getQuery($scope.connectingString, `bulkAfkeurenUren?id=${id}&username=${$scope.userInfo.userName}`).then(function (response) {
                        $scope.listOfId = $scope.listOfId.filter(function (el) {
                            return el !== id;
                        });
                    });
                });

                var message = '<strong> Done!</strong>';
                Flash.create('success', message, 5000, {
                    class: 'custom-class',
                    id: 'custom-id'
                }, true);

                setTimeout(() => {
                    $scope.init();
                }, 1000)
            })
        };

        function changeFormat(date) {
            var array = date.split('-');
            return array[2] + '-' + array[1] + '-' + array[0];
        }
    }

    AllHoursController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "Flash", "NgTableParams", "$routeParams", "$timeout", "$mdDateLocale", "$filter", "helpers"];

    return AllHoursController;
});