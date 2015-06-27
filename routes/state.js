'use strict';

const fs = require('co-fs-plus');

const stateFilePath = __dirname + '/../tmp/state.json';

const State = module.exports = function State(defaultState) {
    this.getStateFile = function *() {
        try {
            var file = yield fs.readFile(stateFilePath, {
                encoding: 'utf8'
            });
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                // File does not exist
                return;
            } else
                throw err;
        }
        return file;
    };

    this.loadState = function *() {
        this.state = yield this._loadState();
    };

    this._loadState = function *() {
        // Make sure the directory exists
        yield fs.mkdirp(__dirname + '/../tmp/');

        let file = yield this.getStateFile();

        if (!file) {
            return {}
        } else {
            return JSON.parse(file);
        }
    };

    this.saveState = function *() {
        var data = JSON.stringify(this.state);
        yield fs.writeFile(stateFilePath, data);
    };

    this.get = function (key) {
        return this.state[key] || defaultState[key];
    };

    this.set = function *(key, value) {
        if (this.state[key] == value) {
            // No change
            return false;
        }
        this.state[key] = value;
        yield this.saveState();
        return true;
    }
};