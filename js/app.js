(function(angular, _) {
    'use strict';

    var app = angular.module('app', ['ngAnimate', 'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: '/templates/start-ctrl.html'
        }).when('/loading', {
            templateUrl: '/templates/loading-ctrl.html'
        }).when('/:slug', {
            templateUrl: '/templates/question-ctrl.html'
        }).otherwise({
            redirectTo: '/'
        });
    }]);

    app.controller('StartCtrl', function($scope, AorP) {
        $scope.state = 'loading';
        $scope.current = {};

        var init = AorP.init();
        init.then(function(state) {
            $scope.state = state;
            $scope.current = AorP.getCurrent();
        }, function(state) {
            $scope.state = state;
        });
    });

    app.controller('QuestionCtrl', function($scope, AorP) {
        $scope.loaded = false;

        var init = AorP.init();
        init.then(function(state) {
            $scope.state = state;
        }, function(state) {
            $scope.state = state;
        });
    });

    app.directive('apLoading', function() {
        return {
            link: function() {console.log('apLoading');},
            templateUrl: '/templates/loading.html'
        };
    });

    app.factory('AorP', ['$http', '$q', function($http, $q) {
        var _loaded = false;
        var _questions = [];
        var _index = 0;

        return {
            init: function(slug) {
                var deferred = $q.defer();

                if (_loaded) {
                    console.log('Already loaded');
                    deferred.resolve('loaded');
                } else {
                    console.log('Loading JSON');
                    $http.get('/data/aorp.json').success(function(questions) {
                        _loaded = true;
                        _questions = _.shuffle(questions);
                        if (slug) {
                            console.log('Setting index from slug');
                            _index = _.findIndex(_questions, { slug: slug }) || 0;
                        }
                        deferred.resolve('loaded');
                    }).error(function(err) {
                        console.log(err);
                        deferred.reject('error');
                    });
                }

                return deferred.promise;
            },
            increment: function() {
                console.log('Incrementing index');
                _index++;

                if (_index >= _questions.length) _index = 0;
            },
            getCurrent: function() {
                console.log('Returning current');
                return _questions[_index];
            },
            getNext: function() {
                console.log('Returning nextt');
                var index = _index + 1;

                if (index >= _questions.length) index = 0;

                return _questions[index];
            }
        };
    }]);
})(window.angular, window._);
