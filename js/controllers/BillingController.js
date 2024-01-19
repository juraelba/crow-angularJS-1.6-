define(['moment'], function (moment) {

    function BillingController($scope, auth, $rootScope, getQueries, NgTableParams, $timeout, Flash, helpers) {
        $scope.userInfo = auth;
        $rootScope.rootUser = auth;
        $scope.connectingString = null;
        $scope.checkbox = [];
        $scope.listOfId = [];
        $scope.checkboxAll = {
            all: 0
        };
        $scope.year = 0;
        $scope.period = 0;

        $scope.allData = [];
        $scope.data = [];
        $scope.projects = [];
        $scope.projectCode = ['All'];
        $scope.showCheckbox = false;

        $scope.init = function () {
            $scope.filterDate = moment().format("DD-MM-YYYY");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.getFacturatie();
                $scope.getProjects();
            });
        };

        $scope.getFacturatie = function () {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getFacturatie?enddate=" + changeFormat($scope.filterDate)).then(function (response) {
                $("body").removeClass("loading");
                $scope.allData = response;
                $scope.updateGrid();
            });
        };

        $scope.getProjects = function () {
            getQueries.getQuery($scope.connectingString, "getFacturatieProject?enddate=" + changeFormat($scope.filterDate)).then(function (response) {
                $scope.projects = response.map(function (item) {
                    return {
                        'key': item['projectcode'],
                        'value': item['projectcode']
                    }
                });
                $scope.projects.unshift({
                    'key': 'All',
                    'value': 'All'
                });
            });
        };

        $scope.projectChanged = function () {
            $scope.updateGrid();
        };

        $scope.updateGrid = function () {
            $("body").addClass("loading");
            if ($scope.projectCode.length > 0) {
                $scope.listOfId = [];
                $scope.checkbox = [];
                $scope.data = [];

                if ($scope.projectCode.indexOf('All') === -1) {
                    _.each($scope.projectCode, function (item) {
                        if(_.where($scope.allData, {'Projectcode': item}).length > 0) {
                            _.each(_.where($scope.allData, {'Projectcode': item}), function (data) {
                                $scope.data.push(data);
                            });
                        }
                    });
                } else {
                    $scope.data = $scope.allData;
                }

                if ($scope.data.length > 0) {
                    $scope.data = $scope.data.map(function (item, key) {
                        item['id'] = key + 1;
                        item['visible'] = true;
                        item['info'] = '';
                        item['Datum'] = moment(item['Datum']).format("DD-MM-YYYY");

                        $scope.checkbox[item.id] = 0;

                        return item;
                    });
                    // $scope.cols = $scope.generateColumns($scope.data[0]);
                    // angular.forEach([6, 7, 8, 9, 10], function (number, index) {
                    //     if ($scope.cols[number]) $scope.cols[number].show = false;
                    // });

                    $scope.cols = helpers.mapColumns([], [
                        'Projectcode',
                        'Omschrijving',
                        'Fase',
                        'Rol',
                        'Uren',
                        'Waarde',
                        'Datum',
                        'Week'
                    ]);
                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10 // count per page
                        // count: $scope.data.length
                    }, {
                        filterDelay: 0,
                        dataset: $scope.data,
                        counts: []
                    });
                    $("body").removeClass("loading");
                } else {

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 0
                    }, {
                        filterDelay: 0,
                        dataset: [],
                        counts: []
                    });
                    $("body").removeClass("loading");
                }
                $scope.showCheckbox = true;
            } else {
                $("body").removeClass("loading");
            }
        };

        // $scope.getBilling = function () {
        //     getQueries.getQuery($scope.connectingString, "getFacturatie?enddate=" + $scope.filterDate).then(function (response) {
        //         var data = response;
        //         if (data.length > 0) {
        //             console.log(response);
        //             angular.forEach(data, function (value, key) {
        //                 value['id'] = key + 1;
        //                 value['visible'] = true;
        //                 value['info'] = '';
        //             });
        //             $scope.data = data;
        //             $scope.approves = data;
        //             $scope.fillGrid(data);
        //         }
        //     });
        // };

        $scope.setDate = function () {
            // $scope.filterDate = moment($scope.filterDate).format("YYYY-MM-DD");
            // $scope.filterDate = moment(changeFormat($scope.filterDate)).format("YYYY-MM-DD");
            // $scope.getBilling();

            $scope.getFacturatie();
            $scope.getProjects();

        };

        function changeFormat(date) {
            var array = date.split('-');
            return array[2] + '-' + array[1] + '-' + array[0];
        }

        // $scope.fillGrid = function (data) {
        //     if (data.length > 0) {
        //         $scope.listOfId = [];
        //         $scope.checkbox = [];
        //         angular.forEach(data, function (value) {
        //             $scope.checkbox[value.id] = 0;
        //         });
        //         $scope.cols = $scope.generateColumns(data[0]);
        //         $scope.tableParams = new NgTableParams({
        //             page: 1,
        //             count: data.length
        //         }, {
        //             filterDelay: 0,
        //             dataset: data,
        //             counts: []
        //         });
        //         angular.forEach([6, 7, 8, 9, 10], function (number, index) {
        //             if ($scope.cols[number]) $scope.cols[number].show = false;
        //         });
        //     }
        // };

        $scope.toggleId = function (id) {
            if (!id) {
                if (!$scope.checkboxAll.all) {
                    $scope.listOfId = [];
                    angular.forEach($scope.data, function (value) {
                        $scope.checkbox[value.id] = 0;
                    });
                } else {
                    $scope.listOfId = [];
                    angular.forEach($scope.data, function (value) {
                        $scope.listOfId.push(value.id);
                        $scope.checkbox[value.id] = 1;
                    });
                }
            } else {
                $scope.checkboxAll.all = 0;
                if ($scope.listOfId.indexOf(id) < 0) {
                    $scope.listOfId.push(id);
                } else {
                    $scope.listOfId = $scope.listOfId.filter(function (el) {
                        return el != id;
                    });
                }
            }
        };

        $scope.showAdditional = function () {
            if ($scope.listOfId.length > 0) {
                $('.modalAdditional').show();
            } else {
                var message = '<strong>Please select rows</strong>';
                Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
            }
        };

        $scope.saveBilling = function () {
            var dataLength = $scope.listOfId.length;
            angular.forEach($scope.data, function (value, keyData) {
                if ($scope.listOfId.indexOf(value.id) >= 0) {
                    var data, query, isValues = false;
                    if (value.UurId > 0) {
                        data = {
                            uurid: value.UurId,
                            waarde: value.Waarde,
                            boekjaar: $scope.year,
                            periode: $scope.period,
                            factuurdatum: changeFormat($scope.factuurdatum),
                        };
                        query = 'postFacturatie';
                    } else {
                        data = {
                            oopid: value.OopId,
                            waarde: value.Waarde,
                            boekjaar: $scope.year,
                            periode: $scope.period,
                            factuurdatum: changeFormat($scope.factuurdatum),
                        };
                        query = 'postFacturatieOOP';
                    }
                    if (value.UurId > 0) {
                        $("body").addClass("loading");
                        getQueries.getQuery(
                            $scope.connectingString,
                            "getFacturatieFinanciering?uurid=" + value.UurId + "&waarde=" + value.Waarde + "&enddate=" + changeFormat($scope.filterDate)
                        ).then(function (response) {
                            if (response[0]) {
                                var length = response.length;
                                angular.forEach(response, function (valueFin, key) {
                                    getQueries.addPost(
                                        $scope.connectingString,
                                        query,
                                        {
                                            uurid: value.UurId,
                                            financierid: valueFin.FinancierId,
                                            waarde: valueFin.Waarde,
                                            boekjaar: $scope.year,
                                            periode: $scope.period,
                                            factuurdatum: changeFormat($scope.factuurdatum),
                                        }
                                    ).then(function (response) {
                                        $('.modalAdditional').hide();
                                        if (key + 1 === length && dataLength === keyData + 1) {
                                            if (response.data.Success) {
                                                var message = '<strong> Done!</strong>';
                                                Flash.create('success', message, 5000, {
                                                    class: 'custom-class',
                                                    id: 'custom-id'
                                                }, true);
                                            } else {
                                                var message = '<strong>' + response.data.ErrorMessage + '!</strong>';
                                                Flash.create('danger', message, 5000, {
                                                    class: 'custom-class',
                                                    id: 'custom-id'
                                                }, true);
                                            }
                                            $scope.projectCode = ['All'];
                                            $("body").removeClass("loading");
                                            $scope.getFacturatie();

                                        }
                                    });
                                });
                            } else {
                                isValues = true;
                                $("body").removeClass("loading");
                            }
                        });
                    } else {
                        $("body").addClass("loading");
                        getQueries.getQuery(
                            $scope.connectingString,
                            "getFacturatieFinancieringOOP?oopid=" + value.OopId + "&waarde=" + value.Waarde + "&enddate=" + changeFormat($scope.filterDate)
                        ).then(function (response) {
                            if (response[0]) {
                                var length = response.length;
                                angular.forEach(response, function (valueFin, key) {
                                    getQueries.addPost(
                                        $scope.connectingString,
                                        query,
                                        {
                                            oopid: value.OopId,
                                            financierid: valueFin.FinancierId,
                                            waarde: valueFin.Waarde,
                                            boekjaar: $scope.year,
                                            periode: $scope.period,
                                            factuurdatum: changeFormat($scope.factuurdatum),
                                            Volgnummer: value.Volgnummer,
                                            Projectcode: value.Projectcode,
                                            Fase: value.Fase
                                        }
                                    ).then(function (response) {
                                        $('.modalAdditional').hide();
                                        if (key + 1 === length && dataLength === keyData + 1) {
                                            if (response.data.Success) {
                                                var message = '<strong> Done!</strong>';
                                                Flash.create('success', message, 5000, {
                                                    class: 'custom-class',
                                                    id: 'custom-id'
                                                }, true);
                                            } else {
                                                var message = '<strong>' + response.data.ErrorMessage + '!</strong>';
                                                Flash.create('danger', message, 5000, {
                                                    class: 'custom-class',
                                                    id: 'custom-id'
                                                }, true);
                                            }
                                            $scope.projectCode = ['All'];
                                            $("body").removeClass("loading");
                                            $scope.getFacturatie();
                                        }
                                    });
                                });
                            } else {
                                isValues = true;
                                $("body").removeClass("loading");
                            }
                        });
                    }
                    if (isValues) {
                        $("body").addClass("loading");
                        getQueries.addPost(
                            $scope.connectingString,
                            query,
                            data
                        ).then(function (response) {
                            $('.modalAdditional').hide();
                            if (response.data.Success) {
                                var message = '<strong> Done!</strong>';
                                Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                            } else {
                                var message = '<strong>' + response.data.ErrorMessage + '!</strong>';
                                Flash.create('danger', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                            }
                            $scope.projectCode = ['All'];
                            $("body").removeClass("loading");
                            $scope.getFacturatie();
                        });
                    }
                }
            });
        };

        $scope.collapseRow = function (row) {
            if (row.UurId > 0) {
                $("body").addClass("loading");
                getQueries.getQuery(
                    $scope.connectingString,
                    "getFacturatieFinanciering?uurid=" + row.UurId + "&waarde=" + row.Waarde + "&enddate=" + changeFormat($scope.filterDate)
                ).then(function (response) {
                    row.visible = !row.visible;
                    if (response[0]) {
                        var tr = $('tr.tr-billing' + row.id);
                        if (!row.visible) {
                            var info = '';
                            angular.forEach(response, function (value) {
                                info += 'Financier: ' + value.Financier + " Waarde: " + value.Waarde + '<br>';
                            });
                            $('<tr class="billingShow"><td colspan="8" align="center">' + info + '</td></tr>').insertAfter(tr);
                        } else {
                            $(tr).nextAll('.billingShow').remove();
                        }
                    }
                    $("body").removeClass("loading");
                });
            } else {
                $("body").addClass("loading");
                getQueries.getQuery(
                    $scope.connectingString,
                    "getFacturatieFinancieringOOP?oopid=" + row.OopId + "&waarde=" + row.Waarde + "&enddate=" + changeFormat($scope.filterDate)
                ).then(function (response) {
                    row.visible = !row.visible;
                    if (response[0]) {
                        var tr = $('tr.tr-billing' + row.id);
                        if (!row.visible) {
                            var info = '';
                            angular.forEach(response, function (value) {
                                info += 'Financier: ' + value.Financier + " Waarde: " + value.Waarde + '<br>';
                            });
                            $('<tr class="billingShow"><td colspan="8" align="center">' + info + '</td></tr>').insertAfter(tr);
                        } else {
                            $(tr).nextAll('.billingShow').remove();
                        }
                    }
                    $("body").removeClass("loading");
                });
            }
        };

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                $('table.billing').find('thead tr').prepend('<th></th><th></th>').removeClass('approve');
                $('.checkboxAll').show();
            }, 2000);
        });

        $scope.init();
    }

    BillingController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "$timeout", "Flash", "helpers"];

    return BillingController;
});