const level = require('level');
const levelgraph = require('levelgraph');

const dbPath = process.env.DB_PATH || 'db/graph';

class Graph {
    constructor() {
        this.db = levelgraph(level(dbPath));
    }

    remember(objectType, objectName, signature, object) {
        return new Promise((fulfill, reject) => {
            let subject = `${objectName}@${signature}`;
            let batch = [];
            batch.push({subject: subject, predicate: '#isType', object: objectType});

            Object.keys(object).map(key => {
                let triple = {subject: subject, predicate: key, object: object[key]};
                batch.push(triple);
            });

            this.db.put(batch, err => {
                if (err)
                    reject (err);
                else
                    fulfill();
            });
        });

    }

    relate(subjectKey, predicate, objectKey) {

    }

    recall(key) {
        return new Promise((fulfill, reject) => {
            let obj = {};
            this.db.get({subject: key}, (err, list) => {
                list.map(triple => {
                    obj[triple.predicate] = triple.object;
                });

                fulfill(obj);
            });
        });
    }
}

module.exports = Graph;