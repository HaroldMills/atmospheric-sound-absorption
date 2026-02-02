Atmospheric Sound Absorption
============================

This repository contains JavaScript code that computes atmospheric sound
absorption coefficients according to the method of the International
Standard ISO 9613-1:1993. See file `absorption-utils.js` for the code.

The repository also offers two interactive, web-based plots that display
such coefficients. One of the plots shows absorption coefficients vs.
frequency for a user-specified temperature, pressure, and humidity. The
plot shows the total absorption coefficient as well as the parts of it
due to nitrogen relaxation, oxygen relaxation, and other processes.
It looks like this:

![Plot of absorption with components.](http://images/absorption-with-components.png)


To view and interact with the plots, serve the main
repository directory with your favorite web server and visit the server's
root URL. For example, to use the NPM `http-server` package, type:

    cd atmospheric-sound-absorption
    http-server

into a terminal and then visit:

    http://localhost:8080

in your web browser.
