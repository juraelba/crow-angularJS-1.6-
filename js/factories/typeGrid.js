define([], function () {

    function typeGrid(getQueries, constructTable, constructForm, helpers) {

        var init = function (connectingString, pageId, userInfo) {
            return getQueries.getQuery(connectingString, "getPageGrid?PageId=" + pageId).then(function (response) {
                var data = {};
                if (response[0]) {
                    data.pageDetails = response[0];
                    if (data.pageDetails) {
                        constructTable.fromQuery(connectingString, "&username=" + userInfo.userName, data.pageDetails.GetFunction, "").then(function (response) {
                            var table = response;
                            data.pageTable = table[0];
                            data.pageTableCols = table[1];
                            data.pageTableCols = helpers.mapColumns(data.pageTableCols,
                                [
                                    'Projectcode',
                                    'Projectnaam',
                                    'Team',
                                    'Type',
                                    'Projectmanager',
                                    'Projectstatus'
                                ]);

                            data.allItems = table[2];
                        });
                        getQueries.getQuery(connectingString, "getFormFields?form=" + data.pageDetails.NewForm).then(function (response) {
                            data.pageForm = constructForm.init(connectingString, response);
                        });
                        getQueries.getQuery(connectingString, "getActions?type=submit&form=" + data.pageDetails.NewForm).then(function (response) {
                            data.pageActions = response;
                        });
                    }
                    $("body").removeClass("loading");
                }
                return data;
            });
        };

        return {
            init: init
        };
    }

    typeGrid.$inject = ['getQueries', 'constructTable', 'constructForm', 'helpers'];

    return typeGrid;
});