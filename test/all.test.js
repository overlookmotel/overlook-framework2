// --------------------
// overlook-framework2 module
// Tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	Overlook = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it */

describe('Tests', function() {
	it('Test', function() {
		expect(Overlook).to.be.ok;
	});
});
