(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.cz.aW === region.Q.aW)
	{
		return 'on line ' + region.cz.aW;
	}
	return 'on lines ' + region.cz.aW + ' through ' + region.Q.aW;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.dr,
		impl.ec,
		impl.d2,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		af: func(record.af),
		bz: record.bz,
		bv: record.bv
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.af;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bz;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.bv) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.dr,
		impl.ec,
		impl.d2,
		function(sendToApp, initialModel) {
			var view = impl.c;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.dr,
		impl.ec,
		impl.d2,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.bx && impl.bx(sendToApp)
			var view = impl.c;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.bk);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.au) && (_VirtualDom_doc.title = title = doc.au);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.dM;
	var onUrlRequest = impl.dN;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		bx: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.cl === next.cl
							&& curr.b0 === next.b0
							&& curr.ci.a === next.ci.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		dr: function(flags)
		{
			return A3(impl.dr, flags, _Browser_getUrl(), key);
		},
		c: impl.c,
		ec: impl.ec,
		d2: impl.d2
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { $7: 'hidden', cX: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { $7: 'mozHidden', cX: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { $7: 'msHidden', cX: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { $7: 'webkitHidden', cX: 'webkitvisibilitychange' }
		: { $7: 'hidden', cX: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		cu: _Browser_getScene(),
		t: {
			ak: _Browser_window.pageXOffset,
			W: _Browser_window.pageYOffset,
			cL: _Browser_doc.documentElement.clientWidth,
			aU: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		cL: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		aU: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			cu: {
				cL: node.scrollWidth,
				aU: node.scrollHeight
			},
			t: {
				ak: node.scrollLeft,
				W: node.scrollTop,
				cL: node.clientWidth,
				aU: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			cu: _Browser_getScene(),
			t: {
				ak: x,
				W: y,
				cL: _Browser_doc.documentElement.clientWidth,
				aU: _Browser_doc.documentElement.clientHeight
			},
			X: {
				ak: x + rect.left,
				W: y + rect.top,
				cL: rect.width,
				aU: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.B.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.B.b, xhr)); });
		$elm$core$Maybe$isJust(request.ea) && _Http_track(router, xhr, request.ea.a);

		try {
			xhr.open(request.dz, request.J, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.J));
		}

		_Http_configureRequest(xhr, request);

		request.bk.a && xhr.setRequestHeader('Content-Type', request.bk.a);
		xhr.send(request.bk.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.dn; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.d6.a || 0;
	xhr.responseType = request.B.d;
	xhr.withCredentials = request.cO;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		J: xhr.responseURL,
		d0: xhr.status,
		d1: xhr.statusText,
		dn: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			d_: event.loaded,
			cx: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			dU: event.loaded,
			cx: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}

function _Url_percentEncode(string)
{
	return encodeURIComponent(string);
}

function _Url_percentDecode(string)
{
	try
	{
		return $elm$core$Maybe$Just(decodeURIComponent(string));
	}
	catch (e)
	{
		return $elm$core$Maybe$Nothing;
	}
}


var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$List$cons = _List_cons;
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $author$project$Main$DragEnd = {$: 26};
var $author$project$Main$DragMove = function (a) {
	return {$: 25, a: a};
};
var $elm$core$Basics$False = 1;
var $author$project$Keys$KanbanView = 1;
var $author$project$Main$Loading = {$: 0};
var $elm$core$Maybe$Nothing = {$: 1};
var $author$project$Main$Tick = function (a) {
	return {$: 13, a: a};
};
var $elm$core$Basics$append = _Utils_append;
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\u000A    ',
		A2($elm$core$String$split, '\u000A', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\u000A\u000A(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\u0027' + (f + '\u0027]'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\u000A\u000A',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\u000A\u000A';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\u000A\u000A    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\u000A\u000A' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.l) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.o),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.o);
		} else {
			var treeLen = builder.l * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.p) : builder.p;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.l);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.o) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.o);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{p: nodeList, l: (len / $elm$core$Array$branchFactor) | 0, o: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Timeline$defaultZoom = 0;
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {bX: fragment, b0: host, cg: path, ci: port_, cl: protocol, M: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {ck: processes, cE: taggers};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.ck;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.cE);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$float = _Json_decodeFloat;
var $author$project$Main$GotClock = F3(
	function (a, b, c) {
		return {$: 19, a: a, b: b, c: c};
	});
var $elm$time$Time$here = _Time_here(0);
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0;
	return millis;
};
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.cz, posixMinutes) < 0) {
					return posixMinutes + era.Z;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			24,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var $elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2($elm$time$Time$toAdjustedMinutes, zone, time));
	});
var $author$project$Main$getClock = A2(
	$elm$core$Task$perform,
	function (c) {
		return A3($author$project$Main$GotClock, c.bP, c.Z, c.bs);
	},
	A3(
		$elm$core$Task$map2,
		F2(
			function (zone, now) {
				var utc = ($elm$time$Time$posixToMillis(now) / 60000) | 0;
				var off0 = ((A2($elm$time$Time$toHour, zone, now) * 60) + A2($elm$time$Time$toMinute, zone, now)) - A2($elm$core$Basics$modBy, 1440, utc);
				var off = (off0 > 720) ? (off0 - 1440) : ((_Utils_cmp(off0, -720) < 0) ? (off0 + 1440) : off0);
				return {bP: ((utc + off) / 1440) | 0, bs: utc + off, Z: off};
			}),
		$elm$time$Time$here,
		$elm$time$Time$now));
var $author$project$Main$GotRepos = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm$http$Http$BadBody = function (a) {
	return {$: 4, a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 3, a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$NetworkError = {$: 2};
var $elm$http$Http$Timeout = {$: 1};
var $elm$http$Http$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 0:
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 1:
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 2:
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 3:
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.d0));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			$elm$http$Http$resolve(
				function (string) {
					return A2(
						$elm$core$Result$mapError,
						$elm$json$Json$Decode$errorToString,
						A2($elm$json$Json$Decode$decodeString, decoder, string));
				}));
	});
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {co: reqs, cC: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.ea;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.co));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.cC)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					cO: r.cO,
					bk: r.bk,
					B: A2(_Http_mapExpect, func, r.B),
					dn: r.dn,
					dz: r.dz,
					d6: r.d6,
					ea: r.ea,
					J: r.J
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{cO: false, bk: r.bk, B: r.B, dn: r.dn, dz: r.dz, d6: r.d6, ea: r.ea, J: r.J}));
};
var $elm$http$Http$get = function (r) {
	return $elm$http$Http$request(
		{bk: $elm$http$Http$emptyBody, B: r.B, dn: _List_Nil, dz: 'GET', d6: $elm$core$Maybe$Nothing, ea: $elm$core$Maybe$Nothing, J: r.J});
};
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Types$Repo = F3(
	function (name, dir, backend) {
		return {cS: backend, c5: dir, E: name};
	});
var $elm$json$Json$Decode$map3 = _Json_map3;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Types$repoDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Types$Repo,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'dir', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'backend', $elm$json$Json$Decode$string));
var $author$project$Main$getRepos = $elm$http$Http$get(
	{
		B: A2(
			$elm$http$Http$expectJson,
			$author$project$Main$GotRepos,
			$elm$json$Json$Decode$list($author$project$Types$repoDecoder)),
		J: '/api/repos'
	});
var $author$project$Main$GotThemes = function (a) {
	return {$: 2, a: a};
};
var $author$project$Theme$Scheme = F4(
	function (name, system, variant, palette) {
		return {E: name, cf: palette, d3: system, ef: variant};
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$json$Json$Decode$dict = function (decoder) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Dict$fromList,
		$elm$json$Json$Decode$keyValuePairs(decoder));
};
var $elm$json$Json$Decode$map4 = _Json_map4;
var $author$project$Theme$decoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Theme$Scheme,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'system', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'variant', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'palette',
		$elm$json$Json$Decode$dict($elm$json$Json$Decode$string)));
var $author$project$Main$getThemes = $elm$http$Http$get(
	{
		B: A2(
			$elm$http$Http$expectJson,
			$author$project$Main$GotThemes,
			$elm$json$Json$Decode$list($author$project$Theme$decoder)),
		J: '/api/themes'
	});
var $author$project$Main$Key = function (a) {
	return {$: 12, a: a};
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$json$Json$Decode$map5 = _Json_map5;
var $author$project$Main$keyDecoder = A2(
	$elm$json$Json$Decode$andThen,
	function (mk) {
		if (!mk.$) {
			var k = mk.a;
			return $elm$json$Json$Decode$succeed(
				$author$project$Main$Key(k));
		} else {
			return $elm$json$Json$Decode$fail('not a navigation key');
		}
	},
	A6(
		$elm$json$Json$Decode$map5,
		F5(
			function (k, c, a, m, tag) {
				return (c || (a || (m || ((tag === 'TEXTAREA') || (tag === 'INPUT'))))) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(k);
			}),
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'ctrlKey', $elm$json$Json$Decode$bool),
		A2($elm$json$Json$Decode$field, 'altKey', $elm$json$Json$Decode$bool),
		A2($elm$json$Json$Decode$field, 'metaKey', $elm$json$Json$Decode$bool),
		A2(
			$elm$json$Json$Decode$at,
			_List_fromArray(
				['target', 'tagName']),
			$elm$json$Json$Decode$string)));
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$browser$Browser$Events$Document = 0;
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {ch: pids, cC: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {bW: event, ad: key};
	});
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.ch,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var event = _v0.bW;
		var key = _v0.ad;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.cC);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, 0, 'keydown');
var $elm$browser$Browser$Events$onMouseMove = A2($elm$browser$Browser$Events$on, 0, 'mousemove');
var $elm$browser$Browser$Events$onMouseUp = A2($elm$browser$Browser$Events$on, 0, 'mouseup');
var $author$project$Keys$AddRepo = 5;
var $author$project$Main$Failed = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$Mention = function (a) {
	return {$: 17, a: a};
};
var $author$project$Keys$NewBead = 0;
var $author$project$Main$Pick = function (a) {
	return {$: 11, a: a};
};
var $author$project$Main$Ready = function (a) {
	return {$: 2, a: a};
};
var $author$project$Keys$RemoveRepo = 6;
var $author$project$Keys$Show = function (a) {
	return {$: 17, a: a};
};
var $author$project$Keys$WaterfallView = 3;
var $author$project$Main$NoOp = {$: 36};
var $author$project$Scroll$align = F5(
	function (place, pad, start, size, view) {
		return A2(
			$elm$core$Basics$max,
			0,
			function () {
				switch (place) {
					case 0:
						return start - pad;
					case 1:
						return (start + (size / 2)) - ((pad + view) / 2);
					default:
						return (start + size) - view;
				}
			}());
	});
var $elm$core$Task$onError = _Scheduler_onError;
var $elm$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return $elm$core$Task$command(
			A2(
				$elm$core$Task$onError,
				A2(
					$elm$core$Basics$composeL,
					A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
					$elm$core$Result$Err),
				A2(
					$elm$core$Task$andThen,
					A2(
						$elm$core$Basics$composeL,
						A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
						$elm$core$Result$Ok),
					task)));
	});
var $elm$browser$Browser$Dom$getElement = _Browser_getElement;
var $elm$browser$Browser$Dom$getViewportOf = _Browser_getViewportOf;
var $elm$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return A2(
							$elm$core$Task$andThen,
							function (c) {
								return $elm$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var $elm$browser$Browser$Dom$setViewportOf = _Browser_setViewportOf;
var $author$project$Main$alignSelection = F2(
	function (which, place) {
		var _v0 = function () {
			if (which === 3) {
				return _Utils_Tuple2('wf', 46);
			} else {
				return _Utils_Tuple2('main', 0);
			}
		}();
		var container = _v0.a;
		var pad = _v0.b;
		return A2(
			$elm$core$Task$attempt,
			function (_v3) {
				return $author$project$Main$NoOp;
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					var v = _v2.a;
					var box = _v2.b;
					var el = _v2.c;
					return A3(
						$elm$browser$Browser$Dom$setViewportOf,
						container,
						v.t.ak,
						A5($author$project$Scroll$align, place, pad, (el.X.W - box.X.W) + v.t.W, el.X.aU, v.t.aU));
				},
				A4(
					$elm$core$Task$map3,
					F3(
						function (v, box, el) {
							return _Utils_Tuple3(v, box, el);
						}),
					$elm$browser$Browser$Dom$getViewportOf(container),
					$elm$browser$Browser$Dom$getElement(container),
					$elm$browser$Browser$Dom$getElement('sel'))));
	});
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Timeline$zooms = _List_fromArray(
	[
		{bK: 1440, E: 'day'},
		{bK: 360, E: '6 hours'},
		{bK: 60, E: 'hour'},
		{bK: 15, E: '15 min'},
		{bK: 5, E: '5 min'}
	]);
var $author$project$Timeline$zoomAt = function (i) {
	return A2(
		$elm$core$Maybe$withDefault,
		{bK: 1440, E: 'day'},
		$elm$core$List$head(
			A2(
				$elm$core$List$drop,
				A2(
					$elm$core$Basics$max,
					0,
					A2(
						$elm$core$Basics$min,
						$elm$core$List$length($author$project$Timeline$zooms) - 1,
						i)),
				$author$project$Timeline$zooms)));
};
var $author$project$Main$cellMinutes = function (model) {
	return $author$project$Timeline$zoomAt(model.al).bK;
};
var $author$project$Main$cellW = 40;
var $author$project$Main$clampInt = F3(
	function (lo, hi, n) {
		return A2(
			$elm$core$Basics$max,
			lo,
			A2($elm$core$Basics$min, hi, n));
	});
var $author$project$Main$clockOf = function (model) {
	return {bs: model.F, Z: model.Z};
};
var $elm$json$Json$Encode$int = _Json_wrap;
var $elm$core$Basics$not = _Basics_not;
var $elm$core$String$trim = _String_trim;
var $author$project$Main$linkRef = function (raw) {
	var s = $elm$core$String$trim(raw);
	return (A2($elm$core$String$contains, ':', s) && (!A2($elm$core$String$startsWith, 'external:', s))) ? ('external:' + s) : s;
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$composeFields = function (c) {
	var _v0 = c.dt;
	switch (_v0) {
		case 0:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('create')),
					_Utils_Tuple2(
					'title',
					$elm$json$Json$Encode$string(c.g)),
					_Utils_Tuple2(
					'kind',
					$elm$json$Json$Encode$string('task')),
					_Utils_Tuple2(
					'priority',
					$elm$json$Json$Encode$int(2))
				]);
		case 3:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('setTitle')),
					_Utils_Tuple2(
					'id',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'title',
					$elm$json$Json$Encode$string(c.g))
				]);
		case 7:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('addDep')),
					_Utils_Tuple2(
					'from',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'on',
					$elm$json$Json$Encode$string(
						$elm$core$String$trim(c.g))),
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('parent-child'))
				]);
		case 8:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('removeDep')),
					_Utils_Tuple2(
					'from',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'on',
					$elm$json$Json$Encode$string(
						$elm$core$String$trim(c.g)))
				]);
		case 4:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('addDep')),
					_Utils_Tuple2(
					'from',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'on',
					$elm$json$Json$Encode$string(
						$author$project$Main$linkRef(c.g))),
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('blocks'))
				]);
		case 9:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('addLabel')),
					_Utils_Tuple2(
					'id',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'label',
					$elm$json$Json$Encode$string(
						$elm$core$String$trim(c.g)))
				]);
		case 10:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('removeLabel')),
					_Utils_Tuple2(
					'id',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'label',
					$elm$json$Json$Encode$string(
						$elm$core$String$trim(c.g)))
				]);
		default:
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'op',
					$elm$json$Json$Encode$string('addComment')),
					_Utils_Tuple2(
					'id',
					$elm$json$Json$Encode$string(c.j)),
					_Utils_Tuple2(
					'text',
					$elm$json$Json$Encode$string(c.g))
				]);
	}
};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Theme$defaultIndex = function (schemes) {
	return A2(
		$elm$core$Maybe$withDefault,
		0,
		A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var s = _v0.b;
						return (s.d3 === 'base16') && (s.E === 'Catppuccin Macchiato');
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, schemes)))));
};
var $author$project$Main$RepoRemoved = F2(
	function (a, b) {
		return {$: 10, a: a, b: b};
	});
var $elm$http$Http$expectBytesResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'arraybuffer',
			_Http_toDataView,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$expectWhatever = function (toMsg) {
	return A2(
		$elm$http$Http$expectBytesResponse,
		toMsg,
		$elm$http$Http$resolve(
			function (_v0) {
				return $elm$core$Result$Ok(0);
			}));
};
var $elm$url$Url$percentEncode = _Url_percentEncode;
var $author$project$Main$deleteRepo = function (name) {
	return $elm$http$Http$request(
		{
			bk: $elm$http$Http$emptyBody,
			B: $elm$http$Http$expectWhatever(
				$author$project$Main$RepoRemoved(name)),
			dn: _List_Nil,
			dz: 'DELETE',
			d6: $elm$core$Maybe$Nothing,
			ea: $elm$core$Maybe$Nothing,
			J: '/api/repos/' + $elm$url$Url$percentEncode(name)
		});
};
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Main$deliveryNote = function (ds) {
	return $elm$core$List$isEmpty(ds) ? 'saved' : ('saved; ' + A2(
		$elm$core$String$join,
		', ',
		A2(
			$elm$core$List$map,
			function (d) {
				return d.bl ? ('@' + (d.E + ' got it')) : ('@' + (d.E + (': ' + d.c9)));
			},
			ds)));
};
var $author$project$Nav$firstOf = F2(
	function (i, secs) {
		return A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.a7;
			},
			A2(
				$elm$core$Maybe$andThen,
				$elm$core$List$head,
				$elm$core$List$head(
					A2($elm$core$List$drop, i, secs))));
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$Nav$sectionOf = F2(
	function (id, secs) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					$elm$core$Tuple$second,
					A2(
						$elm$core$List$indexedMap,
						F2(
							function (i, s) {
								return _Utils_Tuple2(
									i,
									A2(
										$elm$core$List$any,
										function (b) {
											return _Utils_eq(b.a7, id);
										},
										s));
							}),
						secs))));
	});
var $author$project$Nav$edge = F3(
	function (dir, sel, secs) {
		var _v0 = A2(
			$elm$core$Maybe$andThen,
			function (i) {
				return $elm$core$List$head(
					A2($elm$core$List$drop, i, secs));
			},
			A2(
				$elm$core$Maybe$andThen,
				function (id) {
					return A2($author$project$Nav$sectionOf, id, secs);
				},
				sel));
		if (_v0.$ === 1) {
			return A2($author$project$Nav$firstOf, 0, secs);
		} else {
			var s = _v0.a;
			return A2(
				$elm$core$Maybe$map,
				function ($) {
					return $.a7;
				},
				(dir < 0) ? $elm$core$List$head(s) : $elm$core$List$head(
					$elm$core$List$reverse(s)));
		}
	});
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$OpDone = function (a) {
	return {$: 8, a: a};
};
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (!result.$) {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Main$expectApi = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			function (response) {
				switch (response.$) {
					case 4:
						var body = response.b;
						return A2(
							$elm$core$Result$mapError,
							$elm$json$Json$Decode$errorToString,
							A2($elm$json$Json$Decode$decodeString, decoder, body));
					case 3:
						var body = response.b;
						return $elm$core$Result$Err(
							A2(
								$elm$core$Result$withDefault,
								body,
								A2(
									$elm$json$Json$Decode$decodeString,
									A2($elm$json$Json$Decode$field, 'error', $elm$json$Json$Decode$string),
									body)));
					case 0:
						var u = response.a;
						return $elm$core$Result$Err('bad url ' + u);
					case 1:
						return $elm$core$Result$Err('timeout');
					default:
						return $elm$core$Result$Err('network error');
				}
			});
	});
var $author$project$Main$OpResult = F2(
	function (id, delivered) {
		return {bl: delivered, a7: id};
	});
var $author$project$Types$Delivery = F3(
	function (name, delivered, error) {
		return {bl: delivered, c9: error, E: name};
	});
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Types$deliveryDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Types$Delivery,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'delivered', $elm$json$Json$Decode$bool),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'error', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])));
var $author$project$Main$opResultDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Main$OpResult,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'delivered',
		$elm$json$Json$Decode$list($author$project$Types$deliveryDecoder)));
var $author$project$Main$expectOp = A2($author$project$Main$expectApi, $author$project$Main$OpDone, $author$project$Main$opResultDecoder);
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$http$Http$post = function (r) {
	return $elm$http$Http$request(
		{bk: r.bk, B: r.B, dn: _List_Nil, dz: 'POST', d6: $elm$core$Maybe$Nothing, ea: $elm$core$Maybe$Nothing, J: r.J});
};
var $author$project$Main$repoUrl = F2(
	function (name, rest) {
		return '/api/repos/' + (name + rest);
	});
var $author$project$Main$postOp = F2(
	function (repo, fields) {
		return $elm$http$Http$post(
			{
				bk: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(fields)),
				B: $author$project$Main$expectOp,
				J: A2($author$project$Main$repoUrl, repo, '/ops')
			});
	});
var $author$project$Agile$accentOf = function (s) {
	switch (s.$) {
		case 0:
			return 'open';
		case 1:
			return 'doing';
		case 2:
			return 'blocked';
		case 5:
			return 'done';
		default:
			return 'other';
	}
};
var $author$project$Board$rank = function (s) {
	switch (s.$) {
		case 4:
			return 0;
		case 0:
			return 1;
		case 1:
			return 2;
		case 2:
			return 3;
		case 3:
			return 4;
		case 7:
			return 5;
		case 5:
			return 6;
		case 6:
			return 7;
		default:
			return 8;
	}
};
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Board$ordered = $elm$core$List$sortBy(
	function (b) {
		return _Utils_Tuple3(
			$author$project$Board$rank(b.aH),
			b.bw,
			b.a7);
	});
var $author$project$Types$statusLabel = function (s) {
	switch (s.$) {
		case 0:
			return 'open';
		case 1:
			return 'in_progress';
		case 2:
			return 'blocked';
		case 3:
			return 'deferred';
		case 4:
			return 'draft';
		case 5:
			return 'closed';
		case 6:
			return 'tombstone';
		case 7:
			return 'pinned';
		default:
			var o = s.a;
			return o;
	}
};
var $author$project$Types$Blocked = {$: 2};
var $author$project$Types$Closed = {$: 5};
var $author$project$Types$InProgress = {$: 1};
var $author$project$Types$Open = {$: 0};
var $author$project$Board$core = _List_fromArray(
	[$author$project$Types$Open, $author$project$Types$InProgress, $author$project$Types$Blocked, $author$project$Types$Closed]);
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Board$statusOrder = function (beads) {
	var present = A2(
		$elm$core$List$map,
		function ($) {
			return $.aH;
		},
		beads);
	var extra = A2(
		$elm$core$List$filter,
		function (s) {
			return !A2($elm$core$List$member, s, $author$project$Board$core);
		},
		present);
	return A2(
		$elm$core$List$sortBy,
		$author$project$Board$rank,
		A3(
			$elm$core$List$foldl,
			F2(
				function (s, acc) {
					return A2($elm$core$List$member, s, acc) ? acc : _Utils_ap(
						acc,
						_List_fromArray(
							[s]));
				}),
			_List_Nil,
			_Utils_ap($author$project$Board$core, extra)));
};
var $author$project$Board$columns = function (beads) {
	return A2(
		$elm$core$List$map,
		function (s) {
			return _Utils_Tuple2(
				s,
				A2(
					$elm$core$List$filter,
					function (b) {
						return _Utils_eq(
							$author$project$Types$statusLabel(b.aH),
							$author$project$Types$statusLabel(s));
					},
					$author$project$Board$ordered(beads)));
		},
		$author$project$Board$statusOrder(beads));
};
var $author$project$Agile$byPrio = $elm$core$List$sortBy(
	function (b) {
		return _Utils_Tuple2(b.bw, b.a7);
	});
var $elm$core$Basics$ge = _Utils_ge;
var $author$project$Calendar$civil = function (days) {
	var z = days + 719468;
	var era = (((z >= 0) ? z : (z - 146096)) / 146097) | 0;
	var doe = z - (era * 146097);
	var yoe = ((((doe - ((doe / 1460) | 0)) + ((doe / 36524) | 0)) - ((doe / 146096) | 0)) / 365) | 0;
	var doy = doe - (((365 * yoe) + ((yoe / 4) | 0)) - ((yoe / 100) | 0));
	var mp = (((5 * doy) + 2) / 153) | 0;
	var m = (mp < 10) ? (mp + 3) : (mp - 9);
	var y = (yoe + (era * 400)) + ((m <= 2) ? 1 : 0);
	var d = (doy - ((((153 * mp) + 2) / 5) | 0)) + 1;
	return {bP: d, a9: m, bi: y};
};
var $author$project$Calendar$fromYmd = F3(
	function (y0, m, d) {
		var y = (m <= 2) ? (y0 - 1) : y0;
		var era = (((y >= 0) ? y : (y - 399)) / 400) | 0;
		var yoe = y - (era * 400);
		var doy = (((((153 * ((m > 2) ? (m - 3) : (m + 9))) + 2) / 5) | 0) + d) - 1;
		var doe = (((yoe * 365) + ((yoe / 4) | 0)) - ((yoe / 100) | 0)) + doy;
		return ((era * 146097) + doe) - 719468;
	});
