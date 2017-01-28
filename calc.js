"use strict";

var calc = module.exports = {};

var isWhite = function(c) {
	switch (c) {
		case ' ' : return true; break;
		case '\t': return true; break;
		case '\n': return true; break;
	}
	return false;
}

var isDigit = function(c) {
	switch (c) {
		case '0': return true; break;
		case '1': return true; break;
		case '2': return true; break;
		case '3': return true; break;
		case '4': return true; break;
		case '5': return true; break;
		case '6': return true; break;
		case '7': return true; break;
		case '8': return true; break;
		case '9': return true; break;
		case '.': return true; break;
	}
	return false;		
}

var isSign = function(c) {
	switch (c) {
		case '+': return true; break;
		case '-': return true; break;
	}
	return false;		
}			

var isOperator = function(c) {
	switch (c) {
		case '+': return true; break;
		case '-': return true; break;
		case '*': return true; break;
		case '/': return true; break;
	}
	return false;		
}

var getOperand = function(c) {
	switch (c) {
		case '+': return 'ADD'; break;
		case '-': return 'SUB'; break;
		case '*': return 'MUL'; break;
		case '/': return 'DIV'; break;
	}
	return '';
}

var isPriority = function(c) {
	switch (c) {
		case 'MUL': return true; break;
		case 'DIV': return true; break;
	}
	return false;
}

var isOpen = function(c) {
	switch (c) {
		case '(': return true; break;
	}
	return false;		
}	

var isClose = function(c) {
	switch (c) {
		case ')': return true; break;
	}
	return false;		
}

calc.lex = function(str) {

	var states = {'OP':'OP','DIG':'DIG'};

	var tokens = [];

	var i = -1;
	var l = str.length;

	var c = '';
	var p = '';
	var n = '';
	var o = '';
	var f = false;
	var s = null;

	var queue = function(val,type) { tokens.push({value:val,type:type}); };

	var next = function() { return (++i<l) ? str[i] : null; }

	var char = function(c) { 

		if ( isDigit(c) ) {

			if (c === '.') {

				f = true;

				if (s !== states.DIG) {
					n += '0';
				}

			}

			n+=c;

			s = states.DIG;

		} else {

			if ( s === states.DIG && n !== '') {

				if (p==='.') {

					f = true;

					n+='0';

				}

				queue(f?parseFloat(n):parseInt(n),'NUM');

				n = '';

				f = false;
				
			}

			if ( isOperator(c) ) {

				if (s === states.OP) {

					if ( c==='-' ) {

						s = states.DIG;
						n+='-';

					} 

				} else if (!tokens.length) {

					if (isSign(c)) {

						if ( c==='-' ) {

							s = states.DIG;
							n+='-';

						}

					} 

				} else {

					s = states.OP;

					queue(getOperand(c),'OP');

				}

			} else if ( isOpen(c) ) {

				queue('OPEN','GROUP');

			} else if ( isClose(c) ) {

				queue('CLOSE','GROUP');

			} else if ( c!==null ) {

				throw new Error("Invalid character!");

			}

		} 

		p = c;

	}

	while(c=next()) {

		while(isWhite(c)) c=next();

		char(c);

	}

	char(c);

	return tokens;

}

calc.parse = function(str) {

	var states = {'NEW':'NEW','EXP':'EXP','ORD':'ORD','PRI':'PRI','END':'END'};

	var tokens = calc.lex(str);

	var stack = [];

	var tree = [[]];

	var g = 0;

	var n = tree[0];
	var t = '';
	var i = -1;
	var l = tokens.length;
	var s = states.NEW;
	var p;
	var p2;
	var p3;

	var next = function() { return (++i<l) ? tokens[i]   : null; }

	var peek = function(n) { n=n||1; return (i+n<l) ? tokens[i+n] : null; }

	var push = function() { g++; stack.push(n); n.push([]); n = n[n.length-1]; };

	var pop = function() { g--; n = stack.pop(); };

	while(s!==states.END) {

		t = next();

		//console.log(s,t);

		if(!t) {

			s = states.END;

		} else {

			if (t.type === 'OP') {

				if (!n.length && s===states.NEW) {

					throw new Error("non sign operator first in group");

				} else if (s===states.ORD) {

					s = states.PRI;

				} else if (s===states.PRI) {

					n = stack.pop();

					s = states.EXP;

				} else {

					s = states.EXP;

				}
				
				n.push(t.value);

			} else if (t.type === 'NUM') {

				p = peek();

				if (p && p.type === 'OP' && isPriority(p.value) && s!==states.ORD) {

					push();

					s = states.ORD;

				}

				n.push(t.value);

			} else if (t.type === 'GROUP') {

				if (t.value === 'OPEN') {

					p = peek();
					p2 = peek(2);
					p3 = peek(3);

					if (p && p.type === 'NUM' && p2.value === 'CLOSE') {

						if (p3 && p3.type === 'OP' && isPriority(p3.value) && s!==states.ORD) {

							push();

							s = states.ORD;

						}
					
						t = next();

						n.push(t.value);

						t = next();

					} else {

						push();

					}

				} else if (t.value === 'CLOSE') {

					if (g===0) {

						throw new Error("group isn't open");

					} else {

						pop();

						s = states.EXP;

					}

				}

			}

		}

	}

	return tree;

}

calc.solve = function(tree) {

	var x = 0;
	var o = '';

	for(var i=0;i<tree.length;i++) {
		var v=null;
		
		if (tree[i] instanceof Array) {
			v = calc.solve(tree[i]);
		} else if (!isNaN(tree[i])) {
			v = tree[i]
		}

		if (v!==null) {

			switch (o) {
				case '': x = v; break;
				case 'ADD': x = x + v; break;
				case 'SUB': x = x - v; break;
				case 'MUL': x = x * v; break;
				case 'DIV': x = x / v; break;
			}

		} else {

			o = tree[i];

		}

	}

	return x;

}

