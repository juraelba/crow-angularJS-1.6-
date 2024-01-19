define([], function () {

    function batcheditable() {
        return {
            restrict: "E",
            scope: {
                data: '=data',
                cols: '=cols',
                saveCtrlFn: '&saveFn',
            },
            controller: function ($attrs, $element, $parse, $scope, NgTableParams) {

                $scope.batchEditable = {};
                let originalData = angular.copy($scope.data);

                $scope.batchEditable.cols = $scope.cols;

                $scope.batchEditable.tableParams = new NgTableParams({}, {
                    dataset: angular.copy($scope.data)
                });

                $scope.batchEditable.deleteCount = 0;

                $scope.batchEditable.add = add;
                $scope.batchEditable.cancelChanges = cancelChanges;
                $scope.batchEditable.del = del;
                $scope.batchEditable.hasChanges = hasChanges;
                $scope.batchEditable.saveChanges = saveChanges;
                $scope.batchEditable.getComputed = getComputed;

                //////////

                function add() {
                    $scope.batchEditable.isEditing = true;
                    $scope.batchEditable.isAdding = true;
                    $scope.batchEditable.tableParams.settings().dataset.unshift({});
                    // we need to ensure the user sees the new row we've just added.
                    // it seems a poor but reliable choice to remove sorting and move them to the first page
                    // where we know that our new item was added to
                    $scope.batchEditable.tableParams.sorting({});
                    $scope.batchEditable.tableParams.page(1);
                    $scope.batchEditable.tableParams.reload();
                }

                function cancelChanges() {
                    resetTableStatus();
                    let currentPage = $scope.batchEditable.tableParams.page();
                    $scope.batchEditable.tableParams.settings({
                        dataset: angular.copy(originalData)
                    });
                    // keep the user on the current page when we can
                    if (!$scope.batchEditable.isAdding) {
                        $scope.batchEditable.tableParams.page(currentPage);
                    }
                }

                function del(row) {
                    $scope.batchEditable.tableParams.settings().dataset = _.reject($scope.batchEditable.tableParams.settings().dataset, function (item) {
                        return row === item;
                    });
                    $scope.batchEditable.deleteCount++;
                    $scope.batchEditable.tableTracker.untrack(row);
                    $scope.batchEditable.tableParams.reload().then(function (data) {
                        if (data.length === 0 && $scope.batchEditable.tableParams.total() > 0) {
                            $scope.batchEditable.tableParams.page($scope.batchEditable.tableParams.page() - 1);
                            $scope.batchEditable.tableParams.reload();
                        }
                    });
                }

                function hasChanges() {
                    return $scope.batchEditable.tableForm.$dirty || $scope.batchEditable.deleteCount > 0
                }

                function resetTableStatus() {
                    $scope.batchEditable.isEditing = false;
                    $scope.batchEditable.isAdding = false;
                    $scope.batchEditable.deleteCount = 0;
                    $scope.batchEditable.tableTracker.reset();
                    $scope.batchEditable.tableForm.$setPristine();
                }

                function saveChanges() {
                    resetTableStatus();
                    let currentPage = $scope.batchEditable.tableParams.page();
                    originalData = angular.copy($scope.batchEditable.tableParams.settings().dataset);
                    $scope.saveCtrlFn({data: originalData});
                }

                function getComputed(col, row) {
                    let result;
                    switch (col.typeComputed) {
                        case 'multiplication':
                            result = 1;
                            angular.forEach(col.items, function (item) {
                                result = result * toNumber(row[item]);
                            });
                            break;
                        case 'percentage':
                            let kosten = row[col.items[1] || 0] || 0,
                                marge = row[col.items[0] || 0] || 0;
                            result = parseInt(toNumber(kosten)) +
                                (parseFloat(toNumber(marge)) *
                                    parseInt(toNumber(kosten)) / 100);
                            break;
                        default:
                            result = 0;
                    }
                    if (isNaN(result)) return 0;
                    return '€ ' + parseFloat(result).toLocaleString('nl-NL');
                }

                function toNumber(value) {
                    return parseInt((value + '').replace('€ ', '').replace(' %', '').replace('.', '').replace(',', '.'));
                }
            },
            templateUrl: 'templates/batcheditable.html'
        };
    }

    batcheditable.$inject = [];

    return batcheditable;
});