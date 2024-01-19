define([], function () {

    function constructTab(getQueries, constructTable, constructFormTab) {

        var init = function (connectingString, projectTab, versionId, faseId, projectId, constructionData) {
            $("body").addClass("loading");
            var data = {};
            let constructionProject = [];
            if (projectTab.FormulierMain) {
                constructionProject = [];
                constructionProject = constructionData.filter(item => item.FormulierMain === projectTab.FormulierMain);
                if(!constructionProject[0]){
                    getQueries.getQuery(connectingString, "getFormFields?form=" + projectTab.FormulierMain).then(function (response) {
                        data.mainformdata = response;
                        data.mainForm = constructFormTab.init(connectingString, response, versionId, faseId, projectId);
                    });
                }else{
                        data.mainForm = constructFormTab.init(connectingString, constructionProject[0].construction.mainformdata, versionId, faseId, projectId);
                        data.mainForm = constructionProject[0].construction.mainForm;
                }
            }
            if (projectTab.FunctieGetGrid) {
                var parameter = '';
                if (projectTab.getGridParameters == 'faseid') {
                    parameter = faseId;
                } else {
                    parameter = versionId;
                }
                
                constructTable.fromQuery(connectingString, parameter, projectTab.FunctieGetGrid, projectTab.getGridParameters, projectTab.medewerkers, projectTab.deelcollectieven, projectTab.financiers).then(function (response) {
                    var result = response;
                    data.grid = {};
                    data.grid.table = result[0];
                    data.grid.tableCols = result[1];
                    if (projectTab.FormulierGrid) {
                        constructionProject = [];
                        constructionProject = constructionData.filter(item => item.FormulierGrid === projectTab.FormulierGrid);
                        if(!constructionProject[0]){
                            getQueries.getQuery(connectingString, "getFormFields?form=" + projectTab.FormulierGrid).then(function (response) {
                                data.grid.formdata = response;
                                data.grid.form = constructFormTab.init(connectingString, response, versionId, faseId, projectId);
                            });
                        }else{
                            if(constructionProject[0].construction){
                                let form = constructionProject[0].construction.grid;
                                data.grid.form = constructFormTab.init(connectingString, form.formdata, versionId, faseId, projectId);
                                data.grid.form = form.form;
                            }
                        }
                    }
                    $('table tbody tr:first-child td.plusRow').each(function() {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('plusRow');
                    });
                    $('table tbody tr:first-child td.pullRight').each(function() {
                        var td = $(this),
                            index  = td.index();
                        td.closest('table').find('thead tr th:eq('+index+')').addClass('pullRight');
                    });
                    $('table tbody tr:first-child td.editRow:first-child').each(function() {
                        var td = $(this);
                        td.closest('table').find('thead tr').prepend('<th></th>');
                        td.removeClass('editRow');
                    });
                    $("body").removeClass("loading");
                });
            }
            return data;

            // - Name - название вкладки
            // - Label -> текст для отображения на вкладке
            // - FormulierMain -> форма в верхней части вкладки
            // - FunctieGetGrid -> грид под формой
            // - FormulierGrid -> форма для создания новой и редактирования существующей строки в гриде
            // - Parent ->родительский грид, как сейчас сделано для uren в opbrengsten
            // - getGridParameters -> параметры для FunctieGetGrid, пока можно закостылить
        };

        return {
            init: init
        };
    }

    constructTab.$inject = ["getQueries", "constructTable", "constructFormTab"];

    return constructTab;
});