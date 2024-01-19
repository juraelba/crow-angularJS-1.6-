define([], function () {

    function constructFormTab(getQueries, $rootScope) {

        var init = function (connectingString, form, versionId, faseId, projectId) {
            angular.forEach(form, function (value, key) {
                var nameVersion = 'versieid';
                if (value.Fieldtype == "singleselect" || value.Fieldtype == "multiselect") {
                    if(value.GetFunction === 'getFases'){
                        value.options = $rootScope.fases;
                        if (value.options.length === undefined) {
                            value.options = [];
                        }

                        if (_.where(value.options, {'key': 'total'}).length === 0){
                            value.options.push({'key': 'total', 'value': 'Project totaal'});
                        }

                    }else {
                        getQueries.getProjectDetails(connectingString, versionId, value.GetFunction, "versieid").then(function (response) {
                            value.options = response;
                        });
                    }
                } else {
                    if (value.GetFunction) {
                        getQueries.getQuery(connectingString, value.GetFunction + "?faseId="
                            + faseId + "&projectid=" + projectId + "&"+nameVersion+"=" + versionId + '&year=' + $rootScope.year).then(function (response) {
                            if (response[0]) {
                                value.option = response[0][Object.keys(response[0])[0]];
                                if(value.Fieldname == 'totaleKostenProject' || value.Fieldname == 'totaleKostenFase' ||
                                    value.Fieldname == 'totaleOpbrengstenFase' || value.Fieldname == 'totaleOpbrengstenProject' ||
                                    value.Fieldname == 'totaleResultaatFase' || value.Fieldname == 'totaleResultaatProject' ||
                                    value.Fieldname == 'resultaat'){
                                        value.option = '€ ' + parseInt(value.option).toLocaleString('nl-NL');
                                }
                            }
                        });
                    }
                }
            });
            return form;
        };

        return {
            init: init
        };
    }

    constructFormTab.$inject = ["getQueries", "$rootScope"];

    return constructFormTab;
});