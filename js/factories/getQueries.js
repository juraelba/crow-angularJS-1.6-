define([], function () {

    function getQueries($http, $window, $ngBootbox, $rootScope, env) {
        $ngBootbox.setDefaults({
            backdrop: false
        });

        var bootboxErrorMessage = 'Er is een fout opgetreden, probeer het aub nogmaals, of neem contact op met de applicatiebeheerder';
        var bootboxSuccessMessage = 'Uw gegevens zijn succesvol opgeslagen';

        const postQueriesWithTheSuccessMessage = [
            'putDekking',
            'putMedewerker',
            'postMedewerker',
            'putExploitatie',
            'postExploitatie',
            'postForecastVersie',
            'updateForecastVersie',
            'putInactiveUser',
            'putRoleToUser',
            'putUren',
            'postUren',
            'postProjectMaster',
            'putProjectMaster',
            'postProjectComm',
            'postNieuweVersie',
            'postFaseDetails',
            'putInkoop',
            'postInkoop',
            'putRol',
            'postRol'
        ];

        function showSuccessBootbox(currentQueryName) {
            // if ($rootScope.showedSuccessBootbox !== true) {
            //     angular.forEach(postQueriesWithTheSuccessMessage, function (queryName) {
            //         if (currentQueryName.indexOf(queryName) !== -1) {
            //             $rootScope.showedSuccessBootbox = true;
            //             $ngBootbox.alert(bootboxSuccessMessage).then(function () {
            //                 $rootScope.showedSuccessBootbox = false;
            //             });
            //         }
            //     })
            // }
        }

        function showErrorBootbox() {
            // if ($rootScope.showedErrorBootbox !== true) {
            //     $rootScope.showedSuccessBootbox = true;
            //     $ngBootbox.alert(bootboxErrorMessage).then(function () {
            //         $rootScope.showedErrorBootbox = false;
            //     });
            // }
        }

        var webservice = env.webservice;
        var userInfo = null;

        setUserInfo(true);

        function setUserInfo($force){
            if (typeof $window.sessionStorage["userInfo"] === 'string') {
                if (null === userInfo || $force) {
                    userInfo = JSON.parse($window.sessionStorage["userInfo"]);
                    console.log("sdfsdfs", userInfo)
                }
            }
        }

        var getConnectionStrings = function () {
            setUserInfo(false);

            return $http({
                url: webservice + "/api/ConnectionStrings",
                method: "GET",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token}
            }).then(function (result) {
                if (result.data[0].Name) {
                    return result.data[0].Name;
                } else {
                    delete $window.sessionStorage["userInfo"];
                    return window.location.href = '#!/hours';
                }
            }, function (error) {
                delete $window.sessionStorage["userInfo"];
                return window.location.href = '#!/hours';
            });
        };

        var getConnectionStringByUserInfo = function (userInfoInternal) {
            return $http({
                url: webservice + "/api/ConnectionStrings",
                method: "GET",
                headers: {'Authorization': userInfoInternal.token_type + " " + userInfoInternal.access_token}
            }).then(function (result) {
                if (result.data[0].Name) {
                    return result.data[0].Name;
                } else {
                    return null;
                }
            }, function (error) {
                return null;
            });
        };

        var getProjectDetails = function (connectingString, versionId, nameQuery, param) {
            return $http({
                url: webservice + "/api/factory/execute/" + connectingString + "/" + nameQuery + "?" + param + "=" + versionId,
                method: "GET",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token}
            }).then(function (result) {
                if (!result.data.Success) {
                    showErrorBootbox();
                }
                return result.data.Items;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };

        var getQuery = function (connectingString, nameQuery, params) {
            if(!userInfo.access_token) userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            return $http({
                url: webservice + "/api/factory/execute/" + connectingString + "/" + nameQuery,
                method: "GET",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                params: params
            }).then(function (result) {
                if (!result.data.Success) {
                    showErrorBootbox();
                 }
                return result.data.Items;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };

        var register = function (data) {
            return $http({
                url: webservice + "/api/users",
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                return result;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
                return error;
            });
        };

        var addPost = function (connectingString, queryName, data, prefix = "/api/factory/execute/") {
            return $http({
                url: webservice + prefix + connectingString + "/" + queryName,
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                if (!result.data.Success) {
                    showErrorBootbox();
                } else {
                    showSuccessBootbox(queryName);
                }
                return result;
            }, function (error) {
                console.log('444', queryName)
                console.log(error);
                showErrorBootbox();
            });
        };	
		 

        var addPostHours = function (connectingString, queryName, data) {
            return $http({
                url: webservice + "/api/factory/execute/" + connectingString + "/" + queryName,
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                return result;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };

        var addUserPost = function (queryName, data) {
            return $http({
                url: webservice + "/api/users/" + queryName,
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                return result;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };

        var getApi = function (query) {
            return $http({
                method: 'GET',
                url: webservice + "/api/" + query,
                headers: {
                    'Authorization': userInfo.token_type + " " + userInfo.access_token
                }
            }).then(function (result) {
                return result;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };

        var setPassword = function (data) {
            return $http({
                url: webservice + "/api/accountmanagemnet/AdminChangePassword",
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                return result;
            }, function (error) {
                return error;
                showErrorBootbox();
            });
        };
		
		var sendResetPasswordEmail = function (data) {
			
			var resetPasswordEmailUrl=webservice + "/api/accountmanagemnet/SendForgotPasswordEmail?email="+data.email+"&resetPasswordBaseUrl="+data.resetPasswordBaseUrl;
			console.log(resetPasswordEmailUrl);
			
            return $http({
                url: resetPasswordEmailUrl,
                method: "POST"     
               
            }).then(function (result) {
                if (!result.data.Success) {
                    showErrorBootbox();
                } else {
                    showSuccessBootbox(queryName);
                }
                return result;
            }, function (error) {
                console.log(error);
                showErrorBootbox();
            });
        };
		
        var postQueryWithAuth = function (queryName, data) {
            $("body").addClass("loading");
            return $http({
                url: webservice + queryName,
                method: "POST",
                headers: {'Authorization': userInfo.token_type + " " + userInfo.access_token},
                data: data
            }).then(function (result) {
                $("body").removeClass("loading");
                return result;
            }, function (error) {
                return error;
                // alert(JSON.stringify(error));
            });
        };
        var getDownlaodFile = function (fileId) {
            $("body").addClass("loading");
            return $http({
                url: webservice + "/api/factory/download-file/"+fileId,
                method: "get",
                headers: {
                    'Authorization': userInfo.token_type + " " + userInfo.access_token
                }
            }).then(function (result) {
                window.open(URL, '_blank');
                $("body").removeClass("loading");
                return result;
            }, function (error) {
                return error;
            });
        };

        var postDeleteDoc = function (fileId) {
            $("body").addClass("loading");
            return $http({
                url: webservice + "/api/factory/deleteDocument/"+fileId,
                method: "post",
                headers: {
                    'Authorization': userInfo.token_type + " " + userInfo.access_token
                }
            }).then(function (result) {
                window.open(URL, '_blank');
                $("body").removeClass("loading");
                return result;
            }, function (error) {
                return error;
            });
        };

        var postDeleteFile = function (fileId) {
            $("body").addClass("loading");
            return $http({
                url: webservice + "/api/factory/delete-file/"+fileId,
                method: "post",
                headers: {
                    'Authorization': userInfo.token_type + " " + userInfo.access_token
                }
            }).then(function (result) {
                window.open(URL, '_blank');
                $("body").removeClass("loading");
                return result;
            }, function (error) {
                return error;
            });
        };

        return {
            getConnectionStrings: getConnectionStrings,
            getQuery: getQuery,
            register: register,
            getProjectDetails: getProjectDetails,
            addPost: addPost,
            addPostHours: addPostHours,
            addUserPost: addUserPost,
            getApi: getApi,
            setPassword: setPassword,
            getConnectionStringByUserInfo:getConnectionStringByUserInfo,
            postQueryWithAuth: postQueryWithAuth,
            webservice: webservice,
            sendResetPasswordEmail: sendResetPasswordEmail,
            getDownlaodFile: getDownlaodFile,
            postDeleteDoc: postDeleteDoc,
            postDeleteFile: postDeleteFile
        };
    }

    getQueries.$inject = ['$http', '$window', '$ngBootbox', '$rootScope', 'env'];

    return getQueries;
});