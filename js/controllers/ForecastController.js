define(['moment'], function (moment) {

    function ForecastController($scope, auth, getQueries, constructForecast, $timeout, $rootScope, Flash, constructFormTab, constructResults) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.data = {};
        $scope.pullRight = [
            'Omschrijving1',
            'Omschrijving2',
            'Header'
        ];
        $scope.forFilter = [
            'Correctie uren',
            'Verplichtingen OOP Opdrachtbrief',
            'Correctie OOP'
        ];
        $rootScope.rootUser = auth;
        $scope.teams = [];
        $scope.projects = null;
        $scope.fases = [];
        // $scope.fase = 'All';
        $scope.collapsed = true;
        $scope.newModel = [];
        $scope.formShow = true;
        $scope.projectShow = false;
        $scope.faseShow = false;
        $scope.versionValue = 0;
        $scope.projectmanager = [];
        $scope.afgestemdMet = [];

        $scope.currentStep = 1;
        $scope.projectPercentage = 0;

        $scope.updateForecastVersie = {
            'datum': moment().format("YYYY-MM-DD"),
            'onderbouwing': ''
        };
        $scope.Datum = new Date();

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                    $scope.teams = response;
                });
                getQueries.getQuery($scope.connectingString, "getMedewerkers").then(function (response) {
                    $scope.projectmanager = response;
                });
                getQueries.getQuery($scope.connectingString, "getProjectDropdown?username=" + $scope.userInfo.userName).then(function (response) {
                    $scope.projects = response;
                });
                $scope.getReport();
                $("body").removeClass("loading");
            });
        };

        $scope.toonRegelsReverse = function () {
            $scope.toonRegels = !$scope.toonRegels;
        };

        $scope.toonRegels = false;
        $scope.fieldsForCheck = [
            'Forecast',
            'Nog te realiseren',
            'Verwachting',
            'Correctie uren',
            'Verplichtingen OOP Opdrachtbrief',
            'Correctie OOP',
            'Verschil Forecast - Begroting'
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

        $scope.getReport = function () {
            $scope.VFBSum = false;
            var fase = $scope.fase === undefined || $scope.fase === null || $scope.fase === 'All' ? '' : $scope.fase;

            constructForecast.fromQuery($scope.connectingString, "getForecastRapport?" +
                "projectid=" + ($scope.project !== undefined ? $scope.project : '') +
                '&versie=' + $scope.versionValue +
                '&faseid=' + fase)
                .then(function (response) {
                    var result = response;

                    $scope.data.table = result[0];
                    $scope.data.tableCols = result[1];
                    if (result[2] < 0) {
                        $scope.VFBSum = true;
                    }
                });
        };

        $scope.$watch('team', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                getQueries.getQuery($scope.connectingString, "getProjectDropdownByTeam?teamid=" + newValue).then(function (response) {
                    $scope.projects = response;
                    $scope.fases = [];
                    $scope.fase = null;
                });
            }
        });

        $scope.$watch('project', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                getQueries.getQuery($scope.connectingString, "getForecastVersies?projectid=" + $scope.project).then(function (response) {
                    $scope.versions = response;
                    if (response.length === 0) {
                        $scope.createNewVersion();
                    }
                    angular.forEach($scope.versions, function (value) {
                        $scope.versionValue = value.value;
                        $scope.versionId = value.key;
                    });

                    $scope.getFases();
                    $scope.initProjectsDetails(newValue);
                    $scope.getOnderbouwing();
                });
                $scope.getProjectPercentage();
                $scope.projectShow = true;
                $scope.faseShow = false;
                $scope.formShow = true;
            } else {
                $scope.formShow = false;
                $scope.projectShow = false;
                $scope.fase = 'All';
                $scope.fases = {};
                $scope.init();
            }
        });

        $scope.getProjectPercentage = function () {
            var fase = $scope.fase === 'All' ? '' : $scope.fase;
            fase = fase !== undefined ? (fase === null ? '' : fase) : '';

            var enddate = moment($scope.updateForecastVersie.datum).format('YYYY-MM-DD');

            constructResults.fromQuery($scope.connectingString, "getProjectResultatenRapport",
                {
                    'projectid': $scope.project,
                    'faseid': fase,
                    'enddate': enddate
                }).then(function (response) {
                    $scope.projectPercentage = response[2];
                }
            );
        };

        $scope.getOnderbouwing = function () {
            $scope.statuses = [
                {key: false, value: 'Open'},
                {key: true, value: 'Afgesloten'},
            ];
            getQueries.getQuery($scope.connectingString, "getForecastVersieById?forecastid=" + $scope.versionId).then(function (response) {
                if (response[0]) {
                    $scope.updateForecastVersie = {
                        'datum': response[0].datum === null ? moment().format('MM/DD/YYYY') : moment(response[0].datum).format('MM/DD/YYYY'),
                        'onderbouwing': response[0].onderbouwing,
                        'status': response[0].status == null? '' : response[0].status,
                        'percentage': response[0].percentage === null ? $scope.projectPercentage : response[0].percentage
                    };
                }
            });
        };

        $scope.$watch('fase', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.getReport();
                if (newValue != 'All') {
                    getQueries.getQuery($scope.connectingString, "getFaseDetailsByFaseid?faseid=" + newValue).then(function (response) {
                        $scope.fasesDetails = response;
                    });
                    $scope.initFormFase(newValue);
                    $scope.faseShow = true;
                } else {
                    $scope.faseShow = false;
                }

                $scope.getProjectPercentage();

                $scope.projectShow = false;
                $scope.formShow = true;
            }
        });

        $scope.getFases = function () {

            if ($scope.project === undefined || $scope.project === null || $scope.project === 0) {
                getQueries.getQuery($scope.connectingString, "getFases?versieid=" + $scope.versionId).then(function (response) {
                    $scope.fases = response;
                    $scope.fases.splice(0, 0, {
                        key: 'All',
                        value: 'All'
                    });
                });
            } else {
                getQueries.getQuery($scope.connectingString, "getFaseDropdownByProject?projectid=" + $scope.project).then(function (response) {
                    $scope.fases = response;
                    $scope.fases.splice(0, 0, {
                        key: 'All',
                        value: 'All'
                    });
                    $scope.getReport();
                });
            }
        };

        $scope.initProjectsDetails = function (id) {
            getQueries.getQuery($scope.connectingString, "getAfgestemdMet").then(function (response) {
                $scope.afgestemdMet = response;
                getQueries.getQuery($scope.connectingString, "getApprovedProjectVersie?projectid=" + id).then(function (response) {
                    if (response[0]) {
                        $scope.versionIdProject = response[0].versieid;
                        getQueries.getProjectDetails($scope.connectingString, $scope.versionIdProject, "getProjectAfgestemdMet", "versieid").then(function (response) {
                            $scope.newModel.afgestemdMet = [];
                            angular.forEach(response, function (value, key) {
                                this.push(value.fkAfgestemdMetId);
                            }, $scope.newModel.afgestemdMet);
                            getQueries.getQuery($scope.connectingString, "getProjectMaster?versieid=" + $scope.versionIdProject).then(function (response) {
                                if (response[0]) {
                                    $scope.newModel = response[0];
                                    $scope.newModel.Projectmanager = parseInt($scope.newModel.Projectmanager);
                                    $scope.ProjectId = response[0].ProjectId;
                                    $scope.editProject = response[0].AangemaaktDoor == $scope.userInfo.userName ? true : false;
                                    var date = new Date($scope.newModel.AangemaaktOp);
                                    $scope.newModel.AangemaaktOp = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
                                }
                                getQueries.getQuery($scope.connectingString, "getApprovedProjectVersie?projectid=" + $scope.ProjectId).then(function (response) {
                                    $scope.newModel.versions = response;
                                    angular.forEach($scope.newModel.versions, function (value) {
                                        if (value.versieid == $scope.versionIdProject) {
                                            // $scope.versionValue = value.Value;
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

        $scope.initFormFase = function (faseId) {
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getTabs").then(function (response) {
                angular.forEach(response, function (value, key) {
                    if (value.Id == 1) {
                        if (value.FormulierGrid) {
                            getQueries.getQuery($scope.connectingString, "getFormFields?form=" + value.FormulierGrid).then(function (response) {
                                $scope.faseForm = constructFormTab.init($scope.connectingString, response, $scope.versionIdProject, 0, 0);
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

        $scope.checkVersion = function (type) {
            var min_version = false,
                max_version = false;
            if (typeof $scope.versions !== 'undefined') {
                angular.forEach($scope.versions, function (value, key) {
                    if (value.key < $scope.versionId && (min_version < value.key || !min_version)) {
                        min_version = value.key;
                    }
                    if (value.key > $scope.versionId && (max_version > value.key || !max_version)) {
                        max_version = value.key;
                    }
                });
            }
            return type == 'left' ? min_version : max_version;
        };

        $scope.changeVersion = function (type) {
            var versieId = $scope.checkVersion(type);
            angular.forEach($scope.versions, function (value) {
                if (versieId == value.key) {
                    $scope.versionValue = value.value;
                    $scope.versionId = value.key;
                    $scope.getReport();
                }
            });
            $scope.getOnderbouwing();
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

        $scope.editArray = [];

        $scope.getFilter = function (row) {
            var index = _.findIndex($scope.editArray, function (item) {
                return item.Id == row.Id
            });
            if (index === -1) {
                $scope.editArray.push(row);
            } else {
                $scope.editArray[index] = row;
            }
            $scope.saveValues();
        };

        $scope.createNewVersion = function () {
            $('.modalAdditional').show();
        };

        $scope.removeVersion = function () {
            getQueries.addPost($scope.connectingString, 'deleteForecastVersie', {
                forecastversieid: $scope.versionId
            }).then(function (response) {
                var message = '<strong>deleteForecastVersie</strong>';
                Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                $scope.init();
            });
        };

        $scope.addForecastVersie = function () {
            var data = {
                projectid: $scope.project,
                versie: $scope.versions.length == 0 ? 1 : ($scope.versions[$scope.versions.length - 1].value + 1),
                omschrijving: $scope.Omschrijving
            };
            getQueries.addPost($scope.connectingString, 'postForecastVersie', data).then(function (response) {
                $('.modalAdditional').hide();
                $scope.versionId += $scope.versions.length == 0 ? 1 : $scope.versions[$scope.versions.length - 1].key;
                $scope.versionValue += $scope.versions.length == 0 ? 1 : $scope.versions[$scope.versions.length - 1].value;
                $scope.versions.push({value: $scope.versionValue, key: $scope.versionId});
            });
        };

        $scope.updateVersion = function () {
            getQueries
                .addPost(
                    $scope.connectingString,
                    'updateForecastVersie',
                    {
                        'versieid': $scope.versionId,
                        'datum': moment($scope.updateForecastVersie.datum).format('YYYY-MM-DD'),
                        'onderbouwing': $scope.updateForecastVersie.onderbouwing,
                        'status': $scope.updateForecastVersie.status,
                        'percentage': $scope.updateForecastVersie.percentage
                    }
                )
                .then(function (response) {
                    var message = '<strong>updateForecastVersie</strong>';
                    Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                    $scope.getOnderbouwing();
                    if($scope.VFBSum) {
                        $('.redModalAdditional').show();
                    }
                });
        };

        $scope.toggleTable = function () {
            $scope.collapsed = !$scope.collapsed;
        };

        $scope.checkDisabled = function (row, field) {
            if ((row['Type'] == 'Uren Projecten' || row['Type'] == 'Uren') && field == 'Correctie uren') {
                return false;
            }
            if ((row['Type'] == 'OOP Projecten' || row['Type'] == 'OOP') && field != 'Correctie uren') {
                return false;
            }
            row[field] = '';
            return true;
        };

        $scope.saveValues = function () {
            if ($scope.editArray.length > 0) {
                // $("body").addClass("loading");
                angular.forEach($scope.editArray, function (row) {
                    if (row['Type'] == 'Uren Projecten' || row['Type'] == 'Uren') {
                        var data = {
                            correctieuren: parseFloat(row['Correctie uren']),
                            opbrengstenurenid: row.Id,
                            versie: $scope.versionValue
                        };
                        getQueries.addPost($scope.connectingString, 'putForeCastReportUren', data).then(function (response) {
                            var message = '<strong>putForeCastReportUren</strong>';
                            Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                            $scope.getReport();
                        });
                    }
                    if (row['Type'] == 'OOP Projecten' || row['Type'] == 'OOP') {
                        data = {
                            verplichtingenoop: parseFloat(row['Verplichtingen OOP Opdrachtbrief']),
                            correctieoop: parseFloat(row['Correctie OOP']),
                            opbrengstenoopid: row.Id,
                            versie: $scope.versionValue
                        };
                        getQueries.addPost($scope.connectingString, 'putForeCastReportOOP', data).then(function (response) {
                            var message = '<strong>putForeCastReportOOP</strong>';
                            Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                            $scope.getReport();
                        });
                    }
                });
                $scope.editArray = [];
                // $("body").removeClass("loading");
            }
        };

        $scope.$on('$viewContentLoaded', function () {
            // changeTable();
            $timeout(function () {
                $('table').find('thead tr th').each(function () {
                    var td = $(this),
                        index = td.index();
                    if (index > 2) {
                        $(this).addClass('pullRight');
                    }
                });
            }, 7000);
        });

        function changeTable() {
            if ($('table.forecast').find('thead tr').length > 0) {
                $('table.forecast').find('thead tr').prepend('<th></th>').removeClass('forecast');
            } else {
                setTimeout(function () {
                    changeTable()
                }, 1000);
            }
        }

        $scope.init();
    }

    ForecastController.$inject = ["$scope", "auth", "getQueries", "constructForecast", "$timeout", "$rootScope", "Flash", "constructFormTab", "constructResults"];

    return ForecastController;
});