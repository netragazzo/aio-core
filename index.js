const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');

const { Deploy, endpoints } = require('./src/deployment');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/deploy/:username/:appname', (req, res) => {
    let username = req.params.username;
    let appname = req.params.appname;

    let deploy = new Deploy(username, appname);
    deploy.commit(req)
        .then(({appPath, currentVersion}) => {
            deploy.test()
                .then(r => {
                    endpoints.addApp(username, appname, currentVersion, appPath);
                    app.use('/api', endpoints.router);
                    res.status(200).send('Success');
                });
        })
        .catch(e => {
            res.status(500).send(e);
        });
});

process.on('uncaughtException', (e) => {
    console.error('Asynchronous error caught', e);
})

app.listen(1111, () => console.log('Listening on port 1111'));
