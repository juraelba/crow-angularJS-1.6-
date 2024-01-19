define([], function () {

    function constructForm(getQueries, getFromWebService) {

        var init = function (connectingString, form) {
            angular.forEach(form, function (value, key) {
                if (value.Fieldtype == "singleselect" || value.Fieldtype == "multiselect") {
                    if (value.GetFunction) {
                        // if(value.webserviceurl){
                        //     getFromWebService.getUserToken(value.webserviceurl).then(function (response) {
                        //         var user = response;
                        //         getFromWebService.getConnectionStrings(value.webserviceurl, user).then(function (response) {
                        //             var connectString = response;
                        //             getFromWebService.getQuery(value.webserviceurl, user, connectString, value.GetFunction).then(function (response) {
                        //                 value.options = response;
                        //             });
                        //         });
                        //     });
                        // }else {

                        getQueries.getQuery(connectingString, value.GetFunction).then(function (response) {
                            value.options = response;
                        });
                        // }
                    }
                }
            });
            return form;
        };

        return {
            init: init
        };
    }

    constructForm.$inject = ["getQueries", "getFromWebService"];

    return constructForm;
});