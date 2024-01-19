define([], function () {

    function trackedTableCell() {
        return {
            restrict: "A",
            priority: -1,
            scope: true,
            require: ["^trackedTableRow", "ngForm"],
            controller: function ($attrs, $element, $scope) {
                let self = this;
                let cellFormCtrl = $element.controller("form");
                let cellName = cellFormCtrl.$name;
                let trackedTableRowCtrl = $element.controller("trackedTableRow");

                if (trackedTableRowCtrl.isCellDirty(cellName)) {
                    cellFormCtrl.$setDirty();
                } else {
                    cellFormCtrl.$setPristine();
                }
                // note: we don't have to force setting validaty as angular will run validations
                // when we page back to a row that contains invalid data

                $scope.$watch(function () {
                    return cellFormCtrl.$dirty;
                }, function (newValue, oldValue) {
                    if (newValue === oldValue) return;

                    trackedTableRowCtrl.setCellDirty(cellName, newValue);
                });

                $scope.$watch(function () {
                    return cellFormCtrl.$invalid;
                }, function (newValue, oldValue) {
                    if (newValue === oldValue) return;

                    trackedTableRowCtrl.setCellInvalid(cellName, newValue);
                });
            }
        };
    }

    trackedTableCell.$inject = [];

    return trackedTableCell;
});