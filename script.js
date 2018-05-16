
(function (document, window, THREE) {

    'use strict';

        // Core THREE variables
    var renderer, camera, scene, projector,
        // For showing current FPS
        fps = window.location.hash === '#fps' ? true : false, stats,
        // Core game variables
        light, sky, board, ball, fence, blocks = [],
        // Placeholder variables for generating core objects
        geometry, material,
        // Particle system variables (particles system, vertex coordinates, vector object)
        x, y, z, vector,
        // FOR statement variables
        n, i,
        // Distance the ball collides with objects from
        collisionDistance = 6,
        // Size of the blocks
        size = 15.17,
        // How many rows for the bricks
        rows = 20,
        // How many columns for the bricks
        columns = Math.ceil(500 / size),
        // How many blocks are currently in-game
        activeBlocks,
        // HTML elements
        $loading = $('#loading'),
        $lives = $('#lives'),
        $wraths = $('#wraths'),
        $points = $('#points'),
        $hgroup = $('hgroup'),
        // Paddle bouncing mechanism
        paddle = {
            bouncing: false,
            state: 0,
            amount: 2, // How many frames to bounce for
            distance: 3, // How far to bounce each frame
            direction: true // true for down, false for up
        },
        // Initial velocities
        velocityX = 0,
        velocityZ = 0,
        // List of distances from the center of the ball that they rays should go to
        collisionPoints = [
            [0, collisionDistance, 1], // +x, +z, which velocity should be reversed (1 = z, 2 = x, 3 = both)
            [collisionDistance, collisionDistance, 3],
            [collisionDistance, 0, 1],
            [-collisionDistance, -collisionDistance, 3],
            [0, -collisionDistance, 2],
            [collisionDistance, -collisionDistance, 3],
            [-collisionDistance, 0, 2],
            [-collisionDistance, collisionDistance, 3]
        ],
        // Loading animation
        loading = true,
        // Last time a block was hit
        time,
        // Current level
        level = 1,
        // Level data
        levels = {
            1: {
                title: 'Level 1', // Title to display
                name: 'The Executioner', // the name of the level
                bgColor: 0x15030f, // Background color
                blockColors: { // Materials of different blocks in the map, can have as many as you want
                    0: new THREE.MeshLambertMaterial({ color: 0x0b0109 }),
                    1: new THREE.MeshLambertMaterial({ color: 0xfe8c58 }),
                    2: new THREE.MeshLambertMaterial({ color: 0xd6457e }),
                    3: new THREE.MeshLambertMaterial({ color: 0x4d2b44 })
                },
                map: // Block arrangement
                    '                                 ' +
                    '                                 ' +
                    ' 0000000000000000000000000000000 ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    '  3 3 3 3 3 3 3 3 3 3 3 3 3 3 3  ' +
                    ' 0000000000000000000000000000000 ' +
                    '                                 ' +
                    ' 2                             2 ' +
                    ' 22                           22 ' +
                    ' 2 2       1    1    1       2 2 ' +
                    ' 2  2     111  111  111     2  2 ' +
                    ' 2   2     1    1    1     2   2 ' +
                    ' 2    2                   2    2 ' +
                    ' 2     2                 2     2 ' +
                    '000000000000000000000000000000000' +
                    '000000000000000000000000000000000'
            },
            2: {
                title: 'Level 2',
                name: 'Black Liliana',
                bgColor: 0x05052b,
                blockColors: {
                    0: new THREE.MeshLambertMaterial({ color: 0x32386a }),
                    1: new THREE.MeshLambertMaterial({ color: 0x518b99 }),
                    2: new THREE.MeshLambertMaterial({ color: 0x9159a0 }),
                    3: new THREE.MeshLambertMaterial({ color: 0xeacbaf }),
                    4: new THREE.MeshLambertMaterial({ color: 0x949ba1 })
                },
                map:
                    '0  22  3333333333333333333  22  0' +
                    '00  22  33333       33333  22  00' +
                    ' 00  22  333    4    333  22  00 ' +
                    '  00  22  3    444    3  22  00  ' +
                    '   00  22     44444     22  00   ' +
                    '    00  22   4444444   22  00    ' +
                    '     00  22   44444   22  00     ' +
                    '      00  22   444   22  00      ' +
                    '   1   00  22   4   22  00   1   ' +
                    '  111   00  22     22  00   111  ' +
                    ' 11111   00  22   22  00   11111 ' +
                    '  111   0000  22 22  0000   111  ' +
                    '   1   00  00  222  00  00   1   ' +
                    '      00    00  2  00    00      ' +
                    '     00      00   00      00     ' +
                    '    00   1    00 00    1   00    ' +
                    '   00   111    000    111   00   ' +
                    '  00   11111    0    11111   00  ' +
                    ' 00     111           111     00 ' +
                    '00       1             1       00'
            },
            3: {
                title: 'Final Level',
                name: 'Mirage Coordinator',
                bgColor: 0x090708,
                blockColors: {
                    0: new THREE.MeshLambertMaterial({ color: 0xfdea46 }),
                    1: new THREE.MeshLambertMaterial({ color: 0xb82627 }),
                    2: new THREE.MeshLambertMaterial({ color: 0x580e0d }),
                    3: new THREE.MeshLambertMaterial({ color: 0x062c2d }),
                    4: new THREE.MeshLambertMaterial({ color: 0x080607 }),
                    5: new THREE.MeshLambertMaterial({ color: 0x22376e })
                },
                map:
                    '111222222222222222222222222222111' +
                    '112222222222222222222222222222211' +
                    '12            00000            21' +
                    '22  4   4   00     00   4   4  22' +
                    '22  44 44  0   4     0  44 44  22' +
                    '22   444  0 5 444  55 0  444   22' +
                    '22    4   0 5  4  5   0   4    22' +
                    '223      0   5   5  4  0      322' +
                    '2233     0    55 5 444 0     3322' +
                    '22333    0  4   5   4  0    33322' +
                    '223333   0 444 5 55    0   333322' +
                    '2233333  0  4  5   5   0  3333322' +
                    '22333333  0   5  4  5 0  33333322' +
                    '223333333 0 55  444 5 0 333333322' +
                    '2233333333 0     4   0 3333333322' +
                    '22333333333300     00333333333322' +
                    '223333333333330000033333333333322' +
                    '123333333333333333333333333333321' +
                    '112222222222222222222222222222211' +
                    '111222222222222222222222222222111'
            }
        };


    /**
     * Setting a level and difficulty for the game
     * @param newLevel {integer} The level to change the game to.
     */
    function setLevel(newLevel) {

            // Loop + block identifiers
        var i, n, b, character, special,
            // Textures
            textures = [],
            loadedTextures = 0,
            // Block geometries
            normalGeometry = new THREE.CubeGeometry(size, size * 0.5, size),
            specialGeometry = new THREE.SphereGeometry(size / 2, size, size);

        // Set the meta of the level
        level = newLevel;

        // Set HTML info of the level
        $('h1').innerHTML = levels[level].title;
        $('h2').innerHTML = levels[level].name;

        // Set background color
        renderer.setClearColorHex(levels[level].bgColor, 1);

        // Clear the blocks array of anything we don't need and only leave the paddle
        blocks.forEach(function (block, index) {

            // If the block exists and is not the paddle
            if (block !== null && !block.paddle) {

                scene.remove(block); // Remove from the scene
                delete blocks[index]; // Remove from object

            }

        });

        activeBlocks = 0; // Reset the count of blocks that are in game since they have been removed

        // Load the new textures
        ['sky', 'board', 'paddle', 'ball', 'particle'].forEach(function (what) {
            textures[what] = THREE.ImageUtils.loadTexture('textures/level-' + level + '/' + what + '.bmp', {}, function () {
                loadedTextures += 1;
                if (loadedTextures === 5) {
                    $loading.addClass('hide');
                }
            });
        });

        textures.board.wrapS = textures.board.wrapT = THREE.RepeatWrapping; // Make the board texture repeat
        textures.board.repeat.set(10, 10); // Scale the board texture

        // Map the textures
        sky.material.map = textures.sky;
        board.material.map = textures.board;
        blocks[0].material.map = textures.paddle;
        ball.material.map = textures.ball;
        fence.material.map = textures.particle;

        // Generate and place blocks
        b = 1; // Start with index 1

        // Rows
        for (n = 0; n < rows; n += 1) {

            // Columns
            for (i = 0; i < columns; i += 1) {

                character = levels[level].map.charAt(b - 1); // Account for 0-based indexing

                // If the block is supposed to be placed from the level map
                if (character !== ' ') {

                    special = THREE.Math.random16() < 0.05; // 5% chance of it being a special block

                    blocks[b] = new THREE.Mesh(special ? specialGeometry : normalGeometry, levels[level].blockColors[character]);
                    blocks[b].receiveShadow = blocks[b].castShadow = true; // Can cast and recieve shadows
                    blocks[b].position.set((i * size) - 250 + (size / 2), 9, (n * size) - 250 + (size / 2));
                    blocks[b].blockNum = b; // Extra identifier so we know which block to remove when the ball hits it
                    blocks[b].blockSpecial = special; // Extra identifier to detect special blocks
                    scene.add(blocks[b]);

                    activeBlocks += 1; // Increment the number of blocks on the board

                }

                b += 1; // Increment block unique number

            }

        }

        // Reset the position of the ball
        ball.bouncing = false;
        ball.position.set(blocks[0].position.x, 9, 244);

        // Done loading
        loading = false;

    }


    // Renderer, camera, scene, projector (to capture mouse)
    renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialize renderer + anti-alias
    renderer.shadowMapEnabled = renderer.shadowMapSoft = true; // Enable shadows and make them smoother
    renderer.setSize(window.innerWidth, window.innerHeight); // Set the size to the whole window
    renderer.sortObjects = false; // Improves performance

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.y = 500;
    camera.position.z = 400;
    scene.add(camera);

    document.body.appendChild(renderer.domElement); // Put the canvas onto the page

    projector = new THREE.Projector(); // Used to track the mouse


    // Lights
    [-200, 200].forEach(function (distance) {

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(distance, 200, 500);
        scene.add(light);

    });

    light = new THREE.SpotLight(0xffffff, 1);
    light.position.set(0, 350, 500);
    light.shadowCameraNear = 0.01;
    light.castShadow = true;
    light.shadowDarkness = 0.3;
    light.shadowMapWidth = light.shadowMapHeight = 2048; // Larger shadow map improves shadow quality
    scene.add(light);


    // Sky
    geometry = new THREE.PlaneGeometry(3500, 1500);
    material = new THREE.MeshBasicMaterial();
    sky = new THREE.Mesh(geometry, material);

    sky.position.set(0, -500, -800);
    sky.rotation.set(-900, 0, 0);
    scene.add(sky);


    // Board
    geometry = new THREE.CubeGeometry(500, 3, 500);
    material = new THREE.MeshBasicMaterial();
    board = new THREE.Mesh(geometry, material);

    board.matrixAutoUpdate = false; // The board will be static, so no need to update it
    board.receiveShadow = true; // It can receive shadows
    scene.add(board);
    camera.lookAt(board.position);


    // Paddle
    geometry = new THREE.CubeGeometry(80, 20, 3);
    material = new THREE.MeshBasicMaterial();
    blocks[0] = new THREE.Mesh(geometry, material); // Paddle is the first object in the blocks array

    blocks[0].paddle = true; // Extra identifier for detecting collision
    blocks[0].position.set(0, 13, 251.5);
    scene.add(blocks[0]);


    // Ball
    geometry = new THREE.SphereGeometry(6, 16, 16);
    material = new THREE.MeshLambertMaterial();
    ball = new THREE.Mesh(geometry, material);

    ball.castShadow = true; // Make it cast a shadow
    ball.position.set(0, 9, 244);
    scene.add(ball);


    // Fence
    geometry = new THREE.Geometry();
    material = new THREE.ParticleBasicMaterial({
        size: 6, // Scale of the particles
        blending: THREE.AdditiveBlending, // Black becomes transparent
        transparent: true
    });

    // Create individual particles and push them into the geometry, 3 times, for each of the sides (left, top, right)
    for (n = 0; n < 3; n += 1) { // Number of sides

        for (i = 0; i < 100; i += 1) { // Number of particles in current side

            switch (n) {

            case 0: // Left
                x = -250;
                z = THREE.Math.randInt(-250, 250);
                break;

            case 1: // Top
                x = 250;
                z = THREE.Math.randInt(-250, 250);
                break;

            case 2: // Right
                x = THREE.Math.randInt(-250, 250);
                z = -250;
                break;

            }

            y = THREE.Math.randInt(0, 20);
            vector = new THREE.Vector3(x, y, z); // Position vector
            geometry.vertices.push(vector);

        }

    }

    fence = new THREE.ParticleSystem(geometry, material); // Create the particles system
    scene.add(fence);


    /**
     * Automatically increment or decrement values of HTML elements.
     * @param element {object} The element which ti manipulate.
     * @param number {integer} The number to add (negative to subtract.)
     * @return The new number in the element.
     */
    function addNumber(element, number) {

        var newNumber = parseInt(element.innerHTML, 10) + number,
            $text = $('#' + element.id + '-text');

        // Change the numerical value of the element
        element.innerHTML = newNumber;

        // Make sure to change the word to plural or singular as appropriate
        $text.innerHTML = newNumber === 1 ? $text.getAttribute('data-singular') : $text.getAttribute('data-plural');

        // Return the new number so we can use it
        return newNumber;

    }


    /**
     * Do this when a special block is hit.
     */
    function handleSpecialBlock() {

        if (THREE.Math.random16() < 0.25) {
            addNumber($lives, 1); // 25% chance to gain an extra life
        } else {
            addNumber($wraths, 1); // 75% chance to gain an extra wrath
        }

        addNumber($points, 10); // Give extra points because why not

    }


    /**
     * Animating everything (executed every time the render function is called)
     */
    function animate() {

        // Move the ball if it's supposed to be bouncing
        // We do this first so the following code has a chance to handle collisions
        // and correct unusual position states before those states are displayed to the
        // user, preventing visual glitches.
        if (ball.bouncing) {
            ball.position.x += velocityX;
            ball.position.z += velocityZ;
        }

            // A new vector for the ray's destination
        var vector,
            // Ray used for detecting collisions
            ray,
            // List of intersecting objects
            intersects,
            // Edge of the board
            bounceEdge = 250 - collisionDistance,
            // Shorthands for ball positions
            ballPos = ball.position,
            ballX = ball.position.x,
            ballZ = ball.position.z,
            // New velocities if the ball hit something
            newVelocityX,
            newVelocityZ,
            // Time difference
            timeDiff,
            // Distance from the ball to center of the paddle
            distance;

        // If ball went below bottom and we have lives, remove a life and reset position
        if (ballZ >= 300 && parseInt($lives.innerHTML, 10) > 0) {

            ball.bouncing = false; // Stop bouncing the ball

            // If no more lives
            if (!addNumber($lives, -1)) {

                $('#died-points').innerHTML = $points.innerHTML;

                if (parseInt($wraths.innerHTML, 10)) {
                    $('#died-wraths-text').removeClass('hidden');
                    $('#died-wraths').innerHTML = $wraths.innerHTML;
                } else {
                    $('#died-wraths-text').addClass('hidden');
                }

                $hgroup.addClass('hide');
                $('#died').removeClass('hide');

            // If there are lives left, reset the position
            } else {

                ball.position.set(blocks[0].position.x, 9, 244);

            }
        }

        /**
         * Collision detection
         */
        collisionPoints.forEach(function (collisionPoint) { // For each set of points a ray should go to

            vector = new THREE.Vector3(ballX + collisionPoint[0], 6, ballZ + collisionPoint[1]).subSelf(ballPos).normalize(); // A vector of that position from the center of the ball
            ray = new THREE.Raycaster(ballPos, vector); // A ray from the center of the ball to the point in the vector
            intersects = ray.intersectObjects(blocks); // Array of intersecting objects

            // If there are intersecting objects
            if (intersects.length > 0) {

                // For each intersecting object
                intersects.forEach(function (intersection, index) {

                    // If it's close enough
                    if (intersection.distance <= collisionDistance) {

                        // If it's the closest object, we need to reverse the ball, so work out which velocity should be reversed
                        if (index === 0) {

                            // Make a new velocity depending on the distance to collision
                            newVelocityX = 4 + (intersection.distance * 0.1);
                            newVelocityZ = 5 + (intersection.distance * 0.1);

                            // Alter the velocity, making sure it's the opposite of old velocity
                            velocityX = velocityX < 0 ? -newVelocityX : newVelocityX;
                            velocityZ = velocityZ < 0 ? -newVelocityZ : newVelocityZ;

                            // Reverse the direction of the ball
                            switch (collisionPoint[2]) {
                            case 1: // z
                                velocityZ = -velocityZ;
                                break;
                            case 2: // x
                                velocityX = -velocityX;
                                break;
                            case 3: // Both
                                velocityX = -velocityX;
                                velocityZ = -velocityZ;
                                break;
                            }

                        }

                        // If the ball hit a block, remove it
                        if (intersection.object.blockNum) {

                            // If the block was special
                            if (blocks[intersection.object.blockNum].blockSpecial) {
                                handleSpecialBlock();
                            }

                            scene.remove(blocks[intersection.object.blockNum]);
                            blocks[intersection.object.blockNum] = null;
                            activeBlocks -= 1;

                            // Add points depending on how much time has elapsed since last block collision
                            timeDiff = 20 - ((new Date() - time) * 0.01);
                            timeDiff = timeDiff || 1; // If the difference is negative, only assign 1 point
                            addNumber($points, Math.round(timeDiff));
                            time = new Date();

                        // Otherwise it must have hit the paddle (but only on Z axis)
                        } else if (collisionPoint[2] === 1) {

                            // Adjust velocity based on how far away from the center of the paddle the ball hit
                            distance = ball.position.distanceTo(blocks[0].position);
                            newVelocityX = THREE.Math.clamp(distance * 0.1, 0, 6);
                            velocityX = velocityX < 0 ? -newVelocityX : newVelocityX;

                            // Bounce the paddle
                            paddle.bouncing = true;

                            // Ensure ball doesn't end up inside the paddle
                            ball.position.z = 244;

                        }

                    }

                });

            }

        });

        // Bounce off the sides of the board
        if (ballX <= -bounceEdge) {
            ball.position.x = -bounceEdge;
            velocityX = -velocityX;
        }

        if (ballX >= bounceEdge) {
            ball.position.x = bounceEdge;
            velocityX = -velocityX;
        }

        // Bounce off the top
        if (ballZ <= -bounceEdge) {
            ball.position.z = -bounceEdge;
            velocityZ = -velocityZ;
        }

        /**
         * Ball
         */
        ball.lookAt(camera.position); // No one will probably even realize this :(

        /**
         * Paddle
         */
        if (paddle.bouncing) { // If the paddle is supposed to be bouncing

            if (paddle.direction) { // If bouncing down

                blocks[0].position.z += paddle.distance; // Move the paddle down

                if (paddle.state === paddle.amount) { // If it moved down "amount" times
                    paddle.direction = false; // Reverse direction
                    paddle.state = 0; // Reset state
                } else {
                    paddle.state += 1; // Otherwise, increment the state
                }

            } else { // If bouncing back up

                blocks[0].position.z -= paddle.distance; // Move the paddle up

                if (paddle.state === paddle.amount) { // If it moved up "amount" times
                    paddle.direction = true; // Reset direction
                    paddle.state = 0; // Reset State
                    paddle.bouncing = false; // Not supposed to be bouncing anymore
                } else {
                    paddle.state += 1; // Otherwise, increment the state
                }

            }

        }


        /**
         * Fence
         */
        fence.geometry.verticesNeedUpdate = true; // Forces the update of geometry

        fence.geometry.vertices.forEach(function (vertex) {
            vertex.y = vertex.y > 20 ? 0 : vertex.y + 0.2; // Move each particle up a bit. If it's too far up, reset position.
        });

    }


    /**
     * Moving the paddle along with the mouse cursor
     */
    $('canvas').onmousemove = function (event) {

        var vector, direction, distance, position;

        vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, 0, 1); // Make a vector from the X position of the mouse
        projector.unprojectVector(vector, camera); // Ray from the camera to mouse position
        direction = vector.subSelf(camera.position).normalize(); // Align the ray with the camera
        distance = -(camera.position.z / direction.z); // Distance from the mouse to the camera
        position = camera.position.clone().addSelf(direction.multiplyScalar(distance)); // Magical maths does its work

        if (position.x >= -(275 - blocks[0].geometry.vertices[0].x) && position.x <= (275 - blocks[0].geometry.vertices[0].x)) { // If paddle is inside the board
            blocks[0].position.x = position.x; // Move the paddle with the mouse
            light.position.x = position.x * 1.5; // Move the spot light with the mouse but a bit faster
            if (!ball.bouncing) {
                ball.position.x = position.x; // If the ball is not bouncing, move it too
            }
        }

    };


    /**
     * Clicking to launch the ball if it's not moving or using a wrath if it is moving
     */
    $('canvas').onclick = function () {

        if (!ball.bouncing) { // If the ball is not bouncing
            velocityX = 0; // Make the ball go straight up
            velocityZ = -5 + THREE.Math.random16(); // Launch velocity!
            ball.bouncing = true; // Make it bounce
            time = new Date(); // Start recording time

        } else {

            // If they have wrath points
            if (parseInt($wraths.innerHTML, 10)) {

                addNumber($wraths, -1); // Decrement wrath points

                // Remove 5 random blocks
                var blockToRemove = activeBlocks >= 5 ? 5 : activeBlocks,
                    randomIndex;

                i = 0;

                while (i < blockToRemove) {

                    randomIndex = THREE.Math.randInt(1, blocks.length); // Start with 1 and not zero as 0 index is the paddle

                    if (blocks[randomIndex] !== null && blocks[randomIndex] !== undefined && blocks[randomIndex].blockNum) {

                        if (blocks[randomIndex].blockSpecial) {
                            handleSpecialBlock();
                        }

                        scene.remove(blocks[randomIndex]);
                        blocks[randomIndex] = null;

                        activeBlocks -= 1;
                        addNumber($points, 20); // Add the maximum points available per block
                        i += 1;

                    }

                }

            }

        }

    };


    /**
     * Resize the canvas along with the window
     */
    window.onresize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };


    /**
     * Start the game
     */
    $('#play').onclick = function () {
        $hgroup.removeAttribute('class');
        $('#controls').addClass('hide');
    };


    /**
     * Restart the level
     */
    $('#try-again').onclick = function () {

        setLevel(level); // Reset the current level

        if (level === 1) {

            // If it's level 1, restore the default lives, wraths, and no points
            $lives.innerHTML = $wraths.innerHTML = 3;
            $points.innerHTML = 0;

        } else {

            // Otherwise revert lives, wraths, and points to what they were at the start of the level
            [$lives, $wraths, $points].forEach(function (element) {
                element.innerHTML = element.getAttribute('data-level-' + (level - 1));
            });

        }

        $hgroup.removeClass('hide');
        $('#died').addClass('hide');

    };


    /**
     * Go on to the next level
     */
    $('#next-level').onclick = function () {

        // Don't trigger any weird events
        loading = true;

        // Show loading screen
        $loading.removeClass('hide');

        // Wait 200ms before starting loading the next level to finish for the loading screen animation
        setTimeout(function () {
            setLevel(level + 1);
        }, 200);

        $('#well-done').addClass('hide');
        $hgroup.removeClass('hide');

    };


    /**
     * Replay the game
     */
    $('#replay').onclick = function () {

        $lives.innerHTML = $wraths.innerHTML = 3;
        $points.innerHTML = 0;

        // Don't trigger any weird events
        loading = true;

        // Show loading screen
        $loading.removeClass('hide');

        // Wait 200ms before starting loading the next level to finish for the loading screen animation
        setTimeout(function () {
            setLevel(1);
        }, 200);

        $hgroup.removeClass('hide');
        $('#completed').addClass('hide');

    };


    /**
     * Secret key to skip a level
     */
    document.onkeypress = function (event) {

        // Allow to skip only when pressed the "n" key
        if (event.keyCode !== 110 && event.key !== 'n') {
            return;
        }

        var confirmation = confirm('About to skip to the next level. Are you sure?');

        if (confirmation) {
            setLevel(level === 3 ? 1 : level + 1);
        }

    };


    // Initiate the stats if needed
    if (fps) {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = stats.domElement.style.left = '0';
        document.body.appendChild(stats.domElement);
    }


    // Load level 1 :D
    setLevel(1);


    /**
     * Render the scene at max FPS available to the browser
     * Execute straight away and start rendering
     */
    (function render() {

        // Show FPS?
        if (fps) {
            stats.update();
        }

        // Move everything on the scene
        animate();

        // If all blocks have been destroyed, move on to the next level
        if (!activeBlocks && !loading) {

            ball.bouncing = false;

            $hgroup.addClass('hide');

            if (level === 3) {

                // If it was the final level, show the grats screen
                $('#completed').removeClass('hide');

                // Fill in the points, lives, and wraths data
                ['points', 'lives', 'wraths'].forEach(function (what) {
                    $('#finish-' + what).innerHTML = parseInt($('#' + what).innerHTML, 10) || 'no';
                });

            } else {

                // Otherwise show the next level screen
                $('#well-done').removeClass('hide');

            }

            // Make a note of the scores
            [$lives, $wraths, $points].forEach(function (element) {
                element.setAttribute('data-level-' + level, element.innerHTML);
            });

        }

        // Next frame
        requestAnimationFrame(render);

        // Render the current frame
        renderer.render(scene, camera);

    }());

}(document, window, THREE));