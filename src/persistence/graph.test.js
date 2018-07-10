const chai = require('chai');
const assert = chai.assert;

const Graph = require('./graph');

describe('graph', function(done) {
    let graph = new Graph();

    it('should store an object and retrieve it', function(done) {
        graph.remember('#Person', 'Matthew Kropp', '4031760169', {email: 'matt@gmail.com', phone: '415-555-1234'})
            .then(r => {
                graph.recall('Matthew Kropp@4031760169')
                    .then(result => {
                        assert.equal(result.email, 'matt@gmail.com');
                        done();
                    })
            })
    });

    it('should create a relation and find related objects', function(done) {
        graph.remember('#Person', 'Karen Rosenquist', '4031760170', {email: 'karen@gmail.com', phone: '310-555-1234'},
            {predicate: 'wifeOf', object: 'Matthew Kropp@4031760169'})
            .then(r => {
                graph.findByRelation({predicate: 'wifeOf', object: 'Matthew Kropp@4031760169'})
                    .then(result => {
                        assert.equal(result[0].subject, 'Karen Rosenquist@4031760170');
                        done();
                    })
            })
    });
});