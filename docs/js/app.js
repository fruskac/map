'use strict';

(function (angular, document) {

  angular.module('app', [
    'ui.bootstrap'
  ]);

  angular.module('app').controller('AppCtrl', function($scope) {

    document.getElementById('map').onload = function () {
      window.FruskacMap = document.getElementById('map').contentWindow.FruskacMap;
      FruskacMap.ready(function () {
        $scope.$apply(function () {
          $scope.data = FruskacMap.getData();
        })
      });
    }

  });

})(angular, document);