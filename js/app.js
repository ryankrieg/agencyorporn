(function(angular, _) {
    'use strict';

    var app = angular.module('app', ['ngAnimate', 'ngRoute']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'templates/start-ctrl.html'
        }).when('/loading', {
            templateUrl: 'templates/loading-ctrl.html'
        }).when('/:slug', {
            templateUrl: 'templates/question-ctrl.html'
        }).otherwise({
            redirectTo: '/'
        });
    }]);

    app.controller('StartCtrl', function($scope, Question) {
        $scope.state = 'loading';
        $scope.current = {};

        var init = Question.init();
        init.then(function(state) {
            $scope.state = state;
            $scope.current = Question.getCurrent();
        }, function(state) {
            $scope.state = state;
        });
    });

    app.controller('QuestionCtrl', function($scope, $routeParams, Image, Question) {
        $scope.loaded = false;
        $scope.correct = 'unknown';
        $scope.current = {};
        $scope.next = {};
        $scope.image = {};

        var init = Question.init($routeParams.slug);
        init.then(function(state) {
            $scope.state = state;
            
            $scope.image = Image.getCurrent();
            Image.increment();

            $scope.current = Question.getCurrent();
            $scope.next = Question.getNext();
            Question.increment();
        }, function(state) {
            $scope.state = state;
        });

        $scope.select = function(selection) {
            $scope.correct = (selection === $scope.current.answer) ? 'yes' : 'no';
        };
    });

    app.directive('apLoading', function() {
        return {
            templateUrl: 'templates/loading.html'
        };
    });

    app.factory('Question', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
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
                    $http.get('data/aorp.json').success(function(questions) {
                        _loaded = true;
                        _questions = _.shuffle(questions);
                        if (slug) {
                            console.log('Setting index from slug');
                            _index = _.findIndex(_questions, { slug: slug }) || 0;
                        }
                        $timeout(function() {
                            deferred.resolve('loaded');
                        }, 1500);
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
                console.log('Returning next');
                var index = _index + 1;

                if (index >= _questions.length) index = 0;

                return _questions[index];
            }
        };
    }]);

    app.factory('Image', [function() {
        var _index = 0;
        var _length = 2;
        var _as = _.shuffle(_.range(_length));
        var _ps = _.shuffle(_.range(_length));

        return {
            increment: function() {
                _index++;

                if (_index >= _length) _index = 0;
            },
            getCurrent: function() {
                return {
                    a: 'img/a-' + _as[_index] + '.jpg',
                    p: 'img/p-' + _ps[_index] + '.jpg'
                };
            }
        };
    }]);
})(window.angular, window._);
