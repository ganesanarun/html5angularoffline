(function () {
    'use strict';
    var app = angular.module('app');
    app.service('localDBService', ['$q', 'indexedDB', function ($q, indexedDB) {
        var _error = {
            setErrorHandlers: function (request, errorHandler) {
                if (typeof request !== 'undefined') {
                    if ('onerror' in request) request.onerror = errorHandler;
                    if ('onblocked' in request) request.onblocked = errorHandler;
                    if ('onabort' in request) request.onabort = errorHandler;
                }
            }
        };
        var _db = {
            instance: null,
            transactionTypes: {
                readonly: 'readonly',
                readwrite: 'readwrite'
            },
            open: function (databaseModel) { 
                var deferred = $q.defer();
                var request = indexedDB.open(databaseModel.name, databaseModel.version);
                _error.setErrorHandlers(request, deferred.reject);
                request.onupgradeneeded = databaseModel.upgrade;
                request.onsuccess = function (e) {
                    _db.instance = e.target.result;
                    _error.setErrorHandlers(_db.instance, deferred.reject);
                    deferred.resolve();
                };
                return deferred.promise;        
            },
            requireOpenDB: function (objectStoreName, deferred) {
                if (_db.instance == null)
                    deferred.reject("You cannot use an object store when the database is not open. Store name: " + objectStoreName);
            },
            getObjectStore: function (objectStroreName, mode) {
                var mode = mode || _db.transactionTypes.readonly;
                var txn = _db.instance.transaction(objectStroreName, mode);
                var store = txn.objectStore(objectStroreName);
                return store;
            },
            requireObjectStoreName: function (objectStoreName, deferred) {
                if (typeof objectStoreName === 'undefined' || !objectStoreName || objectStoreName.Length === 0)
                    deferred.reject("An object store name is required");
            },
            getCount: function (objectStoreName) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName, _db.transactionTypes.readonly);
                var request = store.count();
                var count;
                request.onsuccess = function (e) {
                    count = e.target.result;
                    deferred.resolve(count);
                }
                return deferred.promise;
            },
            getAll: function (objectStoreName) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName);
                var cursor = store.openCursor();
                var data = [];
                cursor.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result && result !== null) {
                        data.push(result.value);
                        result.continue();
                    } else {
                        deferred.resolve(data);
                    }
                }
                return deferred.promise;
            },
            insert: function (objectStoreName, data, keyName) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName, _db.transactionTypes.readwrite);
                var request;
                var date = new Date();
                data.insertDate = date;
                data.modifiedDate = date;
                if (!data[keyName]) {
                    data[keyName] = uuid.v4();
                }
                request = store.add(data);
                request.onsuccess = function () {
                    deferred.resolve(data);
                }
                return deferred.promise;
            },
            'delete': function (objectStoreName, key) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName, _db.transactionTypes.readwrite);
                var request = store.delete(key);
                request.onsuccess = deferred.resolve();
                return deferred.promise;
            },
            update: function (objectStoreName, data, key) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName, _db.transactionTypes.readwrite);
                var getRequest = store.get(key);
                var updateRequest;
                getRequest.onsuccess = function (e) {
                    var origData = e.target.result;
                    if (origData !== undefined) {
                        data.insertDate = origData.insertDate;
                        data.modifiedDate = new Date();
                        updateRequest = store.put(data);
                        updateRequest.onsuccess = function (e) {
                            deferred.resolve(data, e);
                        }
                    }
                }
                return deferred.promise;
            },
            getById: function (objectStoreName, key) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName);
                var request = store.get(key);
                request.onsuccess = deferred.resolve;
                return deferred.promise;
            },
            clear: function (objectStoreName) {
                var deferred = $q.defer();
                _db.requireObjectStoreName(objectStoreName, deferred);
                _db.requireOpenDB(objectStoreName, deferred);
                var store = _db.getObjectStore(objectStoreName, _db.transactionTypes.readwrite);
                var request = store.clear();
                request.onsuccess = deferred.resolve;
                return deferred.promise;
            }
        };
        return {
            open: _db.open,
            getAll: _db.getAll,
            insert: _db.insert,
            'delete': _db.delete,
            update: _db.update,
            getById: _db.getById,
            getCount: _db.getCount,
            clear: _db.clear
        };

    }]);

}());