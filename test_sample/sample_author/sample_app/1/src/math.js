const moment = require('moment');

function add ({a, b, c}) {
    return a + b + c;
}

function subtract ({a, b}) {
    return b - a;
}

function interval ({a, b}) {
    return new Promise((fulfill, reject) => {
        fulfill(moment(a).from(moment(b)));
    })
}

function count({n}) {
    let out = 0;
    for (let i = 0; i < n; i++) {
        out += Math.random();
    }
    throw new Error('Sample Error');
    return out;
}

module.exports = { add, interval, subtract, count };

