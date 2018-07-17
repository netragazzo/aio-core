const chai = require('chai');
const assert = chai.assert;

const Graph = require('./graph');

describe('graph', function(done) {
    let graph = new Graph('netragazzo', 'graph.test');

    it('should store an object and retrieve it', function(done) {
        graph.remember(
            {
                type: '#Person',
                name: 'Matthew Kropp',
                key: '4031760169',
                object: {email: 'matt@gmail.com', phone: '415-555-1234'}
            })
            .then(r => {
                graph.recall('#Person', '4031760169')
                    .then(result => {
                        assert.equal(result.email, 'matt@gmail.com');
                        done();
                    })
                    .catch(e => done(e));
            })
    });

    it('should create a relation and find related objects', function(done) {
        graph.remember(
            {
                type: '#Person',
                name: 'Karen Rosenquist',
                key: '4031760170',
                object: {email: 'karen@gmail.com', phone: '310-555-1234'},
                relation: {predicate: 'wifeOf', objectType: '#Person', objectKey: '4031760169'}
            })
            .then(r => {
                graph.findByRelation({predicate: 'wifeOf', objectType: '#Person', objectKey: '4031760169'})
                    .then(result => {
                        assert.equal(result[0].phone, '310-555-1234');
                        done();
                    })
                    .catch(e => done(e));
            })
            .catch(e => done(e));
    });
});