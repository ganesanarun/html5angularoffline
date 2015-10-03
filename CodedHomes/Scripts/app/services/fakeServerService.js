/*
    https://gist.github.com/craigshoemaker/1d4ee6105b8d0fdae0d2
    ** ATTENTION ***

    The code found herein is not for instructional purposes,
    but rather to mock the existince of a server to the client
    application.

    The implemenation found here allows the application to 
    intercept REST calls to the server and read and write
    data to the browser's localStorage in order to give the 
    illusion of having a persistence mechanism available 
    on the server.

    The advantage of an approach like this is that the code
    on the client remains completely unaffected by the fake 
    server implementation - which may be removed at any time.

*/
(function () {

    'use strict';

    var app = angular.module('app');

    app.service('fakeServerService',

            ['_', 'localStorage', 'nullHome',
    function (_, localStorage, nullHome) {

        var svc = {

            data: [],

            key: 'codedHomes.data',

            serializeData: function () {
                localStorage[svc.key] = JSON.stringify(svc.data);
            },

            deserializeData: function (data) {
                svc.data = JSON.parse(data);
            },

            init: function () {

                var data = localStorage[svc.key];

                var generateSeedData = function () {

                    var getRandomNumber = function (min, max) {
                        return parseInt(Math.random() * (max - min) + min);
                    };

                    var addresses = [
                        "3020 Allen Avenue",
                        "127 Brockton Street",
                        "90219 The Standard Court",
                        "1897 Manzanares Drive",
                        "2000 Linden Avenue",
                        "45 Wall Parkway",
                        "3489 Peachtree Lane",
                        "872 Hopkins Drive",
                        "3929 Mayhew Canyon Road",
                        "4545 Sugarplum Trail"
                    ];

                    var notes = [
                        "On a safe cul-de-cac with pleasant neighbors",
                        "Has a jacuzzi!",
                        "Very nice yard",
                        "Huge lot",
                        "Next to great schools and a bike trail",
                        "Freeway accessible",
                        "Three car garage",
                        "Close-knit block",
                        "Swimming pool with a diving board",
                        "Includes furniture and appliances"
                    ];

                    var
                        counter = 0,
                        homes = [];

                    for (var i = 0; i < 10; i++) {

                        counter++;

                        if (counter > 3) {
                            counter = 1;
                        }

                        var date = new Date();

                        homes[homes.length] = {
                            streetAddress: addresses[i],
                            city: 'Anytown',
                            zipCode: 90210,
                            imageName: counter + '.jpg',
                            price: getRandomNumber(220000, 345000),
                            bedrooms: getRandomNumber(3, 4),
                            bathrooms: getRandomNumber(2, 3),
                            squareFeet: getRandomNumber(1500, 2400),
                            notes: notes[i],
                            insertDate: date,
                            modifiedDate: date,
                            id: uuid.v4()
                        };
                    }

                    return homes;
                };

                if (data != undefined) {
                    svc.deserializeData(data);
                }

                if (svc.data.length === 0) {
                    svc.data = generateSeedData();
                    svc.serializeData();
                }
            },

            save: function (home) {

                var isNew = svc.getById(home.id).id === nullHome.id;

                if (isNew) {
                    svc.insert(home);
                } else {
                    svc.update(home);
                }
            },

            insert: function (home) {

                if (!_.isObject(home)) throw new Error('A home object is required to do an insert.');

                if (home.id === null) {
                    home.id = Math.uuidCompact();
                }

                var date = new Date();

                if (!home.insertDate) {
                    home.insertDate = date;
                }

                if (!home.modifiedDate) {
                    home.modifiedDate = date;
                }

                svc.data.unshift(home);
                svc.serializeData();
            },

            update: function (home) {

                if (!_.isObject(home)) throw new Error('A home object is required to do an update.');

                var index = svc.data.length;
                var currentHome;

                while (index--) {

                    if (index >= 0) {

                        currentHome = svc.data[index];

                        if (currentHome &&
                            currentHome.id === home.id &&
                            (new Date(currentHome.modifiedDate)) < home.modifiedDate) {
                            svc.data[index] = home;
                        }
                    }
                }

                svc.serializeData();

            },

            getById: function (id) {

                var returnValue = nullHome;

                svc.data.forEach(function (home) {
                    if (home.id === id) {
                        returnValue = home;
                    }
                });

                return returnValue;
            },

            'delete': function (id) {
                var lengthOfUUID = 36;

                if (id.length != lengthOfUUID) throw new Error('A valid UUID value is required as an ID.');

                var
                    len = svc.data.length,
                    index;

                while (len--) {
                    index = len - 1;
                    if (svc.data[index] && svc.data[index].id === id) {
                        svc.data.splice(index, 1);
                    }
                }

                svc.serializeData();
            }
        };

        svc.init();

        return {
            data: svc.data,
            insert: svc.insert,
            'delete': svc.delete,
            update: svc.update,
            save: svc.save,
            getById: svc.getById
        };

    }]);

    app.config(

                ['$provide',
        function ($provide) {
            $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
        }]);

    app.run(
                ['$httpBackend', 'fakeServerService', '$timeout',
        function ($httpBackend, fakeServerService, $timeout) {

            var apiRegex = /\/api\/homes\//;

            $httpBackend.whenGET('/api/homes').respond(fakeServerService.data);

            $httpBackend.whenPOST('/api/homes').respond(function (method, uri, data) {
                var data = angular.fromJson(data);

                if (!_.isArray(data)) {
                    data = [data];
                }

                data.forEach(function (home) {
                    home.modifiedDate = new Date();
                    fakeServerService.save(home);
                });


                return [200, { success: true }];
            });

            $httpBackend.whenDELETE(apiRegex).respond(function (method, uri, data) {

                var
                    parts = uri.split('/'),
                    id = parts[parts.length - 1];

                fakeServerService.delete(id);

                return [200, { success: true }];
            });

            $httpBackend.whenGET(apiRegex).respond(function (method, uri, data) {

                var
                    parts = uri.split('/'),
                    id = parts[parts.length - 1],
                    home = fakeServerService.getById(id);

                return [200, home];
            });

        }]);
}());