Introduction
============

*s-anim* is short for *stereographic animator*. It remaps a set of
equirectangular images to a set of images in stereographic projection, also
known as little planet projection. For remapping, keyframes can be specified,
to create something akin to a camera path.


Installation
============

 1. Install using the [npm][5] package manager for *Node.js:*

        npm install -g s-anim

 2. Install *Hugin 2013* or compatible, and make sure that the included command
    line tool `nona` is in the executable path.


Usage by example
================

See the example directory:

  * `input.jpg`: Photo made with the 2013 version of the Ricoh Theta

  * `config.json`: Example configuration for animation

  * `video.mp4`: Video made from output frames

Steps:

 1. Multiply the example image to match the number of frames you want to have:
    000.jpg, 001.jpg, …, 199.jpg

    Alternatively, and possibly more interesting, use a set of frames from a
    video created e.g. with the Ricoh Theta m15.

    Place all input frames into a subdirectory:

        equirectangular

 2. Create a directory for output files:

        stereographic

 3. Create a file `config.json`:

        {
            "input": {
                "path": "equirectangular"
            },
            "output": {
                "width": 480,
                "height": 480,
                "path": "stereographic"
            },
            "interpolation": "natural-spline",
            "keyFrames": {}
        }

    Available methods for interpolation and extrapolation:

      + `linear`: Linear interpolation between keyframes, with abrupt changes
        of direction.

      + `natural-spline`: Smooth interpolation along keyframes.

      + `polynomial`: Lagrance polynomial interpolation. Certain keyframe
        combinations result in *overreaction:* The animation temporarily spins
        far in one direction then back: [Runge's phenomenon][6]

    At least one entry needs to be present in the `keyFrames` section. See the
    following steps for how to determine parameters with *Hugin.* Feel free to
    use any other software to determine the key parameters: *field-of-view, yaw,
    pitch,* and *roll*

 4. Open *Hugin,* and add `000.jpg` to the project. Select the image, and
    change *Lens type* to *Equirectangular*. In the *Advanced interface* go to
    *Lens parameters*. Double click on the image file name, and change *Lens
    degrees of view (v)* to 360.

    ![Screenshot of Hugin 2013 with Photos tab][2]

 5. Switch to the *Stitcher* tab. As *Projection* select *Stereographic*.
    Adjust the canvas size to the output width and height specified in
    `config.json`. For a start, change *Field of View* to 200; This parameter
    controls zoom. Finally click *Preview panorama*.

    ![Screenshot of Hugin 2013 with Stitcher tab][3]

 6. In the *Panorama preview*, click *Num. Transf.*, and adjust *Yaw*, *Pitch*,
    and *Roll*. When the Ricoh Theta was upright when shooting the picture, you
    may want to start with changing *Pitch* by 90. This gives a bird’s-eye
    view. Click on the image to quickly adjust pitch and yaw. To zoom in or
    out, change the *Field of View* (previous step).

    ![Screenshot of Hugin 2013 with Panorama preview][4]

 7. Close *Panorama preview* and save the project to a file `hugin.pto`.

 8. Open `hugin.pto` in a text editor:

        # hugin project file
        #hugin_ptoversion 2
        p f4 w1500 h1500 v290  E8.14078 R0 n"TIFF_m c:LZW r:CROP"
        m g1 i0 f0 m2 p0.00784314

        # image lines
        #-hugin  cropFactor=8
        i w3584 h1792 f4 v360 Ra0 Rb0 Rc0 Rd0 Re0 Eev8.14078 Er1 Eb1 r-169.19 p-26.85 y-25.14 TrX0 TrY0 TrZ0 j0 a0 b0 c0 d0 e0 g0 t0 Va1 Vb0 Vc0 Vd0 Vx0 Vy0  Vm5 n"C:\some\path\000.jpg"

    Have a look at the line prefixed with `p`. It contains the selected field
    of view (here: `v290`). Go to the line prefixed with `i`. It contains yaw,
    pitch, and roll (here: `y-25.14`, `p-26.85`, `r-169.19`).

    Use these parameters to add a key frame in `config.json`:

        "keyFrames": {
            "000.jpg": {
                "fov": 290,
                "yaw": -25.14,
                "pitch": -26.85,
                "roll": -169.19
            }
        }

 9. Repeat the above steps for more key frames. Not all parameters need to be
    specified for each key frame.

 10. On the command line, in the same directory as `config.json`, run:

        s-anim

 11. Using a video editing software, assemble the frames into a video.


Coding conventions
==================

  * Code needs to validate with JSLint.

  * Comments are in Markdown.

  * Avoid constructors (JS is classless), don’t throw exceptions (not
    necessary in JS).

  * Versioning: major.minor.bug-fix

    Incompatible changes to the user interface mandate an update of the major
    version.

    Keep version up to date in:

      + Git tags

      + `package.json`


License
=======

Except where noted otherwise, files are licensed under the MIT License.


The MIT License (MIT)
---------------------

Copyright (c) 2014 [Felix E. Klee](felix.klee@inka.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://www.dpreview.com/forums/post/53759494
[2]: images/hugin_photos_tab.png
[3]: images/hugin_stitcher_tab.png
[4]: images/hugin_panorama_preview.png
[5]: https://www.npmjs.org/
[6]: https://en.wikipedia.org/wiki/Runge%27s_phenomenon
