const level = require('level');
const levelgraph = require('levelgraph');
const Promise = require('bluebird');
const SHA3 = require('sha3');

const dbPath = process.env.DB_PATH || 'db/graph';

class Graph {
    constructor(author, app) {
        this.db = Promise.promisifyAll(levelgraph(level(dbPath)));

        if (!author || author.length === 0 || !app || app.length ===0)
            throw new Error('Missing parameters for constructor: author or app');

        this.author = author;
        this.app = app;
    }

    __getHashedKey (type, key) {
        let hash = new SHA3.SHA3Hash(224);
        hash.update(`${this.author}|${this.app}|${type}|${key}`);
        return hash.digest('hex');
    }

    remember({type, key, name, object, relation}) {
        if (!type || !key || (!object && !relation)) {
            let missing = ((!type) ? 'type ' : '') +
                ((!key) ? 'key ' : '') + ((!object && !relation) ? '[object or relation]' : '');
            return Promise.reject(new Error('Remember method missing required parameters: ' + missing));
        }

        let hashedKey = this.__getHashedKey(type, key);

        let batch = [];
        batch.push({subject: hashedKey, predicate: '_t', object: type});
        if (name) batch.push({subject: hashedKey, predicate: '_n', object: name});

        Object.keys(object).map(property => {
            let triple = {subject: hashedKey, predicate: property, object: object[property]};
            batch.push(triple);
        });

        if (relation && relation.predicate && relation.objectType && relation.objectKey) {
            let hashedObjectKey = this.__getHashedKey(relation.objectType, relation.objectKey);
            let relationTriple = {subject: hashedKey, predicate: relation.predicate, object: hashedObjectKey};
            batch.push(relationTriple);
        }

        return this.db.putAsync(batch);
    }

    relate(subjectType, subjectKey, relation, objectType, objectKey) {
        // TODO - validation
        let hashedSubjectKey = this.__getHashedKey(subjectType, subjectKey);
        let hashedObjectKey = this.__getHashedKey(objectType, objectKey);
        let triple = {subject: hashedSubjectKey, predicate: relation, object: hashedObjectKey};
        return this.db.putAsync(triple);
    }

    findByRelation({subjectType, subjectKey, predicate, objectType, objectKey}) {
            if (!((subjectType && subjectKey) || (objectType && objectKey)) || !predicate)
                return Promise.reject(new Error('FindByRelation requires either subject or object and predicate'));

            let triple = {};
            if (subjectType && subjectKey) triple.subject = this.__getHashedKey(subjectType, subjectKey);
            triple.predicate = predicate;
            if (objectType && objectKey) triple.object = this.__getHashedKey(objectType, objectKey);

            return this.db.getAsync(triple)
                .then(relationTriples => {
                    let relatedObjects = [];

                    let promises = [];
                    relationTriples.map(relationTriple => {
                        let relationKey = (objectType && objectKey) ? relationTriple.subject : relationTriple.object;
                        promises.push(this.db.getAsync({subject: relationKey}));
                    });

                    return Promise.all(promises)
                        .then(results => {
                            results.map(result => {
                                let relatedObject = {};
                                result.map(triple => {
                                    let prop = triple.predicate;
                                    let obj = triple.object;
                                    relatedObject[prop] = obj;
                                });
                                relatedObjects.push(relatedObject);
                            });

                            return Promise.resolve(relatedObjects);
                        })
                        .catch(e => Promise.reject(e));
                });
    }

    recall(type, key) {
        let hashedKey = this.__getHashedKey(type, key);
        let obj = {};
        return this.db.getAsync({subject: hashedKey})
            .then(list => {
                list.map(triple => {
                    obj[triple.predicate] = triple.object;
                });
                return Promise.resolve(obj);
            })
            .catch(e => {
                return Promise.reject(e);
            });
    }
}

module.exports = Graph;