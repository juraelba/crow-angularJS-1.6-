define([], function () {

    function RollController($scope, auth, $rootScope, NgTableParams, getQueries) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.row = {};
        $scope.rowRate = {};

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getRollen").then(function (response) {
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
                    }
                    getQueries.getQuery($scope.connectingString, "getUursoortenFromDWH").then(function (response) {
                        $scope.uursoorten = response;
                    });
                    $("body").removeClass("loading");
                });

                getQueries.getQuery($scope.connectingString, "getArtikelenFromDWH").then(function (response) {
                    $scope.items = response;
                });
            });
        };

        $scope.showDetails = function (row) {
            $scope.row = row;
            angular.forEach($scope.uursoorten, function (sort) {
                if (sort.value == row.Uursoort) {
                    row.Uursoort = sort.key;
                }
            });

            angular.forEach($scope.items, function (item) {
                if (item.key === row.Dekkingsartikel) {
                    row.dekkingsartikel = item.key;
                }
            });

            delete(row['Dekkingsartikel']);

            getQueries.getQuery($scope.connectingString, `getFunctieTarieven?functieid=${row.Id}`).then(function (response) {
                var data = response;

                angular.forEach(data, function (valueData, valueKey) {
                    angular.forEach(valueData, function (value, key) {
                        if (key === 'kostprijs' || key === 'prijs') {
                            valueData[key] = valueData[key] != null ?
                                '€ ' + parseInt(valueData[key]).toLocaleString('nl-NL') : "";
                        }
                        if (key === 'dekking') {
                            valueData[key] = valueData[key] != null ?
                                valueData[key] + ' %' : "";
                        }
                    });
                });
                if (data.length > 0) {
                    $scope.colsTar = $scope.generateColumns(data[0]);
                    $scope.tableParamsTar = new NgTableParams({
                        page: 1,
                        count: 10
                    }, {
                        filterDelay: 0,
                        dataset: data
                    });
                    $scope.colsTar[0].show = false;
                    $scope.colsTar[1].show = false;
                } else {
                    $scope.tableParamsTar = null;
                    $scope.colsTar = null;
                }
                $('.modalAdditional').show();
            });
        };

        $scope.getArtikel = function (row) {
            var result = '';
            angular.forEach($scope.items, function (item) {
                if (item.key === row.Dekkingsartikel) {
                    result = item.value;
                }
            });
            return result;
        };

        $scope.changeSort = function () {
            angular.forEach($scope.uursoorten, function (sort) {
                if (sort.key == $scope.row.Uursoort) {
                    $scope.row.Kostprijs = sort.KOSTPRIJS;
                    $scope.row.Prijs = sort.PRIJS;
                }
            });
        };

        $scope.toNumber = function (value) {
            return (value + '')
                .replace('€ ', '')
                .replace(' %', '')
                .replace(',', '.');
        };

        $scope.saveForm = function () {
            var sendFunction = $scope.row.Id ? 'putRol' : 'postRol';
            console.log('222222', $scope.row)
            getQueries.addPost($scope.connectingString, sendFunction, $scope.row).then(function (response) {
                if (response.data.Success) {
                    $scope.row = {};
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.showDetailsRates = function (rowRate, row) {
            $('.modalAdditionalRates').show();
            $scope.rowRate = row;
            $scope.rowRate.rolid = rowRate.Id;
        };

        $scope.saveFormRates = function() {
            var sendFunction = $scope.rowRate.id ? 'putFunctietarief' : 'postFunctietarief';
            angular.forEach($scope.rowRate, function (val, key) {
                $scope.rowRate[key] = $scope.toNumber(val);
            });
            $scope.rowRate['username'] = $scope.userInfo.userName;
            getQueries.addPost($scope.connectingString, sendFunction, $scope.rowRate).then(function (response) {
                if (response.data.Success) {
                    $scope.rowRate = {};
                    $('.modalAdditionalRates').hide();
                    $scope.showDetails($scope.row);
                } else {
                    $scope.rowRate.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.deleteRate = function(row) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                getQueries.addPost($scope.connectingString, 'deleteFunctietarief', {id: row.id}).then(function (response) {
                    if (response.data.Success) {
                        $scope.rowRate = {};
                        $scope.showDetails($scope.row);
                    } else {
                        $scope.rowRate.error = response.data.ErrorMessage;
                    }
                });
            }
        };

        $scope.init();
    }

    RollController.$inject = ["$scope", "auth", "$rootScope", "NgTableParams", "getQueries"];

    return RollController;
});