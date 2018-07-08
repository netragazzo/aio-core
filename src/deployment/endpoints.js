const express = require('express');
const fs = require('fs');
const path = require('path');

const VmRunner = require('./vmRunner');

class Endpoints {
    constructor() {
        this.router = express.Router();
    }

    addApp(username, app, appPath) {
        let specPath = path.join(appPath, 'aio.json');
        let methodSpecs = JSON.parse(fs.readFileSync(specPath));

        Object.keys(methodSpecs).map(method => {
            let spec = methodSpecs[method];
            let endpointPath = "/" + path.join(username, app, spec.path);

            this.router.get(endpointPath, (req, res) => {
                let funcParams = {};

                spec.parameters.map(param => {
                    let value;
                    let val = req.params[param.name];

                    if (param.required && !val)
                        console.log(`Required param ${param.name} null`);

                    if (param.type === 'integer')
                        value = parseInt(val);
                    else if (param.type === 'float')
                        value = parseFloat(val);
                    else
                        value = val;

                    funcParams[param.name] = value;
                });

                let vm = new VmRunner(appPath);
                vm.run(method, funcParams)
                    .then(result => {
                        res.json(result);
                    })
                    .catch(e => {
                        res.status(500).send(e);
                    });
            });

            console.log(`Added route for ${endpointPath}`);
        })
    }
}

let endpoints = new Endpoints();  // Singleton pattern

module.exports = endpoints;