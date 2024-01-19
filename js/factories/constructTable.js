define([], function () {

    function constructTable(NgTableParams, getQueries, $rootScope, helpers) {

        var colsMapping = {
            'getFaseDetails': [
                'Fasecode',
                'Boekjaar',
                'Naam fase',
                'Educatie',
                'Planning_starten',
                'Planning_opleveren',
                'Kennisverspreiding',
                'Minimaal opleverniveau',
                'Draagvlak',
                'Kwaliteit',
                'Resultaat_'
            ]
            ,
            'getKostenUren':[
                'Omschrijving',
                'Medewerker',
                'Aantal uren',
                'Kostprijs tarief',
                'Kosten',
                'Geschreven uren'
            ],
            'getOrganisatie' :[
                'Rol',
                'Medewerker',
                'Taken, bevoegdheden en verantwoordelijkheden',
                'Geschreven uren'
            ],
            'getFinancieringVersie' :[
                'Financiering',
                'Type',
                'Debiteurnummer',
                'Financierder',
                'Begroot',
                'Toegezegd',
                'Nog niet toegezegd',
                'Mutaties',
                'Totale Financiering',
                'Nog te factureren',
                'Nog te betalen',
                // 'Batig Saldo',
                'Mee te nemen',
                'notities',
                'Boekjaar'
            ]
        };

        var mapSpecialCols = function (requestName, cols) {
            if (colsMapping[requestName] !== undefined) {
                cols = helpers.mapColumns(cols, colsMapping[requestName]);
            }
            return cols;
        };

        var showRow = function (row) {
            var rightsRule = $rootScope.isAdmin || _.where($rootScope.projectRights, {id: row.projectid})[0] !== undefined || $rootScope.rootUser.roleName === 'Directie';
            var rolesRule = row['Indirect'] === true ? helpers.userHasRole(['Administrator', 'Directie', 'Projectleider']) : true;
            return rightsRule && rolesRule;
        };

        function generateColumns(sampleData) {
            var colNames = Object.getOwnPropertyNames(sampleData);
            return colNames.map(function (name, idx) {
                var filter = {};
                filter[name] = 'text';
                return {
                    title: name,
                    sortable: name,
                    filter: filter,
                    show: true,
                    field: name
                };
            });
        }

        var fromQuery = function (connectingString, id, query, nameId, medewerkers, deelcollectieven, financiers) {
            $("body").addClass("loading");
            if (query === 'getProjects') {
                id = id + '&closed=' + ($rootScope.closedProjects.show ? 'true' : 'false');
            }
            id = id + '&year=' + $rootScope.year;
            
            return getQueries.getProjectDetails(connectingString, id, query, nameId).then(function (response) {
                
                var fixedResult = [];
                // projects page
                if (query === 'getProjects') {
                    angular.forEach(response, function (value) {
                        value['Aangemaakt_door'] = value['Aangemaakt door'];
                        delete value['Aangemaakt door'];

                        if (showRow(value)){
                            fixedResult.push(value);
                        }
                    });

                    response = fixedResult;
                }

                var data = response,
                    above = '',
                    Opb = 0,
                    Res = 0,
                    Kos = 0,
                    BegrootFin = 0,
                    ToegezegdFin = 0,
                    BetalenFin = 0,
                    NemenFin = 0,
                    MutatiesFin = 0,
                    BatigFin = 0,
                    NogFin = 0,
                    FacturerenFin = 0,
                    TotalFinancierginFin = 0,
                    BedragSum = 0,
                    removeRow = [];
                angular.forEach(data, function (valueData, valueKey) {
                    angular.forEach(valueData, function (value, key) {
                        if ((valueData['Id'] === null || valueData['Id'] === undefined) && (valueData['id'] !== null && valueData['id'] !== undefined)) {
                            valueData['Id'] = valueData['id'];
                        }
                        valueData['Id'] = parseInt(valueData['Id']);

                        if (key == 'Planning starten' || key == 'Planning opleveren') {
                            if (value != null) {
                                var date = new Date(value);
                                // valueData[key] = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
                                valueData[(key + '').replace(/ /g, "_")] = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear();
                                delete valueData[key];
                            }
                        }
                        if (query == 'getOrganisatie') {
                            if (key == 'functievalue') {
                                valueData['Rol'] = value;
                                delete valueData['functievalue'];
                            }
                            if (key == 'medewerkerkey') {
                                var val = '';
                                angular.forEach(medewerkers, function (valMed) {
                                    if (value == valMed.key) {
                                        val = valMed.value;
                                    }
                                });
                                valueData['Medewerker'] = val;
                                delete valueData['medewerkerkey'];
                            }
                            if (key == 'taken') {
                                valueData['Taken, bevoegdheden en verantwoordelijkheden'] = value;
                                // .replace(/ /g,"_")
                                delete valueData['taken'];
                            }
                            delete valueData['faseid'];
                            delete valueData['functiekey'];
                        }

                        if (query == 'getKostenOOP' || query == 'getKostenOOPProject') {
                            if (key == 'Functie') {
                                valueData['Inkoop'] = value;
                                delete valueData['Functie'];
                            }
                            if (key == 'Bedrag') {
                                valueData['Bedrag '] = valueData['Bedrag'] != null ?
                                    '€ ' + parseInt(valueData['Bedrag']).toLocaleString('nl-NL') : "";
                                delete valueData['Bedrag'];
                            }
                        }

                        if (
                             query === 'getKostenUren' ||
                            query == 'getKostenUrenProject'
                        ) {
                            if (key === 'Medewerker' && query !== 'getKostenUren') {
                                var med = _.where(medewerkers, {'key':value})[0];
                                valueData['Medewerker'] = med? med.value: '';
                            }

                            if (key == 'Kostprijs tarief') {
                                if (valueData['Kostprijs tarief'] != null) {
                                    valueData['Kostprijs tarief'] = '€ ' + parseInt(valueData['Kostprijs tarief']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Kosten') {
                                if (valueData['Kosten'] != null) {
                                    valueData['Kosten'] = '€ ' + parseInt(valueData['Kosten']).toLocaleString('nl-NL');
                                }
                            }
                        }
                        if (query == 'getOpbrengstenUren' || query == 'getOpbrengstenUrenProject') {
                            if (key == 'Medewerker') {
                                angular.forEach(medewerkers, function (valMed) {
                                    if (value == valMed.key) {
                                        valueData['Medewerker'] = valMed.value;
                                    }
                                });
                            }
                        }
                        if (query == 'getFinanciering' || query == 'getFinancieringVersie' || query == 'getFinancieringProject') {
                            if (key == 'Begroot') {
                                if (valueData['Begroot'] != null) {
                                    BegrootFin += valueData['Begroot'];
                                    valueData['Begroot'] = '€ ' + parseInt(valueData['Begroot']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Toegezegd') {
                                if (valueData['Toegezegd'] != null) {
                                    ToegezegdFin += valueData['Toegezegd'];
                                    valueData['Toegezegd'] = '€ ' + parseInt(valueData['Toegezegd']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Nog niet toegezegd') {
                                if (valueData['Nog niet toegezegd'] != null) {
                                    NogFin += valueData['Nog niet toegezegd'];
                                    valueData['Nog niet toegezegd'] = '€ ' + parseInt(valueData['Nog niet toegezegd']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Nog te factureren') {
                                if (valueData['Nog te factureren'] != null) {
                                    FacturerenFin += valueData['Nog te factureren'];
                                    valueData['Nog te factureren'] = '€ ' + parseInt(valueData['Nog te factureren']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Nog te betalen') {
                                if (valueData['Nog te betalen'] != null) {
                                    BetalenFin += valueData['Nog te betalen'];
                                    valueData['Nog te betalen'] = '€ ' + parseInt(valueData['Nog te betalen']).toLocaleString('nl-NL');
                                }
                            }
                            // if (key == 'Batig Saldo') {
                            //     if (valueData['Batig Saldo'] != null) {
                            //         BatigFin += valueData['Batig Saldo'];
                            //         valueData['Batig Saldo'] = '€ ' + parseInt(valueData['Batig Saldo']).toLocaleString('nl-NL');
                            //     }
                            // }
                            if (key == 'Mee te nemen') {
                                if (valueData['Mee te nemen'] != null) {
                                    NemenFin += valueData['Mee te nemen'];
                                    valueData['Mee te nemen'] = '€ ' + parseInt(valueData['Mee te nemen']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Mutaties') {
                                if (valueData['Mutaties'] != null) {
                                    MutatiesFin += valueData['Mutaties'];
                                    valueData['Mutaties'] = '€ ' + parseInt(valueData['Mutaties']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Totale financiering') {
                                if (valueData['Totale financiering'] != null) {
                                    TotalFinancierginFin += valueData['Totale financiering'];
                                    valueData['Totale financiering'] = '€ ' + parseInt(valueData['Totale financiering']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Onzeker') {
                                valueData['Nog niet toegezegd'] = value;
                                delete valueData['Onzeker'];
                                if (valueData['Nog niet toegezegd'] != null) {
                                    NogFin += valueData['Nog niet toegezegd'];
                                    valueData['Nog niet toegezegd'] = '€ ' + parseInt(valueData['Nog niet toegezegd']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Financierder') {
                                if (valueData['Financiering'] == 'extern') {
                                    if (valueData['Type'] == 'deelcollectieven') {
                                        angular.forEach(deelcollectieven, function (valMed) {
                                            if (value == valMed.key) {
                                                valueData['Financierder'] = valMed.value;
                                            }
                                        });
                                    } else {
                                        angular.forEach(financiers, function (valMed) {
                                            if (value == valMed.key) {
                                                valueData['Financierder'] = valMed.value;
                                            }
                                        });
                                    }
                                }
                            }
                        }

                        if (query == 'getResultaat' || query == 'getResultaatProject') {
                            if ([null, 0].indexOf(valueData['Opbrengsten']) >= 0 && [null, 0].indexOf(valueData['Kosten']) >= 0
                                && [null, 0].indexOf(valueData['Resultaat']) >= 0 && !valueData.master) {
                                removeRow.push(valueKey);
                            }
                            valueData.showPlus = ((parseInt(valueData['Resultaat']!= null?
                            (valueData['Resultaat'] + '').replace('€ ', ''):0) != 0
                            || parseInt(valueData['Opbrengsten']!= null?
                                (valueData['Opbrengsten'] + '').replace('€ ', ''):0) != 0
                            || parseInt(valueData['Kosten']!= null?
                                (valueData['Kosten'] + '').replace('€ ', ''):0) != 0) && valueData.master ? 1 : 0);

                            if (key == 'Opbrengsten') {
                                if (valueData['Opbrengsten'] != null) {
                                    if (valueData.master) {
                                        Opb += valueData['Opbrengsten'];
                                    }
                                    valueData['Opbrengsten'] = '€ ' + parseInt(valueData['Opbrengsten']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Kosten') {
                                if (valueData['Kosten'] != null) {
                                    if (valueData.master) {
                                        Kos += valueData['Kosten'];
                                    }
                                    valueData['Kosten'] = '€ ' + parseInt(valueData['Kosten']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Resultaat') {
                                if (valueData['Resultaat'] != null) {
                                    if (valueData.master) {
                                        Res += valueData['Resultaat'];
                                    }
                                    valueData['Resultaat'] = '€ ' + parseInt(valueData['Resultaat']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Omschrijving') {
                                if (valueData['Omschrijving'] == 'Kennis') {
                                    valueData['Omschrijving'] = 'Exploitatie';
                                }
                            }
                            if (valueData.master) {
                                above = valueData.Omschrijving;
                                valueData['visible'] = 1;
                            } else {
                                valueData['above'] = above;
                                valueData['visible'] = 0;
                            }
                       }

                        if (query == 'getFaseDetails') {
                            if (key == 'Educatie') {
                                if (valueData['Educatie'] != null) {
                                    valueData['Educatie'] = valueData['Educatie'] ? 'Ja' : 'Nee';
                                } else {
                                    valueData['Educatie'] = 'Nee';
                                }
                            }
                            if (key == 'Kennisverspreiding') {
                                if (valueData['Kennisverspreiding'] != null) {
                                    valueData['Kennisverspreiding'] = valueData['Kennisverspreiding'] ? 'Ja' : 'Nee';
                                } else {
                                    valueData['Kennisverspreiding'] = 'Nee';
                                }
                            }
                            if (key == 'Naam') {
                                valueData['Naam fase'] = valueData['Naam'];
                                delete valueData['Naam'];
                            }
                            if (key == 'Doel') {
                                valueData['Resultaat_'] = valueData['Doel'];
                                delete valueData['Doel'];
                            }
                            valueData['visible'] = 0;
                        }

                        if (query == 'getKostenDekkingsbijdrage' || query == 'getKostenDekkingsbijdrageProject') {
                            if (key == 'Percentage') {
                                if (valueData['Percentage'] != null) {
                                    valueData['Percentage'] = valueData['Percentage'] + ' %';
                                }
                            }
                            if (key == 'Bedrag') {
                                if (valueData['Bedrag'] != null) {
                                    BedragSum = BedragSum + parseInt(valueData['Bedrag']);
                                    valueData['Bedrag'] = '€ ' + parseInt(valueData['Bedrag']).toLocaleString('nl-NL');
                                }
                            }
                        }

                        if (query == 'getOpbrengstenUren' || query == 'getOpbrengstenKennis'
                            || query == 'getOpbrengstenUrenProject' || query == 'getOpbrengstenKennisProject') {
                            if (key == 'Tarief') {
                                if (valueData['Tarief'] != null) {
                                    valueData['Tarief'] = '€ ' + parseInt(valueData['Tarief']).toLocaleString('nl-NL');
                                }
                            }
                            if (key == 'Opbrengst') {
                                if (valueData['Opbrengst'] != null) {
                                    valueData['Opbrengst'] = '€ ' + parseInt(valueData['Opbrengst']).toLocaleString('nl-NL');
                                }
                            }
                        }
                        if (query == 'getOpbrengstenOOP' || query == 'getOpbrengstenOOPProject') {
                            if (key == 'Omschrijving') {
                                valueData['Inkoop'] = value;
                                delete valueData['Omschrijving'];
                            }
                            if (key == 'Kosten') {
                                valueData['Kosten '] = valueData['Kosten'] != null ?
                                    '€ ' + parseInt(valueData['Kosten']).toLocaleString('nl-NL') : "";
                                delete valueData['Kosten'];
                            }
                            if (key == 'Opbrengst') {
                                valueData['Opbrengst '] = valueData['Opbrengst'] != null ?
                                    '€ ' + parseInt(valueData['Opbrengst']).toLocaleString('nl-NL') : "";
                                delete valueData['Opbrengst'];
                            }
                            if (key == 'Marge') {
                                valueData['Marge '] = valueData['Marge'] != null ?
                                    parseInt(valueData['Marge']).toLocaleString('nl-NL') + ' %' : "";
                                delete valueData['Marge'];
                            }
                        }
                    });
                });
                if (query == 'getResultaat' || query == 'getResultaatProject') {
                    removeRow = removeRow.filter(function (item, pos) {
                        return removeRow.indexOf(item) == pos;
                    });
                    angular.forEach(removeRow, function (removeRowValue, removeRowKey) {
                        data = data.filter(function (elValue, elKey) {
                            return elKey != (removeRowValue - removeRowKey);
                        });
                    });
                    data.push({
                        'Kosten': '€ ' + parseInt(Kos).toLocaleString('nl-NL'),
                        'Omschrijving': 'Resultaat',
                        'Opbrengsten': '€ ' + parseInt(Opb).toLocaleString('nl-NL'),
                        'Resultaat': '€ ' + parseInt(Res).toLocaleString('nl-NL'),
                        'Leverancier': "",
                        'Medewerker': "",
                        'above': "",
                        'id': 'ResultaatSum',
                        'master': 2,
                        'visible': 1
                    });
                }

                if (query === 'getKostenDekkingsbijdrage' || query === 'getKostenDekkingsbijdrageProject') {
                    data.push({
                        'Id':'BedragSum',
                        'Omschrijving':'',
                        'Percentage':'',
                        'Bedrag': '€ ' + parseInt(BedragSum).toLocaleString('nl-NL')
                    });
                }

                if (query == 'getFinanciering' || query == 'getFinancieringVersie') {
                    let EindstandFin = 0;
                    EindstandFin = parseInt(ToegezegdFin) + parseInt(NemenFin);
                    data.push({
                        'id': 'BedragSum',
                        'Financiering': "",
                        'Type': "",
                        'Financierder': "",
                        'Debiteurnummer': "",
                        'Begroot': '€ ' + parseInt(BegrootFin).toLocaleString('nl-NL'),
                        'Toegezegd': '€ ' + parseInt(ToegezegdFin).toLocaleString('nl-NL'),
                        'Nog niet toegezegd': '€ ' + parseInt(NogFin).toLocaleString('nl-NL'),
                        'Mutaties': '€ ' + parseInt(MutatiesFin).toLocaleString('nl-NL'),
                        'Totale financiering': '€ ' + parseInt(TotalFinancierginFin).toLocaleString('nl-NL'),
                        'Nog te factureren': '€ ' + parseInt(FacturerenFin).toLocaleString('nl-NL'),
                        'Nog te betalen': '€ ' + parseInt(BetalenFin).toLocaleString('nl-NL'),
                        'Mee te nemen': '€ ' + parseInt(NemenFin).toLocaleString('nl-NL'),
                        // 'Batig Saldo': '€ ' + parseInt(BatigFin).toLocaleString('nl-NL'),
                        'EindstandFin': '€ ' + parseInt(EindstandFin).toLocaleString('nl-NL'),
                    });
                }

                if (query == 'getFinancieringProject') {
                    let EindstandFin = 0;
                    EindstandFin = parseInt(ToegezegdFin) + parseInt(NemenFin);
                    data.push({
                        'id': 'BedragSum',
                        'Financiering': "",
                        'Type': "",
                        'Financierder': "",
                        'Begroot': '€ ' + parseInt(BegrootFin).toLocaleString('nl-NL'),
                        'Toegezegd': '€ ' + parseInt(ToegezegdFin).toLocaleString('nl-NL'),
                        'Nog niet toegezegd': '€ ' + parseInt(NogFin).toLocaleString('nl-NL'),
                        'Mutaties': '€ ' + parseInt(MutatiesFin).toLocaleString('nl-NL'),
                        'Totale financiering': '€ ' + parseInt(TotalFinancierginFin).toLocaleString('nl-NL'),
                        'Nog te factureren': '€ ' + parseInt(FacturerenFin).toLocaleString('nl-NL'),
                        'Nog te betalen': '€ ' + parseInt(BetalenFin).toLocaleString('nl-NL'),
                        'Mee te nemen': '€ ' + parseInt(NemenFin).toLocaleString('nl-NL'),
                        // 'Batig Saldo': '€ ' + parseInt(BatigFin).toLocaleString('nl-NL'),
                        'EindstandFin': '€ ' + parseInt(EindstandFin).toLocaleString('nl-NL'),
                    });
                }
                $("body").removeClass("loading");
                if (data.length > 0) {
                    var cols = generateColumns(data[0]);
                    if (query == 'getResultaat' || query == 'getResultaatProject' || query === 'getKostenUren'
                        || query == 'getKostenOOP' || query == 'getKostenDekkingsbijdrage'
                        || query == 'getOpbrengstenUren' || query == 'getOpbrengstenOOP'
                        || query == 'getOpbrengstenKennis' || query == 'getProjectResultatenRapport'
                        || query == 'getOpbrengstenUrenProject' || query == 'getOpbrengstenOOPProject'
                        || query == 'getOpbrengstenKennisProject' || query == 'getKostenUrenProject'
                        || query == 'getKostenOOPProject' || query == 'getKostenDekkingsbijdrageProject') {
                        var table = new NgTableParams({
                            count: data.length
                        }, {
                            counts: [],
                            filterDelay: 0,
                            dataset: data
                        });
                    } else {
                        var table = new NgTableParams({
                            page: 1, // show first page
                            count: 10 // count per page
                        }, {
                            counts: [],
                            filterDelay: 0,
                            dataset: data
                        });
                    }

                    //remove ID from tables
                    if (query == 'getKostenOOP' || query == 'getOpbrengstenUren' || query == 'getOpbrengstenUrenProject'
                        || query == 'getOpbrengstenOOP' || query == 'getOpbrengstenKennis'
                        || query == 'getRisicos' || query == 'getRisicosProject' || query == 'getFinanciering' || query == 'getFinancieringProject'
                        || query == 'getFinancieringVersie'
                        || query == 'getOpbrengstenOOPProject' || query == 'getOpbrengstenKennisProject'
                        || query == 'getKostenOOPProject' || query == 'getKostenUrenProject'
                        || query == 'getKostenDekkingsbijdrageProject') {
                        cols[0].show = false;
                        cols.push(cols.shift());
                    }

                    if (query == 'getResultaat' || query == 'getResultaatProject') {
                        cols[0].show = false;
                        cols[7].show = false;
                        cols[8].show = false;
                        cols[9].show = false;
                    }

                    if (query == 'getKostenUrenProject') {
                        cols[5].show = false;
                    }

                    if (query == 'getProjects') {
                        cols[0].show = false;
                    }

                    if (query == 'getRisicos' || query == 'getRisicosProject') {
                        cols[5].show = false;
                    }

                    if (query == 'getKostenOOPProject') {
                        cols[0].show = false;
                    }

                    $('table tbody tr:first-child td.pullRight').each(function () {
                        var td = $(this),
                            index = td.index();
                        td.closest('table').find('thead tr th:eq(' + index + ')').addClass('pullRight');
                    });
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
                    $('table tbody tr:first-child td.removeRow').each(function () {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('removeRow');
                    });

                    if (query === 'getProjects') {
                        cols[helpers.getIdByFieldName(data[0], 'Indirect')].show = false;
                    }

                    if (query === 'getResultaat' || query === 'getResultaatProject') {
                        cols[helpers.getIdByFieldName(data[0], 'visible')].show = false;
                    }

                    if (query === 'getKostenDekkingsbijdrage') {
                        cols[3].show = false;
                    }

                    if (query === 'getKostenDekkingsbijdrageProject') {
                        var foo = cols[3];
                        cols.splice(1, 0, foo);
                        delete cols[4];

                        var foo = cols[1];
                        cols.splice(0, 0, foo);
                        delete cols[2];

                        cols[0].show = true;
                        cols[4].show = false;
                    }

                    //aHR0cHM6Ly9jczgucGlrYWJ1LnJ1L2ltYWdlcy9wcmV2aWV3c19jb21tLzIwMTYtMDhfMS8xNDcwMDQzNzc1MTk1MTM2MTI3LmpwZw==
                    cols = mapSpecialCols(query, cols);
                    return [table, cols, data];
                } else {
                    return [false, false];
                }
            });
        };

        return {
            fromQuery: fromQuery
        };
    }

    constructTable.$inject = ['NgTableParams', 'getQueries', '$rootScope', 'helpers'];

    return constructTable;
});