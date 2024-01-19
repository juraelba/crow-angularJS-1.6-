define([], function () {

    function kostenOOPConfig() {
        let get = function (inkoops, leveranciers) {
            return [{
                field: "Bedrag ",
                title: "Bedrag ",
                filter: {
                    "Bedrag ": "text"
                },
                sortable: "Bedrag ",
                dataType: "text",
                disable: true
            }, {
                field: "Inkoop",
                title: "Inkoop",
                filter: {
                    Inkoop: "text"
                },
                sortable: "Inkoop",
                dataType: "select",
                data: inkoops,
                disable: true
            }, {
                field: "Leverancier",
                title: "Leverancier",
                filter: {
                    Leverancier: "text"
                },
                sortable: "Leverancier",
                dataType: "selectChosen",
                data: leveranciers,
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

    kostenOOPConfig.$inject = [];

    return kostenOOPConfig;
});