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

Each call takes two button presses:
* Place the selected sensors on the line, press Button A, wait for the tone.
* Place the same sensors on the floor, press Button A, wait for the tone.
* Two high tones mean the calibration passed. Two low tones mean the line and the floor read the same value, so it has to be redone.

Calibration is stored per ADC channel, so it can be split across several calls and run in any order relative to `LINESensorSET`.

```blocks
KrathokKidsBit.SensorCalibrate([0, 1, 2, 3, 4, 5])
KrathokKidsBit.SensorCalibrate([6, 7])
```

### LINESensorSET Block

Use PTKidsBIT's LINESensorSET block for select the ADC channel connected to the sensor.

* LINESensorSET is ADC channels between `0` to `7` for line follower sensor.
* Sensor Left is ADC channels between `0` to `7` for sensor left.
* Sensor Right is ADC channels between `0` to `7` for sensor right.
* The ON OFF Sensor, `Pin` or `Disable` must be selected for the sensor on or off.

```blocks
KrathokKidsBit.LINESensorSET(
    [0, 1, 2, 3, 4, 5],
    [6],
    [7],
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
| **เดินตามเส้น** | ตั้งค่าเส้น | ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน · สอนเซ็นเซอร์รู้จักเส้นและพื้น · ตั้งค่าเซ็นเซอร์ช่อง _ · ตั้งค่าเซ็นเซอร์ทุกช่อง · ค่าคาลิเบรตช่อง _ · ส่งค่าเซ็นเซอร์เส้นไปคอมพิวเตอร์ · ใช้เส้นแบบ _ · ไฟเซ็นเซอร์เส้น เปิด/ปิด · ปรับความไว KP/KD |
| | จูน PID | จูนอัตโนมัติ · จูน KP (ปิด KD) · จูน KD · จูน KP (คง KD) · วัดการส่าย · ค่าความไวตอนนี้ |
| | สั่งเดินตามเส้น | เดินตามเส้น ความเร็ว _ · เดินตามเส้น นาน _ วินาที · เดินตามเส้นไปจนเจอทางแยก _ ครั้ง · เลี้ยว ซ้าย/ขวา จนเจอเส้น |
| **เซ็นเซอร์** | ระยะทาง | ระยะทาง (ซม.) · เจอสิ่งกีดขวางใกล้กว่า _ ซม. |
| | เซ็นเซอร์เส้น | ค่าเซ็นเซอร์ช่อง _ |
| | ทิศทาง | ทิศทางหุ่นยนต์ (องศา) · ตั้งทิศทางตอนนี้เป็น 0 องศา |
| **เซอร์โว** | เซอร์โว | เซอร์โวช่อง 1-8 หมุนไปที่ _ องศา |
| **จอ OLED** | เริ่มต้นจอ | เริ่มใช้จอ · ล้างจอ · แสดงภาพที่วาด · อัปเดตทันที เปิด/ปิด |
| | ข้อความและตัวเลข | แสดงข้อความ/ตัวเลข บรรทัดที่ 1-8 · แสดง ชื่อ = ค่า · แสดงตัวใหญ่ · เขียนข้อความ/ตัวเลขที่ x,y |
| | วาดรูป | วาดจุด · วาดเส้นตรง · วาดสี่เหลี่ยม · วาดวงกลม · แถบพลัง |
| | ตั้งค่าจอ | กลับสีทั้งจอ · ความสว่าง · เปิด/ปิดจอ · หมุนจอ 180 องศา |
| | เซ็นเซอร์บนจอ | แสดงค่าเซ็นเซอร์เส้น · แสดงค่าเซ็นเซอร์รายช่อง · กราฟแท่งเซ็นเซอร์เส้น |

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

หมายเลขช่องที่ใส่ใน `LINESensorSET` และ `SensorCalibrate` คือ **0-7** เลขนอกช่วงนี้จะถูกตัดทิ้งพร้อมเสียงเตือนและขึ้น `PIN?` บนหน้าจอ micro:bit

ส่วนบล็อก `ตั้งค่าเซ็นเซอร์ช่อง` และ `ค่าคาลิเบรตช่อง` ช่องเซ็นเซอร์เป็น**ดรอปดาวน์ 0-7** เลือกได้เลยไม่ต้องพิมพ์ และยังลากตัวแปรมาเสียบแทนได้ถ้าต้องการวนลูปอ่านทีละช่อง

ผังมาตรฐานของบล็อก `ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน` ตรงกับ **PTKidsBIT Education Robot Kit**:

```
   ซ้าย ───────────────────────────────► ขวา

   [6]   [0] [1] [2] [3] [4] [5]   [7]
    ▲    └───── กลาง 6 ตัว ─────┘    ▲
  ทางแยกซ้าย                    ทางแยกขวา
