define(['moment'], function (moment) {
    function HoursController($scope, auth, $rootScope, getQueries, Flash, NgTableParams, $routeParams, $timeout, $mdDateLocale, $filter, helpers) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.activities = [];
        $scope.projects = [];
        $scope.project = null;
        $scope.currentWeek = [];
        $scope.lastWeek = [];
        $scope.secondLastWeek = [];
        $scope.thirdLastWeek = [];
        $scope.currentDate = null;
        $scope.statuses = [];
        $scope.rolls = [];
        $scope.fases = [];
        $scope.id = null;
        $scope.routeWeek = $routeParams.week === undefined ? null : $routeParams.week;
        $scope.routeEmployee = $routeParams.employee === undefined ? null : $routeParams.employee;
        $scope.weekStatuses = {
            currentWeek: 0,
            lastWeek: 0,
            secondLastWeek: 0,
            thirdLastWeek: 0
        };
        $scope.statusesWeek = {
            1: 'Opgeslagen',
            2: 'Afgekeurd',
            3: 'Ingediend',
            4: 'Goedgekeurd'
        };
        $scope.detailsEdit = [];
        $scope.selectItem = {};
        $scope.widthDetailsTable = {
            'Aantal uren': '5',
            Activiteit: '20',
            Fase: '15',
            Medewerker: '10',
            Opmerking: '5',
            Project: '20',
            Rol: '5',
            Status: '5'
        };

        $scope.projectId = -1;
        $scope.selectedProject = {};

        //total available hours per week for current user
        $scope.avilableHoursPerWeek = -1;

        $scope.datesByWeeks = {};
        $scope.alreadyUsedHoursByDay = {};
        $scope.alreadyUsedHoursByProject = {};
        $scope.alreadyUsedHoursByWeek = {};
        $scope.availableHoursForProject = {};

        $scope.availableHoursForCurrentProject = 0;
        $scope.availableHoursForCurrentWeek = 0;
        $scope.availableHoursForSelectedProjectForCurrentWeek = 0;

        $scope.editDetailsHours = {};
        $scope.users = [];
        $scope.roles = [];
        $scope.user = null;
        $scope.currentUser = {
            restriction: auth.restriction,
            hoursPerWeek: 40,
            userName: auth.userName,
        };
        $scope.currentRole = [];

        $mdDateLocale.parseDate = function (dateString) {
            var m = moment(dateString, 'DD/MM/YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $scope.init = function () {
            moment.locale('nl-be');
            if ($scope.routeWeek !== null) {
                $scope.currentDate = moment().day("Maandag").week($scope.routeWeek).format("DD-MM-YYYY");
            } else {
                $scope.date = $routeParams.date === undefined ? moment().format("DD-MM-YYYY") : moment().format($routeParams.date);
                $scope.currentDate = new Date();
            }
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getLoggedInEmployee?username=" + $scope.userInfo.userName).then(function (response) {
                    if (response[0]) {
                        $scope.employeeId = $scope.routeEmployee !== null ? $scope.routeEmployee : response[0].key;
                        $scope.employee = response[0].value;
                        if ($scope.employeeId !== null) {
                            $scope.getProjects();
                            getQueries.getQuery($scope.connectingString, "getUrenTeWerken?MedewerkerId=" + $scope.employeeId).then(function (response) {
                                if (response[0]) {
                                    $scope.hoursWeek = response[0].UrenPerWeek;
                                    $scope.fillTable();
                                }
                            });
                            getQueries.getQuery($scope.connectingString, "getGemisteWeken?MedewerkerId=" + $scope.employeeId).then(function (response) {
                                $scope.missedWeeks = response;
                                var data = response;
                                if (data.length > 0) {
                                    $scope.missedWeeksCols = $scope.generateColumns(data[0]);
                                    $scope.missedWeeksTable = new NgTableParams({
                                        page: 1, // show first page
                                        count: data.length
                                    }, {
                                        filterDelay: 0,
                                        dataset: data,
                                        counts: []
                                    });
                                }
                            });
                        }
                    }
                });

                getQueries.getQuery($scope.connectingString, "getLoggedInUserDetails?username=" + $scope.userInfo.userName).then(function (response) {
                    $scope.avilableHoursPerWeek = parseFloat(response[0]['HoursPerWeek']);
                });

                getQueries.getQuery($scope.connectingString, "getActiviteiten").then(function (response) {
                    $scope.activities = response;
                });

                getQueries.getQuery($scope.connectingString, "getRoles").then(function (response) {
                    $scope.roles = response;
                    getQueries.getQuery($scope.connectingString, "getUsers").then(function (response) {
                        $scope.users = response;
                        /*angular.forEach($scope.users, function (user) {
                            $scope.currentRole[user.Id] = user.RoleId;
                        });*/
                    });
                });

                $("body").removeClass("loading");
            });
        };

        $scope.changeUser = function(user) {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getLoggedInEmployee?username=" + user).then(function (response) {

                    getQueries.getQuery($scope.connectingString, "getLoggedInUserDetails?username=" + user).then(function (response) {
                        if (response[0]) {
                            $scope.currentUser.restriction = response[0].Restriction;
                            $scope.currentUser.hoursPerWeek = response[0].HoursPerWeek;
                        }
                    });

                    if (response[0]) {

                        $scope.employeeId = response[0].key;
                        $scope.employee = response[0].value;
                        if ($scope.employeeId !== null) {
                            $scope.getProjects();
                            getQueries.getQuery($scope.connectingString, "getUrenTeWerken?MedewerkerId=" + $scope.employeeId).then(function (response) {

                                if (response[0]) {
                                    $scope.hoursWeek = response[0].UrenPerWeek;

                                    $scope.fillTable();
                                }
                            });
                            getQueries.getQuery($scope.connectingString, "getGemisteWeken?MedewerkerId=" + $scope.employeeId).then(function (response) {

                                $scope.missedWeeks = response;
                                var data = response;
                                if (data.length > 0) {
                                    $scope.missedWeeksCols = $scope.generateColumns(data[0]);
                                    $scope.missedWeeksTable = new NgTableParams({
                                        page: 1, // show first page
                                        count: data.length
                                    }, {
                                        filterDelay: 0,
                                        dataset: data,
                                        counts: []
                                    });
                                }
                            });
                        }
                    }
                });

                getQueries.getQuery($scope.connectingString, "getLoggedInUserDetails?username=" + $scope.currentUser.userName).then(function (response) {
                    $scope.avilableHoursPerWeek = parseFloat(response[0]['HoursPerWeek']);
                });

                getQueries.getQuery($scope.connectingString, "getActiviteiten").then(function (response) {
                    $scope.activities = response;
                });

                $("body").removeClass("loading");
            });
        };

        $scope.getProjects = function () {
            getQueries.getQuery($scope.connectingString, "getProjectsByHoursEmployee?medewerkerid=" + $scope.employeeId + "&year=" + moment($scope.date, "DD-MM-YYYY").format("YYYY")).then(function (response) {
                $scope.availableHoursForProject = [];
                $scope.projects = response.map(function (value) {
                    value['rolid'] = getNumber(value['rolid']);
                    value['hash'] = getProjectHash(value);
                    return value;
                });

                angular.forEach($scope.projects, function (item) {
                    saveAvailableHoursForProject(item);
                });
            });
        };

        function saveAvailableHoursForProject(project) {
            var projectHash = getProjectHash(project);

            $scope.availableHoursForProject[projectHash] = getNumber(project['maxHoursProject']);
        }

        function getNumber(value) {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : value;
            return value;
        }

        function getProjectHash(project) {
            var key = getNumber(project['key']);
            var rolid = getNumber(project['rolid']);
            var faseid = getNumber(project['faseid']);
            return 'key' + key + '_' + 'rolid' + rolid + '_' + 'faseid' + faseid;
        }

        $scope.fillTable = function () {
            $scope.datesByWeeks = {};
            $scope.alreadyUsedHoursByDay = {};
            $scope.alreadyUsedHoursByProject = {};
            $scope.alreadyUsedHoursByWeek = {};
            $scope.currentWeek = [];
            $scope.lastWeek = [];
            $scope.secondLastWeek = [];
            $scope.thirdLastWeek = [];
            $scope.fillDate($scope.currentWeek, 0, 0, 5, 'currentWeek');
            $scope.fillDate($scope.lastWeek, 0, 7, 5, 'lastWeek');
            $scope.fillDate($scope.secondLastWeek, 0, 14, 5, 'secondLastWeek');
            $scope.fillDate($scope.thirdLastWeek, 0, 21, 5, 'thirdLastWeek');
        };

        $scope.fillDate = function (week, index, substract, weekStatus, key) {
            var monday = moment($scope.currentDate).startOf('isoweek');
            // 
            if (substract) {
                monday = monday.subtract(substract, 'days');
            }
            if (index) {
                monday = monday.add(index, 'days');
            }
            monday = monday.format("dd DD-MM-YYYY");
            var val = changeFormat(monday.substr(3));
            
            getQueries.getQuery($scope.connectingString, "getSumUrenByEmployeeDate?MedewerkerId=" + $scope.employeeId +
                '&Datum=' + val).then(function (response) {
                if (response[0]) {
                    $scope.datesByWeeks[val] = key;
                    var value = isNaN(parseFloat(response[0].Uren)) ? 0 : parseFloat(response[0].Uren);

                    $scope.alreadyUsedHoursByDay[val] = value;
                    if (isNaN($scope.alreadyUsedHoursByDay[val])) {
                        $scope.alreadyUsedHoursByDay[val] = 0;
                    }

                    if (isNaN($scope.alreadyUsedHoursByWeek[key])) {
                        $scope.alreadyUsedHoursByWeek[key] = 0;
                    }

                    $scope.alreadyUsedHoursByWeek[key] += value;

                    var status = response[0].Status == null ? 0 : response[0].Status,
                        uren = response[0].Uren == null ? 0 : (response[0].Uren + '').replace('.', ',');
                    getQueries.getQuery($scope.connectingString, "getUrenStatus?statusId=" + status).then(function (response) {
                        if (response[0]) {
                            $scope.statuses[substract] = {
                                'color': response[0].Color,
                                'name': response[0].StatusDescription
                            };
                        }
                    });
                    var minStatus = 5;
                    getQueries.getQuery($scope.connectingString, "getUrenByEmployeeDate?MedewerkerId=" + $scope.employeeId +
                        '&Datum=' + val).then(function (response) {
                        var data = response;
                        if (data.length > 0) {
                            angular.forEach(data, function (valueData) {
                                var projectid = valueData.projectid;

                                if (isNaN($scope.alreadyUsedHoursByProject[projectid])) {
                                    $scope.alreadyUsedHoursByProject[projectid] = 0;
                                }

                                var value = parseFloat(valueData['Aantal uren']);
                                if (isNaN(value)) {
                                    value = 0;
                                }

                                $scope.alreadyUsedHoursByProject[projectid] += value;

                                if (minStatus > valueData.StatusId) {
                                    minStatus = valueData.StatusId;
                                }
                                if (weekStatus > valueData.StatusId) {
                                    weekStatus = valueData.StatusId;
                                }
                            });
                        }
                        week.push({
                            'date': monday,
                            'value': uren,
                            'status': status,
                            'minStatus': minStatus
                        });
                        if (index < 6) {
                            $scope.fillDate(week, index + 1, substract, weekStatus, key);
                        } else {
                            $scope.weekStatuses[key] = weekStatus;
                        }
                    });

                }
            });
        };

        $scope.checkStatus = function (week) {
            if ($scope.currentUser.restriction === 1) {
                var flag = false,
                    count = 0;
                angular.forEach(week, function (day) {
                    if (day.status == 1) flag = true;
                    count += parseFloat((day.value + '').replace(',', '.')) == null ? 0 : parseFloat((day.value + '').replace(',', '.'));
                });
                if (flag && count == $scope.hoursWeek) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };

        $scope.selectWeeek = function (selectedWeek) {
            console.log('222222', selectedWeek)
            $scope.hideWeek = 0;
            var monday = moment().day("Maandag").week(selectedWeek);
            $scope.currentDate = monday;
            $scope.date = moment(new Date(monday), ["DD-MM-YYYY", "DD-MM-YYYY"]);
            $scope.fillTable();
        };

        $scope.setCurrentDate = function () {
            $scope.currentDate = moment($scope.date, "DD-MM-YYYY");
            $scope.fillTable();
            $scope.getProjects();
        };

        $scope.setDate = function (date) {
            var dateTemp = date.substr(date.length - 10);
            $scope.date = moment(dateTemp, "DD-MM-YYYY").format("DD-MM-YYYY");
        };

        $scope.getNumberOfWeek = function (date) {
            if (date !== undefined) {
                var dateTemp = date.substr(date.length - 10);
                dateTemp = moment(dateTemp, "DD-MM-YYYY");

                return dateTemp.week();
            } else {
                return false;
            }
        };

        $scope.submitDates = function (dates) {
            $("body").addClass("loading");

            angular.forEach(dates, function (value) {
                var data = {
                    medewerkerid: $scope.employeeId,
                    datum: changeFormat((value.date).substr(3))
                };
                getQueries.addPostHours($scope.connectingString, 'indienenUren', data).then(function (response) {
                    if (response.data.Success) {
                        var message = '<strong> Done!</strong>';
                        Flash.create('success', message, 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        $scope.getProjects();
                        $scope.fillTable();
                    }
                });
            });


            $("body").removeClass("loading");
        };

        $scope.formSubmit = function () {
            var activiteit = $scope.activity ? $scope.activity : 0;
            if ($scope.id) {
                activiteit = $scope.selectedProject['ProjectType'] === 'Direct' ? '' : activiteit;
            } else {
                activiteit = $scope.project['ProjectType'] === 'Direct' ? '' : activiteit;
            }

            var postFunction,
                data = {
                    MedewerkerId: $scope.employeeId,
                    ProjectId: $scope.project ? $scope.project.key : 0,
                    ActiviteitId: activiteit,
                    Datum: moment($scope.date, "DD-MM-YYYY").format("YYYY-MM-DD"),
                    Uren: $scope.hours ? $scope.hours : 0,
                    Opmerking: $scope.note,
                    Week: moment($scope.date, "DD-MM-YYYY").week(),
                    RolId: $scope.roll ? $scope.roll : "",
                    FaseId: $scope.project ? ($scope.project.faseid || "") : "",
                    //FaseId: $scope.fase ? $scope.fase : "",
                };
            if ($scope.id) {
                postFunction = 'putUren';
                data['Id'] = $scope.id;
            } else {
                postFunction = 'postUren';
            }
            $("body").addClass("loading");
            getQueries.addPost($scope.connectingString, postFunction, data).then(function (response) {
                if (response.data.Success) {
                    $scope.error = false;
                    $scope.project = null;
                    $scope.activity = null;
                    $scope.roll = null;
                    $scope.fase = null;
                    $scope.hours = null;
                    $scope.note = '';
                    $scope.success = $scope.id ? 'Uren succesvol gewijzigd' : 'Uren succesvol opgeslagen';
                    $scope.id = null;
                    $scope.getProjects();
                    $scope.fillTable();
                } else {
                    $scope.error = response.data.ErrorMessage;
                }
                $("body").removeClass("loading");
            });
        };

        $scope.showDetails = function (date, day) {
            $("body").addClass("loading");
            var val = day ? changeFormat(date.substr(3)) : date;
            $scope.dateDetails = val;

            getQueries.getQuery($scope.connectingString, "getUrenByEmployeeDate?MedewerkerId=" + $scope.employeeId +
                '&Datum=' + val).then(function (response) {
                var data = response;
                if (data.length > 0) {
                    $scope.cols = $scope.generateColumns(data[0]);
                    $scope.cols = helpers.mapColumns($scope.cols, [
                        'Medewerker',
                        'Project',
                        'Aantal uren',
                        'Status',
                        'Opmerking',
                        'Rol',
                        'Fase'
                    ]);

                    var hasExternal = false;

                    angular.forEach(data, function (valueData) {
                        angular.forEach(valueData, function (value, key) {
                            if (key == 'Aantal uren') {
                                if (value != null) {
                                    // valueData[key] = (value + '').replace('.', ',');
                                    $scope.editDetailsHours[valueData['id']] = parseFloat(valueData[key]);
                                }
                            }

                            if (key === 'Activiteit' && value !== null) {
                                hasExternal = true;
                            }
                        });
                    });

                    $scope.tableParams = new NgTableParams({
                        page: 1, // show first page
                        count: data.length
                    }, {
                        filterDelay: 0,
                        dataset: data,
                        counts: []
                    });
                    // angular.forEach($scope.cols, function (value, key) {
                    //     if (value.title == 'id' || value.title == 'StatusId' || value.title == 'projectid'
                    //         || value.title == 'Rol' || value.title == 'Fase' || (value.title === 'Activiteit' && !hasExternal)) {
                    //         value.show = false;
                    //     }
                    // });
                    if(day) {
                        $('.modalAdditional').show();
                    }
                }
                $("body").removeClass("loading");
            });
        };

        $scope.editRow = function (row) {
            $scope.detailsEdit[row.id] = true;
            $scope.selectItem.id = parseInt(row.id);

            $scope.selectItem.project = _.where($scope.projects, {
                'key': row.projectid,
                'rolid': row.RolId || row.RolId === 0 ? row.RolId : null,
                'faseid': row.FaseId || row.FaseId === 0 ? row.FaseId : null
            })[0];
            $scope.selectItem.projectid = $scope.selectItem.project.key;
            $scope.selectItem.RolId = $scope.selectItem.project.rolid;

            $scope.selectItem.projectHash = getProjectHash($scope.selectItem.project);

            $scope.selectItem.Opmerking = row.Opmerking;
            $scope.selectItem['Aantal uren'] = parseFloat((row['Aantal uren'] + '').replace(',', '.'));

            angular.forEach($scope.activities, function (active) {
                if (active.value == row.Activiteit) {
                    $scope.selectItem.Activiteit = active.key;
                }
            });
        };

        $scope.changeCurrentProjectByHash = function () {
            var projectHash = $scope.selectItem.projectHash;

            $scope.selectItem.project = _.where($scope.projects, {'hash': projectHash})[0];
            $scope.selectItem.projectid = $scope.selectItem.project.key;
            $scope.selectItem.RolId = $scope.selectItem.project.rolid;
        };

        $scope.hideEditDetail = function (row) {
            $scope.detailsEdit[row.id] = false;
        };

        $scope.saveEditDetail = function (row) {
            if ($scope.selectItem['Aantal uren'] > 0) {
                $scope.roll = $scope.selectItem.project.rolid;
                $scope.fase = $scope.selectItem.project.faseid;

                var data = {
                    MedewerkerId: $scope.employeeId,
                    ProjectId: $scope.selectItem.project.key || 0,
                    ActiviteitId: $scope.selectItem.Activiteit || 0,
                    Datum: moment(new Date($scope.dateDetails)).format('YYYY-MM-DD'),
                    Uren: $scope.selectItem['Aantal uren'] || 0,
                    Opmerking: $scope.selectItem.Opmerking,
                    Week: moment($scope.dateDetails).week(),
                    RolId: $scope.roll || "",
                    FaseId: $scope.fase || "",
                    Id: row.id || 0
                };
                $("body").addClass("loading");
                getQueries.addPost($scope.connectingString, 'putUren', data).then(function (response) {
                    if (response.data.Success) {
                        $scope.detailsEdit[row.id] = false;
                        $scope.selectItem = [];
                        $scope.getProjects();
                        $scope.fillTable();
                        $scope.showDetails($scope.dateDetails, false);
                        $('.modalAdditional').hide();
                    } else {
                        $scope.error = response.data.ErrorMessage;
                    }
                    $("body").removeClass("loading");
                });
            } else {
                Flash.create('danger', 'The "Aantal uren" field must be greater than 0', 5000, {class: 'custom-class', id: 'custom-id'}, true);
            }
        };

        $scope.deleteRow = function (id) {
            if (confirm("Weet u zeker dat u dit wilt verwijderen?")) {
                getQueries.getQuery($scope.connectingString, "deleteUren?Id=" + id).then(function (response) {
                    $scope.getProjects();
                    $scope.fillTable();
                    $scope.showDetails($scope.dateDetails, false);
                    $('.modalAdditional').hide();
                });
            }
        };

        $scope.newHour = function () {
            $scope.date = $scope.dateDetails;
            $scope.project = null;
            $scope.activity = null;
            $scope.roll = null;
            $scope.fase = null;
            $scope.hours = null;
            $scope.note = '';
            $scope.id = null;
            $('.modalAdditional').hide();
        };

        $scope.$watch('hours', function (newValue, oldValue) {
            var newValueBuf = newValue;
            newValue = parseFloat(newValue);

            if ($scope.currentUser.restriction === 1) {
                if (!isNaN(newValue) && newValue <= 8) {
                    if (isNaN(newValue) || newValue < 0) {
                        newValue = '';
                    }

                    oldValue = parseFloat(oldValue);
                    if (isNaN(oldValue) || oldValue < 0) {
                        oldValue = '';
                    }

                    if (oldValue !== newValue && newValue !== 0) {
                        var availableHours = $scope.getAvailableHours(
                            $scope.selectedProject,
                            $scope.date,
                            $scope.editDetailsHours[parseInt($scope.selectItem.id)]
                        );
                        if (newValue > availableHours) {
                            $scope.hours = '';

                            Flash.create('danger', 'You have ' + availableHours + ' available hours', 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        }
                    }
                } else {
                    $scope.hours = newValueBuf;
                }
            } else {
                if (isNaN(newValue) || newValue < 0) {
                    $scope.hours = '';
                }
            }
        });

        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }

        $scope.$watch("selectItem['Aantal uren']", function (newValue, oldValue) {
            var newValueBuf = newValue;
            newValue = parseFloat(newValue);

            if ($scope.currentUser.restriction === 1) {
                if (!isNaN(newValue) && newValue <= 8) {
                    var date = moment($scope.dateDetails, "YYYY-MM-DD").format('DD-MM-YYYY');

                    if (isNaN(newValue) || newValue < 0) {
                        newValue = '';
                    }

                    oldValue = parseFloat(oldValue);
                    if (isNaN(oldValue) || oldValue < 0) {
                        oldValue = '';
                    }

                    if (oldValue !== newValue && newValue !== 0) {
                        var availableHours = $scope.getAvailableHours(
                            $scope.selectItem.project,
                            date,
                            $scope.editDetailsHours[parseInt($scope.selectItem.id)]
                        );
                        if (newValue > availableHours) {
                            $scope.selectItem['Aantal uren'] = '';
                            Flash.create('danger', 'You have ' + availableHours + ' available hours', 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        }
                    }
                } else {
                    $scope.selectItem['Aantal uren'] = newValueBuf;
                }
            } else {
                if (isNaN(newValue) || newValue < 0) {
                    $scope.hours = '';
                }
            }
        });

        $scope.getAvailableHours = function (project, cDate, correctHours) {
            var key = getNumber(project['key']);
            var rolid = getNumber(project['rolid']);
            var faseid = getNumber(project['faseid']);

            if ($scope.avilableHoursPerWeek > 0 && key > 0) {
                var cFormattedDate = moment(cDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                var cWeek = this.datesByWeeks[cFormattedDate];
                var availableHoursByDaySum = 8;
                var availableHours = 0;
                var availableFinal = 0;

                var alreadyUsedHoursByDay = $scope.alreadyUsedHoursByDay[cFormattedDate];
                if (isNaN(alreadyUsedHoursByDay)) {
                    alreadyUsedHoursByDay = 0;
                } else {
                    if (correctHours !== undefined) {
                        alreadyUsedHoursByDay -= correctHours;
                    }
                }

                var alreadyUsedHoursByWeek = $scope.alreadyUsedHoursByWeek[cWeek];
                if (isNaN(alreadyUsedHoursByWeek)) {
                    alreadyUsedHoursByWeek = 0;
                } else {
                    if (correctHours !== undefined) {
                        alreadyUsedHoursByWeek -= correctHours;
                    }
                }

                var availableHoursForCurrentProject = getNumber($scope.availableHoursForProject[getProjectHash(project)]);

                if (correctHours !== undefined) {
                    availableHoursForCurrentProject += correctHours;
                }

                availableHours = $scope.avilableHoursPerWeek - alreadyUsedHoursByWeek;
                if (availableHours <= 0) {
                    Flash.create('danger', 'You have already spent ' + $scope.avilableHoursPerWeek + ' hours this week', 5000, {class: 'custom-class', id: 'custom-id'}, true);
                    availableHours = 0;
                } else {
                    var availableProjectHours = availableHoursForCurrentProject; //getProjectsByHoursEmployee already returns only available hours, used hours doesn't matter.
                    if (availableProjectHours <= 0) {
                        Flash.create('danger', 'You have already spent ' + availableHoursForCurrentProject + ' hours this project', 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        availableHours = 0;
                    } else {
                        var availableHoursByDay = availableHoursByDaySum - alreadyUsedHoursByDay;
                        if (availableHoursByDay <= 0) {
                            Flash.create('danger', 'You have already spent ' + availableHoursByDaySum + ' hours this day', 5000, {class: 'custom-class', id: 'custom-id'}, true);
                        } else {
                            availableFinal = Math.min(availableHours, availableProjectHours, availableHoursByDay);
                            if (availableFinal > availableHoursByDay) {
                                availableFinal = availableHoursByDay;
                            }
                        }
                    }
                }

                // console.log({
                //     'key': key,
                //     'rolid': rolid,
                //     'faseid': faseid,
                //     'project': project,
                //     availableFinal: availableFinal,
                //     avilableHoursPerWeek: $scope.avilableHoursPerWeek,
                //     alreadyUsedHoursByWeek: alreadyUsedHoursByWeek,
                //     availableHoursForCurrentProject: availableHoursForCurrentProject,
                //     '$scope.availableHoursForProject': $scope.availableHoursForProject,
                //     '$scope.availableHoursForCurrentProject': $scope.availableHoursForCurrentProject,
                //     '$scope.alreadyUsedHoursByWeek': $scope.alreadyUsedHoursByWeek,
                //     cFormattedDate: cFormattedDate,
                //     cWeek: cWeek,
                //     'getProjectHash(project)': getProjectHash(project)
                // });

                return round(availableFinal, 1);
            } else {
                return 0;
            }

        };

        $scope.$watch('project', function (newValue, oldValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.hours = 0;

                getQueries.getQuery($scope.connectingString, "getRollenUren?medewerkerid=" + $scope.userInfo.userName +
                    '&projectid=' + newValue.key).then(function (response) {
                    $scope.rolls = response;
                });
                getQueries.getQuery($scope.connectingString, "getFasesUren?medewerkerid=" + $scope.employeeId +
                    '&projectid=' + newValue.key).then(function (response) {
                    $scope.fases = response;
                });

                var project = _.where($scope.projects, {
                    'key': newValue.key,
                    'rolid': newValue.rolid,
                    'faseid': newValue.faseid
                })[0];

                $scope.projectId = project.key;
                $scope.selectedProject = project;
                $scope.availableHoursForCurrentProject = parseFloat(project.maxHoursProject);
                $scope.roll = project.rolid;
                $scope.fase = project.faseid;

                // console.log({
                //     'key': newValue.key,
                //     'rolid': newValue.rolid,
                //     'faseid': newValue.faseid,
                //     project: project,
                //     '$scope.availableHoursForCurrentProject': $scope.availableHoursForCurrentProject
                // });
            }
        });

        $scope.setColor = function () {
            $('.chosen-results').find('li').each(function () {
                var li = $(this),
                    index = li.index();
                li.addClass($scope.projects[index].color + 'Focus');
                if ($scope.projects[index].color == 'red') {
                    $('.chosen-projects option:eq(' + (index + 1) + ')').prop('disabled', true);
                }
            });
            // $('.chosen-projects option').trigger("chosen:updated");
            $('.chosen-results').find('li').each(function () {
                $(this).addClass($scope.projects[$(this).index()].color + 'Focus');
            });
        };


        function changeMonth(date) {
            var array = date.split('-');
            return array[1] + '-' + array[0] + '-' + array[2];
        }

        function changeFormat(date) {
            var array = date.split('-');
            return array[2] + '-' + array[1] + '-' + array[0];
        }

        $scope.init();
    }

    HoursController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "Flash", "NgTableParams", "$routeParams", "$timeout", "$mdDateLocale", "$filter", "helpers"];

    return HoursController;
});