var $author$project$Calendar$fromIso = function (s) {
	var _v0 = A2(
		$elm$core$List$map,
		$elm$core$String$toInt,
		A2($elm$core$String$split, '-', s));
	if ((((((_v0.b && (!_v0.a.$)) && _v0.b.b) && (!_v0.b.a.$)) && _v0.b.b.b) && (!_v0.b.b.a.$)) && (!_v0.b.b.b.b)) {
		var y = _v0.a.a;
		var _v1 = _v0.b;
		var m = _v1.a.a;
		var _v2 = _v1.b;
		var d = _v2.a.a;
		if ((m >= 1) && ((m <= 12) && (d >= 1))) {
			var n = A3($author$project$Calendar$fromYmd, y, m, d);
			return _Utils_eq(
				$author$project$Calendar$civil(n),
				{bP: d, a9: m, bi: y}) ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
		} else {
			return $elm$core$Maybe$Nothing;
		}
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Schedule$dueDay = function (b) {
	return $author$project$Calendar$fromIso(b.aP);
};
var $author$project$Types$Tombstone = {$: 6};
var $author$project$Agile$isOpen = function (b) {
	return (!_Utils_eq(b.aH, $author$project$Types$Closed)) && (!_Utils_eq(b.aH, $author$project$Types$Tombstone));
};
var $author$project$Calendar$monthName = function (m) {
	switch (m) {
		case 1:
			return 'Jan';
		case 2:
			return 'Feb';
		case 3:
			return 'Mar';
		case 4:
			return 'Apr';
		case 5:
			return 'May';
		case 6:
			return 'Jun';
		case 7:
			return 'Jul';
		case 8:
			return 'Aug';
		case 9:
			return 'Sep';
		case 10:
			return 'Oct';
		case 11:
			return 'Nov';
		default:
			return 'Dec';
	}
};
var $author$project$Agile$span = function (from) {
	var b = $author$project$Calendar$civil(from + 6);
	var a = $author$project$Calendar$civil(from);
	return $author$project$Calendar$monthName(a.a9) + (' ' + ($elm$core$String$fromInt(a.bP) + (' – ' + ((_Utils_eq(a.a9, b.a9) ? '' : ($author$project$Calendar$monthName(b.a9) + ' ')) + $elm$core$String$fromInt(b.bP)))));
};
var $elm$core$List$sum = function (numbers) {
	return A3($elm$core$List$foldl, $elm$core$Basics$add, 0, numbers);
};
var $author$project$Agile$weekStart = function (day) {
	return day - A2($elm$core$Basics$modBy, 7, day + 3);
};
var $author$project$Schedule$width = function (b) {
	return A2($elm$core$Basics$max, 1, b.a5);
};
var $author$project$Agile$iterationCols = F2(
	function (today, beads) {
		var live = A2($elm$core$List$filter, $author$project$Agile$isOpen, beads);
		var due = function (b) {
			return $author$project$Schedule$dueDay(b);
		};
		var days = function (bs) {
			return $elm$core$String$fromInt(
				$elm$core$List$sum(
					A2($elm$core$List$map, $author$project$Schedule$width, bs))) + ' days of work';
		};
		var cur = $author$project$Agile$weekStart(today);
		var inWeek = F2(
			function (i, b) {
				return A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						function (d) {
							return (_Utils_cmp(d, cur + (7 * i)) > -1) && (_Utils_cmp(d, cur + (7 * (i + 1))) < 0);
						},
						due(b)));
			});
		var col = F3(
			function (title, accent, bs) {
				return {
					ax: accent,
					aA: $author$project$Agile$byPrio(bs),
					aF: days(bs),
					au: title
				};
			});
		var weeks = A2(
			$elm$core$List$map,
			function (i) {
				return A3(
					col,
					(!i) ? 'This week' : $author$project$Agile$span(cur + (7 * i)),
					(!i) ? 'doing' : 'open',
					A2(
						$elm$core$List$filter,
						inWeek(i),
						live));
			},
			A2($elm$core$List$range, 0, 5));
		return A2(
			$elm$core$List$cons,
			A3(
				col,
				'Overdue',
				'blocked',
				A2(
					$elm$core$List$filter,
					function (b) {
						return A2(
							$elm$core$Maybe$withDefault,
							false,
							A2(
								$elm$core$Maybe$map,
								function (d) {
									return _Utils_cmp(d, cur) < 0;
								},
								due(b)));
					},
					live)),
			_Utils_ap(
				weeks,
				_List_fromArray(
					[
						A3(
						col,
						'Later',
						'other',
						A2(
							$elm$core$List$filter,
							function (b) {
								return A2(
									$elm$core$Maybe$withDefault,
									false,
									A2(
										$elm$core$Maybe$map,
										function (d) {
											return _Utils_cmp(d, cur + 42) > -1;
										},
										due(b)));
							},
							live)),
						A3(
						col,
						'Unscheduled',
						'other',
						A2(
							$elm$core$List$filter,
							function (b) {
								return _Utils_eq(
									due(b),
									$elm$core$Maybe$Nothing);
							},
							live))
					])));
	});
var $author$project$Agile$roadmapCols = F2(
	function (today, beads) {
		var live = A2($elm$core$List$filter, $author$project$Agile$isOpen, beads);
		var dueIn = function (b) {
			return A2(
				$elm$core$Maybe$map,
				function (d) {
					return d - today;
				},
				$author$project$Schedule$dueDay(b));
		};
		var isNext = function (b) {
			return (b.bw <= 1) || A2(
				$elm$core$Maybe$withDefault,
				false,
				A2(
					$elm$core$Maybe$map,
					function (n) {
						return n <= 42;
					},
					dueIn(b)));
		};
		var isNow = function (b) {
			return _Utils_eq(b.aH, $author$project$Types$InProgress) || (_Utils_eq(b.aH, $author$project$Types$Blocked) || (_Utils_eq(b.aH, $author$project$Types$Open) && A2(
				$elm$core$Maybe$withDefault,
				false,
				A2(
					$elm$core$Maybe$map,
					function (n) {
						return n <= 14;
					},
					dueIn(b)))));
		};
		var now = A2($elm$core$List$filter, isNow, live);
		var rest = A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isNow),
			live);
		var later = A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isNext),
			rest);
		var next = A2($elm$core$List$filter, isNext, rest);
		var col = F4(
			function (title, accent, note, bs) {
				return {
					ax: accent,
					aA: $author$project$Agile$byPrio(bs),
					aF: note,
					au: title
				};
			});
		return _List_fromArray(
			[
				A4(col, 'Now', 'doing', 'in progress, blocked, or due in 2 weeks', now),
				A4(col, 'Next', 'open', 'urgent, or due in 6 weeks', next),
				A4(col, 'Later', 'other', 'everything else still open', later)
			]);
	});
