define(['angular'], function (angular) {

    function constructTotalResults(getQueries) {

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

                // console.log(response);

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
                    });

                    allLines.push({
                        'Begroting': '€ ' + totalBegroting.toLocaleString('nl-NL'),
                        'Realisatie': '€ ' + totalRealisatie.toLocaleString('nl-NL'),
                        'Budget Resultaat': '€ ' + totalBudget.toLocaleString('nl-NL'),

                        'BegrotingClean': totalBegroting,
                        'Budget ResultaatClean': totalBudget,
                        'RealisatieClean': totalRealisatie,
                    });

                    $body.removeClass("loading");
                    return allLines;
                } else {
                    $body.removeClass("loading");
                    return [];
                }
            });
        };

        return {
            fromQuery: fromQuery
        };
    }

    constructTotalResults.$inject = ['getQueries'];

    return constructTotalResults;
});