define([], function () {

    function ConsistencyController($scope, auth, $rootScope, getQueries, NgTableParams) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;

        $scope.types = [
            {
                key: 'Kostenuren zonder organisatie',
                value: 'Kostenuren zonder organisatie',
                getFunction: 'getInconsistentieKuOrg',
                count: 0
            },
            {
                key: 'Kostenuren met niet bestaande fase',
                value: 'Kostenuren met niet bestaande fase',
                getFunction: 'getInconsistentieKUNoFase',
                count: 0
            },
            {
                key: 'getInconsistentieKUNoFunc',
                value: 'getInconsistentieKUNoFunc',
                getFunction: 'getInconsistentieKUNoFunc',
                count: 0
            },
            {
                key: 'getInconsistentieKUNoMed',
                value: 'getInconsistentieKUNoMed',
                getFunction: 'getInconsistentieKUNoMed',
                count: 0
            },
            {
                key: 'getExplOpbrOOP',
                value: 'getExplOpbrOOP',
                getFunction: 'getExplOpbrOOP',
                count: 0
            },
            {
                key: 'getOpbrUrenNOKstUren',
                value: 'getOpbrUrenNOKstUren',
                getFunction: 'getOpbrUrenNOKstUren',
                count: 0
            }
        ];

        $scope.data = [];

        function getType(typeKey) {
            return _.where($scope.types, {key: typeKey})[0];
        }

        $scope.init = function () {
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                $scope.type = $scope.types[0]['key'];
            });
        };

        $scope.getCounts = function (typeKey) {
            return getType(typeKey)['count'];
        };

        $scope.fillGrid = function (data) {
            if (data.length > 0) {
                $scope.nonSubmitCols = $scope.generateColumns(data[0]);
                $scope.nonSubmitTableParams = new NgTableParams({
                    page: 1,
                    count: 20
                }, {
                    filterDelay: 0,
                    dataset: data,
                    counts: []
                });

            } else {
                $scope.nonSubmitCols = [];
            }
        };

        $scope.getData = function () {
            $("body").addClass("loading");
            var getFunction = getType($scope.type)['getFunction'];

            if ($scope.connectingString) {
                getQueries.getQuery($scope.connectingString, getFunction)
                    .then(function (response) {
                        $("body").removeClass("loading");
                        $scope.data = response;
                        getType($scope.type)['count'] = response.length;
                        $scope.fillGrid($scope.data);
                    });
            }
        };

        $scope.$watch('type', function (newValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.getData();
            }
        });

        $scope.init();
    }

    ConsistencyController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams"];

    return ConsistencyController;
});