var $author$project$Agile$isEpic = function (b) {
	return b.dt === 'epic';
};
var $author$project$Agile$epicGroups = function (beads) {
	var loose = $author$project$Agile$byPrio(
		A2(
			$elm$core$List$filter,
			function (b) {
				return (!$author$project$Agile$isEpic(b)) && $elm$core$List$isEmpty(b.bV);
			},
			beads));
	var epics = $author$project$Agile$byPrio(
		A2($elm$core$List$filter, $author$project$Agile$isEpic, beads));
	var childrenOf = function (e) {
		return $author$project$Agile$byPrio(
			A2(
				$elm$core$List$filter,
				function (b) {
					return (!$author$project$Agile$isEpic(b)) && A2(
						$elm$core$List$any,
						function (r) {
							return _Utils_eq(r.a7, e.a7);
						},
						b.bV);
				},
				beads));
	};
	return _Utils_ap(
		A2(
			$elm$core$List$map,
			function (e) {
				return {
					aB: childrenOf(e),
					a4: $elm$core$Maybe$Just(e)
				};
			},
			epics),
		$elm$core$List$isEmpty(loose) ? _List_Nil : _List_fromArray(
			[
				{aB: loose, a4: $elm$core$Maybe$Nothing}
			]));
};
var $author$project$Agile$progress = function (bs) {
	return _Utils_Tuple2(
		$elm$core$List$length(
			A2(
				$elm$core$List$filter,
				function (b) {
					return _Utils_eq(b.aH, $author$project$Types$Closed);
				},
				bs)),
		$elm$core$List$length(bs));
};
var $author$project$Agile$storyCols = function (beads) {
	return A2(
		$elm$core$List$map,
		function (g) {
			var _v0 = $author$project$Agile$progress(g.aB);
			var done = _v0.a;
			var total = _v0.b;
			var _v1 = g.a4;
			if (!_v1.$) {
				var e = _v1.a;
				return {
					ax: 'epic',
					aA: A2($elm$core$List$cons, e, g.aB),
					aF: $elm$core$String$fromInt(done) + ('/' + ($elm$core$String$fromInt(total) + ' done')),
					au: e.au
				};
			} else {
				return {
					ax: 'other',
					aA: g.aB,
					aF: $elm$core$String$fromInt(total) + ' stories',
					au: 'No epic'
				};
			}
		},
		$author$project$Agile$epicGroups(beads));
};
var $author$project$Agile$columnsFor = F3(
	function (today, view, beads) {
		switch (view) {
			case 1:
				return $elm$core$Maybe$Just(
					A2(
						$elm$core$List$map,
						function (_v1) {
							var s = _v1.a;
							var bs = _v1.b;
							return {
								ax: $author$project$Agile$accentOf(s),
								aA: bs,
								aF: '',
								au: $author$project$Types$statusLabel(s)
							};
						},
						$author$project$Board$columns(beads)));
			case 5:
				return $elm$core$Maybe$Just(
					$author$project$Agile$storyCols(beads));
			case 6:
				return $elm$core$Maybe$Just(
					A2($author$project$Agile$roadmapCols, today, beads));
			case 7:
				return $elm$core$Maybe$Just(
					A2($author$project$Agile$iterationCols, today, beads));
			default:
				return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $author$project$Agile$bucketOf = function (b) {
	return (b.a5 <= 0) ? 0 : ((b.a5 <= 1) ? 1 : ((b.a5 <= 3) ? 2 : ((b.a5 <= 7) ? 3 : 4)));
};
var $author$project$Agile$matrixCell = F3(
	function (prio, bucket, beads) {
		return A2(
			$elm$core$List$sortBy,
			function ($) {
				return $.a7;
			},
			A2(
				$elm$core$List$filter,
				function (b) {
					return $author$project$Agile$isOpen(b) && (_Utils_eq(b.bw, prio) && _Utils_eq(
						$author$project$Agile$bucketOf(b),
						bucket));
				},
				beads));
	});
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $author$project$Timeline$duration = function (b) {
	return (b.da > 0) ? b.da : 1440;
};
var $author$project$Timeline$endOf = F2(
	function (offset, b) {
		return A2(
			$elm$core$Maybe$map,
			function (ms) {
				return ((ms / 60000) | 0) + offset;
			},
			b.c8);
	});
var $author$project$Timeline$spans = F2(
	function (c, beads) {
		return A2(
			$elm$core$List$sortBy,
			function (s) {
				return s.bf ? _Utils_Tuple3(0, s.cz, s.bH.a7) : _Utils_Tuple3(1, 0, s.bH.a7);
			},
			A2(
				$elm$core$List$map,
				function (b) {
					var _v0 = A2($author$project$Timeline$endOf, c.Z, b);
					if (!_v0.$) {
						var e = _v0.a;
						return {
							bH: b,
							Q: e,
							bf: true,
							cz: e - $author$project$Timeline$duration(b)
						};
					} else {
						return {bH: b, Q: c.bs, bf: false, cz: c.bs};
					}
				},
				beads));
	});
var $author$project$Nav$order = F3(
	function (today, view, beads) {
		var _v0 = _Utils_Tuple2(
			view,
			A3($author$project$Agile$columnsFor, today, view, beads));
		_v0$1:
		while (true) {
			switch (_v0.a) {
				case 3:
					var _v1 = _v0.a;
					return A2(
						$elm$core$List$map,
						function ($) {
							return $.bH;
						},
						A2(
							$author$project$Timeline$spans,
							{bs: 0, Z: 0},
							beads));
				case 4:
					if (!_v0.b.$) {
						break _v0$1;
					} else {
						var _v2 = _v0.a;
						return A2(
							$elm$core$List$concatMap,
							function (g) {
								return function (e) {
									return _Utils_ap(e, g.aB);
								}(
									A2(
										$elm$core$Maybe$withDefault,
										_List_Nil,
										A2($elm$core$Maybe$map, $elm$core$List$singleton, g.a4)));
							},
							$author$project$Agile$epicGroups(beads));
					}
				case 9:
					if (!_v0.b.$) {
						break _v0$1;
					} else {
						var _v3 = _v0.a;
						return A2(
							$elm$core$List$concatMap,
							function (p) {
								return A2(
									$elm$core$List$concatMap,
									function (c) {
										return A3($author$project$Agile$matrixCell, p, c, beads);
									},
									A2($elm$core$List$range, 0, 4));
							},
							A2($elm$core$List$range, 0, 4));
					}
				case 10:
					if (!_v0.b.$) {
						break _v0$1;
					} else {
						var _v4 = _v0.a;
						return _List_Nil;
					}
				case 8:
					if (!_v0.b.$) {
						break _v0$1;
					} else {
						var _v5 = _v0.a;
						return _List_Nil;
					}
				default:
					if (!_v0.b.$) {
						break _v0$1;
					} else {
						return $author$project$Board$ordered(beads);
					}
			}
		}
		var cols = _v0.b.a;
		return A2(
			$elm$core$List$concatMap,
			function ($) {
				return $.aA;
			},
			cols);
	});
var $author$project$Main$visible = function (model) {
	var _v0 = model.aA;
	if (_v0.$ === 2) {
		var bs = _v0.a;
		return A3($author$project$Nav$order, model.y, model.c, bs);
	} else {
		return _List_Nil;
	}
};
var $author$project$Main$selected = function (model) {
	var vs = $author$project$Main$visible(model);
	var _v0 = A2(
		$elm$core$Maybe$andThen,
		function (id) {
			return $elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (b) {
						return _Utils_eq(b.a7, id);
					},
					vs));
		},
		model.x);
	if (!_v0.$) {
		var b = _v0.a;
		return $elm$core$Maybe$Just(b);
	} else {
		return $elm$core$List$head(vs);
	}
};
var $author$project$Main$target = function (model) {
	var _v0 = model.r;
	if (!_v0.$) {
		var d = _v0.a;
		var _v1 = d.bH;
		if (_v1.$ === 2) {
			var b = _v1.a;
			return $elm$core$Maybe$Just(b);
		} else {
			return $author$project$Main$selected(model);
		}
	} else {
		return $author$project$Main$selected(model);
	}
};
var $author$project$Main$edit = F2(
	function (model, fields) {
		var _v0 = _Utils_Tuple2(
			$author$project$Main$target(model),
			model.d);
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var b = _v0.a.a;
			var repo = _v0.b.a;
			return _Utils_Tuple2(
				model,
				A2(
					$author$project$Main$postOp,
					repo,
					fields(b)));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $elm$core$String$endsWith = _String_endsWith;
var $elm$browser$Browser$Dom$focus = _Browser_call('focus');
var $author$project$Main$focusComposer = A2(
	$elm$core$Task$attempt,
	function (_v0) {
		return $author$project$Main$NoOp;
	},
	$elm$browser$Browser$Dom$focus('composer'));
var $author$project$Main$focusFinder = A2(
	$elm$core$Task$attempt,
	function (_v0) {
		return $author$project$Main$NoOp;
	},
	$elm$browser$Browser$Dom$focus('finder'));
var $author$project$Timeline$floorTo = F2(
	function (cell, m) {
		return cell * $elm$core$Basics$floor(m / cell);
	});
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$List$minimum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$min, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Timeline$window = F4(
	function (cell, focus, c, ss) {
		var last = A2(
			$elm$core$Maybe$withDefault,
			c.bs,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$cons,
					c.bs,
					A2(
						$elm$core$List$map,
						function ($) {
							return $.Q;
						},
						ss))));
		var to = A2($author$project$Timeline$floorTo, cell, last + (24 * cell));
		var first = A2(
			$elm$core$Maybe$withDefault,
			c.bs,
			$elm$core$List$minimum(
				A2(
					$elm$core$List$cons,
					c.bs,
					A2(
						$elm$core$List$map,
						function ($) {
							return $.cz;
						},
						ss))));
		var from = A2($author$project$Timeline$floorTo, cell, first - (8 * cell));
		var cells = (((to - from) / cell) | 0) + 1;
		if (cells <= 700) {
			return _Utils_Tuple2(
				from,
				from + ((A2($elm$core$Basics$max, 48, cells) - 1) * cell));
		} else {
			var f = A2($author$project$Timeline$floorTo, cell, focus) - (150 * cell);
			return _Utils_Tuple2(f, f + (699 * cell));
		}
	});
var $author$project$Main$focusScroll = function (model) {
	var _v0 = model.aA;
	if (_v0.$ === 2) {
		var bs = _v0.a;
		var focus = A2($elm$core$Maybe$withDefault, model.F, model.aS);
		var cell = $author$project$Main$cellMinutes(model);
		var _v1 = A4(
			$author$project$Timeline$window,
			cell,
			focus,
			$author$project$Main$clockOf(model),
			A2(
				$author$project$Timeline$spans,
				$author$project$Main$clockOf(model),
				bs));
		var from = _v1.a;
		var x = (260 + ((((focus - from) * $author$project$Main$cellW) / cell) | 0)) - 320;
		return A2(
			$elm$core$Task$attempt,
			function (_v2) {
				return $author$project$Main$NoOp;
			},
			A2(
				$elm$core$Task$andThen,
				function (v) {
					return A3(
						$elm$browser$Browser$Dom$setViewportOf,
						'wf',
						A2($elm$core$Basics$max, 0, x),
						v.t.W);
				},
				$elm$browser$Browser$Dom$getViewportOf('wf')));
	} else {
		return $elm$core$Platform$Cmd$none;
	}
};
var $author$project$Main$focusThemePicker = A2(
	$elm$core$Task$attempt,
	function (_v0) {
		return $author$project$Main$NoOp;
	},
	$elm$browser$Browser$Dom$focus('theme-picker'));
var $author$project$Main$GotBead = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $author$project$Types$Bead = function (id) {
	return function (title) {
		return function (description) {
			return function (status) {
				return function (kind) {
					return function (priority) {
						return function (assignee) {
							return function (owner) {
								return function (labels) {
									return function (depCount) {
										return function (dependentCount) {
											return function (deps) {
												return function (due) {
													return function (estDays) {
														return function (dueMs) {
															return function (estMin) {
																return function (epics) {
																	return function (createdMs) {
																		return function (updatedMs) {
																			return function (closedMs) {
																				return {az: assignee, cY: closedMs, c$: createdMs, c3: depCount, c4: dependentCount, bS: deps, bT: description, aP: due, c8: dueMs, bV: epics, a5: estDays, da: estMin, a7: id, dt: kind, b4: labels, dQ: owner, bw: priority, aH: status, au: title, ed: updatedMs};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Types$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Types$Dep = F2(
	function (on, kind) {
		return {dt: kind, dL: on};
	});
var $author$project$Types$depDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Types$Dep,
	A2($elm$json$Json$Decode$field, 'on', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Types$EpicRef = F2(
	function (id, title) {
		return {a7: id, au: title};
	});
var $author$project$Types$epicRefDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Types$EpicRef,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string));
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $author$project$Types$Deferred = {$: 3};
var $author$project$Types$Draft = {$: 4};
var $author$project$Types$Other = function (a) {
	return {$: 8, a: a};
};
var $author$project$Types$Pinned = {$: 7};
var $author$project$Types$statusFromString = function (s) {
	switch (s) {
		case 'open':
			return $author$project$Types$Open;
		case 'in_progress':
			return $author$project$Types$InProgress;
		case 'blocked':
			return $author$project$Types$Blocked;
		case 'deferred':
			return $author$project$Types$Deferred;
		case 'draft':
			return $author$project$Types$Draft;
		case 'closed':
			return $author$project$Types$Closed;
		case 'tombstone':
			return $author$project$Types$Tombstone;
		case 'pinned':
			return $author$project$Types$Pinned;
		default:
			return $author$project$Types$Other(s);
	}
};
var $author$project$Types$beadDecoder = A2(
	$author$project$Types$andMap,
	A2(
		$elm$json$Json$Decode$field,
		'closedMs',
		$elm$json$Json$Decode$nullable($elm$json$Json$Decode$int)),
	A2(
		$author$project$Types$andMap,
		A2($elm$json$Json$Decode$field, 'updatedMs', $elm$json$Json$Decode$int),
		A2(
			$author$project$Types$andMap,
			A2($elm$json$Json$Decode$field, 'createdMs', $elm$json$Json$Decode$int),
			A2(
				$author$project$Types$andMap,
				A2(
					$elm$json$Json$Decode$field,
					'epics',
					$elm$json$Json$Decode$list($author$project$Types$epicRefDecoder)),
				A2(
					$author$project$Types$andMap,
					A2($elm$json$Json$Decode$field, 'estMin', $elm$json$Json$Decode$int),
					A2(
						$author$project$Types$andMap,
						A2(
							$elm$json$Json$Decode$field,
							'dueMs',
							$elm$json$Json$Decode$nullable($elm$json$Json$Decode$int)),
						A2(
							$author$project$Types$andMap,
							A2($elm$json$Json$Decode$field, 'estDays', $elm$json$Json$Decode$int),
							A2(
								$author$project$Types$andMap,
								A2($elm$json$Json$Decode$field, 'due', $elm$json$Json$Decode$string),
								A2(
									$author$project$Types$andMap,
									A2(
										$elm$json$Json$Decode$field,
										'deps',
										$elm$json$Json$Decode$list($author$project$Types$depDecoder)),
									A2(
										$author$project$Types$andMap,
										A2($elm$json$Json$Decode$field, 'dependentCount', $elm$json$Json$Decode$int),
										A2(
											$author$project$Types$andMap,
											A2($elm$json$Json$Decode$field, 'depCount', $elm$json$Json$Decode$int),
											A2(
												$author$project$Types$andMap,
												A2(
													$elm$json$Json$Decode$field,
													'labels',
													$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
												A2(
													$author$project$Types$andMap,
													A2($elm$json$Json$Decode$field, 'owner', $elm$json$Json$Decode$string),
													A2(
														$author$project$Types$andMap,
														A2($elm$json$Json$Decode$field, 'assignee', $elm$json$Json$Decode$string),
														A2(
															$author$project$Types$andMap,
															A2($elm$json$Json$Decode$field, 'priority', $elm$json$Json$Decode$int),
															A2(
																$author$project$Types$andMap,
																A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string),
																A2(
																	$author$project$Types$andMap,
																	A2(
																		$elm$json$Json$Decode$map,
																		$author$project$Types$statusFromString,
																		A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string)),
																	A2(
																		$author$project$Types$andMap,
																		A2($elm$json$Json$Decode$field, 'description', $elm$json$Json$Decode$string),
																		A2(
																			$author$project$Types$andMap,
																			A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
																			A2(
																				$author$project$Types$andMap,
																				A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
																				$elm$json$Json$Decode$succeed($author$project$Types$Bead)))))))))))))))))))));
var $author$project$Main$getBead = F2(
	function (name, id) {
		return $elm$http$Http$get(
			{
				B: A2(
					$elm$http$Http$expectJson,
					$author$project$Main$GotBead(id),
					$author$project$Types$beadDecoder),
				J: A2($author$project$Main$repoUrl, name, '/beads/' + id)
			});
	});
var $author$project$Main$GotBeads = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $author$project$Main$getBeads = function (name) {
	return $elm$http$Http$get(
		{
			B: A2(
				$elm$http$Http$expectJson,
				$author$project$Main$GotBeads(name),
				$elm$json$Json$Decode$list($author$project$Types$beadDecoder)),
			J: A2($author$project$Main$repoUrl, name, '/beads')
		});
};
var $author$project$Main$GotComments = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $author$project$Types$Comment = F4(
	function (id, author, text, created) {
		return {cQ: author, bO: created, a7: id, g: text};
	});
var $author$project$Types$commentDecoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Types$Comment,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'author', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'created', $elm$json$Json$Decode$string));
var $author$project$Main$getComments = F2(
	function (name, id) {
		return $elm$http$Http$get(
			{
				B: A2(
					$elm$http$Http$expectJson,
					$author$project$Main$GotComments(id),
					$elm$json$Json$Decode$list($author$project$Types$commentDecoder)),
				J: A2($author$project$Main$repoUrl, name, '/beads/' + (id + '/comments'))
			});
	});
var $author$project$Main$GotEdges = F2(
	function (a, b) {
		return {$: 6, a: a, b: b};
	});
var $author$project$Types$Edge = F4(
	function (from, toRepo, to, kind) {
		return {bY: from, dt: kind, d7: to, d8: toRepo};
	});
var $author$project$Types$edgeDecoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Types$Edge,
	A2($elm$json$Json$Decode$field, 'from', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'toRepo', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'to', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Main$getEdges = function (name) {
	return $elm$http$Http$get(
		{
			B: A2(
				$elm$http$Http$expectJson,
				$author$project$Main$GotEdges(name),
				$elm$json$Json$Decode$list($author$project$Types$edgeDecoder)),
			J: A2($author$project$Main$repoUrl, name, '/edges')
		});
};
var $author$project$Main$GotHits = F3(
	function (a, b, c) {
		return {$: 28, a: a, b: b, c: c};
	});
var $author$project$Types$Hit = F6(
	function (repo, id, title, status, field, snippet) {
		return {dj: field, a7: id, a_: repo, d$: snippet, aH: status, au: title};
	});
var $elm$json$Json$Decode$map6 = _Json_map6;
var $author$project$Types$hitDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Types$Hit,
	A2($elm$json$Json$Decode$field, 'repo', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'field', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'snippet', $elm$json$Json$Decode$string));
var $author$project$Main$getHits = F2(
	function (query, fuzzy) {
		return $elm$http$Http$get(
			{
				B: A2(
					$elm$http$Http$expectJson,
					A2($author$project$Main$GotHits, query, fuzzy),
					A2(
						$elm$json$Json$Decode$field,
						'hits',
						$elm$json$Json$Decode$list($author$project$Types$hitDecoder))),
				J: '/api/search?mode=' + ((fuzzy ? 'fuzzy' : 'exact') + ('&q=' + $elm$url$Url$percentEncode(query)))
			});
	});
var $author$project$Main$GotMetrics = F2(
	function (a, b) {
		return {$: 21, a: a, b: b};
	});
var $author$project$Metrics$Aged = F3(
	function (id, title, hours) {
		return {b1: hours, a7: id, au: title};
	});
var $author$project$Metrics$AgentCap = F2(
	function (agent, capacity) {
		return {cN: agent, a3: capacity};
	});
var $author$project$Metrics$Metrics = function (beads) {
	return function (closed) {
		return function (wip) {
			return function (blocked) {
				return function (pointsTotal) {
					return function (pointsDone) {
						return function (pointsRemaining) {
							return function (weighed) {
								return function (velocity) {
									return function (avgVelocity) {
										return function (forecastWeeks) {
											return function (reports) {
												return function (outcomes) {
													return function (successRate) {
														return function (reworkRate) {
															return function (testPassPct) {
																return function (estimateSamples) {
																	return function (estimateMape) {
																		return function (estimateBias) {
																			return function (minutesPerPoint) {
																				return function (tokensPerPoint) {
																					return function (costCentsPerPoint) {
																						return function (flowEfficiency) {
																							return function (agents) {
																								return function (capacity) {
																									return function (utilization) {
																										return function (aging) {
																											return function (weights) {
																												return function (complexity) {
																													return function (findings) {
																														return function (lowConfid) {
																															return function (leadMedianH) {
																																return {bj: agents, bE: aging, cR: avgVelocity, aA: beads, bI: blocked, a3: capacity, bM: closed, cZ: complexity, c_: costCentsPerPoint, db: estimateBias, dc: estimateMape, dd: estimateSamples, dk: findings, dl: flowEfficiency, dm: forecastWeeks, du: leadMedianH, dy: lowConfid, dB: minutesPerPoint, cb: outcomes, dR: pointsDone, dS: pointsRemaining, dT: pointsTotal, cn: reports, cr: reworkRate, cD: successRate, bC: testPassPct, d9: tokensPerPoint, ee: utilization, cI: velocity, eg: weighed, eh: weights, ei: wip};
																															};
																														};
																													};
																												};
																											};
																										};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Metrics$Week = F3(
	function (start, points, closed) {
		return {bM: closed, bu: points, cz: start};
	});
var $author$project$Metrics$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Metrics$int = function (name) {
	return A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$int);
};
var $author$project$Metrics$Level = F3(
	function (level, beads, success) {
		return {aA: beads, dx: level, bA: success};
	});
var $author$project$Metrics$levelDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Metrics$Level,
	$author$project$Metrics$int('level'),
	$author$project$Metrics$int('beads'),
	$author$project$Metrics$int('success'));
var $author$project$Metrics$list = F2(
	function (name, d) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$field,
					name,
					$elm$json$Json$Decode$list(d)),
					$elm$json$Json$Decode$succeed(_List_Nil)
				]));
	});
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$Metrics$opt = function (name) {
	return $elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$float));
};
var $author$project$Metrics$decoder = A2(
	$author$project$Metrics$andMap,
	A2($elm$json$Json$Decode$field, 'leadMedianH', $elm$json$Json$Decode$float),
	A2(
		$author$project$Metrics$andMap,
		$author$project$Metrics$int('lowConfid'),
		A2(
			$author$project$Metrics$andMap,
			$author$project$Metrics$int('findings'),
			A2(
				$author$project$Metrics$andMap,
				A2($author$project$Metrics$list, 'complexity', $author$project$Metrics$levelDecoder),
				A2(
					$author$project$Metrics$andMap,
					A2($author$project$Metrics$list, 'weights', $author$project$Metrics$levelDecoder),
					A2(
						$author$project$Metrics$andMap,
						A2(
							$author$project$Metrics$list,
							'aging',
							A4(
								$elm$json$Json$Decode$map3,
								$author$project$Metrics$Aged,
								A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
								A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
								A2($elm$json$Json$Decode$field, 'hours', $elm$json$Json$Decode$float))),
						A2(
							$author$project$Metrics$andMap,
							$author$project$Metrics$opt('utilization'),
							A2(
								$author$project$Metrics$andMap,
								$author$project$Metrics$int('capacity'),
								A2(
									$author$project$Metrics$andMap,
									A2(
										$author$project$Metrics$list,
										'agents',
										A3(
											$elm$json$Json$Decode$map2,
											$author$project$Metrics$AgentCap,
											A2($elm$json$Json$Decode$field, 'agent', $elm$json$Json$Decode$string),
											$author$project$Metrics$int('capacity'))),
									A2(
										$author$project$Metrics$andMap,
										$author$project$Metrics$opt('flowEfficiency'),
										A2(
											$author$project$Metrics$andMap,
											$author$project$Metrics$opt('costCentsPerPoint'),
											A2(
												$author$project$Metrics$andMap,
												$author$project$Metrics$opt('tokensPerPoint'),
												A2(
													$author$project$Metrics$andMap,
													$author$project$Metrics$opt('minutesPerPoint'),
													A2(
														$author$project$Metrics$andMap,
														$author$project$Metrics$opt('estimateBias'),
														A2(
															$author$project$Metrics$andMap,
															$author$project$Metrics$opt('estimateMape'),
															A2(
																$author$project$Metrics$andMap,
																$author$project$Metrics$int('estimateSamples'),
																A2(
																	$author$project$Metrics$andMap,
																	$author$project$Metrics$opt('testPassPct'),
																	A2(
																		$author$project$Metrics$andMap,
																		$author$project$Metrics$opt('reworkRate'),
																		A2(
																			$author$project$Metrics$andMap,
																			$author$project$Metrics$opt('successRate'),
																			A2(
																				$author$project$Metrics$andMap,
																				$elm$json$Json$Decode$oneOf(
																					_List_fromArray(
																						[
																							A2(
																							$elm$json$Json$Decode$field,
																							'outcomes',
																							$elm$json$Json$Decode$keyValuePairs($elm$json$Json$Decode$int)),
																							$elm$json$Json$Decode$succeed(_List_Nil)
																						])),
																				A2(
																					$author$project$Metrics$andMap,
																					$author$project$Metrics$int('reports'),
																					A2(
																						$author$project$Metrics$andMap,
																						$author$project$Metrics$opt('forecastWeeks'),
																						A2(
																							$author$project$Metrics$andMap,
																							$author$project$Metrics$opt('avgVelocity'),
																							A2(
																								$author$project$Metrics$andMap,
																								A2(
																									$author$project$Metrics$list,
																									'velocity',
																									A4(
																										$elm$json$Json$Decode$map3,
																										$author$project$Metrics$Week,
																										A2($elm$json$Json$Decode$field, 'start', $elm$json$Json$Decode$string),
																										$author$project$Metrics$int('points'),
																										$author$project$Metrics$int('closed'))),
																								A2(
																									$author$project$Metrics$andMap,
																									$author$project$Metrics$int('weighed'),
																									A2(
																										$author$project$Metrics$andMap,
																										$author$project$Metrics$int('pointsRemaining'),
																										A2(
																											$author$project$Metrics$andMap,
																											$author$project$Metrics$int('pointsDone'),
																											A2(
																												$author$project$Metrics$andMap,
																												$author$project$Metrics$int('pointsTotal'),
																												A2(
																													$author$project$Metrics$andMap,
																													$author$project$Metrics$int('blocked'),
																													A2(
																														$author$project$Metrics$andMap,
																														$author$project$Metrics$int('wip'),
																														A2(
																															$author$project$Metrics$andMap,
																															$author$project$Metrics$int('closed'),
																															A2(
																																$author$project$Metrics$andMap,
																																$author$project$Metrics$int('beads'),
																																$elm$json$Json$Decode$succeed($author$project$Metrics$Metrics)))))))))))))))))))))))))))))))));
var $author$project$Main$getMetrics = function (name) {
	return $elm$http$Http$get(
		{
			B: A2(
				$elm$http$Http$expectJson,
				$author$project$Main$GotMetrics(name),
				$author$project$Metrics$decoder),
			J: A2($author$project$Main$repoUrl, name, '/metrics')
		});
};
var $author$project$Main$GotSessions = function (a) {
	return {$: 5, a: a};
};
var $author$project$Types$Session = F3(
	function (nick, cwd, status) {
		return {c0: cwd, br: nick, aH: status};
	});
var $author$project$Types$sessionDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Types$Session,
	A2($elm$json$Json$Decode$field, 'nick', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'cwd', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string));
var $author$project$Main$getSessions = $elm$http$Http$get(
	{
		B: A2(
			$elm$http$Http$expectJson,
			$author$project$Main$GotSessions,
			$elm$json$Json$Decode$list($author$project$Types$sessionDecoder)),
		J: '/api/sessions'
	});
var $author$project$Main$GotVersion = F2(
	function (a, b) {
		return {$: 7, a: a, b: b};
	});
var $author$project$Main$getVersion = function (name) {
	return $elm$http$Http$get(
		{
			B: A2(
				$elm$http$Http$expectJson,
				$author$project$Main$GotVersion(name),
				A2($elm$json$Json$Decode$field, 'v', $elm$json$Json$Decode$string)),
			J: A2($author$project$Main$repoUrl, name, '/version')
		});
};
var $author$project$Main$httpError = function (e) {
	switch (e.$) {
		case 0:
			var u = e.a;
			return 'bad url ' + u;
		case 1:
			return 'timeout';
		case 2:
			return 'network error';
		case 3:
			var code = e.a;
			return 'status ' + $elm$core$String$fromInt(code);
		default:
			var b = e.a;
			return b;
	}
};
var $elm$core$String$indices = _String_indexes;
var $author$project$Scroll$into = F6(
	function (scroll, pad, start, size, view, margin) {
		return (_Utils_cmp(start - margin, scroll + pad) < 0) ? A2($elm$core$Basics$max, 0, (start - margin) - pad) : ((_Utils_cmp((start + size) + margin, scroll + view) > 0) ? (((start + size) + margin) - view) : scroll);
	});
var $author$project$Main$reveal = function (which) {
	var _v0 = function () {
		if (which === 3) {
			return _Utils_Tuple2('wf', 46);
		} else {
			return _Utils_Tuple2('main', 0);
		}
	}();
	var container = _v0.a;
	var pad = _v0.b;
	return A2(
		$elm$core$Task$attempt,
		function (_v3) {
			return $author$project$Main$NoOp;
		},
		A2(
			$elm$core$Task$andThen,
			function (_v2) {
				var v = _v2.a;
				var box = _v2.b;
				var el = _v2.c;
				var y = (el.X.W - box.X.W) + v.t.W;
				var x = (el.X.ak - box.X.ak) + v.t.ak;
				return A3(
					$elm$browser$Browser$Dom$setViewportOf,
					container,
					(which === 3) ? v.t.ak : A6($author$project$Scroll$into, v.t.ak, 0, x, el.X.cL, v.t.cL, 16),
					A6($author$project$Scroll$into, v.t.W, pad, y, el.X.aU, v.t.aU, 16));
			},
			A4(
				$elm$core$Task$map3,
				F3(
					function (v, box, el) {
						return _Utils_Tuple3(v, box, el);
					}),
				$elm$browser$Browser$Dom$getViewportOf(container),
				$elm$browser$Browser$Dom$getElement(container),
				$elm$browser$Browser$Dom$getElement('sel'))));
};
var $author$project$Main$openDetail = F2(
	function (id, model) {
		var _v0 = _Utils_Tuple2(model.d, model.aA);
		if ((!_v0.a.$) && (_v0.b.$ === 2)) {
			var repo = _v0.a.a;
			var bs = _v0.b.a;
			var _v1 = $elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (b) {
						return _Utils_eq(b.a7, id);
					},
					bs));
			if (!_v1.$) {
				var b = _v1.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							r: $elm$core$Maybe$Just(
								{
									bH: $author$project$Main$Ready(b),
									aN: $author$project$Main$Loading,
									a7: id
								})
						}),
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2($author$project$Main$getBead, repo, id),
								A2($author$project$Main$getComments, repo, id),
								$author$project$Main$reveal(model.c)
							])));
			} else {
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			}
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$moveTo = F2(
	function (target_, model) {
		if (!target_.$) {
			var id = target_.a;
			var next = _Utils_update(
				model,
				{
					x: $elm$core$Maybe$Just(id)
				});
			return (!_Utils_eq(model.r, $elm$core$Maybe$Nothing)) ? A2($author$project$Main$openDetail, id, next) : _Utils_Tuple2(
				next,
				$author$project$Main$reveal(next.c));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$openHit = F2(
	function (h, model) {
		return _Utils_eq(
			model.d,
			$elm$core$Maybe$Just(h.a_)) ? A2(
			$author$project$Main$openDetail,
			h.a7,
			_Utils_update(
				model,
				{
					x: $elm$core$Maybe$Just(h.a7)
				})) : _Utils_Tuple2(
			_Utils_update(
				model,
				{
					aA: $author$project$Main$Loading,
					d: $elm$core$Maybe$Just(h.a_),
					r: $elm$core$Maybe$Nothing,
					aR: $elm$core$Maybe$Just(h.a7),
					x: $elm$core$Maybe$Just(h.a7),
					aj: $elm$core$Maybe$Nothing
				}),
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$getBeads(h.a_),
						$author$project$Main$getEdges(h.a_)
					])));
	});
var $author$project$Main$openUrl = _Platform_outgoingPort('openUrl', $elm$json$Json$Encode$string);
var $author$project$Timeline$plan = F2(
	function (c, b) {
		return {
			Q: A2(
				$elm$core$Maybe$withDefault,
				c.bs,
				A2($author$project$Timeline$endOf, c.Z, b)),
			aY: $author$project$Timeline$duration(b)
		};
	});
var $author$project$Main$RepoAdded = function (a) {
	return {$: 9, a: a};
};
var $author$project$Main$postRepo = function (dir) {
	return $elm$http$Http$post(
		{
			bk: $elm$http$Http$jsonBody(
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'dir',
							$elm$json$Json$Encode$string(
								$elm$core$String$trim(dir)))
						]))),
			B: A2(
				$author$project$Main$expectApi,
				$author$project$Main$RepoAdded,
				A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string)),
			J: '/api/repos'
		});
};
var $author$project$Keys$Cancel = {$: 2};
var $author$project$Keys$Run = function (a) {
	return {$: 0, a: a};
};
var $author$project$Keys$Wait = function (a) {
	return {$: 1, a: a};
};
var $author$project$Keys$AddLabel = 9;
var $author$project$Keys$Align = function (a) {
	return {$: 11, a: a};
};
var $author$project$Keys$Ask = 2;
var $author$project$Scroll$AtBottom = 2;
var $author$project$Scroll$AtMiddle = 1;
var $author$project$Scroll$AtTop = 0;
var $author$project$Keys$Bottom = {$: 2};
var $author$project$Keys$Bump = function (a) {
	return {$: 4, a: a};
};
var $author$project$Keys$ClearEpic = 8;
var $author$project$Keys$Compose = function (a) {
	return {$: 22, a: a};
};
var $author$project$Keys$Discuss = 1;
var $author$project$Keys$Down = 3;
var $author$project$Keys$EpicsView = 4;
var $author$project$Keys$Find = function (a) {
	return {$: 6, a: a};
};
var $author$project$Keys$FlowView = 8;
var $author$project$Keys$GraphView = 2;
var $author$project$Keys$Help = {$: 20};
var $author$project$Keys$IterationsView = 7;
var $author$project$Keys$Left = 0;
var $author$project$Keys$Link = 4;
var $author$project$Keys$ListView = 0;
var $author$project$Keys$MatrixView = 9;
var $author$project$Keys$MetricsView = 10;
var $author$project$Keys$Move = function (a) {
	return {$: 0, a: a};
};
var $author$project$Keys$OpenDetail = {$: 21};
var $author$project$Keys$PickTheme = {$: 18};
var $author$project$Keys$Push = function (a) {
	return {$: 3, a: a};
};
var $author$project$Keys$Reload = {$: 19};
var $author$project$Keys$RemoveLabel = 10;
var $author$project$Keys$Rename = 3;
var $author$project$Keys$Reopen = {$: 25};
var $author$project$Keys$RepoStep = function (a) {
	return {$: 7, a: a};
};
var $author$project$Keys$Right = 1;
var $author$project$Keys$RoadmapView = 6;
var $author$project$Keys$Scroll = function (a) {
	return {$: 14, a: a};
};
var $author$project$Keys$Section = function (a) {
	return {$: 9, a: a};
};
var $author$project$Keys$SectionEdge = function (a) {
	return {$: 10, a: a};
};
var $author$project$Keys$SetEpic = 7;
var $author$project$Keys$SetPriority = function (a) {
	return {$: 24, a: a};
};
var $author$project$Keys$SetStatus = function (a) {
	return {$: 23, a: a};
};
var $author$project$Keys$ShowAllKeys = {$: 15};
var $author$project$Keys$Sponsor = {$: 16};
var $author$project$Keys$StoryMapView = 5;
var $author$project$Keys$Stretch = function (a) {
	return {$: 5, a: a};
};
var $author$project$Keys$Top = {$: 1};
var $author$project$Keys$Up = 2;
var $author$project$Keys$ViewStep = function (a) {
	return {$: 8, a: a};
};
var $author$project$Keys$Zoom = function (a) {
	return {$: 12, a: a};
};
var $author$project$Keys$ZoomReset = {$: 13};
var $author$project$Keys$Prefix = function (a) {
	return {$: 1, a: a};
};
var $author$project$Keys$group = F3(
	function (key, label, bindings) {
		return {
			an: $author$project$Keys$Prefix(bindings),
			ad: key,
			aV: label
		};
	});
var $author$project$Keys$Do = function (a) {
	return {$: 0, a: a};
};
var $author$project$Keys$leaf = F3(
	function (key, label, action) {
		return {
			an: $author$project$Keys$Do(action),
			ad: key,
			aV: label
		};
	});
var $author$project$Keys$root = _List_fromArray(
	[
		A3(
		$author$project$Keys$leaf,
		'f',
		'find (fuzzy)',
		$author$project$Keys$Find(true)),
		A3(
		$author$project$Keys$leaf,
		's',
		'search (exact)',
		$author$project$Keys$Find(false)),
		A3(
		$author$project$Keys$leaf,
		'd',
		'scroll down',
		$author$project$Keys$Scroll(1)),
		A3(
		$author$project$Keys$leaf,
		'u',
		'scroll up',
		$author$project$Keys$Scroll(-1)),
		A3(
		$author$project$Keys$group,
		'[',
		'back',
		_List_fromArray(
			[
				A3(
				$author$project$Keys$leaf,
				'[',
				'previous section',
				$author$project$Keys$Section(-1)),
				A3(
				$author$project$Keys$leaf,
				'r',
				'previous repo',
				$author$project$Keys$RepoStep(-1)),
				A3(
				$author$project$Keys$leaf,
				'v',
				'previous view',
				$author$project$Keys$ViewStep(-1))
			])),
		A3(
		$author$project$Keys$group,
		']',
		'forward',
		_List_fromArray(
			[
				A3(
				$author$project$Keys$leaf,
				']',
				'next section',
				$author$project$Keys$Section(1)),
				A3(
				$author$project$Keys$leaf,
				'r',
				'next repo',
				$author$project$Keys$RepoStep(1)),
				A3(
				$author$project$Keys$leaf,
				'v',
				'next view',
				$author$project$Keys$ViewStep(1))
			])),
		A3(
		$author$project$Keys$leaf,
		'{',
		'section start',
		$author$project$Keys$SectionEdge(-1)),
		A3(
		$author$project$Keys$leaf,
		'}',
		'section end',
		$author$project$Keys$SectionEdge(1)),
		A3(
		$author$project$Keys$group,
		'z',
		'scroll',
		_List_fromArray(
			[
				A3(
				$author$project$Keys$leaf,
				't',
				'selection to top',
				$author$project$Keys$Align(0)),
				A3(
				$author$project$Keys$leaf,
				'z',
				'selection to middle',
				$author$project$Keys$Align(1)),
				A3(
				$author$project$Keys$leaf,
				'b',
				'selection to bottom',
				$author$project$Keys$Align(2))
			])),
		A3(
		$author$project$Keys$leaf,
		'Tab',
		'next view',
		$author$project$Keys$ViewStep(1)),
		A3(
		$author$project$Keys$leaf,
		'+',
		'zoom in (waterfall)',
		$author$project$Keys$Zoom(1)),
		A3(
		$author$project$Keys$leaf,
		'=',
		'zoom in (waterfall)',
		$author$project$Keys$Zoom(1)),
		A3(
		$author$project$Keys$leaf,
		'-',
		'zoom out (waterfall)',
		$author$project$Keys$Zoom(-1)),
		A3($author$project$Keys$leaf, '0', 'zoom: one day per cell', $author$project$Keys$ZoomReset),
		A3(
		$author$project$Keys$leaf,
		'h',
		'left',
		$author$project$Keys$Move(0)),
		A3(
		$author$project$Keys$leaf,
		'j',
		'down',
		$author$project$Keys$Move(3)),
		A3(
		$author$project$Keys$leaf,
		'k',
		'up',
		$author$project$Keys$Move(2)),
		A3(
		$author$project$Keys$leaf,
		'l',
		'right',
		$author$project$Keys$Move(1)),
		A3(
		$author$project$Keys$leaf,
		'H',
		'move card left',
		$author$project$Keys$Push(-1)),
		A3(
		$author$project$Keys$leaf,
		'L',
		'move card right',
		$author$project$Keys$Push(1)),
		A3(
		$author$project$Keys$leaf,
		'J',
		'lower priority',
		$author$project$Keys$Bump(1)),
		A3(
		$author$project$Keys$leaf,
		'K',
		'raise priority',
		$author$project$Keys$Bump(-1)),
		A3(
		$author$project$Keys$leaf,
		'<',
		'shorten task',
		$author$project$Keys$Stretch(-1)),
		A3(
		$author$project$Keys$leaf,
		'>',
		'extend task',
		$author$project$Keys$Stretch(1)),
		A3($author$project$Keys$leaf, 'G', 'bottom', $author$project$Keys$Bottom),
		A3($author$project$Keys$leaf, 'Enter', 'open discussion', $author$project$Keys$OpenDetail),
		A3(
		$author$project$Keys$leaf,
		'c',
		'comment',
		$author$project$Keys$Compose(1)),
		A3(
		$author$project$Keys$leaf,
		'a',
		'ask implementer',
		$author$project$Keys$Compose(2)),
		A3(
		$author$project$Keys$leaf,
		'n',
		'new bead',
		$author$project$Keys$Compose(0)),
		A3($author$project$Keys$leaf, '?', 'help', $author$project$Keys$Help),
		A3(
		$author$project$Keys$group,
		'g',
		'go',
		_List_fromArray(
			[
				A3($author$project$Keys$leaf, 'g', 'top', $author$project$Keys$Top),
				A3(
				$author$project$Keys$leaf,
				't',
				'next view',
				$author$project$Keys$ViewStep(1)),
				A3(
				$author$project$Keys$leaf,
				'T',
				'previous view',
				$author$project$Keys$ViewStep(-1))
			])),
		A3(
		$author$project$Keys$group,
		' ',
		'leader',
		_List_fromArray(
			[
				A3(
				$author$project$Keys$group,
				'v',
				'view',
				_List_fromArray(
					[
						A3(
						$author$project$Keys$leaf,
						'l',
						'list',
						$author$project$Keys$Show(0)),
						A3(
						$author$project$Keys$leaf,
						'k',
						'kanban',
						$author$project$Keys$Show(1)),
						A3(
						$author$project$Keys$leaf,
						'g',
						'dependency graph',
						$author$project$Keys$Show(2)),
						A3(
						$author$project$Keys$leaf,
						'w',
						'waterfall',
						$author$project$Keys$Show(3)),
						A3(
						$author$project$Keys$leaf,
						'e',
						'epics',
						$author$project$Keys$Show(4)),
						A3(
						$author$project$Keys$leaf,
						'm',
						'story map',
						$author$project$Keys$Show(5)),
						A3(
						$author$project$Keys$leaf,
						'r',
						'roadmap',
						$author$project$Keys$Show(6)),
						A3(
						$author$project$Keys$leaf,
						'i',
						'iterations',
						$author$project$Keys$Show(7)),
						A3(
						$author$project$Keys$leaf,
						'f',
						'flow metrics',
						$author$project$Keys$Show(8)),
						A3(
						$author$project$Keys$leaf,
						'x',
						'impact/effort matrix',
						$author$project$Keys$Show(9)),
						A3(
						$author$project$Keys$leaf,
						'd',
						'agent metrics',
						$author$project$Keys$Show(10))
					])),
				A3(
				$author$project$Keys$group,
				'e',
				'edit',
				_List_fromArray(
					[
						A3(
						$author$project$Keys$group,
						's',
						'status',
						_List_fromArray(
							[
								A3(
								$author$project$Keys$leaf,
								'o',
								'open',
								$author$project$Keys$SetStatus('open')),
								A3(
								$author$project$Keys$leaf,
								'p',
								'in progress',
								$author$project$Keys$SetStatus('in_progress')),
								A3(
								$author$project$Keys$leaf,
								'b',
								'blocked',
								$author$project$Keys$SetStatus('blocked')),
								A3(
								$author$project$Keys$leaf,
								'd',
								'deferred',
								$author$project$Keys$SetStatus('deferred')),
								A3(
								$author$project$Keys$leaf,
								'c',
								'closed',
								$author$project$Keys$SetStatus('closed'))
							])),
						A3(
						$author$project$Keys$group,
						'p',
						'priority',
						A2(
							$elm$core$List$map,
							function (n) {
								return A3(
									$author$project$Keys$leaf,
									$elm$core$String$fromInt(n),
									'P' + $elm$core$String$fromInt(n),
									$author$project$Keys$SetPriority(n));
							},
							_List_fromArray(
								[0, 1, 2, 3, 4]))),
						A3($author$project$Keys$leaf, 'o', 'reopen', $author$project$Keys$Reopen),
						A3(
						$author$project$Keys$leaf,
						't',
						'rename title',
						$author$project$Keys$Compose(3)),
						A3(
						$author$project$Keys$leaf,
						'e',
						'add to epic (id)',
						$author$project$Keys$Compose(7)),
						A3(
						$author$project$Keys$leaf,
						'x',
						'leave epic (id)',
						$author$project$Keys$Compose(8)),
						A3(
						$author$project$Keys$leaf,
						'l',
						'link to bead (id or repo:id)',
						$author$project$Keys$Compose(4)),
						A3(
						$author$project$Keys$leaf,
						'+',
						'add label',
						$author$project$Keys$Compose(9)),
						A3(
						$author$project$Keys$leaf,
						'-',
						'remove label',
						$author$project$Keys$Compose(10))
					])),
				A3(
				$author$project$Keys$group,
				'p',
				'project',
				_List_fromArray(
					[
						A3(
						$author$project$Keys$leaf,
						'a',
						'add repo (directory with .beads)',
						$author$project$Keys$Compose(5)),
						A3(
						$author$project$Keys$leaf,
						'r',
						'remove repo (type its name)',
						$author$project$Keys$Compose(6))
					])),
				A3($author$project$Keys$leaf, 't', 'theme (fuzzy, live)', $author$project$Keys$PickTheme),
				A3($author$project$Keys$leaf, 'r', 'reload', $author$project$Keys$Reload),
				A3($author$project$Keys$leaf, 'Backspace', 'ALL keys', $author$project$Keys$ShowAllKeys),
				A3($author$project$Keys$leaf, 'S', 'Sponsor <3 (opens in a new tab)', $author$project$Keys$Sponsor)
			]))
	]);
var $author$project$Keys$bindingsAt = function (path) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (k, acc) {
				if (acc.$ === 1) {
					return $elm$core$Maybe$Nothing;
				} else {
					var bs = acc.a;
					var _v1 = A2(
						$elm$core$List$filter,
						function (b) {
							return _Utils_eq(b.ad, k);
						},
						bs);
					if (_v1.b) {
						var entry = _v1.a.an;
						if (entry.$ === 1) {
							var next = entry.a;
							return $elm$core$Maybe$Just(next);
						} else {
							return $elm$core$Maybe$Nothing;
						}
					} else {
						return $elm$core$Maybe$Nothing;
					}
				}
			}),
		$elm$core$Maybe$Just($author$project$Keys$root),
		path);
};
var $author$project$Keys$press = F2(
	function (pending, key) {
		var _v0 = _Utils_Tuple2(
			key,
			$author$project$Keys$bindingsAt(pending));
		_v0$0:
		while (true) {
			if (_v0.b.$ === 1) {
				if (_v0.a === 'Escape') {
					break _v0$0;
				} else {
					var _v1 = _v0.b;
					return $author$project$Keys$Cancel;
				}
			} else {
				if (_v0.a === 'Escape') {
					break _v0$0;
				} else {
					var bs = _v0.b.a;
					var _v2 = A2(
						$elm$core$List$filter,
						function (b) {
							return _Utils_eq(b.ad, key);
						},
						bs);
					if (_v2.b) {
						var entry = _v2.a.an;
						if (!entry.$) {
							var a = entry.a;
							return $author$project$Keys$Run(a);
						} else {
							return $author$project$Keys$Wait(
								_Utils_ap(
									pending,
									_List_fromArray(
										[key])));
						}
					} else {
						return $author$project$Keys$Cancel;
					}
				}
			}
		}
		return $author$project$Keys$Cancel;
	});
var $elm$core$String$filter = _String_filter;
var $author$project$Theme$inOrder = F2(
	function (want, text) {
		inOrder:
		while (true) {
			var _v0 = _Utils_Tuple2(want, text);
			if (!_v0.a.b) {
				return true;
			} else {
				if (!_v0.b.b) {
					return false;
				} else {
					var _v1 = _v0.a;
					var w = _v1.a;
					var ws = _v1.b;
					var _v2 = _v0.b;
					var t = _v2.a;
					var ts = _v2.b;
					if (_Utils_eq(w, t)) {
						var $temp$want = ws,
							$temp$text = ts;
						want = $temp$want;
						text = $temp$text;
						continue inOrder;
					} else {
						var $temp$want = want,
							$temp$text = ts;
						want = $temp$want;
						text = $temp$text;
						continue inOrder;
					}
				}
			}
		}
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $elm$core$String$toLower = _String_toLower;
var $author$project$Theme$search = F2(
	function (query, schemes) {
		var want = $elm$core$String$toList(
			$elm$core$String$toLower(
				A2(
					$elm$core$String$filter,
					function (c) {
						return c !== ' ';
					},
					query)));
		return A2(
			$elm$core$List$map,
			$elm$core$Tuple$first,
			A2(
				$elm$core$List$filter,
				function (_v0) {
					var s = _v0.b;
					return A2(
						$author$project$Theme$inOrder,
						want,
						$elm$core$String$toList(
							$elm$core$String$toLower(
								_Utils_ap(
									s.E,
									_Utils_ap(s.ef, s.d3)))));
				},
				A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, schemes)));
	});
var $author$project$Main$previewTheme = F2(
	function (sel, model) {
		var _v0 = model.H;
		if (!_v0.$) {
			var p = _v0.a;
			var hits = A2($author$project$Theme$search, p.M, model.at);
			var s = A3(
				$author$project$Main$clampInt,
				0,
				A2(
					$elm$core$Basics$max,
					0,
					$elm$core$List$length(hits) - 1),
				sel);
			return _Utils_update(
				model,
				{
					H: $elm$core$Maybe$Just(
						_Utils_update(
							p,
							{N: s})),
					ah: A2(
						$elm$core$Maybe$withDefault,
						p.ba,
						$elm$core$List$head(
							A2($elm$core$List$drop, s, hits)))
				});
		} else {
			return model;
		}
	});
var $author$project$Main$pushLane = F3(
	function (dx, b, model) {
		var cols = function () {
			var _v2 = model.aA;
			if (_v2.$ === 2) {
				var bs = _v2.a;
				return A2($author$project$Agile$roadmapCols, model.y, bs);
			} else {
				return _List_Nil;
			}
		}();
		var here = A2(
			$elm$core$Maybe$withDefault,
			0,
			A2(
				$elm$core$Maybe$map,
				$elm$core$Tuple$first,
				$elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (_v1) {
							var c = _v1.b;
							return A2(
								$elm$core$List$any,
								function (x) {
									return _Utils_eq(x.a7, b.a7);
								},
								c.aA);
						},
						A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, cols)))));
		var to = A3($author$project$Main$clampInt, 0, 2, here + dx);
		return _Utils_eq(to, here) ? _Utils_Tuple2(
			_Utils_update(
				model,
				{
					h: $elm$core$Maybe$Just('already in the last lane')
				}),
			$elm$core$Platform$Cmd$none) : A2(
			$author$project$Main$edit,
			model,
			function (_v0) {
				return _List_fromArray(
					[
						_Utils_Tuple2(
						'op',
						$elm$json$Json$Encode$string('setStatus')),
						_Utils_Tuple2(
						'id',
						$elm$json$Json$Encode$string(b.a7)),
						_Utils_Tuple2(
						'status',
						$elm$json$Json$Encode$string(
							A2(
								$elm$core$Maybe$withDefault,
								'open',
								$elm$core$List$head(
									A2(
										$elm$core$List$drop,
										to,
										_List_fromArray(
											['in_progress', 'open', 'deferred']))))))
					]);
			});
	});
var $author$project$Main$pushStatus = F3(
	function (dx, b, model) {
		var cols = function () {
			var _v4 = model.aA;
			if (_v4.$ === 2) {
				var bs = _v4.a;
				return $author$project$Board$statusOrder(bs);
			} else {
				return _List_Nil;
			}
		}();
		var labels = A2($elm$core$List$map, $author$project$Types$statusLabel, cols);
		var i = A2(
			$elm$core$Maybe$withDefault,
			0,
			A2(
				$elm$core$Maybe$map,
				$elm$core$Tuple$first,
				$elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (_v3) {
							var l = _v3.b;
							return _Utils_eq(
								l,
								$author$project$Types$statusLabel(b.aH));
						},
						A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, labels)))));
		var j = A3(
			$author$project$Main$clampInt,
			0,
			$elm$core$List$length(cols) - 1,
			i + dx);
		var _v0 = $elm$core$List$head(
			A2($elm$core$List$drop, j, cols));
		if (!_v0.$) {
			var s = _v0.a;
			return _Utils_eq(j, i) ? _Utils_Tuple2(
				_Utils_update(
					model,
					{
						h: $elm$core$Maybe$Just(
							'already in the ' + (((dx < 0) ? 'first' : 'last') + ' column'))
					}),
				$elm$core$Platform$Cmd$none) : (_Utils_eq(s, $author$project$Types$Closed) ? A2(
				$author$project$Main$edit,
				model,
				function (_v1) {
					return _List_fromArray(
						[
							_Utils_Tuple2(
							'op',
							$elm$json$Json$Encode$string('close')),
							_Utils_Tuple2(
							'id',
							$elm$json$Json$Encode$string(b.a7))
						]);
				}) : A2(
				$author$project$Main$edit,
				model,
				function (_v2) {
					return _List_fromArray(
						[
							_Utils_Tuple2(
							'op',
							$elm$json$Json$Encode$string('setStatus')),
							_Utils_Tuple2(
							'id',
							$elm$json$Json$Encode$string(b.a7)),
							_Utils_Tuple2(
							'status',
							$elm$json$Json$Encode$string(
								$author$project$Types$statusLabel(s)))
						]);
				}));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$refresh = function (model) {
	var _v0 = model.d;
	if (_v0.$ === 1) {
		return $elm$core$Platform$Cmd$none;
	} else {
		var name = _v0.a;
		return $elm$core$Platform$Cmd$batch(
			A2(
				$elm$core$List$cons,
				$author$project$Main$getBeads(name),
				_Utils_ap(
					function () {
						var _v1 = model.r;
						if (!_v1.$) {
							var d = _v1.a;
							return _List_fromArray(
								[
									A2($author$project$Main$getBead, name, d.a7),
									A2($author$project$Main$getComments, name, d.a7)
								]);
						} else {
							return _List_Nil;
						}
					}(),
					_Utils_ap(
						(model.c === 2) ? _List_fromArray(
							[
								$author$project$Main$getEdges(name)
							]) : _List_Nil,
						(model.c === 10) ? _List_fromArray(
							[
								$author$project$Main$getMetrics(name)
							]) : _List_Nil))));
	}
};
var $elm$core$Basics$round = _Basics_round;
var $author$project$Main$mapBeads = F2(
	function (f, l) {
		if (l.$ === 2) {
			var bs = l.a;
			return $author$project$Main$Ready(
				A2($elm$core$List$map, f, bs));
		} else {
			var other = l;
			return other;
		}
	});
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $author$project$Calendar$pad = function (n) {
	return A3(
		$elm$core$String$padLeft,
		2,
		'0',
		$elm$core$String$fromInt(n));
};
var $author$project$Calendar$toIso = function (days) {
	var c = $author$project$Calendar$civil(days);
	return $elm$core$String$fromInt(c.bi) + ('-' + ($author$project$Calendar$pad(c.a9) + ('-' + $author$project$Calendar$pad(c.bP))));
};
var $author$project$Main$scheduleFields = F2(
	function (p, b) {
		return _List_fromArray(
			[
				_Utils_Tuple2(
				'op',
				$elm$json$Json$Encode$string('setSchedule')),
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(b.a7)),
				_Utils_Tuple2(
				'due',
				$elm$json$Json$Encode$string(
					$author$project$Calendar$toIso(p.aP))),
				_Utils_Tuple2(
				'days',
				$elm$json$Json$Encode$int(p.bQ))
			]);
	});
var $author$project$Main$schedule = F3(
	function (model, b, p) {
		var _v0 = model.d;
		if (!_v0.$) {
			var repo = _v0.a;
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						aA: A2(
							$author$project$Main$mapBeads,
							function (x) {
								return _Utils_eq(x.a7, b.a7) ? _Utils_update(
									x,
									{
										aP: $author$project$Calendar$toIso(p.aP),
										a5: p.bQ
									}) : x;
							},
							model.aA)
					}),
				A2(
					$author$project$Main$postOp,
					repo,
					A2($author$project$Main$scheduleFields, p, b)));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Timeline$pad2 = function (n) {
	return A3(
		$elm$core$String$padLeft,
		2,
		'0',
		$elm$core$String$fromInt(n));
};
var $author$project$Timeline$clock = function (m) {
	var t = A2($elm$core$Basics$modBy, 1440, m);
	return $author$project$Timeline$pad2((t / 60) | 0) + (':' + $author$project$Timeline$pad2(
		A2($elm$core$Basics$modBy, 60, t)));
};
var $author$project$Timeline$isoUtc = F2(
	function (offset, local) {
		var utc = local - offset;
		return $author$project$Calendar$toIso((utc / 1440) | 0) + ('T' + ($author$project$Timeline$clock(utc) + ':00Z'));
	});
var $author$project$Main$scheduleExact = F3(
	function (model, b, p) {
		var _v0 = model.d;
		if (!_v0.$) {
			var repo = _v0.a;
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						aA: A2(
							$author$project$Main$mapBeads,
							function (x) {
								return _Utils_eq(x.a7, b.a7) ? _Utils_update(
									x,
									{
										aP: $author$project$Calendar$toIso((p.Q / 1440) | 0),
										c8: $elm$core$Maybe$Just((p.Q - model.Z) * 60000),
										a5: A2($elm$core$Basics$max, 1, ((p.aY + 1439) / 1440) | 0),
										da: p.aY
									}) : x;
							},
							model.aA)
					}),
				A2(
					$author$project$Main$postOp,
					repo,
					_List_fromArray(
						[
							_Utils_Tuple2(
							'op',
							$elm$json$Json$Encode$string('setSchedule')),
							_Utils_Tuple2(
							'id',
							$elm$json$Json$Encode$string(b.a7)),
							_Utils_Tuple2(
							'due',
							$elm$json$Json$Encode$string(
								A2($author$project$Timeline$isoUtc, model.Z, p.Q))),
							_Utils_Tuple2(
							'minutes',
							$elm$json$Json$Encode$int(p.aY))
						])));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$scrollPane = F2(
	function (id, dir) {
		return A2(
			$elm$core$Task$attempt,
			function (_v0) {
				return $author$project$Main$NoOp;
			},
			A2(
				$elm$core$Task$andThen,
				function (v) {
					return A3(
						$elm$browser$Browser$Dom$setViewportOf,
						id,
						v.t.ak,
						A2($elm$core$Basics$max, 0, v.t.W + ((dir * v.t.aU) / 2)));
				},
				$elm$browser$Browser$Dom$getViewportOf(id)));
	});
var $author$project$Main$scrollTimeline = function (days) {
	return A2(
		$elm$core$Task$attempt,
		function (_v0) {
			return $author$project$Main$NoOp;
		},
		A2(
			$elm$core$Task$andThen,
			function (v) {
				return A3(
					$elm$browser$Browser$Dom$setViewportOf,
					'wf',
					A2($elm$core$Basics$max, 0, v.t.ak + (days * $author$project$Main$cellW)),
					v.t.W);
			},
			$elm$browser$Browser$Dom$getViewportOf('wf')));
};
var $author$project$Nav$section = F3(
	function (dir, sel, secs) {
		var _v0 = A2(
			$elm$core$Maybe$andThen,
			function (id) {
				return A2(
					$elm$core$Maybe$map,
					function (i) {
						return _Utils_Tuple2(id, i);
					},
					A2($author$project$Nav$sectionOf, id, secs));
			},
			sel);
		if (_v0.$ === 1) {
			return A2($author$project$Nav$firstOf, 0, secs);
		} else {
			var _v1 = _v0.a;
			var id = _v1.a;
			var i = _v1.b;
			return (dir < 0) ? ((!_Utils_eq(
				A2($author$project$Nav$firstOf, i, secs),
				$elm$core$Maybe$Just(id))) ? A2($author$project$Nav$firstOf, i, secs) : A2(
				$author$project$Nav$firstOf,
				A2($elm$core$Basics$max, 0, i - 1),
				secs)) : A2(
				$author$project$Nav$firstOf,
				A2(
					$elm$core$Basics$min,
					$elm$core$List$length(secs) - 1,
					i + 1),
				secs);
		}
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Nav$sections = F3(
	function (today, view, beads) {
		var flat = A3($author$project$Nav$order, today, view, beads);
		var chunks = function (xs) {
			return $elm$core$List$isEmpty(xs) ? _List_Nil : A2(
				$elm$core$List$cons,
				A2($elm$core$List$take, 10, xs),
				chunks(
					A2($elm$core$List$drop, 10, xs)));
		};
		return A2(
			$elm$core$List$filter,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$List$isEmpty),
			function () {
				var _v0 = _Utils_Tuple2(
					A3($author$project$Agile$columnsFor, today, view, beads),
					view);
				_v0$0:
				while (true) {
					switch (_v0.b) {
						case 0:
							if (!_v0.a.$) {
								break _v0$0;
							} else {
								var _v1 = _v0.b;
								return A2(
									$elm$core$List$map,
									$elm$core$Tuple$second,
									$author$project$Board$columns(beads));
							}
						case 4:
							if (!_v0.a.$) {
								break _v0$0;
							} else {
								var _v2 = _v0.b;
								return A2(
									$elm$core$List$map,
									function (g) {
										return _Utils_ap(
											A2(
												$elm$core$Maybe$withDefault,
												_List_Nil,
												A2($elm$core$Maybe$map, $elm$core$List$singleton, g.a4)),
											g.aB);
									},
									$author$project$Agile$epicGroups(beads));
							}
						case 9:
							if (!_v0.a.$) {
								break _v0$0;
							} else {
								var _v3 = _v0.b;
								return A2(
									$elm$core$List$map,
									function (p) {
										return A2(
											$elm$core$List$concatMap,
											function (c) {
												return A3($author$project$Agile$matrixCell, p, c, beads);
											},
											A2($elm$core$List$range, 0, 4));
									},
									A2($elm$core$List$range, 0, 4));
							}
						default:
							if (!_v0.a.$) {
								break _v0$0;
							} else {
								return chunks(flat);
							}
					}
				}
				var cols = _v0.a.a;
				return A2(
					$elm$core$List$map,
					function ($) {
						return $.aA;
					},
					cols);
			}());
	});
var $author$project$Main$sectionsOf = function (model) {
	var _v0 = model.aA;
	if (_v0.$ === 2) {
		var bs = _v0.a;
		return A3($author$project$Nav$sections, model.y, model.c, bs);
	} else {
		return _List_Nil;
	}
};
var $author$project$Schedule$plan = F2(
	function (today, b) {
		return {
			bQ: $author$project$Schedule$width(b),
			aP: A2(
				$elm$core$Maybe$withDefault,
				today,
				$author$project$Schedule$dueDay(b))
		};
	});
var $author$project$Schedule$slide = F3(
	function (today, delta, b) {
		var p = A2($author$project$Schedule$plan, today, b);
		return _Utils_update(
			p,
			{aP: p.aP + delta});
	});
var $author$project$Timeline$slide = F4(
	function (cell, delta, c, b) {
		var p = A2($author$project$Timeline$plan, c, b);
		return _Utils_update(
			p,
			{Q: p.Q + (delta * cell)});
	});
var $author$project$Main$sponsorUrl = 'https://github.com/sponsors/vic';
var $author$project$Nav$at = F2(
	function (i, xs) {
		return $elm$core$List$head(
			A2($elm$core$List$drop, i, xs));
	});
var $author$project$Nav$index = F2(
	function (id, beads) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var b = _v0.b;
						return _Utils_eq(b.a7, id);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, beads))));
	});
var $author$project$Nav$sideways = F4(
	function (dx, c, r, cols) {
		sideways:
		while (true) {
			var _v0 = A2($author$project$Nav$at, c + dx, cols);
			if (_v0.$ === 1) {
				return $elm$core$Maybe$Nothing;
			} else {
				if (!_v0.a.b) {
					var $temp$dx = dx,
						$temp$c = c + dx,
						$temp$r = r,
						$temp$cols = cols;
					dx = $temp$dx;
					c = $temp$c;
					r = $temp$r;
					cols = $temp$cols;
					continue sideways;
				} else {
					var col = _v0.a;
					return A2(
						$elm$core$Maybe$map,
						function ($) {
							return $.a7;
						},
						A2(
							$author$project$Nav$at,
							A2(
								$elm$core$Basics$min,
								r,
								$elm$core$List$length(col) - 1),
							col));
				}
			}
		}
	});
var $author$project$Nav$kanban = F3(
	function (dir, id, cols) {
		var pos = $elm$core$List$head(
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				A2(
					$elm$core$List$indexedMap,
					F2(
						function (c, col) {
							return A2(
								$elm$core$Maybe$map,
								function (r) {
									return _Utils_Tuple2(c, r);
								},
								A2($author$project$Nav$index, id, col));
						}),
					cols)));
		if (pos.$ === 1) {
			return $elm$core$Maybe$Just(id);
		} else {
			var _v1 = pos.a;
			var c = _v1.a;
			var r = _v1.b;
			switch (dir) {
				case 2:
					return A2(
						$elm$core$Maybe$map,
						function ($) {
							return $.a7;
						},
						A2(
							$author$project$Nav$at,
							A2($elm$core$Basics$max, 0, r - 1),
							A2(
								$elm$core$Maybe$withDefault,
								_List_Nil,
								A2($author$project$Nav$at, c, cols))));
				case 3:
					var col = A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($author$project$Nav$at, c, cols));
					return A2(
						$elm$core$Maybe$map,
						function ($) {
							return $.a7;
						},
						A2(
							$author$project$Nav$at,
							A2(
								$elm$core$Basics$min,
								$elm$core$List$length(col) - 1,
								r + 1),
							col));
				case 0:
					return $elm$core$Maybe$Just(
						A2(
							$elm$core$Maybe$withDefault,
							id,
							A4($author$project$Nav$sideways, -1, c, r, cols)));
				default:
					return $elm$core$Maybe$Just(
						A2(
							$elm$core$Maybe$withDefault,
							id,
							A4($author$project$Nav$sideways, 1, c, r, cols)));
			}
		}
	});
var $author$project$Nav$step = F5(
	function (today, view, dir, sel, beads) {
		var flat = A3($author$project$Nav$order, today, view, beads);
		var first = A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.a7;
			},
			$elm$core$List$head(flat));
		var _v0 = A2(
			$elm$core$Maybe$andThen,
			function (id) {
				return A2(
					$elm$core$Maybe$map,
					function (_v1) {
						return id;
					},
					A2($author$project$Nav$index, id, flat));
			},
			sel);
		if (_v0.$ === 1) {
			return first;
		} else {
			var id = _v0.a;
			var _v2 = A3($author$project$Agile$columnsFor, today, view, beads);
			if (!_v2.$) {
				var cols = _v2.a;
				return A3(
					$author$project$Nav$kanban,
					dir,
					id,
					A2(
						$elm$core$List$map,
						function ($) {
							return $.aA;
						},
						cols));
			} else {
				switch (dir) {
					case 2:
						return A2(
							$elm$core$Maybe$map,
							function ($) {
								return $.a7;
							},
							A2(
								$elm$core$Maybe$andThen,
								function (i) {
									return A2(
										$author$project$Nav$at,
										A2($elm$core$Basics$max, 0, i - 1),
										flat);
								},
								A2($author$project$Nav$index, id, flat)));
					case 3:
						return A2(
							$elm$core$Maybe$map,
							function ($) {
								return $.a7;
							},
							A2(
								$elm$core$Maybe$andThen,
								function (i) {
									return A2(
										$author$project$Nav$at,
										A2(
											$elm$core$Basics$min,
											$elm$core$List$length(flat) - 1,
											i + 1),
										flat);
								},
								A2($author$project$Nav$index, id, flat)));
					default:
						return $elm$core$Maybe$Just(id);
				}
			}
		}
	});
var $author$project$Main$viewOrder = _List_fromArray(
	[1, 0, 4, 5, 6, 7, 3, 2, 8, 10, 9]);
var $author$project$Main$stepView = F2(
	function (d, v) {
		var i = A2(
			$elm$core$Maybe$withDefault,
			0,
			A2(
				$elm$core$Maybe$map,
				$elm$core$Tuple$first,
				$elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (_v0) {
							var x = _v0.b;
							return _Utils_eq(x, v);
						},
						A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, $author$project$Main$viewOrder)))));
		return A2(
			$elm$core$Maybe$withDefault,
			1,
			$elm$core$List$head(
				A2(
					$elm$core$List$drop,
					A2(
						$elm$core$Basics$modBy,
						$elm$core$List$length($author$project$Main$viewOrder),
						i + d),
					$author$project$Main$viewOrder)));
	});
var $author$project$Schedule$stretch = F3(
	function (today, delta, b) {
		var p = A2($author$project$Schedule$plan, today, b);
		var days = A2($elm$core$Basics$max, 1, p.bQ + delta);
		return {bQ: days, aP: p.aP + (days - p.bQ)};
	});
var $author$project$Timeline$stretch = F4(
	function (cell, delta, c, b) {
		var p = A2($author$project$Timeline$plan, c, b);
		var minutes = A2($elm$core$Basics$max, cell, p.aY + (delta * cell));
		return {Q: p.Q + (minutes - p.aY), aY: minutes};
	});
var $author$project$Main$toLoaded = function (r) {
	if (!r.$) {
		var v = r.a;
		return $author$project$Main$Ready(v);
	} else {
		var e = r.a;
		return $author$project$Main$Failed(
			$author$project$Main$httpError(e));
	}
};
var $author$project$Main$withDetail = F3(
	function (id, f, model) {
		var _v0 = model.r;
		if (!_v0.$) {
			var d = _v0.a;
			return _Utils_eq(d.a7, id) ? _Utils_update(
				model,
				{
					r: $elm$core$Maybe$Just(
						f(d))
				}) : model;
		} else {
			return model;
		}
	});
var $author$project$Main$zoomBy = F2(
	function (d, model) {
		if (model.c !== 3) {
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{
						h: $elm$core$Maybe$Just('zoom works on the waterfall: SPC v w')
					}),
				$elm$core$Platform$Cmd$none);
		} else {
			var z = A3(
				$author$project$Main$clampInt,
				0,
				$elm$core$List$length($author$project$Timeline$zooms) - 1,
				model.al + d);
			var focus = function () {
				var _v0 = $author$project$Main$selected(model);
				if (!_v0.$) {
					var b = _v0.a;
					return A2(
						$author$project$Timeline$plan,
						$author$project$Main$clockOf(model),
						b).Q;
				} else {
					return model.F;
				}
			}();
			var next = _Utils_update(
				model,
				{
					h: $elm$core$Maybe$Just(
						'timeline zoom: ' + $author$project$Timeline$zoomAt(z).E),
					aS: $elm$core$Maybe$Just(focus),
					al: z
				});
			return _Utils_Tuple2(
				next,
				$author$project$Main$focusScroll(next));
		}
	});
var $author$project$Main$run = F2(
	function (action, model) {
		run:
		while (true) {
			switch (action.$) {
				case 0:
					var dir = action.a;
					var _v26 = _Utils_Tuple2(model.c, dir);
					_v26$2:
					while (true) {
						if (_v26.a === 3) {
							switch (_v26.b) {
								case 0:
									var _v27 = _v26.a;
									var _v28 = _v26.b;
									return _Utils_Tuple2(
										model,
										$author$project$Main$scrollTimeline(-7));
								case 1:
									var _v29 = _v26.a;
									var _v30 = _v26.b;
									return _Utils_Tuple2(
										model,
										$author$project$Main$scrollTimeline(7));
								default:
									break _v26$2;
							}
						} else {
							break _v26$2;
						}
					}
					var _v31 = model.aA;
					if (_v31.$ === 2) {
						var bs = _v31.a;
						var next = _Utils_update(
							model,
							{
								x: A5(
									$author$project$Nav$step,
									model.y,
									model.c,
									dir,
									A2(
										$elm$core$Maybe$map,
										function ($) {
											return $.a7;
										},
										$author$project$Main$selected(model)),
									bs)
							});
						var _v32 = _Utils_Tuple2(model.r, next.x);
						if ((!_v32.a.$) && (!_v32.b.$)) {
							var id = _v32.b.a;
							return A2($author$project$Main$openDetail, id, next);
						} else {
							return _Utils_Tuple2(
								next,
								$author$project$Main$reveal(next.c));
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 1:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								x: A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.a7;
									},
									$elm$core$List$head(
										$author$project$Main$visible(model)))
							}),
						$author$project$Main$reveal(model.c));
				case 2:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								x: A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.a7;
									},
									$elm$core$List$head(
										$elm$core$List$reverse(
											$author$project$Main$visible(model))))
							}),
						$author$project$Main$reveal(model.c));
				case 3:
					var dx = action.a;
					var _v33 = _Utils_Tuple2(
						model.c,
						$author$project$Main$target(model));
					if (!_v33.b.$) {
						switch (_v33.a) {
							case 3:
								var _v34 = _v33.a;
								var b = _v33.b.a;
								return A3(
									$author$project$Main$scheduleExact,
									model,
									b,
									A4(
										$author$project$Timeline$slide,
										$author$project$Main$cellMinutes(model),
										dx,
										$author$project$Main$clockOf(model),
										b));
							case 7:
								var _v35 = _v33.a;
								var b = _v33.b.a;
								return A3(
									$author$project$Main$schedule,
									model,
									b,
									A3($author$project$Schedule$slide, model.y, 7 * dx, b));
							case 9:
								var _v36 = _v33.a;
								var b = _v33.b.a;
								return A3(
									$author$project$Main$schedule,
									model,
									b,
									A3($author$project$Schedule$stretch, model.y, dx, b));
							case 6:
								var _v37 = _v33.a;
								var b = _v33.b.a;
								return A3($author$project$Main$pushLane, dx, b, model);
							case 5:
								var _v38 = _v33.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											h: $elm$core$Maybe$Just('the epic is a tag: SPC e e adds it, SPC e x removes it')
										}),
									$elm$core$Platform$Cmd$none);
							case 4:
								var _v39 = _v33.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											h: $elm$core$Maybe$Just('the epic is a tag: SPC e e adds it, SPC e x removes it')
										}),
									$elm$core$Platform$Cmd$none);
							default:
								var b = _v33.b.a;
								return A3($author$project$Main$pushStatus, dx, b, model);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 4:
					var dy = action.a;
					var _v40 = $author$project$Main$target(model);
					if (!_v40.$) {
						var b = _v40.a;
						var p = A3($author$project$Main$clampInt, 0, 4, b.bw + dy);
						return _Utils_eq(p, b.bw) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									h: $elm$core$Maybe$Just(
										'already P' + $elm$core$String$fromInt(p))
								}),
							$elm$core$Platform$Cmd$none) : A2(
							$author$project$Main$edit,
							model,
							function (_v41) {
								return _List_fromArray(
									[
										_Utils_Tuple2(
										'op',
										$elm$json$Json$Encode$string('setPriority')),
										_Utils_Tuple2(
										'id',
										$elm$json$Json$Encode$string(b.a7)),
										_Utils_Tuple2(
										'priority',
										$elm$json$Json$Encode$int(p))
									]);
							});
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 5:
					var d = action.a;
					var _v42 = _Utils_Tuple2(
						model.c,
						$author$project$Main$target(model));
					_v42$2:
					while (true) {
						if (!_v42.b.$) {
							switch (_v42.a) {
								case 9:
									var _v43 = _v42.a;
									var b = _v42.b.a;
									return A3(
										$author$project$Main$schedule,
										model,
										b,
										A3($author$project$Schedule$stretch, model.y, d, b));
								case 3:
									var _v44 = _v42.a;
									var b = _v42.b.a;
									return A3(
										$author$project$Main$scheduleExact,
										model,
										b,
										A4(
											$author$project$Timeline$stretch,
											$author$project$Main$cellMinutes(model),
											d,
											$author$project$Main$clockOf(model),
											b));
								default:
									break _v42$2;
							}
						} else {
							break _v42$2;
						}
					}
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								h: $elm$core$Maybe$Just('< and > resize a task on the waterfall (SPC v w)')
							}),
						$elm$core$Platform$Cmd$none);
				case 6:
					var fuzzy = action.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								s: $elm$core$Maybe$Just(
									{aT: fuzzy, ac: _List_Nil, aF: '', M: '', N: 0}),
								G: _List_Nil
							}),
						$author$project$Main$focusFinder);
				case 7:
					var d = action.a;
					return A2($author$project$Main$stepRepo, d, model);
				case 8:
					var d = action.a;
					var $temp$action = $author$project$Keys$Show(
						A2($author$project$Main$stepView, d, model.c)),
						$temp$model = model;
					action = $temp$action;
					model = $temp$model;
					continue run;
				case 9:
					var d = action.a;
					return A2(
						$author$project$Main$moveTo,
						A3(
							$author$project$Nav$section,
							d,
							A2(
								$elm$core$Maybe$map,
								function ($) {
									return $.a7;
								},
								$author$project$Main$selected(model)),
							$author$project$Main$sectionsOf(model)),
						model);
				case 10:
					var d = action.a;
					return A2(
						$author$project$Main$moveTo,
						A3(
							$author$project$Nav$edge,
							d,
							A2(
								$elm$core$Maybe$map,
								function ($) {
									return $.a7;
								},
								$author$project$Main$selected(model)),
							$author$project$Main$sectionsOf(model)),
						model);
				case 11:
					var place = action.a;
					return _Utils_Tuple2(
						model,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									A2($author$project$Main$alignSelection, model.c, place),
									(model.c === 3) ? $author$project$Main$focusScroll(model) : $elm$core$Platform$Cmd$none
								])));
				case 12:
					var d = action.a;
					return A2($author$project$Main$zoomBy, d, model);
				case 13:
					return A2($author$project$Main$zoomBy, 0 - model.al, model);
				case 15:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{ay: true, G: _List_Nil}),
						$elm$core$Platform$Cmd$none);
				case 16:
					return _Utils_Tuple2(
						model,
						$author$project$Main$openUrl($author$project$Main$sponsorUrl));
				case 14:
					var dir = action.a;
					return _Utils_Tuple2(
						model,
						A2(
							$author$project$Main$scrollPane,
							(!_Utils_eq(model.r, $elm$core$Maybe$Nothing)) ? 'detail' : 'main',
							dir));
				case 17:
					var v = action.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{c: v}),
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									function () {
									var _v45 = _Utils_Tuple2(v, model.d);
									_v45$2:
									while (true) {
										if (!_v45.b.$) {
											switch (_v45.a) {
												case 2:
													var _v46 = _v45.a;
													var name = _v45.b.a;
													return $author$project$Main$getEdges(name);
												case 10:
													var _v47 = _v45.a;
													var name = _v45.b.a;
													return $author$project$Main$getMetrics(name);
												default:
													break _v45$2;
											}
										} else {
											break _v45$2;
										}
									}
									return $elm$core$Platform$Cmd$none;
								}(),
									$author$project$Main$reveal(v)
								])));
				case 18:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								G: _List_Nil,
								H: $elm$core$Maybe$Just(
									{ba: model.ah, M: '', N: 0})
							}),
						$author$project$Main$focusThemePicker);
				case 19:
					return _Utils_Tuple2(
						model,
						$author$project$Main$refresh(model));
				case 20:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{ab: !model.ab}),
						$elm$core$Platform$Cmd$none);
				case 21:
					var _v48 = _Utils_Tuple2(
						$author$project$Main$selected(model),
						model.d);
					if ((!_v48.a.$) && (!_v48.b.$)) {
						var b = _v48.a.a;
						var repo = _v48.b.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									r: $elm$core$Maybe$Just(
										{
											bH: $author$project$Main$Ready(b),
											aN: $author$project$Main$Loading,
											a7: b.a7
										})
								}),
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										A2($author$project$Main$getBead, repo, b.a7),
										A2($author$project$Main$getComments, repo, b.a7)
									])));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 22:
					switch (action.a) {
						case 5:
							var _v49 = action.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										i: $elm$core$Maybe$Just(
											{dt: 5, j: '', g: ''})
									}),
								$author$project$Main$focusComposer);
						case 0:
							var _v50 = action.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										i: $elm$core$Maybe$Just(
											{dt: 0, j: '', g: ''})
									}),
								$author$project$Main$focusComposer);
						case 6:
							var _v51 = action.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										i: $elm$core$Maybe$Just(
											{dt: 6, j: '', g: ''})
									}),
								$author$project$Main$focusComposer);
						default:
							var kind = action.a;
							var _v52 = $author$project$Main$target(model);
							if (!_v52.$) {
								var b = _v52.a;
								var start = function () {
									switch (kind) {
										case 2:
											return $elm$core$String$isEmpty(b.az) ? '' : ('@' + (b.az + ' '));
										case 3:
											return b.au;
										default:
											return '';
									}
								}();
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											i: $elm$core$Maybe$Just(
												{dt: kind, j: b.a7, g: start})
										}),
									$elm$core$Platform$Cmd$batch(
										_List_fromArray(
											[$author$project$Main$focusComposer, $author$project$Main$getSessions])));
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
					}
				case 23:
					if (action.a === 'closed') {
						return A2(
							$author$project$Main$edit,
							model,
							function (b) {
								return _List_fromArray(
									[
										_Utils_Tuple2(
										'op',
										$elm$json$Json$Encode$string('close')),
										_Utils_Tuple2(
										'id',
										$elm$json$Json$Encode$string(b.a7))
									]);
							});
					} else {
						var s = action.a;
						return A2(
							$author$project$Main$edit,
							model,
							function (b) {
								return _List_fromArray(
									[
										_Utils_Tuple2(
										'op',
										$elm$json$Json$Encode$string('setStatus')),
										_Utils_Tuple2(
										'id',
										$elm$json$Json$Encode$string(b.a7)),
										_Utils_Tuple2(
										'status',
										$elm$json$Json$Encode$string(s))
									]);
							});
					}
				case 24:
					var n = action.a;
					return A2(
						$author$project$Main$edit,
						model,
						function (b) {
							return _List_fromArray(
								[
									_Utils_Tuple2(
									'op',
									$elm$json$Json$Encode$string('setPriority')),
									_Utils_Tuple2(
									'id',
									$elm$json$Json$Encode$string(b.a7)),
									_Utils_Tuple2(
									'priority',
									$elm$json$Json$Encode$int(n))
								]);
						});
				default:
					return A2(
						$author$project$Main$edit,
						model,
						function (b) {
							return _List_fromArray(
								[
									_Utils_Tuple2(
									'op',
									$elm$json$Json$Encode$string('reopen')),
									_Utils_Tuple2(
									'id',
									$elm$json$Json$Encode$string(b.a7))
								]);
						});
			}
		}
	});
