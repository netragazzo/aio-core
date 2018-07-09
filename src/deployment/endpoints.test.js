const chai = require('chai');
const assert = chai.assert;
const path = require('path');
const express = require('express');
const request = require('supertest');

const endpoints = require('./endpoints');

describe('endpoints', function(done) {
    before(function() {
        endpoints.router = express.Router(); // Flush the router for this test
    });

    it('should add an endpoint and verify that it is in the router', function(done) {
        let appPath = path.join(process.env.PWD, '/test_sample/sample_author/sample_app/1');

        endpoints.addApp('sample_author', 'sample_app', 1, appPath);
        assert.equal(endpoints.router.length, 3);
        done();
    });

    it('should hit the endpoint created and get a response', function(done) {
        const app = express();
        app.use('/api', endpoints.router);
        request(app)
            .get('/api/sample_author/sample_app/1/add/1/2/3')
            .expect(200, '6',  done);
    });
});