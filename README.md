# PTKidsBIT block package for PT-BOT KidsBIT kit

powered by micro:bit

![PTKidsBIT](https://raw.githubusercontent.com/pt-robotics/pxt-kidsbit-vx/master/big_icon.png)

The package adds support [PTKidsBIT](https://ptbot.medium.com/pt-bot-kidsbit-aa923a5caeaa) board from [PT-BOT](https://web.facebook.com/LPRobotics).

## micro:bit Pin Assignment

* ``P0``  -- Connected to Buzzer
* ``P1``  -- Digital Input/Output and Analog Input/Output
* ``P2``  -- Digital Input/Output and Analog Input/Output
* ``P13`` -- DigitalWrite Pin for DC motor control direction 1
* ``P14`` -- AnalogWrite Pin for DC motor speed control 1
* ``P15`` -- DigitalWrite Pin for DC motor control direction 2
* ``P16`` -- AnalogWrite Pin for DC motor speed control 2
* ``P19`` -- SCL connected to I2C-based 12-bit ADC chip (ADS7828)
* ``P20`` -- SDA connected to I2C-based 12-bit ADC chip (ADS7828)

## Blocks preview

### motorWrite Block

Use PTKidsBIT's MotorWrite block to drives 1 motor forward and backward. The speed motor is adjustable between 0 to 100.

* The motor must be select either `1` or `2`
* Speed is an integer value between `-100` to `100` (Greater than 0 is forward, less than 0 is backward)

```blocks
PTKidsBIT.motorWrite(Motor_Write.Motor_1, 50)
```

### motorGo Block

Use PTKidsBIT's motorGo block to drives 2 motor forward and backward. The speed motor is adjustable between 0 to 100.

* The motor1 must be select `-100` to `100` (Greater than 0 is forward, less than 0 is backward)
* The motor2 must be select `-100` to `100` (Greater than 0 is forward, less than 0 is backward)

```blocks
PTKidsBIT.motorGo(50, -50)
```

### Turn Block

Use PTKidsBIT's Turn block to control the robot movment by turning. The one motor will stop, another one is moving.

* The Turn must be select either `Left` or `Right`
* Speed is an integer value between `0` to `100`

```blocks
PTKidsBIT.Turn(_Turn.Left, 50)
```

### Spin Block

Use PTKidsBIT's Spin block to control both motors separately. For example, choose one motor spin with forward direction another one spin with backward direction.

* The Spin must be select either `Left` or `Right`
* Speed is an integer value between `0` to `100`

```blocks
PTKidsBIT.Spin(_Spin.Left, 50)
```

### Motor Stop Block 

Use PTKidsBIT's Motor Stop block is used to stop both motors.

```blocks
PTKidsBIT.motorStop()
```

### servoWrite Block

Use PTKidsBIT's servoWrite block for control the servo's moving degree from 0 to 180

* The Servo must be select either `P8` or `P12`
* Degree is an integer value between `0 - 180`
* Mode must be select either `Released` or `Lock`

```blocks
PTKidsBIT.servoWrite(Servo_Write.P8, 180)
```

### WaitClick Block

Use PTKidsBIT's WaitClick block for Wait for the command from the button.

* Select `Pin` for connecting to the button.
* Select `Pressed` or `Released`.

```blocks
PTKidsBIT.waitClick(Button_Pin.P1, Button_Status.Pressed)
```

### ADCRead Block

Use PTKidsBIT's ADCRead block for read analog from ADC channels. The resolution is 0 to 4095. PTKidsBIT have 8 channel ADC.

* Select `Pin` from `0` to `7` for reading the analog sensor.

```blocks
basic.forever(function () {
    basic.showNumber(PTKidsBIT.ADCRead(ADC_Read.ADC0))
})
```

### SensorCalibrate Block

Use PTKidsBIT's SensorCalibrate block for calibration line follower sensor, left sensor and right sensor.

* Select ADC channels between `0` to `7` for calibrate sensor.

The calibration process is as follows
* Place the line follower sensor on the line, press Button A once and wait until the buzzer sounds.
* Place left and right sensor on the line, press Button A once and wait until the buzzer sounds.
* Place all sensor on the floor, press Button A once and wait until the buzzer sounds.

```blocks
PTKidsBIT.SensorCalibrate([1, 0, 7, 6])
```

### LINESensorSET Block

Use PTKidsBIT's LINESensorSET block for select the ADC channel connected to the sensor.

* LINESensorSET is ADC channels between `0` to `7` for line follower sensor.
* Sensor Left is ADC channels between `0` to `7` for sensor left.
* Sensor Right is ADC channels between `0` to `7` for sensor right.
* The ON OFF Sensor, `Pin` or `Disable` must be selected for the sensor on or off.

```blocks
PTKidsBIT.LINESensorSET(
    [1, 0, 7, 6],
    [2],
    [5],
    LED_Pin.Disable
)
```

### ForwardLINE Block

Use PTKidsBIT's ForwardLINE blog for the robot to follow the line forward. When the specified line is found, the robot will stop. 

* Direction is The direction in which the robot moves. Select `Forward` or `Backward`.
* Find is the line to detect. Select `Left`, `Center` or `Right`
* Min Speed is minimum speed between `0` to `100`
* Max Speed is maximum speed between `0` to `100`
* Break Time is the time for the Motor to reverse to brake when the Robot stops.
* KP value for control the robot
* KD value for control the robot

```blocks
PTKidsBIT.ForwardLINE(
    Forward_Direction.Forward,
    Find_Line.Left,
    30,
    60,
    0,
    0.05,
    0.1
)
```

### ForwardTIME Block

Use PTKidsBIT's ForwardTIME blog for the robot to follow the line forward. When the time, the robot will stop. 

* Direction is The direction in which the robot moves. Select `Forward` or `Backward`.
* Time is set time.
* Min Speed is minimum speed between `0` to `100`
* Max Speed is maximum speed between `0` to `100`
* KP value for control the robot
* KD value for control the robot

```blocks
PTKidsBIT.ForwardTIME(
    Forward_Direction.Forward,
    200,
    60,
    100,
    0.03,
    0.1
)
```

### TurnLINE Block

Use PTKidsBIT's TurnLINE block for the Robot to turn until it detects a line.

* TurnLINE is direction to turn the robot. Select `Left` or `Right`
* Speed is maximun speed between `0` to `100`
* Sensor is the sensor you want the robot to stop.
* Fast Time is the time at the maximum robot speed before a line is detected.
* Break Time is the time for the Motor to reverse to brake when the Robot stops.

```blocks
PTKidsBIT.TurnLINE(
    Turn_Line.Left,
    60,
    2,
    200,
    0
)
```

## Supported targets

* for PXT/microbit

## License

MIT

```package
PTKidsBIT=github:iBuilds/pxt-ptkidsbit
```

## บล็อกภาษาไทยสำหรับนักเรียน ป.4-ป.6

บล็อกใหม่อยู่ในหมวด **PTKidsBIT VX** แบ่งเป็น 5 กลุ่ม ส่วนบล็อกเดิม (ภาษาอังกฤษ, KP/KD) ยังใช้ได้เหมือนเดิม ย้ายไปอยู่ใน **เพิ่มเติม...**

| กลุ่ม | บล็อก |
|---|---|
| เคลื่อนที่ | หุ่นยนต์ เดินหน้า/ถอยหลัง/เลี้ยว/หมุน ความเร็ว · ...นาน _ วินาที · หุ่นยนต์หยุด · ล้อซ้าย _ ล้อขวา _ · หุ่นยนต์หมุน ซ้าย/ขวา _ องศา · หุ่นยนต์เดินหน้าตรงๆ นาน _ วินาที |
| เดินตามเส้น | ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน · สอนเซ็นเซอร์รู้จักเส้นและพื้น · เดินตามเส้น ความเร็ว _ · เดินตามเส้นไปจนเจอทางแยก _ ครั้ง · เดินตามเส้น นาน _ วินาที · เลี้ยว ซ้าย/ขวา จนเจอเส้น |
| เซ็นเซอร์ | ระยะทาง (ซม.) · เจอสิ่งกีดขวางใกล้กว่า _ ซม. · ค่าเซ็นเซอร์ช่อง _ · ทิศทางหุ่นยนต์ (องศา) · ตั้งทิศทางตอนนี้เป็น 0 องศา |
| เซอร์โว | เซอร์โวช่อง 1-8 หมุนไปที่ _ องศา |
| จอ OLED | ล้างจอ · แสดงข้อความ/ตัวเลข บรรทัดที่ 1-8 · แสดง ชื่อ = ค่า · แสดงตัวใหญ่ · วาดเส้น/สี่เหลี่ยม/วงกลม |

ตัวอย่าง: หุ่นยนต์หลบสิ่งกีดขวาง

```blocks
basic.forever(function () {
    PTKidsBITVX.oledShowValue("Distance", PTKidsBITVX.kidsDistance(), 1)
    if (PTKidsBITVX.kidsObstacle(15)) {
        PTKidsBITVX.robotMoveFor(Kids_Move.Backward, 50, 0.5)
        PTKidsBITVX.robotSpinDegrees(Kids_LeftRight.Right, 90, 60)
    } else {
        PTKidsBITVX.robotMove(Kids_Move.Forward, 50)
    }
})
```

ตัวอย่าง: เดินตามเส้น

```blocks
PTKidsBITVX.lineSetupStandard()
PTKidsBITVX.lineCalibrate()
PTKidsBITVX.lineToJunction(Kids_Junction.Center, 2, 40)
PTKidsBITVX.lineTurn(Kids_LeftRight.Left, 50)
PTKidsBITVX.lineToJunction(Kids_Junction.Center, 1, 40)
```

## OLED 1.3 inch (SH1106 128x64 I2C)

Ported from Adafruit_SH110X (`Adafruit_SH1106G`) with the Adafruit GFX 5x7 font (English letters and numbers only).

Wiring: `VCC` → 3V3, `GND` → GND, `SCL` → P19, `SDA` → P20 (I2C address 0x3C, or 0x3D)

```blocks
PTKidsBITVX.oledShowLine("PTKidsBIT VX", 1)
basic.forever(function () {
    PTKidsBITVX.oledShowValue("ADC0", PTKidsBITVX.kidsSensor(Kids_Sensor.ADC0), 3)
})
```

Tip (More...): turn `อัปเดตทันที` OFF, draw several shapes, then use `แสดงภาพที่วาด` once for faster drawing without flicker.