var $author$project$Main$stepRepo = F2(
	function (d, model) {
		var _v22 = model.U;
		if (_v22.$ === 2) {
			var rs = _v22.a;
			var names = A2(
				$elm$core$List$map,
				function ($) {
					return $.E;
				},
				rs);
			var i = A2(
				$elm$core$Maybe$withDefault,
				0,
				A2(
					$elm$core$Maybe$map,
					$elm$core$Tuple$first,
					$elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (_v24) {
								var n = _v24.b;
								return _Utils_eq(
									$elm$core$Maybe$Just(n),
									model.d);
							},
							A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, names)))));
			var _v23 = $elm$core$List$head(
				A2(
					$elm$core$List$drop,
					A2(
						$elm$core$Basics$modBy,
						A2(
							$elm$core$Basics$max,
							1,
							$elm$core$List$length(names)),
						i + d),
					names));
			if (!_v23.$) {
				var name = _v23.a;
				return A2(
					$author$project$Main$update,
					$author$project$Main$Pick(name),
					model);
			} else {
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			}
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 36:
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 27:
					var q = msg.a;
					var _v1 = model.s;
					if (!_v1.$) {
						var f = _v1.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									s: $elm$core$Maybe$Just(
										_Utils_update(
											f,
											{aF: 'searching…', M: q, N: 0}))
								}),
							$elm$core$String$isEmpty(
								$elm$core$String$trim(q)) ? $elm$core$Platform$Cmd$none : A2($author$project$Main$getHits, q, f.aT));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 28:
					var q = msg.a;
					var fuzzy = msg.b;
					var result = msg.c;
					var _v2 = model.s;
					if (!_v2.$) {
						var f = _v2.a;
						if ((!_Utils_eq(f.M, q)) || (!_Utils_eq(f.aT, fuzzy))) {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						} else {
							if (!result.$) {
								var hs = result.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											s: $elm$core$Maybe$Just(
												_Utils_update(
													f,
													{ac: hs, aF: 'nothing found'}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								var e = result.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											s: $elm$core$Maybe$Just(
												_Utils_update(
													f,
													{
														ac: _List_Nil,
														aF: 'search failed: ' + $author$project$Main$httpError(e)
													}))
										}),
									$elm$core$Platform$Cmd$none);
							}
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 29:
					var d = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								s: A2(
									$elm$core$Maybe$map,
									function (f) {
										return _Utils_update(
											f,
											{
												N: A3(
													$author$project$Main$clampInt,
													0,
													$elm$core$List$length(f.ac) - 1,
													f.N + d)
											});
									},
									model.s)
							}),
						$elm$core$Platform$Cmd$none);
				case 31:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{s: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 30:
					var _v4 = A2(
						$elm$core$Maybe$andThen,
						function (f) {
							return $elm$core$List$head(
								A2($elm$core$List$drop, f.N, f.ac));
						},
						model.s);
					if (!_v4.$) {
						var h = _v4.a;
						return A2(
							$author$project$Main$openHit,
							h,
							_Utils_update(
								model,
								{s: $elm$core$Maybe$Nothing}));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{s: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					}
				case 32:
					var q = msg.a;
					return _Utils_Tuple2(
						A2(
							$author$project$Main$previewTheme,
							0,
							_Utils_update(
								model,
								{
									H: A2(
										$elm$core$Maybe$map,
										function (p) {
											return _Utils_update(
												p,
												{M: q});
										},
										model.H)
								})),
						$elm$core$Platform$Cmd$none);
				case 33:
					var d = msg.a;
					return _Utils_Tuple2(
						A2(
							$author$project$Main$previewTheme,
							A2(
								$elm$core$Maybe$withDefault,
								0,
								A2(
									$elm$core$Maybe$map,
									function (p) {
										return p.N + d;
									},
									model.H)),
							model),
						$elm$core$Platform$Cmd$none);
				case 34:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{H: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 35:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								H: $elm$core$Maybe$Nothing,
								ah: A2(
									$elm$core$Maybe$withDefault,
									model.ah,
									A2(
										$elm$core$Maybe$map,
										function ($) {
											return $.ba;
										},
										model.H))
							}),
						$elm$core$Platform$Cmd$none);
				case 19:
					var d = msg.a;
					var off = msg.b;
					var now = msg.c;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{F: now, Z: off, y: d}),
						$elm$core$Platform$Cmd$none);
				case 20:
					var v = msg.a;
					return A2(
						$author$project$Main$run,
						$author$project$Keys$Show(v),
						model);
				case 21:
					var name = msg.a;
					var result = msg.b;
					if (!_Utils_eq(
						model.d,
						$elm$core$Maybe$Just(name))) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						if (!result.$) {
							var m = result.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										aX: $elm$core$Maybe$Just(m)
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var e = result.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										h: $elm$core$Maybe$Just(
											'metrics: ' + $author$project$Main$httpError(e))
									}),
								$elm$core$Platform$Cmd$none);
						}
					}
				case 22:
					var d = msg.a;
					return A2($author$project$Main$zoomBy, d, model);
				case 23:
					var id = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								x: $elm$core$Maybe$Just(id)
							}),
						$elm$core$Platform$Cmd$none);
				case 24:
					var id = msg.a;
					var x = msg.b;
					var _v6 = model.aA;
					if (_v6.$ === 2) {
						var bs = _v6.a;
						var _v7 = $elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (b) {
									return _Utils_eq(b.a7, id);
								},
								bs));
						if (!_v7.$) {
							var b = _v7.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										A: $elm$core$Maybe$Just(
											{
												aQ: 0,
												a7: id,
												bb: A2(
													$author$project$Timeline$plan,
													$author$project$Main$clockOf(model),
													b),
												by: x
											}),
										x: $elm$core$Maybe$Just(id)
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 25:
					var x = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								A: A2(
									$elm$core$Maybe$map,
									function (d) {
										return _Utils_update(
											d,
											{aQ: x - d.by});
									},
									model.A)
							}),
						$elm$core$Platform$Cmd$none);
				case 26:
					var _v8 = _Utils_Tuple2(model.A, model.aA);
					if ((!_v8.a.$) && (_v8.b.$ === 2)) {
						var d = _v8.a.a;
						var bs = _v8.b.a;
						var moved = $elm$core$Basics$round(d.aQ / $author$project$Main$cellW) * $author$project$Main$cellMinutes(model);
						var _v9 = $elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (b) {
									return _Utils_eq(b.a7, d.a7);
								},
								bs));
						if (!_v9.$) {
							var b = _v9.a;
							return (!moved) ? _Utils_Tuple2(
								_Utils_update(
									model,
									{A: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none) : A3(
								$author$project$Main$scheduleExact,
								_Utils_update(
									model,
									{A: $elm$core$Maybe$Nothing}),
								b,
								{Q: d.bb.Q + moved, aY: d.bb.aY});
						} else {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{A: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{A: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					}
				case 0:
					if (!msg.a.$) {
						var repos = msg.a.a;
						var keep = $elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (r) {
									return _Utils_eq(
										$elm$core$Maybe$Just(r.E),
										model.d);
								},
								repos));
						var _v10 = _Utils_Tuple2(
							keep,
							$elm$core$List$head(repos));
						if (!_v10.a.$) {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										U: $author$project$Main$Ready(repos)
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							if (!_v10.b.$) {
								var _v11 = _v10.a;
								var first = _v10.b.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											aA: $author$project$Main$Loading,
											d: $elm$core$Maybe$Just(first.E),
											U: $author$project$Main$Ready(repos)
										}),
									$author$project$Main$getBeads(first.E));
							} else {
								var _v12 = _v10.a;
								var _v13 = _v10.b;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											aA: $author$project$Main$Ready(_List_Nil),
											d: $elm$core$Maybe$Nothing,
											U: $author$project$Main$Ready(repos)
										}),
									$elm$core$Platform$Cmd$none);
							}
						}
					} else {
						var e = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									U: $author$project$Main$Failed(
										$author$project$Main$httpError(e))
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 2:
					if (!msg.a.$) {
						var ts = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									ah: $author$project$Theme$defaultIndex(ts),
									at: ts
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 5:
					if (!msg.a.$) {
						var ss = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{as: ss}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{as: _List_Nil}),
							$elm$core$Platform$Cmd$none);
					}
				case 6:
					if (!msg.b.$) {
						var name = msg.a;
						var es = msg.b.a;
						return _Utils_eq(
							model.d,
							$elm$core$Maybe$Just(name)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{aC: es}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var e = msg.b.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									h: $elm$core$Maybe$Just(
										'edges: ' + $author$project$Main$httpError(e))
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 11:
					var name = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								aA: $author$project$Main$Loading,
								d: $elm$core$Maybe$Just(name),
								r: $elm$core$Maybe$Nothing,
								aX: $elm$core$Maybe$Nothing,
								x: $elm$core$Maybe$Nothing,
								aj: $elm$core$Maybe$Nothing
							}),
						$author$project$Main$getBeads(name));
				case 1:
					var name = msg.a;
					var result = msg.b;
					if (!_Utils_eq(
						model.d,
						$elm$core$Maybe$Just(name))) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						if (!result.$) {
							var bs = result.a;
							var _v15 = model.aR;
							if (!_v15.$) {
								var id = _v15.a;
								return A2(
									$author$project$Main$openDetail,
									id,
									_Utils_update(
										model,
										{
											aA: $author$project$Main$Ready(bs),
											aR: $elm$core$Maybe$Nothing
										}));
							} else {
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											aA: $author$project$Main$Ready(bs)
										}),
									$elm$core$Platform$Cmd$none);
							}
						} else {
							var e = result.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										aA: $author$project$Main$Failed(
											$author$project$Main$httpError(e))
									}),
								$elm$core$Platform$Cmd$none);
						}
					}
				case 3:
					var id = msg.a;
					var result = msg.b;
					return _Utils_Tuple2(
						A3(
							$author$project$Main$withDetail,
							id,
							function (d) {
								return _Utils_update(
									d,
									{
										bH: $author$project$Main$toLoaded(result)
									});
							},
							model),
						$elm$core$Platform$Cmd$none);
				case 4:
					var id = msg.a;
					var result = msg.b;
					return _Utils_Tuple2(
						A3(
							$author$project$Main$withDetail,
							id,
							function (d) {
								return _Utils_update(
									d,
									{
										aN: $author$project$Main$toLoaded(result)
									});
							},
							model),
						$elm$core$Platform$Cmd$none);
				case 13:
					var _v16 = model.d;
					if (!_v16.$) {
						var name = _v16.a;
						return _Utils_Tuple2(
							model,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$getVersion(name),
										$author$project$Main$getClock
									])));
					} else {
						return _Utils_Tuple2(model, $author$project$Main$getClock);
					}
				case 7:
					if (!msg.b.$) {
						var name = msg.a;
						var v = msg.b.a;
						if ((!_Utils_eq(
							model.d,
							$elm$core$Maybe$Just(name))) || _Utils_eq(
							model.aj,
							$elm$core$Maybe$Just(v))) {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						} else {
							var next = _Utils_update(
								model,
								{
									aj: $elm$core$Maybe$Just(v)
								});
							return _Utils_Tuple2(
								next,
								_Utils_eq(model.aj, $elm$core$Maybe$Nothing) ? $elm$core$Platform$Cmd$none : $author$project$Main$refresh(next));
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 12:
					var k = msg.a;
					if (model.ay) {
						return _Utils_Tuple2(
							((k === 'Escape') || ((k === 'q') || (k === 'Backspace'))) ? _Utils_update(
								model,
								{ay: false}) : model,
							$elm$core$Platform$Cmd$none);
					} else {
						var _v17 = A2($author$project$Keys$press, model.G, k);
						switch (_v17.$) {
							case 1:
								var p = _v17.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{G: p}),
									$elm$core$Platform$Cmd$none);
							case 2:
								return ($elm$core$List$isEmpty(model.G) && (!model.ab)) ? _Utils_Tuple2(
									_Utils_update(
										model,
										{r: $elm$core$Maybe$Nothing, h: $elm$core$Maybe$Nothing}),
									$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
									_Utils_update(
										model,
										{ab: false, G: _List_Nil}),
									$elm$core$Platform$Cmd$none);
							default:
								var a = _v17.a;
								return A2(
									$author$project$Main$run,
									a,
									_Utils_update(
										model,
										{h: $elm$core$Maybe$Nothing, G: _List_Nil}));
						}
					}
				case 14:
					var s = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								i: A2(
									$elm$core$Maybe$map,
									function (c) {
										return _Utils_update(
											c,
											{g: s});
									},
									model.i)
							}),
						$elm$core$Platform$Cmd$none);
				case 17:
					var nick = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								i: A2(
									$elm$core$Maybe$map,
									function (c) {
										return _Utils_update(
											c,
											{
												g: c.g + ((($elm$core$String$isEmpty(c.g) || A2($elm$core$String$endsWith, ' ', c.g)) ? '' : ' ') + ('@' + (nick + ' ')))
											});
									},
									model.i)
							}),
						$author$project$Main$focusComposer);
				case 18:
					var _v18 = model.as;
					if (!_v18.b) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var ss = _v18;
						var used = A2(
							$elm$core$Maybe$withDefault,
							0,
							A2(
								$elm$core$Maybe$map,
								function (c) {
									return $elm$core$List$length(
										A2($elm$core$String$indices, '@', c.g));
								},
								model.i));
						var _v19 = $elm$core$List$head(
							A2(
								$elm$core$List$drop,
								A2(
									$elm$core$Basics$modBy,
									$elm$core$List$length(ss),
									used),
								ss));
						if (!_v19.$) {
							var s = _v19.a;
							var $temp$msg = $author$project$Main$Mention(s.br),
								$temp$model = model;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					}
				case 16:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{i: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 15:
					var _v20 = _Utils_Tuple2(model.i, model.d);
					if (!_v20.a.$) {
						var text = _v20.a.a.g;
						var kind = _v20.a.a.dt;
						if (kind === 5) {
							return _Utils_Tuple2(
								model,
								$author$project$Main$postRepo(text));
						} else {
							if (kind === 6) {
								return _Utils_Tuple2(
									model,
									$author$project$Main$deleteRepo(
										$elm$core$String$trim(text)));
							} else {
								var _v21 = _Utils_Tuple2(model.i, model.d);
								if ((!_v21.a.$) && (!_v21.b.$)) {
									var c = _v21.a.a;
									var repo = _v21.b.a;
									return _Utils_Tuple2(
										model,
										A2(
											$author$project$Main$postOp,
											repo,
											$author$project$Main$composeFields(c)));
								} else {
									return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
								}
							}
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 9:
					if (!msg.a.$) {
						var name = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									aA: $author$project$Main$Loading,
									i: $elm$core$Maybe$Nothing,
									d: $elm$core$Maybe$Just(name),
									r: $elm$core$Maybe$Nothing,
									h: $elm$core$Maybe$Just('added ' + name),
									x: $elm$core$Maybe$Nothing,
									aj: $elm$core$Maybe$Nothing
								}),
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$getRepos,
										$author$project$Main$getBeads(name)
									])));
					} else {
						var e = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									h: $elm$core$Maybe$Just('not added: ' + e)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 10:
					if (!msg.b.$) {
						var name = msg.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									i: $elm$core$Maybe$Nothing,
									h: $elm$core$Maybe$Just('removed ' + (name + ' (its folder stays on disk)'))
								}),
							$author$project$Main$getRepos);
					} else {
						var name = msg.a;
						var e = msg.b.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									h: $elm$core$Maybe$Just(
										'not removed ' + (name + (': ' + $author$project$Main$httpError(e))))
								}),
							$elm$core$Platform$Cmd$none);
					}
				default:
					if (!msg.a.$) {
						var r = msg.a.a;
						var next = _Utils_update(
							model,
							{
								i: $elm$core$Maybe$Nothing,
								h: $elm$core$Maybe$Just(
									$author$project$Main$deliveryNote(r.bl))
							});
						return _Utils_Tuple2(
							next,
							$author$project$Main$refresh(next));
					} else {
						var e = msg.a.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									h: $elm$core$Maybe$Just('rejected: ' + e)
								}),
							$elm$core$Platform$Cmd$none);
					}
			}
		}
	});
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $author$project$Theme$css = function (s) {
	return ':root{' + ($elm$core$String$concat(
		A2(
			$elm$core$List$map,
			function (_v0) {
				var k = _v0.a;
				var v = _v0.b;
				return '--' + (k + (':' + (v + ';')));
			},
			$elm$core$Dict$toList(s.cf))) + '}');
};
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$loaded = F2(
	function (l, f) {
		switch (l.$) {
			case 0:
				return _List_fromArray(
					[
						$elm$html$Html$text('loading…')
					]);
			case 1:
				var e = l.a;
				return _List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('error')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(e)
							]))
					]);
			default:
				var v = l.a;
				return f(v);
		}
	});
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $author$project$Keys$walk = F2(
	function (path, bindings) {
		return A2(
			$elm$core$List$concatMap,
			function (b) {
				var _v0 = b.an;
				if (!_v0.$) {
					return _List_fromArray(
						[
							_Utils_Tuple2(
							_Utils_ap(
								path,
								_List_fromArray(
									[b.ad])),
							b.aV)
						]);
				} else {
					var next = _v0.a;
					return A2(
						$author$project$Keys$walk,
						_Utils_ap(
							path,
							_List_fromArray(
								[b.ad])),
						next);
				}
			},
			bindings);
	});
