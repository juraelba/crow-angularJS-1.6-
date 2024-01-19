define(['moment'], function (moment) {

    function ResultsController($scope, auth, getQueries, constructResults, $timeout, $rootScope, constructFormTab, constructTotalResults, helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.data = {};
        $scope.pullRight = [
            'Omschrijving1',
            'Omschrijving2',
            'Header'
        ];
        $rootScope.rootUser = auth;
        $scope.projects = null;
        $scope.fases = null;
        $scope.versionId = null;
        $scope.newModel = [];
        $scope.formShow = true;
        $scope.projectShow = false;
        $scope.faseShow = false;
        $scope.versionValue = 0;
        $scope.projectmanager = [];
        $scope.afgestemdMet = [];
        $scope.collapsed = true;
        $scope.tableNoSelectProject = [];

        $scope.init = function () {
            $("body").addClass("loading");
            $scope.filterDate = moment().format("YYYY-MM-DD");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getProjectDropdown?username=" + $scope.userInfo.userName).then(function (response) {
                    $scope.projects = response;
                    // $scope.fillTotalTable();
                });
                getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                    $scope.teams = response;
                });
                getQueries.getQuery($scope.connectingString, "getMedewerkers").then(function (response) {
                    $scope.projectmanager = response;
                });
                $("body").removeClass("loading");
            });
        };

        $scope.fillTotalTable = function () {
            $scope.tableNoSelectProject = [];
            $scope.totalsOfTotals = {};
            var begrotingTotal = 0;
            var budgetResultaatTotal = 0;
            var realisatieTotal = 0;

            _.each($scope.projects, function (value) {
                constructTotalResults.fromQuery($scope.connectingString, "getProjectResultatenRapport?projectid=" + value.key
                    + '&faseid=&enddate=' + $scope.filterDate).then(function (response) {
                    response.project = value.value;
                    response.projectid = value.key;
                    $scope.tableNoSelectProject.push(response);

                    var totalRow = response[0];
                    if (totalRow!==undefined){
                        begrotingTotal += parseFloat(totalRow['BegrotingClean']);
                        budgetResultaatTotal += parseFloat(totalRow['Budget ResultaatClean']);
                        realisatieTotal += parseFloat(totalRow['RealisatieClean']);

                        $scope.totalsOfTotals = {
                            'empty':'',
                            'begrotingTotal': '€ ' + begrotingTotal.toLocaleString('nl-NL'),
                            'realisatieTotal': '€ ' + realisatieTotal.toLocaleString('nl-NL'),
                            'budgetResultaatTotal': '€ ' + budgetResultaatTotal.toLocaleString('nl-NL'),
                        };
                    }
                });
            });
        };

        $scope.selectProject = function (row) {
            $scope.project = row.projectid;
        };

        $scope.toonRegelsReverse = function () {
            $scope.toonRegels = !$scope.toonRegels;
        };

        $scope.toonRegels = false;
        $scope.fieldsForCheck = [
            'Begroting',
            'Begroting Uren',
            'Begroting Tarief',
            'Realisatie',
            'Realisatie Uren',
            'Realisatie Tarief',
            'Budget Resultaat'
        ];
        $scope.checkRowForShow = function (row) {
            if ($scope.toonRegels || row.Fase === 'Resultaat project') {
                return true;
            } else {
                var result = false;

                angular.forEach(row, function (colValue, colName) {
                    angular.forEach($scope.fieldsForCheck, function (fieldName, key) {
                        if (fieldName === colName) {
                            if (angular.isString(colValue) || angular.isNumber(colValue)) {
                                var number;

                                if (!angular.isNumber(colValue)) {
                                    number = parseFloat(colValue.replace(/\D/g, ''));
                                } else {
                                    number = colValue;
                                }

                                if (!isNaN(number) && number > 0 && !result) {
                                    result = true;
                                }
                            }
                        }
                    });
                });

                return result;
            }
        };

        $scope.showResultsDetails = function (type, fase_key, header_key, type_key, close) {
            if (type == 'fase') {
                angular.forEach($scope.data.table.data, function (valueTable) {
                    if (valueTable.fase_key == fase_key && valueTable.type_filter == 'header') {
                        valueTable.visible = close == true ? false : !valueTable.visible;
                        if (!valueTable.visible) {
                            $scope.showResultsDetails('header', fase_key, valueTable.header_key, null, true);
                        }
                    }
                });
            }
            if (type == 'header') {
                angular.forEach($scope.data.table.data, function (valueTable) {
                    if (
                        valueTable.header_key == header_key
                        &&
                        valueTable.fase_key == fase_key
                        &&
                        valueTable.type_filter == 'type'
                    ) {
                        valueTable.visible = close == true ? false : !valueTable.visible;
                        if (!valueTable.visible) {
                            $scope.showResultsDetails('type', fase_key, valueTable.header_key, valueTable.type_key, true);
                        }
                    }
                });
            }
            if (type == 'type') {
                angular.forEach($scope.data.table.data, function (valueTable) {
                    if (
                        valueTable.header_key == header_key
                        &&
                        valueTable.fase_key == fase_key
                        &&
                        valueTable.type_key == type_key
                        &&
                        !valueTable.plus
                    ) {
                        valueTable.visible = close == true ? false : !valueTable.visible;
                    }
                });
            }
        };

        $scope.initProjectsDetails = function (id) {
            getQueries.getQuery($scope.connectingString, "getAfgestemdMet").then(function (response) {
                $scope.afgestemdMet = response;
                getQueries.getQuery($scope.connectingString, "getApprovedProjectVersie?projectid=" + id).then(function (response) {
                    if (response[0]) {
                        $scope.versionId = response[0].versieid;
                        getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectAfgestemdMet", "versieid").then(function (response) {
                            $scope.newModel.afgestemdMet = [];
                            angular.forEach(response, function (value, key) {
                                this.push(value.fkAfgestemdMetId);
                            }, $scope.newModel.afgestemdMet);
                            getQueries.getQuery($scope.connectingString, "getProjectMaster?versieid=" + $scope.versionId + "&username=" + $scope.userInfo.userName).then(function (response) {
                                if (response[0]) {
                                    $scope.newModel = response[0];
                                    $scope.newModel.Projectmanager = parseInt($scope.newModel.Projectmanager);
                                    $scope.ProjectId = response[0].ProjectId;
                                    $scope.editProject = response[0].AangemaaktDoor === $scope.userInfo.userName;
                                    var date = new Date($scope.newModel.AangemaaktOp);
                                    $scope.newModel.AangemaaktOp = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
                                }
                                getQueries.getQuery($scope.connectingString, "getApprovedProjectVersie?projectid=" + id).then(function (response) {
                                    $scope.newModel.versions = response;
                                    angular.forEach($scope.newModel.versions, function (value) {
                                        if (value.versieid == $scope.versionId) {
                                            $scope.versionValue = value.Value;
                                        }
                                    });
                                });
                            });
                        });
                        getQueries.getQuery($scope.connectingString, "getFuncties").then(function (response) {
                            $scope.functies = response;
                        });
                        $scope.getFases();
                    }
                });

            });
        };

        $scope.toggleForm = function () {
            $scope.formShow = $scope.formShow ? false : true;
        };

        $scope.getFases = function () {
            getQueries.getQuery($scope.connectingString, "getFases?versieid=" + $scope.versionId).then(function (response) {
                $scope.fases = response;
                $scope.fases.splice(0, 0, {
                    key: 'All',
                    value: 'All'
                });
            });
            getQueries.getQuery($scope.connectingString, "getFaseDetails?versieid=" + $scope.versionId).then(function (response) {
                $scope.fasesDetails = response;
            });
        };

        $scope.countAfgestemdMet = function () {
            if ($scope.newModel.afgestemdMet) {
                $scope.countAfgestemd = $scope.newModel.afgestemdMet.length;
            }
            return $scope.countAfgestemd;
        };

        $scope.initFormFase = function (faseId) {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getTabs").then(function (response) {
                angular.forEach(response, function (value, key) {
                    if (value.Id == 1) {
                        if (value.FormulierGrid) {
                            getQueries.getQuery($scope.connectingString, "getFormFields?form=" + value.FormulierGrid).then(function (response) {
                                $scope.faseForm = constructFormTab.init($scope.connectingString, response, $scope.versionId, 0, 0);
                                angular.forEach($scope.fasesDetails, function (valueDet) {
                                    if (valueDet.ID == faseId) {
                                        $scope.formActive = valueDet;
                                        var date;
                                        angular.forEach(valueDet, function (valueEl, keyEl) {
                                            if (keyEl == 'Planning starten') {
                                                if (valueEl != null) {
                                                    date = new Date(valueEl);
                                                    $scope.formActive['PlanningStart'] = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
                                                    delete $scope.formActive[keyEl];
                                                }
                                            }
                                            if (keyEl == 'Planning opleveren') {
                                                if (valueEl != null) {
                                                    date = new Date(valueEl);
                                                    $scope.formActive['PlanningEind'] = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
                                                    delete $scope.formActive[keyEl];
                                                }
                                            }
                                            if (keyEl == 'Educatie') {
                                                if ($scope.formActive['Educatie'] != null) {
                                                    $scope.formActive['Educatie'] = $scope.formActive['Educatie'] ? 'Ja' : 'Nee';
                                                } else {
                                                    $scope.formActive['Educatie'] = 'Nee';
                                                }
                                            }
                                            if (keyEl == 'Minimaal opleverniveau') {
                                                $scope.formActive['Resultaat'] = $scope.formActive['Minimaal opleverniveau'];
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }
                });
                $("body").removeClass("loading");
            });
        };

        $scope.setDate = function () {
            $scope.filterDate = moment(changeFormat($scope.filterDate)).format("YYYY-MM-DD");
            $scope.getReportResults();
            $scope.fillTotalTable();
        };

        function changeFormat(date) {
            var array = date.split('-');
            return array[2] + '-' + array[1] + '-' + array[0];
        }

        $scope.getReportResults = function () {
            $("body").addClass("loading");

            var fase = $scope.fase === 'All' ? '' : $scope.fase;
            fase = fase !== undefined ? (fase === null ? '' :fase)  : '';

            constructResults.fromQuery($scope.connectingString, "getProjectResultatenRapport?projectid=" + $scope.project
                + '&faseid=' + fase + "&enddate=" + $scope.filterDate).then(function (response) {
                var result = response;
                $scope.data.table = result[0];
                $scope.data.tableCols = result[1];
                $scope.projectPercentage = result[2];
                // $('table').find('thead tr').prepend('<th></th>');
                $("body").removeClass("loading");
            });
        };

        $scope.$watch('project', function (newValue) {
            var projectId = helpers.getNumber(newValue);
            if (projectId) {
                $scope.getReportResults();
                getQueries.getQuery($scope.connectingString, "getFaseDropdownByProject?projectid=" + $scope.project).then(function (response) {
                    $scope.fases = response;
                    $scope.fases.splice(0, 0, {
                        key: 'All',
                        value: 'All'
                    });
                });
                $scope.initProjectsDetails($scope.project);
                $scope.projectShow = true;
                $scope.faseShow = false;
                $scope.formShow = true;
            }
        });

        $scope.$watch('fase', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                if (newValue !== 'All') {
                    $scope.getReportResults();
                    $scope.faseShow = true;
                    $scope.initFormFase(newValue);
                } else {
                    $scope.faseShow = false;
                }

                $scope.getReportResults();
                $scope.projectShow = false;
                $scope.formShow = true;
            }
        });

        $scope.toggleTable = function () {
            $scope.collapsed = !$scope.collapsed;
        };

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                $('table').find('thead tr th').each(function () {
                    var td = $(this),
                        index = td.index();
                    if (index > 2) {
                        $(this).addClass('pullRight');
                    }
                });
            }, 2000);
        });

        $scope.init();
    }

    ResultsController.$inject = ["$scope", "auth", "getQueries", "constructResults", "$timeout", "$rootScope", "constructFormTab", "constructTotalResults", "helpers"];

    return ResultsController;
});