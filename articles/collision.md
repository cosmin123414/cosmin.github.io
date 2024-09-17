# <center> C++ 2D Collision Simulator </center>
<br>
<br>

This article will very briefly discuss the implementation of a simple object-oriented C++ 2D physics engine with example simulations provided. Find the entirety of the code on github at: https://github.com/cosmin123414/Cpp-Collision-Sim


The main classes are the Particle and Environment classes. The particle class defines the elements of our simulation, they are all circular and may have varying masses, radii, colors, and of course, positions and velocities (both angular and linear)

The Environment class defines interactions, both between particles and between particles and the walls of the environment. Upon a wall collision, particles are reflected at their angle of incidence. When particle collisions are detected, their velocities are updated as follows:

$$
v_1' = v_1 - \frac{J}{m_1}N
$$
$$
v_2' = v_2 + \frac{J}{m_2}N
$$
Where N is the unit vector normal to the collision point, and $J$ is the impulse defined as:

$$
J = \frac{-(1+e)(v_{rel} \cdot N)}{\frac{1}{m_1} + \frac{1}{m_2} + \frac{(r_1 \times N)^2}{I_1} + \frac{(r_2 \times N)^2}{I_2}}
$$

Where $e$ is the coefficient of restitution. I will not go into more implementation details as everything is clear in the codebase.

<br>

## Simulations

Below are loops of a couple of simulations created with the engine, note that the lack of smoothness comes from my old computer, the cost of screen recording, and the conversion to GIF, running the executables for each simulation from the github repository should result in smooth animations.
<br>
<br>

<center>
<div style="display: table-row;">
<div style="display: table-cell;">
<p class="image-name"><i>Synchony()</i></p>
<img src="images/synchrony.gif" alt="" width=90%>
</div>

<div style="display: table-cell;">
<p class="image-name"><i>Random()</i></p>
<img src="images/random.gif" alt="" width=90%>
</div>
</div>
</center>
<br>
<br>
<center>
<div style="display: table-cell;">
<p class="image-name"><i>MixingGas()</i></p>
<img src="images/MixingGas.gif" alt="" width=90%; style="clip-path: inset(0px 2px 0px 0px);">
</div>
</center>