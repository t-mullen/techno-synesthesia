# TechnoSynesthesia

TechnoSynesthesia is a web application that converts live video into a frequency spectrum in realtime. It allows people to determine intesity, motion and direction of light or bright objects through hearing.

## Usage
1. Turn your device's volume all the way down. 
2. Go to https://rationalcoding.github.io/techno-synesthesia and allow access to your webcam. 
3. Finally, turn your volume up to a comfortable level. 
4. You should hear a variety of seemingly random frequencies and noises. (iOS users must tap anywhere once.)

Each frequency corresponds to the brightness of a particular area of the video. This allows you to identify light sources, motion and (with practice) shapes.

Although TechnoSynesthesia takes some practice to use effectively, beginners can immediately notice some patterns:

- Turning towards a bright object increases the overall volume. 
- Darkness causes silence.
- Moving objects will cause a change in overall frequency/pitch. 
- Light in different areas of the video will make different frequencies louder.

After using for some time, users should be able to identify simple shapes, direction of motion, and level of noise/detail in a scene.

## Technical Explanation

This application captures video through the getUserMedia API and draws it to a canvas so that the image data can be manipulated. The data is average into an 8x8 grid of cells, each with the average brightness of the pixels inside those cells. This 2-dimensional brightness grid is then mapped onto a 1-dimensional frequency range using a [Hilbert curve](https://en.wikipedia.org/wiki/Hilbert_curve). The use of the Hilbert curve allows preservation of spatial information (frequencies that are close to each other are spatially close in the image).

## Inspiration

This application was inspired by [3Blue1Brown's video on the Hilbert curve](https://youtu.be/3s7h2MHQtxc?t=43s).
