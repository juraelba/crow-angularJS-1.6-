define([], function () {

    function forms() {
        return {
            restrict: 'E',
            scope: {
                formUpdate: '=form',
                model: '=model',
                button: '=button'
            },
            controller: function ($scope, $element, $attrs, $location, $routeParams) {
                $scope.save = function () {
                    $scope.project = $attrs.model;
                }
            },
            templateUrl: 'templates/formUpdate.html'
        };
    }

    forms.$inject = [];

    return forms;
});