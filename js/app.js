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

            if (state === 'loaded') {
                angular.element('#footer').addClass('show');
            }
        }, function(state) {
            $scope.state = state;
        });
    });

    app.controller('QuestionCtrl', function($scope, $routeParams, Image, Question, Score) {
        $scope.loaded = false;
        $scope.correct = 'unknown';
        $scope.current = {};
        $scope.next = {};
        $scope.image = {};
        $scope.score = Score.get();

        var init = Question.init($routeParams.slug);
        init.then(function(state) {
            $scope.state = state;
            
            $scope.image = Image.getCurrent();
            Image.increment();

            $scope.current = Question.getCurrent();
            $scope.next = Question.getNext();
            Question.increment();

            if (state === 'loaded') {
                angular.element('#footer').addClass('show');
            }
        }, function(state) {
            $scope.state = state;
        });

        $scope.select = function(selection) {
            if (selection === $scope.current.answer) {
                $scope.correct = 'yes';
                Score.incrementRight();
            } else {
                $scope.correct = 'no';
                Score.incrementWrong();
            }
            $scope.score = Score.get();
            $scope.$broadcast('play', $scope.correct);
        };
    });

    app.directive('apAudio', function() {
        return {
            scope: {
                correct: '@'
            },
            link: function(scope, element, attrs) {
                var audio = angular.element('<audio/>');
                var source = angular.element('<source/>');

                source.attr('type', 'audio/mpeg');
                source.attr('src', 'audio/' + scope.correct + '.mp3');

                audio.append(source);
                element.append(audio);

                scope.$on('play', function(evt, correct) {
                    if (correct === scope.correct) {
                        audio[0].play();
                    }
                });
            }
        };
    });

    app.directive('apLoading', function() {
        return {
            template:
                '<div id="loading">' +
                  '<div class="agency-or-porn-logo"></div>' +
                '</div>'
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
                    if (slug) {
                        _index = _.findIndex(_questions, { slug: slug }) || _index;
                    }
                    deferred.resolve('loaded');
                } else {
                    $http.get('data/aorp.json').success(function(questions) {
                        _loaded = true;
                        _questions = _.shuffle(questions);
                        if (slug) {
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
                _index++;

                if (_index >= _questions.length) _index = 0;
            },
            getCurrent: function() {
                return _questions[_index];
            },
            getNext: function() {
                var index = _index + 1;

                if (index >= _questions.length) index = 0;

                return _questions[index];
            }
        };
    }]);

    app.factory('Image', [function() {
        var _index = 0;
        var _length = 5;
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

    app.factory('Score', [function() {
        var _right = 0;
        var _wrong = 0;

        return {
            incrementRight: function() {
                _right++;
            },
            incrementWrong: function() {
                _wrong++;
            },
            get: function() {
                return {
                    right: (_right < 10) ? '0' + _right : _right.toString(),
                    wrong: (_wrong < 10) ? '0' + _wrong : _wrong.toString()
                };
            }
        };
    }]);
})(window.angular, window._);
