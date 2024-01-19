define([], function () {

    function typeProjectdetail(getQueries, constructTable, constructForm) {

        var init = function (connectingString, pageId, versionId) {
            return getQueries.getQuery(connectingString, "getSection?page=" + pageId + "&section=1").then(function (response) {
                var data = {};
                data.pageSections = response[0];
                if (data.pageSections) {
                    getQueries.getQuery(connectingString, "getFormFields?form=" + data.pageSections.ActionForm).then(function (response) {
                        data.pageForm = constructForm.init(connectingString, response);
                    });
                }
                $("body").removeClass("loading");
                return data;
            });
        };

        return {
            init: init
        };
    }

    typeProjectdetail.$inject = ['getQueries', 'constructTable', 'constructForm'];

    return typeProjectdetail;
});