```

- เซ็นเซอร์กลาง 6 ตัวใช้คำนวณตำแหน่งเส้น (0-5000 ศูนย์กลาง 2500) ป้อนให้ PID
- เซ็นเซอร์ซ้าย/ขวาใช้ตรวจทางแยกเท่านั้น ไม่เข้าสูตร PID

**ลำดับในอาเรย์กลางคือลำดับทางกายภาพซ้าย→ขวา** ไม่ใช่เลขเรียงเฉยๆ ถ้าหุ่นเลี้ยวผิดข้าง แปลว่าลำดับกลับด้าน ให้ใช้ `LINESensorSET` กำหนดเองแบบกลับลำดับ:

```blocks
KrathokKidsBit.LINESensorSET([5, 4, 3, 2, 1, 0], [6], [7], LED_Pin.Disable)
```

ตรวจลำดับได้เร็วๆ ด้วยบล็อก `จอ OLED กราฟแท่งเซ็นเซอร์เส้น` — วางเส้นใต้เซ็นเซอร์ตัวซ้ายสุด ถ้าแท่งที่สูงขึ้นอยู่ทางซ้ายของจอ แปลว่าลำดับถูกแล้ว

### จูนหาค่า KP / KD

ทำตามวิธีของโปรเจกต์ PT-BOT SPT — ไล่ค่าทีละ 4 ค่า วัด "การส่าย" ของหุ่น แล้วเลือกค่าที่ส่ายน้อยที่สุด

**เกนแยกตามช่วงความเร็ว** เหมือนต้นทาง หุ่นจะหยิบค่าของช่วงที่ตรงกับความเร็วที่สั่งไปใช้เอง

| ช่วง | ความเร็ว | เทียบต้นทาง (สเกล 0-255) |
|---|---|---|
| ช้า | 0-40 | 0-100 |
| กลาง | 41-60 | 101-150 |
| เร็ว | 61-100 | 151-255 |

ตัวจูนเขียนผลลงช่วงที่ตรงกับความเร็วที่ทดสอบให้เอง — **จูนที่ความเร็วเท่าไร ก็ได้ช่วงนั้น** ต้องไล่แยกทีละช่วงที่จะใช้จริง

#### ทางลัด: จูนอัตโนมัติ

บล็อกเดียวรันครบทั้งสามขั้น หุบช่วงให้เองทุกรอบ และหยุดเมื่อเข้าเกณฑ์ noise

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.lineCalibrate()
KrathokKidsBit.lineAutoTune(80, 2)
```

```
AUTO TUNE FAST
KP 0.14
KD 4.00
write these down
```

**เริ่มด้วยการกดปุ่ม B** วางบล็อกแล้วหุ่นจะยังไม่ออกวิ่งทันที — จะขึ้น `press B to start` บนจอ OLED ส่วนจอ micro:bit จะกระพริบ**ลูกศรชี้ไปทางปุ่ม B** สลับกับตัว `B` ให้วางหุ่นบนเส้นและถอยห่างก่อน

