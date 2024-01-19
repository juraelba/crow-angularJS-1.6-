define([], function () {

    function constructResults(NgTableParams, getQueries) {

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
                        Begroting = 0,
                        Realisatie = 0,
                        Budget = 0,
                        header = data[0]['Header'],
                        row = false,
                        textFields = [
                            'Fase',
                            'Type',
                            'Rol',
                            'Header'
                        ];
                    angular.forEach(data, function (valueData, valueKey) {
                        angular.forEach(valueData, function (value, key) {
                            if (header == valueData['Header']) {
                                if (key == 'Begroting') {
                                    Begroting += valueData['Begroting'] ? parseInt(valueData['Begroting']) : 0;
                                }
                                if (key == 'Realisatie') {
                                    Realisatie += valueData['Realisatie'] ? parseInt(valueData['Realisatie']) : 0;
                                }
                                if (key == 'Budget Resultaat') {
                                    Budget += valueData['Budget Resultaat'] ? parseInt(valueData['Budget Resultaat']) : 0;
                                }
                            } else {
                                row = {
                                    'Begroting': '€ ' + parseFloat(Begroting).toLocaleString('nl-NL'),
                                    'Budget': '€ ' + parseFloat(Budget).toLocaleString('nl-NL'),
                                    'Fase': 'Subtotaal ' + header,
                                    'Realisatie': '€ ' + parseFloat(Realisatie).toLocaleString('nl-NL'),
                                    'valueKey': valueKey,
                                    'Header': header
                                };
                                newRows.push(row);
                                header = valueData['Header'];
                                Begroting = 0;
                                Realisatie = 0;
                                Budget = 0;
                            }
                            if(textFields.indexOf(key) <0){
                                if (valueData[key] != null) {
                                    valueData[key] = '€ ' + parseFloat(valueData[key]).toLocaleString('nl-NL');
                                }
                            }
                            valueData['bold'] = false;
                            valueData['plus'] = false;
                            valueData['visible'] = false;
                        });
                    });

                    row = {
                        'Begroting': '€ ' + parseFloat(Begroting).toLocaleString('nl-NL'),
                        'Budget': '€ ' + parseFloat(Budget).toLocaleString('nl-NL'),
                        'Fase': 'Subtotaal ' + header,
                        'Realisatie': '€ ' + parseFloat(Realisatie).toLocaleString('nl-NL'),
                        'valueKey': data.length + 1 + newRows.length,
                        'Header': header
                    };
                    newRows.push(row);
                    Begroting = 0;
                    Realisatie = 0;
                    Budget = 0;
                    angular.forEach(newRows, function (value, key) {
                        row = {
                            'Begroting': value.Begroting,
                            'Budget Resultaat': value.Budget,
                            'Header': value.Header,
                            'Fase': value.Fase,
                            'Realisatie': value.Realisatie,
                            'bold': true,
                            'plus': true,
                            'visible': true
                        };
                        data.splice(value.valueKey, 0, row);
                        row = {
                            'bold': false,
                            'plus': false,
                            'visible': true
                        };
                        data.splice(value.valueKey + 1, 0, row);
                        Begroting += parseFloat((value.Begroting + '').replace('€ ', '').replace('.', '').replace(',', '.'));
                        Realisatie += parseFloat((value.Realisatie + '').replace('€ ', '').replace('.', '').replace(',', '.'));
                        Budget += parseFloat((value.Budget + '').replace('€ ', '').replace('.', '').replace(',', '.'));
                        if (key == newRows.length - 1) {
                            row = {
                                'Begroting': '€ ' + parseFloat(Begroting).toLocaleString('nl-NL'),
                                'Budget Resultaat': '€ ' + parseFloat(Budget).toLocaleString('nl-NL'),
                                'Fase': 'Resultaat project',
                                'Realisatie': '€ ' + parseFloat(Realisatie).toLocaleString('nl-NL'),
                                'bold': true,
                                'plus': false,
                                'visible': true
                            };
                            data.splice(value.valueKey + 2, 0, row);
                        }
                    });

                    $("body").removeClass("loading");
                    var cols = generateColumns(data[0]);
                    var table = new NgTableParams({
                        count: data.length
                    }, {
                        counts: [],
                        filterDelay: 0,
                        dataset: data
                    });

                    cols[10].show = false;
                    cols[11].show = false;
                    cols[12].show = false;
                    cols[13].show = false;

                    return [table, cols];
                } else {
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