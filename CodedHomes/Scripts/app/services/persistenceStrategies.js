(function () {
    'use strict';
    var app = angular.module('app');
    app.factory('remotePersistenceStrategy',
        ['$http', '$q',
        function ($http, $q) {
            var svc = {
                save: function (home) {
                    var deferred = $q.defer();
                    $http.post('/api/homes', home).success(deferred.resolve).error(deferred.reject);
                    return deferred.promise;
                },
                getAll: function () {
                    var deferred = $q.defer();
                    $http.get('/api/homes').success(deferred.resolve).error(deferred.reject);
                    return deferred.promise;
                },
                getById: function (id) {
                    var deferred = $q.defer();
                    $http.get('/api/homes/' + id).success(deferred.resolve).error(deferred.reject);
                    return deferred.promise;
                },
                'delete': function (id) {
                    var deferred = $q.defer();
                    $http.delete('/api/homes/' + i).success(deferred.resolve).error(deferred.reject);
                    return deferred.promise;
                }
            };
            return svc;
        }]);

    app.factory('localPersistenceStrategy',
        ['$q', 'localDBService', 'nullHome', 'dbModel',
        function ($q, localDBService, nullHome, dbModel) {
            var svc = {
                dbModel: dbModel,
                localDBService: localDBService,
                getById: function (id) {
                    var deferred = $q.defer();
                    localDBService.open(svc.dbModel).then(function () {
                        localDBService.getById(svc.dbModel.objectStoreName, id).then(deferred.resolve, deferred.reject);
                    }, deferred.reject);
                    return deferred.promise;
                },
                exists: function (id) {
                    var deferred = $q.defer();
                    svc.getById(id).then(function (home) {
                        deferred.resolve(home.id == id);
                    }, deferred.reject);
                    return deferred.promise;
                },
                save: function (home) {
                    var deferred = $q.defer();
                    localDBService.open(svc.dbModel).then(function (e) {
                        var id = home.id;
                        if(id === null || id === undefined)
                        {
                            localDBService.insert(svc.dbModel.objectStoreName, home, 'id').then(deferred.resolve, deferred.reject);
                        } else {
                            svc.exists(id).then(function (doesExist) {
                                if(doesExist)
                                {
                                    localDBService.update(svc.dbModel.objectStoreName, home, id).then(deferred.resolve, deferred.reject);
                                } else {
                                    localDBService.insert(svc.dbModel.objectStoreName, home, 'id').then(deferred.resolve, deferred.reject);
                                }
                            }, deferred.reject);
                        }

                    }, deferred.reject);
                    return deferred.promise;
                },
                getAll: function () {
                    var deferred = $q.defer();
                    localDBService.open(svc.dbModel).then(function () {
                        localDBService.getAll(svc.dbModel.objectStoreName).then(deferred.resolve, deferred.reject);
                    }, deferred.reject);
                    return deferred.promise;
                },
                'delete': function (id) {
                    var deferred = $q.defer();
                    localDBService.open(svc.dbModel).then(function () {
                        localDBService.delete(svc.dbModel.objectStoreName, id).then(deferred.resolve, deferred.reject);
                    }, deferred.reject);
                }
            };
            return svc;
        }]);
}());