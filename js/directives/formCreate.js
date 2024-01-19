define([], function () {

    function forms() {
        return {
            restrict: 'E',
            scope: {
                formCreate: '=form',
                model: '=model'
            },
            controller: function ($scope, $element, $attrs, $location, $routeParams) {
                $scope.save = function () {
                    $scope.model = $attrs.model;
                }
            },
            templateUrl: 'templates/formCreate.html'
        };
    }

    forms.$inject = [];

    return forms;
});