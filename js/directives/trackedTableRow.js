define([], function () {

    function trackedTableRow() {
        return {
            restrict: "A",
            priority: -1,
            require: ["^trackedTable", "ngForm"],
            controller: function ($attrs, $element, $parse, $scope) {
                let self = this;
                let row = $parse($attrs.trackedTableRow)($scope);
                let rowFormCtrl = $element.controller("form");
                let trackedTableCtrl = $element.controller("trackedTable");

                self.isCellDirty = isCellDirty;
                self.setCellDirty = setCellDirty;
                self.setCellInvalid = setCellInvalid;

                function isCellDirty(cell) {
                    return trackedTableCtrl.isCellDirty(row, cell);
                }

                function setCellDirty(cell, isDirty) {
                    trackedTableCtrl.setCellDirty(row, cell, isDirty)
                }

                function setCellInvalid(cell, isInvalid) {
                    trackedTableCtrl.setCellInvalid(row, cell, isInvalid)
                }
            }
        };
    }

    trackedTableRow.$inject = [];

    return trackedTableRow;
});