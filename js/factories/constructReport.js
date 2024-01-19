define([], function () {

    function constructReport(NgTableParams, getQueries) {

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

        var fromQuery = function (connectingString, query) {
            $("body").addClass("loading");
            return getQueries.getQuery(connectingString, query).then(function (response) {
                var data = response;

                if (data.length > 0) {
                    var newRows = [],
                        Gefactureerd = 0,
                        Nog = 0,
                        Crow = 0,
                        Ontwikkelfonds = 0,
                        fase = data[0]['Fase'],
                        fases = [],
                        row = false,
                        textFields = [
                            'Id',
                            'Fase',
                            'bold',
                            'plus',
                            'visible',
                            'type_filter',
                            'fase_key',
                        ],
                        Gefactureerd_sum = 0,
                        Nog_sum = 0,
                        Crow_sum = 0,
                        Ontwikkelfonds_sum = 0;
                    angular.forEach(data, function (valueData, valueKey) {
                        angular.forEach(valueData, function (value, key) {
                            if (key == 'Gefactureerd') {
                                Gefactureerd_sum += valueData['Gefactureerd'] ? parseInt(valueData['Gefactureerd']) : 0;
                            }
                            if (key == 'Nog factureren') {
                                Nog_sum += valueData['Nog factureren'] ? parseInt(valueData['Nog factureren']) : 0;
                            }
                            if (key == 'Crow') {
                                Crow_sum += valueData['Crow'] ? parseInt(valueData['Crow']) : 0;
                            }
                            if (key == 'Ontwikkelfonds') {
                                Ontwikkelfonds_sum += valueData['Ontwikkelfonds'] ? parseInt(valueData['Ontwikkelfonds']) : 0;
                            }
                            valueData['visible'] = false;
                        });
                        if (fase == valueData['Fase']) {
                            Gefactureerd += valueData['Gefactureerd'] ? parseInt(valueData['Gefactureerd']) : 0;
                            Nog += valueData['Nog factureren'] ? parseInt(valueData['Nog factureren']) : 0;
                            Crow += valueData['Crow'] ? parseInt(valueData['Crow']) : 0;
                            Ontwikkelfonds += valueData['Ontwikkelfonds'] ? parseInt(valueData['Ontwikkelfonds']) : 0;
                            newRows.push(valueData);
                        } else {
                            row = {
                                'Gefactureerd': '€ ' + parseFloat(Gefactureerd).toLocaleString('nl-NL'),
                                'Nog factureren': '€ ' + parseFloat(Nog).toLocaleString('nl-NL'),
                                'Crow': '€ ' + parseFloat(Crow).toLocaleString('nl-NL'),
                                'Ontwikkelfonds': '€ ' + parseFloat(Ontwikkelfonds).toLocaleString('nl-NL'),
                                'Fase': 'Fase: ' + fase,
                                'fase_key': fases.length,
                                'bold': true,
                                'plus': true,
                                'visible': true,
                                'type_filter': 'fase',
                                'header': true
                            };
                            data.splice(valueKey, 0, row);
                            fase = valueData['Fase'];
                            fases.push(newRows);
                            newRows = [];
                            Gefactureerd = 0;
                            Nog = 0;
                            Crow = 0;
                            Ontwikkelfonds = 0;
                        }
                        valueData['fase_key'] = fases.length;
                    });

                    fases.push(newRows);
                    row = {
                        'Gefactureerd': '€ ' + parseFloat(Gefactureerd).toLocaleString('nl-NL'),
                        'Nog factureren': '€ ' + parseFloat(Nog).toLocaleString('nl-NL'),
                        'Crow': '€ ' + parseFloat(Crow).toLocaleString('nl-NL'),
                        'Ontwikkelfonds': '€ ' + parseFloat(Ontwikkelfonds).toLocaleString('nl-NL'),
                        'Fase': 'Fase: ' + fase,
                        'fase_key': fases.length - 1,
                        'bold': true,
                        'plus': true,
                        'visible': true,
                        'type_filter': 'fase',
                        'header': true
                    };
                    data.splice(data.length, 0, row);

                    //sum
                    row = {
                        'Gefactureerd': '€ ' + parseFloat(Gefactureerd_sum).toLocaleString('nl-NL'),
                        'Nog factureren': '€ ' + parseFloat(Nog_sum).toLocaleString('nl-NL'),
                        'Crow': '€ ' + parseFloat(Crow_sum).toLocaleString('nl-NL'),
                        'Ontwikkelfonds': '€ ' + parseFloat(Ontwikkelfonds_sum).toLocaleString('nl-NL'),
                        'Fase': 'Resultaat project',
                        'bold': true,
                        'visible': true,
                    };
                    data.splice(data.length, 0, row);

                    angular.forEach(data, function (valueData) {
                        angular.forEach(valueData, function (value, key) {
                            if (textFields.indexOf(key) < 0 && !valueData['bold']) {
                                if (valueData[key] != null) {
                                    valueData[key] = '€ ' + parseFloat(valueData[key]).toLocaleString('nl-NL');
                                }
                            }
                        });
                    });

                    var cols = generateColumns(data[0]);
                    var table = new NgTableParams({
                        count: data.length
                    }, {
                        counts: [],
                        filterDelay: 0,
                        dataset: data
                    });

                    // cols[4].show = false;
                    cols[5].show = false;
                    cols[6].show = false;
                    // cols[7].show = false;

                    $("body").removeClass("loading");
                    return [table, cols];
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

    constructReport.$inject = ['NgTableParams', 'getQueries'];

    return constructReport;
});