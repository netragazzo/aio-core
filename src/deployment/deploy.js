const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const Mocha = require('mocha');

class Deploy {
    constructor(username, app) {
        this.username = username;
        this.app = app;
        this.appPath = '';
        this.testSuccess = false;
    }

    commit(stream) {
        return new Promise((fulfill, reject) => {
            this._ensureDirectory(`store/${this.username}`);
            this._ensureDirectory(`store/${this.username}/${this.app}`);

            let versions;
            let rootDir = path.resolve(`store/${this.username}/${this.app}`);
            this.appPath = this._getNextDirectoryName(rootDir);

            stream.pipe(tar.extract(this.appPath));

            stream.on('drain', function () {
                console.log('drain', new Date());
                stream.resume();
            });

            stream.on('end', () => {
                console.log('done');
                fulfill(this.appPath);
            });
        });
    }

    test() {
        return new Promise((fulfill, reject) => {
            let mocha = new Mocha();
            let testDir = path.resolve(this.appPath, 'test');
            // Add each .js file to the mocha instance
            fs.readdirSync(testDir).filter(function (file) {
                // Only keep the .js files
                return file.substr(-3) === '.js';

            }).forEach(function (file) {
                mocha.addFile(
                    path.join(testDir, file)
                );
            });

            mocha.run((failures) => {
                this.testSuccess = failures === 0;
                fulfill(this.testSuccess);
            });
        });
    }

    deploy() {
        if (!this.testSuccess)
            Promise.reject(new Error('Unit tests failed'));

        return new Promise((fulfill, reject) => {

        })
    }

    /**
     *
     * @param target
     * @private
     */
    _ensureDirectory(target) {
        let dir = path.resolve(target);
        try {
            let ls = fs.readdirSync(dir);
        }
        catch (e) {
            fs.mkdirSync(dir);
        }
    }

    /**
     *
     * @param target
     * @returns {string}
     * @private
     */
    _getNextDirectoryName(target) {
        let lastVersion = 0;
        fs.readdirSync(target).map(dir => {
            let intdir = parseInt(dir);
            if (intdir && intdir > lastVersion)
                lastVersion = intdir;
        });

        return `${target}/${++lastVersion}`;
    }

}

module.exports = Deploy;