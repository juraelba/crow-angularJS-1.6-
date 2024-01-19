define(['angular'], function (angular) {

    function helpers(authenticationSvc) {

        const getIdByFieldName = function (record, fieldName) {
            var id = 0;
            var count = 0;

            angular.forEach(record, function (value, key) {
                if (key.toLowerCase() === fieldName.toLowerCase()) {
                    id = count;
                }
                count++;
            });

            return id;
        };

        const hideColumns = function (cols, names) {
            if (_.isArray(cols)) {
                cols.map(function (col) {
                    col.show = !(_.isArray(names) && names.indexOf(col.field) !== -1);
                });
            }
            return cols;
        };

        const mapColumns = function (cols, mappedFields) {
            var columns = [];

            if (_.isArray(cols) && _.isArray(mappedFields)) {
                mappedFields.map(function (field) {
                    var col = _.where(cols, {'field': field})[0];

                    if (col !== undefined) {
                        columns.push(col);
                    } else {
                        var filter = {};
                        filter[field] = 'text';
                        columns.push({
                            title: field,
                            sortable: field,
                            filter: filter,
                            show: true,
                            field: field
                        });
                    }
                })
            }

            return columns;
        };

        const userHasRole = function (roles) {
            var roleName = authenticationSvc.getUserInfo().roleName;
            return roles.indexOf(roleName) !== -1;
        };

        const changeNameColumn = function (data, from, to) {
            if (_.isArray(data)) {
                data.map(function (item) {
                    item[to] = item[from];
                    delete item[from];
                });
            }
            return data;
        };

        function round(value, decimals) {
            value = getNumber(value);
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }

        function getNumber (value) {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : value;
            return value;
        }


        return {
            getIdByFieldName: getIdByFieldName,
            userHasRole: userHasRole,
            hideColumns: hideColumns,
            mapColumns: mapColumns,
            round: round,
            getNumber:getNumber,
            changeNameColumn: changeNameColumn
        };
    }

    helpers.$inject = ["authenticationSvc"];

    return helpers;
});