/*jslint node: true, maxlen: 80 */

'use strict';

module.exports = function (dataToOutput, code) {
    if (code === undefined) {
        code = 1;
    }
    console.error(dataToOutput);
    process.exit(code);
};