var $author$project$Keys$allKeys = A2($author$project$Keys$walk, _List_Nil, $author$project$Keys$root);
var $author$project$Keys$keyName = function (k) {
	switch (k) {
		case ' ':
			return 'SPC';
		case 'Backspace':
			return '⌫';
		case 'Enter':
			return '⏎';
		default:
			return k;
	}
};
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$Main$viewAllKeys = function (model) {
	return (!model.ay) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('finder')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('finderbox wide')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('findhead')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('findmode')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('ALL KEYS')
									])),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('dim')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$elm$core$String$fromInt(
											$elm$core$List$length($author$project$Keys$allKeys)) + ' keys from normal mode · Esc closes')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('allkeys')
							]),
						A2(
							$elm$core$List$map,
							function (_v0) {
								var path = _v0.a;
								var label = _v0.b;
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('keyrow')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('keys')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													A2(
														$elm$core$String$join,
														' ',
														A2($elm$core$List$map, $author$project$Keys$keyName, path)))
												])),
											A2(
											$elm$html$Html$span,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(label)
												]))
										]));
							},
							$author$project$Keys$allKeys))
					]))
			]));
};
var $elm$html$Html$a = _VirtualDom_node('a');
var $author$project$Keys$barHints = function (v) {
	var common = _List_fromArray(
		[
			_Utils_Tuple2('f', 'find'),
			_Utils_Tuple2('s', 'search'),
			_Utils_Tuple2('gt', 'view'),
			_Utils_Tuple2('[[ ]]', 'section'),
			_Utils_Tuple2('zz', 'center'),
			_Utils_Tuple2('⏎', 'discuss'),
			_Utils_Tuple2('c', 'comment'),
			_Utils_Tuple2('a', 'ask'),
			_Utils_Tuple2('n', 'new'),
			_Utils_Tuple2('SPC', 'menu'),
			_Utils_Tuple2('?', 'keys')
		]);
	switch (v) {
		case 1:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('hjkl', 'move'),
						_Utils_Tuple2('HL', 'to column'),
						_Utils_Tuple2('JK', 'priority')
					]),
				common);
		case 0:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('jk', 'move'),
						_Utils_Tuple2('HL', 'status'),
						_Utils_Tuple2('JK', 'priority')
					]),
				common);
		case 2:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('jk', 'select'),
						_Utils_Tuple2('HL', 'status'),
						_Utils_Tuple2('JK', 'priority')
					]),
				common);
		case 3:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('jk', 'row'),
						_Utils_Tuple2('hl', 'scroll'),
						_Utils_Tuple2('HL', 'move task'),
						_Utils_Tuple2('<>', 'shorten/extend'),
						_Utils_Tuple2('drag', 'move'),
						_Utils_Tuple2('+ -', 'zoom')
					]),
				common);
		case 4:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('jk', 'move'),
						_Utils_Tuple2('JK', 'priority'),
						_Utils_Tuple2('SPC e e', 'set epic')
					]),
				common);
		case 5:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('hjkl', 'move'),
						_Utils_Tuple2('JK', 'priority'),
						_Utils_Tuple2('SPC e e', 'set epic')
					]),
				common);
		case 6:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('hjkl', 'move'),
						_Utils_Tuple2('HL', 'now/next/later'),
						_Utils_Tuple2('JK', 'priority')
					]),
				common);
		case 7:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('hjkl', 'move'),
						_Utils_Tuple2('HL', 'week'),
						_Utils_Tuple2('JK', 'priority')
					]),
				common);
		case 8:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('Tab', 'next view')
					]),
				common);
		case 9:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('jk', 'move'),
						_Utils_Tuple2('JK', 'priority'),
						_Utils_Tuple2('HL', 'effort')
					]),
				common);
		default:
			return _Utils_ap(
				_List_fromArray(
					[
						_Utils_Tuple2('SPC v d', 'metrics')
					]),
				common);
	}
};
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$Attributes$rel = _VirtualDom_attribute('rel');
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$Main$viewBar = function (model) {
	var pending = A2(
		$elm$core$String$join,
		' ',
		A2(
			$elm$core$List$map,
			function (k) {
				return (k === ' ') ? 'SPC' : k;
			},
			model.G));
	var beads = function () {
		var _v2 = model.aA;
		if (_v2.$ === 2) {
			var bs = _v2.a;
			return bs;
		} else {
			return _List_Nil;
		}
	}();
	var _v0 = (!_Utils_eq(model.s, $elm$core$Maybe$Nothing)) ? _Utils_Tuple2('-FIND-', 'insert') : ((!_Utils_eq(model.H, $elm$core$Maybe$Nothing)) ? _Utils_Tuple2('-THEME-', 'insert') : ((!_Utils_eq(model.i, $elm$core$Maybe$Nothing)) ? _Utils_Tuple2('-INSERT-', 'insert') : ((!_Utils_eq(model.A, $elm$core$Maybe$Nothing)) ? _Utils_Tuple2('-DRAG-', 'drag') : _Utils_Tuple2('-NORMAL-', 'normal'))));
	var mode = _v0.a;
	var modeClass = _v0.b;
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bar')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mode ' + modeClass)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(mode)
					])),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pending')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(pending)
					])),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('vname')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						(model.c === 3) ? ('zoom ' + $author$project$Timeline$zoomAt(model.al).E) : '')
					])),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('hints')
					]),
				A2(
					$elm$core$List$map,
					function (_v1) {
						var k = _v1.a;
						var label = _v1.b;
						return A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hint')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('key')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(k)
										])),
									$elm$html$Html$text(' ' + label)
								]));
					},
					$author$project$Keys$barHints(model.c))),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('sponsor'),
						$elm$html$Html$Attributes$href($author$project$Main$sponsorUrl),
						$elm$html$Html$Attributes$target('_blank'),
						$elm$html$Html$Attributes$rel('noopener noreferrer')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Sponsor <3')
					]))
			]));
};
var $author$project$Widgets$epicChip = function (title) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('chip epictag')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('◆ ' + title)
			]));
};
var $author$project$Widgets$labelChip = function (l) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'chip lc' + $elm$core$String$fromInt(
					A2(
						$elm$core$Basics$modBy,
						7,
						$elm$core$List$sum(
							A2(
								$elm$core$List$map,
								$elm$core$Char$toCode,
								$elm$core$String$toList(l))))))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(l)
			]));
};
var $author$project$Widgets$chips = function (b) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('chips')
			]),
		_Utils_ap(
			A2(
				$elm$core$List$map,
				$author$project$Widgets$epicChip,
				A2(
					$elm$core$List$map,
					function ($) {
						return $.au;
					},
					b.bV)),
			A2($elm$core$List$map, $author$project$Widgets$labelChip, b.b4)));
};
var $author$project$Main$viewBeadHead = F2(
	function (_v0, b) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dtitle')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('id')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(b.a7)
							])),
						$elm$html$Html$text(' ' + b.au)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dmeta dim')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						A2(
							$elm$core$String$join,
							'  ',
							_List_fromArray(
								[
									$author$project$Types$statusLabel(b.aH),
									b.dt,
									'P' + $elm$core$String$fromInt(b.bw),
									$elm$core$String$isEmpty(b.az) ? 'unassigned' : ('@' + b.az)
								])))
					])),
				$elm$core$List$isEmpty(b.bV) ? $elm$html$Html$text('') : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dmeta')
					]),
				_List_fromArray(
					[
						$author$project$Widgets$chips(b)
					])),
				$elm$core$List$isEmpty(b.b4) ? $elm$html$Html$text('') : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dmeta dim')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						A2(
							$elm$core$String$join,
							' ',
							A2(
								$elm$core$List$map,
								function (l) {
									return '#' + l;
								},
								b.b4)))
					])),
				$elm$core$List$isEmpty(b.bS) ? $elm$html$Html$text('') : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dmeta')
					]),
				A2(
					$elm$core$List$cons,
					$elm$html$Html$text('depends on: '),
					A2(
						$elm$core$List$map,
						function (dep) {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('id')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(dep.dL + (' (' + (dep.dt + ') ')))
									]));
						},
						b.bS))),
				$elm$core$String$isEmpty(b.bT) ? $elm$html$Html$text('') : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ddesc')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(b.bT)
					]))
			]);
	});
