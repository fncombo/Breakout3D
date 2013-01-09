#[Breakout 3D][0]

##About
This is a little project I've done for one of my college assignments. It uses [theee.js][1] for WebGL rendering, and other types of sorcery.

##How to play
* Moving the mouse left and right controls the paddle.
* Left-clicking while the ball is not moving (ie. on the paddle) will launch the ball.
* Left-clicking while the ball is moving (ie. not on the paddle) will activate a wrath.

Each block has a 5% chance to become a special block when it's generated. Special blocks (spheres) have a 25% chance to give you an extra life and a 75% chance to give you an extra wrath.

Using a wrath will destroy 5 random blocks. If there are less than 5 blocks left, it will destroy whatever ones remain. Special blocks can be destroyed and they will grant the same bonus as if you had hit them.

##Cheating
There are a couple of ways to "cheat" available. Not intentional but rather side-effects of me being lazy to manage points, lives, and wraths. That was not a hint (wink wink).

[0]: http://fncombo.github.com/Breakout3D
[1]: https://github.com/mrdoob/three.js