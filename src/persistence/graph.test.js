const chai = require('chai');
const assert = chai.assert;

const Graph = require('./graph');

describe('graph', function(done) {
    it('should store an object and retrieve it', function(done) {
        let graph = new Graph();
        graph.remember('#Person', 'Matthew Kropp', '4031760169', {email: 'matt@gmail.com', phone: '415-555-1234'})
            .then(r => {
                graph.recall('Matthew Kropp@4031760169')
                    .then(result => {
                        assert.equal(result.email, 'matt@gmail.com');
                        done();
                    })
            })

    })
})