**ระหว่างจูนไม่ต้องเฝ้าตลอด** ถ้าหุ่นยังคร่อมเส้นอยู่ (สนามเป็นวงรอบ) จะวิ่งต่อเอง รอกดปุ่ม A เฉพาะตอนหลุดเส้นเท่านั้น

| ปุ่ม | ใช้ตอนไหน |
|---|---|
| **B** | เริ่มการจูนทั้งชุด กดครั้งเดียวตอนเริ่ม |
| **A** | วางหุ่นกลับบนเส้นแล้ว ไปต่อ กดเฉพาะตอนหลุดเส้น |

`รอบสูงสุดต่อขั้น` คุมว่าจะไล่ซ้ำได้มากสุดกี่รอบก่อนยอมจบ:

| รอบสูงสุด | รอบวิ่งมากสุด | เวลาวิ่งรวม |
|---|---|---|
| 1 | 12 | ~50 วินาที |
| **2** (ค่าตั้งต้น) | 24 | ~1.5 นาที |
| 3 | 36 | ~2.5 นาที |

ปกติจะจบเร็วกว่านี้ เพราะขั้นไหนเข้าเกณฑ์ noise ก่อนก็หยุดขั้นนั้นทันที

ช่วงเริ่มต้นที่ใช้: KP `0.02–0.20` (ขั้น 1) · KD `0–8` · KP `0.02–0.40` (ขั้น 3) — ทุกรอบช่วงจะแคบลงเหลือสองในสามของเดิม โดยขยับไปคร่อมค่าที่ชนะ และขยายออกนอกช่วงเดิมได้ถ้าค่าที่ชนะอยู่ริมสุด

#### หรือทำทีละขั้นเอง

**ลำดับที่ถูกต้องคือ 1 → 2 → 3 ข้ามขั้นที่ 3 ไม่ได้**

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.lineCalibrate()
// จูนช่วงช้า
KrathokKidsBit.lineTuneKpNoKd(30, 0.02, 0.2)
KrathokKidsBit.lineTuneKd(30, 0, 8)
KrathokKidsBit.lineTuneKpWithKd(30, 0.02, 0.4)
// จูนช่วงเร็ว แยกอีกรอบ
KrathokKidsBit.lineTuneKpNoKd(80, 0.02, 0.2)
KrathokKidsBit.lineTuneKd(80, 0, 8)
KrathokKidsBit.lineTuneKpWithKd(80, 0.02, 0.4)
```

| ขั้น | บล็อก | ได้อะไร |
|---|---|---|
| 1 | `จูน KP (ปิด KD)` | **แค่ค่าตั้งต้น** — ไม่มีแรงหน่วง KP สูงจะแกว่งเสมอ ตัววัดจึงลงโทษ KP สูงทุกครั้ง ค่าที่ได้จึงต่ำกว่าความจริง |
| 2 | `จูน KD` | ค่า KD ที่คู่กับ KP นั้น |
| 3 | `จูน KP (คง KD)` | **ค่าที่เอาไปใช้จริง** |

แต่ละขั้นจะหยุดถามก่อนวิ่งทุกครั้ง — วางหุ่นบนเส้นแล้วกดปุ่ม A หุ่นวิ่ง 4 วินาที แล้วรายงานผล

```
TUNE KP done
 0.02 a210 m2500
 0.08 a 85 m 400
>0.14 a 60 m 300
 0.20 a120 m 700
