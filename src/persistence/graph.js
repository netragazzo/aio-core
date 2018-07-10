const level = require('level');
const levelgraph = require('levelgraph');

const dbPath = process.env.DB_PATH || 'db/graph';

class Graph {
    constructor() {
        this.db = levelgraph(level(dbPath));
    }

    remember(objectType, objectName, signature, object, relation) {
        return new Promise((fulfill, reject) => {
            let subject = `${objectName}@${signature}`;
            let batch = [];
            batch.push({subject: subject, predicate: '#isType', object: objectType});

            Object.keys(object).map(key => {
                let triple = {subject: subject, predicate: key, object: object[key]};
                batch.push(triple);
            });

            if (relation && relation.predicate && relation.object) {
                let relationTriple = { subject: subject, predicate: relation.predicate, object: relation.object };
                batch.push(relationTriple);
            }

            this.db.put(batch, err => {
                if (err)
                    reject (err);
                else
                    fulfill();
            });
        });

    }

    relate(subjectKey, predicate, objectKey) {
        return  new Promise((fulfill, reject) => {
            let triple = {subject: subjectKey, predicate: predicate, object: objectKey};
            this.db.put(triple, err => {
                if (err)
                    reject(err);
                else
                    fulfill();
            });
        });
    }

    findByRelation({subject, predicate, object}) {
        return new Promise((fulfill, reject) => {
            if (((subject ? 1 : 0) + (predicate ? 1 : 0) + (object ? 1 : 0)) < 2)
                reject(new Error('FindByRelation requires at least 2 of subject, predicate, object'));

            let triple = {};
            if (subject) triple.subject = subject;
            if (predicate) triple.predicate = predicate;
            if (object) triple.object = object;

            this.db.get(triple, function process(err, list) {
                if (err) reject(err);

                fulfill(list);
            });
        });
    }

    recall(key) {
        return new Promise((fulfill, reject) => {
            let obj = {};
            this.db.get({subject: key}, (err, list) => {
                if (err) reject(err);

                list.map(triple => {
                    obj[triple.predicate] = triple.object;
                });

                fulfill(obj);
            });
        });
    }
}

module.exports = Graph;