(function () {
    'use strict';
    var app = angular.module('app');
    app.controller('homesController', ['$scope', '_', 'persistenceService', 'offline', function ($scope, _, persistenceService, offline) {
        $scope.showList = false;
        var getData = function () {
            persistenceService.action.getAll().then(function (homes) {
                $scope.homes = homes;
                $scope.showList = true;
                $scope.showEmptyListMessage = (homes.length == 0);
            }, function (error) {
                $scope.error = error;
            });
        };
        var lazyGetData = _.debounce(getData, 50);
        offline.on('confirmed-down', lazyGetData);
        offline.on('confirmed-up', lazyGetData);
        lazyGetData();
        $scope.delete = function(index)
        {
            var id = $scope.homes[index].id;
            persistenceService.action.delete(id).then(function(result)
            {
                $scope.homes.splice(index, 1);
            }, function (error) {
                $scope.error = error;

            });
        }
    }]);
}());
