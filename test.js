var calc = require('./calc');

//------------------------------------
var print = function(tree,tab) {

	tab = tab||0;
	
	for (var i=0;i<tree.length;i++) {

		if (tree[i] instanceof Array) {
			print(tree[i],tab+1);
		} else {
			for(var s='';s.length<tab;) {
				s+='\t';
			}
			console.log(s + tree[i]);
		}

	}

}

//------------------------------------

var test = function(str) {
	var tree;
	var value;
	var evald;

	var passed = false;

	try {

		console.log('-------------------');
		console.log(str);

		tree = calc.parse(str);
		value = calc.solve(tree);
		evald = eval(str);
		passed = value === evald;

		console.log((passed?'PASS :: ':'FAIL :: ') + value + (passed?' == ':' != ') + evald);
		
		if(!passed) {
			print(tree);
			console.log(JSON.stringify(tree));
		}

	} catch(ex) {
		console.error(ex);
	}

}

//------------------------------------

var fuzz = function() {

	var rand = function(min,max) {return Math.floor(Math.random()*(max-min))+min;};

	var chars = "0123456789.-+*/()".split('');
	var chlen = chars.length-1;
	var passed = 0;
	var failed = 0;
	var skipped = 0

	var tree;
	var str;
	var len;

	for(var i=0;i<10000;i++) {

		//if (i%1000===0) process.stdout.write('.');

		str = "";
		len=rand(3,20);

		for(var c=0;c<len;c++) str += chars[rand(0,chlen)];

		try {
			tree = calc.parse(str);
			value = calc.solve(tree);
			evald = eval('"use strict";' + str);  //"use strict" to ignore octal constants with leading 0's
			if(value===evald) {
				//Parsed and solved value same as Javascript, hooray!
				passed++;
			} else if (!isNaN(evald) && str.indexOf('//')<0) {
				//Only test numbers and fuzzed equations without comments
				failed++;
				console.log(str,'\t\t|',value,'\t|',evald);
			} else {
				//Skip NaN's and randomly commented stuff
				skipped++;
			}
		} catch(ex) {
			//Known errors thrown in either parse or eval
			skipped++;
		}
		

	}

	console.log("===========================================")
	console.log("Passed:",passed,"Failed:",failed,"Skipped:",skipped);

};

fuzz();