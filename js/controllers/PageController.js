define(['moment'], function (moment) {

    function PageController($scope, getQueries, $routeParams, typeGrid, typeProjectdetail, constructTab, $location,
                            getFromWebService, $rootScope, $mdSidenav, auth, filteredListService, NgTableParams,
                            kostenOOPConfig, kostenUrenConfig, opbrengstenUrenConfig, opbrengstenOOPConfig, helpers, Flash, $http, env) {
        $scope.userInfo = auth;
        $scope.pageId = $routeParams.id === undefined ? 1 : $routeParams.id;
        $scope.versionId = $routeParams.versionId;
        $scope.projectId = $routeParams.projectId;
        $rootScope.versionId = $routeParams.versionId;
        $scope.page = false;
        $scope.connectingString = false;
        $scope.model = [];
        $scope.totalFase = 0;
        $scope.faseForm = [];
        $scope.ProjectId = 0;
        $scope.project = [];
        $scope.newModel = {};
        $scope.project.beschrijving = '';
        $scope.functies = [];
        $scope.projectmanager = [];
        $scope.projectmanagerModal = [];
        $scope.projectGroups = [];
        $scope.urengoedkeuren = [];
        $scope.formShow = true;
        $scope.versionValue = 0;
        $scope.financiers = [];
        $scope.countAfgestemd = 0;
        $scope.tabConstruction = []

        $scope.editProject = false;
        $rootScope.deleteIconfase = false;
        $scope.editIconfase = false;
        $rootScope.closedProjects = {
            show: 0
        };

        $scope.newProjectStatus = [];
        $scope.status = [];
        $scope.search = '';
        $scope.removeItemStatus = {item: null};
        $scope.statuButton = false;

        $rootScope.financieringColor = '#333';
        $rootScope.saldoFinancieringColor = '#333';
        // $rootScope.childKey = 0;


        $rootScope.rootUser = auth;

        $rootScope.isAdmin = false;
        $rootScope.isProjectControl = false;
        $scope.userId = null;
        $scope.userEmail = null;
        $rootScope.projectRights = [];

        $rootScope.editableProjects = [];

        $rootScope.hasZeroMedeweker = false;
        $scope.showTooltips = {};
        $rootScope.leveranciers = [];

        $scope.highestVersion = 0;
        $rootScope.versionButtonBlocked = true;
        // $rootScope.hideOpbrengstenTabs = false;

        $rootScope.getOrganisatie = [];
        $scope.financieringOverzicht = [];
        $scope.documentData = [];
        $rootScope.getKostenGoedgekeurd = 0;
        $rootScope.getAfwijkingBudgetNeutraal = 0;

        $rootScope.showIndienButtonConditions = function () {
            return $rootScope.financieringColor !== 'red'
                && $rootScope.saldoFinancieringColor !== 'red';
        };

        $rootScope.showRedLabelConditions = function () {
            return $rootScope.financieringColor === 'red'
                || $rootScope.saldoFinancieringColor === 'red';
        };

        $rootScope.goedgekeurdHighestVersion = function () {
            return $scope.newModel['Nieuwe versie'] === 'true';
        };

        // $rootScope.goedgekeurdHighestVersion = function () {
        //     return (Number($scope.versionId) === Number($scope.highestVersion)) && ($scope['newModel']['Status'] === 'Goedgekeurd');
        // };

        $scope.checkZeroMedeweker = function () {
            $rootScope.hasZeroMedeweker = false;
            if ($scope.connectingString !== undefined) {
                getQueries.getQuery($scope.connectingString, "getOrganisatie?versieid=" + $scope.versionId).then(function (response) {
                    angular.forEach(response, function (item) {
                        if (parseInt(item['medewerkerkey']) === 0) {
                            $rootScope.hasZeroMedeweker = true;
                            $rootScope.financieringColor = 'red';
                        }
                    });
                });
            }
        };

        $scope.setDocumentByproject = function () {
            getQueries.getQuery($scope.connectingString, "getDocumentsByProject?projectid=" + $scope.projectId).then(function (response) {
                $scope.documentData = response;
            });
        };

        $scope.setOrganisatie = function () {
            getQueries.getQuery($scope.connectingString, "get?versieid=" + $scope.versionId).then(function (response) {
                $rootScope.getOrganisatie = response;
            });
        };

        $scope.setKostenGoedgekeurd = function () {
            getQueries.getQuery($scope.connectingString, "getKostenGoedgekeurd?versieid=" + $scope.versionId).then(function (response) {
                if (response[0]) {
                    $rootScope.getKostenGoedgekeurd = helpers.getNumber(response[0]['kostenGoedgekeurd']);
                }
            });
        };

        $scope.setAfwijkingBudgetNeutraal = function () {
            getQueries.getQuery($scope.connectingString, "getAfwijkingBudgetNeutraal?versieid=" + $scope.versionId).then(function (response) {
                if (response[0]) {
                    $rootScope.getAfwijkingBudgetNeutraal = helpers.getNumber(response[0]['waarde']);
                }
            });
        };

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (connectingString) {
                $scope.connectingString = connectingString;
                $rootScope.connectingString = connectingString;

                $scope.setOrganisatie();
                $scope.setDocumentByproject();
                $scope.setKostenGoedgekeurd();
                $scope.setAfwijkingBudgetNeutraal();
                $rootScope.isAdmin = $scope.userInfo.roleName === 'Administrator';
                $rootScope.isProjectControl = $scope.userInfo.roleName === 'Project control';
                $scope.canEditProject = ['Financiele administratie', 'Directie', 'Administrator', 'Project control'].indexOf($scope.userInfo.roleName) >= 0;

                $rootScope.projectRights = [];
                getQueries.getQuery($scope.connectingString, "getProjectRights", {'username': auth.userName})
                    .then(function (response) {
                        angular.forEach(response, function (project) {
                            $rootScope.projectRights.push({id: project.projectid, right: project.projectRight, email: project.email});
                        });
                    });
                getQueries.getQuery($scope.connectingString, "getProjectEditRights", {'username': auth.userName})
                    .then(function (response) {
                        angular.forEach(response, function (project) {
                            $rootScope.editableProjects.push(parseInt(project.versieid))
                        });
                    });

                getQueries.getQuery($scope.connectingString, "getLeveranciers").then(function (response) {
                    $rootScope.leveranciers = response;
                });

                getQueries.getQuery($scope.connectingString, "getPage?PageId=" + $scope.pageId).then(function (response) {
                    $scope.page = response[0];
                    getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                        $scope.teams = response;
                    });
                    getQueries.getQuery($scope.connectingString, "getMedewerkersAll").then(function (response) {
                        $scope.projectmanager = response;
                    });
                    getQueries.getQuery($scope.connectingString, "getMedewerkers").then(function (response) {
                        $scope.projectmanagerModal = response;
                    });
                    getQueries.getQuery($scope.connectingString, "getFinanciers").then(function (response) {
                        $scope.financiers = response;
                    });
                    getQueries.getQuery($scope.connectingString, "getDeelcollectieven").then(function (response) {
                        $scope.deelcollectieven = response;
                    });

                    getQueries.getQuery($scope.connectingString, "getInternFinanciers").then(function (response) {
                        $scope.internfinanciers = response;

                    });

                    getQueries.getQuery($scope.connectingString, "getDebiteurenDropdown").then(function (response) {
                        $scope.opdrachtgevers = response;

                    });

                    getQueries.getQuery($scope.connectingString, "getProjectgroepen").then(function (response) {
                        $scope.projectGroups = response;
                        $scope.projectGroups = $scope.projectGroups.map((item) => {
                            return { key: item.Code, value: item.Naam };
                        });
                    });

                    getQueries.getQuery($scope.connectingString, "getUsersDropdown").then(function (response) {
                        $scope.urengoedkeuren = response;
                        $scope.urengoedkeuren = $scope.urengoedkeuren.map((item) => {
                            return { key: item.id, value: item.email };
                        });
                    });

                    getQueries.getQuery($scope.connectingString, "getTagDropdown").then(function (response) {
                        $scope.tagDropdown = response;
                        getQueries.getQuery($scope.connectingString, "getAfgestemdMet").then(function (response) {
                            $scope.afgestemdMet = response;
                            if ($scope.page.pageType == 'Grid') {
                                $scope.initGrid();

                                $scope.page.template = 'templates/typeGrid.html';
                            }
                            if ($scope.page.pageType == 'Projectdetail') {
                                getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectAfgestemdMet", "versieid").then(function (response) {
                                    $scope.newModel.afgestemdMet = [];
                                    angular.forEach(response, function (value, key) {
                                        this.push(value.fkAfgestemdMetId);
                                    }, $scope.newModel.afgestemdMet);
                                    getQueries.getQuery($scope.connectingString, "getProjectMaster?versieid=" + $scope.versionId + '&username=' + $scope.userInfo.userName).then(function (response) {
                                        if (response[0]) {
                                            $scope.newModel = response[0];

                                            $scope.newModel.Projectmanager = parseInt($scope.newModel.Projectmanager);
                                            $scope.newModel.reference = $scope.newModel.Referentie;
                                            $scope.ProjectId = response[0].ProjectId;
                                            $scope.formShow = false;

                                            $scope.newModel.tags = [];
                                            getQueries.getQuery($scope.connectingString, "getTagsByProject?projectid=" + $scope.ProjectId).then(function (response) {
                                                angular.forEach(response, function (value, key) {
                                                    this.push(value.tagid);
                                                }, $scope.newModel.tags);
                                            });
                                            // $scope.editProject = response[0].AangemaaktDoor.toLowerCase() === $scope.userInfo.userName.toLowerCase();
                                            
                                            if ([7, 8, 9, 10].indexOf($scope.newModel.projectstatus) > -1) {
                                                $scope.editProject = false;
                                            } else {
                                                $scope.editProject = $scope.userCanEditProject();
                                            }

                                            $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');

                                            var date = new Date($scope.newModel.AangemaaktOp);
                                            $scope.newModel.AangemaaktOp = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();

                                        }
                                        getQueries.getQuery($scope.connectingString, "getInkoopDropdown").then(function (response) {
                                            $scope.inkoops = response;
                                            $scope.totalFase = '';
                                            $scope.getProjectTabs();
                                        });
                                        $scope.getCommunicate();
                                        // $scope.getProjectStatuses();
                                        $scope.GetFinancieringColor();
                                        getQueries.getQuery($scope.connectingString, "getProjectVersies?projectid=" + $scope.ProjectId).then(function (response) {
                                            $scope.project.versions = response;
                                            angular.forEach($scope.project.versions, function (value) {
                                                if ($scope.highestVersion < Number(value.versieid)) {
                                                    $scope.highestVersion = Number(value.versieid);
                                                }

                                                if (parseInt(value.versieid) == parseInt($scope.versionId)) {
                                                    $scope.versionValue = value.Value;
                                                    $scope.editProject = $scope.userCanEditProject();
                                                }

                                                $rootScope.versionButtonBlocked = false;
                                            });
                                        });
                                    });
                                });
                                typeProjectdetail.init($scope.connectingString, $scope.pageId, $scope.versionId).then(function (data) {
                                    $scope.page.details = data;
                                });
                                getQueries.getQuery($scope.connectingString, "getFuncties").then(function (response) {
                                    $scope.functies = response;
                                });
                                $scope.getFases();
                                $scope.page.template = 'templates/typeProjectdetail.html';
                            }
                        });
                    });
                });
            });
        };

        $scope.GetFinancieringColor = function () {
            getQueries.getQuery($scope.connectingString, "getFinancieringTotalenProject?versieid=" + $scope.versionId).then(function (response) {
                if (response[0]) {
                    // var saldoTeFinancieren = parseFloat(response[0]['Saldo te financieren']);
                    // if (isNaN(saldoTeFinancieren)) {
                    //     saldoTeFinancieren = 0;
                    // }

                    // if (saldoTeFinancieren > 0) {
                    //     $rootScope.saldoFinancieringColor = 'red';
                    //     // $rootScope.financieringColor = 'red';
                    // } else {
                    //     $rootScope.saldoFinancieringColor = 'green';
                    //
                    //     // $rootScope.financieringColor = 'green';
                    // }
                    $scope.checkZeroMedeweker();
                }
            });

        };

        $scope.getFinancieringOverzichtProject = function (project) {
            var query = project ? 'getFinancieringOverzichtProject' : 'getFinancieringOverzichtFase';
            getQueries.getQuery($scope.connectingString, query + "?versieid=" + $scope.versionId + '&year=' + $rootScope.year).then(function (response) {
                var saldoTeFinancieren = 0;
                if (!project) {
                    $scope.financieringOverzicht = [];
                    var years = [];
                    _.each(response, function (item) {
                        if (years.indexOf(item['jaar']) === -1) {
                            years.push(item['jaar']);
                        }
                        saldoTeFinancieren += parseInt(item['Saldo te financieren'] || 0);
                    });
                    var fin, gefin, saldo;
                    _.each(years, function (year) {
                        fin = 0;
                        gefin = 0;
                        saldo = 0;
                        _.each(response, function (item) {
                            if (year === item['jaar']) {
                                fin = fin + parseInt(item['Bedrag te financieren'] || 0);
                                gefin = gefin + parseInt(item['Bedrag gefinancierd'] || 0);
                                saldo = saldo + parseInt(item['Saldo te financieren'] || 0);
                            }
                        });
                        $scope.financieringOverzicht.push({
                            'jaar': year,
                            'fase': '',
                            'Bedrag te financieren': '€ ' + parseInt(fin).toLocaleString('nl-NL'),
                            'Bedrag gefinancierd': '€ ' + parseInt(gefin).toLocaleString('nl-NL'),
                            'Saldo te financieren': '€ ' + parseInt(saldo).toLocaleString('nl-NL')
                        });
                        _.each(response, function (item) {
                            if (year === item['jaar']) {
                                $scope.financieringOverzicht.push({
                                    'jaar': '',
                                    'fase': item['fase'],
                                    'Bedrag te financieren': '€ ' + parseInt(item['Bedrag te financieren'] || 0).toLocaleString('nl-NL'),
                                    'Bedrag gefinancierd': '€ ' + parseInt(item['Bedrag gefinancierd'] || 0).toLocaleString('nl-NL'),
                                    'Saldo te financieren': '€ ' + parseInt(item['Saldo te financieren'] || 0).toLocaleString('nl-NL')
                                });
                            }
                        });
                    });
                } else {
                    $scope.financieringOverzicht = [];
                    _.each(response, function (item) {
                        $scope.financieringOverzicht.push({
                            'jaar': item['jaar'],
                            'Bedrag te financieren': '€ ' + parseInt(item['Bedrag te financieren'] || 0).toLocaleString('nl-NL'),
                            'Bedrag gefinancierd': '€ ' + parseInt(item['Bedrag gefinancierd'] || 0).toLocaleString('nl-NL'),
                            'Saldo te financieren': '€ ' + parseInt(item['Saldo te financieren'] || 0).toLocaleString('nl-NL')
                        });
                        saldoTeFinancieren += parseInt(item['Saldo te financieren'] || 0);
                    });
                }
                if (saldoTeFinancieren > 0) {
                    $rootScope.saldoFinancieringColor = 'red';
                } else {
                    $rootScope.saldoFinancieringColor = 'green';
                }
            });
        };

        $scope.initGrid = function () {
            typeGrid.init($scope.connectingString, $scope.pageId, $scope.userInfo).then(function (data) {
                $scope.page.details = data;
            });
        };

        $scope.searching = function () {
            var data = filteredListService.searched($scope.page.details.allItems, $scope.search);
            if ($scope.search == '') {
                data = $scope.page.details.allItems;
            }
            if (data.length > 0) {
                var cols = $rootScope.generateColumns(data[0]);
                var table = new NgTableParams({
                    page: 1, // show first page
                    count: 10 // count per page
                }, {
                    counts: [],
                    filterDelay: 0,
                    dataset: data
                });
                cols[0].show = false;
                cols[5].show = false;
                cols[helpers.getIdByFieldName(data[0], 'Id')].show = false;
                // cols[6].show = false;
                $scope.page.details.pageTable = table;
                $scope.page.details.pageTableCols = cols;
            } else {
                $scope.page.details.pageTable = null;
                $scope.page.details.pageTableCols = null;
            }
        };

        $scope.toggleForm = function () {
            $scope.formShow = $scope.formShow ? false : true;
        };

        $scope.countAfgestemdMet = function () {
            if ($scope.newModel.afgestemdMet) {
                $scope.countAfgestemd = $scope.newModel.afgestemdMet.length;
            }
            return $scope.countAfgestemd;
        };

        $scope.getFases = function (year = false) {
            var yearPar = false;
            if (year || year === 0) {
                yearPar = year;
            } else {
                yearPar = moment().format('YYYY');
            }
            $rootScope.year = yearPar;
            getQueries.getQuery($scope.connectingString, "getFases?versieid=" + $scope.versionId + '&year=' + yearPar).then(function (response) {
                $rootScope.fases = response;
                $scope.fases = response;
                $scope.fases.push({'key': 'total', 'value': 'Project totaal'});
            });

            getQueries.getQuery($scope.connectingString, "getFaseDetails?versieid=" + $scope.versionId + '&year=' + yearPar).then(function (response) {
                $scope.fasesDetails = response;
            });
        };

        $scope.updateFases = function (year) {
            $rootScope.year = year;
            $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
            $scope.getFases(year);
            $scope.getProjectTabs();
        };

        $scope.$watch('newModel.afgestemdMet', function (newValue, oldValue) {
            if (newValue === undefined && oldValue !== undefined) {
                $scope.newModel.afgestemdMet = oldValue;
            }
        });

        $scope.changeProjectType = function (newValue, oldValue) {
            if (newValue !== undefined && oldValue !== undefined && newValue !== oldValue) {
                if (confirm(" Let Op! Alle financiele mutaties en de organisatie regels worden verwijderd, wilt u doorgaan?")) {
                    getQueries.getQuery($scope.connectingString, "changeProjecttype?versieid=" + $scope.versionId);

                    if (oldValue === 'kennisontwikkeling' && newValue === 'kennisexploitatie') {
                        if ($scope.fasesDetails[0] !== undefined) {
                            var faseid = $scope.fasesDetails[0]['ID'];

                            getQueries.getQuery($scope.connectingString, "getExplFase").then(function (response) {
                                angular.forEach(response, function (value) {
                                    getQueries.addPost($scope.connectingString, 'postExplFase', {
                                        'faseid': faseid,
                                        'exploitatieId': value['id']
                                    });
                                })
                            });
                        }
                    }
                } else {
                    $scope.newModel['projecttype'] = oldValue;
                }
            }
        };

        $scope.getDocfile = function (fileId) {
            getQueries.getDownlaodFile(fileId).then(function (response) {
                if (response.data.Success) {
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.getProjectTabs = function () {
            $scope.getProjectStatuses();
            $scope.setOrganisatie();
            getQueries.getQuery($scope.connectingString, "getTabs").then(function (response) {
                $scope.projectTabs = response;
                // When a project is of type 'Kennisontwikkeling' or 'Intern', please hide the subtab Exploitatie in the tab 'Begroting opbrengsten'
                if ($scope.newModel.projecttype == 'intern' || $scope.newModel.projecttype == 'kennisontwikkeling') {
                    $scope.projectTabs = _.without($scope.projectTabs, _.findWhere($scope.projectTabs, {
                        Id: 9
                    }));
                }
                var secondTab = {
                    Id: 121,
                    Label: "Organisatie",
                    Naam: "Organisatie",
                    FunctieGetGrid: "getOrganisatie",
                    getGridParameters: "versieid",
                    FunctiePost: "postOrganisatie",
                    FunctiePut: "putOrganisatie",
                    Parent: null,
                    medewerkers: $scope.projectmanager,
                    medewerkersModal: $scope.projectmanagerModal,
                    functies: $scope.functies,
                    fases: $scope.fases,
                    // fasesDetails: $scope.fasesDetails,
                    fase: $scope.totalFase,
                };

                var endTab = {
                    Id: 122,
                    Label: "Documenten",
                    Naam: "Documenten",
                    // FunctieGetGrid: "getDocumentsByProject",
                    getGridParameters: "versieid",
                    FunctiePost: "postOrganisatie",
                    FunctiePut: "putOrganisatie",
                    Parent: null,
                    medewerkers: $scope.projectmanager,
                    medewerkersModal: $scope.projectmanagerModal,
                    functies: $scope.functies,
                    documentData: $scope.documentData,
                    fases: $scope.fases,
                    // fasesDetails: $scope.fasesDetails,
                    fase: $scope.totalFase,
                };
                $scope.projectTabs.splice(0, 0, secondTab);
                $scope.projectTabs.push(endTab);
                angular.forEach($scope.projectTabs, function (value, key) {
                    value['hideTab'] = false;

                    if ((value['Id'] === null || value['Id'] === undefined) && (value['id'] !== null && value['id'] !== undefined)) {
                        value['Id'] = value['id'];
                    }

                    value['Id'] = parseInt(value['Id']);
                    value['newModel'] = $scope.newModel;
                    value['fase'] = $scope.totalFase;

                    value.fasesDetails = $scope.fasesDetails;

                    value.projectType = $scope.newModel.projecttype;
                    if (value.Id == 12) {
                        value.FunctieGetGrid = 'getKostenDekkingsbijdrage';
                    }
                    if (value.Id == 7) {
                        value['hideTab'] = $scope.newModel['projecttype'] === 'kennisexploitatie';
                        value.medewerkers = $scope.projectmanager;
                        value.FunctiePut = "putOpbrengstenUren";
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getOpbrengstenUrenProject";
                            value.getGridParameters = "versieid";
                        }
                        value.cols = opbrengstenUrenConfig.get();
                    }
                    if (value.Id == 8) {
                        value['hideTab'] = $scope.newModel['projecttype'] === 'kennisexploitatie';
                        value.FunctiePut = "putOpbrengstenOOP";
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getOpbrengstenOOPProject";
                            value.getGridParameters = "versieid";
                        }
                        value.cols = opbrengstenOOPConfig.get();
                    }
                    if (value.Id == 9) {
                        value.Label = "Exploitatie";
                        value.FunctiePut = "putOpbrengstenKennis";
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getOpbrengstenKennisProject";
                            value.getGridParameters = "versieid";
                        }
                    }
                    if (value.Id == 6) {
                        value.FunctiePost = "postRisico";
                        value.FunctiePut = "putRisico";
                        if ($scope.totalFase) {
                            value.FunctieGetGrid = "getRisicos";
                        } else {
                            value.FunctieGetGrid = "getRisicosProject";
                            value.getGridParameters = "versieid";
                        }
                    }
                    if (value.Id == 4) {
                        value.FunctiePut = "";
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getResultaatProject";
                            value.getGridParameters = "versieid";
                        }
                    }
                    if (value.Id == 5) {
                        value.FunctiePost = "postFinanciering";
                        value.FunctiePut = "putFinanciering";
                        value.deelcollectieven = $scope.deelcollectieven;
                        value.financiers = $scope.financiers;
                        value.internfinanciers = $scope.internfinanciers;
                        value.projectType = $scope.newModel.projecttype;
                        value.financiering = $scope.newModel.financiering;
                        var curency = [
                            'Bedrag gefinancierd',
                            'Bedrag te financieren',
                            'Saldo te financieren'
                        ];
                        if ($scope.newModel.financiering == 'fase') {
                            
                            if ($scope.totalFase) {
                                getQueries.getQuery($scope.connectingString, "getFinancieringTotalenFase?faseid=" + $scope.totalFase).then(function (response) {
                                    value.totalFieldsFase = {};
                                    if (response[0]) {
                                        angular.forEach(response[0], function (valueTotal, keyTotal) {
                                            if (valueTotal != null && curency.indexOf(keyTotal) >= 0) {
                                                value.totalFieldsFase[keyTotal] = '€ ' + parseFloat(valueTotal + '').toLocaleString('nl-NL');
                                            } else {
                                                value.totalFieldsFase[keyTotal] = valueTotal;
                                            }
                                        });
                                    }
                                });
                            } else {
                                getQueries.getQuery($scope.connectingString, "getFinancieringTotalenProject?versieid=" + $scope.versionId).then(function (response) {
                                    value.totalFieldsFase = {};
                                    if (response[0]) {
                                        angular.forEach(response[0], function (valueTotal, keyTotal) {
                                            if (valueTotal != null && curency.indexOf(keyTotal) >= 0) {
                                                value.totalFieldsFase[keyTotal] = '€ ' + parseFloat(valueTotal + '').toLocaleString('nl-NL');
                                            } else {
                                                value.totalFieldsFase[keyTotal] = valueTotal;
                                            }
                                        });
                                    }
                                });
                            }
                            if (!$scope.totalFase) {
                                value.FunctieGetGrid = "getFinancieringProject";
                                value.getGridParameters = "versieid";
                                value.FunctiePut = "";
                            }
                        } else {
                            getQueries.getQuery($scope.connectingString, "getFinancieringTotalenProject?versieid=" + $scope.versionId).then(function (response) {
                                value.totalFieldsFase = {};
                                if (response[0]) {
                                    angular.forEach(response[0], function (valueTotal, keyTotal) {
                                        if (valueTotal != null && curency.indexOf(keyTotal) >= 0) {
                                            value.totalFieldsFase[keyTotal] = '€ ' + parseFloat(valueTotal + '').toLocaleString('nl-NL');
                                        } else {
                                            value.totalFieldsFase[keyTotal] = valueTotal;
                                        }
                                    });
                                }
                            });
                        }
                        if ($scope.newModel.financiering == 'project') {
                            value.FunctieGetGrid = "getFinancieringVersie";
                            value.getGridParameters = "versieid";
                            value.FunctiePost = "postFinancieringVersie";
                            value.FunctiePut = "putFinancieringVersie";
                        }
                    }
                    if (value.Id == 10) {
                        value.medewerkers = $scope.projectmanager;
                        value.FunctiePut = "putKostenUren";
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getKostenUrenProject";
                            value.getGridParameters = "versieid";
                        }
                        value.cols = kostenUrenConfig.get();
                        value.connectingString = $scope.connectingString;
                        value.versionId = $scope.versionId;
                    }
                    if (value.Id == 11) {
                        value.FunctiePut = "putKostenOOP";
                        value.FunctiePost = "postKostenOOP";
                        value.inkoops = $scope.inkoops;
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getKostenOOPProject";
                            value.getGridParameters = "versieid";
                        }
                        value.cols = kostenOOPConfig.get($scope.inkoops, $rootScope.leveranciers);
                    }
                    if (value.Id == 12) {
                        if (!$scope.totalFase) {
                            value.FunctieGetGrid = "getKostenDekkingsbijdrageProject";
                            value.getGridParameters = "versieid";
                        }
                    }
                    value.fase = $scope.totalFase;
                    if (value.Parent != null) {
                        $scope.addTab(value, value.Parent, $scope.ProjectId);
                    }else{
                        value.construction = constructTab.init($scope.connectingString, value, $scope.versionId, $scope.totalFase, $scope.ProjectId, $scope.tabConstruction);
                    }
                    
                });
                var thirdIndex = $scope.projectTabs[2],
                    fourthIndex = $scope.projectTabs[3];
                $scope.projectTabs[2] = fourthIndex;
                $scope.projectTabs[3] = thirdIndex;
                if($scope.tabConstruction.length===0){
                    $scope.tabConstruction = $scope.projectTabs;
                }
            });
        };

        $scope.addTab = function (projectTab, id) {
            angular.forEach($scope.projectTabs, function (value, key) {
                if (value.Id == id) {
                    if (!value.tabs) {
                        value.tabs = [];
                    }
                    if (value.Parent != null) {
                        $scope.addTab(value.Parent);
                    } else {
                        tab = $.extend(true, {}, projectTab);
                        tab.Parent = null;
                        tab.construction = constructTab.init($scope.connectingString, projectTab, $scope.versionId, $scope.totalFase, $scope.ProjectId, $scope.tabConstruction);
                        tab.leveranciers = $rootScope.leveranciers;
                        value.tabs.push(tab);
                    }
                }
            });
        };

        $scope.changeFase = function (fase) {
            $scope.totalFase = (fase === undefined ? 0 : (fase === 'total' ? '' : fase));
            $scope.getProjectTabs();
            $scope.GetFinancieringColor();
        };

        $scope.showAdditional = function (row, query) {
            if ($scope.userInfo.roleName === 'Project control' || $scope.userInfo.roleName === 'Administrator') {
                $scope.additionalForm = row;
                $scope.additionalQuery = typeof query !== 'undefined' ? query : false;
                $('.modalAdditional').show();
            }
        };

        $scope.submitForm = function () {
            // if($scope.page.details.pageActions){
            //     angular.forEach($scope.page.details.pageActions, function (action) {
            //         var data = [],
            //             postparameters = action.postparameters.split(',');
            //         angular.forEach($scope.model, function (value, key) {
            //             if($scope.checkValue(postparameters, key))
            //             {
            //                 data[key.toLowerCase()] = value;
            //             }
            //         });
            //     });
            // }
        };

        $scope.checkValue = function (array, str) {
            angular.forEach(array, function (value) {
                if (value == '@' + str.toLowerCase()) {
                    return true
                }
            });
            return false;
        };

        $scope.checkVersion = function (type) {
            var min_version = false,
                max_version = false;
            if (typeof $scope.project.versions !== 'undefined') {
                angular.forEach($scope.project.versions, function (value, key) {
                    if (value.versieid < $scope.versionId && (min_version < value.versieid || !min_version)) {
                        min_version = value.versieid;
                    }
                    if (value.versieid > $scope.versionId && (max_version > value.versieid || !max_version)) {
                        max_version = value.versieid;
                    }
                });
            }
            return type == 'left' ? min_version : max_version;
        };

        $scope.changeVersion = function (type) {
            $location.path("/page/" + $scope.pageId + "/" + $scope.checkVersion(type));
        };

        $scope.checkShowDelete = function (verseid) {
            return $rootScope.editableProjects.indexOf(verseid) !== -1;
        }

        $scope.changeIndirect = function () {
            console.log('3333', $scope.newModel.indirect);
        }

        $scope.addProject = function () {
            $("body").addClass("loading");
            var data = {
                projectcode: $scope.newModel.projectcode ? $scope.newModel.projectcode : '',
                team: $scope.newModel.team,
                projectnaam: $scope.newModel.projectnaam ? $scope.newModel.projectnaam : '',
                projectmanager: $scope.newModel.projectmanager,
                opdrachtgever: $scope.newModel.opdrachtgever ? $scope.newModel.opdrachtgever : '',
                projecttype: $scope.newModel.projecttype,
                achtergrond: $scope.newModel.achtergrond ? $scope.newModel.achtergrond : '',
                probleemstelling: $scope.newModel.probleemstelling ? $scope.newModel.probleemstelling : '',
                doel: $scope.newModel.doel ? $scope.newModel.doel : '',
                username: $scope.userInfo.userName ? $scope.userInfo.userName : '',
                financiering: $scope.newModel.financiering ? $scope.newModel.financiering : '',
                educatie: $scope.newModel.educatie ? $scope.newModel.educatie : '',
                kennisverspreiding: $scope.newModel.kennisverspreiding ? $scope.newModel.kennisverspreiding : '',
                indirect: $scope.newModel.indirect ? $scope.newModel.indirect : '',
                reference: $scope.newModel.reference ? $scope.newModel.reference : '',
                projectgroep: $scope.newModel.projectgroep ? $scope.newModel.projectgroep : '',
                urengoedkeuren: $scope.newModel.urengoedkeuren ? $scope.newModel.urengoedkeuren : ''
            };
            getQueries.addPost($scope.connectingString, "postProjectMaster", data).then(function (response) {
                if (response.data.Success) {
                    $scope.versionId = response.data.NewId;
                    angular.forEach($scope.newModel.afgestemdMet, function (value, key) {
                        var data = {
                            versieid: Number($scope.versionId),
                            afgestemdmet: Number(value)
                        };
                        getQueries.addPost($scope.connectingString, "postProjectAfgestemdMet", data).then(function (response) {
                        });
                    });
                    $scope.newModel = [];
                    $('.modalAdditional').hide();
                    $("body").removeClass("loading");
                    $location.path('/page/3/' + $scope.versionId);
                } else {
                    $scope.newModel.error = response.data.ErrorMessage;
                    $("body").removeClass("loading");
                }
            });
        };

        $scope.updateProject = function () {
            var data = {
                versieid: Number($scope.versionId),
                projectcode: $scope.newModel.projectcode ? $scope.newModel.projectcode : '',
                Team: $scope.newModel.TeamID,
                Naam: $scope.newModel.Projectnaam ? $scope.newModel.Projectnaam : '',
                ProjectManager: $scope.newModel.Projectmanager,
                opdrachtgever: $scope.newModel.opdrachtgever ? $scope.newModel.opdrachtgever : '',
                projecttype: $scope.newModel.projecttype,
                achtergrond: $scope.newModel.achtergrond ? $scope.newModel.achtergrond : '',
                probleemstelling: $scope.newModel.probleemstelling ? $scope.newModel.probleemstelling : '',
                doel: $scope.newModel.doel ? $scope.newModel.doel : '',
                financiering: $scope.newModel.financiering ? $scope.newModel.financiering : '',
                educatie: $scope.newModel.educatie ? $scope.newModel.educatie : '',
                kennisverspreiding: $scope.newModel.kennisverspreiding ? $scope.newModel.kennisverspreiding : '',
                indirect: $scope.newModel.Indirect ? $scope.newModel.Indirect : '',
                reference: $scope.newModel.reference ? $scope.newModel.reference : '',
                projectgroep: $scope.newModel.projectgroep ? $scope.newModel.projectgroep : '',
                urengoedkeuren: $scope.newModel.urengoedkeuren ? $scope.newModel.urengoedkeuren : ''
            };
            $("body").addClass("loading");
            getQueries.getQuery($scope.connectingString, "getTagsByProject?projectid=" + $scope.newModel.ProjectId).then(function (response) {
                var datResponse = response;
                if(datResponse.length > 0) {
                    angular.forEach(datResponse, function (value, key) {
                        var data = {
                            projectid: Number($scope.newModel.ProjectId),
                            tagid: Number(value.tagid)
                        };
                        getQueries.addPost($scope.connectingString, "deleteTagProject", data).then(function (response) {
                            if (datResponse.length === key + 1) {
                                angular.forEach($scope.newModel.tags, function (value, key) {
                                    var data = {
                                        projectid: Number($scope.newModel.ProjectId),
                                        tagid: Number(value)
                                    };
                                    getQueries.addPost($scope.connectingString, "postTagProject", data).then(function (response) {
                                    });
                                });
                            }
                        });
                    });
                }else{
                    angular.forEach($scope.newModel.tags, function (value, key) {
                        var data = {
                            projectid: Number($scope.newModel.ProjectId),
                            tagid: Number(value)
                        };
                        getQueries.addPost($scope.connectingString, "postTagProject", data).then(function (response) {
                        });
                    });
                }
            });
            getQueries.getQuery($scope.connectingString, "deleteProjectAfgestemdMet?versieid=" + $scope.versionId).then(function (response) {
                angular.forEach($scope.newModel.afgestemdMet, function (value, key) {
                    var data = {
                        versieid: $scope.versionId,
                        afgestemdmet: Number(value)
                    };
                    getQueries.addPost($scope.connectingString, "postProjectAfgestemdMet", data).then(function (response) {
                    });
                });
            });
            data.username = $scope.userInfo.userName;
            getQueries.addPost($scope.connectingString, 'putProjectMaster', data).then(function (response) {
                if (response.data.Success) {
                    $scope.project.error = false;
                    $scope.init();
                } else {
                    $scope.project.error = response.data.ErrorMessage;
                }
                $("body").removeClass("loading");
            });
        };

        $scope.getCommunicate = function () {
            getQueries.getProjectDetails($scope.connectingString, $scope.ProjectId, "getProjectComm", "ProjectId").then(function (response) {
                $scope.communicates = response;
            });
        };

        $scope.addCommunicate = function () {
            var data = {
                projectId: $scope.ProjectId,
                beschrijving: $scope.project.beschrijving,
                username: $scope.userInfo.userName
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, 'postProjectComm', data).then(function (response) {
                $scope.getCommunicate();
                $scope.project.beschrijving = '';
                $("body").removeClass("loading");
            });
        };

        $scope.userCanEditProject = function () {
            const hasProperStatus = $scope.newModel.Status === 'Nieuw' || $scope.newModel.Status === 'Afgekeurd';
            const canEditProjectRole = ['Administrator', 'Project control'].indexOf($scope.userInfo.roleName) !== -1;

            if (parseInt($scope.versionValue) === 1 && hasProperStatus) {
                $rootScope.deleteIconfase = true;
            }

            if (canEditProjectRole && hasProperStatus) {
                return true;
            }
            var project = _.find($rootScope.projectRights, {id: $scope.ProjectId, right: 'edit', email: auth.userName}) || false;
            if (project) {
                $scope.editIconfase = true;
                return hasProperStatus;
            }
            return false;
        };

        $rootScope.userCanEditProject = $scope.userCanEditProject;

        $scope.getProjectStatuses = function () {
            $scope.closeProject = false;
            getQueries.getQuery($scope.connectingString, "getProjectStatusses?test=123&versieid="
                + $scope.versionId + '&username=' + $scope.userInfo.userName).then(function (response) {
                $scope.projectStatuses = response;
                if ($scope.projectStatuses.length === 0) {
                    // $scope.editProject = false;
                    if ([7, 8, 9, 10].indexOf($scope.newModel.projectstatus) > -1) {
                        $scope.editProject = false;
                    } else {
                        $scope.editProject = $scope.userCanEditProject();
                    }
                } else {
                    $scope.closeProject = $scope.projectStatuses[0].closeProject;
                }
            });
            getQueries.getQuery($scope.connectingString, "getApproversByVersion?versieid=" + $scope.versionId).then(function (response) {
                $scope.projectApprovers = response;
                angular.forEach($scope.projectApprovers, function (value) {
                    value['Goedgekeurd op'] = value['Goedgekeurd op'].search('1900') >= 0 ? '' :
                        moment(new Date(value['Goedgekeurd op'])).format('DD-MM-YYYY HH:mm');
                });
            });
        };

        $scope.toNumber = function (value) {
            return (value + '').replace('€ ', '').replace(' %', '').replace('.', '').replace(',', '.');
        };

        $scope.updateAdditional = function (form, additionalQuery) {
            form = $rootScope.formActive;
            additionalQuery = $rootScope.query;
            if (additionalQuery) {
                var data = {}, date;
                angular.forEach(form, function (value, key) {
                    if (key.toLowerCase() == 'id') {
                        data['faseid'] = value;
                    } else {
                        if (key == 'PlanningEind' || key == 'PlanningStart') {
                            date = new Date(value);
                            data[key.toLowerCase()] = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                        } else {
                            if (key != 'PlanningEind' && key != 'PlanningStart') {
                                data[key.toLowerCase()] = value;
                            }
                        }
                    }
                });
                if (additionalQuery == 'putKostenUren') {
                    angular.forEach($scope.projectmanager, function (valMed) {
                        if (form.Medewerker == valMed.value) {
                            form.Medewerker = valMed.key;
                        }
                    });
                    data = {
                        naam: form.Omschrijving,
                        medewerker: form.Medewerker,
                        aantal: form['Aantal uren'] == null ? 0 : form['Aantal uren'],
                        tarief: $scope.toNumber(form['Kostprijs tarief']),
                        kosten: isNaN(parseInt($scope.toNumber(form['Kostprijs tarief'])) * parseInt(form['Aantal uren'])) ? 0 :
                            parseInt($scope.toNumber(form['Kostprijs tarief'])) * parseInt(form['Aantal uren']),
                        id: form.Id,
                        faseid: $scope.totalFase,
                    };
                    if (form.verwijderenUren) {
                        getQueries.addPost(
                            $scope.connectingString,
                            'verwijderenUren',
                            {
                                aantal: form['Aantal uren'] == null ? 0 : form['Aantal uren'],
                                id: form.Id
                            }).then(function (response) {
                        });
                    }
                }
                if (additionalQuery == 'putKostenOOP') {
                    data = {
                        bedrag: form['Bedrag '] ? $scope.toNumber(form['Bedrag ']) : 0,
                        id: form.Id,
                        leverancier: form['leverancier']
                    };
                }
                if (additionalQuery === 'postKostenOOP') {
                    data = {
                        bedrag: form['Bedrag '] ? $scope.toNumber(form['Bedrag ']) : 0,
                        leverancier: form['leverancier'],
                        inkoopid: form['inkoop'],
                        faseid: $scope.totalFase
                    };
                }
                if (additionalQuery == 'putOpbrengstenUren') {
                    angular.forEach($scope.projectmanager, function (valMed) {
                        if (form.Medewerker == valMed.value) {
                            form.Medewerker = valMed.key;
                        }
                    });
                    data = {
                        naam: form.Omschrijving,
                        medewerker: parseInt(form.Medewerker),
                        uren: form['Aantal uren'],
                        tarief: helpers.getNumber($scope.toNumber(form['Tarief'])),
                        opbrengst: helpers.getNumber($scope.toNumber(form['Tarief'])) * helpers.getNumber(form['Aantal uren']),
                        id: form.Id
                    };
                }
                if (additionalQuery == 'putOpbrengstenOOP') {
                    data = {
                        naam: form.Inkoop,
                        kosten: form['Kosten '] ? $scope.toNumber(form['Kosten ']) : 0,
                        marge: form['Marge '] ? $scope.toNumber(form['Marge ']) : 0,
                        opbrengst: form['Kosten '] && form['Marge '] ? parseInt(parseInt($scope.toNumber(form['Kosten '])) +
                            (parseFloat($scope.toNumber(form['Marge ']))
                                * parseInt($scope.toNumber(form['Kosten '])) / 100)) : 0,
                        id: form.Id,
                    };
                }
                if (additionalQuery == 'putOpbrengstenKennis') {
                    data = {
                        naam: form.Omschrijving,
                        aantal: form.Aantal ? form.Aantal : 0,
                        tarief: form.Tarief ? $scope.toNumber(form.Tarief) : 0,
                        opbrengst: form.Tarief && form.Aantal ? parseInt(form.Aantal) * parseInt($scope.toNumber(form.Tarief)) : 0,
                        id: form.Id,
                    };
                }
                if (additionalQuery == 'postRisico' || additionalQuery == 'putRisico') {
                    data = {
                        omschrijving: form.Omschrijving ? form.Omschrijving : '',
                        gevolg: form.Gevolg ? form.Gevolg : '',
                        inschatting: form.Inschatting ? form.Inschatting : '',
                        beheermaatregel: form.Beheermaatregel ? form.Beheermaatregel : '',
                        niveau: form.Niveau ? form.Niveau : '',
                        faseid: Number($scope.totalFase)
                    };
                    if (additionalQuery == 'putRisico') {
                        data['id'] = form.id;
                    }
                }
                if (additionalQuery == 'postFinanciering' || additionalQuery == 'putFinanciering' ||
                    additionalQuery == 'postFinancieringVersie' || additionalQuery == 'putFinancieringVersie') {
                    data = {
                        financiering: form.Financiering ? form.Financiering : '',
                        type: form.Type ? (form.Financiering == 'intern' ? '' : form.Type) : '',
                        begroot: form.Begroot ? $scope.toNumber(form.Begroot) :
                            (form.Financiering == 'intern' ? $scope.toNumber(form.Toegezegd) : 0),
                        toegezegd: form.Toegezegd ? $scope.toNumber(form.Toegezegd) : 0,
                        onzeker: (form.Financiering == 'intern' ? 0 :
                            parseInt(parseInt($scope.toNumber(form.Begroot))
                                - parseInt($scope.toNumber(form.Toegezegd)))),
                        boekjaar: form.Boekjaar ? form.Boekjaar : '',
                        tefactureren: form.tefactureren ? $scope.toNumber(form.tefactureren) : 0,
                        tebetalen: form.tebetalen ? $scope.toNumber(form.tebetalen) : 0,
                        // batigsaldo : form.batigsaldo ? $scope.toNumber(form.batigsaldo) : 0,
                        meetenemen: form.meetenemen ? $scope.toNumber(form.meetenemen) : 0,
                        mutaties: form.mutaties ? $scope.toNumber(form.mutaties) : 0,
                        notities: form.not_ities ? form.not_ities : ''
                    };
                    if (additionalQuery == 'putFinanciering' || additionalQuery == 'putFinancieringVersie') {
                        data['financierder'] = form.Financierder ? form.Financierder : '';
                        data['id'] = form.Id;
                    } else {
                        data['financier'] = form.Financierder ? form.Financierder : '';
                    }

                    if (additionalQuery === 'postFinanciering' || additionalQuery === 'putFinanciering') {
                        data['faseid'] = Number($scope.totalFase);
                    }
                }

                data['versieid'] = Number($scope.versionId);

                if (additionalQuery != 'postFaseDetails' && additionalQuery != 'putFaseDetails') {
                    // data['faseid'] = Number($scope.totalFase);
                } else {
                    date = new Date();
                    if (!form['PlanningEind']) {
                        data['PlanningEind'.toLowerCase()] = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                    } else {
                        data['PlanningEind'.toLowerCase()] = moment(form['PlanningEind'], 'DD-MM-YYYY').format('YYYY-MM-DD');
                    }

                    if (!form['PlanningStart']) {
                        data['PlanningStart'.toLowerCase()] = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                    } else {
                        data['PlanningStart'.toLowerCase()] = moment(form['PlanningStart'], 'DD-MM-YYYY').format('YYYY-MM-DD');
                    }

                    if (additionalQuery == 'postFaseDetails') {
                        data['username'] = $scope.userInfo.userName;

                        data['educatie'] = $scope.newModel.educatie;
                        data['kennisverspreiding'] = $scope.newModel.kennisverspreiding;
                    } else {
                        data['educatie'] = form['Educatie'] == 'Ja' ? true : false;
                        data['kennisverspreiding'] = form['Kennisverspreiding'] == 'Ja' ? true : false;
                    }
                }
                if (additionalQuery == 'postOrganisatie' || additionalQuery == 'putOrganisatie') {
                    if (data['medewerker'] === undefined) {
                        data['medewerker'] = '';
                    }
                    data['id'] = form.id;
                }

                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, additionalQuery, data).then(function (response) {
                    if (additionalQuery == 'postFaseDetails') {
                        $scope.callExtraFunctions(response.data.NewId);
                    }
                    if (additionalQuery == 'putKostenUren') {
                        $scope.callExtraPutDekkingFase();
                    }
                    if (additionalQuery == 'postOrganisatie') {
                        $scope.callExtraPostOrganisatie();
                    }

                    $('.modalAdditional').hide();
                    $("body").removeClass("loading");
                    const year = form.Boekjaar ? form.Boekjaar : ($scope.year || false);
                    $scope.getFases(year);
                    $scope.getProjectTabs();
                    $scope.GetFinancieringColor();
                    $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                });
            }
        };

        $scope.callExtraPutDekkingFase = function () {
            if ($scope.totalFase) {
                var queries = [{
                    get: 'getRolDekkingFase?versieid=' + $scope.versionId,
                    post: 'putRolDekkingFase',
                    parameter2: {
                        from: 'RolId',
                        to: 'rolId'
                    }
                }];
                var data = {};

                angular.forEach(queries, function (query) {
                    getQueries.getQuery($scope.connectingString, query.get, {'versieid': this.versieid}).then(function (response) {
                        angular.forEach(response, function (value) {
                            data = {};
                            data['faseid'] = $scope.totalFase;

                            if (query.parameter !== undefined) {
                                data[query.parameter] = value.id;
                            }

                            if (query.parameter2 !== undefined) {
                                data[query.parameter2.to] = value[query.parameter2.from];
                            }

                            getQueries.addPost($scope.connectingString, query.post, data).then(function (response) {
                                if (query.post === 'putRolDekkingFase') {
                                    getQueries.getQuery($scope.connectingString, 'deleteInternDekkingFase').then(function (response) {
                                    });
                                }
                            });
                        });
                    });
                });
            }
        };

        $scope.callExtraPostOrganisatie = function () {
            var data;
            getQueries.getQuery($scope.connectingString, 'getFasesOrganisatie?versieid=' + $scope.versionId).then(function (response) {
                angular.forEach(response, function (fase) {
                    getQueries.getQuery($scope.connectingString, 'getRollenFase?versieid=' + $scope.versionId).then(function (response) {
                        angular.forEach(response, function (roll) {
                            data = {};
                            data['faseid'] = fase.id;
                            data['rolId'] = roll.id;
                            getQueries.addPost($scope.connectingString, 'postRollenFase', data).then(function (response) {
                            });
                        });
                    });
                });
            });
        };

        $scope.callExtraFunctions = function (faseId) {
            var queries = [{
                get: 'getRollenFase?versieid=' + $scope.versionId,
                post: 'postRollenFase',
                parameter: 'rolId'
            }, {
                get: 'getInkoopFase',
                post: 'postOOPFase',
                parameter: 'inkoopid'
            }, {
                get: 'getExplFase',
                post: 'postExplFase',
                parameter: 'exploitatieId'
            }, {
                get: 'getRolDekkingFase?versieid=' + $scope.versionId,
                post: 'postRolDekkingFase',
                parameter2: {
                    from: 'RolId',
                    to: 'rolId'
                }
            }], data = {};
            angular.forEach(queries, function (query) {
                getQueries.getQuery($scope.connectingString, query.get).then(function (response) {
                    angular.forEach(response, function (value) {
                        data = {};
                        data['faseid'] = faseId;

                        if (query.parameter !== undefined) {
                            data[query.parameter] = value.id;
                        }

                        if (query.parameter2 !== undefined) {
                            data[query.parameter2.to] = value[query.parameter2.from];
                        }

                        getQueries.addPost($scope.connectingString, query.post, data).then(function (response) {
                            if (query.post === 'postRolDekkingFase') {
                                getQueries.getQuery($scope.connectingString, 'deleteInternDekkingFase').then(function (response) {
                                });
                            }
                        });
                    });
                });
            });
        };

        $scope.createNewVersion = function () {
            if (!$rootScope.versionButtonBlocked) {

                $rootScope.versionButtonBlocked = true;

                var data = {
                    versieid: Number($scope.versionId)
                };
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, 'postNieuweVersie', data).then(function (response) {
                    if (response.data.Success) {
                        $rootScope.versionButtonBlocked = false;
                        $location.path('/page/' + $scope.pageId + '/' + response.data.NewId);
                    } else {
                        $rootScope.versionButtonBlocked = false;
                        // $scope.versie.error = response.data.ErrorMessage;
                    }
                    $("body").removeClass("loading");
                });
            }
        };

        $scope.removeItem = function (id, tabId) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                $("body").addClass("loading");
                if (tabId == 1) {
                    getQueries.getQuery($scope.connectingString, "deleteFases?faseid=" + parseInt(id)).then(function (response) {
                        $("body").removeClass("loading");
                        $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                        $scope.getFases();
                        $scope.getProjectTabs();
                    });
                }
                if (tabId == 121) {
                    getQueries.getQuery($scope.connectingString, "deleteOrganisatie?organisatieid=" + parseInt(id)).then(function (response) {
                        $("body").removeClass("loading");
                        $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                        $scope.getProjectTabs();
                    });
                }
                if (tabId == 6) {
                    getQueries.getQuery($scope.connectingString, "deleteRisico?risicoid=" + parseInt(id)).then(function (response) {
                        $("body").removeClass("loading");
                        $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                        $scope.getProjectTabs();
                    });
                }
                if (tabId == 5) {
                    getQueries.getQuery($scope.connectingString, "deleteFinanciering?id=" + parseInt(id)).then(function (response) {
                        $("body").removeClass("loading");
                        $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                        $scope.getProjectTabs();
                    });
                }
                if (tabId == 11) {
                    getQueries.getQuery($scope.connectingString, "deleteOop?id=" + parseInt(id)).then(function (response) {
                        $("body").removeClass("loading");
                        $scope.getFinancieringOverzichtProject($scope.newModel.financiering === 'project');
                        $scope.getProjectTabs();
                        $rootScope.childKey = 1;
                    });
                }
            }
        };

        $scope.removeProject = function (versieid) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                $("body").addClass("loading");
                getQueries.getQuery($scope.connectingString, "getProjectMaster?versieid=" + versieid + '&username=' + $scope.userInfo.userName).then(function (response) {
                    if (response[0]) {
                        var projectId = response[0].ProjectId;
                        // getQueries.getQuery($scope.connectingString, "deleteProject?projectid=" + parseInt(projectId)).then(function (response) {
                        getQueries.getQuery($scope.connectingString, "deleteProject?versieid=" + versieid).then(function (response) {
                            $("body").removeClass("loading");
                            $scope.initGrid();
                        });
                    }
                });
            }
        };

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');
        $scope.right = 0;
        $scope.sizeContent = 12;

        $scope.modifyRight = function () {
            $scope.right = $scope.right == 0 ? '400px' : 0;
            $scope.sizeContent = $scope.sizeContent == 12 ? 8 : 12;
        };

        function buildToggler(componentId) {
            return function () {
                $mdSidenav(componentId).toggle();
            };
        }

        $scope.clickStatus = function (projectStatus) {
            if(!$scope.statuButton){
                $scope.statuButton = true;
                $scope.newProjectStatus = projectStatus;
                if (projectStatus.popup == 'True') {
                    $('.modalStatus').show();
                } else {
                    $scope.updateStatus();
                }

                const url = `getApproveProjectDetails?username=${$scope.userInfo.userName}&versieid=${$scope.versionId}`;
                getQueries.getQuery($scope.connectingString, url).then((r) => {
                    const projectDetails = r[0];

                    const emailData = {
                        To: [projectDetails.Email],
                        Body: ``,
                        Subject: `Nieuwe versie project ${ projectDetails.Projectcode } goedgekeurd`
                    };

                    emailData.Body += `<p> Beste ${ projectDetails.Firstname }</p> `;
                    emailData.Body += `${ projectDetails.Approver } heeft zojuist een nieuwe versie van ${ projectDetails.Projectcode } `;
                    emailData.Body += `${ projectDetails.Projectdescription } goedgekeurd. Fijn, je kunt nu verder met het project en `;
                    emailData.Body += `zorgen dat CROW weer iets heel moois gaat opleveren. `;
                    emailData.Body += `<p></p>`;
                    emailData.Body += `<p>Met vriendelijke groet,</p>`;
                    emailData.Body += `<p>Marc Hanekamp</p>`;

                    let webservice = env.webservice;
                    $http({
                        url: webservice+`/api/email`,
                        method: "POST",
                        data:emailData

                    }).then(function (response) {});

                });
            }
            
            // if(projectStatus.editable == 'True') {
            //     $scope.updateStatus();
            // }else{
            //
            // }
        };

        $scope.addStatus = function () {
            if ($scope.newProjectStatus.WebserviceFunction) {
                var data = {
                    beschrijving: $scope.status.beschrijving,
                    projectid: $scope.ProjectId,
                    username: $scope.userInfo.userName
                };
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, 'postProjectComm', data).then(function (response) {
                    // alert(JSON.stringify(response));
                    $('.modalStatus').hide();
                    $scope.updateStatus();
                    $("body").removeClass("loading");
                });
            }
        };

        $scope.updateStatus = function () {
            // if ($scope.newProjectStatus.WebserviceFunction == 'GoedkeurenProject') {
            //     getQueries.getQuery($scope.connectingString, 'getU4Project?versieid=' + $scope.versionId).then(function (response) {
            //         alert(JSON.stringify(response));
            //         var data = response;
            //         getFromWebService.getUserToken('http://brandnewkey.sohosted-vps.nl:2017').then(function (response) {
            //             alert(JSON.stringify(response));
            //             var user = response;
            //             getFromWebService.getConnectionStrings('http://brandnewkey.sohosted-vps.nl:2017', user).then(function (response) {
            //                 alert(JSON.stringify(response));
            //                 var connectString = response;
            //                 getFromWebService.addPost('http://brandnewkey.sohosted-vps.nl:2017', user, connectString, 'postProject', data).then(function (response) {
            //                     alert(JSON.stringify(response));
            //                     getQueries.getQuery($scope.connectingString, 'getU4ProjectBudget?versieid=' + $scope.versionId).then(function (response) {
            //                         alert(JSON.stringify(response));
            //                         data = response;
            //                         getFromWebService.addPost('http://brandnewkey.sohosted-vps.nl:2017', user, connectString, 'postProjectBudget', data).then(function (response) {
            //                             alert(JSON.stringify(response));
            //                         });
            //                     });
            //                 });
            //             });
            //         });
            //     });
            // }
            getQueries.getQuery($scope.connectingString, $scope.newProjectStatus.WebserviceFunction + '?versieid='
                + $scope.versionId + '&username=' + $scope.userInfo.userName).then(function (response) {
                // alert(JSON.stringify(response));
                $scope.init();
                buildToggler('right');
                $scope.modifyRight();
            });
        };

        $scope.allSelected = '';
        $scope.$watch('newModel.afgestemdMet', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.allSelected = '';
                _.each($scope.afgestemdMet, function (itemParent) {
                    _.each(newValue, function (item, key) {
                        if (parseInt(itemParent.key) === parseInt(item)) {
                            $scope.allSelected += itemParent.value + (newValue.length !== key + 1 ? ', ' : '');
                        }
                    });
                });
            }
        });

        $scope.showRemove = function () {
            $('.modalRemove').show();
        };

        $scope.getRemove = function () {
            var project = _.where($rootScope.projectRights, {id: $scope.ProjectId, email: auth.userName})[0] || false;
            if (project) {
                return project.right === 'edit' && ($scope.newModel.Status === 'Nieuw' || $scope.newModel.Status === 'Afgekeurd');
            }
            return false;
        };

        $scope.removeVersion = function () {
            getQueries.getQuery($scope.connectingString, 'deleteproject' + '?versieid='
                + $scope.versionId).then(function (response) {
                $location.path("/projects");
            });
        };

        $scope.addRemoveStatus = function () {
            if ($scope.removeItemStatus.item !== null) {
                var data = {
                    versieid: $scope.versionId,
                    status: $scope.removeItemStatus.item,
                    projectId: $scope.ProjectId
                };
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, 'updateProjectStatus', data).then(function (response) {
                    $('.modalRemove').hide();
                    $("body").removeClass("loading");
                    $scope.init();
                });
            }
        };

        $scope.reopenProject = function () {
            var data = {
                versieid: $scope.versionId,
                projectId: $scope.ProjectId
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, 'reopenProject', data).then(function (response) {
                $("body").removeClass("loading");
                $scope.init();
            });
        };

        $scope.init();
    }

    PageController.$inject = ["$scope", "getQueries", "$routeParams", "typeGrid", "typeProjectdetail",
        "constructTab", "$location", "getFromWebService", "$rootScope", "$mdSidenav", "auth", "filteredListService", "NgTableParams",
        "kostenOOPConfig", "kostenUrenConfig", "opbrengstenUrenConfig", "opbrengstenOOPConfig", "helpers", "Flash", "$http", "env"];

    return PageController;
});