var $author$project$Main$viewComments = function (cs) {
	return $elm$core$List$isEmpty(cs) ? _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('dim')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('no comments yet — c to comment, a to ask the implementer')
				]))
		]) : A2(
		$elm$core$List$map,
		function (c) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('comment')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('dim')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('author')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(c.cQ)
									])),
								$elm$html$Html$text('  ' + c.bO)
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ctext')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(c.g)
							]))
					]));
		},
		cs);
};
var $author$project$Main$Draft = function (a) {
	return {$: 14, a: a};
};
var $author$project$Main$CancelCompose = {$: 16};
var $author$project$Main$MentionNext = {$: 18};
var $author$project$Main$Submit = {$: 15};
var $author$project$Main$composerKeys = A2(
	$elm$json$Json$Decode$andThen,
	function (_v0) {
		var k = _v0.a;
		var ctrl = _v0.b;
		return (k === 'Escape') ? $elm$json$Json$Decode$succeed(
			_Utils_Tuple2($author$project$Main$CancelCompose, true)) : (((k === 'Enter') && ctrl) ? $elm$json$Json$Decode$succeed(
			_Utils_Tuple2($author$project$Main$Submit, true)) : ((k === 'Tab') ? $elm$json$Json$Decode$succeed(
			_Utils_Tuple2($author$project$Main$MentionNext, true)) : $elm$json$Json$Decode$fail('typing')));
	},
	A3(
		$elm$json$Json$Decode$map2,
		$elm$core$Tuple$pair,
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'ctrlKey', $elm$json$Json$Decode$bool)));
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$viewComposer = F2(
	function (model, c) {
		var label = function () {
			var _v0 = c.dt;
			switch (_v0) {
				case 0:
					return 'new bead title';
				case 1:
					return 'comment on ' + c.j;
				case 2:
					return 'ask on ' + (c.j + ' — @name sends it to that session');
				case 3:
					return 'rename ' + c.j;
				case 5:
					return 'add repos: one per line, path or name:path (name defaults to the folder name); ~ is home';
				case 6:
					return 'remove a repo: type its name (the folder stays on disk)';
				case 7:
					return 'put ' + (c.j + ' in an epic: type the epic id');
				case 8:
					return 'take ' + (c.j + ' out of an epic: type the epic id');
				case 4:
					return c.j + ' depends on … (bead id, or repo:id for another repo)';
				case 9:
					return 'add a label to ' + c.j;
				default:
					return 'remove a label from ' + c.j;
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('composer')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dim')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label + '   (Ctrl+Enter send, Tab mention a session, Esc cancel)')
						])),
					A2(
					$elm$html$Html$textarea,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$id('composer'),
							$elm$html$Html$Attributes$value(c.g),
							$elm$html$Html$Attributes$rows(4),
							$elm$html$Html$Events$onInput($author$project$Main$Draft),
							A2($elm$html$Html$Events$preventDefaultOn, 'keydown', $author$project$Main$composerKeys)
						]),
					_List_Nil),
					($elm$core$List$isEmpty(model.as) || ((!c.dt) || (c.dt === 3))) ? $elm$html$Html$text('') : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dim')
						]),
					A2(
						$elm$core$List$cons,
						$elm$html$Html$text('live sessions: '),
						A2(
							$elm$core$List$map,
							function (s) {
								return A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('chip'),
											$elm$html$Html$Events$onClick(
											$author$project$Main$Mention(s.br))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('@' + s.br)
										]));
							},
							model.as)))
				]));
	});
var $author$project$Main$viewComposerOrHint = function (model) {
	var _v0 = model.i;
	if (!_v0.$) {
		var c = _v0.a;
		return A2($author$project$Main$viewComposer, model, c);
	} else {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('dim hint')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('c comment · a ask · SPC e … edit · Esc close')
				]));
	}
};
var $author$project$Main$viewDetail = function (model) {
	var _v0 = model.r;
	if (_v0.$ === 1) {
		var _v1 = model.i;
		if (!_v1.$) {
			var c = _v1.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('detail')
					]),
				_List_fromArray(
					[
						A2($author$project$Main$viewComposer, model, c)
					]));
		} else {
			return $elm$html$Html$text('');
		}
	} else {
		var d = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail'),
					$elm$html$Html$Attributes$id('detail')
				]),
			_Utils_ap(
				A2(
					$author$project$Main$loaded,
					d.bH,
					$author$project$Main$viewBeadHead(model)),
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('discussion')
								]),
							A2($author$project$Main$loaded, d.aN, $author$project$Main$viewComments))
						]),
					_List_fromArray(
						[
							$author$project$Main$viewComposerOrHint(model)
						]))));
	}
};
var $author$project$Main$FinderInput = function (a) {
	return {$: 27, a: a};
};
var $author$project$Main$Select = function (a) {
	return {$: 23, a: a};
};
var $elm$html$Html$Attributes$autocomplete = function (bool) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $author$project$Main$FinderClose = {$: 31};
var $author$project$Main$FinderMove = function (a) {
	return {$: 29, a: a};
};
var $author$project$Main$FinderOpen = {$: 30};
var $author$project$Main$finderKeys = A2(
	$elm$json$Json$Decode$andThen,
	function (_v0) {
		var k = _v0.a;
		var ctrl = _v0.b;
		var _v1 = _Utils_Tuple2(k, ctrl);
		_v1$6:
		while (true) {
			switch (_v1.a) {
				case 'Escape':
					return $elm$json$Json$Decode$succeed($author$project$Main$FinderClose);
				case 'Enter':
					return $elm$json$Json$Decode$succeed($author$project$Main$FinderOpen);
				case 'ArrowDown':
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$FinderMove(1));
				case 'ArrowUp':
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$FinderMove(-1));
				case 'n':
					if (_v1.b) {
						return $elm$json$Json$Decode$succeed(
							$author$project$Main$FinderMove(1));
					} else {
						break _v1$6;
					}
				case 'p':
					if (_v1.b) {
						return $elm$json$Json$Decode$succeed(
							$author$project$Main$FinderMove(-1));
					} else {
						break _v1$6;
					}
				default:
					break _v1$6;
			}
		}
		return $elm$json$Json$Decode$fail('typing');
	},
	A3(
		$elm$json$Json$Decode$map2,
		$elm$core$Tuple$pair,
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'ctrlKey', $elm$json$Json$Decode$bool)));
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $author$project$Main$viewFinder = function (model) {
	var _v0 = model.s;
	if (_v0.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var f = _v0.a;
		var multi = function () {
			var _v1 = model.U;
			if (_v1.$ === 2) {
				var rs = _v1.a;
				return $elm$core$List$length(rs) > 1;
			} else {
				return false;
			}
		}();
		var row = F2(
			function (i, h) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('hit', true),
									_Utils_Tuple2(
									'current',
									_Utils_eq(i, f.N))
								])),
							$elm$html$Html$Events$onClick(
							$author$project$Main$Select(h.a7))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hitid')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									_Utils_ap(
										multi ? (h.a_ + ' ') : '',
										h.a7))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hittitle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(h.au)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hitfield')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(h.dj)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hitsnip dim')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(h.d$)
								]))
						]));
			});
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('finder')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('finderbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('findhead')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('findmode')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											f.aT ? 'FIND (fuzzy)' : 'SEARCH (exact)')
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('dim')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('id, title, text, comments, labels, epics, dates')
										]))
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('finder'),
									$elm$html$Html$Attributes$value(f.M),
									$elm$html$Html$Attributes$placeholder('type to search'),
									$elm$html$Html$Attributes$autocomplete(false),
									$elm$html$Html$Events$onInput($author$project$Main$FinderInput),
									A2($elm$html$Html$Events$on, 'keydown', $author$project$Main$finderKeys)
								]),
							_List_Nil),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hits')
								]),
							$elm$core$List$isEmpty(f.ac) ? _List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('dim hitnone')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$elm$core$String$isEmpty(
												$elm$core$String$trim(f.M)) ? 'start typing' : f.aF)
										]))
								]) : A2($elm$core$List$indexedMap, row, f.ac)),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dim findfoot')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('↑ ↓ or Ctrl+p Ctrl+n move · Enter open · Esc close')
								]))
						]))
				]));
	}
};
var $author$project$Main$viewFlash = function (model) {
	var _v0 = model.h;
	if (!_v0.$) {
		var s = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flash')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(s)
				]));
	} else {
		return $elm$html$Html$text('');
	}
};
var $author$project$Agile$dayOfMs = function (ms) {
	return (ms / 86400000) | 0;
};
var $elm$core$List$sort = function (xs) {
	return A2($elm$core$List$sortBy, $elm$core$Basics$identity, xs);
};
var $author$project$Agile$percentile = F2(
	function (p, xs) {
		var _v0 = $elm$core$List$sort(xs);
		if (!_v0.b) {
			return 0;
		} else {
			var sorted = _v0;
			var n = $elm$core$List$length(sorted);
			var i = $elm$core$Basics$ceiling((p / 100) * n) - 1;
			return A2(
				$elm$core$Maybe$withDefault,
				0,
				$elm$core$List$head(
					A2(
						$elm$core$List$drop,
						A2(
							$elm$core$Basics$max,
							0,
							A2($elm$core$Basics$min, n - 1, i)),
						sorted)));
		}
	});
var $author$project$Agile$flow = F2(
	function (today, beads) {
		var cur = $author$project$Agile$weekStart(today);
		var starts = A2(
			$elm$core$List$map,
			function (i) {
				return cur - (7 * (7 - i));
			},
			A2($elm$core$List$range, 0, 7));
		var createdDay = function (b) {
			return $author$project$Agile$dayOfMs(b.c$);
		};
		var closedDay = function (b) {
			return A2($elm$core$Maybe$map, $author$project$Agile$dayOfMs, b.cY);
		};
		var lead = A2(
			$elm$core$List$filterMap,
			function (b) {
				return A2(
					$elm$core$Maybe$map,
					function (c) {
						return A2(
							$elm$core$Basics$max,
							0,
							c - createdDay(b));
					},
					closedDay(b));
			},
			beads);
		var stat = function (s) {
			return {
				bM: $elm$core$List$length(
					A2(
						$elm$core$List$filter,
						function (b) {
							return A2(
								$elm$core$Maybe$withDefault,
								false,
								A2(
									$elm$core$Maybe$map,
									function (d) {
										return (_Utils_cmp(d, s) > -1) && (_Utils_cmp(d, s + 7) < 0);
									},
									closedDay(b)));
						},
						beads)),
				bO: $elm$core$List$length(
					A2(
						$elm$core$List$filter,
						function (b) {
							return (_Utils_cmp(
								createdDay(b),
								s) > -1) && (_Utils_cmp(
								createdDay(b),
								s + 7) < 0);
						},
						beads)),
				cz: s,
				cG: $elm$core$List$length(
					A2(
						$elm$core$List$filter,
						function (b) {
							return A2(
								$elm$core$Maybe$withDefault,
								false,
								A2(
									$elm$core$Maybe$map,
									function (d) {
										return _Utils_cmp(d, s + 7) < 0;
									},
									closedDay(b)));
						},
						beads)),
				cH: $elm$core$List$length(
					A2(
						$elm$core$List$filter,
						function (b) {
							return _Utils_cmp(
								createdDay(b),
								s + 7) < 0;
						},
						beads))
			};
		};
		return {
			b6: lead,
			cc: A2($author$project$Agile$percentile, 50, lead),
			cd: A2($author$project$Agile$percentile, 85, lead),
			ce: A2($author$project$Agile$percentile, 95, lead),
			cJ: A2($elm$core$List$map, stat, starts)
		};
	});
var $author$project$Widgets$dueText = function (b) {
	return $elm$core$String$isEmpty(b.aP) ? '' : A2($elm$core$String$dropLeft, 5, b.aP);
};
var $author$project$Widgets$prioName = function (p) {
	switch (p) {
		case 0:
			return 'critical';
		case 1:
			return 'high';
		case 2:
			return 'medium';
		case 3:
			return 'low';
		default:
			return 'backlog';
	}
};
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$Widgets$prioBadge = function (b) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'prio p' + $elm$core$String$fromInt(b.bw)),
				$elm$html$Html$Attributes$title(
				$author$project$Widgets$prioName(b.bw))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(
				'P' + $elm$core$String$fromInt(b.bw))
			]));
};
var $author$project$Widgets$card = F3(
	function (select, sel, b) {
		return A2(
			$elm$html$Html$div,
			_Utils_ap(
				_Utils_eq(
					sel,
					$elm$core$Maybe$Just(b.a7)) ? _List_fromArray(
					[
						$elm$html$Html$Attributes$id('sel')
					]) : _List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('card', true),
								_Utils_Tuple2(
								'current',
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(b.a7))),
								_Utils_Tuple2('isepic', b.dt === 'epic')
							])),
						$elm$html$Html$Events$onClick(
						select(b.a7))
					])),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cardtop')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('id')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(b.a7)
								])),
							$author$project$Widgets$prioBadge(b),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('kind')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(b.dt)
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ctitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.au)
						])),
					($elm$core$List$isEmpty(b.b4) && $elm$core$List$isEmpty(b.bV)) ? $elm$html$Html$text('') : $author$project$Widgets$chips(b),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cardfoot')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$isEmpty(b.az) ? '' : ('@' + b.az))
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$isEmpty(b.aP) ? '' : ('due ' + $author$project$Widgets$dueText(b)))
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(
									(b.c3 > 0) ? ('⛓ ' + $elm$core$String$fromInt(b.c3)) : '')
								]))
						]))
				]));
	});
var $author$project$Charts$column = F3(
	function (select, sel, col) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('col st-' + col.ax)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('colhead')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('colname')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(col.au)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('colcount')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(
										$elm$core$List$length(col.aA)))
								]))
						])),
					$elm$core$String$isEmpty(col.aF) ? $elm$html$Html$text('') : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('colnote')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(col.aF)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cards')
						]),
					$elm$core$List$isEmpty(col.aA) ? _List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('colempty')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('nothing here')
								]))
						]) : A2(
						$elm$core$List$map,
						A2($author$project$Widgets$card, select, sel),
						col.aA))
				]));
	});
var $author$project$Charts$viewBoard = F3(
	function (select, sel, cols) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('kanban')
				]),
			A2(
				$elm$core$List$map,
				A2($author$project$Charts$column, select, sel),
				cols));
	});
var $author$project$Charts$selAttr = F2(
	function (sel, id) {
		return _Utils_eq(
			sel,
			$elm$core$Maybe$Just(id)) ? _List_fromArray(
			[
				$elm$html$Html$Attributes$id('sel')
			]) : _List_Nil;
	});
var $author$project$Widgets$statusClass = function (s) {
	switch (s.$) {
		case 0:
			return 'open';
		case 1:
			return 'doing';
		case 2:
			return 'blocked';
		case 5:
			return 'done';
		default:
			return 'other';
	}
};
var $author$project$Charts$statusText = function (s) {
	switch (s.$) {
		case 1:
			return 'doing';
		case 0:
			return 'open';
		case 2:
			return 'blocked';
		case 5:
			return 'done';
		default:
			return 'other';
	}
};
var $author$project$Charts$child = F3(
	function (select, sel, b) {
		return A2(
			$elm$html$Html$div,
			_Utils_ap(
				A2($author$project$Charts$selAttr, sel, b.a7),
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('echild', true),
								_Utils_Tuple2(
								'current',
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(b.a7)))
							])),
						$elm$html$Html$Events$onClick(
						select(b.a7))
					])),
			_List_fromArray(
				[
					$author$project$Widgets$prioBadge(b),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('id')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.a7)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							'status st-' + $author$project$Widgets$statusClass(b.aH))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Charts$statusText(b.aH))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ltitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.au)
						]))
				]));
	});
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Charts$epicBlock = F3(
	function (select, sel, g) {
		var seg = F2(
			function (cls, n) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('seg ' + cls),
							A2(
							$elm$html$Html$Attributes$style,
							'flex',
							$elm$core$String$fromInt(n))
						]),
					_List_Nil);
			});
		var count = function (s) {
			return $elm$core$List$length(
				A2(
					$elm$core$List$filter,
					function (b) {
						return _Utils_eq(b.aH, s);
					},
					g.aB));
		};
		var _v0 = $author$project$Agile$progress(g.aB);
		var done = _v0.a;
		var total = _v0.b;
		var pct = (!total) ? 0 : (((100 * done) / total) | 0);
		var head = function () {
			var _v1 = g.a4;
			if (!_v1.$) {
				var e = _v1.a;
				return A2(
					$elm$html$Html$div,
					_Utils_ap(
						A2($author$project$Charts$selAttr, sel, e.a7),
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('epichead', true),
										_Utils_Tuple2(
										'current',
										_Utils_eq(
											sel,
											$elm$core$Maybe$Just(e.a7)))
									])),
								$elm$html$Html$Events$onClick(
								select(e.a7))
							])),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('id')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(e.a7)
								])),
							$author$project$Widgets$prioBadge(e),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('etitle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(e.au)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('epct')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(pct) + ('%  ' + ($elm$core$String$fromInt(done) + ('/' + $elm$core$String$fromInt(total)))))
								]))
						]));
			} else {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('epichead noepic')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('etitle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('No epic')
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('epct')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(total) + ' beads')
								]))
						]));
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('epic')
				]),
			_List_fromArray(
				[
					head,
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('bar-stack')
						]),
					_List_fromArray(
						[
							A2(
							seg,
							'done',
							count($author$project$Types$Closed)),
							A2(
							seg,
							'doing',
							count($author$project$Types$InProgress)),
							A2(
							seg,
							'blocked',
							count($author$project$Types$Blocked)),
							A2(
							seg,
							'open',
							count($author$project$Types$Open))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('echildren')
						]),
					A2(
						$elm$core$List$map,
						A2($author$project$Charts$child, select, sel),
						g.aB))
				]));
	});
var $author$project$Charts$viewEpics = F3(
	function (select, sel, groups) {
		return $elm$core$List$isEmpty(groups) ? A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('empty')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dtitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('No epics yet')
						])),
					A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Make a bead of kind epic, then press SPC e e on a bead to put it in the epic.')
						]))
				])) : A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('epics')
				]),
			A2(
				$elm$core$List$map,
				A2($author$project$Charts$epicBlock, select, sel),
				groups));
	});
