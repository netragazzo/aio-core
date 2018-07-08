const express = require('express');
const fs = require('fs');
const path = require('path');

const VmRunner = require('./vmRunner');
const Timer = require('../instrumentation/timer');

class Endpoints {
    constructor() {
        this.router = express.Router();
    }

    _getValidParameters(parameters, req) {
        let funcParams = {};
        parameters.map(param => {
            let value;
            let val = req.params[param.name];

            if (param.required && !val)
                console.log(`Required param ${param.name} null`);

            if (param.type === 'integer')
                value = parseInt(val);
            else if (param.type === 'float')
                value = parseFloat(val);
            else if (param.type === 'boolean')
                value = val == 'true';
            else
                value = val;

            funcParams[param.name] = value;
        });

        return funcParams;
    }

    _vmRun (appPath, method, funcParams, res, timer) {
        let vm = new VmRunner(appPath, timer);
        vm.run(method, funcParams)
            .then(result => {
                res.json(result);
            })
            .catch(e => {
                res.status(500).send(e);
            });
    }

    addApp(username, app, version, appPath) {
        let specPath = path.join(appPath, 'aio.json');
        let methodSpecs = JSON.parse(fs.readFileSync(specPath));

        Object.keys(methodSpecs).map(method => {
            let spec = methodSpecs[method];
            let endpointPath = "/" + path.join(username, app, version.toString(), spec.path);

            let lowerMethod = spec.method.toLowerCase();
            if (!['get', 'post', 'put', 'delete'].includes(lowerMethod))
                console.log('Illegal REST method verb: ' + spec.method);
            else {
                this.router[lowerMethod](endpointPath, (req, res) => {
                    let timer = new Timer();
                    let funcParams = this._getValidParameters(spec.parameters, req);
                    this._vmRun(appPath, method, funcParams, res, timer);
                });

                console.log(`Added route for ${endpointPath}`);
            }
        })
    }
}

let endpoints = new Endpoints();  // Singleton pattern

module.exports = endpoints;