BEST 0.14
```

`a` = ส่ายเฉลี่ย · `m` = ส่ายมากสุด · `>` = ค่าที่ชนะ **ยิ่งน้อยยิ่งดี** และบล็อกจะตั้งค่าที่ชนะให้อัตโนมัติ

ถ้าขึ้น `ALL SAME - USE IT` แปลว่าทั้งสี่ค่าต่างกันน้อยกว่าความคลาดเคลื่อนของการวัด ไล่ซ้ำต่อไปก็ได้แค่ noise — **ใช้ค่านั้นได้เลย** ถ้ายังไม่ขึ้น ให้ไล่ซ้ำโดยหุบช่วงให้แคบลงรอบค่าที่ชนะ

บล็อกอื่นในกลุ่มนี้:

| บล็อก | ใช้ทำอะไร |
|---|---|
| `วัดการส่าย ความเร็ว _ นาน _ วินาที` | วัดค่าปัจจุบันโดยไม่ไล่ค่า คืนค่าส่ายเฉลี่ย |
| `ค่าความไว ช่วง _ (KP/KD)` | อ่านค่าที่จูนได้ไปจดไว้ |
| `ปรับความไว ช่วง _ KP _ KD _` | ใส่ค่าที่จดไว้กลับเข้าไปทีละช่วง |
| `ปรับความไวเดินตามเส้น KP _ KD _` | ตั้งให้เหมือนกันทั้งสามช่วงในทีเดียว |

> **KD ผูกกับคาบลูป** ตัวจูนใช้คาบ 20 ms เท่ากับบล็อก `ตลอดไป` ค่าที่ได้จึงใช้กับ `ตลอดไป → เดินตามเส้น` ได้ตรง ถ้าเอา `เดินตามเส้น` ไปวางในลูปที่เร็วหรือช้ากว่านี้ ต้องจูน KD ใหม่
>
> **KD เพิ่มตามความเร็ว ไม่ใช่ลดลง** ต้นทางวัดได้ว่าที่ความเร็วกลางใช้ KD น้อยกว่าที่ความเร็วสูง จูนแยกทีละช่วง อย่าคำนวณจากสูตร

ค่าตั้งต้นทั้งสามช่วงเท่ากันหมด (KP 0.05 KD 0.1) โปรแกรมที่เขียนไว้ก่อนหน้านี้จึงทำงานเหมือนเดิมทุกประการจนกว่าจะจูน

### ใส่ค่าคาลิเบรตเองแทนการสอนทุกครั้ง

การสอนเซ็นเซอร์ด้วยปุ่ม A อ่านค่าให้อัตโนมัติ แต่ต้องทำใหม่ทุกครั้งก่อนปล่อยหุ่น ถ้ารู้ค่าอยู่แล้วใส่ตรงๆ ได้เลย

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.setSensorCal(0, 0, 4090)
KrathokKidsBit.setSensorCal(1, 0, 4090)
```

หรือถ้าเซ็นเซอร์ทุกตัวช่วงค่าใกล้เคียงกัน ใส่ทีเดียวจบ

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.setAllSensorCal(120, 3800)
```

**วิธีหาค่าที่จะใส่ แบบที่ 1 — ดูใน Show data**

```blocks
KrathokKidsBit.lineSetupStandard()
basic.forever(function () {
    KrathokKidsBit.lineSensorToSerial()
    basic.pause(200)
})
```

ต่อสาย USB แล้วกด **Show data → Device** ในเอดิเตอร์ จะเห็นค่าแยกเป็นคอลัมน์ `ch0` ถึง `ch7` กราฟได้ และดาวน์โหลดเป็น CSV ได้

ถ้าไม่สะดวกต่อสาย ใช้บล็อก `จอ OLED แสดงค่าเซ็นเซอร์รายช่อง` ดูบนหุ่นได้เลย ให้ข้อมูลชุดเดียวกัน

```
LINE SENSOR
CH0 1200      CH4  980
CH1  900      CH5 1050
CH2  850      CH6 3011
CH3 1100      CH7 2998
POS 2480
```

วางหุ่นให้เซ็นเซอร์อยู่**บนเส้น (ดำ)** จดค่าไว้ แล้วย้ายไป**บนพื้น (ขาว)** จดอีกชุด — ชื่อคอลัมน์คือหมายเลขช่อง จึงเอาไปใส่บล็อกได้ตรงๆ

```
เห็น ch0 บนเส้น 120 บนพื้น 3800
   -> ตั้งค่าเซ็นเซอร์ช่อง 0 บนเส้น 120 บนพื้น 3800