var $author$project$Charts$chartH = 160;
var $author$project$Charts$chartW = 560;
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$core$String$fromFloat = _String_fromNumber;
var $author$project$Charts$f2 = function (x) {
	return $elm$core$String$fromFloat(
		$elm$core$Basics$round(x * 10) / 10);
};
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$line = $elm$svg$Svg$trustedNode('line');
var $elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var $elm$svg$Svg$polyline = $elm$svg$Svg$trustedNode('polyline');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$text = $elm$virtual_dom$VirtualDom$text;
var $elm$svg$Svg$text_ = $elm$svg$Svg$trustedNode('text');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$x1 = _VirtualDom_attribute('x1');
var $elm$svg$Svg$Attributes$x2 = _VirtualDom_attribute('x2');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $elm$svg$Svg$Attributes$y1 = _VirtualDom_attribute('y1');
var $elm$svg$Svg$Attributes$y2 = _VirtualDom_attribute('y2');
var $author$project$Charts$burnup = function (f) {
	var top = A2(
		$elm$core$Basics$max,
		1,
		A2(
			$elm$core$Maybe$withDefault,
			1,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.cH;
					},
					f.cJ))));
	var y = function (v) {
		return ($author$project$Charts$chartH - 20) - ((v / top) * ($author$project$Charts$chartH - 40));
	};
	var n = $elm$core$List$length(f.cJ);
	var x = function (i) {
		return 40 + ((i * ($author$project$Charts$chartW - 60)) / A2($elm$core$Basics$max, 1, n - 1));
	};
	var points = function (sel) {
		return A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$indexedMap,
				F2(
					function (i, w) {
						return $author$project$Charts$f2(
							x(i)) + (',' + $author$project$Charts$f2(
							y(
								sel(w))));
					}),
				f.cJ));
	};
	return A2(
		$elm$svg$Svg$svg,
		_List_fromArray(
			[
				$elm$svg$Svg$Attributes$width(
				$elm$core$String$fromFloat($author$project$Charts$chartW)),
				$elm$svg$Svg$Attributes$height(
				$elm$core$String$fromFloat($author$project$Charts$chartH)),
				$elm$svg$Svg$Attributes$class('svgchart')
			]),
		_List_fromArray(
			[
				A2(
				$elm$svg$Svg$line,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$x1('40'),
						$elm$svg$Svg$Attributes$y1(
						$author$project$Charts$f2($author$project$Charts$chartH - 20)),
						$elm$svg$Svg$Attributes$x2(
						$author$project$Charts$f2($author$project$Charts$chartW - 20)),
						$elm$svg$Svg$Attributes$y2(
						$author$project$Charts$f2($author$project$Charts$chartH - 20)),
						$elm$svg$Svg$Attributes$class('axis')
					]),
				_List_Nil),
				A2(
				$elm$svg$Svg$text_,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$x('4'),
						$elm$svg$Svg$Attributes$y('24'),
						$elm$svg$Svg$Attributes$class('axistext')
					]),
				_List_fromArray(
					[
						$elm$svg$Svg$text(
						$elm$core$String$fromInt(
							$elm$core$Basics$round(top)))
					])),
				A2(
				$elm$svg$Svg$polyline,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$points(
						points(
							function ($) {
								return $.cH;
							})),
						$elm$svg$Svg$Attributes$class('line scope')
					]),
				_List_Nil),
				A2(
				$elm$svg$Svg$polyline,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$points(
						points(
							function ($) {
								return $.cG;
							})),
						$elm$svg$Svg$Attributes$class('line done')
					]),
				_List_Nil),
				A2(
				$elm$svg$Svg$text_,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$x(
						$author$project$Charts$f2($author$project$Charts$chartW - 120)),
						$elm$svg$Svg$Attributes$y('14'),
						$elm$svg$Svg$Attributes$class('lscope')
					]),
				_List_fromArray(
					[
						$elm$svg$Svg$text('— scope')
					])),
				A2(
				$elm$svg$Svg$text_,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$x(
						$author$project$Charts$f2($author$project$Charts$chartW - 60)),
						$elm$svg$Svg$Attributes$y('14'),
						$elm$svg$Svg$Attributes$class('ldone')
					]),
				_List_fromArray(
					[
						$elm$svg$Svg$text('— done')
					]))
			]));
};
var $elm$svg$Svg$circle = $elm$svg$Svg$trustedNode('circle');
var $elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var $elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var $elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var $author$project$Charts$leadTime = function (f) {
	if ($elm$core$List$isEmpty(f.b6)) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('dim')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('No closed beads yet.')
				]));
	} else {
		var top = A2(
			$elm$core$Basics$max,
			1,
			A2(
				$elm$core$Maybe$withDefault,
				1,
				$elm$core$List$maximum(f.b6)));
		var y = function (d) {
			return ($author$project$Charts$chartH - 20) - ((d / top) * ($author$project$Charts$chartH - 40));
		};
		var sorted = $elm$core$List$sort(f.b6);
		var rule = F3(
			function (label, d, cls) {
				return _List_fromArray(
					[
						A2(
						$elm$svg$Svg$line,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x1('30'),
								$elm$svg$Svg$Attributes$y1(
								$author$project$Charts$f2(
									y(d))),
								$elm$svg$Svg$Attributes$x2(
								$author$project$Charts$f2($author$project$Charts$chartW - 20)),
								$elm$svg$Svg$Attributes$y2(
								$author$project$Charts$f2(
									y(d))),
								$elm$svg$Svg$Attributes$class('rule ' + cls)
							]),
						_List_Nil),
						A2(
						$elm$svg$Svg$text_,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$author$project$Charts$f2($author$project$Charts$chartW - 90)),
								$elm$svg$Svg$Attributes$y(
								$author$project$Charts$f2(
									y(d) - 3)),
								$elm$svg$Svg$Attributes$class('axistext')
							]),
						_List_fromArray(
							[
								$elm$svg$Svg$text(
								label + (' ' + ($elm$core$String$fromInt(d) + 'd')))
							]))
					]);
			});
		var n = $elm$core$List$length(f.b6);
		var x = function (i) {
			return 30 + ((i * ($author$project$Charts$chartW - 50)) / A2($elm$core$Basics$max, 1, n - 1));
		};
		return A2(
			$elm$svg$Svg$svg,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$width(
					$elm$core$String$fromFloat($author$project$Charts$chartW)),
					$elm$svg$Svg$Attributes$height(
					$elm$core$String$fromFloat($author$project$Charts$chartH)),
					$elm$svg$Svg$Attributes$class('svgchart')
				]),
			_Utils_ap(
				A2(
					$elm$core$List$indexedMap,
					F2(
						function (i, d) {
							return A2(
								$elm$svg$Svg$circle,
								_List_fromArray(
									[
										$elm$svg$Svg$Attributes$cx(
										$author$project$Charts$f2(
											x(i))),
										$elm$svg$Svg$Attributes$cy(
										$author$project$Charts$f2(
											y(d))),
										$elm$svg$Svg$Attributes$r('3.5'),
										$elm$svg$Svg$Attributes$class('dot')
									]),
								_List_Nil);
						}),
					sorted),
				_Utils_ap(
					A3(rule, 'p50', f.cc, 'p50'),
					_Utils_ap(
						A3(rule, 'p85', f.cd, 'p85'),
						A3(rule, 'p95', f.ce, 'p95')))));
	}
};
var $author$project$Charts$throughput = function (f) {
	var top = A2(
		$elm$core$Basics$max,
		1,
		A2(
			$elm$core$Maybe$withDefault,
			1,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.bM;
					},
					f.cJ))));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bars')
			]),
		A2(
			$elm$core$List$map,
			function (w) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('barcol')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barnum')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(w.bM))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barfill'),
									A2(
									$elm$html$Html$Attributes$style,
									'height',
									$elm$core$String$fromInt(((100 * w.bM) / top) | 0) + '%')
								]),
							_List_Nil),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barlabel')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Calendar$monthName(
										$author$project$Calendar$civil(w.cz).a9) + (' ' + $elm$core$String$fromInt(
										$author$project$Calendar$civil(w.cz).bP)))
								]))
						]));
			},
			f.cJ));
};
var $author$project$Charts$viewFlow = function (f) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flow')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('chart')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ctitle')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Burnup: scope and done')
							])),
						$author$project$Charts$burnup(f)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('chart')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ctitle')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Throughput: beads closed per week')
							])),
						$author$project$Charts$throughput(f)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('chart')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ctitle')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Lead time: days from created to closed')
							])),
						$author$project$Charts$leadTime(f)
					]))
			]));
};
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$g = $elm$svg$Svg$trustedNode('g');
var $author$project$Layout$orders = function (kind) {
	return A2(
		$elm$core$List$member,
		kind,
		_List_fromArray(
			['blocks', 'parent-child', 'conditional-blocks', 'waits-for']));
};
var $author$project$Layout$layers = F2(
	function (beads, edges) {
		var sorted = $author$project$Board$ordered(beads);
		var rowIn = F2(
			function (l, bs) {
				return A2(
					$elm$core$List$indexedMap,
					F2(
						function (i, b) {
							return {bH: b, b5: l, cs: i};
						}),
					bs);
			});
		var n = $elm$core$List$length(beads);
		var local = A2(
			$elm$core$List$filter,
			function (e) {
				return (e.d8 === '') && $author$project$Layout$orders(e.dt);
			},
			edges);
		var step = function (layer) {
			return A3(
				$elm$core$List$foldl,
				F2(
					function (e, acc) {
						var need = 1 + A2(
							$elm$core$Maybe$withDefault,
							0,
							A2($elm$core$Dict$get, e.d7, acc));
						return (_Utils_cmp(
							need,
							A2(
								$elm$core$Maybe$withDefault,
								0,
								A2($elm$core$Dict$get, e.bY, acc))) > 0) ? A3($elm$core$Dict$insert, e.bY, need, acc) : acc;
					}),
				layer,
				local);
		};
		var settled = A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, acc) {
					return step(acc);
				}),
			$elm$core$Dict$empty,
			A2(
				$elm$core$List$range,
				1,
				$elm$core$List$length(beads)));
		var layerOf = function (b) {
			return A2(
				$elm$core$Basics$min,
				n - 1,
				A2(
					$elm$core$Maybe$withDefault,
					0,
					A2($elm$core$Dict$get, b.a7, settled)));
		};
		return A2(
			$elm$core$List$concatMap,
			function (l) {
				return A2(
					rowIn,
					l,
					A2(
						$elm$core$List$filter,
						function (b) {
							return _Utils_eq(
								layerOf(b),
								l);
						},
						sorted));
			},
			A2($elm$core$List$range, 0, n - 1));
	});
var $author$project$Main$nodeH = 44;
var $author$project$Main$nodeW = 210;
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $author$project$Main$viewGraph = F3(
	function (sel, beads, edges) {
		var y = function (n) {
			return 24 + (n.cs * ($author$project$Main$nodeH + 16));
		};
		var x = function (n) {
			return 24 + (n.b5 * ($author$project$Main$nodeW + 50));
		};
		var nodes = A2($author$project$Layout$layers, beads, edges);
		var width = 24 + ((1 + A2(
			$elm$core$Maybe$withDefault,
			0,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.b5;
					},
					nodes)))) * ($author$project$Main$nodeW + 50));
		var height = 48 + ((1 + A2(
			$elm$core$Maybe$withDefault,
			0,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.cs;
					},
					nodes)))) * ($author$project$Main$nodeH + 16));
		var external = function (n) {
			return A2(
				$elm$core$String$join,
				'  ',
				A2(
					$elm$core$List$map,
					function (e) {
						return '→ ' + (e.d8 + (':' + e.d7));
					},
					A2(
						$elm$core$List$filter,
						function (e) {
							return _Utils_eq(e.bY, n.bH.a7) && (e.d8 !== '');
						},
						edges)));
		};
		var node = function (n) {
			return A2(
				$elm$svg$Svg$g,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$svg$Svg$rect,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$elm$core$String$fromInt(
									x(n))),
								$elm$svg$Svg$Attributes$y(
								$elm$core$String$fromInt(
									y(n))),
								$elm$svg$Svg$Attributes$width(
								$elm$core$String$fromInt($author$project$Main$nodeW)),
								$elm$svg$Svg$Attributes$height(
								$elm$core$String$fromInt($author$project$Main$nodeH)),
								$elm$svg$Svg$Attributes$class(
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(n.bH.a7)) ? 'gnode current' : 'gnode')
							]),
						_List_Nil),
						A2(
						$elm$svg$Svg$text_,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$elm$core$String$fromInt(
									x(n) + 8)),
								$elm$svg$Svg$Attributes$y(
								$elm$core$String$fromInt(
									y(n) + 17)),
								$elm$svg$Svg$Attributes$class('gid')
							]),
						_List_fromArray(
							[
								$elm$svg$Svg$text(
								n.bH.a7 + ('  ' + $author$project$Types$statusLabel(n.bH.aH)))
							])),
						A2(
						$elm$svg$Svg$text_,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$elm$core$String$fromInt(
									x(n) + 8)),
								$elm$svg$Svg$Attributes$y(
								$elm$core$String$fromInt(
									y(n) + 33)),
								$elm$svg$Svg$Attributes$class('gtitle')
							]),
						_List_fromArray(
							[
								$elm$svg$Svg$text(
								A2($elm$core$String$left, 28, n.bH.au))
							])),
						A2(
						$elm$svg$Svg$text_,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$elm$core$String$fromInt(
									x(n) + 8)),
								$elm$svg$Svg$Attributes$y(
								$elm$core$String$fromInt(
									(y(n) + $author$project$Main$nodeH) + 11)),
								$elm$svg$Svg$Attributes$class('gext')
							]),
						_List_fromArray(
							[
								$elm$svg$Svg$text(
								external(n))
							]))
					]));
		};
		var at = function (id) {
			return $elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (n) {
						return _Utils_eq(n.bH.a7, id);
					},
					nodes));
		};
		var link = function (e) {
			var _v0 = _Utils_Tuple3(
				e.d8,
				at(e.d7),
				at(e.bY));
			if (((_v0.a === '') && (!_v0.b.$)) && (!_v0.c.$)) {
				var target_ = _v0.b.a;
				var from = _v0.c.a;
				var y2 = y(from) + (($author$project$Main$nodeH / 2) | 0);
				var y1 = y(target_) + (($author$project$Main$nodeH / 2) | 0);
				var x2 = x(from);
				var x1 = x(target_) + $author$project$Main$nodeW;
				var mid = $elm$core$String$fromInt(((x1 + x2) / 2) | 0);
				return _List_fromArray(
					[
						A2(
						$elm$svg$Svg$path,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$d(
								'M' + ($elm$core$String$fromInt(x1) + (',' + ($elm$core$String$fromInt(y1) + (' C' + (mid + (',' + ($elm$core$String$fromInt(y1) + (' ' + (mid + (',' + ($elm$core$String$fromInt(y2) + (' ' + ($elm$core$String$fromInt(x2) + (',' + $elm$core$String$fromInt(y2)))))))))))))))),
								$elm$svg$Svg$Attributes$class(
								((e.dt === 'blocks') || (e.dt === 'parent-child')) ? 'edge' : 'edge soft')
							]),
						_List_Nil)
					]);
			} else {
				return _List_Nil;
			}
		};
		return A2(
			$elm$svg$Svg$svg,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$width(
					$elm$core$String$fromInt(width)),
					$elm$svg$Svg$Attributes$height(
					$elm$core$String$fromInt(height)),
					$elm$svg$Svg$Attributes$class('graph')
				]),
			_Utils_ap(
				A2($elm$core$List$concatMap, link, edges),
				A2($elm$core$List$map, node, nodes)));
	});
var $author$project$Main$selMark = F2(
	function (sel, id) {
		return _Utils_eq(
			sel,
			$elm$core$Maybe$Just(id)) ? _List_fromArray(
			[
				$elm$html$Html$Attributes$id('sel')
			]) : _List_Nil;
	});
var $author$project$Main$listRow = F2(
	function (sel, b) {
		return A2(
			$elm$html$Html$div,
			_Utils_ap(
				A2($author$project$Main$selMark, sel, b.a7),
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('lrow', true),
								_Utils_Tuple2(
								'current',
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(b.a7)))
							])),
						$elm$html$Html$Events$onClick(
						$author$project$Main$Select(b.a7))
					])),
			_List_fromArray(
				[
					$author$project$Widgets$prioBadge(b),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('id')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.a7)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							'status st-' + $author$project$Widgets$statusClass(b.aH))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Types$statusLabel(b.aH))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ltitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.au),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('kind')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('  ' + b.dt)
								]))
						])),
					$author$project$Widgets$chips(b),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dim')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$isEmpty(b.az) ? '—' : ('@' + b.az))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dim')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$isEmpty(b.aP) ? '—' : $author$project$Widgets$dueText(b))
						]))
				]));
	});
var $author$project$Main$viewList = F2(
	function (sel, beads) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('list')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('lrow lhead')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('ID')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('STATUS')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('TITLE')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('LABELS')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('OWNER')
								])),
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('DUE')
								]))
						])),
				A2(
					$elm$core$List$map,
					$author$project$Main$listRow(sel),
					$author$project$Board$ordered(beads))));
	});
var $author$project$Agile$matrixBuckets = _List_fromArray(
	['no estimate', '≤ 1 day', '2–3 days', '4–7 days', '8+ days']);
var $author$project$Charts$mini = F3(
	function (select, sel, b) {
		return A2(
			$elm$html$Html$div,
			_Utils_ap(
				A2($author$project$Charts$selAttr, sel, b.a7),
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('mini', true),
								_Utils_Tuple2(
								'current',
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(b.a7)))
							])),
						$elm$html$Html$Events$onClick(
						select(b.a7)),
						$elm$html$Html$Attributes$title(b.au)
					])),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('id')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(b.a7)
						])),
					$elm$html$Html$text(
					' ' + A2($elm$core$String$left, 22, b.au))
				]));
	});
var $author$project$Charts$quick = F2(
	function (p, c) {
		return ((p <= 1) && ((c === 1) || (c === 2))) ? ' quickwin' : '';
	});
var $author$project$Charts$viewMatrix = F3(
	function (select, sel, beads) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('matrix')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('mrow mhead')
						]),
					A2(
						$elm$core$List$cons,
						A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('mcell mlabel')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('priority \u005C effort')
								])),
						A2(
							$elm$core$List$map,
							function (b) {
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('mcell')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(b)
										]));
							},
							$author$project$Agile$matrixBuckets))),
				A2(
					$elm$core$List$map,
					function (p) {
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('mrow')
								]),
							A2(
								$elm$core$List$cons,
								A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class(
											'mcell mlabel p' + $elm$core$String$fromInt(p))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											'P' + $elm$core$String$fromInt(p))
										])),
								A2(
									$elm$core$List$map,
									function (c) {
										return A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class(
													'mcell' + A2($author$project$Charts$quick, p, c))
												]),
											A2(
												$elm$core$List$map,
												A2($author$project$Charts$mini, select, sel),
												A3($author$project$Agile$matrixCell, p, c, beads)));
									},
									A2($elm$core$List$range, 0, 4))));
					},
					A2($elm$core$List$range, 0, 4))));
	});
var $author$project$Charts$ageText = function (h) {
	return (h < 1) ? 'just now' : ((h < 48) ? ($elm$core$String$fromInt(
		$elm$core$Basics$round(h)) + ' h') : ($elm$core$String$fromInt(
		$elm$core$Basics$round(h / 24)) + ' days'));
};
var $author$project$Charts$agingList = function (m) {
	return $elm$core$List$isEmpty(m.bE) ? A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('dim')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('Nothing is in progress.')
			])) : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('aging')
			]),
		A2(
			$elm$core$List$map,
			function (a) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('agerow')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('id')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(a.a7)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ltitle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(a.au)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									(a.b1 > 48) ? 'late' : 'dim')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Charts$ageText(a.b1))
								]))
						]));
			},
			m.bE));
};
var $author$project$Charts$capacityList = function (m) {
	return $elm$core$List$isEmpty(m.bj) ? A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('dim')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('No agent has reported its capacity yet.')
			])) : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('outcomes')
			]),
		A2(
			$elm$core$List$map,
			function (a) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('outrow')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('outname')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(a.cN)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('outtrack')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('outfill out-success'),
											A2(
											$elm$html$Html$Attributes$style,
											'width',
											$elm$core$String$fromInt(
												A2(
													$elm$core$Basics$min,
													100,
													((a.a3 * 100) / A2(
														$elm$core$Basics$max,
														1,
														A2(
															$elm$core$Maybe$withDefault,
															1,
															$elm$core$List$maximum(
																A2(
																	$elm$core$List$map,
																	function ($) {
																		return $.a3;
																	},
																	m.bj))))) | 0)) + '%')
										]),
									_List_Nil)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dim')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(a.a3) + ' at once')
								]))
						]));
			},
			m.bj));
};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $author$project$Charts$kpi = F4(
	function (tone, label, value, note) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('kpi ' + tone),
					$elm$html$Html$Attributes$title(note)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('kpival')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(value)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('kpilabel')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('kpinote')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(note)
						]))
				]));
	});
var $author$project$Charts$one = F2(
	function (v, unit) {
		if (!v.$) {
			var x = v.a;
			return _Utils_ap(
				$elm$core$String$fromFloat(
					$elm$core$Basics$round(x * 10) / 10),
				unit);
		} else {
			return '—';
		}
	});
var $author$project$Charts$pctText = function (v) {
	if (!v.$) {
		var x = v.a;
		return $elm$core$String$fromInt(
			$elm$core$Basics$round(x)) + '%';
	} else {
		return '—';
	}
};
var $author$project$Charts$thousands = function (v) {
	if (!v.$) {
		var x = v.a;
		return (x >= 1000) ? A2(
			$author$project$Charts$one,
			$elm$core$Maybe$Just(x / 1000),
			'k') : A2(
			$author$project$Charts$one,
			$elm$core$Maybe$Just(x),
			'');
	} else {
		return '—';
	}
};
var $author$project$Charts$kpis = function (m) {
	var good = F3(
		function (v, hi, lo) {
			if (v.$ === 1) {
				return 'none';
			} else {
				var x = v.a;
				return (_Utils_cmp(x, hi) > -1) ? 'good' : ((_Utils_cmp(x, lo) > -1) ? 'warn' : 'bad');
			}
		});
	var bias = function () {
		var _v1 = m.db;
		if (!_v1.$) {
			var b = _v1.a;
			return (b > 0) ? ('took ' + ($elm$core$String$fromInt(
				$elm$core$Basics$round(b)) + '% longer than estimated')) : ('took ' + ($elm$core$String$fromInt(
				$elm$core$Basics$round(
					$elm$core$Basics$abs(b))) + '% less than estimated'));
		} else {
			return 'no estimate to compare with yet';
		}
	}();
	return _List_fromArray(
		[
			A4(
			$author$project$Charts$kpi,
			'none',
			'velocity',
			A2($author$project$Charts$one, m.cR, ' pts/wk'),
			'average points closed per week over the last 4 weeks'),
			A4(
			$author$project$Charts$kpi,
			'none',
			'forecast',
			A2($author$project$Charts$one, m.dm, ' wk'),
			$elm$core$String$fromInt(m.dS) + ' points left at that pace'),
			A4(
			$author$project$Charts$kpi,
			A3(good, m.cD, 80, 60),
			'success rate',
			$author$project$Charts$pctText(m.cD),
			$elm$core$String$fromInt(m.cn) + ' reports'),
			A4(
			$author$project$Charts$kpi,
			function () {
				var _v0 = m.cr;
				if (_v0.$ === 1) {
					return 'none';
				} else {
					var r = _v0.a;
					return (r <= 20) ? 'good' : ((r <= 40) ? 'warn' : 'bad');
				}
			}(),
			'rework',
			$author$project$Charts$pctText(m.cr),
			'reports that needed more than one attempt'),
			A4(
			$author$project$Charts$kpi,
			'none',
			'estimate error',
			$author$project$Charts$pctText(m.dc),
			$elm$core$String$fromInt(m.dd) + (' beads · ' + bias)),
			A4(
			$author$project$Charts$kpi,
			'none',
			'utilization',
			$author$project$Charts$pctText(m.ee),
			$elm$core$String$fromInt(m.ei) + (' in progress, capacity ' + $elm$core$String$fromInt(m.a3))),
			A4(
			$author$project$Charts$kpi,
			'none',
			'minutes / point',
			A2($author$project$Charts$one, m.dB, ''),
			'actual work minutes per point of weight'),
			A4(
			$author$project$Charts$kpi,
			'none',
			'tokens / point',
			$author$project$Charts$thousands(m.d9),
			$elm$core$String$fromInt(
				$elm$core$Basics$round(
					A2($elm$core$Maybe$withDefault, 0, m.c_))) + ' cents per point'),
			A4(
			$author$project$Charts$kpi,
			'none',
			'flow efficiency',
			$author$project$Charts$pctText(m.dl),
			'work time as a share of the time from created to closed'),
			A4(
			$author$project$Charts$kpi,
			'none',
			'lead time',
			$elm$core$String$fromInt(
				$elm$core$Basics$round(m.du)) + ' h',
			'median hours from created to closed'),
			A4(
			$author$project$Charts$kpi,
			A2(
				$elm$core$Basics$always,
				_Utils_eq(m.bC, $elm$core$Maybe$Nothing) ? 'none' : 'good',
				A3(
					good,
					$elm$core$Maybe$Just(
						100 - A2($elm$core$Maybe$withDefault, 100, m.bC)),
					0,
					0)),
			'tests passing',
			$author$project$Charts$pctText(m.bC),
			'of the tests agents reported'),
			A4(
			$author$project$Charts$kpi,
			(m.bI > 0) ? 'warn' : 'none',
			'blocked',
			$elm$core$String$fromInt(m.bI),
			$elm$core$String$fromInt(m.dy) + ' reports under 60% confidence')
		]);
};
var $author$project$Charts$levelBars = function (ls) {
	if ($elm$core$List$isEmpty(ls)) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('dim')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Nothing reported yet.')
				]));
	} else {
		var top = A2(
			$elm$core$Basics$max,
			1,
			A2(
				$elm$core$Maybe$withDefault,
				1,
				$elm$core$List$maximum(
					A2(
						$elm$core$List$map,
						function ($) {
							return $.aA;
						},
						ls))));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('outcomes')
				]),
			A2(
				$elm$core$List$map,
				function (l) {
					return A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('outrow')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('outname')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$elm$core$String$fromInt(l.dx))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('outtrack')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('outfill out-success'),
												A2(
												$elm$html$Html$Attributes$style,
												'width',
												$elm$core$String$fromInt(((100 * l.bA) / top) | 0) + '%')
											]),
										_List_Nil),
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('outfill out-partial'),
												A2(
												$elm$html$Html$Attributes$style,
												'width',
												$elm$core$String$fromInt(((100 * (l.aA - l.bA)) / top) | 0) + '%')
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('dim')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$elm$core$String$fromInt(l.bA) + ('/' + ($elm$core$String$fromInt(l.aA) + ' ok')))
									]))
							]));
				},
				ls));
	}
};
var $author$project$Charts$outcomeBars = function (m) {
	var total = A2(
		$elm$core$Basics$max,
		1,
		$elm$core$List$sum(
			A2($elm$core$List$map, $elm$core$Tuple$second, m.cb)));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('outcomes')
			]),
		A2(
			$elm$core$List$map,
			function (_v0) {
				var name = _v0.a;
				var n = _v0.b;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('outrow')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('outname out-' + name)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(name)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('outtrack')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('outfill out-' + name),
											A2(
											$elm$html$Html$Attributes$style,
											'width',
											$elm$core$String$fromInt(((100 * n) / total) | 0) + '%')
										]),
									_List_Nil)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dim')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(n))
								]))
						]));
			},
			A2($elm$core$List$sortBy, $elm$core$Tuple$first, m.cb)));
};
var $author$project$Charts$panel = F2(
	function (title, body) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('panel')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ctitle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(title)
						])),
					body
				]));
	});
var $author$project$Charts$velocityBars = function (m) {
	var top = A2(
		$elm$core$Basics$max,
		1,
		A2(
			$elm$core$Maybe$withDefault,
			1,
			$elm$core$List$maximum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.bu;
					},
					m.cI))));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bars small')
			]),
		A2(
			$elm$core$List$map,
			function (w) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('barcol')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barnum')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(w.bu))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barfill'),
									A2(
									$elm$html$Html$Attributes$style,
									'height',
									$elm$core$String$fromInt(((100 * w.bu) / top) | 0) + '%')
								]),
							_List_Nil),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('barlabel')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2($elm$core$String$dropLeft, 5, w.cz))
								]))
						]));
			},
			m.cI));
};
var $author$project$Charts$viewMetrics = function (mm) {
	if (mm.$ === 1) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('empty')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('loading metrics…')
				]));
	} else {
		var m = mm.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('metrics')
				]),
			((!m.cn) && (!m.eg)) ? _List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('empty')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dtitle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Nothing measured yet')
								])),
							A2(
							$elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Agents report what they measure with gebed_report: outcome, weight, complexity, minutes, attempts, tokens, tests and capacity.')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dim')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('The gebed-pm skill tells them how. Install it with: gebed skill install')
								]))
						]))
				]) : _List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('kpis')
						]),
					$author$project$Charts$kpis(m)),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('mgrid')
						]),
					_List_fromArray(
						[
							A2(
							$author$project$Charts$panel,
							'Velocity: points closed per week',
							$author$project$Charts$velocityBars(m)),
							A2(
							$author$project$Charts$panel,
							'Outcomes of reports',
							$author$project$Charts$outcomeBars(m)),
							A2(
							$author$project$Charts$panel,
							'Capacity: agents and what they can run at once',
							$author$project$Charts$capacityList(m)),
							A2(
							$author$project$Charts$panel,
							'Work in progress that has not moved',
							$author$project$Charts$agingList(m)),
							A2(
							$author$project$Charts$panel,
							'Complexity: how often work succeeds',
							$author$project$Charts$levelBars(m.cZ)),
							A2(
							$author$project$Charts$panel,
							'Weight: beads per size',
							$author$project$Charts$levelBars(m.eh))
						]))
				]));
	}
};
var $author$project$Main$DragStart = F2(
	function (a, b) {
		return {$: 24, a: a, b: b};
	});
var $author$project$Main$ZoomBy = function (a) {
	return {$: 22, a: a};
};
var $author$project$Calendar$dayOfMonth = function (days) {
	return $author$project$Calendar$civil(days).bP;
};
var $author$project$Timeline$cellLabel = F2(
	function (cell, start) {
		return (cell >= 1440) ? $elm$core$String$fromInt(
			$author$project$Calendar$dayOfMonth((start / 1440) | 0)) : ((cell >= 60) ? $author$project$Timeline$pad2(
			(A2($elm$core$Basics$modBy, 1440, start) / 60) | 0) : $author$project$Timeline$clock(start));
	});
