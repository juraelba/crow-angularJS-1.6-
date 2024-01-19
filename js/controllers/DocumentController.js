define(['moment'], function (moment) {

    function DocumentController($scope, NgTableParams, auth, getQueries, $rootScope, filteredListService, $http, env) {
        $scope.userInfo = auth;
        $scope.connectingString = null;
        $scope.register = [];
        $rootScope.rootUser = auth;
        $scope.allItems = [];
        $scope.search = '';
        $scope.roles = [];
        $scope.currentRole = [];
        $scope.collapsed = true;
        $scope.row = {};
        $scope.file = {};
        $scope.formSelectsData = {
            projects: [],
            documentTypes: [],
            years: [
                2018,
                2019,
                2020,
                2021,
                2022,
                2023,
                2024,
                2025
            ],
            relations: [],
            employees: [],
        };

        $scope.init = function () {
            $("body").addClass("loading");
            getQueries.getConnectionStrings().then(function (response) {
                $scope.connectingString = response;
                getQueries.getQuery($scope.connectingString, "getDocuments").then(function (response) {
                    var data = response;
                    $scope.data = response;
                    if (data.length > 0) {
                        angular.forEach(data, function (item) {
                            item.UploadDatum = item.UploadDatum ? moment(item.UploadDatum).format("DD-MM-YYYY") : "";
                        });
                        $scope.cols = $scope.generateColumns(data[0]);
                        $scope.tableParams = new NgTableParams({
                            page: 1,
                            count: 10
                        }, {
                            filterDelay: 0,
                            dataset: data
                        });
                        // $scope.cols[0].show = false;
                    }
                    $("body").removeClass("loading");
                });
                getQueries.getQuery($scope.connectingString, `getDocumentProjectDropdown?username=${$scope.userInfo.userName}`).then(function (response) {
                    $scope.formSelectsData.projects = response;
                });

                getQueries.getQuery($scope.connectingString, "getDocumentTypeDropdown").then(function (response) {
                    $scope.formSelectsData.documentTypes = response;
                });

                getQueries.getQuery($scope.connectingString, "getDebiteurenDropdown").then(function (response) {
                    $scope.formSelectsData.relations = response;
                });

                getQueries.getQuery($scope.connectingString, "getMedewerkerDropdown").then(function (response) {
                    $scope.formSelectsData.employees = response;
                });
            });
        };

        $scope.remove = function (row) {
            getQueries
                .addPost($scope.connectingString, 'deleteActiviteiten',
                    {
                        'id': row.key
                    }
                )
                .then(function (response) {
                    $scope.init();
                });
        };

        $scope.handleFileInput = function (files) {
            $scope.file = files.item(0);
        };

        $scope.createEdit = function (row = {
            file: null,
            documentType: null,
            relation: null,
            name: null,
        }) {
            $scope.row = row;
            $('#edit-create-modal').show();
        };

        $scope.saveForm = function () {
            const data = new FormData();
            data.append('file', $scope.file);
            // data.append('projectids', '');
            // data.append('documenttypeids', '');
            // data.append('years', '');
            // data.append('relationids', '');
            // data.append('employeeids', '');
            // if ($scope.row.filterprojectCode){ 
            //     data.projectids = $scope.row.filterprojectCode.map(item => item.key).join(",");
            // }
            // if ($scope.row.filterdocumentType) {
            //     data.documenttypeids = $scope.row.filterdocumentType.key;
            // }
            // if ($scope.row.filteryear) {
            //     data.years = $scope.row.filteryear.join(",");
            // }
            // if ($scope.row.filteremployee){ 
            //     data.employeeids = $scope.row.filteremployee.map(item => item.key).join(",");
            // }
            $http({
                url: env.webservice + "/api/factory/upload-file",
                method: "POST",
                data: data,
                headers: {
                    'Authorization': $scope.userInfo.token_type + " " + $scope.userInfo.access_token,
                    'Content-Type': undefined,
                }
            }).then(function (result) {
                let data = [];
                if($scope.row.relation){
                    data = {
                        filestorageid: result.data.Id,
                        documenttypeid: $scope.row.documentType.key,
                        relatieid: '',
                        naam: $scope.row.name
                    };
                }else{
                    data = {
                        filestorageid: result.data.Id,
                        documenttypeid: $scope.row.documentType.key,
                        relatieid: '',
                        naam: $scope.row.name
                    };
                }
                getQueries.addPost($scope.connectingString, 'postDocuments', data).then(function (response) {
                    if($scope.row.projectCode){
                        if($scope.row.projectCode.length){
                            $scope.row.projectCode.map((item) => {
                                data = {
                                    documentid: response.data.NewId,
                                    projectid: item.key,
                                };
                                getQueries.addPost($scope.connectingString, 'postDocumentProjects', data).then(function (response) {
                                });
                            });
                        }
                    }
                    if($scope.row.year){
                        if($scope.row.year.length){
                            $scope.row.year.map((item) => {
                                data = {
                                    documentid: response.data.NewId,
                                    boekjaar: item,
                                };
                                getQueries.addPost($scope.connectingString, 'postDocumentBoekjaren', data).then(function (response) {
                                });
                            });
                        }
                    }
                    if($scope.row.employee){
                        if($scope.row.employee.length){
                            $scope.row.employee.map((item) => {
                                data = {
                                    documentid: response.data.NewId,
                                    medewerkerid: item.key,
                                };
                                getQueries.addPost($scope.connectingString, 'postDocumentMedewerkers', data).then(function (response) {
                                });
                            });
                        }
                    }
                    if($scope.row.relation){
                        if($scope.row.relation.length){
                            $scope.row.relation.map((item) => {
                                data = {
                                    documentid: response.data.NewId,
                                    relatieid: item.key,
                                };
                                getQueries.addPost($scope.connectingString, 'postDocumentRelaties', data).then(function (response) {
                                });
                            });
                        }
                    }
                    $scope.init();
                    $('#edit-create-modal').hide();
                });
            }, function (error) {
                console.dir(error);
            });
        };

        $scope.getDocfile = function (fileId) {
            getQueries.getDownlaodFile(fileId).then(function (response) {
                if (response.data.Success) {
                    $scope.init();
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.deleteDocfile = function (fileId) {
            getQueries.postDeleteDoc(fileId).then(function (response) {
                if (response.data.Success) {
                    getQueries.postDeleteFile(fileId).then(function (response) {
                        if(response.data.Success){
                            $scope.init();
                        } else {
                            $scope.row.error = response.data.ErrorMessage;
                        }
                    })
                } else {
                    $scope.row.error = response.data.ErrorMessage;
                }
            });
        };

        $scope.getFilterByProjects = function () {
            let documentDataArray = [];
            let isFiltered = false;
            let requestData = {
                projectids: '',
                documenttypeids: '',
                years: '',
                relationids: '',
                employeeids: ''
            };
            if ($scope.row.filterprojectCode){ 
                requestData.projectids = $scope.row.filterprojectCode.map(item => item.key).join(", ");
                isFiltered = true;
            }
            if ($scope.row.filterdocumentType) {
                requestData.documenttypeids = $scope.row.filterdocumentType.key;
                isFiltered = true;
            }
            if ($scope.row.filteryear) {
                requestData.years = $scope.row.filteryear.join(", ");
                isFiltered = true;
            }
            if ($scope.row.filteremployee){ 
                requestData.employeeids = $scope.row.filteremployee.map(item => item.key).join(", ");
                isFiltered = true;
            }

            if (isFiltered) {
                getQueries.addPost($scope.connectingString, 'getDocumentsFiltered', requestData).then(function (response) {
                    if(response.data.Items[0]){
                        documentDataArray=documentDataArray.concat(response.data.Items)
                    }
                    var data = documentDataArray;
                    if (data.length > 0) {
                        $scope.cols = $scope.generateColumns(data[0]);
                        $scope.tableParams = new NgTableParams({
                            page: 1,
                            count: 10
                        }, {
                            filterDelay: 0,
                            dataset: data
                        });
                        $scope.cols[0].show = false;
                    }
                });
            } else {
                getQueries.getQuery($scope.connectingString, "getDocuments").then(function (response) {
                    $scope.allItems = response.map((item) => {
                        return {
                            document: item.Document,
                            documentType: item.DocumentType,
                            fileId: item.FileStorageId
                        }
                    });
                });
            }
            
        };

        $scope.init();
    }

    DocumentController.$inject = ["$scope", "NgTableParams", "auth", "getQueries", "$rootScope", "filteredListService", "$http", 'env'];

    return DocumentController;
});