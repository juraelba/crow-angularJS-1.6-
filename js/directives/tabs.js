define(['moment'], function (moment) {

    function tabs() {
        return {
            restrict: 'E',
            scope: {
                tabs: '=tab',
                model: '=fase',
                someCtrlFn: '&callbackFn',
                keyActive: '=key',
                nameId: '=name',
                updateCtrlFn: '&updateFn',
                yearCtrlFn: '&yearFn',
                query: '&',
                formActive: '&',
                removeCtrlFn: '&removeFn',
                editForm: '=editform',
                editIconfase: '=editIconfase',
                financieringoverzicht: '=financiering',
                typeproject: '=type',
                textColor: '=color',
                projectCheckboxes: '=checkboxes'
            },
            controller: function ($scope, $element, $attrs, $location, $routeParams, $rootScope, helpers, getQueries, $ngBootbox) {
                var visibleTab = _.where($scope.tabs, {'hideTab': false})[0];

                if (visibleTab) {
                    $scope.childKey = $scope.tabs.indexOf(visibleTab);
                } else {
                    $scope.childKey = $rootScope.childKey;
                }

                $scope.getFasesDropdown = [];
                $scope.faseUnvisible = [6, 7, 8, 9, 10, 11, 13, 14];
                $scope.rowCollapeFlag = false;
                $scope.pullRight = [
                    'Bedrag',
                    'Percentage',
                    'Aantal uren',
                    'Kostprijs tarief',
                    'Kosten',
                    'Tarief',
                    'Opbrengst',
                    'Marge',
                    'Aantal',
                    'Opbrengsten',
                    'Resultaat',
                    'Begroot',
                    'Nog niet toegezegd',
                    'Nog te factureren',
                    'Nog te betalen',
                    'Mee te nemen',
                    'Mutaties',
                    'Toegezegd',
                    'Geschreven uren'
                ];
                $scope.collapseIconFlag = false;
                $scope.begrotingKstPopups = {
                    'lower': {
                        'question': 'Wat wilt u met deze uren doen?',
                        'options': [
                            {'key': -1, 'value': ''},
                            {'key': 0, 'value': 'Verwijderen'},
                            {'key': 1, 'value': 'Kopieren naar andere fase'},
                            {'key': 2, 'value': 'Kopieren naar andere functie / medewerker in deze fase'}
                        ],
                        'id': 0,
                        'key': 'Verwijderen'
                    },
                    'higher': {
                        'question': 'Wat wilt u met deze uren doen?',
                        'options': [
                            {'key': 4, 'value': 'Weghalen bij een andere functie/medewerker in deze fase'},
                            {'key': 5, 'value': 'Weghalen bij een andere functie/medewerker in een andere fase'},
                        ],
                        'id': 0,
                        'key': 'Weghalen bij een andere functie/medewerker in deze fase'
                    }
                };

                $scope.oldAantal = 0;
                $scope.currentPopup = $scope.begrotingKstPopups['lower'];
               
                $scope.filteredFuncties = function (tab) {
                    return tab.functies.filter(function (value) {
                        var data = {
                            'functiekey': value['key'],
                            'medewerkerkey': $scope.formActive['medewerker']
                        };
                        return _.where($rootScope.getOrganisatie, data)[0] === undefined;
                    })
                };

                $scope.filteredMedewerkers = function (tab) {
                    return tab.medewerkers.filter(function (value) {
                        var data = {
                            'functiekey': $scope.formActive['functie'],
                            'medewerkerkey': value['key']
                        };

                        return _.where($rootScope.getOrganisatie, data)[0] === undefined;
                    })
                };

                $scope.setTabActive = function (key) {
                    if ($scope.nameId == 'child') {
                        $rootScope.childKey = key;
                        $scope.childKey = key;
                        $scope.setActive = false;
                    }
                    $scope.keyActive = key;
                    $('table tbody tr:first-child td.plusRow').each(function () {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('plusRow');
                    });
                    $('table tbody tr:first-child td.editRow:first-child').each(function () {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('editRow');
                    });
                    $('table tbody tr:first-child td.pullRight').each(function () {
                        var td = $(this),
                            index = td.index();
                        td.closest('table').find('thead tr th:eq(' + index + ')').addClass('pullRight');
                    });
                    $('table tbody tr:first-child td.removeRow').each(function () {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('removeRow');
                    });
                };

                $scope.getTabColor = function (tab) {
                    var color = '';

                    if (tab.Id === 5) {
                        //tab "Begroting financiering"
                        color = $rootScope.saldoFinancieringColor;
                    } else if (tab.Id === 121) {
                        //tab "Organsiatie"
                        color = $rootScope.financieringColor;
                    }

                    return color;
                };

                $scope.financieringEditRule = function (tab) {
                    var isFinancieringFase = tab.newModel['financiering'] === 'fase';
                    var isFaseSelected = !!helpers.getNumber(tab.fase);

                    return (isFinancieringFase && isFaseSelected) || !isFinancieringFase;
                };

                $scope.editEnabledForTab = function (tab) {
                    //@TODO return for enable editing when status "Goedgekeurd"
                    //available tabs to edit
                    // var tabsAvailableToEditForTheGoedgekeurdHighestVersion = [
                    //     121, // Organisatie
                    //     3,   // Begroting kst
                    //     10   // Begroting kst -> Uren
                    // ];
                    // var tabsRule = tabsAvailableToEditForTheGoedgekeurdHighestVersion.indexOf(parseInt(tab.Id)) !== -1;
                    // return $scope.editForm || (tabsRule && $rootScope.goedgekeurdHighestVersion());

                    return $rootScope.userCanEditProject();
                };

                $scope.isProjectControl = function () {
                    return $rootScope.isProjectControl;
                };

                $scope.editButtonShowConclusion = function (tab, row, param) {
                    if(tab.Id === 1 && $scope.editIconfase) return true;
                    var availableTabsToEdit = [
                        121, // Organisatie
                        1,   // Fases
                        7,   // Begroting opbr. -> Uren
                        8,   // Begroting opbr. -> OOP
                        9,
                        10,  // Begroting kst -> Uren
                        11   // Begroting kst -> OOP
                    ];
                    var tabHasPutFunction = tab.FunctiePut !== '';

                    var faseRuleForTab = function (tab) {
                        var tabId = parseInt(tab['Id']);
                        var faseIsset = !!tab.fase;
                        var tabsWhichNeedAFaseToEdit = [
                            10, // Begroting kst -> Uren
                            11  // Begroting kst -> OOP
                        ];

                        return tabsWhichNeedAFaseToEdit.indexOf(tabId) !== -1 ? faseIsset : true;
                    };

                    var tabAvailableToEdit = function (tab) {
                        return availableTabsToEdit.indexOf(tab['Id']) !== -1;
                    };

                    var specialConclusionForTab = function (tab, row) {
                        var result = true;
                        var tabId = parseInt(tab['Id']);

                        switch (tabId) {
                            case 121: {
                                result = helpers.getNumber(row['Geschreven uren']) === 0;
                            }
                        }

                        return result;
                    };

                    if (param === 1) {
                        console.log(
                            {
                                'editForm': $scope.editForm,
                                'tab["Id"]': tab["Id"],
                                'tabHasPutFunction': tabHasPutFunction,
                                'faseRuleForTab(tab)': faseRuleForTab(tab),
                                'tabAvailableToEdit(tab)': tabAvailableToEdit(tab),
                                'specialConclusionForTab(tab, row)': specialConclusionForTab(tab, row),
                                '$scope.editEnabledForTab(tab)': $scope.editEnabledForTab(tab)
                            }
                        );
                    }

                    return tabHasPutFunction && faseRuleForTab(tab) && $scope.editEnabledForTab(tab) && tabAvailableToEdit(tab) && specialConclusionForTab(tab, row);

                    // return ((tab.FunctiePut !== '' && !$scope.specialEditRuleFunc(tab) && enabledTabsToEdit.indexOf(tab.Id) < 0) ||
                    //     ((enabledTabsToEdit.indexOf(tab.Id) >= 0) && tab.fase) && tab.FunctiePut !== '')
                    //     && tab.Id !== 12;

                };

                $scope.showAdditional = function (id, query, row) {
                   
                    $scope.oldAantal = helpers.getNumber(row['Aantal uren']);

                    if (query) {
                        angular.forEach(row, function (value, key) {
                            if (key === 'Leverancier') {
                                var leverancier = _.where($rootScope.leveranciers, {value: value})[0];
                                row['leverancier'] = leverancier !== undefined ? leverancier.key : 0;
                            }

                            if (query === 'putFaseDetails' && key === 'ID') {
                                row['faseid'] = Number(value);
                            }

                            if (key == 'Planning_opleveren') {
                                if (value != null) {
                                    row['PlanningEind'] = row['Planning_opleveren'];
                                    // row['PlanningEind'] = moment(value, ["DD-MM-YYYY", "DD-MM-YYYY"]);
                                    delete row[key];
                                }
                            }
                            if (key == 'Planning_starten') {
                                if (value != null) {
                                    row['PlanningStart'] = row['Planning_starten'];
                                    // row['PlanningStart'] = moment(value, ["DD-MM-YYYY", "DD-MM-YYYY"]);
                                    delete row[key];
                                }
                            }
                            if (key == 'Minimaal opleverniveau') {
                                row['Resultaat'] = value;
                                delete row[key];
                            }
                            if (key == 'Naam fase') {
                                row['Naam'] = value;
                                delete row[key];
                            }
                            if (key == 'Resultaat_') {
                                row['Doel'] = value;
                                delete row[key];
                            }
                        });
                        $scope.query = query;
                        $scope.formActive = row;
                        if(id == 5){
                            $scope.formActive['tefactureren']=$scope.formActive['Nog te factureren'];
                            $scope.formActive['tebetalen']=$scope.formActive['Nog te betalen'];
                            $scope.formActive['meetenemen']=$scope.formActive['Mee te nemen'];
                            $scope.formActive['mutaties']=$scope.formActive['Mutaties'];
                            $scope.formActive['not_ities']=$scope.formActive['notities'];
                            $scope.formActive['batigsaldo']=$scope.formActive['Batig Saldo'];
                        }

                        if (id === 11 && (Object.getOwnPropertyNames(row).length === 0 || row['Leverancier'] === null)) {
                            $scope.formActive['leverancier'] = $rootScope.leveranciers[0].key;
                        }

                        if (id != 12) {
                            $('.modalForm' + id).show();
                        }

                        if (query == 'postFaseDetails') {
                            $scope.formActive = {
                                Educatie: $scope.projectCheckboxes[0] ? 'Ja' : 'Nee',
                                Kennisverspreiding: $scope.projectCheckboxes[1] ? 'Ja' : 'Nee'
                            };
                        }

                        if (query == 'postOrganisatie' || query == 'putOrganisatie') {
                            angular.forEach($scope.tabs, function (value, key) {
                                if (value.Id == id) {
                                    angular.forEach(value.functies, function (valFun) {
                                        if (row.Rol == valFun.value) {
                                            row.Rol = valFun.key;
                                        }
                                    });
                                    angular.forEach(value.medewerkers, function (valFun) {
                                        if (row.Medewerker == valFun.value) {
                                            row.Medewerker = valFun.key;
                                        }
                                    });
                                }
                            });
                            $scope.formActive = {
                                id: row.id,
                                functie: row.Rol,
                                medewerker: row.Medewerker,
                                taken: row['Taken, bevoegdheden en verantwoordelijkheden']
                            };
                        }

                        if (query == 'postFinanciering' || query == 'postFinancieringVersie') {
                            // console.log('5555555',$scope.formActive);
                            
                            $scope.formActive['Financiering'] = 'extern';
                            $scope.extern = true;
                            $scope.showFinanceForm();
                            $scope.typeFinance();
                        }

                        if (query == 'putFinanciering' || query == 'putFinancieringVersie') {
                            if ($scope.formActive['Financiering'] == 'extern') {
                                $scope.extern = true;
                                $scope.intern = false;
                            } else {
                                $scope.extern = false;
                                $scope.intern = true;
                            }
                            $scope.otherFields = true;
                            $scope.typeFinance();
                            if ($scope.formActive['Financiering'] == 'extern') {
                                if ($scope.formActive['Type'] == 'deelcollectieven') {
                                    angular.forEach($scope.tabs, function (value, key) {
                                        if (value.Id == id) {
                                            angular.forEach(value.deelcollectieven, function (valMed) {
                                                if ($scope.formActive['FinancierId'] == valMed.key) {
                                                    $scope.formActive['Financierder'] = valMed.key;
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    angular.forEach($scope.tabs, function (value, key) {
                                        if (value.Id == id) {
                                            angular.forEach(value.financiers, function (valMed) {
                                                if ($scope.formActive['FinancierId'] == valMed.key) {
                                                    $scope.formActive['Financierder'] = valMed.key;
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                angular.forEach($scope.tabs, function (value, key) {
                                    if (value.Id == id) {
                                        angular.forEach(value.internfinanciers, function (valMed) {
                                            if ($scope.formActive['FinancierId'] == valMed.key) {
                                                $scope.formActive['Financierder'] = valMed.key;
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                };

                $scope.checkNewKostenValue = function (newSum, upLimit, downLimit) {
                    return newSum <= upLimit && newSum >= downLimit;
                };

                $scope.beforeFormStart = function (tab) {
                    // if ($rootScope.goedgekeurdHighestVersion()) {
                    //     var oldSum = 0;
                    //     _.each(tab.construction.grid.table.data, function (value) {
                    //         oldSum += helpers.getNumber($scope.toNumber(value['Kosten']));
                    //     });

                    var newAantal = helpers.getNumber($scope.formActive['Aantal uren']);
                    var geschrevenUren = helpers.getNumber($scope.formActive['Geschreven uren']);
                    var tarif = helpers.getNumber($scope.toNumber($scope.formActive['Kostprijs tarief']));
                    // var newSum = oldSum - ($scope.oldAantal * tarif) + (newAantal * tarif);
                    //
                    // var downLimit = $rootScope.getKostenGoedgekeurd - $rootScope.getAfwijkingBudgetNeutraal;
                    // var upLimit = $rootScope.getKostenGoedgekeurd + $rootScope.getAfwijkingBudgetNeutraal;

                    // if ($scope.checkNewKostenValue(newSum, upLimit, downLimit)){

                    if (newAantal < geschrevenUren) {
                        $scope.formActive['Aantal uren'] = $scope.oldAantal;
                        alert('"Aantal" is lower than "Geschreven uren"');
                    } else {
                        $scope.formStart(tab['Id']);
                    }

                    // else {
                    //     if (newAantal > $scope.oldAantal) {
                    //         $scope.currentPopup = $scope.begrotingKstPopups['higher'];
                    //     } else {
                    //         $scope.currentPopup = $scope.begrotingKstPopups['lower'];
                    //     }
                    //
                    //     if (newAantal !== $scope.oldAantal) {
                    //         $scope.currentPopup['id'] = tab.Id;
                    //         $scope.currentPopup['key'] = $scope.currentPopup['options'][0]['key'];
                    //         $scope.currentPopup['fase'] = tab.fase;
                    //         $scope.showFase = false;
                    //         $('.begrotingKstPopup').show();
                    //     }
                    // }
                    // } else {
                    //     $scope.formActive['Aantal uren'] = $scope.oldAantal;
                    //
                    //     alert(
                    //         'De totale kosten in een budget neutrale wijziging mogen voor dit project niet hoger worden  dan € '
                    //         + upLimit.toLocaleString('nl-NL')
                    //         + ' en niet lager dan € '
                    //         + downLimit.toLocaleString('nl-NL')
                    //     );
                    // }
                    // }
                };

                $scope.questionChange = function (tab) {
                    switch ($scope.currentPopup.key) {
                        case 0:
                            $scope.formActive.verwijderenUren = true;
                            $('.begrotingKstPopup').hide();
                            break;
                        case 1:
                            console.log();

                            getQueries.getQuery(tab.connectingString, "getFasesDropdown?versieid=" + tab.versionId)
                                .then(function (response) {
                                    $scope.getFasesDropdown = response;
                                });
                            break;
                        case 2:
                            $scope.getOrganisatieDropdown(tab);
                            break;
                        case 3:

                            break;
                        case 4:

                            break;
                        default:
                    }
                };

                $scope.getOrganisatieDropdown = function (tab) {
                    getQueries.getQuery(tab.connectingString, "getOrganisatieDropdown?faseid=" + $scope.currentPopup.fase).then(function (response) {
                        $scope.organisatieDropdown = response;
                        $scope.showFase = true;
                    });
                };

                $scope.preFormStart = function (id, tab) {
                    // if ($rootScope.goedgekeurdHighestVersion()) {
                    //     getQueries
                    //         .addPost(tab.connectingString, 'verwijderenUren', {
                    //             aantal: helpers.getNumber($scope.formActive['Aantal uren']),
                    //             id: $scope.formActive.Id
                    //         })
                    //         .then(function (response) {
                    //             getQueries.addPost(tab.connectingString, 'verwijderenUren', {
                    //                 aantal: helpers.getNumber($scope.oldAantal) - helpers.getNumber($scope.formActive['Aantal uren']),
                    //                 id: $scope.currentPopup.organisatie
                    //             })
                    //                 .then(function (response) {
                    //                     $scope.formStart(id);
                    //                 });
                    //         });
                    // } else {
                    $scope.formStart(id);
                    // }
                };

                $scope.formStart = function (id) {
                    angular.forEach($scope.tabs, function (value, key) {
                        if (value.Id == id) {
                            $rootScope.formActive = $scope.formActive;
                            $rootScope.query = $scope.query;
                            /*updateCtrlFn == PageController/updateAdditional()*/
                            $scope.updateCtrlFn({form: $scope.formActive, query: $scope.query});
                        }
                    });
                };

                $scope.saveBatch = function (data, tab) {
                    angular.forEach(data, function (item) {
                        if (item.id || item.Id) {
                            if (tab.FunctiePut) {
                                if (item['Leverancier']) {
                                    item['leverancier'] = replaceKeyAndValue($rootScope.leveranciers, item, 'Leverancier');
                                }
                                if (item['Inkoop']) {
                                    item['inkoop'] = replaceKeyAndValue(tab.inkoops, item, 'Inkoop');
                                }
                                $rootScope.formActive = item;
                                $rootScope.query = tab.FunctiePut;
                                $scope.updateCtrlFn({form: item, query: tab.FunctiePut});
                            }
                        } else {
                            if (tab.FunctiePost) {
                                if (item['Leverancier']) {
                                    item['leverancier'] = replaceKeyAndValue($rootScope.leveranciers, item, 'Leverancier');
                                }
                                if (item['Inkoop']) {
                                    item['inkoop'] = replaceKeyAndValue(tab.inkoops, item, 'Inkoop');
                                }
                                $rootScope.formActive = item;
                                $rootScope.query = tab.FunctiePost;
                                $scope.updateCtrlFn({form: item, query: tab.FunctiePost});
                            }
                        }
                    });
                };

                function replaceKeyAndValue(data, item, search) {
                    var result = '';
                    angular.forEach(data, function (option) {
                        if (item[search] === option.value) {
                            result = option.key;
                        }
                    });
                    return result;
                }

                $scope.total = function () {
                    if ($scope.formActive['Kostprijs tarief'] !== undefined) {
                        var foo = parseInt($scope.toNumber($scope.formActive['Kostprijs tarief'])) * parseInt($scope.formActive['Aantal uren']);
                        if (isNaN(foo)) {
                            return 0;
                        }
                        return '€ ' + parseInt(foo).toLocaleString('nl-NL');
                    }
                    return 0;
                };

                $scope.total_obrengst = function () {
                    var foo = parseInt($scope.toNumber($scope.formActive['Tarief'])) * parseInt($scope.formActive['Aantal uren']);
                    if (isNaN(foo)) {
                        return 0;
                    }
                    return '€ ' + parseInt(foo).toLocaleString('nl-NL');
                };

                $scope.total_marge = function () {

                    var foo = parseInt(parseInt($scope.toNumber($scope.formActive['Kosten '])) +
                        (parseFloat($scope.toNumber($scope.formActive['Marge '])) *
                            parseInt($scope.toNumber($scope.formActive['Kosten '])) / 100));
                    if (isNaN(foo)) {
                        return 0;
                    }
                    return '€ ' + parseInt(foo).toLocaleString('nl-NL');
                };

                $scope.total_kennis = function () {
                    var foo = parseInt($scope.formActive['Aantal']) * parseInt($scope.toNumber($scope.formActive['Tarief']));
                    if (isNaN(foo)) {
                        return 0;
                    }
                    return '€ ' + parseInt(foo).toLocaleString('nl-NL');
                };

                $scope.showFinanceForm = function () {
                    if ($scope.formActive['Financiering'] == 'extern') {
                        $scope.extern = true;
                        $scope.intern = false;
                    } else {
                        $scope.extern = false;
                        $scope.intern = true;
                    }
                    $scope.otherFields = false;
                };

                $scope.typeFinance = function () {
                    if ($scope.formActive['Type'] == 'deelcollectieven') {
                        $scope.deelcollectieven = true;
                        $scope.individueel = false;
                    } else {
                        if ($scope.formActive['Type'] == 'individueel') {
                            $scope.individueel = true;
                            $scope.deelcollectieven = false;
                        } else {
                            $scope.individueel = false;
                            $scope.deelcollectieven = false;
                        }
                    }
                };

                $scope.checkAmount = function (field, value) {
                    // if (field == 'Nog niet toegezegd' && $scope.toNumber(value) > 0) {
                    //     return true;
                    // }
                    if($scope.toNumber(value) < 0){
                        return true;
                    }
                    return false;
                }

                $scope.changeToCurrency = function (val) {
                    var numb = $scope.toNumber($scope.formActive[val]);
                    let value = '';
                    if ($scope.intern) {
                        // $scope.formActive[val] = '€ ' + parseInt(isNaN(numb) ? 0 : numb).toLocaleString('nl-NL');
                        value = numb == "€" ? '': numb.toLocaleString('nl-NL');
                        $scope.formActive[val] = '€ ' + value;
                    } else {
                        if (val == 'Toegezegd' && (parseFloat($scope.toNumber($scope.formActive['Toegezegd'])) >
                        parseFloat($scope.toNumber($scope.formActive['Begroot'])))) {
                            // $scope.formActive[val] = '€ ' + parseFloat(isNaN($scope.toNumber($scope.formActive['Begroot'])) ? 0 : $scope.parseFloat($scope.formActive['Begroot'])).toLocaleString('nl-NL');
                            value = $scope.toNumber($scope.formActive['Begroot']) == "€" ? '' : $scope.toNumber($scope.formActive['Begroot']).toLocaleString('nl-NL')
                            $scope.formActive[val] = '€ ' + value;
                        } else {
                            // $scope.formActive[val] = '€ ' + parseInt(isNaN(numb) ? 0 : numb);
                            value = numb == "€" ? '': numb.toLocaleString('nl-NL');
                            $scope.formActive[val] = '€ ' + value;
                        }
                    }
                };

                $scope.total_finance = function () {

                    var Begroot = $scope.formActive['Begroot'] ? $scope.formActive['Begroot'] : '',
                        Toegezegd = $scope.formActive['Toegezegd'] ? $scope.formActive['Toegezegd'] : '';
                    var foo = parseInt(parseInt($scope.toNumber(Begroot))
                        - parseInt($scope.toNumber(Toegezegd)));
                    if (isNaN(foo)) {
                        return 0;
                    }
                    return '€ ' + parseInt(foo).toLocaleString('nl-NL');
                };

                $scope.showUnderMaster = function (id, row) {
                    angular.forEach($scope.tabs, function (value, key) {
                        if (value.Id == id) {
                            angular.forEach(value.construction.grid.table.data, function (valueTable) {
                                if (valueTable.above) {
                                    if (row.Omschrijving == valueTable.above) {
                                        valueTable.visible = valueTable.visible ? 0 : 1;
                                    }
                                }
                            });
                        }
                    });
                };

                $scope.substr = function (string) {
                    return typeof string == 'string' ? (string.length > 20 ? string.substr(0, 20) + '...' : string) : string;
                };

                $scope.showFaseDetails = function (id, row) {
                    angular.forEach($scope.tabs, function (value, key) {
                        if (value.Id == id) {
                            angular.forEach(value.construction.grid.table.data, function (valueTable) {
                                if (row.ID == valueTable.ID) {
                                    valueTable.visible = valueTable.visible ? 0 : 1;
                                }
                            });
                        }
                    });
                };

                $scope.removeItem = function (id, tabId) {
                    $scope.removeCtrlFn({id: id, tabId: tabId});
                };

                $scope.collapse = function (id, tabId) {
                    if($scope.rowCollapeFlag){
                        $scope.rowCollapeFlag = false;
                    }else{
                        $scope.rowCollapeFlag = true;
                    }
                };

                // $scope.showCollapse = function () {
                //     if(!$scope.collapseIconFlag){
                //         // $scope.collapseIconFlag = true;
                //         return true;
                //     }else{
                //         return false;
                //     }
                // }

                $scope.showOtherFields = function () {
                    $scope.otherFields = true;
                };

                $scope.toNumber = function (value) {
                    return (value + '').replace('€ ', '').replace(' %', '').replace('.', '').replace(',', '.');
                };

                $scope.checkDate = function (field) {
                    if (field === 'PlanningStart') {
                        $scope.formActive['Boekjaar'] = moment($scope.formActive['PlanningStart'], 'DD-MM-YYYY').format('YYYY');
                    }
                    if (field === 'PlanningEind') {
                        if (moment($scope.formActive['PlanningStart'], 'DD-MM-YYYY').format('YYYY') !== moment($scope.formActive['PlanningEind'], 'DD-MM-YYYY').format('YYYY')) {
                            $ngBootbox.alert('Start- en einddatum moeten binnen 1 kalender vallen. Indien een fase in de praktijk langer duurt/over de jaargrens gaat, moet deze in PID opgeknipt worden in meerdere fases.');
                        }
                        $scope.formActive[field] = moment($scope.formActive['PlanningEind'], 'DD-MM-YYYY').format('DD') + '-' + moment($scope.formActive['PlanningEind'], 'DD-MM-YYYY').format('MM') + '-' + moment($scope.formActive['PlanningStart'], 'DD-MM-YYYY').format('YYYY');
                    }
                };

                $scope.year = {};
                $scope.year['selected'] = $rootScope.year || moment().format('YYYY');
                $scope.faseValue = {};
                $scope.fases=[];
                $scope.faseValue['selected'] = "total";
                $scope.changeYear = function () {
                    getQueries.getQuery($rootScope.connectingString, "getFases?versieid=" + $rootScope.versionId+ '&year=' + $scope.year['selected']).then(function (response) {
                        $scope.fases.push(response);
                        $scope.faseValue['selected'] = "total";
                        $scope.fases.push({'key': 'total', 'value': 'Project totaal'});
                    });
                    $scope.yearCtrlFn({year: $scope.year['selected']});
                    
                };
                $scope.changeFase = function () {
                    // if (type == 'Fase') {
                        // $scope.faseName = _.find($scope.fases, function(value){ return value.key === $scope.faseValue; });
                        
                        $scope.someCtrlFn({fase: $scope.faseValue['selected']});
                    // }
                };
                // $scope.changeFase();
                $scope.getDocfile = function (fileId) {
                    getQueries.getDownlaodFile(fileId).then(function (response) {
                      
                    });
                };
                $scope.getNotities = function (notitiData, id) {
                    let notiData = ''
                    if(notitiData){
                        if(notitiData.length>20){
                            notiData =  notitiData.substring(0, 20)+'...'
                        }else{
                            notiData = notitiData;
                        }
                    }
                    return notiData;
                }

                $scope.$watch(function() {
                    return $rootScope.fases;
                }, function() {
                    $scope.fases = $rootScope.fases;
                }, true);

                $scope.$watch(function() {
                    return $rootScope.deleteIconfase;
                }, function() {
                    $scope.deleteIconfase = $rootScope.deleteIconfase;
                }, true);

                $scope.$watch(function() {
                    return $rootScope.childKey;
                }, function() {
                    $scope.childKey = $rootScope.childKey;
                }, true);

                $scope.setActive = true;
                $scope.getActive = function(tabs, current) {
                    var countActive = 0, result = false;
                    if($scope.setActive) {
                        $scope.checkActive = false;
                        angular.forEach(tabs, function (value, key) {
                            if (!result && !value.hideTab && !countActive) {
                                countActive += 1;
                                if ((key === current && $rootScope.childKey === key) || (key === current && countActive === 1)) {
                                    result = true;
                                }
                            }
                        });
                        return result;
                    } else {
                        angular.forEach(tabs, function (value, key) {
                            if (key === current && $rootScope.childKey === key) {
                                result = true;
                            }
                        });
                        return result;
                    }
                };

                // $scope.changeYear();

                $scope.years = [
                    {
                        key: 0,
                        value: 'Alle',
                    },
                    {
                        key: moment().add(-2, 'years').format('YYYY'),
                        value: moment().add(-2, 'years').format('YYYY'),
                    },
                    {
                        key: moment().add(-1, 'years').format('YYYY'),
                        value: moment().add(-1, 'years').format('YYYY'),
                    },
                    {
                        key: moment().format('YYYY'),
                        value: moment().format('YYYY'),
                    }
                ];
                var i;
                for (i = 1; i < 7; i++) {
                    $scope.years.push({
                        key: moment().add(i, 'years').format('YYYY'),
                        value: moment().add(i, 'years').format('YYYY'),
                    });
                }

            },
            templateUrl: 'templates/tabs.html'
        };
    }

    tabs.$inject = [];

    return tabs;
});