/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _data = __webpack_require__(1);
	
	var _data2 = _interopRequireDefault(_data);
	
	var _grid = __webpack_require__(3);
	
	var _grid2 = _interopRequireDefault(_grid);
	
	var _words = __webpack_require__(9);
	
	var _cell = __webpack_require__(10);
	
	var _cell2 = _interopRequireDefault(_cell);
	
	var _randomJs = __webpack_require__(11);
	
	var _randomJs2 = _interopRequireDefault(_randomJs);
	
	var _BJSpell = __webpack_require__(12);
	
	var _fr_FR = __webpack_require__(13);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	_BJSpell.BJSpell.fr_FR = _fr_FR.fr_FR;
	/* eslint-enable camelcase */
	
	/* eslint-disable camelcase */
	var spellChecker = (0, _BJSpell.BJSpell)('fr_FR.js');
	
	var size = Object.freeze({ w: 4, h: 4 });
	
	var r = (0, _randomJs2.default)();
	var values = r.sample(_data2.default.distribution, size.w * size.h);
	
	var QUALIFIERS_TABLE = [['ld', 'lt'], ['ld', 'ld', 'lt', 'wd'], ['ld', 'lt', 'lt', 'wd', 'wd', 'wt']];
	
	var currentTour = 2;
	var qualifiers = QUALIFIERS_TABLE[currentTour];
	var qualifierPopulation = Array.from({ length: values.length }, function (_, i) {
	  return i;
	});
	var qualifiersIndices = r.sample(qualifierPopulation, qualifiers.length);
	
	function findLetterInfos(letter, row, column) {
	  var letterIndex = row * size.w + column;
	  var qualifierIndex = qualifiersIndices.indexOf(letterIndex);
	  var qualifier = '';
	  if (qualifierIndex >= 0) {
	    qualifier = qualifiers[qualifierIndex];
	  }
	  return { letter: letter, row: row, column: column, score: _data2.default.scores[letter], qualifier: qualifier };
	}
	
	function cellRenderer(letter, row, column) {
	  return (0, _cell2.default)(findLetterInfos(letter, row, column));
	}
	
	function newState() {
	  return {
	    foundWords: new Set(),
	    totalScore: 0,
	    currentWord: '',
	    currentLetters: []
	  };
	}
	
	var dealState = newState();
	
	var gridElt = document.querySelector('.grid');
	var grid = new _grid2.default(size, values, gridElt, cellRenderer);
	
	var currentWordElt = document.querySelector('.current-word');
	var totalScoreElt = document.querySelector('.total-score');
	var restartElt = document.querySelector('.restart-button');
	restartElt.addEventListener('click', function () {
	  grid.render();
	  dealState = newState();
	});
	
	function updateCurrentWord(newValue) {
	  dealState.currentWord = newValue;
	  currentWordElt.textContent = newValue;
	  currentWordElt.classList.remove('incorrect', 'correct');
	}
	
	grid.on('letter', function (info) {
	  updateCurrentWord(dealState.currentWord + info.letter);
	  dealState.currentLetters.push(info);
	});
	
	function calculateScore() {
	  var letters = dealState.currentLetters.map(function (info) {
	    var letter = info.letter;
	    var row = info.row;
	    var column = info.column;
	
	    return findLetterInfos(letter, row, column);
	  });
	
	  var globalQualifiers = letters.filter(function (info) {
	    return info.qualifier.startsWith('w');
	  }).map(function (info) {
	    return info.qualifier;
	  });
	
	  var score = letters.reduce(function (score, info) {
	    var letterScore = info.score;
	    switch (info.qualifier) {
	      case 'ld':
	        console.log('lettre compte double:', info.letter);
	        letterScore *= 2;
	        break;
	      case 'lt':
	        console.log('lettre compte triple:', info.letter);
	        letterScore *= 3;
	        break;
	      default:
	      // nothing to do
	    }
	
	    return score + letterScore;
	  }, 0);
	
	  return globalQualifiers.reduce(function (score, qualifier) {
	    switch (qualifier) {
	      case 'wd':
	        console.log('mot compte double');
	        return score * 2;
	      case 'wt':
	        console.log('mot compte triple');
	        return score * 3;
	      default:
	        return score;
	    }
	  }, score);
	}
	
	grid.on('word', function () {
	  var combinations = (0, _words.findCombinations)(dealState.currentWord);
	  var correctWord = combinations.find(function (combination) {
	    return !dealState.foundWords.has(combination) && spellChecker.check(combination);
	  });
	
	  if (correctWord) {
	    dealState.foundWords.add(correctWord);
	    var score = calculateScore();
	    updateCurrentWord(correctWord + ' (' + score + ')');
	    dealState.totalScore += score;
	    totalScoreElt.textContent = dealState.totalScore;
	    currentWordElt.classList.add('correct');
	  } else {
	    currentWordElt.classList.add('incorrect');
	  }
	  dealState.currentWord = '';
	  dealState.currentLetters = [];
	});
	grid.render();
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/woggle.js.map


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _develop = __webpack_require__(2);
	
	var data = Object.freeze({
	  scores: Object.freeze((0, _develop.developScores)({
	    1: 'eainorstul',
	    2: 'dmg',
	    3: 'bcp',
	    4: 'fhv',
	    8: 'jq',
	    10: 'kwxyz'
	  })),
	  distribution: (0, _develop.developDistribution)('15e9a8i6n6o6r6s6t6u5l3d3m2g2b2c2p2f2h2vjqkwxyz')
	});
	
	exports.default = data;
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/data.fr.js.map


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.developDistribution = developDistribution;
	exports.developScores = developScores;
	var re = /(\d*)([a-z])/ig;
	var DEFAULT_COUNT = 1;
	
	function developDistribution(str) {
	  var parsed = void 0;
	  var result = '';
	  while ((parsed = re.exec(str)) !== null) {
	    var _parsed = parsed;
	
	    var _parsed2 = _slicedToArray(_parsed, 3);
	
	    var count = _parsed2[1];
	    var letter = _parsed2[2];
	
	    result += letter.repeat(count || DEFAULT_COUNT);
	  }
	
	  return result;
	}
	
	function developScores(scores) {
	  return Object.keys(scores).reduce(function (result, score) {
	    var letters = scores[score];
	    letters.split('').forEach(function (letter) {
	      if (result[letter]) {
	        throw new Error('Letter \'' + letter + '\' is specified twice.');
	      }
	
	      result[letter] = +score;
	    });
	
	    return result;
	  }, {});
	}
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/develop.js.map


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = Grid;
	
	var _grid = __webpack_require__(4);
	
	var _grid2 = _interopRequireDefault(_grid);
	
	var _event_dispatcher = __webpack_require__(6);
	
	var _domClosest = __webpack_require__(7);
	
	var _domClosest2 = _interopRequireDefault(_domClosest);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// import matches from 'dom-matches';
	
	/**
	 * @param {{w: Number, h: Number}} size Size of the grid (cell count)
	 * @param {Array.Number} values Array of values to use in this cell. Its length
	 * needs to be w * h.
	 * @param {Node} node Element where the grid will render
	 * @param {Function} cellRenderer a function that takes 2 arguments: the node to
	 * render to, the value to render
	 * @returns {Grid} New object Grid
	 */
	function Grid(size, values, node, cellRenderer) {
	  if (values.length !== size.w * size.h) {
	    throw new Error('values.length must equal size.w * size.h\n      (' + values.length + ' != ' + size.w + ' * ' + size.h + ')');
	  }
	
	  if (!(node instanceof Element)) {
	    throw new Error('node must be an Element');
	  }
	
	  if (typeof cellRenderer !== 'function') {
	    throw new Error('cellRenderer must be a function');
	  }
	
	  this.size = size;
	  this.values = values;
	  this.cellRenderer = cellRenderer;
	  this.node = node;
	  this.currentMove = [];
	  this.grid = null;
	  this.blocked = false;
	
	  _event_dispatcher.EventDispatcher.mixin(this, ['letter', 'word']);
	
	  Object.seal(this);
	
	  this.attachEventListeners();
	}
	
	Grid.prototype = {
	  attachEventListeners: function attachEventListeners() {
	    this.node.addEventListener('mousedown', this);
	    this.node.addEventListener('touchstart', this);
	  },
	  handleEvent: function handleEvent(e) {
	    switch (e.type) {
	      case 'mousedown':
	      case 'touchstart':
	        this.onMousedown(e);
	        break;
	      case 'mouseup':
	      case 'mouseleave':
	      case 'touchend':
	      case 'touchcancel':
	        this.onMouseup(e);
	        break;
	      case 'mousemove':
	      case 'touchmove':
	        this.onMousemove(e);
	        break;
	      default:
	        console.error('Event ' + e.type + ' is unexpected.');
	    }
	  },
	  onMousedown: function onMousedown(e) {
	    if (!e.target.classList.contains('letter__inner')) {
	      return;
	    }
	
	    e.preventDefault();
	
	    if (this.currentMove.length) {
	      // don't start a new move if one is already happening
	      // (should handle multitouch)
	      return;
	    }
	
	    this.blocked = false;
	    this.addNewLetterFromTarget(e.target);
	
	    console.log(e.type, e.target);
	    this.node.setCapture && this.node.setCapture( /* retargetToElement */false);
	    this.node.addEventListener('mousemove', this);
	    this.node.addEventListener('touchmove', this);
	    this.node.addEventListener('mouseup', this);
	    this.node.addEventListener('touchend', this);
	    this.node.addEventListener('touchcancel', this);
	    this.node.addEventListener('mouseleave', this);
	  },
	  onMouseup: function onMouseup(e) {
	    if (e.touches && e.touches.length) {
	      // don't stop the move if we still have some touch
	      return;
	    }
	
	    this.node.removeEventListener('mousemove', this);
	    this.node.removeEventListener('touchmove', this);
	    this.node.removeEventListener('mouseup', this);
	    this.node.removeEventListener('touchend', this);
	    this.node.removeEventListener('touchcancel', this);
	    this.node.removeEventListener('mouseleave', this);
	
	    var parents = this.currentMove.map(function (inner) {
	      return (0, _domClosest2.default)(inner, '[data-letter]');
	    });
	
	    parents.forEach(function (letterElt) {
	      return letterElt.classList.remove('letter_active');
	    });
	
	    var word = parents.map(function (letterElt) {
	      return letterElt.dataset.letter;
	    }).join('');
	
	    this.emit('word', word);
	    this.currentMove.length = 0;
	    this.blocked = false;
	  },
	  elementFromTouches: function elementFromTouches(touches) {
	    var target = null;
	    if (touches.length) {
	      var touch = touches[0];
	      target = document.elementFromPoint(touch.pageX, touch.pageY);
	    }
	    return target;
	  },
	  onMousemove: function onMousemove(e) {
	    e.preventDefault();
	
	    var target = e.target;
	    if (e.touches) {
	      target = this.elementFromTouches(e.touches);
	      if (!target) {
	        return;
	      }
	    }
	
	    if (!target.classList.contains('letter__inner')) {
	      return;
	    }
	
	    var index = this.currentMove.lastIndexOf(target);
	    var isLastMove = index === this.currentMove.length - 1;
	
	    if (this.blocked) {
	      if (isLastMove) {
	        this.blocked = false;
	      } else {
	        return;
	      }
	    }
	
	    if (index >= 0) {
	      if (!isLastMove) {
	        this.blocked = true;
	      }
	      return;
	    }
	
	    console.log(e.type, target);
	
	    this.addNewLetterFromTarget(target);
	  },
	  addNewLetterFromTarget: function addNewLetterFromTarget(inner) {
	    var parentLetter = (0, _domClosest2.default)(inner, '[data-letter]');
	    parentLetter.classList.add('letter_active');
	
	    this.emit('letter', {
	      letter: parentLetter.dataset.letter,
	      row: +parentLetter.dataset.row,
	      column: +parentLetter.dataset.column
	    });
	
	    this.currentMove.push(inner);
	  },
	  computeValues: function computeValues() {
	    var count = 0;
	
	    this.grid = new Array(this.size.h);
	    for (var j = 0; j < this.size.h; j++) {
	      this.grid[j] = new Array(this.size.w);
	      for (var i = 0; i < this.size.w; i++) {
	        this.grid[j][i] = this.values[count++];
	      }
	    }
	  },
	
	
	  /**
	   * Render the Grid to the prevoisly specified node.
	   * @returns {void}
	   */
	  render: function render() {
	    this.computeValues();
	    this.node.innerHTML = (0, _grid2.default)({ grid: this.grid, cellRenderer: this.cellRenderer });
	  }
	};
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/grid.js.map


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = jadeTemplate;
	
	var _runtime = __webpack_require__(5);
	
	var _runtime2 = _interopRequireDefault(_runtime);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function jadeTemplate(locals) {
	  var buf = [];
	  var jade_mixins = {};
	  var jade_interp;
	  ;var locals_for_with = locals || {};(function (cellRenderer, grid, undefined) {
	    buf.push("<table>");
	    // iterate grid
	    ;(function () {
	      var $$obj = grid;
	      if ('number' == typeof $$obj.length) {
	
	        for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
	          var row = $$obj[i];
	
	          buf.push("<tr>");
	          // iterate row
	          ;(function () {
	            var $$obj = row;
	            if ('number' == typeof $$obj.length) {
	
	              for (var j = 0, $$l = $$obj.length; j < $$l; j++) {
	                var letter = $$obj[j];
	
	                buf.push("<td>" + (null == (jade_interp = cellRenderer(letter, i, j)) ? "" : jade_interp) + "</td>");
	              }
	            } else {
	              var $$l = 0;
	              for (var j in $$obj) {
	                $$l++;var letter = $$obj[j];
	
	                buf.push("<td>" + (null == (jade_interp = cellRenderer(letter, i, j)) ? "" : jade_interp) + "</td>");
	              }
	            }
	          }).call(this);
	
	          buf.push("</tr>");
	        }
	      } else {
	        var $$l = 0;
	        for (var i in $$obj) {
	          $$l++;var row = $$obj[i];
	
	          buf.push("<tr>");
	          // iterate row
	          ;(function () {
	            var $$obj = row;
	            if ('number' == typeof $$obj.length) {
	
	              for (var j = 0, $$l = $$obj.length; j < $$l; j++) {
	                var letter = $$obj[j];
	
	                buf.push("<td>" + (null == (jade_interp = cellRenderer(letter, i, j)) ? "" : jade_interp) + "</td>");
	              }
	            } else {
	              var $$l = 0;
	              for (var j in $$obj) {
	                $$l++;var letter = $$obj[j];
	
	                buf.push("<td>" + (null == (jade_interp = cellRenderer(letter, i, j)) ? "" : jade_interp) + "</td>");
	              }
	            }
	          }).call(this);
	
	          buf.push("</tr>");
	        }
	      }
	    }).call(this);
	
	    buf.push("</table>");
	  }).call(this, "cellRenderer" in locals_for_with ? locals_for_with.cellRenderer : typeof cellRenderer !== "undefined" ? cellRenderer : undefined, "grid" in locals_for_with ? locals_for_with.grid : typeof grid !== "undefined" ? grid : undefined, "undefined" in locals_for_with ? locals_for_with.undefined :  false ? undefined : undefined);;return buf.join("");
	}
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/grid.jade.js.map


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	'use strict';
	
	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */
	
	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];
	
	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }
	
	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }
	
	  return a;
	};
	
	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */
	
	function nulls(val) {
	  return val != null && val !== '';
	}
	
	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) :
	    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
	    [val]).filter(nulls).join(' ');
	}
	
	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};
	
	
	exports.style = function (val) {
	  if (val && typeof val === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
	                   'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' +
	                   'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};
	
	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse){
	  var buf = [];
	
	  var keys = Object.keys(obj);
	
	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i]
	        , val = obj[key];
	
	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }
	
	  return buf.join('');
	};
	
	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */
	
	var jade_encode_html_rules = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};
	var jade_match_html = /[&<>"]/g;
	
	function jade_encode_char(c) {
	  return jade_encode_html_rules[c] || c;
	}
	
	exports.escape = jade_escape;
	function jade_escape(html){
	  var result = String(html).replace(jade_match_html, jade_encode_char);
	  if (result === '' + html) return html;
	  else return result;
	};
	
	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */
	
	exports.rethrow = function rethrow(err, filename, lineno, str){
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || require('fs').readFileSync(filename, 'utf8')
	  } catch (ex) {
	    rethrow(err, null, lineno)
	  }
	  var context = 3
	    , lines = str.split('\n')
	    , start = Math.max(lineno - context, 0)
	    , end = Math.min(lines.length, lineno + context);
	
	  // Error context
	  var context = lines.slice(start, end).map(function(line, i){
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ')
	      + curr
	      + '| '
	      + line;
	  }).join('\n');
	
	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno
	    + '\n' + context + '\n\n' + err.message;
	  throw err;
	};
	
	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	}
	
	},{"fs":2}],2:[function(require,module,exports){
	
	},{}]},{},[1])(1)
	});