var $author$project$Timeline$stamp = function (m) {
	return $author$project$Calendar$toIso((m / 1440) | 0) + (' ' + $author$project$Timeline$clock(m));
};
var $author$project$Timeline$topLabel = F3(
	function (cell, start, isFirst) {
		var day = (start / 1440) | 0;
		var c = $author$project$Calendar$civil(day);
		return (cell >= 1440) ? ((isFirst || (c.bP === 1)) ? ($author$project$Calendar$monthName(c.a9) + (' ' + $elm$core$String$fromInt(c.bi))) : '') : ((isFirst || (!A2($elm$core$Basics$modBy, 1440, start))) ? ($author$project$Calendar$monthName(c.a9) + (' ' + $elm$core$String$fromInt(c.bP))) : '');
	});
var $author$project$Calendar$weekend = function (days) {
	return A2(
		$elm$core$List$member,
		A2($elm$core$Basics$modBy, 7, days + 4),
		_List_fromArray(
			[0, 6]));
};
var $author$project$Main$viewWaterfall = F3(
	function (model, sel, beads) {
		var zoom = $author$project$Timeline$zoomAt(model.al);
		var cell = zoom.bK;
		var cellNode = F2(
			function (i, start) {
				return A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('wd', true),
									_Utils_Tuple2(
									'wend',
									(cell >= 1440) && $author$project$Calendar$weekend((start / 1440) | 0)),
									_Utils_Tuple2(
									'wnow',
									(_Utils_cmp(start, model.F) < 1) && (_Utils_cmp(model.F, start + cell) < 0)),
									_Utils_Tuple2(
									'wmid',
									(cell < 1440) && (!A2($elm$core$Basics$modBy, 1440, start)))
								]))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2($author$project$Timeline$cellLabel, cell, start))
						]));
			});
		var monthNode = F2(
			function (i, start) {
				return A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('wm')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A3($author$project$Timeline$topLabel, cell, start, !i))
						]));
			});
		var shift = function (s) {
			var _v1 = model.A;
			if (!_v1.$) {
				var d = _v1.a;
				return _Utils_eq(d.a7, s.bH.a7) ? ($elm$core$Basics$round(d.aQ / $author$project$Main$cellW) * cell) : 0;
			} else {
				return 0;
			}
		};
		var c = $author$project$Main$clockOf(model);
		var ss = A2($author$project$Timeline$spans, c, beads);
		var _v0 = A4(
			$author$project$Timeline$window,
			cell,
			A2($elm$core$Maybe$withDefault, model.F, model.aS),
			c,
			ss);
		var from = _v0.a;
		var to = _v0.b;
		var px = function (m) {
			return (((m - from) * $author$project$Main$cellW) / cell) | 0;
		};
		var bar = function (s) {
			var width = s.bf ? A2($elm$core$Basics$max, 8, ((((s.Q - s.cz) * $author$project$Main$cellW) / cell) | 0) - 2) : ($author$project$Main$cellW - 2);
			var moved = shift(s);
			var late = s.bf && ((_Utils_cmp(s.Q, model.F) < 0) && (!_Utils_eq(s.bH.aH, $author$project$Types$Closed)));
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('wbar', true),
								_Utils_Tuple2(
								'wbar-' + $author$project$Widgets$statusClass(s.bH.aH),
								true),
								_Utils_Tuple2('unsched', !s.bf),
								_Utils_Tuple2('late', late),
								_Utils_Tuple2(
								'current',
								_Utils_eq(
									sel,
									$elm$core$Maybe$Just(s.bH.a7))),
								_Utils_Tuple2('dragging', !(!moved))
							])),
						A2(
						$elm$html$Html$Attributes$style,
						'left',
						$elm$core$String$fromInt(
							px(s.cz + moved)) + 'px'),
						A2(
						$elm$html$Html$Attributes$style,
						'width',
						$elm$core$String$fromInt(width) + 'px'),
						$elm$html$Html$Attributes$title(
						s.bf ? ($author$project$Timeline$stamp(s.cz + moved) + (' → ' + $author$project$Timeline$stamp(s.Q + moved))) : 'not scheduled yet: move it with H and L, or drag it'),
						A2(
						$elm$html$Html$Events$preventDefaultOn,
						'mousedown',
						A2(
							$elm$json$Json$Decode$map,
							function (x) {
								return _Utils_Tuple2(
									A2($author$project$Main$DragStart, s.bH.a7, x),
									true);
							},
							A2($elm$json$Json$Decode$field, 'pageX', $elm$json$Json$Decode$float)))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(s.bH.au)
					]));
		};
		var inWindow = function (s) {
			return (_Utils_cmp(s.Q + cell, from) > -1) && (_Utils_cmp(s.cz, to + cell) < 1);
		};
		var n = (((to - from) / cell) | 0) + 1;
		var starts = A2(
			$elm$core$List$map,
			function (i) {
				return from + (i * cell);
			},
			A2($elm$core$List$range, 0, n - 1));
		var total = n * $author$project$Main$cellW;
		var row = function (s) {
			return A2(
				$elm$html$Html$div,
				_Utils_ap(
					A2($author$project$Main$selMark, sel, s.bH.a7),
					_List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('wrow', true),
									_Utils_Tuple2(
									'current',
									_Utils_eq(
										sel,
										$elm$core$Maybe$Just(s.bH.a7)))
								]))
						])),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('wlabel'),
								$elm$html$Html$Events$onClick(
								$author$project$Main$Select(s.bH.a7))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('id')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(s.bH.a7)
									])),
								$elm$html$Html$text(' ' + s.bH.au)
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('wtrack'),
								A2(
								$elm$html$Html$Attributes$style,
								'width',
								$elm$core$String$fromInt(total) + 'px')
							]),
						_List_fromArray(
							[
								((_Utils_cmp(model.F, from) > -1) && (_Utils_cmp(model.F, to) < 1)) ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('wtoday'),
										A2(
										$elm$html$Html$Attributes$style,
										'left',
										$elm$core$String$fromInt(
											px(model.F)) + 'px')
									]),
								_List_Nil) : $elm$html$Html$text(''),
								inWindow(s) ? bar(s) : $elm$html$Html$text('')
							]))
					]));
		};
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('wf'),
					$elm$html$Html$Attributes$id('wf'),
					A2(
					$elm$html$Html$Attributes$style,
					'--cw',
					$elm$core$String$fromInt($author$project$Main$cellW) + 'px')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('wrow wruler')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('wlabel')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('zoomctl')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('zbtn'),
													$elm$html$Html$Events$onClick(
													$author$project$Main$ZoomBy(-1))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('−')
												])),
											$elm$html$Html$text(' zoom: ' + (zoom.E + ' ')),
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('zbtn'),
													$elm$html$Html$Events$onClick(
													$author$project$Main$ZoomBy(1))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('+')
												]))
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('wtrack'),
									A2(
									$elm$html$Html$Attributes$style,
									'width',
									$elm$core$String$fromInt(total) + 'px')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('wmonths')
										]),
									A2($elm$core$List$indexedMap, monthNode, starts)),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('wdays')
										]),
									A2($elm$core$List$indexedMap, cellNode, starts))
								]))
						])),
				A2($elm$core$List$map, row, ss)));
	});
var $author$project$Main$viewBodyWith = F2(
	function (model, beads) {
		var sel = A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.a7;
			},
			$author$project$Main$selected(model));
		var _v0 = model.c;
		switch (_v0) {
			case 0:
				return _List_fromArray(
					[
						A2($author$project$Main$viewList, sel, beads)
					]);
			case 2:
				return _List_fromArray(
					[
						A3($author$project$Main$viewGraph, sel, beads, model.aC)
					]);
			case 3:
				return _List_fromArray(
					[
						A3($author$project$Main$viewWaterfall, model, sel, beads)
					]);
			case 10:
				return _List_fromArray(
					[
						$author$project$Charts$viewMetrics(model.aX)
					]);
			case 4:
				return _List_fromArray(
					[
						A3(
						$author$project$Charts$viewEpics,
						$author$project$Main$Select,
						sel,
						$author$project$Agile$epicGroups(beads))
					]);
			case 8:
				return _List_fromArray(
					[
						$author$project$Charts$viewFlow(
						A2($author$project$Agile$flow, model.y, beads))
					]);
			case 9:
				return _List_fromArray(
					[
						A3($author$project$Charts$viewMatrix, $author$project$Main$Select, sel, beads)
					]);
			default:
				var _v1 = A3($author$project$Agile$columnsFor, model.y, model.c, beads);
				if (!_v1.$) {
					var cols = _v1.a;
					return _List_fromArray(
						[
							A3($author$project$Charts$viewBoard, $author$project$Main$Select, sel, cols)
						]);
				} else {
					return _List_Nil;
				}
		}
	});
var $author$project$Main$viewBody = F2(
	function (model, beads) {
		return $elm$core$List$isEmpty(beads) ? _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('empty')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('dtitle')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('No beads in this repo yet')
							])),
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Press n to create the first one.')
							]))
					]))
			]) : A2($author$project$Main$viewBodyWith, model, beads);
	});
var $author$project$Main$viewMain = function (model) {
	var _v0 = model.U;
	if ((_v0.$ === 2) && (!_v0.a.b)) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('empty')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('dtitle')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('No repos yet')
							])),
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Press SPC p a and type the path of a repo that has a .beads folder.')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('dim')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Or start gebed with the paths: gebed ~/code/one ~/code/two')
							]))
					]))
			]);
	} else {
		return A2(
			$author$project$Main$loaded,
			model.aA,
			$author$project$Main$viewBody(model));
	}
};
var $author$project$Keys$prefixMark = function (e) {
	if (e.$ === 1) {
		return ' …';
	} else {
		return '';
	}
};
var $author$project$Keys$hints = function (pending) {
	return A2(
		$elm$core$List$map,
		function (b) {
			return _Utils_Tuple2(
				$author$project$Keys$keyName(b.ad),
				_Utils_ap(
					b.aV,
					$author$project$Keys$prefixMark(b.an)));
		},
		A2(
			$elm$core$Maybe$withDefault,
			_List_Nil,
			$author$project$Keys$bindingsAt(pending)));
};
var $author$project$Main$viewPopup = function (model) {
	var rows = model.ab ? $author$project$Keys$hints(_List_Nil) : $author$project$Keys$hints(model.G);
	return ($elm$core$List$isEmpty(model.G) && (!model.ab)) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('whichkey')
			]),
		A2(
			$elm$core$List$map,
			function (_v0) {
				var k = _v0.a;
				var label = _v0.b;
				return A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('wk')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('key')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(k)
								])),
							$elm$html$Html$text(' ' + label)
						]));
			},
			rows));
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Main$repoItem = F2(
	function (current, r) {
		return A2(
			$elm$html$Html$li,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'current',
							_Utils_eq(
								current,
								$elm$core$Maybe$Just(r.E)))
						])),
					$elm$html$Html$Events$onClick(
					$author$project$Main$Pick(r.E))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(r.E),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('dim')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(' ' + r.cS)
						]))
				]));
	});
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Main$viewRepos = F2(
	function (current, repos) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$ul,
				_List_Nil,
				A2(
					$elm$core$List$map,
					$author$project$Main$repoItem(current),
					repos))
			]);
	});
var $author$project$Main$GoView = function (a) {
	return {$: 20, a: a};
};
var $author$project$Stats$count = function (f) {
	return A2(
		$elm$core$Basics$composeR,
		$elm$core$List$filter(f),
		$elm$core$List$length);
};
var $author$project$Stats$n = F2(
	function (k, label) {
		return $elm$core$String$fromInt(k) + (' ' + label);
	});
var $author$project$Stats$outcomes = A2(
	$elm$core$Basics$composeL,
	$elm$core$List$length,
	$elm$core$List$filter(
		A2(
			$elm$core$Basics$composeL,
			$elm$core$List$any(
				$elm$core$String$startsWith('outcome:')),
			function ($) {
				return $.b4;
			})));
var $author$project$Stats$weightOf = function (b) {
	return A2(
		$elm$core$Maybe$withDefault,
		0,
		A2(
			$elm$core$Maybe$andThen,
			A2(
				$elm$core$Basics$composeR,
				$elm$core$String$dropLeft(7),
				$elm$core$String$toInt),
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					$elm$core$String$startsWith('weight:'),
					b.b4))));
};
var $author$project$Stats$summary = F5(
	function (today, clock, view, beads, edges) {
		switch (view) {
			case 1:
				return A2(
					$elm$core$List$cons,
					A2(
						$author$project$Stats$n,
						$elm$core$List$length(beads),
						'beads'),
					A2(
						$elm$core$List$map,
						function (_v1) {
							var s = _v1.a;
							var bs = _v1.b;
							return A2(
								$author$project$Stats$n,
								$elm$core$List$length(bs),
								$author$project$Types$statusLabel(s));
						},
						$author$project$Board$columns(beads)));
			case 0:
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(beads),
						'beads'),
						A2(
						$author$project$Stats$n,
						A2(
							$author$project$Stats$count,
							function (b) {
								return !_Utils_eq(b.aH, $author$project$Types$Closed);
							},
							beads),
						'open'),
						A2(
						$author$project$Stats$n,
						A2(
							$author$project$Stats$count,
							function (b) {
								return _Utils_eq(b.aH, $author$project$Types$Closed);
							},
							beads),
						'closed'),
						A2(
						$author$project$Stats$n,
						A2(
							$author$project$Stats$count,
							function (b) {
								return (b.bw <= 1) && (!_Utils_eq(b.aH, $author$project$Types$Closed));
							},
							beads),
						'urgent')
					]);
			case 2:
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(beads),
						'nodes'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function (e) {
									return e.d8 === '';
								},
								edges)),
						'links'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function (e) {
									return e.d8 !== '';
								},
								edges)),
						'cross-repo')
					]);
			case 4:
				var groups = A2(
					$elm$core$List$filter,
					function (g) {
						return !_Utils_eq(g.a4, $elm$core$Maybe$Nothing);
					},
					$author$project$Agile$epicGroups(beads));
				var _v2 = $author$project$Agile$progress(
					A2(
						$elm$core$List$concatMap,
						function ($) {
							return $.aB;
						},
						groups));
				var done = _v2.a;
				var total = _v2.b;
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(groups),
						'epics'),
						$elm$core$String$fromInt(done) + ('/' + ($elm$core$String$fromInt(total) + ' stories done'))
					]);
			case 5:
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function (g) {
									return !_Utils_eq(g.a4, $elm$core$Maybe$Nothing);
								},
								$author$project$Agile$epicGroups(beads))),
						'epics'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(beads),
						'beads')
					]);
			case 6:
				return A2(
					$elm$core$List$map,
					function (c) {
						return A2(
							$author$project$Stats$n,
							$elm$core$List$length(c.aA),
							c.au);
					},
					A2($author$project$Agile$roadmapCols, today, beads));
			case 7:
				return A2(
					$elm$core$List$map,
					function (c) {
						return A2(
							$author$project$Stats$n,
							$elm$core$List$length(c.aA),
							c.au);
					},
					A2(
						$elm$core$List$filter,
						function (c) {
							return !$elm$core$List$isEmpty(c.aA);
						},
						A2($author$project$Agile$iterationCols, today, beads)));
			case 8:
				var f = A2($author$project$Agile$flow, today, beads);
				return _List_fromArray(
					[
						'lead time p50 ' + ($elm$core$String$fromInt(f.cc) + 'd'),
						'p85 ' + ($elm$core$String$fromInt(f.cd) + 'd'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$sum(
							A2(
								$elm$core$List$map,
								function ($) {
									return $.bM;
								},
								f.cJ)),
						'closed in 8 weeks')
					]);
			case 10:
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$author$project$Stats$outcomes(beads),
						'reports'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function (b) {
									return $author$project$Stats$weightOf(b) > 0;
								},
								beads)),
						'weighed')
					]);
			case 9:
				var quick = A2(
					$elm$core$List$concatMap,
					function (p) {
						return A2(
							$elm$core$List$concatMap,
							function (c) {
								return A3($author$project$Agile$matrixCell, p, c, beads);
							},
							_List_fromArray(
								[1, 2]));
					},
					_List_fromArray(
						[0, 1]));
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function (b) {
									return !_Utils_eq(b.aH, $author$project$Types$Closed);
								},
								beads)),
						'open'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(quick),
						'quick wins (P0-P1, up to 3 days)')
					]);
			default:
				var ss = A2($author$project$Timeline$spans, clock, beads);
				var late = A2(
					$elm$core$List$filter,
					function (s) {
						return s.bf && ((_Utils_cmp(s.Q, clock.bs) < 0) && (!_Utils_eq(s.bH.aH, $author$project$Types$Closed)));
					},
					ss);
				return _List_fromArray(
					[
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								function ($) {
									return $.bf;
								},
								ss)),
						'scheduled'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(
							A2(
								$elm$core$List$filter,
								A2(
									$elm$core$Basics$composeL,
									$elm$core$Basics$not,
									function ($) {
										return $.bf;
									}),
								ss)),
						'unscheduled'),
						A2(
						$author$project$Stats$n,
						$elm$core$List$length(late),
						'late')
					]);
		}
	});
var $author$project$Stats$tab = F5(
	function (today, clock, view, beads, edges) {
		var k = $elm$core$String$fromInt;
		switch (view) {
			case 1:
				return k(
					$elm$core$List$length(beads));
			case 0:
				return k(
					A2(
						$author$project$Stats$count,
						function (b) {
							return !_Utils_eq(b.aH, $author$project$Types$Closed);
						},
						beads));
			case 2:
				return k(
					$elm$core$List$length(edges));
			case 3:
				return k(
					$elm$core$List$length(
						A2(
							$elm$core$List$filter,
							function ($) {
								return $.bf;
							},
							A2($author$project$Timeline$spans, clock, beads))));
			case 4:
				return k(
					$elm$core$List$length(
						A2(
							$elm$core$List$filter,
							function (g) {
								return !_Utils_eq(g.a4, $elm$core$Maybe$Nothing);
							},
							$author$project$Agile$epicGroups(beads))));
			case 5:
				return k(
					$elm$core$List$length(
						A2(
							$elm$core$List$filter,
							function (g) {
								return !_Utils_eq(g.a4, $elm$core$Maybe$Nothing);
							},
							$author$project$Agile$epicGroups(beads))));
			case 6:
				return A2(
					$elm$core$Maybe$withDefault,
					'0',
					A2(
						$elm$core$Maybe$map,
						A2(
							$elm$core$Basics$composeR,
							function ($) {
								return $.aA;
							},
							A2($elm$core$Basics$composeR, $elm$core$List$length, k)),
						$elm$core$List$head(
							A2($author$project$Agile$roadmapCols, today, beads))));
			case 7:
				return A2(
					$elm$core$Maybe$withDefault,
					'0',
					A2(
						$elm$core$Maybe$map,
						A2(
							$elm$core$Basics$composeR,
							function ($) {
								return $.aA;
							},
							A2($elm$core$Basics$composeR, $elm$core$List$length, k)),
						$elm$core$List$head(
							A2(
								$elm$core$List$drop,
								1,
								A2($author$project$Agile$iterationCols, today, beads)))));
			case 8:
				return k(
					$elm$core$List$sum(
						A2(
							$elm$core$List$map,
							function ($) {
								return $.bM;
							},
							A2($author$project$Agile$flow, today, beads).cJ)));
			case 10:
				return k(
					$author$project$Stats$outcomes(beads));
			default:
				return k(
					$elm$core$List$length(
						A2(
							$elm$core$List$concatMap,
							function (p) {
								return A2(
									$elm$core$List$concatMap,
									function (c) {
										return A3($author$project$Agile$matrixCell, p, c, beads);
									},
									_List_fromArray(
										[1, 2]));
							},
							_List_fromArray(
								[0, 1]))));
		}
	});
var $author$project$Keys$viewName = function (v) {
	switch (v) {
		case 0:
			return 'LIST';
		case 1:
			return 'KANBAN';
		case 2:
			return 'GRAPH';
		case 3:
			return 'WATERFALL';
		case 4:
			return 'EPICS';
		case 5:
			return 'STORY MAP';
		case 6:
			return 'ROADMAP';
		case 7:
			return 'ITERATIONS';
		case 8:
			return 'FLOW';
		case 9:
			return 'MATRIX';
		default:
			return 'METRICS';
	}
};
var $author$project$Main$viewTabs = function (model) {
	var beads = function () {
		var _v0 = model.aA;
		if (_v0.$ === 2) {
			var bs = _v0.a;
			return bs;
		} else {
			return _List_Nil;
		}
	}();
	var tab = function (v) {
		return _Utils_eq(v, model.c) ? A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tab current'),
					$elm$html$Html$Events$onClick(
					$author$project$Main$GoView(v))
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tabname')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Keys$viewName(v))
						])),
				A2(
					$elm$core$List$map,
					function (s) {
						return A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('stat')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(s)
								]));
					},
					A5(
						$author$project$Stats$summary,
						model.y,
						$author$project$Main$clockOf(model),
						v,
						beads,
						model.aC)))) : A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tab'),
					$elm$html$Html$Events$onClick(
					$author$project$Main$GoView(v))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tabname')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Keys$viewName(v))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tabcount')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A5(
								$author$project$Stats$tab,
								model.y,
								$author$project$Main$clockOf(model),
								v,
								beads,
								model.aC))
						]))
				]));
	};
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('tabs')
			]),
		A2($elm$core$List$map, tab, $author$project$Main$viewOrder));
};
var $author$project$Main$ThemeInput = function (a) {
	return {$: 32, a: a};
};
var $author$project$Main$ThemeCancel = {$: 35};
var $author$project$Main$ThemeConfirm = {$: 34};
var $author$project$Main$ThemeMove = function (a) {
	return {$: 33, a: a};
};
var $author$project$Main$themeKeys = A2(
	$elm$json$Json$Decode$andThen,
	function (_v0) {
		var k = _v0.a;
		var ctrl = _v0.b;
		var _v1 = _Utils_Tuple2(k, ctrl);
		_v1$6:
		while (true) {
			switch (_v1.a) {
				case 'Escape':
					return $elm$json$Json$Decode$succeed($author$project$Main$ThemeCancel);
				case 'Enter':
					return $elm$json$Json$Decode$succeed($author$project$Main$ThemeConfirm);
				case 'ArrowDown':
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$ThemeMove(1));
				case 'ArrowUp':
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$ThemeMove(-1));
				case 'n':
					if (_v1.b) {
						return $elm$json$Json$Decode$succeed(
							$author$project$Main$ThemeMove(1));
					} else {
						break _v1$6;
					}
				case 'p':
					if (_v1.b) {
						return $elm$json$Json$Decode$succeed(
							$author$project$Main$ThemeMove(-1));
					} else {
						break _v1$6;
					}
				default:
					break _v1$6;
			}
		}
		return $elm$json$Json$Decode$fail('typing');
	},
	A3(
		$elm$json$Json$Decode$map2,
		$elm$core$Tuple$pair,
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'ctrlKey', $elm$json$Json$Decode$bool)));
var $author$project$Main$viewThemePicker = function (model) {
	var _v0 = model.H;
	if (_v0.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var p = _v0.a;
		var row = F2(
			function (i, s) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('hit', true),
									_Utils_Tuple2(
									'current',
									_Utils_eq(i, p.N))
								]))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hitid')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(s.E)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hitfield')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(s.d3 + (' ' + s.ef))
								]))
						]));
			});
		var hits = A2($author$project$Theme$search, p.M, model.at);
		var rows = A2(
			$elm$core$List$filterMap,
			function (_v1) {
				var i = _v1.a;
				var idx = _v1.b;
				return A2(
					$elm$core$Maybe$map,
					row(i),
					$elm$core$List$head(
						A2($elm$core$List$drop, idx, model.at)));
			},
			A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, hits));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('finder')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('finderbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('findhead')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('findmode')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('THEME')
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('dim')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('live preview · Enter keep · Esc restore')
										]))
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('theme-picker'),
									$elm$html$Html$Attributes$value(p.M),
									$elm$html$Html$Attributes$placeholder('type to filter themes'),
									$elm$html$Html$Attributes$autocomplete(false),
									$elm$html$Html$Events$onInput($author$project$Main$ThemeInput),
									A2($elm$html$Html$Events$on, 'keydown', $author$project$Main$themeKeys)
								]),
							_List_Nil),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('hits')
								]),
							$elm$core$List$isEmpty(hits) ? _List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('dim hitnone')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('no theme matches')
										]))
								]) : rows),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('dim findfoot')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('↑ ↓ or Ctrl+p Ctrl+n preview · Enter keep · Esc restore')
								]))
						]))
				]));
	}
};
var $author$project$Main$view = function (model) {
	var themeCss = A2(
		$elm$core$Maybe$withDefault,
		'',
		A2(
			$elm$core$Maybe$map,
			$author$project$Theme$css,
			$elm$core$List$head(
				A2($elm$core$List$drop, model.ah, model.at))));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('root')
			]),
		_List_fromArray(
			[
				A3(
				$elm$html$Html$node,
				'style',
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(themeCss)
					])),
				$author$project$Main$viewBar(model),
				$author$project$Main$viewTabs(model),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('app')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sidebar')
							]),
						A2(
							$author$project$Main$loaded,
							model.U,
							$author$project$Main$viewRepos(model.d))),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('main'),
								$elm$html$Html$Attributes$id('main')
							]),
						$author$project$Main$viewMain(model)),
						$author$project$Main$viewDetail(model)
					])),
				$author$project$Main$viewFlash(model),
				$author$project$Main$viewPopup(model),
				$author$project$Main$viewFinder(model),
				$author$project$Main$viewThemePicker(model),
				$author$project$Main$viewAllKeys(model)
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{
		dr: function (_v0) {
			return _Utils_Tuple2(
				{ay: false, aA: $author$project$Main$Loading, i: $elm$core$Maybe$Nothing, d: $elm$core$Maybe$Nothing, r: $elm$core$Maybe$Nothing, A: $elm$core$Maybe$Nothing, aC: _List_Nil, s: $elm$core$Maybe$Nothing, h: $elm$core$Maybe$Nothing, aR: $elm$core$Maybe$Nothing, aS: $elm$core$Maybe$Nothing, ab: false, aX: $elm$core$Maybe$Nothing, F: 0, Z: 0, G: _List_Nil, H: $elm$core$Maybe$Nothing, U: $author$project$Main$Loading, x: $elm$core$Maybe$Nothing, as: _List_Nil, ah: 0, at: _List_Nil, y: 0, aj: $elm$core$Maybe$Nothing, c: 1, al: $author$project$Timeline$defaultZoom},
				$elm$core$Platform$Cmd$batch(
					_List_fromArray(
						[$author$project$Main$getRepos, $author$project$Main$getThemes, $author$project$Main$getClock])));
		},
		d2: function (model) {
			return $elm$core$Platform$Sub$batch(
				_Utils_ap(
					_List_fromArray(
						[
							$elm$browser$Browser$Events$onKeyDown($author$project$Main$keyDecoder),
							A2($elm$time$Time$every, 2000, $author$project$Main$Tick)
						]),
					(!_Utils_eq(model.A, $elm$core$Maybe$Nothing)) ? _List_fromArray(
						[
							$elm$browser$Browser$Events$onMouseMove(
							A2(
								$elm$json$Json$Decode$map,
								$author$project$Main$DragMove,
								A2($elm$json$Json$Decode$field, 'pageX', $elm$json$Json$Decode$float))),
							$elm$browser$Browser$Events$onMouseUp(
							$elm$json$Json$Decode$succeed($author$project$Main$DragEnd))
						]) : _List_Nil));
		},
		ec: $author$project$Main$update,
		c: $author$project$Main$view
	});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));