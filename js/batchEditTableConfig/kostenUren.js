define([], function () {

    function kostenUrenConfig() {
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
                field: "Kostprijs tarief",
                title: "Kostprijs tarief",
                filter: {
                    "Kostprijs tarief": "text"
                },
                sortable: "Kostprijs tarief",
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
                field: "Kosten",
                title: "Kosten",
                filter: {
                    "Kosten": "text"
                },
                sortable: "Kosten",
                dataType: "computed",
                typeComputed: "multiplication",
                items: ["Kostprijs tarief", "Aantal uren"],
                disable: true
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

    kostenUrenConfig.$inject = [];

    return kostenUrenConfig;
});