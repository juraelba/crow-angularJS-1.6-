define([], function () {

    function chosen() {
        var linker = function ($scope, $element, $attrs) {
            var list = $attrs['chosen'];

            $scope.$watch(list, function () {
                if ($element.trigger !== undefined) {
                    $element.trigger('chosen:updated');
                }
            });

            $scope.$watch($attrs['ngModel'], function () {
                if ($element.trigger !== undefined) {
                    $element.trigger('chosen:updated');
                }
            });
        };

        return {
            restrict: 'A',
            link: linker
        };
    }

    chosen.$inject = [];

    return chosen;

});