/***/ },
/* 6 */
/***/ function(module, exports) {

	/*global Map, Set */
	
	/* exported EventDispatcher */
	
	/*
	 * This file provides an helper to add custom events to any object.
	 *
	 * In order to use this functionality wrap your object using the
	 * 'EventDispatcher.mixin' function:
	 *
	 * var obj = EventDispatcher.mixin(new SomeObj());
	 *
	 * A list of events can be optionally provided and it is recommended to do so.
	 * If a list is provided then only the events present in the list will be
	 * allowed. Using events not present in the list will cause other functions to
	 * throw an error:
	 *
	 * var obj = EventDispatcher.mixin(new SomeObj(), [
	 *   'somethinghappened',
	 *   'somethingelsehappened'
	 * ]);
	 *
	 * The wrapped object will have five new methods: 'on', 'once', 'off', 'offAll'
	 * and 'emit'. Use 'on' to register a new event-handler:
	 *
	 * obj.on("somethinghappened", function onSomethingHappened() { ... });
	 *
	 * If the same event-handler is added multiple times then only one will be
	 * registered, e.g.:
	 *
	 * function onSomethingHappened() { ... }
	 * obj.on("somethinghappened", onSomethingHappened);
	 * obj.on("somethinghappened", onSomethingHappened); // Does nothing
	 *
	 * Use 'off' to remove a registered listener:
	 *
	 * obj.off("somethinghappened", onSomethingHappened);
	 *
	 * Use 'once' to register a one-time event-handler: it will be automatically
	 * unregistered after being called.
	 *
	 * obj.once("somethinghappened", function onSomethingHappened() { ... });
	 *
	 * And use 'offAll' to remove all registered event listeners for the specified
	 * event:
	 *
	 * obj.offAll("somethinghappened");
	 *
	 * When used without parameters 'offAll' removes all registered event handlers,
	 * this can be useful when writing unit-tests.
	 *
	 * Finally use 'emit' to send an event to the registered handlers:
	 *
	 * obj.emit("somethinghappened");
	 *
	 * An optional parameter can be passed to 'emit' to be passed to the registered
	 * handlers:
	 *
	 * obj.emit("somethinghappened", 123);
	 */
	
	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	function ensureValidEventName(eventName) {
	  if (!eventName || typeof eventName !== 'string') {
	    throw new Error('Event name should be a valid non-empty string!');
	  }
	}
	
	function ensureValidHandler(handler) {
	  if (typeof handler !== 'function') {
	    throw new Error('Handler should be a function!');
	  }
	}
	
	function ensureAllowedEventName(allowedEvents, eventName) {
	  if (allowedEvents && allowedEvents.indexOf(eventName) < 0) {
	    throw new Error('Event "' + eventName + '" is not allowed!');
	  }
	}
	
	// Implements publish/subscribe behaviour that can be applied to any object,
	// so that object can be listened for custom events. "this" context is the
	// object with Map "listeners" property used to store handlers.
	var eventDispatcher = {
	  /**
	   * Registers listener function to be executed once event occurs.
	   * @param {string} eventName Name of the event to listen for.
	   * @param {function} handler Handler to be executed once event occurs.
	   */
	  on: function on(eventName, handler) {
	    ensureValidEventName(eventName);
	    ensureAllowedEventName(this.allowedEvents, eventName);
	    ensureValidHandler(handler);
	
	    var handlers = this.listeners.get(eventName);
	
	    if (!handlers) {
	      handlers = new Set();
	      this.listeners.set(eventName, handlers);
	    }
	
	    // Set.add ignores handler if it has been already registered
	    handlers.add(handler);
	  },
	
	  /**
	   * Registers listener function to be executed only first time when event
	   * occurs.
	   * @param {string} eventName Name of the event to listen for.
	   * @param {function} handler Handler to be executed once event occurs.
	   */
	  once: function once(eventName, handler) {
	    var _this = this;
	
	    ensureValidHandler(handler);
	
	    var once = function once(parameters) {
	      eventDispatcher.off.call(_this, eventName, once);
	
	      handler(parameters);
	    };
	
	    eventDispatcher.on.call(this, eventName, once);
	  },
	
	  /**
	   * Removes registered listener for the specified event.
	   * @param {string} eventName Name of the event to remove listener for.
	   * @param {function} handler Handler to remove, so it won't be executed
	   * next time event occurs.
	   */
	  off: function off(eventName, handler) {
	    ensureValidEventName(eventName);
	    ensureAllowedEventName(this.allowedEvents, eventName);
	    ensureValidHandler(handler);
	
	    var handlers = this.listeners.get(eventName);
	
	    if (!handlers) {
	      return;
	    }
	
	    handlers.delete(handler);
	
	    if (!handlers.size) {
	      this.listeners.delete(eventName);
	    }
	  },
	
	  /**
	   * Removes all registered listeners for the specified event.
	   * @param {string} eventName Name of the event to remove all listeners for.
	   */
	  offAll: function offAll(eventName) {
	    if (typeof eventName === 'undefined') {
	      this.listeners.clear();
	      return;
	    }
	
	    ensureValidEventName(eventName);
	    ensureAllowedEventName(this.allowedEvents, eventName);
	
	    var handlers = this.listeners.get(eventName);
	
	    if (!handlers) {
	      return;
	    }
	
	    handlers.clear();
	
	    this.listeners.delete(eventName);
	  },
	
	  /**
	   * Emits specified event so that all registered handlers will be called
	   * with the specified parameters.
	   * @param {string} eventName Name of the event to call handlers for.
	   * @param {Object} parameters Optional parameters that will be passed to
	   * every registered handler.
	   */
	  emit: function emit(eventName, parameters) {
	    ensureValidEventName(eventName);
	    ensureAllowedEventName(this.allowedEvents, eventName);
	
	    var handlers = this.listeners.get(eventName);
	
	    if (!handlers) {
	      return;
	    }
	
	    handlers.forEach(function (handler) {
	      try {
	        handler(parameters);
	      } catch (e) {
	        console.error(e);
	      }
	    });
	  }
	};
	
	exports.EventDispatcher = {
	  /**
	   * Mixes dispatcher methods into target object.
	   * @param {Object} target Object to mix dispatcher methods into.
	   * @param {Array.<string>} allowedEvents Optional list of the allowed event
	   * names that can be emitted and listened for.
	   * @returns {Object} Target object with added dispatcher methods.
	   */
	  mixin: function mixin(target, allowedEvents) {
	    if (!target || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
	      throw new Error('Object to mix into should be valid object!');
	    }
	
	    if (typeof allowedEvents !== 'undefined' && !Array.isArray(allowedEvents)) {
	      throw new Error('Allowed events should be a valid array of strings!');
	    }
	
	    Object.keys(eventDispatcher).forEach(function (method) {
	      if (typeof target[method] !== 'undefined') {
	        throw new Error('Object to mix into already has "' + method + '" property defined!');
	      }
	      target[method] = eventDispatcher[method].bind(this);
	    }, { listeners: new Map(), allowedEvents: allowedEvents });
	
	    return target;
	  }
	};
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/event_dispatcher.js.map


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies
	 */
	
	var matches = __webpack_require__(8);
	
	/**
	 * @param element {Element}
	 * @param selector {String}
	 * @param context {Element}
	 * @return {Element}
	 */
	module.exports = function (element, selector, context) {
	  context = context || document;
	  // guard against orphans
	  element = { parentNode: element };
	
	  while ((element = element.parentNode) && element !== context) {
	    if (matches(element, selector)) {
	      return element;
	    }
	  }
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Determine if a DOM element matches a CSS selector
	 *
	 * @param {Element} elem
	 * @param {String} selector
	 * @return {Boolean}
	 * @api public
	 */
	
	function matches(elem, selector) {
	  // Vendor-specific implementations of `Element.prototype.matches()`.
	  var proto = window.Element.prototype;
	  var nativeMatches = proto.matches ||
	      proto.mozMatchesSelector ||
	      proto.msMatchesSelector ||
	      proto.oMatchesSelector ||
	      proto.webkitMatchesSelector;
	
	  if (!elem || elem.nodeType !== 1) {
	    return false;
	  }
	
	  var parentElem = elem.parentNode;
	
	  // use native 'matches'
	  if (nativeMatches) {
	    return nativeMatches.call(elem, selector);
	  }
	
	  // native support for `matches` is missing and a fallback is required
	  var nodes = parentElem.querySelectorAll(selector);
	  var len = nodes.length;
	
	  for (var i = 0; i < len; i++) {
	    if (nodes[i] === elem) {
	      return true;
	    }
	  }
	
	  return false;
	}
	
	/**
	 * Expose `matches`
	 */
	
	module.exports = matches;


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var transliterations = {
	  a: 'àâä',
	  e: 'éèêë',
	  i: 'îï',
	  o: 'ô',
	  u: 'ûüù',
	  c: 'ç'
	};
	
	function findCombinations(word) {
	  var combinations = [''];
	
	  Array.from(word).forEach(function (l) {
	    var nextLetters = [];
	    if (l in transliterations) {
	      nextLetters = Array.from(transliterations[l]);
	    }
	    nextLetters.push(l);
	
	    combinations = combinations.reduce(function (result, combination) {
	      result.push.apply(result, _toConsumableArray(nextLetters.map(function (appending) {
	        return combination + appending;
	      })));
	      return result;
	    }, []);
	  });
	
	  return combinations;
	}
	
	exports.findCombinations = findCombinations;
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/words.js.map


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = jadeTemplate;
	
	var _runtime = __webpack_require__(5);
	
	var _runtime2 = _interopRequireDefault(_runtime);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function jadeTemplate(locals) {
	  var buf = [];
	  var jade_mixins = {};
	  var jade_interp;
	  ;var locals_for_with = locals || {};(function (column, letter, qualifier, row, score) {
	    var _ref;
	
	    buf.push("<div" + _runtime2.default.attr("data-letter", letter, true, false) + _runtime2.default.attr("data-row", row, true, false) + _runtime2.default.attr("data-column", column, true, false) + _runtime2.default.cls(['letter', (_ref = {}, _defineProperty(_ref, 'letter_' + qualifier, qualifier), _defineProperty(_ref, 'letter_has_qualifier', qualifier), _ref)], [null, true]) + "><div class=\"letter__inner\">" + _runtime2.default.escape((jade_interp = letter) == null ? '' : jade_interp) + "</div><div class=\"letter__score\">" + _runtime2.default.escape((jade_interp = score) == null ? '' : jade_interp) + "</div><div data-l10n-id=\"qualifier-ld\" class=\"letter__qualifier qualifier__ld\">LD</div><div data-l10n-id=\"qualifier-lt\" class=\"letter__qualifier qualifier__lt\">LT</div><div data-l10n-id=\"qualifier-wd\" class=\"letter__qualifier qualifier__wd\">WD</div><div data-l10n-id=\"qualifier-wt\" class=\"letter__qualifier qualifier__wt\">WT</div></div>");
	  }).call(this, "column" in locals_for_with ? locals_for_with.column : typeof column !== "undefined" ? column : undefined, "letter" in locals_for_with ? locals_for_with.letter : typeof letter !== "undefined" ? letter : undefined, "qualifier" in locals_for_with ? locals_for_with.qualifier : typeof qualifier !== "undefined" ? qualifier : undefined, "row" in locals_for_with ? locals_for_with.row : typeof row !== "undefined" ? row : undefined, "score" in locals_for_with ? locals_for_with.score : typeof score !== "undefined" ? score : undefined);;return buf.join("");
	}
	//# sourceMappingURL=/home/julien/perso/git/woggle/.gobble-build/13-babel/.cache/cell.jade.js.map


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*jshint eqnull:true*/
	(function (root) {
	  "use strict";
	
	  var GLOBAL_KEY = "Random";
	
	  var imul = (typeof Math.imul !== "function" || Math.imul(0xffffffff, 5) !== -5 ?
	    function (a, b) {
	      var ah = (a >>> 16) & 0xffff;
	      var al = a & 0xffff;
	      var bh = (b >>> 16) & 0xffff;
	      var bl = b & 0xffff;
	      // the shift by 0 fixes the sign on the high part
	      // the final |0 converts the unsigned value into a signed value
	      return (al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0;
	    } :
	    Math.imul);
	
	  var stringRepeat = (typeof String.prototype.repeat === "function" && "x".repeat(3) === "xxx" ?
	    function (x, y) {
	      return x.repeat(y);
	    } : function (pattern, count) {
	      var result = "";
	      while (count > 0) {
	        if (count & 1) {
	          result += pattern;
	        }
	        count >>= 1;
	        pattern += pattern;
	      }
	      return result;
	    });
	
	  function Random(engine) {
	    if (!(this instanceof Random)) {
	      return new Random(engine);
	    }
	
	    if (engine == null) {
	      engine = Random.engines.nativeMath;
	    } else if (typeof engine !== "function") {
	      throw new TypeError("Expected engine to be a function, got " + typeof engine);
	    }
	    this.engine = engine;
	  }
	  var proto = Random.prototype;
	
	  Random.engines = {
	    nativeMath: function () {
	      return (Math.random() * 0x100000000) | 0;
	    },
	    mt19937: (function (Int32Array) {
	      // http://en.wikipedia.org/wiki/Mersenne_twister
	      function refreshData(data) {
	        var k = 0;
	        var tmp = 0;
	        for (;
	          (k | 0) < 227; k = (k + 1) | 0) {
	          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
	          data[k] = data[(k + 397) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
	        }
	
	        for (;
	          (k | 0) < 623; k = (k + 1) | 0) {
	          tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
	          data[k] = data[(k - 227) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
	        }
	
	        tmp = (data[623] & 0x80000000) | (data[0] & 0x7fffffff);
	        data[623] = data[396] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
	      }
	
	      function temper(value) {
	        value ^= value >>> 11;
	        value ^= (value << 7) & 0x9d2c5680;
	        value ^= (value << 15) & 0xefc60000;
	        return value ^ (value >>> 18);
	      }
	
	      function seedWithArray(data, source) {
	        var i = 1;
	        var j = 0;
	        var sourceLength = source.length;
	        var k = Math.max(sourceLength, 624) | 0;
	        var previous = data[0] | 0;
	        for (;
	          (k | 0) > 0; --k) {
	          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x0019660d)) + (source[j] | 0) + (j | 0)) | 0;
	          i = (i + 1) | 0;
	          ++j;
	          if ((i | 0) > 623) {
	            data[0] = data[623];
	            i = 1;
	          }
	          if (j >= sourceLength) {
	            j = 0;
	          }
	        }
	        for (k = 623;
	          (k | 0) > 0; --k) {
	          data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x5d588b65)) - i) | 0;
	          i = (i + 1) | 0;
	          if ((i | 0) > 623) {
	            data[0] = data[623];
	            i = 1;
	          }
	        }
	        data[0] = 0x80000000;
	      }
	
	      function mt19937() {
	        var data = new Int32Array(624);
	        var index = 0;
	        var uses = 0;
	
	        function next() {
	          if ((index | 0) >= 624) {
	            refreshData(data);
	            index = 0;
	          }
	
	          var value = data[index];
	          index = (index + 1) | 0;
	          uses += 1;
	          return temper(value) | 0;
	        }
	        next.getUseCount = function() {
	          return uses;
	        };
	        next.discard = function (count) {
	          uses += count;
	          if ((index | 0) >= 624) {
	            refreshData(data);
	            index = 0;
	          }
	          while ((count - index) > 624) {
	            count -= 624 - index;
	            refreshData(data);
	            index = 0;
	          }
	          index = (index + count) | 0;
	          return next;
	        };
	        next.seed = function (initial) {
	          var previous = 0;
	          data[0] = previous = initial | 0;
	
	          for (var i = 1; i < 624; i = (i + 1) | 0) {
	            data[i] = previous = (imul((previous ^ (previous >>> 30)), 0x6c078965) + i) | 0;
	          }
	          index = 624;
	          uses = 0;
	          return next;
	        };
	        next.seedWithArray = function (source) {
	          next.seed(0x012bd6aa);
	          seedWithArray(data, source);
	          return next;
	        };
	        next.autoSeed = function () {
	          return next.seedWithArray(Random.generateEntropyArray());
	        };
	        return next;
	      }
	
	      return mt19937;
	    }(typeof Int32Array === "function" ? Int32Array : Array)),
	    browserCrypto: (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" && typeof Int32Array === "function") ? (function () {
	      var data = null;
	      var index = 128;
	
	      return function () {
	        if (index >= 128) {
	          if (data === null) {
	            data = new Int32Array(128);
	          }
	          crypto.getRandomValues(data);
	          index = 0;
	        }
	
	        return data[index++] | 0;
	      };
	    }()) : null
	  };
	
	  Random.generateEntropyArray = function () {
	    var array = [];
	    var engine = Random.engines.nativeMath;
	    for (var i = 0; i < 16; ++i) {
	      array[i] = engine() | 0;
	    }
	    array.push(new Date().getTime() | 0);
	    return array;
	  };
	
	  function returnValue(value) {
	    return function () {
	      return value;
	    };
	  }
	
	  // [-0x80000000, 0x7fffffff]
	  Random.int32 = function (engine) {
	    return engine() | 0;
	  };
	  proto.int32 = function () {
	    return Random.int32(this.engine);
	  };
	
	  // [0, 0xffffffff]
	  Random.uint32 = function (engine) {
	    return engine() >>> 0;
	  };
	  proto.uint32 = function () {
	    return Random.uint32(this.engine);
	  };
	
	  // [0, 0x1fffffffffffff]
	  Random.uint53 = function (engine) {
	    var high = engine() & 0x1fffff;
	    var low = engine() >>> 0;
	    return (high * 0x100000000) + low;
	  };
	  proto.uint53 = function () {
	    return Random.uint53(this.engine);
	  };
	
	  // [0, 0x20000000000000]
	  Random.uint53Full = function (engine) {
	    while (true) {
	      var high = engine() | 0;
	      if (high & 0x200000) {
	        if ((high & 0x3fffff) === 0x200000 && (engine() | 0) === 0) {
	          return 0x20000000000000;
	        }
	      } else {
	        var low = engine() >>> 0;
	        return ((high & 0x1fffff) * 0x100000000) + low;
	      }
	    }
	  };
	  proto.uint53Full = function () {
	    return Random.uint53Full(this.engine);
	  };
	
	  // [-0x20000000000000, 0x1fffffffffffff]
	  Random.int53 = function (engine) {
	    var high = engine() | 0;
	    var low = engine() >>> 0;
	    return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
	  };
	  proto.int53 = function () {
	    return Random.int53(this.engine);
	  };
	
	  // [-0x20000000000000, 0x20000000000000]
	  Random.int53Full = function (engine) {
	    while (true) {
	      var high = engine() | 0;
	      if (high & 0x400000) {
	        if ((high & 0x7fffff) === 0x400000 && (engine() | 0) === 0) {
	          return 0x20000000000000;
	        }
	      } else {
	        var low = engine() >>> 0;
	        return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
	      }
	    }
	  };
	  proto.int53Full = function () {
	    return Random.int53Full(this.engine);
	  };
	
	  function add(generate, addend) {
	    if (addend === 0) {
	      return generate;
	    } else {
	      return function (engine) {
	        return generate(engine) + addend;
	      };
	    }
	  }
	
	  Random.integer = (function () {
	    function isPowerOfTwoMinusOne(value) {
	      return ((value + 1) & value) === 0;
	    }
	
	    function bitmask(masking) {
	      return function (engine) {
	        return engine() & masking;
	      };
	    }
	
	    function downscaleToLoopCheckedRange(range) {
	      var extendedRange = range + 1;
	      var maximum = extendedRange * Math.floor(0x100000000 / extendedRange);
	      return function (engine) {
	        var value = 0;
	        do {
	          value = engine() >>> 0;
	        } while (value >= maximum);
	        return value % extendedRange;
	      };
	    }
	
	    function downscaleToRange(range) {
	      if (isPowerOfTwoMinusOne(range)) {
	        return bitmask(range);
	      } else {
	        return downscaleToLoopCheckedRange(range);
	      }
	    }
	
	    function isEvenlyDivisibleByMaxInt32(value) {
	      return (value | 0) === 0;
	    }
	
	    function upscaleWithHighMasking(masking) {
	      return function (engine) {
	        var high = engine() & masking;
	        var low = engine() >>> 0;
	        return (high * 0x100000000) + low;
	      };
	    }
	
	    function upscaleToLoopCheckedRange(extendedRange) {
	      var maximum = extendedRange * Math.floor(0x20000000000000 / extendedRange);
	      return function (engine) {
	        var ret = 0;
	        do {
	          var high = engine() & 0x1fffff;
	          var low = engine() >>> 0;
	          ret = (high * 0x100000000) + low;
	        } while (ret >= maximum);
	        return ret % extendedRange;
	      };
	    }
	
	    function upscaleWithinU53(range) {
	      var extendedRange = range + 1;
	      if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
	        var highRange = ((extendedRange / 0x100000000) | 0) - 1;
	        if (isPowerOfTwoMinusOne(highRange)) {
	          return upscaleWithHighMasking(highRange);
	        }
	      }
	      return upscaleToLoopCheckedRange(extendedRange);
	    }
	
	    function upscaleWithinI53AndLoopCheck(min, max) {
	      return function (engine) {
	        var ret = 0;
	        do {
	          var high = engine() | 0;
	          var low = engine() >>> 0;
	          ret = ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
	        } while (ret < min || ret > max);
	        return ret;
	      };
	    }
	
	    return function (min, max) {
	      min = Math.floor(min);
	      max = Math.floor(max);
	      if (min < -0x20000000000000 || !isFinite(min)) {
	        throw new RangeError("Expected min to be at least " + (-0x20000000000000));
	      } else if (max > 0x20000000000000 || !isFinite(max)) {
	        throw new RangeError("Expected max to be at most " + 0x20000000000000);
	      }
	
	      var range = max - min;
	      if (range <= 0 || !isFinite(range)) {
	        return returnValue(min);
	      } else if (range === 0xffffffff) {
	        if (min === 0) {
	          return Random.uint32;
	        } else {
	          return add(Random.int32, min + 0x80000000);
	        }
	      } else if (range < 0xffffffff) {
	        return add(downscaleToRange(range), min);
	      } else if (range === 0x1fffffffffffff) {
	        return add(Random.uint53, min);
	      } else if (range < 0x1fffffffffffff) {
	        return add(upscaleWithinU53(range), min);
	      } else if (max - 1 - min === 0x1fffffffffffff) {
	        return add(Random.uint53Full, min);
	      } else if (min === -0x20000000000000 && max === 0x20000000000000) {
	        return Random.int53Full;
	      } else if (min === -0x20000000000000 && max === 0x1fffffffffffff) {
	        return Random.int53;
	      } else if (min === -0x1fffffffffffff && max === 0x20000000000000) {
	        return add(Random.int53, 1);
	      } else if (max === 0x20000000000000) {
	        return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
	      } else {
	        return upscaleWithinI53AndLoopCheck(min, max);
	      }
	    };
	  }());
	  proto.integer = function (min, max) {
	    return Random.integer(min, max)(this.engine);
	  };
	
	  // [0, 1] (floating point)
	  Random.realZeroToOneInclusive = function (engine) {
	    return Random.uint53Full(engine) / 0x20000000000000;
	  };
	  proto.realZeroToOneInclusive = function () {
	    return Random.realZeroToOneInclusive(this.engine);
	  };
	
	  // [0, 1) (floating point)
	  Random.realZeroToOneExclusive = function (engine) {
	    return Random.uint53(engine) / 0x20000000000000;
	  };
	  proto.realZeroToOneExclusive = function () {
	    return Random.realZeroToOneExclusive(this.engine);
	  };
	
	  Random.real = (function () {
	    function multiply(generate, multiplier) {
	      if (multiplier === 1) {
	        return generate;
	      } else if (multiplier === 0) {
	        return function () {
	          return 0;
	        };
	      } else {
	        return function (engine) {
	          return generate(engine) * multiplier;
	        };
	      }
	    }
	
	    return function (left, right, inclusive) {
	      if (!isFinite(left)) {
	        throw new RangeError("Expected left to be a finite number");
	      } else if (!isFinite(right)) {
	        throw new RangeError("Expected right to be a finite number");
	      }
	      return add(
	        multiply(
	          inclusive ? Random.realZeroToOneInclusive : Random.realZeroToOneExclusive,
	          right - left),
	        left);
	    };
	  }());
	  proto.real = function (min, max, inclusive) {
	    return Random.real(min, max, inclusive)(this.engine);
	  };
	
	  Random.bool = (function () {
	    function isLeastBitTrue(engine) {
	      return (engine() & 1) === 1;
	    }
	
	    function lessThan(generate, value) {
	      return function (engine) {
	        return generate(engine) < value;
	      };
	    }
	
	    function probability(percentage) {
	      if (percentage <= 0) {
	        return returnValue(false);
	      } else if (percentage >= 1) {
	        return returnValue(true);
	      } else {
	        var scaled = percentage * 0x100000000;
	        if (scaled % 1 === 0) {
	          return lessThan(Random.int32, (scaled - 0x80000000) | 0);
	        } else {
	          return lessThan(Random.uint53, Math.round(percentage * 0x20000000000000));
	        }
	      }
	    }
	
	    return function (numerator, denominator) {
	      if (denominator == null) {
	        if (numerator == null) {
	          return isLeastBitTrue;
	        }
	        return probability(numerator);
	      } else {
	        if (numerator <= 0) {
	          return returnValue(false);
	        } else if (numerator >= denominator) {
	          return returnValue(true);
	        }
	        return lessThan(Random.integer(0, denominator - 1), numerator);
	      }
	    };
	  }());
	  proto.bool = function (numerator, denominator) {
	    return Random.bool(numerator, denominator)(this.engine);
	  };
	
	  function toInteger(value) {
	    var number = +value;
	    if (number < 0) {
	      return Math.ceil(number);
	    } else {
	      return Math.floor(number);
	    }
	  }
	
	  function convertSliceArgument(value, length) {
	    if (value < 0) {
	      return Math.max(value + length, 0);
	    } else {
	      return Math.min(value, length);
	    }
	  }
	  Random.pick = function (engine, array, begin, end) {
	    var length = array.length;
	    var start = begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
	    var finish = end === void 0 ? length : convertSliceArgument(toInteger(end), length);
	    if (start >= finish) {
	      return void 0;
	    }
	    var distribution = Random.integer(start, finish - 1);
	    return array[distribution(engine)];
	  };
	  proto.pick = function (array, begin, end) {
	    return Random.pick(this.engine, array, begin, end);
	  };
	
	  function returnUndefined() {
	    return void 0;
	  }
	  var slice = Array.prototype.slice;
	  Random.picker = function (array, begin, end) {
	    var clone = slice.call(array, begin, end);
	    if (!clone.length) {
	      return returnUndefined;
	    }
	    var distribution = Random.integer(0, clone.length - 1);
	    return function (engine) {
	      return clone[distribution(engine)];
	    };
	  };
	
	  Random.shuffle = function (engine, array, downTo) {
	    var length = array.length;
	    if (length) {
	      if (downTo == null) {
	        downTo = 0;
	      }
	      for (var i = (length - 1) >>> 0; i > downTo; --i) {
	        var distribution = Random.integer(0, i);
	        var j = distribution(engine);
	        if (i !== j) {
	          var tmp = array[i];
	          array[i] = array[j];
	          array[j] = tmp;
	        }
	      }
	    }
	    return array;
	  };
	  proto.shuffle = function (array) {
	    return Random.shuffle(this.engine, array);
	  };
	
	  Random.sample = function (engine, population, sampleSize) {
	    if (sampleSize < 0 || sampleSize > population.length || !isFinite(sampleSize)) {
	      throw new RangeError("Expected sampleSize to be within 0 and the length of the population");
	    }
	
	    if (sampleSize === 0) {
	      return [];
	    }
	
	    var clone = slice.call(population);
	    var length = clone.length;
	    if (length === sampleSize) {
	      return Random.shuffle(engine, clone, 0);
	    }
	    var tailLength = length - sampleSize;
	    return Random.shuffle(engine, clone, tailLength - 1).slice(tailLength);
	  };
	  proto.sample = function (population, sampleSize) {
	    return Random.sample(this.engine, population, sampleSize);
	  };
	
	  Random.die = function (sideCount) {
	    return Random.integer(1, sideCount);
	  };
	  proto.die = function (sideCount) {
	    return Random.die(sideCount)(this.engine);
	  };
	
	  Random.dice = function (sideCount, dieCount) {
	    var distribution = Random.die(sideCount);
	    return function (engine) {
	      var result = [];
	      result.length = dieCount;
	      for (var i = 0; i < dieCount; ++i) {
	        result[i] = distribution(engine);
	      }
	      return result;
	    };
	  };
	  proto.dice = function (sideCount, dieCount) {
	    return Random.dice(sideCount, dieCount)(this.engine);
	  };
	
	  // http://en.wikipedia.org/wiki/Universally_unique_identifier
	  Random.uuid4 = (function () {
	    function zeroPad(string, zeroCount) {
	      return stringRepeat("0", zeroCount - string.length) + string;
	    }
	
	    return function (engine) {
	      var a = engine() >>> 0;
	      var b = engine() | 0;
	      var c = engine() | 0;
	      var d = engine() >>> 0;
	
	      return (
	        zeroPad(a.toString(16), 8) +
	        "-" +
	        zeroPad((b & 0xffff).toString(16), 4) +
	        "-" +
	        zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
	        "-" +
	        zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
	        "-" +
	        zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
	        zeroPad(d.toString(16), 8));
	    };
	  }());
	  proto.uuid4 = function () {
	    return Random.uuid4(this.engine);
	  };
	
	  Random.string = (function () {
	    // has 2**x chars, for faster uniform distribution
	    var DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
	
	    return function (pool) {
	      if (pool == null) {
	        pool = DEFAULT_STRING_POOL;
	      }
	
	      var length = pool.length;
	      if (!length) {
	        throw new Error("Expected pool not to be an empty string");
	      }
	
	      var distribution = Random.integer(0, length - 1);
	      return function (engine, length) {
	        var result = "";
	        for (var i = 0; i < length; ++i) {
	          var j = distribution(engine);
	          result += pool.charAt(j);
	        }
	        return result;
	      };
	    };
	  }());
	  proto.string = function (length, pool) {
	    return Random.string(pool)(this.engine, length);
	  };
	
	  Random.hex = (function () {
	    var LOWER_HEX_POOL = "0123456789abcdef";
	    var lowerHex = Random.string(LOWER_HEX_POOL);
	    var upperHex = Random.string(LOWER_HEX_POOL.toUpperCase());
	
	    return function (upper) {
	      if (upper) {
	        return upperHex;
	      } else {
	        return lowerHex;
	      }
	    };
	  }());
	  proto.hex = function (length, upper) {
	    return Random.hex(upper)(this.engine, length);
	  };
	
	  Random.date = function (start, end) {
	    if (!(start instanceof Date)) {
	      throw new TypeError("Expected start to be a Date, got " + typeof start);
	    } else if (!(end instanceof Date)) {
	      throw new TypeError("Expected end to be a Date, got " + typeof end);
	    }
	    var distribution = Random.integer(start.getTime(), end.getTime());
	    return function (engine) {
	      return new Date(distribution(engine));
	    };
	  };
	  proto.date = function (start, end) {
	    return Random.date(start, end)(this.engine);
	  };
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return Random;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module !== "undefined" && typeof require === "function") {
	    module.exports = Random;
	  } else {
	    (function () {
	      var oldGlobal = root[GLOBAL_KEY];
	      Random.noConflict = function () {
	        root[GLOBAL_KEY] = oldGlobal;
	        return this;
	      };
	    }());
	    root[GLOBAL_KEY] = Random;
	  }
	}(this));

