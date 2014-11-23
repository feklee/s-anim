#!/usr/bin/env node

/*jslint node: true, maxlen: 80 */

'use strict';

var fs = require('fs'),
    execFile = require('child_process').execFile,
    path = require('path'),
    sizeOf = require('image-size'),
    verifyBasicConfig = require('./lib/verify_basic_config.js'),
    configFileName = 'config.json',
    config,
    remapImages,
    remapImage,
    ptoFilename = 'remap.pto',
    createPtoFile,
    exitWithOutput = require('./lib/exit_with_output.js'),
    numberOfFiles,
    createFrame,
    createFrames,
    createOutputFilename,
    appendKeyValue,
    createKeyPointsSet,
    appendKeyPoints,
    verifyKeyPointsSet,
    createInterpolators,
    optimizedAngle,
    optimizeKeyPoints,
    optimizeKeyPointsSet,
    loadInterpolator,
    verifyBasicConfiguration,
    verifyPresenceOfSettings;

createPtoFile = function (frame, onSuccess) {
    var size = sizeOf(path.join(config.input.path, frame.filename)),
        s = [
            [
                'p',
                'f4', // = equirectangular input projection format
                'w' + config.output.width,
                'h' + config.output.height,
                'v' + frame.fov,
                'R0', 'nJPEG'
            ].join(' '),
            [
                'i',
                'f4', // = stereographic output projection format
                'w' + size.width,
                'h' + size.height,
                'v360',
                'r' + frame.roll,
                'p' + frame.pitch,
                'y' + frame.yaw,
                'n"dummy.jpg"'
            ].join(' ')
        ].join('\n');

    fs.writeFile(ptoFilename, s, function (err) {
        if (err) {
            exitWithOutput(err, 1);
        }
        onSuccess();
    });
};

createOutputFilename = function (index) {
    var length = String(numberOfFiles - 1).length,
        s = new Array(length + 1).join('0');

    return String(s + index).slice(-length);
};

remapImage = function (index, frame, onSuccess) {
    var outputFilename = createOutputFilename(index);

    execFile('nona', [
        '-o',
        path.join(config.output.path, outputFilename),
        ptoFilename,
        path.join(config.input.path, frame.filename)
    ], function (err) {
        if (err) {
            exitWithOutput("Running nona failed. Output path writable?", 1);
        }
        onSuccess();
    });
};

remapImages = function (frames, index) {
    var frame;

    if (index === frames.length) {
        if (numberOfFiles > 0) {
            process.stdout.write('\n');
        }
        return;
    }

    if (index === undefined) {
        index = 0;
    }

    process.stdout.write('.');

    frame = frames[index];
    createPtoFile(frame, function () {
        remapImage(index, frame, function () {
            remapImages(frames, index + 1);
        });
    });
};

appendKeyPoints = function (keyPointsSet, index, keyFrame) {
    ['fov', 'roll', 'pitch', 'yaw'].forEach(function (param) {
        if (keyFrame[param] !== undefined) {
            keyPointsSet[param].push([index, keyFrame[param]]);
        }
    });
};

verifyKeyPointsSet = function (keyPointsSet) {
    ['fov', 'roll', 'pitch', 'yaw'].forEach(function (param) {
        if (keyPointsSet[param].length === 0) {
            exitWithOutput('No key frame with ' + param);
        }
    });
};

optimizedAngle = function (angle, lastAngle) {
    if (angle - lastAngle > 0) {
        while (Math.abs(angle - lastAngle) > 180) {
            angle -= 360;
        }
    } else {
        while (Math.abs(angle - lastAngle) > 180) {
            angle += 360;
        }
    }

    return angle;
};

// By adding or subtracting multiples of 360°, make sure that the distance
// between key angles is less than 180°. Otherwise there will be too much
// movement.
optimizeKeyPoints = function (keyPoints) {
    var lastKeyPoint;

    keyPoints.forEach(function (keyPoint) {
        if (lastKeyPoint !== undefined) {
            keyPoint[1] = optimizedAngle(keyPoint[1], lastKeyPoint[1]);
        }
        lastKeyPoint = keyPoint;
    });
};

optimizeKeyPointsSet = function (keyPointsSet) {
    ['roll', 'pitch', 'yaw'].forEach(function (angleName) {
        optimizeKeyPoints(keyPointsSet[angleName]);
    });
};

// Creates a set of keypoints, describing key points of different properties.
// Interpolation may be used to get values in between points.
createKeyPointsSet = function (filenames) {
    var keyFrame, filename,
        keyFrames = config.keyFrames, i,
        keyPointsSet = {
            fov: [],
            roll: [],
            pitch: [],
            yaw: []
        };

    for (i = 0; i < filenames.length; i += 1) {
        filename = filenames[i];
        keyFrame = keyFrames[filename];

        if (keyFrame !== undefined) {
            appendKeyPoints(keyPointsSet, i, keyFrame);
        }
    }

    verifyKeyPointsSet(keyPointsSet);
    optimizeKeyPointsSet(keyPointsSet);

    return keyPointsSet;
};

createFrame = function (filename, interpolators, index) {
    return {
        filename: filename,
        fov: interpolators.fov(index),
        roll: interpolators.roll(index),
        pitch: interpolators.pitch(index),
        yaw: interpolators.yaw(index)
    };
};

loadInterpolator = function () {
    switch (config.interpolation) {
    case 'linear':
        return require('linear-interpolator');
    case 'natural-spline':
        return require('natural-spline-interpolator');
    case 'polynomial':
        return require('interpolating-polynomial');
    default:
        exitWithOutput('Unknown interpolation method');
    }
};

createInterpolators = function (filenames) {
    var keyPointsSet = createKeyPointsSet(filenames),
        interpolator = loadInterpolator();

    return {
        fov: interpolator(keyPointsSet.fov),
        roll: interpolator(keyPointsSet.roll),
        pitch: interpolator(keyPointsSet.pitch),
        yaw: interpolator(keyPointsSet.yaw)
    };
};

createFrames = function (filenames) {
    var i, interpolators = createInterpolators(filenames), frames = [];

    for (i = 0; i < filenames.length; i += 1) {
        frames.push(createFrame(filenames[i], interpolators, i));
    }

    return frames;
};

try {
    config = require(path.join(process.cwd(), configFileName));
} catch (e) {
    exitWithOutput('Configuration file missing: ' + configFileName);
}

verifyBasicConfig(config);

fs.readdir(config.input.path, function (err, filenames) {
    if (err) {
        exitWithOutput('Could not access input path', err.errno);
    }
    filenames = filenames.sort();
    numberOfFiles = filenames.length;

    remapImages(createFrames(filenames));
});
