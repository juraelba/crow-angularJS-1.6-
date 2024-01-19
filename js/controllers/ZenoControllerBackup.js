define(['moment'], function (moment) {

    function ZenoController($scope, auth, $rootScope, getQueries, NgTableParams, $timeout, Flash, angularSoap) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $rootScope.rootUser = auth;
        $scope.mode = 'test';
        $scope.selectedAdmin = null;

        $scope.administration = [];
        $scope.changedDebtors = [];
        $scope.datum = new Date();

        $scope.$watch('mode', function (newValue, oldValue) {
            $scope.administration = [];
            $scope.changedDebtors = [];
            $scope.buildTable([]);

            $scope.fillAdministration();
        });

        $scope.$watch('selectedAdmin', function (newValue, oldValue) {
            if ($scope.selectedAdmin !== null) {
                $scope.fillChangedDebtors(newValue, moment($scope.datum).format('YYYY-MM-DD'));
            }
        });

        $scope.$watch('datum', function (newValue, oldValue) {
            if ($scope.selectedAdmin !== null) {
                $scope.fillChangedDebtors(newValue, moment($scope.datum).format('YYYY-MM-DD'));
            }
        });

        $scope.fillAdministration = function () {
            $scope.administration = [];

            if ($scope.mode !== 'test') {
                var requestUrl = "https://zenowebservice-accept.crow.nl/GWS12xdev/CrowApi?doc#Operations-getAdministrations";
                var requestBody = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:crow=\"http://crowapi.socho.nl\">\n" +
                    "<soapenv:Header>\n" +
                    "<crow:authentication>\n" +
                    "<username>QUERYFACTORY</username>\n" +
                    "<password>Welkom01!</password>\n" +
                    "</crow:authentication>\n" +
                    "</soapenv:Header>\n" +
                    "<soapenv:Body>\n" +
                    "<crow:getAdministrationsRequest/>\n" +
                    "</soapenv:Body>\n" +
                    "</soapenv:Envelope>";

                angularSoap.post(
                    requestUrl,
                    requestBody)
                    .then(function(requestResult) {
                        requestResult = angularSoap.xmlToJson(requestResult);
                        $scope.administration = angularSoap.normalizeResult(requestResult["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns:getAdministrationsResponse"]["administrations"].administration);
                    })
                    .catch(function(error) {
                        alert(error);
                    });
            } else {
                $scope.administration = $scope.mocks.administration();
            }
        };


        $scope.fillChangedDebtors = function (admin, date) {
            console.log('changed');
            if ($scope.mode !== 'test') {
                var requestUrl = "https://zenowebservice-accept.crow.nl/GWS12xdev/CrowApi?doc#Operations-getNewOrChangedDebtors";
                var requestBody = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:crow=\"http://crowapi.socho.nl\">\n" +
                    "<soapenv:Header>\n" +
                    "<crow:authentication>\n" +
                    "<username>QUERYFACTORY</username>\n" +
                    "<password>Welkom01!</password>\n" +
                    "</crow:authentication>\n" +
                    "</soapenv:Header>\n" +
                    "<soapenv:Body>\n" +
                    "<crow:getNewOrChangedDebtorsRequest>\n" +
                    "<administration>" + admin + "</administration>\n" +
                    "<since>" + date + "</since>\n" +
                    "</crow:getNewOrChangedDebtorsRequest>\n" +
                    "</soapenv:Body>\n" +
                    "</soapenv:Envelope>";

                angularSoap.post(
                    requestUrl,
                    requestBody)
                    .then(function(requestResult) {
                        requestResult = angularSoap.xmlToJson(requestResult);
                        $scope.changedDebtors = angularSoap.normalizeResult(requestResult["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns:getNewOrChangedDebtorsResponse"]['debtors'].debtorRec);

                        $scope.buildTable($scope.changedDebtors);
                    })
                    .catch(function() {
                        alert(error);
                    });
            } else {
                $scope.changedDebtors = $scope.mocks.changedDebtors();
                $scope.buildTable($scope.changedDebtors);
            }
        };

        $scope.mocks = {
            'administration':function () {
                var requestResult = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns=\"http://crowapi.socho.nl\"\n" +
                    "                   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
                    "    <SOAP-ENV:Header>\n" +
                    "        <ns:uuid>fef5d558-c15d-4de9-b9ef-a676d5ba3455</ns:uuid>\n" +
                    "    </SOAP-ENV:Header>\n" +
                    "    <SOAP-ENV:Body>\n" +
                    "        <ns:getAdministrationsResponse>\n" +
                    "            <administrations>\n" +
                    "                <administration>\n" +
                    "                    <code>MVL44444</code>\n" +
                    "                    <name>Testadministratie</name>\n" +
                    "                    <isFck>false</isFck>\n" +
                    "                </administration>\n" +
                    "                <administration>\n" +
                    "                    <code>MVL44445</code>\n" +
                    "                    <name>Testadministratie FCK</name>\n" +
                    "                    <isFck>true</isFck>\n" +
                    "                </administration>\n" +
                    "            </administrations>\n" +
                    "        </ns:getAdministrationsResponse>\n" +
                    "    </SOAP-ENV:Body>\n" +
                    "</SOAP-ENV:Envelope>";

                var dp = new DOMParser();
                requestResult = dp.parseFromString(requestResult, "text/xml");
                requestResult = angularSoap.xmlToJson(requestResult);
                requestResult = angularSoap.normalizeResult(requestResult["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns:getAdministrationsResponse"]["administrations"].administration);
                return requestResult;
            },
            'changedDebtors':function () {
                var requestResult = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns=\"http://crowapi.socho.nl\"\n" +
                    "                   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
                    "    <SOAP-ENV:Header>\n" +
                    "        <ns:uuid>883acabf-4c1b-485f-847b-c93d3b454d3e</ns:uuid>\n" +
                    "    </SOAP-ENV:Header>\n" +
                    "    <SOAP-ENV:Body>\n" +
                    "        <ns:getNewOrChangedDebtorsResponse>\n" +
                    "            <debtors>\n" +
                    "                <debtorRec>\n" +
                    "                    <zenoRelationNumber>1</zenoRelationNumber>\n" +
                    "                    <customerId>F70541</customerId>\n" +
                    "                    <shortName>SOCHO IT</shortName>\n" +
                    "                    <name>Socho IT bv</name>\n" +
                    "                    <street2>Huizermaatweg 586</street2>\n" +
                    "                    <zipcode>1276 LN</zipcode>\n" +
                    "                    <city>HUIZEN</city>\n" +
                    "                    <telephone>035 672 06 21</telephone>\n" +
                    "                    <fax>035 672 06 22</fax>\n" +
                    "                    <chargeVatType>2</chargeVatType>\n" +
                    "                    <customerGroup>Debiteuren</customerGroup>\n" +
                    "                    <paymentCondition>30 dagen netto</paymentCondition>\n" +
                    "                    <creditLimit>0</creditLimit>\n" +
                    "                    <rebate>0</rebate>\n" +
                    "                    <dunForPayment>true</dunForPayment>\n" +
                    "                </debtorRec>\n" +
                    "            </debtors>\n" +
                    "        </ns:getNewOrChangedDebtorsResponse>\n" +
                    "    </SOAP-ENV:Body>\n" +
                    "</SOAP-ENV:Envelope>";

                var dp = new DOMParser();
                requestResult = dp.parseFromString(requestResult, "text/xml");
                requestResult = angularSoap.xmlToJson(requestResult);
                requestResult = angularSoap.normalizeResult(requestResult["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns:getNewOrChangedDebtorsResponse"]['debtors'].debtorRec);
                return requestResult;
            }
        };

        $scope.buildTable = function (data) {
            if (data.length > 0) {
                $scope.cols = $scope.generateColumns(data[0]);
                $scope.cols[0].show = false;
                $scope.tableParams = new NgTableParams({
                    page: 1,
                    count: data.length
                }, {
                    filterDelay: 0,
                    dataset: data,
                    counts: []
                });
            } else {
                $scope.tableParams = new NgTableParams({}, {
                    dataset: [],
                    counts: []
                });
            }
        };

    }

    ZenoController.$inject = ["$scope", "auth", "$rootScope", "getQueries", "NgTableParams", "$timeout", "Flash", "angularSoap"];

    return ZenoController;
});