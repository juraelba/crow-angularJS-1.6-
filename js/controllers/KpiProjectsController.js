define(['moment'], function (moment) {

    function KpiProjectsController($scope, auth, getQueries, $routeParams, constructTable, $rootScope, NgTableParams, helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.startDate = '';
        $scope.endDate = '';

        $scope.tableParams = null;
        $scope.cols = null;
        $scope.popupTableData = [];
        $scope.selectedLabel = '';

        $scope.rowClickable = false;
        $scope.rowMethod = '';

        $scope.tableParams2 = null;
        $scope.cols2 = null;
        $scope.popupTableData2 = [];
        $scope.selectedLabel2 = '';

        $scope.KPIItems = [];
        $scope.sortStatusesArray = [
            'Nieuw',
            'Goed te keuren teams',
            'Goed te keuren directie',
            'Goedgekeurd',
            'Afgekeurd',
            'Gesloten'
        ];

        $scope.chartLabels = [];
        $scope.chartData = [];
        $scope.chartOptions = {
            legend: {
                display: true,
                position: 'right'
            }
        };

        $scope.secondChartLabels = [];
        $scope.secondChartData = [];
        $scope.secondChartOptions = {
            legend: {
                display: true,
                position: 'right'
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.labels[tooltipItem.index];
                        var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        return label + ': ' + transformToCurrency(datasetLabel);
                    }
                }
            }
        };

        $scope.init = function () {
            $scope.startDate = moment('01-01-2017').format("DD-MM-YYYY");
            $scope.endDate = moment().format("DD-MM-YYYY");

            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;

                getQueries.getQuery($scope.connectingString, 'getKPIProjectStatusDropdown').then(function (response) {
                    $scope.statuses = [];
                    $scope.statuses.push({key: '', value: 'All'});
                    $scope.sortStatusesArray.filter(
                        function (statusName) {
                            $scope.statuses.push(_.where(response, {value: statusName})[0]);
                        }
                    );

                    $scope.buildChart();
                });
                getQueries.getQuery($scope.connectingString, 'getKPIProjectenTeamDropdown').then(function (response) {
                    $scope.teams = response;
                    $scope.teams.unshift({key: '', value: 'All'});
                });
                $scope.getKPI();
            });
        };

        $scope.teamSelected = function () {
            $scope.getUsers();
        };

        $scope.getUsers = function () {
            getQueries.getQuery(
                $scope.connectingString,
                "getKPIProjectenEmpDropdown?username=" + $scope.userInfo.userName + '&team=' + $scope.team
            ).then(function (response) {
                $scope.users = response;
                $scope.users.unshift({key: '', value: 'All'});
                $scope.getKPI();
            });
        };

        $scope.buildChart = function () {
            $scope.chartLabels = [];
            $scope.chartData = [];

            if (_.isArray($scope.statuses) && $scope.statuses.length > 0 && $scope.KPIItems.length > 0) {
                _.each($scope.statuses, function (status) {
                    var item = _.where($scope.KPIItems, {'Status': status['key']})[0];

                    if (item !== undefined) {
                        $scope.chartData.push(item['Aantal']);
                        $scope.chartLabels.push(status['value']);
                    }
                })
            }
        };

        $scope.buildSecondChart = function () {
            $scope.secondChartLabels = [];
            $scope.secondChartData = [];

            if (($scope.KPIfinFaseInternProjects + $scope.KPIfinanceProjects) > 0) {
                $scope.secondChartLabels.push('Financiering Intern');
                $scope.secondChartData.push($scope.KPIfinFaseInternProjects + $scope.KPIfinanceProjects);
            }

            if (($scope.getKPIFinProjectExternBedragToegezegd + $scope.getKPIFinFaseExternBedragToegezegd) > 0) {
                $scope.secondChartLabels.push('Financiering Extern toegezegd');
                $scope.secondChartData.push($scope.getKPIFinProjectExternBedragToegezegd + $scope.getKPIFinFaseExternBedragToegezegd);
            }

            if (($scope.getKPIFinProjectExternBedragOnzeker + $scope.getKPIFinFaseExternBedragOnzeker) > 0) {
                $scope.secondChartLabels.push('Financiering Extern onzeker');
                $scope.secondChartData.push($scope.getKPIFinProjectExternBedragOnzeker + $scope.getKPIFinFaseExternBedragOnzeker);
            }
        };

        $scope.chartClick = function (data) {
            var label = getLabelFromData(data);

            if (label) {
                var status = _.where($scope.statuses, {value: label})[0];

                $scope.rowClickable = true;
                $scope.rowMethod = 'getApproversByVersion';

                $scope.selectedLabel = status['value'];
                $scope.showPopupTable('getKPIProjectenAllDetails', status['key']);
            }
        };

        $scope.secondChartClick = function (data) {
            var label = getLabelFromData(data);

            if (label) {
                var method = '';

                $scope.rowClickable = false;
                $scope.rowMethod = '';

                switch (label) {
                    case 'Financiering Intern':
                        method = 'getKPIFinInternDetails';
                        break;
                    case 'Financiering Extern toegezegd':
                        method = 'getKPIFinExternToegezegdDetails';
                        break;
                    case 'Financiering Extern onzeker':
                        method = 'getKPIFinExternOnzekerDetails';
                        break;
                }

                $scope.selectedLabel = label;

                $scope.showPopupTable(method);
            }
        };

        $scope.showPopupTable = function (requestName, status) {
            $("body").addClass("loading");

            getQueries.getQuery(
                $scope.connectingString,
                requestName + '?' + $scope.getParams(status)
            ).then(function (response) {
                $scope.popupTableData = response;

                if ($scope.popupTableData.length > 0) {
                    $scope.cols = $scope.generateColumns($scope.popupTableData[0]);
                    $scope.cols = helpers.hideColumns($scope.cols, ['id']);

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10
                    }, {
                        filterDelay: 0,
                        dataset: $scope.popupTableData
                    });
                } else {
                    $scope.cols = [];
                    $scope.tableParams = new NgTableParams({}, {dataset: []});
                }

                $('.modalAdditional').show();
                $("body").removeClass("loading");
            });
        };

        $scope.showAdditionalPopupTable = function (row, rowMethod) {
            if ($scope.rowClickable) {
                $("body").addClass("loading");

                var params = '';

                switch (rowMethod) {
                    case 'getApproversByVersion':
                        params = 'versieid=' + row.id;
                        $scope.selectedLabel2 = 'Project Goedkeurders ('+ row.Projectcode +')';
                        break;
                }

                getQueries.getQuery(
                    $scope.connectingString,
                    rowMethod + '?' + params
                ).then(function (response) {
                    $scope.popupTableData2 = response;

                    if ($scope.popupTableData2.length > 0) {
                        $scope.cols2 = $scope.generateColumns($scope.popupTableData2[0]);
                        $scope.cols2 = helpers.hideColumns($scope.cols2, ['id', 'Color']);

                        $scope.tableParams2 = new NgTableParams({
                            page: 1,
                            count: 10
                        }, {
                            filterDelay: 0,
                            dataset: $scope.popupTableData2
                        });
                    } else {
                        $scope.cols2 = [];
                        $scope.tableParams2 = new NgTableParams({}, {dataset: []});
                    }

                    $('.modalAdditional2').show();
                    $("body").removeClass("loading");
                });
            }
        };

        $scope.getKPI = function () {
            getQueries.getQuery(
                $scope.connectingString,
                'getKPIProjectenAll?' + $scope.getParams()
            ).then(function (response) {
                $scope.KPIItems = response;

                $scope.buildChart();
                $scope.buildSecondChart();
            });

            getQueries.getQuery(
                $scope.connectingString,
                'getKPIFinProjectIntern?' + $scope.getParams()
            ).then(function (response) {
                $scope.KPIfinanceProjects = getSumOfValueInResponse(response, 'Bedrag');

                $scope.buildChart();
                $scope.buildSecondChart();
            });

            getQueries.getQuery(
                $scope.connectingString,
                'getKPIFinProjectExtern?' + $scope.getParams()
            ).then(function (response) {
                $scope.getKPIFinProjectExternBedragToegezegd = getSumOfValueInResponse(response, 'BedragToegezegd');
                $scope.getKPIFinProjectExternBedragOnzeker = getSumOfValueInResponse(response, 'BedragOnzeker');

                $scope.buildChart();
                $scope.buildSecondChart();
            });

            getQueries.getQuery(
                $scope.connectingString,
                'getKPIFinFaseIntern?' + $scope.getParams()
            ).then(function (response) {
                $scope.KPIfinFaseInternProjects = getSumOfValueInResponse(response, 'Bedrag');

                $scope.buildChart();
                $scope.buildSecondChart();
            });

            getQueries.getQuery(
                $scope.connectingString,
                'getKPIFinFaseExtern?' + $scope.getParams()
            ).then(function (response) {
                $scope.getKPIFinFaseExternBedragToegezegd = getSumOfValueInResponse(response, 'BedragToegezegd');
                $scope.getKPIFinFaseExternBedragOnzeker = getSumOfValueInResponse(response, 'BedragOnzeker');

                $scope.buildChart();
                $scope.buildSecondChart();
            });
        };

        $scope.setDate = function () {
            $scope.getKPI();
        };

        $scope.getParams = function (status) {
            status = status !== undefined ? status : ($scope.status || '');

            return 'startdate=' + moment($scope.startDate, "DD-MM-YYYY").format("MM-DD-YYYY") +
                '&enddate=' + moment($scope.endDate, "DD-MM-YYYY").format("MM-DD-YYYY") +
                '&team=' + ($scope.team || '') +
                '&medewerker=' + ($scope.user || '') +
                '&status=' + status;
        };

        $scope.getValue = function (field, row) {
            var value = row[field];

            switch (field) {
                case 'Goedgekeurd op':
                    if (moment(value).unix() > 0) {
                        value = moment(value).format('MM-DD-YYYY HH:mm');
                    } else {
                        value = '';
                    }
                    break;

                case 'Color':
                    value = value.toLowerCase();
                    break;
            }

            return value
        };

        function getValueFromResponse(response, index, field) {
            var value = 0;
            if (response[index]) {
                value = parseFloat(response[index][field]);
                if (isNaN(value)) {
                    value = 0;
                }
            }
            return value;
        }

        function getSumOfValueInResponse(response, field, transform) {
            var value = 0;
            _.each(response, function (item, index) {
                value += getValueFromResponse(response, index, field);
            });
            return transform === true ? transformToCurrency(transform) : value;
        }

        function transformToCurrency(value) {
            return '€ ' + value.toLocaleString('nl-NL')
        }

        function getLabelFromData(data) {
            var label = null;
            if (data[0] !== undefined) {
                var model = data[0]['_model'];
                if (model !== undefined) {

                    if (model['label'] !== undefined) {
                        label = model['label'];
                    }
                }
            }

            return label;
        }

        $scope.init();
    }

    KpiProjectsController.$inject = ["$scope", "auth", "getQueries", "$routeParams", "constructTable", "$rootScope", "NgTableParams", "helpers"];

    return KpiProjectsController;
});