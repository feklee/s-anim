// TODO: remove this file, together with dependencies

/*jslint node: true, maxlen: 80 */

'use strict';

var spline = require('cubic-spline'),
    xs = [1, 2, 3, 4, 5],
    ys = [9, 3, 6, 2, 4],
    i;

// get Y at arbitrary X
console.log(spline(1.4, xs, ys));

// interpolate a line at a higher resolution
//for (i = 0; i < 50; i += 1) {
//    console.log(spline(i * 0.1, xs, ys));
//}
