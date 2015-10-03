window.indexedDB = window.indexedDB || window.msIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
angular.module('app', ['ngResource']).config(

        ['$provide',
    function ($provide) {
        $provide.constant('indexedDB', window.indexedDB);
        $provide.constant('_', window._);
        $provide.constant('localStorage', window.localStorage);
        $provide.constant('offline', window.Offline);
        $provide.value('nullHome', {
            id: '',
            insertDate: new Date(-8640000000000000),
            modifiedDate: new Date(-8640000000000000)
        });
        $provide.value('dbModel', {
            name: 'codedHomes',
            version: '1',
            instance: null,
            objectStoreName: 'homes',
            keyName: 'id',
            upgrade: function (e) {
                var db = e.target.result;
                if(!db.objectStoreNames.contains('homes'))
                {
                    db.createObjectStore('homes', {
                        keyPath: 'id'
                    });
                }
            }

        });
    }]);