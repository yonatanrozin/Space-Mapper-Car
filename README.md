# Space-Mapper-Car Prototype
A remote-controlled car that uses an IR distance sensor to measure and graph objects on screen.

## Introduction

Space-Mapper Car was conceived as the final project for my Physical Computing course, the guidelines for which can be found [here](https://itp.nyu.edu/physcomp/itp/syllabus/assignments/#Project_3). The project entailed any physical computing project which relied on microcontroller-to-PC communication through one of a choice of several protocols. 

My communication of choice ended up as an asynchronous serial connection between an Arduino Nano 33 IoT and a p5.js sketch on my PC through a USB cable. Though my initial desire was to use Bluetooth LE to allow for wireless communication, I had to resort to a wired serial connection in the interest of time, though I would eventually revisit the project to add a wireless BLE controller for a different course.

The car's purpose is essentially to function as a "remote ruler"; as it drives by objects on its right side, it maps out the edges of those objects on screen. The car can  graph the length of any straight object, regardless of its position and angle relative to the path of the car (allowing it to measure, for example, diagonal objects), and can also roughly graph the contours of round objects such as cups or bowls placed on their side. The sketch allows the real-world equivalent of the distance between any 2 points on the graph to be measured by clicking on them in order, returning a measurement that has been found to be roughly 95% accurate. 

The Arduino Nano 33 IoT mounted on the car receives input from the IR distance sensors, as well as 2 rotary encoders attached to the car's motors. These 4 values are constantly being communicated to the p5.js sketch, which uses the encoder values and a series of static measurements to calculate how much the car has moved or how by how many degrees the car has rotated since the last update (at a rate of roughly 30 updates per second). The location of any new points on the graph is then triangulated using the car's angle and position relative to its starting point and the reading from the distance sensors.

## Materials

### Hardware

- An [Arduino Nano 33 IoT](https://store.arduino.cc/usa/nano-33-iot) 
- A [TB6612FNG Motor Driver](https://www.digikey.com/catalog/en/partgroup/sparkfun-motor-driver-dual-tb6612fng/77350?utm_adgroup=General&utm_source=google&utm_medium=cpc&utm_campaign=Dynamic%20Search_EN_RLSA_Cart&utm_term=&utm_content=General&gclid=CjwKCAjw6fCCBhBNEiwAem5SOxlKTUwhOICaOWppYjjd_7NRXeuuupc6Qg5i4EwhrP_Fxs8bAraEchoCxeYQAvD_BwE)
- 2 [N20 Encoded Gearmotors (1:298)](https://www.adafruit.com/product/4641)
- 2 [Sharp IR distance sensors (10-80cm)](https://www.adafruit.com/product/164)

### Software

- The [Arduino IDE](https://www.arduino.cc/en/software)
- The [p5.js Web Editor](https://editor.p5js.org/)
- The [p5.SerialControl app](https://github.com/p5-serial/p5.serialcontrol/releases): this allows the p5.js Web Editor to receive and send serial data
- The [Space-Mapper Car p5.js sketch](https://editor.p5js.org/yr2053/full/aXnxBpDo4)

## Installation Instructions:

### Schematic Diagram

![A schematic diagram of an Arduino Nano 33 IoT connected to 2 IR distance sensors and 2 N20 motors through a TB6612FNG Motor Driver](https://github.com/yonatanrozin/Space-Mapper-Car/blob/main/Images/Space-Mapper%20Schematic.jpg)


- Connect Arduino to PC using USB cable
- Open p5.serialcontrol app, make sure Arduino USB port is visible in the Available Ports list
- Upload [Arduino Code](https://github.com/yonatanrozin/Space-Mapper-Car/blob/main/Arduino/Space_Mapper_Car_Full.ino) to Arduino Board, making sure the USB port is selected in Tools/Port
- Open [p5.js sketch](https://editor.p5js.org/yr2053/full/aXnxBpDo4)
- Restart p5.serialcontrol app if necessary
