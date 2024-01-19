define([], function () {

    function opbrengstenUrenConfig() {
        let get = function () {
            return [{
                field: "Omschrijving",
                title: "Omschrijving",
                filter: {
                    "Omschrijving": "text"
                },
                sortable: "Omschrijving",
                dataType: "text",
                disable: true
            }, {
                field: "Medewerker",
                title: "Medewerker",
                filter: {
                    "Medewerker": "text"
                },
                sortable: "Medewerker",
                dataType: "text",
                disable: true
            }, {
                field: "Aantal uren",
                title: "Aantal uren",
                filter: {
                    "Aantal uren": "text"
                },
                sortable: "Aantal uren",
                dataType: "text",
                disable: false
            }, {
                field: "Tarief",
                title: "Tarief",
                filter: {
                    "Tarief": "text"
                },
                sortable: "Tarief",
                dataType: "text",
                disable: true
            }, {
                field: "Opbrengst",
                title: "Opbrengst",
                filter: {
                    "Opbrengst": "text"
                },
                sortable: "Opbrengst",
                dataType: "computed",
                typeComputed: "multiplication",
                items: ["Tarief", "Aantal uren"],
                disable: false
            }, {
                field: "action",
                title: "",
                dataType: "command"
            }]
        };

        return {
            get: get
        };
    }

    opbrengstenUrenConfig.$inject = [];

    return opbrengstenUrenConfig;
});