# [Breakout 3D][0]

## About
This is a small project done for a college assignment. It uses [theee.js][1] (v54) for WebGL 3D rendering inside the browser.

## How to play
* Moving the mouse left and right controls the paddle
* Left-clicking while the ball is not moving will launch the ball
* Left-clicking while the ball is moving will activate a "wrath"

Each block has a 5% chance to become a special block when it's generated. Special blocks (spheres) have a 25% chance to give you an extra life or a 75% chance to give you an extra wrath.

Using a wrath will destroy 5 random blocks. If there are less than 5 blocks left, it will destroy whatever ones remain. Special blocks can also be destroyed by this and they will grant the same bonus as if being hit normally.

This functionality is intended to prevent being stuck with a few blocks remaining and not being able to complete a level because of unlucky bounce RNG.

## Cheating
You can forcefully skip to the next level by using the `n` key.

[0]: http://fncombo.github.io/breakout-3d
[1]: https://github.com/mrdoob/three.js
