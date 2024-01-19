define(['moment'], function (moment) {

    function EmployeesController($scope, auth, $rootScope, getQueries, NgTableParams, filteredListService) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.search = '';

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getMedewerkerGrid").then(function (response) {
                    var data = response;
                    if (data.length > 0) {
                        angular.forEach(data, function (item) {
                            item['Datum uit dienst'] = item['Datum uit dienst'] ? moment(item['Datum uit dienst']).format("DD-MM-YYYY") : "";
                            item['Datum in dienst'] = item['Datum in dienst'] ? moment(item['Datum in dienst']).format("DD-MM-YYYY") : "";
                        });
                        $scope.allItems = data;
                        $scope.cols = $scope.generateColumns(data[0]);
                        $scope.tableParams = new NgTableParams({
                            page: 1,
                            count: 10
                        }, {
                            filterDelay: 0,
                            dataset: data
                        });
                        $scope.cols[0].show = false;
                        $scope.searching();
                    }
                    $("body").removeClass("loading");
                });

                getQueries.getQuery($scope.connectingString, "getFuncties").then(function (response) {
                    $scope.functies = response;
                });
            });
        };

        $scope.getHoofdrolValue = function (key) {
            var item = _.where($scope.functies, {'key': key})[0];
            return item === undefined ? '' : item.value;
        };

        $scope.searching = function () {
            var data = filteredListService.searched($scope.allItems, $scope.search);
            if ($scope.search == '') {
                data = $scope.allItems;
            }
            if (data.length > 0) {
                angular.forEach(data, function (value, key) {
                    delete value['$$hashKey'];
                });
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
        };

        $scope.showDetails = function (row) {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getMedewerkerwijzigingen?employeeid=" + (row.id || '')).then(function (response) {
                var data = response;
                if (data.length > 0) {
                    angular.forEach(data, function (value, key) {
                        if (value['Ingangsdatum']) value['Ingangsdatum'] = moment(value['Ingangsdatum']).format('DD-MM-YYYY');
                        if (value['Einddatum']) value['Einddatum'] = moment(value['Einddatum']).format('DD-MM-YYYY');
                    });
                    $scope.colsDetails = $scope.generateColumns(data[0]);
                    $scope.tableParamsDetails = new NgTableParams({
                        page: 1,
                        count: 10
                    }, {
                        filterDelay: 0,
                        dataset: data
                    });
                    $scope.colsDetails[0].show = false;
                } else {
                    $scope.colsDetails = [];
                    $scope.tableParamsDetails = new NgTableParams({}, {dataset: []});
                }
                $scope.row = row;
                $scope.defaultRow = $.extend(true, {}, row);
                $('.modalAdditional').show();
                $("body").removeClass("loading");
            });
        };

        $scope.saveForm = function () {
            if ($scope.row.id &&
                ($scope.row['Achternaam'] !== $scope.defaultRow['Achternaam'] ||
                $scope.row['Voornaam'] !== $scope.defaultRow['Voornaam'] ||
                    $scope.row['Email'] !== $scope.defaultRow['Email'] ||
                    $scope.row['Uren per week'] !== $scope.defaultRow['Uren per week'] ||
                    $scope.row['Personeelsnummer'] !== $scope.defaultRow['Personeelsnummer'] ||
                    $scope.row['Direct'] !== $scope.defaultRow['Direct'])) {
                $('.modalStartDate').show();
            } else {
                // if(!$scope.row['Datum uit dienst']){
                //     $scope.row['Datum uit dienst'] = moment().format("DD-MM-YYYY");
                // }
                if(!$scope.row['Datum in dienst']){
                    $scope.row['Datum in dienst'] = moment().format("DD-MM-YYYY");
                }
                var sendFunction = $scope.row.id ? 'putMedewerker' : 'postMedewerker ';
                var uitdienst = $scope.row['Datum uit dienst'] ? moment($scope.row['Datum uit dienst'], "DD-MM-YYYY").format("YYYY-MM-DD") : "";
                var indienst = $scope.row['Datum in dienst'] ? moment($scope.row['Datum in dienst'], "DD-MM-YYYY").format("YYYY-MM-DD") : "";
                var data = {
                    achternaam: $scope.row.Achternaam,
                    voornaam: $scope.row.Voornaam,
                    email: $scope.row.Email,
                    urenperweek: $scope.row['Uren per week'],
                    personeelsnummer: $scope.row.Personeelsnummer,
                    uitdienst: uitdienst,
                    indienst: indienst,
                    Direct: $scope.row['Direct'] === true ? true : ''
                };
                if ($scope.row.id) {
                    data['id'] = $scope.row.id;
                }
                getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                    if (response.data.Success) {
                        $scope.row = {};
                        $('.modalAdditional').hide();
                        $scope.init();
                    } else {
                        $scope.row.error = response.data.ErrorMessage;
                    }
                });
            }
        };

        $scope.saveWithStartDate = function () {
            var startDate = $scope.startDate ? moment($scope.startDate, "DD-MM-YYYY").format("MM-DD-YYYY") : "";
            var uitdienst = $scope.row['Datum uit dienst'] ? moment($scope.row['Datum uit dienst'], "DD-MM-YYYY").format("YYYY-MM-DD") : "";
            var indienst = $scope.row['Datum in dienst'] ? moment($scope.row['Datum in dienst'], "DD-MM-YYYY").format("YYYY-MM-DD") : "";
            var data = {
                id: $scope.row.id,
                achternaam: $scope.row.Achternaam,
                voornaam: $scope.row.Voornaam,
                username: $scope.userInfo.userName,
                email: $scope.row.Email,
                urenperweek: $scope.row['Uren per week'],
                personeelsnummer: $scope.row.Personeelsnummer,
                uitdienst: uitdienst,
                indienst: indienst,
                direct: $scope.row.Direct === true ? true : '',
                startdate: startDate
            };
            getQueries.addPost($scope.connectingString, 'putMedewerkerStartdate', data).then(function (response) {
                if (response.data.Success) {
                    $scope.row = {};
                    $('.modalStartDate').hide();
                    $('.modalAdditional').hide();
                    $scope.init();
                } else {
                    $scope.errorStartDate = response.data.ErrorMessage;
                }
            });
        };

        $scope.deleteMedewerker = function (row) {
            getQueries.addPost($scope.connectingString, "deleteMedewerker", {medewerkerid: row.id}).then(function (response) {
                if (response.data.Success) {
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.show = function (row) {
            $scope.detail = row;
            $('.modalDetails').show();
        };

        $scope.saveFormDetails = function () {
            var sendFunction = $scope.detail.Id ? 'putMedewerkerWijziging' : 'postMedewerkerWijziging';
            var begindatum = $scope.detail['Ingangsdatum'] ? moment($scope.detail['Ingangsdatum'], "DD-MM-YYYY").format("MM-DD-YYYY") : "";
            var einddatum = $scope.detail['Einddatum'] ? moment($scope.detail['Einddatum'], "DD-MM-YYYY").format("MM-DD-YYYY") : "";
            var data = {
                achternaam: $scope.detail.Achternaam,
                urenperweek: $scope.detail.UrenPerWeek,
                personeelsnummer: $scope.detail.Personeelsnummer,
                ingangsdatum: begindatum,
                einddatum: einddatum
            };
            if ($scope.detail.Id) {
                data['id'] = $scope.detail.Id;
            }
            getQueries.addPost($scope.connectingString, sendFunction, data).then(function (response) {
                if (response.data.Success) {
                    $scope.detail = {};
                    $('.modalAdditional').hide();
                    $('.modalDetails').hide();
                    $scope.showDetails($scope.row);
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.deleteDetail = function (row) {
            getQueries.addPost($scope.connectingString, "deleteMedewerkerWijziging", {id: row.Id}).then(function (response) {
                if (response.data.Success) {
                    $('.modalAdditional').hide();
                    $scope.showDetails($scope.row);
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.init();
    }

    EmployeesController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "filteredListService"];

    return EmployeesController;
});