const chai = require('chai');
const assert = chai.assert;
const path = require('path');

const { VmRunner } = require('./index');
const Timer = require('../instrumentation/timer');

describe('VmRunner', function (done) {
    let appPath = path.join(process.env.PWD, '/test_sample/sample_author/sample_app/1');
    console.log(`Path: ${appPath}`)

    it('should execute the sample_author/sample_app add function in the VM', function(done) {
        let vmRunner = new VmRunner(appPath, new Timer());
        vmRunner.run('add', {a: 1, b: 2, c: 3})
            .then(result => {
                assert.equal(result, 6);
                done();
            })
    });

    it('should execute the sample_author/sample_app interval function in the VM', function(done) {
        let vmRunner = new VmRunner(appPath, new Timer());
        vmRunner.run('interval', {a: '2018-01-01', b: '2018-01-02'})
            .then(result => {
                assert.equal(result, 'a day ago');
                done();
            })
    });
});