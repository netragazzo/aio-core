const { NodeVM, VMScript } = require('vm2');
const path = require('path');

class VmRunner {
    constructor(appPath, timer) {
        this.appPath = appPath;
        this.timer = timer;

        this.vm = new NodeVM({
            console: 'inherit',
            sandbox: {},
            require: {
                external: true,
                builtin: ['*'],
                root: "./"
            }
        });
    }

    run(method, params) {
        return new Promise((fulfill, reject) => {
            let basePath = path.join(this.appPath, 'index.js');

            let vmScript = new VMScript(`
            module.exports = function(method, params) { 
                const index = require('./index.js');
                const m = index[method];
                return m(params); 
            }`);

            let vmMethod = this.vm.run(vmScript, basePath);

            this.timer.vmStarted();

            let result = vmMethod(method, params);
            Promise.resolve(result)
                .then(value => {
                    this.timer.functionReturned();
                    fulfill(value);
                })
                .catch(e => {
                    this.timer.functionReturned();
                    reject(e);
                });
        });
    }
}

module.exports = VmRunner;