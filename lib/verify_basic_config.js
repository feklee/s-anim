// Verifies basic configuration.

/*jslint node: true, maxlen: 80 */

'use strict';

var verifyPresenceOfSettings, verifyBasicSettings, verifyDirExists,
    exitWithOutput = require('./exit_with_output.js'),
    fs = require('fs');

verifyPresenceOfSettings = function (expected, actual, prefix) {
    Object.keys(expected).forEach(function (name) {
        var path = (prefix === undefined ? '' : prefix + '.') + name;

        if (actual[name] === undefined) {
            exitWithOutput('Missing configuration setting: ' + path);
        }

        if (expected[name] !== null) { // go deeper
            verifyPresenceOfSettings(expected[name], actual[name],
                                     path);
        }
    });
};

// Verifies that basic configuration settings are present. Checks for more
// complex settings may be done elsewhere. On error, exits program with error
// message.
verifyBasicSettings = function (config) {
    var expected = {
        input: {
            width: null,
            height: null,
            path: null
        },
        output: {
            width: null,
            height: null,
            path: null
        },
        interpolation: null,
        keyFrames: null
    };

    verifyPresenceOfSettings(expected, config);
};

module.exports = function (config) {
    verifyBasicSettings(config);
};
