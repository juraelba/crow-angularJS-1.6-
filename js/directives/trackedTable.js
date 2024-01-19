define([], function () {

    function trackedTable() {
        return {
            restrict: "A",
            priority: -1,
            require: "ngForm",
            controller: function ($scope, $parse, $attrs, $element) {
                let self = this;
                let tableForm = $element.controller("form");
                let dirtyCellsByRow = [];
                let invalidCellsByRow = [];

                init();

                ////////

                function init() {
                    let setter = $parse($attrs.trackedTable).assign;
                    setter($scope, self);
                    $scope.$on("$destroy", function () {
                        setter(null);
                    });

                    self.reset = reset;
                    self.isCellDirty = isCellDirty;
                    self.setCellDirty = setCellDirty;
                    self.setCellInvalid = setCellInvalid;
                    self.untrack = untrack;
                }

                function getCellsForRow(row, cellsByRow) {
                    return _.find(cellsByRow, function (entry) {
                        return entry.row === row;
                    })
                }

                function isCellDirty(row, cell) {
                    let rowCells = getCellsForRow(row, dirtyCellsByRow);
                    return rowCells && rowCells.cells.indexOf(cell) !== -1;
                }

                function reset() {
                    dirtyCellsByRow = [];
                    invalidCellsByRow = [];
                    setInvalid(false);
                }

                function setCellDirty(row, cell, isDirty) {
                    setCellStatus(row, cell, isDirty, dirtyCellsByRow);
                }

                function setCellInvalid(row, cell, isInvalid) {
                    invalidCellsByRow = setCellStatus(row, cell, isInvalid, invalidCellsByRow);
                    setInvalid(invalidCellsByRow.length > 0);
                }

                function setCellStatus(row, cell, value, cellsByRow) {
                    let rowCells = getCellsForRow(row, cellsByRow);
                    if (!rowCells && !value) {
                        return;
                    }

                    if (value) {
                        if (!rowCells) {
                            rowCells = {
                                row: row,
                                cells: []
                            };
                            cellsByRow.push(rowCells);
                        }
                        if (rowCells.cells.indexOf(cell) === -1) {
                            rowCells.cells.push(cell);
                        }
                    } else {
                        rowCells.cells = _.reject(rowCells.cells, function (item) {
                            return cell === item;
                        });
                        if (rowCells.cells.length === 0) {
                            cellsByRow =_.reject(cellsByRow, function (item) {
                                return rowCells === item;
                            });
                        }
                    }
                    return cellsByRow;
                }

                function setInvalid(isInvalid) {
                    self.$invalid = isInvalid;
                    self.$valid = !isInvalid;
                }

                function untrack(row) {
                    invalidCellsByRow = _.reject(invalidCellsByRow, function (item) {
                        return item.row === row;
                    });
                    dirtyCellsByRow = _.reject(dirtyCellsByRow, function (item) {
                        return item.row === row;
                    });
                    setInvalid(invalidCellsByRow.length > 0);
                }
            }
        };
    }

    trackedTable.$inject = [];

    return trackedTable;
});