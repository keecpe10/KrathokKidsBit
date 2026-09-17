# KrathokKidsBit

บล็อกภาษาไทยสำหรับหุ่นยนต์ KidsBIT + จอ OLED 1.3 นิ้ว สำหรับนักเรียน ป.4-ป.6

พัฒนาต่อจาก [pxt-kidsbit-vx](https://github.com/pt-robotics/pxt-kidsbit-vx) ของ PT-BOT (MIT License)

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
KrathokKidsBit.motorWrite(Motor_Write.Motor_1, 50)
```

### motorGo Block

Use PTKidsBIT's motorGo block to drives 2 motor forward and backward. The speed motor is adjustable between 0 to 100.

* The motor1 must be select `-100` to `100` (Greater than 0 is forward, less than 0 is backward)
* The motor2 must be select `-100` to `100` (Greater than 0 is forward, less than 0 is backward)

```blocks
KrathokKidsBit.motorGo(50, -50)
```

### Turn Block

Use PTKidsBIT's Turn block to control the robot movment by turning. The one motor will stop, another one is moving.

* The Turn must be select either `Left` or `Right`
* Speed is an integer value between `0` to `100`

```blocks
KrathokKidsBit.Turn(_Turn.Left, 50)
```

### Spin Block

Use PTKidsBIT's Spin block to control both motors separately. For example, choose one motor spin with forward direction another one spin with backward direction.

* The Spin must be select either `Left` or `Right`
* Speed is an integer value between `0` to `100`

```blocks
KrathokKidsBit.Spin(_Spin.Left, 50)
```

### Motor Stop Block 

Use PTKidsBIT's Motor Stop block is used to stop both motors.

```blocks
KrathokKidsBit.motorStop()
```

### servoWrite Block

Use PTKidsBIT's servoWrite block for control the servo's moving degree from 0 to 180

* The Servo must be select either `P8` or `P12`
* Degree is an integer value between `0 - 180`
* Mode must be select either `Released` or `Lock`

```blocks
KrathokKidsBit.servoWrite(Servo_Write.P8, 180)
```

### WaitClick Block

Use PTKidsBIT's WaitClick block for Wait for the command from the button.

* Select `Pin` for connecting to the button.
* Select `Pressed` or `Released`.

```blocks
KrathokKidsBit.waitClick(Button_Pin.P1, Button_Status.Pressed)
```

### ADCRead Block

Use PTKidsBIT's ADCRead block for read analog from ADC channels. The resolution is 0 to 4095. PTKidsBIT have 8 channel ADC.

* Select `Pin` from `0` to `7` for reading the analog sensor.

```blocks
basic.forever(function () {
    basic.showNumber(KrathokKidsBit.ADCRead(ADC_Read.ADC0))
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
KrathokKidsBit.SensorCalibrate([1, 0, 7, 6])
```

### LINESensorSET Block

Use PTKidsBIT's LINESensorSET block for select the ADC channel connected to the sensor.

* LINESensorSET is ADC channels between `0` to `7` for line follower sensor.
* Sensor Left is ADC channels between `0` to `7` for sensor left.
* Sensor Right is ADC channels between `0` to `7` for sensor right.
* The ON OFF Sensor, `Pin` or `Disable` must be selected for the sensor on or off.

```blocks
KrathokKidsBit.LINESensorSET(
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
KrathokKidsBit.ForwardLINE(
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
KrathokKidsBit.ForwardTIME(
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
KrathokKidsBit.TurnLINE(
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
KrathokKidsBit=github:keecpe10/KrathokKidsBit
```

## บล็อกภาษาไทยสำหรับนักเรียน ป.4-ป.6

บล็อกทั้งหมดอยู่ในหมวด **KrathokKidsBit** แยกเป็นกลุ่มย่อย (subcategory) และกลุ่มบล็อก (group) เพื่อให้ค้นหาและเรียกใช้ง่ายขึ้น

### โครงสร้างกล่องบล็อก

| กลุ่มย่อย (แท็บ) | กลุ่มบล็อก | บล็อก |
|---|---|---|
| **KrathokKidsBit** (หน้าแรก) | เคลื่อนที่พื้นฐาน | หุ่นยนต์ เดินหน้า/ถอยหลัง/เลี้ยว/หมุน ความเร็ว _ · ...นาน _ วินาที · หุ่นยนต์หยุด |
| | เคลื่อนที่แม่นยำ | หุ่นยนต์ เดินหน้า/ถอยหลัง ตรงๆ นาน _ วินาที · หุ่นยนต์หมุน ซ้าย/ขวา _ องศา · ล้อซ้าย _ ล้อขวา _ |
| **เดินตามเส้น** | ตั้งค่าเส้น | ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน · สอนเซ็นเซอร์รู้จักเส้นและพื้น · ใช้เส้นแบบ _ · ไฟเซ็นเซอร์เส้น เปิด/ปิด · ปรับความไว KP/KD |
| | สั่งเดินตามเส้น | เดินตามเส้น ความเร็ว _ · เดินตามเส้น นาน _ วินาที · เดินตามเส้นไปจนเจอทางแยก _ ครั้ง · เลี้ยว ซ้าย/ขวา จนเจอเส้น |
| **เซ็นเซอร์** | ระยะทาง | ระยะทาง (ซม.) · เจอสิ่งกีดขวางใกล้กว่า _ ซม. |
| | เซ็นเซอร์เส้น | ค่าเซ็นเซอร์ช่อง _ |
| | ทิศทาง | ทิศทางหุ่นยนต์ (องศา) · ตั้งทิศทางตอนนี้เป็น 0 องศา |
| **เซอร์โว** | เซอร์โว | เซอร์โวช่อง 1-8 หมุนไปที่ _ องศา |
| **จอ OLED** | เริ่มต้นจอ | เริ่มใช้จอ · ล้างจอ · แสดงภาพที่วาด · อัปเดตทันที เปิด/ปิด |
| | ข้อความและตัวเลข | แสดงข้อความ/ตัวเลข บรรทัดที่ 1-8 · แสดง ชื่อ = ค่า · แสดงตัวใหญ่ · เขียนข้อความ/ตัวเลขที่ x,y |
| | วาดรูป | วาดจุด · วาดเส้นตรง · วาดสี่เหลี่ยม · วาดวงกลม · แถบพลัง |
| | ตั้งค่าจอ | กลับสีทั้งจอ · ความสว่าง · เปิด/ปิดจอ |
| | เซ็นเซอร์บนจอ | แสดงค่าเซ็นเซอร์เส้น · กราฟแท่งเซ็นเซอร์เส้น |

### บล็อกเดิม (ขั้นสูง)

บล็อกเดิมภาษาอังกฤษ (KP/KD, PID, ADC) ยังใช้ได้เหมือนเดิม ซ่อนอยู่ใน **more... (Advanced)** ของหมวด KrathokKidsBit แยกเป็น 8 กลุ่ม เพื่อไม่ให้ปนกับบล็อกของนักเรียน

| กลุ่มบล็อก | บล็อก |
|---|---|
| Motor Basic | Motor Stop · Spin · Turn · motorGo · motorWrite |
| Motor + IMU | goWithDegreesTime · goWithDegrees · spinDegrees · turnDegrees |
| Servo Advanced | servoWrite |
| IMU Angle | anglesRead · setAngleOffset |
| Ultrasonic | distanceRead |
| ADC | ADCRead |
| Line Setup | LINESensorSET · Line Sensor LED · Line Mode · ValueSensorSET · SensorCalibrate · PrintSensorValue · GETPosition |
| Line Follow PID | Follower · ForwardTIME · ForwardLINE · ForwardLINECount · TurnLINE |

ตัวอย่าง: หุ่นยนต์หลบสิ่งกีดขวาง

```blocks
basic.forever(function () {
    KrathokKidsBit.oledShowValue("Distance", KrathokKidsBit.kidsDistance(), 1)
    if (KrathokKidsBit.kidsObstacle(15)) {
        KrathokKidsBit.robotMoveFor(Kids_Move.Backward, 50, 0.5)
        KrathokKidsBit.robotSpinDegrees(Kids_LeftRight.Right, 90, 60)
    } else {
        KrathokKidsBit.robotMove(Kids_Move.Forward, 50)
    }
})
```

ตัวอย่าง: เดินตามเส้น

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.lineCalibrate()
KrathokKidsBit.lineToJunction(Kids_Junction.Center, 2, 40)
KrathokKidsBit.lineTurn(Kids_LeftRight.Left, 50)
KrathokKidsBit.lineToJunction(Kids_Junction.Center, 1, 40)
```

## เซ็นเซอร์เดินตามเส้น

อ่านผ่านชิป ADS7828 (ADC 8 ช่อง 12 บิต) ที่อยู่ I2C `0x48` — `SCL` → P19, `SDA` → P20

ผังมาตรฐานของบล็อก `ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน`:

```
   ซ้าย ─────────────────────────► ขวา

   [2]    [1]  [0]  [7]  [6]    [5]
    ▲     └──── กลาง 4 ตัว ────┘    ▲
  ทางแยกซ้าย                 ทางแยกขวา
```

- เซ็นเซอร์กลาง 4 ตัวใช้คำนวณตำแหน่งเส้น (0-3000 ศูนย์กลาง 1500) ป้อนให้ PID
- เซ็นเซอร์ซ้าย/ขวาใช้ตรวจทางแยกเท่านั้น ไม่เข้าสูตร PID
- ช่อง 3 และ 4 ว่าง
- **ลำดับในอาเรย์กลางคือลำดับทางกายภาพซ้าย→ขวา** ไม่ใช่เลขเรียง ถ้าต่อสายต่างจากนี้ ให้ใช้บล็อก `LINESensorSET` กำหนดเอง

### ดูค่าเซ็นเซอร์บนจอ OLED

บล็อก 2 ตัวในกลุ่ม **จอ OLED → เซ็นเซอร์บนจอ** ช่วยให้เห็นว่าเซ็นเซอร์อ่านค่าอะไรอยู่ โดยไม่ต้องต่อสาย USB ดู serial

`จอ OLED แสดงค่าเซ็นเซอร์เส้น` — ตัวเลข

```
LINE SENSOR
L 2345
C 1200 900 850 1100      <- ค่าดิบจาก ADC
R 3012
% 12 95 98 20            <- แปลงแล้ว 100 = อยู่บนเส้น
POS 1480/3000            <- ตำแหน่งเส้นที่ป้อนให้ PID
```

`จอ OLED กราฟแท่งเซ็นเซอร์เส้น` — กราฟ

```
POS 1480
      ▐█▌ ▐█▌
   ▐▌ ▐█▌ ▐█▌
   ▐▌ ▐█▌ ▐█▌  ▐▌
───────────────────
      ███ ███        <- แถบทึบ = เซ็นเซอร์ตัวนั้นอยู่บนเส้น
```

แท่งเรียงตามตำแหน่งจริงซ้าย→ขวา (รวมเซ็นเซอร์ทางแยกซ้าย/ขวาด้วย) ยิ่งสูงยิ่งเห็นเส้นชัด

ถ้ายังไม่ได้สอนเซ็นเซอร์จะขึ้น `NOT CALIBRATED` และแสดงค่าดิบย่อส่วนแทน เพื่อให้ยังเช็คได้ว่าสายต่อครบไหม

ตัวอย่าง: เปิดดูค่าแบบสดๆ ระหว่างเลื่อนหุ่นบนสนาม

```blocks
KrathokKidsBit.oledInit(OLED_Address.Addr_0x3C)
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.lineCalibrate()
basic.forever(function () {
    KrathokKidsBit.oledLineSensorBars()
})
```

การสอนเซ็นเซอร์ (`สอนเซ็นเซอร์รู้จักเส้นและพื้น`): เสียงปี๊บ → วางบนเส้น กดปุ่ม A → วางบนพื้น กดปุ่ม A → เสียงสูง 2 ครั้ง = ผ่าน / **เสียงต่ำ 2 ครั้ง = ไม่ผ่าน** (เส้นกับพื้นให้ค่าเท่ากัน ต้องสอนใหม่)

## OLED 1.3 inch (SH1106 128x64 I2C)

Ported from Adafruit_SH110X (`Adafruit_SH1106G`) with the Adafruit GFX 5x7 font (English letters and numbers only).

Wiring: `VCC` → 3V3, `GND` → GND, `SCL` → P19, `SDA` → P20 (I2C address 0x3C, or 0x3D)

```blocks
KrathokKidsBit.oledShowLine("KrathokKidsBit", 1)
basic.forever(function () {
    KrathokKidsBit.oledShowValue("ADC0", KrathokKidsBit.kidsSensor(Kids_Sensor.ADC0), 3)
})
```

Tip (จอ OLED > เริ่มต้นจอ): turn `อัปเดตทันที` OFF, draw several shapes, then use `แสดงภาพที่วาด` once for faster drawing without flicker.
