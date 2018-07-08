const { NodeVM } = require('vm2');
const path = require('path');

class VmRunner {
    constructor(appPath) {
        this.appPath = appPath;

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
            let vmMethod = this.vm.run(`
            module.exports = function(method, params) { 
                const index = require('./index.js');
                const m = index[method];
                return m(params); 
            }`, basePath);

            let result = vmMethod(method, params);
            Promise.resolve(result)
                .then(value => {
                    fulfill(value);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

module.exports = VmRunner;