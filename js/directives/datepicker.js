define([], function () {

    function datePicker($rootScope) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, elem, attrs, ngModelCtrl) {
                // var dateFormat = $rootScope.dateFormat;
                // dateFormat = dateFormat === undefined ? "dd-mm-yy" : dateFormat;
                //
                // console.log(dateFormat, attrs.options, '213');

                var updateModel = function (dateText) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(dateText);
                    });
                };

                var options = {
                    dateFormat: "dd-mm-yy",
                    firstDay: 1,
                    showWeek: true,
                    onSelect: function (dateText) {
                        updateModel(dateText);
                    }
                };
                elem.datepicker(options);
            }
        }
    }

    datePicker.$inject = ['$rootScope'];

    return datePicker;

});