/***/ },
/* 12 */
/***/ function(module, exports) {

	/*!
	 * BJSpell JavaScript Library v0.0.1
	 * http://code.google.com/p/bjspell/
	 *
	 * Copyright (c) 2009 Andrea Giammarchi
	 * Licensed under the Lesser GPL licenses.
	 *
	 * Date: 2009-02-05 23:50:01 +0000 (Wed, 05 Feb 2009)
	 * Revision: 1
	 * ToDo: better suggestion (at least one that make more sense)
	 */
	 var BJSpell = exports.BJSpell = function(){
	 
	    /**
	     * Every BJSpell call is a dictionary based singleton.
	     * new BJSpell("en_US") === BJSpell("en_US")
	     * var en = BJSpell("en_US", function(){
	     *     this === new BJSpell("en_US") === en
	     * });
	     * It is possible to create many languages instances without problems
	     * but every instance will be cached in the browser after its download.
	     * Every BJSpell instance uses a big amount of RAM due to the
	     * JavaScript "pre-compiled" dictionary and caching optimizations.
	     * @param   String a dictionary file to load. It has to contain the standard name of the language (e.g. en_US, en_EN, it_IT ...)
	     * @param   Function a callback to execute asyncronously on dictionary ready
	     * @return  BJSpell even invoked as regular callback returns the singletone instance for specified dictionary
	     * @constructor
	     */
	    function BJSpell(dic, callback){
	        if(this instanceof BJSpell){
	            var lang = /^.*?([a-zA-Z]{2}_[a-zA-Z]{2}).*$/.exec(dic)[1],
	                self = this;
	            if(!callback)
	                callback = empty;
	            if(BJSpell[lang]){
	                if(BJSpell[lang] instanceof BJSpell)
	                    self = BJSpell[lang]
	                else
	                    BJSpell[lang] = sync(self, BJSpell[lang]);
	                self.checked = {};
	                var keys = self.keys = [],
	                    words = self.words,
	                    i = 0,
	                    key;
	                for(key in words)
	                    keys[i++] = key;
	                keys.indexOf = indexOf;
	                setTimeout(function(){callback.call(self)}, 1);
	            } else {
	                var script = document.createElement("script");
	                BJSpell[lang] = self;
	                script.src = dic;
	                script.type = "text/javascript";
	                script.onload = function(){
	                    script.onload = script.onreadystatechange = empty;
	                    script.parentNode.removeChild(script);
	                    BJSpell.call(self, dic, callback);
	                };
	                script.onreadystatechange = function(){
	                    if(/loaded|completed/i.test(script.readyState))
	                        script.onload();
	                };
	                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script);
	            };
	            return self;
	        } else
	            return new BJSpell(dic, callback);
	    };
	
	    /** check a word, case insensitive
	     * @param  String a word to check if it is correct or not
	     * @return Boolean false if the word does not exist
	     */
	    BJSpell.prototype.check = function(word){
	        var checked = this.checked[word = word.toLowerCase()];
	        return typeof checked === "boolean" ? checked : this.parse(word);
	    };
	
	    /** check a "lowercased" word in the dictionary
	     * @param  String a lowercase word to search in the dictionary
	     * @return Boolean false if the word does not exist
	     */
	    BJSpell.prototype.parse = function(word){
	        if(/^[0-9]+$/.test(word))
	            return this.checked[word] = true;
	        var result = !!this.words[word];
	        if(!result){
	            for(var
	                parsed = word,
	                rules = this.rules.PFX,
	                length = rules.length,
	                i = 0,
	                rule, str, seek, re, add;
	                i < length;
	                i++
	            ){
	                rule = rules[i]; add = rule[0]; seek = rule[1]; re = rule[2];
	                str = word.substr(0, seek.length);
	                if(str === seek){
	                    parsed = word.substring(str.length);
	                    if(add !== "0")
	                        parsed = add + parsed;
	                    result = !!this.words[parsed];
	                    break;
	                }
	            };
	            if(!result && parsed.length){
	                for(var
	                    rules = this.rules.SFX,
	                    len = parsed.length,
	                    length = rules.length,
	                    i = 0;
	                    i < length;
	                    i++
	                ){
	                    rule = rules[i]; add = rule[0]; seek = rule[1]; re = rule[2];
	                    str = parsed.substring(len - seek.length);
	                    if(str === seek){
	                        seek = parsed.substring(0, len - str.length);
	                        if(add !== "0")
	                            seek += add;
	                        if((re === "." || new RegExp(re + "$").test(seek)) && this.words[seek]){
	                            result = true;
	                            break;
	                        }
	                    }
	                }
	            }
	        };
	        return this.checked[word] = result;
	    };
	
	    /** invoke a specific callback for each word that is not valid
	     * @param  String a string with zero or more words to check
	     * @param  Function a callback to use as replace. Only wrong words will be passed to the callback.
	     * @return Boolean false if the word does not exist
	     */
	    BJSpell.prototype.replace = function(String, callback){
	        var self = this;
	        return String.replace(self.alphabet, function(word){
	            return self.check(word) ? word : callback(word);
	        });
	    };
	
	    /** basic/silly implementation of a suggestion - I will write something more interesting one day
	     * @param  String a word, generally bad, to look for a suggestion
	     * @param  Number an optional unsigned integer to retrieve N suggestions.
	     * @return Array a list of possibilities/suggestions
	     */
	    BJSpell.prototype.suggest = function(word, many){
	        if(typeof this.words[word] === "string"){
	            // not implemented yet, requires word classes parser
	            var words = [word];
	        } else {
	            var keys = this.keys,
	                length = keys.length,
	                i = Math.abs(many) || 1,
	                ceil, indexOf, words;
	            word = word.toLowerCase();
	            if(-1 === keys.indexOf(word))
	                keys[length] = word;
	            keys.sort();
	            indexOf = keys.indexOf(word);
	            many = indexOf - ((i / 2) >> 0);
	            ceil = indexOf + 1 + Math.ceil(i / 2);
	            words = keys.slice(many, indexOf).concat(keys.slice(indexOf + 1, ceil));
	            while(words.length < i && ++ceil < keys.length)
	                words[words.length] = keys[ceil];
	            if(length !== keys.length)
	                keys.splice(indexOf, 1);
	        };
	        return words;
	    };
	    
	    /** private scope functions
	     * empty, as empty callback
	     * indexOf, as Array.prototype.indexOf, normalized for IE or other browsers
	     * sync, to copy over two objects keys/values
	     */
	    var empty = function(){},
	        indexOf = Array.prototype.indexOf || function(word){for(var i=0,length=this.length;i<length&&this[i]!==word;i++);return i==length?-1:i},
	        sync = function(a,b){for(var k in b)a[k]=b[k];return a};
	
	    return BJSpell;
	}();


/***/ },
/* 13 */
/***/ function(module, exports) {



/***/ }
/******/ ]);
//# sourceMappingURL=woggle.js.map