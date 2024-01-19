define([], function () {

    function filteredListService() {

        var searched = function (valLists, toSearch) {
            return _.filter(valLists,

                function (i) {
                    return searchUtil(i, toSearch);
                });
        };

        return {
            searched: searched
        };
    }

    function searchUtil(item, toSearch) {
        var filtered = false;
        toSearch = toSearch.toLowerCase();
        angular.forEach(item, function (value) {
            if ((value + '').toLowerCase().indexOf(toSearch) > -1) filtered = true;
        });
        return filtered;
    }

    filteredListService.$inject = [];

    return filteredListService;
});