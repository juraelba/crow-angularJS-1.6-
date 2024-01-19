define(['angular'], function (angular) {

    function constructForecast(NgTableParams, getQueries) {

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
            var Nog = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Nog te realiseren', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Nog te realiseren', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Nog te realiseren', data);

            var Forecast = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Forecast', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Forecast', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Forecast', data);

            var Verschil = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Verschil Forecast - Begroting', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Verschil Forecast - Begroting', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Verschil Forecast - Begroting', data);

            var budgetResultaat = getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Budget Resultaat', data) -
                getSumOfParamForFase(faseName, 'Kosten', null, 'Budget Resultaat', data) -
                getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Budget Resultaat', data);

            return {
                'Fase': 'Fase: ' + faseName,
                'Type': '',
                'Omschrijving': '',
                'Medewerker': '',
                'Budget Resultaat':'€ ' + budgetResultaat.toLocaleString('nl-NL'),
                'Nog te realiseren': '€ ' + Nog.toLocaleString('nl-NL'),
                'Verwachting': '',
                'Correctie uren': '',
                'Verplichtingen OOP Opdrachtbrief': '',
                'Correctie OOP': '',
                'Forecast': '€ ' + Forecast.toLocaleString('nl-NL'),
                'Verschil Forecast - Begroting': '€ ' + Verschil.toLocaleString('nl-NL'),
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
            var Nog = getSumOfParamForFase(faseName, headerName, null, 'Nog te realiseren', data);
            var Forecast = getSumOfParamForFase(faseName, headerName, null, 'Forecast', data);
            var Verschil = getSumOfParamForFase(faseName, headerName, null, 'Verschil Forecast - Begroting', data);
            var budgetResultaat = getSumOfParamForFase(faseName, headerName, null, 'Budget Resultaat', data);

            return {
                'Nog te realiseren': '€ ' + Nog.toLocaleString('nl-NL'),
                'Verschil Forecast - Begroting': '€ ' + Verschil.toLocaleString('nl-NL'),
                'Budget Resultaat': '€ ' + budgetResultaat.toLocaleString('nl-NL'),
                'Fase': headerName,
                'Forecast': '€ ' + Forecast.toLocaleString('nl-NL'),
                'header_key': headerKey,
                'bold': true,
                'plus': true,
                'visible': false,
                'type_filter': 'header',
                'fase_key': faseKey
            };
        }

        function getTypeRecord(faseName, faseKey, headerName, headerKey, typeName, typeKey, data) {
            var Nog = getSumOfParamForFase(faseName, headerName, typeName, 'Nog te realiseren', data);
            var Forecast = getSumOfParamForFase(faseName, headerName, typeName, 'Forecast', data);
            var Verschil = getSumOfParamForFase(faseName, headerName, typeName, 'Verschil Forecast - Begroting', data);
            var budgetResultaat = getSumOfParamForFase(faseName, headerName, typeName, 'Budget Resultaat', data);

            return {
                'Nog te realiseren': '€ ' + Nog.toLocaleString('nl-NL'),
                'Verschil Forecast - Begroting': '€ ' + Verschil.toLocaleString('nl-NL'),
                'Budget Resultaat':'€ ' + budgetResultaat.toLocaleString('nl-NL'),
                'Type': typeName,
                'Forecast': '€ ' + Forecast.toLocaleString('nl-NL'),
                'type_key': typeKey,
                'bold': true,
                'plus': true,
                'visible': false,
                'type_filter': 'type',
                'header_key': headerKey,
                'fase_key': faseKey
            };
        }

        var fromQuery = function (connectingString, query) {
            var $body = $("body");

            $body.addClass("loading");
            return getQueries.getQuery(connectingString, query).then(function (response) {
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
                    var totalNog = 0;
                    var totalForecast = 0;
                    var totalVerschil = 0;
                    var totalBudgetResultaat = 0;
                    angular.forEach(allFases, function (faseName) {
                        totalNog += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Nog te realiseren', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Nog te realiseren', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Nog te realiseren', data);

                        totalForecast += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Forecast', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Forecast', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Forecast', data);

                        totalVerschil += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Verschil Forecast - Begroting', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Verschil Forecast - Begroting', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Verschil Forecast - Begroting', data);

                        totalBudgetResultaat += getSumOfParamForFase(faseName, 'Opbrengsten', null, 'Budget Resultaat', data) -
                            getSumOfParamForFase(faseName, 'Kosten', null, 'Budget Resultaat', data) -
                            getSumOfParamForFase(faseName, 'Dekkingsbijdrage', null, 'Budget Resultaat', data);
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
                                        // valueData['Type'] = '';

                                        allLines.push(valueData);
                                    }
                                });
                            });
                        });
                    });

                    // var VFBSum = getSumOfParamForFase(null, null, null, 'Verschil Forecast - Begroting', data);
                    // all sum
                    // allLines.push({
                    //     'Nog te realiseren': '€ ' + getSumOfParamForFase(null, null, null, 'Nog te realiseren', data).toLocaleString('nl-NL'),
                    //     'Verschil Forecast - Begroting': '€ ' + VFBSum.toLocaleString('nl-NL'),
                    //     'Fase': 'Resultaat project',
                    //     'Forecast': '€ ' + getSumOfParamForFase(null, null, null, 'Forecast', data).toLocaleString('nl-NL'),
                    //     'bold': true,
                    //     'visible': true,
                    //     'sum_field': true
                    // });

                    //items which need to add special symbol €
                    var textFields = [
                        'Id',
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
                        'Correctie uren',
                        'Verplichtingen OOP Opdrachtbrief',
                        'Correctie OOP',
                        'Verwachting',
                        'Medewerker',
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
                        'Nog te realiseren': '€ ' + totalNog.toLocaleString('nl-NL'),
                        'Verschil Forecast - Begroting': '€ ' + totalVerschil.toLocaleString('nl-NL'),
                        'Budget Resultaat': '€ ' + totalBudgetResultaat.toLocaleString('nl-NL'),
                        'Fase': 'Resultaat project',
                        'Forecast': '€ ' + totalForecast.toLocaleString('nl-NL'),
                        'bold': true,
                        'visible': true,
                        'sum_field': true
                    });

                    var table = new NgTableParams({
                        count: allLines.length
                    }, {
                        counts: [],
                        filterDelay: 0,
                        dataset: allLines
                    });

                    angular.forEach([12, 13, 14, 15, 16, 17, 18], function (number) {
                        if (cols[number]) cols[number].show = false;
                    });

                    angular.forEach(cols, function (col) {
                        col.sortable = false;
                    });

                    $body.removeClass("loading");
                    return [table, cols, totalVerschil];
                } else {
                    $("body").removeClass("loading");
                    return [false, false];
                }
            });
        };

        return {
            fromQuery: fromQuery
        };
    }

    constructForecast.$inject = ['NgTableParams', 'getQueries'];

    return constructForecast;
});