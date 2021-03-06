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
	"use strict";
	// This stuff that JavaScript should provide, but doesn't
	var opp = Object.prototype; // You know me!
	var hop = opp.hasOwnProperty;
	// Convert an object to a string type
	var tos = function(x) {
		return opp.toString.call(x);
	};
	// Is it an array?
	var isArray = function(test) {
		return tos(test) === '[object Array]';
	};
	// Is it an object?
	var isObject = function(test) {
		return test !== null && typeof test === "object";
	};
	// Is it a RegExp?
	var isRE = function(test) {
		return tos(test) === "[object RegExp]";
	};
	// Given an object root, a RegExp pattern, and 
	// a compare method which takes (object, key, value, pattern) and returns true to match and false to not match
	var objectSearch = function(root, pattern, compare) {
		var magic = "__traversing_objectSearch";		// A marker for any object we traverse to avoid infinite loops
		var transaction = (new Date()).getTime();		// The magic number we use to mark each object just in case
		var searchRecursion = function(object, path) {	// Search object which is at "path"
			var v, k, newpath;
			var r = [];
			// object MUST be an Object or Array
			if (isObject(object)) {
				// If it's an object, recurse
				try {
					if (object[magic] === transaction) {
						return r;
					}
					object[magic] = transaction;
					for (k in object) {
						if (!hop.call(object, k)) {
							continue;
						}
						newpath = path.slice();
						newpath.push(k);
						v = object[k];
						if (compare(object, k, v, pattern)) {
							r.push(newpath.join("."));
						} 
						if (isObject(v) || isArray(v)) {
							r = r.concat(searchRecursion(v, newpath));
						}
					}
					delete object[magic];
				} catch (e) {}
				return r;
			} 
			// It's an array, iterate
			for (k = 0; k < object.length; k++) {
				v = object[k];
				newpath = path.slice();
				newpath.push('[' + k + ']');
				if (compare(object, String(k), v, pattern)) {
					r.push(newpath.join("."));
				} 
				if (isObject(v) || isArray(v)) {
					r = r.concat(searchRecursion(v, newpath));
				}
			}
			return r;
		};
		if (!isRE(pattern)) {
			throw new Error("argument 2 must be a pattern");
		}
		return searchRecursion(root, []);
	};
	exports.objectSearchKeys = function(root, pattern) {
		return objectSearch(root, pattern, function(object, key, value, pattern) {
			return pattern.exec(key) !== null;
		});
	};
	exports.objectSearchValues = function(root, pattern) {
		return objectSearch(root, pattern, function(object, key, value, pattern) {
			if (isArray(value) || isObject(value)) {
				return false;
			}
			return pattern.exec(String(value)) !== null;
		});
	};
}(window || exports));
