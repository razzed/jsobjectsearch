/*
 * Creates two functions: objectSearchKeys and objectSearchValues in the global scope.
 *
 *    objectSearchKeys(object, /512/) 
 *
 * returns a list of object member paths of matching keys, or an empty array if not found.
 *
 * @author Kent Davidson http://marketacumen.com
 * @copyright Copyright &copy; 2017 Market Acumen, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, 
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(exports) {
	var objectSearch = function(root, pattern, compare) {
		"use strict";
		var magic = "__traversing_objectSearch";
		var tos = function(x) {
			return Object.prototype.toString.call(x);
		};
		var isArray = function(test) {
			return tos(test) === '[object Array]';
		};
		var isObject = function(test) {
			return test !== null && typeof test === "object";
		};
		var isRE = function(test) {
			return tos(test) === "[object RegExp]";
		};
		var transaction = (new Date()).getTime();
		var searchRecursion = function(object, pattern, path) {
			var v, k, newpath;
			var r = [];
			if (isObject(object)) {
				try {
					if (object[magic] === transaction) {
						return r;
					}
					object[magic] = transaction;
					for (k in object) {
						if (Object.prototype.hasOwnProperty.call(object, k)) {
							newpath = path.slice();
							newpath.push(k);
							v = object[k];
							if (compare(object, k, v, pattern)) {
								r.push(newpath.join("."));
							} else if (isObject(v) || isArray(v)) {
								r = r.concat(searchRecursion(v, pattern, newpath));
							}
						}
					}
					delete object[magic];
				} catch (e) {}
			} else {
				for (k = 0; k < object.length; k++) {
					v = object[k];
					if (isObject(v) || isArray(v)) {
						newpath = path.slice();
						newpath.push('[' + k + ']');
						r = r.concat(searchRecursion(v, pattern, newpath));
					}
				}
			}
			return r;
		};
		if (!isRE(pattern)) {
			throw new Error("argument 2 must be a pattern");
		}
		return searchRecursion(root, pattern, []);
	};

	exports.objectSearchKeys = function(root, pattern) {
		return objectSearch(root, pattern, function(object, key, value, pattern) {
			return pattern.exec(key) !== null;
		});
	};
	exports.objectSearchValues = function(root, pattern) {
		var isArray = function(test) {
			return Object.prototype.toString.call(test) === '[object Array]';
		};
		var isObject = function(test) {
			return test !== null && typeof test === "object";
		};
		return objectSearch(root, pattern, function(object, key, value, pattern) {
			if (isArray(value) || isObject(value)) {
				return false;
			}
			return pattern.exec(String(value)) !== null;
		});
	};
}(window || exports));
