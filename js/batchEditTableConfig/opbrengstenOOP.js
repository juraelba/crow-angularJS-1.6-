define([], function () {

    function opbrengstenOOPConfig() {
        let get = function () {
            return [{
                field: "Inkoop",
                title: "Inkoop",
                filter: {
                    "Inkoop": "text"
                },
                sortable: "Inkoop",
                dataType: "text",
                disable: true
            }, {
                field: "Kosten ",
                title: "Kosten ",
                filter: {
                    "Kosten ": "text"
                },
                sortable: "Kosten ",
                dataType: "text",
                disable: false
            }, {
                field: "Marge ",
                title: "Marge ",
                filter: {
                    "Marge ": "text"
                },
                sortable: "Marge ",
                dataType: "text",
                disable: false
            }, {
                field: "Opbrengst ",
                title: "Opbrengst ",
                filter: {
                    "Opbrengst ": "text"
                },
                sortable: "Opbrengst ",
                dataType: "computed",
                typeComputed: "percentage",
                items: ["Marge ", "Kosten "],
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

    opbrengstenOOPConfig.$inject = [];

    return opbrengstenOOPConfig;
});