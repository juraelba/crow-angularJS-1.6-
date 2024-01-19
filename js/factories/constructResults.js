define(['angular'], function (angular) {

    function constructResults(NgTableParams, getQueries) {

        function generateColumns(sampleData) {
            var colNames = Object.getOwnPropertyNames(sampleData);
            return colNames.map(function (name) {
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

        function getHeadersForFase(faseName, data) {
            var headers = [];

            angular.forEach(data, function (valueData) {
                if (valueData['Fase'] === faseName) {
                    if (headers.indexOf(valueData['Header']) === -1) {
                        headers.push(valueData['Header'])
                    }
                }
            });

            return headers;
        }

        function getTypeForHeaderForFase(faseName, headerName, data) {
            var types = [];

            angular.forEach(data, function (valueData) {
                if (valueData['Fase'] === faseName && valueData['Header'] === headerName) {
                    if (types.indexOf(valueData['Type']) === -1) {
                        types.push(valueData['Type'])
                    }
                }
            });

            return types;
        }

        function getSumOfParamForFase(faseName, headerName, typeName, paramName, data) {
            var sum = 0, numb;
            angular.forEach(data, function (valueData) {
                numb = isNaN(parseFloat(valueData[paramName])) ? 0 : parseFloat(valueData[paramName]);
                if (!typeName && !headerName && !faseName) {
                    sum += numb;
                } else if (typeName && headerName && faseName) {
                    if (valueData['Fase'] === faseName && valueData['Header'] === headerName && valueData['Type'] === typeName) {
                        sum += numb;
                    }
                } else if (!typeName && (faseName && headerName)) {
                    if (valueData['Fase'] === faseName && valueData['Header'] === headerName) {
                        sum += numb;
                    }
                } else if (!typeName && !headerName && faseName) {
                    if (valueData['Fase'] === faseName) {
                        sum += numb;
                    }
                }
            });
            return sum;
        }

        function getFaseRecord(faseName, faseKey, data) {
            var Begroting = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Begroting', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Begroting', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Begroting', data);

            var Realisatie = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Realisatie', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Realisatie', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Realisatie', data);

            var Budget = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Budget Resultaat', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Budget Resultaat', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Budget Resultaat', data);

            var Leverancier = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Leverancier', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Leverancier', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Leverancier', data);

            return {
                'Fase': 'Fase: ' + faseName,
                'Type': '',
                'Omschrijving': '',
                'Medewerker': '',
                'Begroting': '€ ' + Begroting.toLocaleString('nl-NL'),
                'Begroting Uren': '',
                'Begroting Tarief': '',
                'Realisatie': '€ ' + Realisatie.toLocaleString('nl-NL'),
                'Realisatie Uren': '',
                'Realisatie Tarief': '',
                'Budget Resultaat': '€ ' + Budget.toLocaleString('nl-NL'),
                'Leverancier': '€ ' + Leverancier.toLocaleString('nl-NL'),
                'Header': '',
                'visible': true,
                'fase_key': faseKey,
                'type_key': 'fase',
                'type_filter': 'fase',
                'bold': true,
                'plus': true
            };
        }

        function getHeaderRecord(faseName, faseKey, headerName, headerKey, data) {
            var Begroting = getSumOfParamForFase(faseName, headerName, null, 'Begroting', data);
            var Realisatie = getSumOfParamForFase(faseName, headerName, null, 'Realisatie', data);
            var Budget = getSumOfParamForFase(faseName, headerName, null, 'Budget Resultaat', data);
            var Leverancier = getSumOfParamForFase(faseName, headerName, null, 'Leverancier', data);

            return {
                'Begroting': '€ ' + Begroting.toLocaleString('nl-NL'),
                'Budget Resultaat': '€ ' + Budget.toLocaleString('nl-NL'),
                'Leverancier': '€ ' + Leverancier.toLocaleString('nl-NL'),
                'Fase': headerName,
                'Realisatie': '€ ' + Realisatie.toLocaleString('nl-NL'),
                'header_key': headerKey,
                'bold': true,
                'plus': true,
                'visible': false,
                'type_filter': 'header',
                'fase_key': faseKey
            };
        }

        function getTypeRecord(faseName, faseKey, headerName, headerKey, typeName, typeKey, data) {
            var Begroting = getSumOfParamForFase(faseName, headerName, typeName, 'Begroting', data);
            var Realisatie = getSumOfParamForFase(faseName, headerName, typeName, 'Realisatie', data);
            var Budget = getSumOfParamForFase(faseName, headerName, typeName, 'Budget Resultaat', data);
            var Leverancier = getSumOfParamForFase(faseName, headerName, typeName, 'Leverancier', data);

            return {
                'Begroting': '€ ' + Begroting.toLocaleString('nl-NL'),
                'Leverancier': '€ ' + Leverancier.toLocaleString('nl-NL'),
                'Type': typeName,
                'Realisatie': '€ ' + Realisatie.toLocaleString('nl-NL'),
                'type_key': typeKey,
                'bold': true,
                'plus': true,
                'visible': false,
                'type_filter': 'type',
                'header_key': headerKey,
                'fase_key': faseKey
            };
        }

        function getPercentage(allFases, data) {
            var totalRealisatieOpbrengsten = 0;
            var totalBegrotingOpbrengsten = 0;
            var totalRealisatieKosten = 0;
            var totalBegrotingKosten = 0;

            angular.forEach(allFases, function (faseName) {
                var totalRealisatieOpbrengstenForFase = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Realisatie', data);
                var totalBegrotingOpbrengstenForFase = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Begroting', data);

                var totalRealisatieKostenForFase = getSumOfParamForFase(faseName, 'Kosten', null, 'Realisatie', data);
                var totalBegrotingKostenForFase = getSumOfParamForFase(faseName, 'Kosten', null, 'Begroting', data);

                totalRealisatieOpbrengsten += totalRealisatieOpbrengstenForFase;
                totalBegrotingOpbrengsten += totalBegrotingOpbrengstenForFase;

                totalRealisatieKosten += totalRealisatieKostenForFase;
                totalBegrotingKosten += totalBegrotingKostenForFase;
            });

            var result = ((totalRealisatieOpbrengsten / totalBegrotingOpbrengsten) + (totalRealisatieKosten / totalBegrotingKosten)) / 2 * 100;

            result = Math.ceil(result);
            result = result > 0 && !isNaN(result) ? result : 0;

            // ((Total in realisatie opbrengsten (marked in the screenshot) / Total in begroting opbrengsten) + (Total in realisatie kosten / Total in begroting kosten)) / 2 *100
            return parseInt(result);
        }

        var fromQuery = function (connectingString, query, data) {
            var $body = $("body");

            $body.addClass("loading");
            return getQueries.getQuery(connectingString, query, data).then(function (response) {
                var data = response;

                if (data.length > 0) {
                    var allFases = [];
                    var allLines = [];

                    angular.forEach(data, function (valueData) {
                        //get all exist fases
                        if (allFases.indexOf(valueData['Fase']) === -1) {
                            allFases.push(valueData['Fase']);
                        }
                    });

                    // all sum
                    var totalBegroting = 0;
                    var totalBudget = 0;
                    var totalRealisatie = 0;
                    var totalLeverancier = 0;

                    var projectPercentage = getPercentage(allFases, data);
                    angular.forEach(allFases, function (faseName) {
                        totalBegroting += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Begroting', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Begroting', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Begroting', data);

                        totalRealisatie += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Realisatie', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Realisatie', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Realisatie', data);

                        totalBudget += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Budget Resultaat', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Budget Resultaat', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Budget Resultaat', data);

                        totalLeverancier += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Leverancier', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Leverancier', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Leverancier', data);
                    });

                    angular.forEach(allFases, function (faseName, faseKey) {
                        //add fase record
                        allLines.push(getFaseRecord(faseName, faseKey, data));

                        var headersOfFase = getHeadersForFase(faseName, data);

                        angular.forEach(headersOfFase, function (headerName, headerKey) {
                            //add header record
                            allLines.push(getHeaderRecord(faseName, faseKey, headerName, headerKey, data));

                            var typesOfHeaderOfFase = getTypeForHeaderForFase(faseName, headerName, data);
                            angular.forEach(typesOfHeaderOfFase, function (typeName, typeKey) {
                                //add type record
                                allLines.push(getTypeRecord(faseName, faseKey, headerName, headerKey, typeName, typeKey, data));

                                angular.forEach(data, function (valueData) {
                                    if (valueData['Fase'] === faseName
                                        && valueData['Header'] === headerName
                                        && valueData['Type'] === typeName
                                    ) {
                                        //add all records for this type, header, fase
                                        valueData['fase_key'] = faseKey;
                                        valueData['visible'] = false;
                                        valueData['header_key'] = headerKey;
                                        valueData['type_key'] = typeKey;
                                        valueData['Omschrijving'] = valueData['Rol'];
                                        delete valueData['Rol'];

                                        valueData['Fase'] = '';
                                        valueData['Type'] = '';

                                        allLines.push(valueData);
                                    }
                                });
                            });
                        });
                    });

                    // allLines.reverse();

                    //items which need to add special symbol €
                    var textFields = [
                        'Fase',
                        'Type',
                        'Omschrijving',
                        'Header',
                        'bold',
                        'plus',
                        'visible',
                        'type_filter',
                        'fase_key',
                        'header_key',
                        'type_key',
                        'Leverancier',
                        'Leverancier Resultaat',
                        'Begroting Uren',
                        'Realisatie Uren',
                        'Medewerker'
                    ];
                    angular.forEach(allLines, function (valueData) {
                        angular.forEach(valueData, function (value, key) {
                            if (textFields.indexOf(key) < 0 && !valueData['bold']) {
                                if (valueData[key] !== null) {
                                    valueData[key] = '€ ' + parseFloat(valueData[key]).toLocaleString('nl-NL');
                                }
                            }
                        });
                    });

                    $body.removeClass("loading");

                    var cols = generateColumns(allLines[0]);

                    allLines.unshift({
                        'Begroting': '€ ' + totalBegroting.toLocaleString('nl-NL'),
                        'Budget Resultaat': '€ ' + totalBudget.toLocaleString('nl-NL'),
                        'Leverancier': '€ ' + totalLeverancier.toLocaleString('nl-NL'),
                        'Fase': 'Resultaat project',
                        'Realisatie': '€ ' + totalRealisatie.toLocaleString('nl-NL'),
                        'bold': true,
                        'visible': true
                    });

                    var table = new NgTableParams({
                        count: allLines.length
                    }, {
                        counts: [],
                        filterDelay: 0,
                        dataset: allLines
                    });

                    angular.forEach([12, 13, 14, 15, 16, 17, 18,19], function (number) {
                        if (cols[number]) cols[number].show = false;
                    });

                    angular.forEach(cols, function (col) {
                        col.sortable = false;
                    });

                    $body.removeClass("loading");
                    return [table, cols, projectPercentage];
                } else {
                    $body.removeClass("loading");
                    return [false, false];
                }
            });
        };

        return {
            fromQuery: fromQuery
        };
    }

    constructResults.$inject = ['NgTableParams', 'getQueries'];

    return constructResults;
});