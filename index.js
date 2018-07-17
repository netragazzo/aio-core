const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { Deploy, endpoints } = require('./src/deployment');
const Graph = require('./src/persistence/graph');
const graphDb = new Graph();

app.use(bodyParser.json());

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

app.post('/persistence/remember', (req, res) => {
    let {objectType, objectName, signature, object, relation} = req.body;
    graphDb.remember(objectType, objectName, signature, object, relation)
        .then(r => {
            res.status(200).send();
        })
        .catch(e => res.status(500).send(e));
});

app.post('/persistence/recall', (req, res) => {
    let {key} = req.body;
    graphDb.recall(key)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(e => res.status(500).send(e));
});

app.post('/persistence/relate', (req, res) => {

});

app.post('/persistence/findByRelation', (req, res) => {
    let {subject, predicate, object} = req.body;
    graphDb.findByRelation({subject, predicate, object})
        .then(result => {
            res.status(200).json(result);
        })
        .catch(e => res.status(500).send(e));
});


process.on('uncaughtException', (e) => {
    console.error('Asynchronous error caught', e);
});

app.listen(1111, () => console.log('Listening on port 1111'));
