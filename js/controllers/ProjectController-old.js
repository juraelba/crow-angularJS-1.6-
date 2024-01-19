define([], function () {

    function ProjectController($scope, $location, auth, $routeParams, getQueries, constructTable) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.versionId = $routeParams.id;
        $scope.project = [];
        $scope.communicates = [];
        $scope.fase = [];
        $scope.versie = [];
        $scope.additionalForm = [];
        $scope.additionalQuery = false;
        alert("dfsd")

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getTeams").then(function (response) {
                    $scope.project.teams = response;
                });
                getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectMaster", "versieid").then(function (response) {
                    getQueries.getQuery($scope.connectingString, "getFormFields?form=projectMaster").then(function (response) {
                        $scope.projectForm = response;
                        console.log(response);
                    });
                    if (response.length == 0) {
                        $location.path("/projects");
                    } else {
                        $scope.project = response[0];
                        getQueries.getQuery($scope.connectingString, "getProjectVersies?projectid=" + $scope.project.ProjectId).then(function (response) {
                            $scope.project.versions = response;
                        });
                        $scope.getCommunicate();
                        getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getProjectAfgestemdMet", "versieid").then(function (response) {
                            $scope.project.afgestemdMet = [];
                            angular.forEach(response, function (value, key) {
                                this.push(value.fkTeamId);
                            }, $scope.project.afgestemdMet);
                            $("body").removeClass("loading");
                        });
                        getQueries.getQuery($scope.connectingString, "getProjectManagers").then(function (response) {
                            $scope.project.managers = response;
                        });
                        $scope.getFase();
                        $scope.getFases();
                        $scope.getResultaat();
                        $scope.getFinanciering();
                        $scope.getRisicos();
                        $scope.getOpbrengstenProject();
                        $scope.getTotaalKostenProject();
                    }
                });
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

        $scope.getFase = function () {
            constructTable.fromQuery($scope.connectingString, $scope.versionId, "getFaseDetails", "versieid").then(function (response) {
                var data = response;
                $scope.faseDetails = data[0];
                $scope.cols = data[1];
            });
        };

        $scope.getResultaat = function () {
            constructTable.fromQuery($scope.connectingString, $scope.versionId, "getResultaat", "versieid").then(function (response) {
                var data = response;
                $scope.resultaat = data[0];
                $scope.resultaatCols = data[1];
            });
        };

        $scope.getFinanciering = function () {
            constructTable.fromQuery($scope.connectingString, $scope.versionId, "getFinanciering", "versieid").then(function (response) {
                var data = response;
                $scope.Financiering = data[0];
                $scope.FinancieringCols = data[1];
            });
        };

        $scope.getRisicos = function () {
            constructTable.fromQuery($scope.connectingString, $scope.versionId, "getRisicos", "versieid").then(function (response) {
                var data = response;
                $scope.Risicos = data[0];
                $scope.RisicosCols = data[1];
            });
        };

        $scope.getFases = function () {
            $("body").addClass("loading");
            getQueries.getProjectDetails($scope.connectingString, $scope.versionId, "getFases", "versieid").then(function (response) {
                $scope.fases = response;
                $("body").removeClass("loading");
            });
        };

        $scope.getTotaalKostenProject = function () {
            $("body").addClass("loading");
            getQueries.getProjectDetails($scope.connectingString, $scope.project.ProjectId, "getTotaalKostenProject", "projectid").then(function (response) {
                $scope.totalKostenProject = response[0].kosten;
                $("body").removeClass("loading");
            });
        };

        $scope.getOpbrengstenProject = function () {
            $("body").addClass("loading");
            getQueries.getProjectDetails($scope.connectingString, $scope.project.ProjectId, "getTotaalOpbrengstenProject", "projectid").then(function (response) {
                $scope.opbrengstenProject = response[0].opbrengst;
                $("body").removeClass("loading");
            });
        };

        $scope.changeFase = function (type) {
            if (type == 'total') {
                $scope.kostenFase = $scope.totalFase;
            } else {
                $scope.totalFase = $scope.kostenFase;
            }
            $scope.getTotalDetails();
            $scope.getKostenDetails();
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

        $scope.updateAdditional = function (plus) {
            if ($scope.additionalQuery) {
                var data = {};
                // angular.forEach($scope.additionalForm, function (value, key) {
                //     data[key.toLowerCase()] = value;
                // });
                // console.log($scope.additionalForm);
                if ($scope.additionalQuery == 'putOpbrengstenUren' || $scope.additionalQuery == 'postOpbrengstenUren') {
                    // - подвкладка uren: postOpbrengstenUren с парамтерами @faseid, @naam, @functie, @uren, @tarief, @opbrengst,
                    data = {
                        naam: $scope.additionalForm['Omschrijving'],
                        functie: $scope.additionalForm['Fuctienaam'],
                        uren: Number($scope.additionalForm['Aantal uren']),
                        tarief: Number($scope.additionalForm['Kostprijs tarief']),
                        opbrengst: Number($scope.additionalForm['Opbrengst']),
                        id: $scope.additionalForm['Id']
                    };
                }
                if ($scope.additionalQuery == 'putOpbrengstenOOP' || $scope.additionalQuery == 'postOpbrengstenOOP') {
                    // - подвкладка OOP: postOpbrengstenOOP с параметрами @faseid, @naam, @kosten, @marge, @opbrengst
                    data = {
                        naam: $scope.additionalForm['Omschrijving'],
                        kosten: $scope.additionalForm['Kosten'],
                        marge: $scope.additionalForm['Marge'],
                        opbrengst: Number($scope.additionalForm['Opbrengst']),
                        id: $scope.additionalForm['Id']
                    };
                }
                if ($scope.additionalQuery == 'putOpbrengstenKennis' || $scope.additionalQuery == 'postOpbrengstenKennis') {
                    // - подвкладка Kennis: postOpbrengstenKennis с параметрами @faseid, @naam, @aantal, @tarief, @opbrengst
                    data = {
                        naam: $scope.additionalForm['Omschrijving'],
                        aantal: $scope.additionalForm['Aantal'],
                        tarief: Number($scope.additionalForm['Tarief']),
                        opbrengst: Number($scope.additionalForm['Opbrengst']),
                        id: $scope.additionalForm['Id']
                    };
                }
                if ($scope.additionalQuery.search("/post/")) {
                    data['faseid'] = $scope.totalFase;
                }
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, $scope.additionalQuery, data).then(function (response) {
                    $scope.getTotalDetails();
                    $('.modalAdditional').hide();
                    $("body").removeClass("loading");
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

    ProjectController.$inject = ["$scope", "$location", "auth", "$routeParams", "getQueries", "constructTable"];

    return ProjectController;
});