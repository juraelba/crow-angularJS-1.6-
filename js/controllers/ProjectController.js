define([], function () {

    function ProjectController($scope, $location, auth, $routeParams, getQueries, constructTable, constructTab, constructForm) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.versionId = $routeParams.id;
        $scope.project = [];
        $scope.communicates = [];
        $scope.fase = [];
        $scope.versie = [];
        $scope.additionalForm = [];
        $scope.additionalQuery = false;
        $scope.faseForm = [];
        $scope.totalFase = 0;

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getFormFields?form=projectMaster").then(function (response) {
                    $scope.projectForm = response;
                    getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                        $scope.project.teams = response;
                    });
                    $scope.projectForm = constructForm.init($scope.connectingString, $scope.projectForm);

                    getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectMaster", "versieid").then(function (response) {
                        if (response.length == 0) {
                            $location.path("/projects");
                        } else {
                            $scope.project = response[0];
                            getQueries.getQuery($scope.connectingString, "getProjectVersies?projectid=" + $scope.project.ProjectId).then(function (response) {
                                $scope.project.versions = response;
                            });
                            getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectAfgestemdMet", "versieid").then(function (response) {
                                $scope.project.afgestemdMet = [];
                                angular.forEach(response, function (value, key) {
                                    this.push(value.fkTeamId);
                                }, $scope.project.afgestemdMet);
                                $("body").removeClass("loading");
                            });


                            //=== project messages are into right panel
                            $scope.getCommunicate();

                            //=== tabs under project form
                            // $scope.getFase();
                            // $scope.getFases();
                            // $scope.getResultaat();
                            // $scope.getFinanciering();
                            // $scope.getRisicos();
                            // $scope.getOpbrengstenProject();
                            // $scope.getTotaalKostenProject();
                            $scope.getProjectStatuses();
                            $scope.getProjectTabs();
                        }
                    });
                });

            });
        };

        $scope.getProjectTabs = function () {
            getQueries.getQuery($scope.connectingString, "getTabs").then(function (response) {
                $scope.projectTabs = response;
                angular.forEach($scope.projectTabs, function (value, key) {
                    value.construction = constructTab.init($scope.connectingString, value, $scope.versionId, $scope.totalFase, $scope.project.ProjectId);
                    if (value.Parent != null) {
                        $scope.addTab(value, value.Parent);
                    }
                });
                // console.log($scope.projectTabs);
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
                        tab.construction = constructTab.init($scope.connectingString, projectTab, $scope.versionId, $scope.totalFase, $scope.project.ProjectId);
                        value.tabs.push(tab);
                    }
                }
            });
        };

        $scope.getProjectStatuses = function () {
            getQueries.getQuery($scope.connectingString, "getProjectStatusses").then(function (response) {
                $scope.projectStatuses = response;
            });
            getQueries.getQuery($scope.connectingString, "getApprovers").then(function (response) {
                $scope.projectApprovers = response;
            });
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
            $location.path("/project/" + $scope.checkVersion(type));
        };

        $scope.getCommunicate = function () {
            getQueries.getProjectDetails($scope.connectingString, $scope.project.ProjectId, "getProjectComm", "ProjectId").then(function (response) {
                $scope.communicates = response;
            });
        };


        $scope.changeFase = function (fase) {
            $scope.totalFase = fase;
            $scope.getProjectTabs();
        };

        $scope.getTotalDetails = function () {
            getQueries.getProjectDetails($scope.connectingString, $scope.totalFase, "getTotaalOpbrengstenFase", "faseid").then(function (response) {
                $scope.opbrengstenFase = response[0].opbrengst;
            });
            constructTable.fromQuery($scope.connectingString, $scope.totalFase, "getOpbrengstenUren", "faseId").then(function (response) {
                var data = response;
                $scope.Uren = data[0];
                $scope.UrenCols = data[1];
            });
            constructTable.fromQuery($scope.connectingString, $scope.totalFase, "getOpbrengstenOOP", "faseId").then(function (response) {
                var data = response;
                $scope.OOP = data[0];
                $scope.OOPCols = data[1];
            });
            constructTable.fromQuery($scope.connectingString, $scope.totalFase, "getOpbrengstenKennis", "faseId").then(function (response) {
                var data = response;
                $scope.Kennis = data[0];
                $scope.KennisCols = data[1];
            });
        };

        $scope.getKostenDetails = function () {
            getQueries.getProjectDetails($scope.connectingString, $scope.totalFase, "getTotaalKostenFase", "faseid").then(function (response) {
                $scope.totalKostenFase = response[0].kosten;
            });
            constructTable.fromQuery($scope.connectingString, $scope.kostenFase, "getKostenUren", "faseId").then(function (response) {
                var data = response;
                $scope.KostenUren = data[0];
                $scope.KostenUrenCols = data[1];
            });
            constructTable.fromQuery($scope.connectingString, $scope.kostenFase, "getKostenOOP", "faseId").then(function (response) {
                var data = response;
                $scope.KostenOOP = data[0];
                $scope.KostenOOPCols = data[1];
            });
            constructTable.fromQuery($scope.connectingString, $scope.kostenFase, "getKostenDekkingsbijdrage", "faseId").then(function (response) {
                var data = response;
                $scope.KostenDekkin = data[0];
                $scope.KostenDekkinCols = data[1];
            });
        };

        $scope.addCommunicate = function () {
            var data = {
                projectId: $scope.project.ProjectId,
                beschrijving: $scope.project.beschrijving
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, 'postProjectComm', data).then(function (response) {
                $scope.getCommunicate();
                $scope.project.beschrijving = '';
                $("body").removeClass("loading");
            });
        };

        $scope.showAdditional = function (row, query, plus) {
            $scope.additionalFormPlus = plus;
            if (plus) {
                $scope.additionalForm = {};
                angular.forEach(row, function (value, key) {
                    $scope.additionalForm[key] = key == 'Omschrijving' ? value : '';
                });
            } else {
                $scope.additionalForm = row;
            }
            $scope.additionalQuery = typeof query !== 'undefined' ? query : false;
            $('.modalAdditional').show();
        };

        $scope.updateAdditional = function (form, additionalQuery) {
            if (additionalQuery) {
                var data = {}, date;
                angular.forEach(form, function (value, key) {
                    if (key.toLowerCase() == 'id') {
                        data['faseid'] = value;
                    } else {
                        if (typeof value === 'object') {
                            date = new Date(value);
                            data[key.toLowerCase()] = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                        } else {
                            if (key != 'Planning opleveren' && key != 'Planning starten') {
                                data[key.toLowerCase()] = value;
                            }
                        }
                    }
                });
                data['versieid'] = $scope.versionId;
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, additionalQuery, data).then(function (response) {
                    $('.modalAdditional').hide();
                    $("body").removeClass("loading");
                    $scope.getProjectTabs();
                });
            }
        };

        $scope.showFaseForm = function () {
            $('.modalWindow').show();
        };

        $scope.addFase = function () {
            var data = {
                versieid: $scope.versionId,
                naam: $scope.fase.naam,
                planning: $scope.fase.planning,
                doel: $scope.fase.doel,
                resultaat: $scope.fase.resultaat,
                kwaliteit: $scope.fase.kwaliteit,
                afname: $scope.fase.afname
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, 'postFaseDetails', data).then(function (response) {
                if (response.data.Success) {
                    $('.modalWindow').hide();
                    $scope.fase = [];
                    $scope.getFase();
                    $scope.getFases();
                    $("body").removeClass("loading");
                } else {
                    $scope.fase.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.updateProject = function () {
            var data = {
                versieid: Number($scope.versionId),
                Naam: $scope.project.Projectnaam,
                Programma: $scope.project.Programma,
                ProjectManager: $scope.project.Projectmanager,
                Team: $scope.project.Team,
                username: $scope.userInfo.userName,
                Autorisatie: $scope.project['Autorisatie door']
            };
            $("body").addClass("loading");
            angular.forEach($scope.project.afgestemdMet, function (value, key) {
                var data = {
                    versieid: Number($scope.versionId),
                    afgestemdmet: Number(value)
                };
                getQueries.addPost($scope.connectingString, "postProjectAfgestemdMet", data).then(function (response) {
                });
            });
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

        $scope.createNewVersion = function () {
            var data = {
                versieid: Number($scope.versionId)
            };
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, 'postNieuweVersie', data).then(function (response) {
                // console.log(response);
                if (response.data.Success) {
                    $location.path("/project/" + response.data.NewId);
                } else {
                    $scope.versie.error = response.data.ErrorMessage;
                }
                $("body").removeClass("loading");
            });
        };

        $scope.init();
    }

    ProjectController.$inject = ["$scope", "$location", "auth", "$routeParams", "getQueries", "constructTable", "constructTab", "constructForm"];

    return ProjectController;
});