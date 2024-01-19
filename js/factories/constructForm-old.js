define([], function () {

    function constructForm(getQueries) {

        var init = function (connectingString, form, versionId, faseId, projectId) {
            angular.forEach(form, function (value, key) {
                if (value.Veldtype == "singleselect" || value.Veldtype == "multiselect") {
                    getQueries.getProjectDetails(connectingString, versionId, value.FunctieGet, "versieid").then(function (response) {
                        value.options = response;
                    });
                } else {
                    if (value.FunctieGet) {
                        getQueries.getProjectDetails(connectingString, value.GetParameters == "faseId" ? faseId : projectId, value.FunctieGet, value.GetParameters).then(function (response) {
                            if (response[0]) {
                                value.option = response[0][Object.keys(response[0])[0]];
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

    constructForm.$inject = ["getQueries"];

    return constructForm;
});