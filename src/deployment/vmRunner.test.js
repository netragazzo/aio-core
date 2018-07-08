const chai = require('chai');
const assert = chai.assert;

const { VmRunner } = require('./index');

describe('VmRunner', function (done) {
    it('should execute the sample_author/sample_app add function in the VM', function(done) {
        let vmRunner = new VmRunner('/store/sample_author/sample_app/1');
        vmRunner.run('add', {a: 1, b: 2})
            .then(result => {
                assert.equal(result, 3);
                done();
            })
    });

    it('should execute the sample_author/sample_app interval function in the VM', function(done) {
        let vmRunner = new VmRunner('/store/sample_author/sample_app/1');
        vmRunner.run('interval', {a: '2018-01-01', b: '2018-01-02'})
            .then(result => {
                assert.equal(result, 'a day ago');
                done();
            })
    });
});