```

> บล็อก `PrintSensorValue` ในหมวด more... ก็ส่งค่าออก serial เหมือนกัน แต่ส่งเป็นข้อความล้วน (`Sensor Center: 1200 900 ...`) ซึ่ง Show data แยกคอลัมน์และพล็อตกราฟไม่ได้ ถ้าจะจดค่าไปใส่เอง ใช้บล็อกภาษาไทยด้านบนสะดวกกว่า

**วิธีหาค่าที่จะใส่ แบบที่ 2** — สอนเซ็นเซอร์หนึ่งครั้ง แล้วอ่านค่ากลับมาจดไว้

```blocks
KrathokKidsBit.lineSetupStandard()
KrathokKidsBit.lineCalibrate()
basic.forever(function () {
    KrathokKidsBit.oledShowValue("CH0 line", KrathokKidsBit.getSensorCal(0, Cal_Which.Line), 1)
    KrathokKidsBit.oledShowValue("CH0 gnd", KrathokKidsBit.getSensorCal(0, Cal_Which.Ground), 2)
})
```

ครั้งต่อไปใช้ `ตั้งค่าเซ็นเซอร์ช่อง _` แทน `สอนเซ็นเซอร์รู้จักเส้นและพื้น` ได้เลย ไม่ต้องกดปุ่ม A

| หมายเหตุ | |
|---|---|
| ค่าที่ใส่ | 0-4095 (นอกช่วงนี้จะถูกตัดให้อยู่ในช่วง) |
| `บนเส้น` กับ `บนพื้น` | ใส่ตามที่อ่านได้จริง ตัวไหนมากกว่าก็ได้ ไม่จำเป็นต้องเรียง |
| ใส่ค่าเท่ากันทั้งคู่ | ระบบถ่างให้ 1 หน่วยกันหารด้วยศูนย์ แต่เซ็นเซอร์ตัวนั้นจะแยกเส้นกับพื้นไม่ออก |

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

### ลำดับการตั้งค่ากับการคาลิเบรต

ค่าคาลิเบรตถูกเก็บตาม**หมายเลขช่อง ADC** ไม่ใช่ตามลำดับในอาเรย์ จึงทำได้ทั้งสองแบบ:

```blocks
// แบบที่ 1 - ตั้งค่าก่อน แล้วคาลิเบรตรอบเดียว
KrathokKidsBit.LINESensorSET([0, 1, 2, 3, 4, 5], [6], [7], LED_Pin.Disable)
KrathokKidsBit.SensorCalibrate([0, 1, 2, 3, 4, 5, 6, 7])
```

```blocks
// แบบที่ 2 - คาลิเบรตแยกรอบก่อน แล้วค่อยตั้งค่า (ตามคู่มือ PT KidsBIT)
KrathokKidsBit.SensorCalibrate([0, 1, 2, 3, 4, 5])
KrathokKidsBit.SensorCalibrate([6, 7])
KrathokKidsBit.LINESensorSET([0, 1, 2, 3, 4, 5], [6], [7], LED_Pin.Disable)
```

คาลิเบรตแยกหลายรอบได้ ช่องที่ไม่ได้วัดในรอบนั้นจะคงค่าเดิมไว้ และคาลิเบรตซ้ำกี่รอบก็ได้

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

ถ้าติดตั้งจอกลับหัว ใช้ `จอ OLED หมุนจอ 180 องศา` กลับภาพได้ วางไว้ก่อน `เริ่มใช้จอ OLED` ก็ได้ ค่าจะไม่หายตอนจอเริ่มทำงาน

```blocks
KrathokKidsBit.oledRotate180(true)
KrathokKidsBit.oledInit(OLED_Address.Addr_0x3C)
KrathokKidsBit.oledShowLine("KrathokKidsBit", 1)
```

Tip (จอ OLED > เริ่มต้นจอ): turn `อัปเดตทันที` OFF, draw several shapes, then use `แสดงภาพที่วาด` once for faster drawing without flicker.
