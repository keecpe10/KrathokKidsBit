/**
 * บล็อกภาษาไทยแบบง่าย สำหรับนักเรียน ป.4-ป.6
 */

enum Kids_Move {
    //% block="เดินหน้า"
    Forward,
    //% block="ถอยหลัง"
    Backward,
    //% block="เลี้ยวซ้าย"
    TurnLeft,
    //% block="เลี้ยวขวา"
    TurnRight,
    //% block="หมุนซ้าย"
    SpinLeft,
    //% block="หมุนขวา"
    SpinRight
}

enum Kids_Direction {
    //% block="เดินหน้า"
    Forward,
    //% block="ถอยหลัง"
    Backward
}

enum Kids_LeftRight {
    //% block="ซ้าย"
    Left,
    //% block="ขวา"
    Right
}

enum Kids_Junction {
    //% block="ทางแยกซ้าย"
    Left,
    //% block="ทุกทางแยก"
    Center,
    //% block="ทางแยกขวา"
    Right
}

enum Kids_Then {
    //% block="หยุด"
    Stop,
    //% block="เลี้ยวซ้าย"
    TurnLeft,
    //% block="เลี้ยวขวา"
    TurnRight
}

enum Kids_CalMode {
    //% block="ลากผ่านเส้น"
    Sweep,
    //% block="วางทีละจุด (กดปุ่ม A)"
    Points
}

enum Kids_ArmAction {
    //% block="อ้าก้าม"
    OpenGrip,
    //% block="หนีบ"
    CloseGrip,
    //% block="ยกแขน"
    ArmUp,
    //% block="ลดแขน"
    ArmDown,
    //% block="จับแล้วยก"
    GripAndLift,
    //% block="วางแล้วปล่อย"
    PlaceAndRelease
}

enum Kids_Motor {
    //% block="1"
    M1 = 1,
    //% block="2"
    M2 = 2,
    //% block="3"
    M3 = 3,
    //% block="4"
    M4 = 4
}

enum Kids_MotorDir {
    //% block="ไปหน้า"
    Forward,
    //% block="ถอยหลัง"
    Backward
}

enum Kids_Servo {
    //% block="1"
    S0,
    //% block="2"
    S1,
    //% block="3"
    S2,
    //% block="4"
    S3,
    //% block="5"
    S4,
    //% block="6"
    S5,
    //% block="7"
    S6,
    //% block="8"
    S7
}

enum Kids_Band {
    //% block="ทุกช่วง"
    All = 3,
    //% block="ช้า (0-40)"
    Slow = 0,
    //% block="กลาง (41-60)"
    Medium = 1,
    //% block="เร็ว (61-100)"
    Fast = 2
}

enum Kids_Sensor {
    //% block="0"
    ADC0 = 0x84,
    //% block="1"
    ADC1 = 0xC4,
    //% block="2"
    ADC2 = 0x94,
    //% block="3"
    ADC3 = 0xD4,
    //% block="4"
    ADC4 = 0xA4,
    //% block="5"
    ADC5 = 0xE4,
    //% block="6"
    ADC6 = 0xB4,
    //% block="7"
    ADC7 = 0xF4
}

namespace KrathokKidsBit {
    // เกนแยกตามช่วงความเร็ว ตามแนวทางของโปรเจกต์ PT-BOT SPT
    // ดัชนี 0 = ช้า, 1 = กลาง, 2 = เร็ว
    // ค่าตั้งต้นเท่ากันทั้งสามช่วง เพื่อให้พฤติกรรมเดิมไม่เปลี่ยนจนกว่าจะจูน
    let kidsKPBand = [0.05, 0.05, 0.05]
    let kidsKDBand = [0.1, 0.1, 0.1]

    /**
     * ความเร็วนี้อยู่ช่วงไหน
     */
    function bandOf(speed: number): number {
        if (speed <= 40) return Kids_Band.Slow
        if (speed <= 60) return Kids_Band.Medium
        return Kids_Band.Fast
    }

    /**
     * ช่วงความเร็วของแต่ละแถบ ใช้ให้ตรงกับตัวเลือกในบล็อก "ปรับความไว ช่วง"
     */
    function bandRange(band: number): string {
        if (band == Kids_Band.Slow) return "0-40"
        if (band == Kids_Band.Medium) return "41-60"
        return "61-100"
    }

    /**
     * ชื่อ enum ที่ใช้ในโหมด JavaScript เพื่อให้ก๊อปบรรทัดไปวางได้เลย
     */
    function bandEnumName(band: number): string {
        if (band == Kids_Band.Slow) return "Kids_Band.Slow"
        if (band == Kids_Band.Medium) return "Kids_Band.Medium"
        return "Kids_Band.Fast"
    }

    function bandName(band: number): string {
        if (band == Kids_Band.Slow) return "SLOW"
        if (band == Kids_Band.Medium) return "MED"
        return "FAST"
    }

    function kpFor(speed: number): number {
        return kidsKPBand[bandOf(speed)]
    }

    function kdFor(speed: number): number {
        return kidsKDBand[bandOf(speed)]
    }
    let kidsLineWarned = false

    /**
     * ตั้งค่าเซ็นเซอร์ให้อัตโนมัติถ้ายังไม่ได้ตั้ง และเตือนถ้ายังไม่ได้สอนเซ็นเซอร์
     * (เตือนครั้งเดียว เพื่อไม่ให้ดังซ้ำเมื่อเรียกอยู่ในลูป)
     */
    function kidsLineReady(): void {
        if (Num_Sensor == 0) lineSetupStandard()
        if (!lineCalibrated() && !kidsLineWarned) {
            kidsLineWarned = true
            music.playTone(330, music.beat(BeatFraction.Quarter))
            music.playTone(247, music.beat(BeatFraction.Half))
            basic.showString("CAL")
        }
    }

    function kidsClamp(v: number, lo: number, hi: number): number {
        return Math.max(lo, Math.min(hi, v))
    }

    function kidsNormalize(deg: number): number {
        while (deg > 180) deg -= 360
        while (deg < -180) deg += 360
        return deg
    }

    // ================= เริ่มและหยุด =================

    /**
     * รอจนกดแล้วปล่อย เลือกได้ทั้งปุ่ม A B A+B และการสัมผัสโลโก้
     *
     * มีเสียงปี๊บก่อนแสดงไอคอนทั้งสองจังหวะ ตอนเริ่มรอและตอนกดแล้ว
     * ใช้เป็นจุดเริ่มของโปรแกรม จะได้วางหุ่นบนเส้นให้เรียบร้อยก่อนค่อยกดเริ่ม
     * กดค้างไว้ก็ไม่ข้ามไปยังบล็อก "รอกด" ตัวถัดไป
     * @param btn ปุ่มหรือการสัมผัสที่จะรอ
     * @param waiting ไอคอนระหว่างรอ
     * @param done ไอคอนหลังกดแล้ว
     */
    //% group="เริ่มและหยุด"
    //% weight=95
    //% block="รอกด $btn||ระหว่างรอแสดง $waiting กดแล้วแสดง $done"
    //% expandableArgumentMode="toggle"
    //% waiting.fieldEditor="imagedropdown" waiting.fieldOptions.columns="5"
    //% done.fieldEditor="imagedropdown" done.fieldOptions.columns="5"
    //% inlineInputMode=inline
    export function waitForButton(btn: Kids_Button, waiting: IconNames = IconNames.Happy, done: IconNames = IconNames.SmallHeart): void {
        // เสียงต่ำ = เริ่มรอ วาดไอคอนครั้งเดียวแล้วค่อยวนเช็คถี่ ๆ
        // ถ้าวาดซ้ำในลูป basic.showIcon จะหน่วงรอบละ 600 ms การกดสั้น ๆ จะหลุดได้
        music.playTone(659, music.beat(BeatFraction.Quarter))
        basic.showIcon(waiting, 0)
        kidsWaitDown(btn)
        // เสียงสูงและเปลี่ยนไอคอนทันทีที่กด ไม่ต้องรอปล่อย จะได้รู้สึกว่าตอบสนองทันที
        music.playTone(988, music.beat(BeatFraction.Quarter))
        basic.showIcon(done, 0)
        kidsWaitUp(btn)
    }

    // ================= เคลื่อนที่ =================

    /**
     * สั่งหุ่นยนต์เคลื่อนที่ ถ้าใส่เวลา (กด ⊕) จะเคลื่อนที่ตามเวลาแล้วหยุด
     * ถ้าไม่ใส่เวลา จะเคลื่อนที่ไปเรื่อยๆ จนกว่าจะสั่งหยุด
     * @param speed ความเร็ว 0-100
     * @param seconds เวลาเป็นวินาที 0 = ไปเรื่อยๆ
     */
    //% group="เคลื่อนที่พื้นฐาน"
    //% weight=100
    //% block="หุ่นยนต์ $move ความเร็ว $speed||นาน $seconds วินาที"
    //% expandableArgumentMode="toggle"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% seconds.min=0 seconds.defl=1
    //% inlineInputMode=inline
    export function robotMove(move: Kids_Move, speed: number, seconds: number = 0): void {
        speed = kidsClamp(speed, 0, 100)
        switch (move) {
            case Kids_Move.Forward: motorGo(speed, speed, speed, speed); break
            case Kids_Move.Backward: motorGo(-speed, -speed, -speed, -speed); break
            case Kids_Move.TurnLeft: Turn(_Turn.Left, speed); break
            case Kids_Move.TurnRight: Turn(_Turn.Right, speed); break
            case Kids_Move.SpinLeft: Spin(_Spin.Left, speed); break
            case Kids_Move.SpinRight: Spin(_Spin.Right, speed); break
        }
        if (seconds > 0) {
            basic.pause(seconds * 1000)
            motorStop()
        }
    }

    /**
     * หยุดหุ่นยนต์
     */
    //% group="เคลื่อนที่พื้นฐาน"
    //% weight=98
    //% block="หุ่นยนต์หยุด"
    export function robotStop(): void {
        motorStop()
    }

    /**
     * กำหนดความเร็วล้อซ้ายและล้อขวาเอง (ค่าติดลบ = หมุนถอยหลัง)
     */
    //% group="เคลื่อนที่แม่นยำ"
    //% weight=95
    //% block="ล้อซ้าย $left ล้อขวา $right"
    //% left.min=-100 left.max=100 left.defl=50
    //% right.min=-100 right.max=100 right.defl=50
    export function robotWheels(left: number, right: number): void {
        left = kidsClamp(left, -100, 100)
        right = kidsClamp(right, -100, 100)
        motorGo(left, left, right, right)
    }

    /**
     * หมุนตัวตามจำนวนองศา โดยใช้เซ็นเซอร์ทิศทาง (IMU)
     */
    //% group="เคลื่อนที่แม่นยำ"
    //% weight=96
    //% block="หุ่นยนต์หมุน $dir $degrees องศา ความเร็ว $speed"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% speed.min=20 speed.max=100 speed.defl=60
    export function robotSpinDegrees(dir: Kids_LeftRight, degrees: number, speed: number): void {
        degrees = kidsClamp(Math.abs(degrees), 0, 180)
        let now = anglesRead(Angle.Yaw)
        let target = dir == Kids_LeftRight.Right ? now + degrees : now - degrees
        spinDegrees(kidsNormalize(target), 80, 20, kidsClamp(speed, 20, 100))
    }

    /**
     * เดินตรงไม่เบี้ยว ตามเวลา (ใช้เซ็นเซอร์ทิศทาง IMU ช่วยคุมทิศ)
     */
    //% group="เคลื่อนที่แม่นยำ"
    //% weight=97
    //% block="หุ่นยนต์ $dir ตรงๆ ความเร็ว $speed นาน $seconds วินาที"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% seconds.min=0 seconds.defl=1
    export function robotStraightFor(dir: Kids_Direction, speed: number, seconds: number): void {
        let heading = anglesRead(Angle.Yaw)
        let d = dir == Kids_Direction.Forward ? Forward_Direction.Forward : Forward_Direction.Backward
        goWithDegreesTime(d, Math.max(0, seconds) * 1000, heading, kidsClamp(speed, 0, 100), 100, 2, 1)
    }

    // ================= มอเตอร์ =================

    /**
     * สั่งมอเตอร์ทีละตัว มอเตอร์ 1-2 คือล้อซ้าย มอเตอร์ 3-4 คือล้อขวา
     * ถ้าใส่เวลา (กด ⊕) จะหมุนตามเวลาแล้วหยุดเฉพาะมอเตอร์ตัวนี้
     * ถ้าไม่ใส่เวลา จะหมุนไปเรื่อยๆ จนกว่าจะสั่งหยุด
     * @param motor มอเตอร์ช่อง 1-4
     * @param dir ทิศที่หมุน
     * @param speed ความเร็ว 0-100
     * @param seconds เวลาเป็นวินาที 0 = หมุนไปเรื่อยๆ
     */
    //% group="มอเตอร์"
    //% weight=94
    //% block="มอเตอร์ $motor หมุน $dir ความเร็ว $speed||นาน $seconds วินาที"
    //% expandableArgumentMode="toggle"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% seconds.min=0 seconds.defl=1
    //% inlineInputMode=inline
    export function motorRun(motor: Kids_Motor, dir: Kids_MotorDir, speed: number, seconds: number = 0): void {
        speed = kidsClamp(speed, 0, 100)
        motorWriteChannel(motor, dir == Kids_MotorDir.Forward ? speed : -speed)
        if (seconds > 0) {
            basic.pause(seconds * 1000)
            motorWriteChannel(motor, 0)
        }
    }

    /**
     * หยุดมอเตอร์ตัวเดียว ตัวอื่นยังหมุนต่อ (หยุดทุกตัวใช้ "หุ่นยนต์หยุด")
     */
    //% group="มอเตอร์"
    //% weight=93
    //% block="มอเตอร์ $motor หยุด"
    export function motorOff(motor: Kids_Motor): void {
        motorWriteChannel(motor, 0)
    }

    // ================= เดินตามเส้น =================

    /**
     * ตั้งค่าเซ็นเซอร์เส้นแบบมาตรฐานของ PTKidsBIT Education Robot Kit
     * เซ็นเซอร์กลาง ช่อง 0-5 / ทางแยกซ้าย ช่อง 6 / ทางแยกขวา ช่อง 7
     * บล็อกเดินตามเส้นทุกตัวเรียกให้เองอัตโนมัติ จึงไม่ต้องมีบล็อก
     */
    export function lineSetupStandard(): void {
        LINESensorSET([0, 1, 2, 3, 4, 5], [6], [7], LED_Pin.Disable)
    }

    /**
     * สอนเซ็นเซอร์ให้รู้จักเส้นและพื้น
     * ลากผ่านเส้น: กดปุ่ม A แล้วลากหุ่นกลับไปกลับมาข้ามเส้นจนมีเสียง 2 ครั้ง
     * วางทีละจุด: เสียงปี๊บ → วางบนเส้น กดปุ่ม A → วางบนพื้น กดปุ่ม A → เสียงปี๊บ 2 ครั้ง = เสร็จ
     * @param mode วิธีสอน
     * @param seconds เวลาที่ใช้ลาก (ใช้กับแบบลากผ่านเส้นเท่านั้น)
     */
    //% group="ตั้งค่าเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=90
    //% block="สอนเซ็นเซอร์ แบบ $mode||ลากนาน $seconds วินาที"
    //% expandableArgumentMode="toggle"
    //% seconds.min=3 seconds.max=30 seconds.defl=8
    export function lineCalibrate(mode: Kids_CalMode, seconds: number = 8): void {
        if (Sensor_PIN.length == 0) lineSetupStandard()
        let all: number[] = []
        for (let p of Sensor_PIN) all.push(p)
        for (let p of Sensor_Left) if (all.indexOf(p) < 0) all.push(p)
        for (let p of Sensor_Right) if (all.indexOf(p) < 0) all.push(p)
        // สอนซ้ำได้หลายครั้ง ค่าใหม่เขียนทับค่าเดิม
        if (mode == Kids_CalMode.Sweep) SensorCalibrateSweep(all, seconds)
        else SensorCalibrate(all)
        kidsLineWarned = false
    }

    /**
     * เดินตามเส้นไปเรื่อย ๆ โดยคุมจังหวะเอง ไม่ต้องใส่ใน "วนซ้ำตลอดไป"
     *
     * ลูปของ "วนซ้ำตลอดไป" นอนรอบละ 20 ms บวกเวลาทำงานอีก จึงได้ราว 25 ms
     * และไม่คงที่ตามสิ่งอื่นที่วางไว้ในลูปเดียวกัน บล็อกนี้คุมคาบเองให้คงที่
     * และเร็วกว่า หุ่นจึงแก้ทิศได้ถี่ขึ้น นิ่งขึ้น และเข้าโค้งเนียนขึ้น
     *
     * บล็อกนี้ไม่คืนการทำงาน จะหยุดเมื่อสั่งหยุดทั้งหมดหรือกดรีเซท
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=88
    //% block="เดินตามเส้นตลอดไป ความเร็ว $speed"
    //% speed.min=0 speed.max=100 speed.defl=40
    export function lineFollowForever(speed: number): void {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        resetPID()
        while (true) {
            if (kidsHalted) break
            let mark = input.runningTime()
            Follower(speed, Math.min(100, speed * 2), kpFor(speed), kdFor(speed))
            pidWait(mark)
        }
    }

    /**
     * วัดระยะด้วยอัลตราโซนิก (Trig = P1, Echo = P2) ครั้งเดียว ไม่กรองค่า
     * รอคลื่นสะท้อนแค่ถึงระยะ maxCm เท่านั้น จึงไม่ทำให้ลูปเดินตามเส้นสะดุดนาน
     * คืน 0 ถ้าไม่มีอะไรอยู่ในระยะ
     */
    function pingCm(maxCm: number): number {
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.digitalWritePin(DigitalPin.P1, 0)
        control.waitMicros(2)
        pins.digitalWritePin(DigitalPin.P1, 1)
        control.waitMicros(10)
        pins.digitalWritePin(DigitalPin.P1, 0)
        return Math.idiv(pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCm * 58), 58)
    }

    /**
     * เดินตามเส้นไปเรื่อย ๆ จนเจอสิ่งกีดขวางใกล้กว่าระยะที่กำหนด แล้วเบรกหยุด
     * ใช้อัลตราโซนิก Trig = P1, Echo = P2 (เหมือนบล็อก "ระยะทาง")
     * วัดระยะทุก 40 ms และต้องเจอใกล้ 2 ครั้งติดกันถึงจะหยุด กันค่าหลอก
     * ถ้าวิ่งเร็ว หุ่นจะไถลต่ออีกนิดหลังเบรก ให้เผื่อระยะไว้
     * @param cm หยุดเมื่อเจอสิ่งกีดขวางใกล้กว่ากี่เซนติเมตร
     * @param speed ความเร็ว 0-100
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=87
    //% block="เดินตามเส้นไปจนเจอสิ่งกีดขวางใกล้กว่า $cm ซม. ความเร็ว $speed แล้วหยุด"
    //% cm.min=3 cm.max=100 cm.defl=15
    //% speed.min=0 speed.max=100 speed.defl=40
    //% inlineInputMode=inline
    export function lineToObstacle(cm: number, speed: number): void {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        cm = kidsClamp(cm, 3, 100)
        resetPID()
        let nextPing = 0
        let hits = 0
        while (!kidsHalted) {
            let mark = input.runningTime()
            Follower(speed, Math.min(100, speed * 2), kpFor(speed), kdFor(speed))
            if (mark >= nextPing) {
                nextPing = mark + 40
                let d = pingCm(cm + 10)
                hits = (d > 0 && d < cm) ? hits + 1 : 0
                if (hits >= 2) break
            }
            pidWait(mark)
        }
        if (!kidsHalted && speed > 0) {
            // เบรกด้วยการกลับทางมอเตอร์ช่วงสั้น ๆ แบบเดียวกับตอนหยุดที่ทางแยก
            motorGo(-100, -100, -100, -100)
            basic.pause(20)
        }
        motorStop()
    }

    /**
     * เดินตามเส้นไปจนเจอทางแยกตามจำนวนครั้ง แล้วหยุดหรือเลี้ยวต่อทันที
     * @param count จำนวนทางแยกที่จะนับ
     * @param speed ความเร็วตอนเดินตามเส้น
     * @param then ทำอะไรต่อเมื่อถึงทางแยก
     * @param turnSpeed ความเร็วตอนเลี้ยว
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=85
    //% block="เดินตามเส้นไปจนเจอ $junction จำนวน $count ครั้ง ความเร็ว $speed แล้ว $then||ความเร็วเลี้ยว $turnSpeed"
    //% expandableArgumentMode="toggle"
    //% count.min=1 count.defl=1
    //% speed.min=0 speed.max=100 speed.defl=40
    //% turnSpeed.min=0 turnSpeed.max=100 turnSpeed.defl=50
    //% inlineInputMode=inline
    export function lineToJunction(junction: Kids_Junction, count: number, speed: number, then: Kids_Then = Kids_Then.Stop, turnSpeed: number = 50): void {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        let find = junction == Kids_Junction.Left ? Find_Line.Left : (junction == Kids_Junction.Right ? Find_Line.Right : Find_Line.Center)
        ForwardLINECount(Forward_Direction.Forward, find, Math.max(1, Math.floor(count)), speed, Math.min(100, speed * 2), 20, kpFor(speed), kdFor(speed))
        motorStop()
        if (then == Kids_Then.TurnLeft) lineTurn(Kids_LeftRight.Left, turnSpeed)
        else if (then == Kids_Then.TurnRight) lineTurn(Kids_LeftRight.Right, turnSpeed)
    }

    /**
     * เดินตามเส้นตามเวลา (วินาที) แล้วหยุด
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=86
    //% block="เดินตามเส้น นาน $seconds วินาที ความเร็ว $speed"
    //% seconds.min=0 seconds.defl=1
    //% speed.min=0 speed.max=100 speed.defl=40
    export function lineFollowFor(seconds: number, speed: number): void {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        ForwardTIME(Forward_Direction.Forward, Math.max(0, seconds) * 1000, speed, Math.min(100, speed * 2), kpFor(speed), kdFor(speed))
    }

    /**
     * เลี้ยวที่ทางแยก หมุนตัวเร็วแล้วค่อยๆ ช้าลง หยุดเมื่อเซ็นเซอร์ตรงกลางคร่อมเส้นใหม่พอดี
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=84
    //% block="เลี้ยว $dir จนเจอเส้น ความเร็ว $speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    export function lineTurn(dir: Kids_LeftRight, speed: number): void {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        let slow = Math.max(20, Math.round(speed * 0.4))
        let turn = dir == Kids_LeftRight.Left ? Turn_Line.Left : Turn_Line.Right
        TurnLINEPro(turn, speed, slow, Math.round(speed * 0.4))
    }

    // ================= จูน PID =================
    //
    // วิธีเดียวกับโปรเจกต์ PT-BOT SPT: ไล่ค่าทีละ 4 ค่า วัด "การส่าย" ของหุ่น
    // แล้วเลือกค่าที่ส่ายน้อยที่สุด ทำตามลำดับ
    //   1) จูน KP โดยปิด KD  -> ได้แค่ค่าตั้งต้น เพราะไม่มีแรงหน่วง KP สูงจะแกว่งเสมอ
    //   2) จูน KD โดยใช้ KP นั้น
    //   3) จูน KP ซ้ำโดยคงค่า KD ไว้ -> ค่านี้คือค่าที่เอาไปใช้จริง
    // ข้ามขั้นที่ 3 ไม่ได้ ค่าจากขั้นที่ 1 ต่ำกว่าความจริงเสมอ

    // คาบของลูปจูน ตั้งให้เท่ากับ basic.forever เพื่อให้ค่า KD ที่ได้ใช้กับ
    // "ตลอดไป + เดินตามเส้น" ได้ตรง ๆ  ถ้าเปลี่ยนคาบลูป ต้องจูน KD ใหม่
    let kidsTuneSeconds = 4

    function fmt2(v: number): string {
        let r = Math.round(v * 100)
        let whole = Math.idiv(r, 100)
        let frac = Math.abs(r % 100)
        return whole + "." + (frac < 10 ? "0" + frac : "" + frac)
    }

    /**
     * หน่วงเวลาโดยเช็คปุ่ม B ทุก 20 ms คืน true ถ้ากดระหว่างรอ
     */
    function pauseUntilB(ms: number): boolean {
        let steps = Math.idiv(ms, 20)
        for (let i = 0; i < steps; i++) {
            if (input.buttonIsPressed(Button.B)) return true
            basic.pause(20)
        }
        return false
    }

    /**
     * รอกดปุ่ม B โดยกระพริบตัว B สลับกับลูกศรชี้ไปทางปุ่ม
     * ปุ่ม B อยู่ทางขวาของบอร์ด ลูกศรจึงชี้ไปทางตะวันออก
     */
    function waitButtonBHint(): void {
        // ปล่อยปุ่มที่ค้างมาจากก่อนหน้าก่อน
        while (input.buttonIsPressed(Button.B)) basic.pause(20)
        while (!input.buttonIsPressed(Button.B)) {
            // ลูกศร: interval 0 ผ่าน showImage คือวาดแล้วค้างไว้ ไม่ลบเอง
            basic.showArrow(ArrowNames.East, 0)
            if (pauseUntilB(600)) break
            // ตัว B: ใช้เวลาแสดงจริงไม่ใช่ 0 เพราะ showString ที่ 0 อาจผ่านไปเร็วจนไม่ทันเห็น
            basic.showString("B", 400)
            if (pauseUntilB(200)) break
        }
        while (input.buttonIsPressed(Button.B)) basic.pause(20)
        basic.pause(100)
        basic.clearScreen()
    }

    function tuneSay(line: number, text: string): void {
        serial.writeLine(text)
        // เขียนจอเฉพาะตอนที่จอเริ่มทำงานแล้ว จะได้ไม่ไปปลุกจอที่ไม่ได้ต่อไว้
        if (oledIsReady() && line >= 1 && line <= 8) oledShowLine(text, line)
    }

    /**
     * วิ่งตามเส้นด้วยค่าที่กำหนด แล้ววัดว่าส่ายเท่าไร
     * คืน [ส่ายเฉลี่ย, ส่ายมากสุด] หน่วยเดียวกับค่าตำแหน่งเส้น ยิ่งน้อยยิ่งดี
     */
    function tuneScore(kp: number, kd: number, speed: number, ms: number): number[] {
        resetPID()
        let sum = 0
        let count = 0
        let worst = 0
        let stop = input.runningTime() + ms
        while (input.runningTime() < stop) {
            let mark = input.runningTime()
            Follower(speed, Math.min(100, speed * 2), kp, kd)
            let e = Math.abs(error)
            sum += e
            if (e > worst) worst = e
            count += 1
            // คาบเดียวกับตอนวิ่งจริง ค่าที่จูนได้จึงเอาไปใช้ได้ตรง ๆ
            pidWait(mark)
        }
        motorStop()
        if (count == 0) return [0, 0]
        return [Math.round(sum / count), worst]
    }

    /**
     * ไล่ 4 ค่าแล้วสรุปว่าค่าไหนส่ายน้อยที่สุด
     */
    /**
     * ยังอยู่บนเส้นอยู่ไหม ใช้ตัดสินว่าต้องให้คนมาวางหุ่นใหม่หรือวิ่งต่อได้เลย
     */
    function onLineNow(): boolean {
        if (!lineCalibrated()) return false
        let raw = readCenterRaw()
        for (let i = 0; i < raw.length; i++) {
            let v = pins.map(raw[i], Color_Line[i], Color_Background[i], 1000, 0)
            if (v >= 500) return true
        }
        return false
    }

    /**
     * พร้อมจูนหรือยัง ถ้ายังไม่ได้สอนเซ็นเซอร์ก็วัดการส่ายไม่ได้ จูนไปก็ไม่มีความหมาย
     */
    function tuneReady(): boolean {
        kidsLineReady()
        if (lineCalibrated()) return true
        serial.writeLine(">>> NOT CALIBRATED - teach the sensors first")
        if (oledIsReady()) {
            oledClear()
            oledShowLine("CANNOT TUNE", 1)
            oledShowLine("sensors not taught", 2)
            oledShowLine("run calibrate first", 4)
        }
        music.playTone(262, music.beat(BeatFraction.Half))
        music.playTone(196, music.beat(BeatFraction.Half))
        basic.showString("CAL?")
        return false
    }

    /**
     * บอกว่าทำไมวัดไม่ได้ ดูจากค่าที่ normalize แล้วของเซ็นเซอร์กลาง
     * ถ้าทุกตัวออกมาเท่ากันสุดขอบ แปลว่าค่าคาลิเบรตไม่ครอบค่าที่อ่านได้จริง
     */
    function calDiagnosis(): string {
        let raw = readCenterRaw()
        if (raw.length == 0) return "NO SENSOR SETUP"
        let allLine = true
        let allFloor = true
        let rawText = ""
        for (let i = 0; i < raw.length; i++) {
            let v = pins.map(raw[i], Color_Line[i], Color_Background[i], 1000, 0)
            if (v < 900) allLine = false
            if (v > 100) allFloor = false
            rawText += " " + raw[i]
        }
        serial.writeLine(">>> raw now:" + rawText)
        serial.writeLine(">>> taught line " + Color_Line[0] + " ground " + Color_Background[0])
        if (allLine) return "ALL READ AS LINE"
        if (allFloor) return "ALL READ AS FLOOR"
        return "ROBOT NOT MOVING?"
    }

    /**
     * ไล่ 4 ค่า คืน [ค่าที่ชนะ, ขนาดก้าว, เข้าเกณฑ์ noise แล้วหรือยัง 1/0, วัดได้จริงไหม 1/0]
     */
    function tuneSweep(label: string, kdFixed: boolean, speed: number, from: number, to: number): number[] {
        kidsLineReady()
        speed = kidsClamp(speed, 0, 100)
        let lo = Math.min(from, to)
        let hi = Math.max(from, to)
        let step = (hi - lo) / 3
        let values = [lo, lo + step, lo + step * 2, hi]
        let means: number[] = []
        let peaks: number[] = []

        serial.writeLine("== TUNE " + label + " " + bandName(bandOf(speed)) + " speed " + speed + " ==")
        for (let i = 0; i < 4; i++) {
            let band = bandOf(speed)
            let kp = label == "KP" ? values[i] : kidsKPBand[band]
            let kd = label == "KP" ? (kdFixed ? kidsKDBand[band] : 0) : values[i]
            if (oledIsReady()) oledClear()
            tuneSay(1, "TUNE " + label + " " + bandName(bandOf(speed)) + " " + (i + 1) + "/4")
            tuneSay(2, label + " = " + fmt2(values[i]))
            // ถ้าหุ่นยังคร่อมเส้นอยู่ (สนามเป็นวงรอบ) ก็วิ่งต่อได้เลย ไม่ต้องรอคน
            if (onLineNow()) {
                tuneSay(3, "on line, going on")
                music.playTone(784, music.beat(BeatFraction.Quarter))
                basic.pause(800)
            }
            else {
                tuneSay(3, "put on line, press A")
                music.playTone(784, music.beat(BeatFraction.Quarter))
                waitButtonA()
            }
            let r = tuneScore(kp, kd, speed, kidsTuneSeconds * 1000)
            means.push(r[0])
            peaks.push(r[1])
            serial.writeLine(label + " " + fmt2(values[i]) + " avg " + r[0] + " max " + r[1])
            tuneSay(4, "avg " + r[0] + " max " + r[1])
            music.playTone(587, music.beat(BeatFraction.Quarter))
        }

        let best = 0
        for (let i = 1; i < 4; i++) if (means[i] < means[best]) best = i
        let spread = 0
        for (let i = 0; i < 4; i++) {
            let d = means[i] - means[best]
            if (d > spread) spread = d
        }

        if (oledIsReady()) oledClear()
        tuneSay(1, "TUNE " + label + " " + bandName(bandOf(speed)) + " done")
        for (let i = 0; i < 4; i++) {
            tuneSay(2 + i, (i == best ? ">" : " ") + fmt2(values[i]) + " a" + means[i] + " m" + peaks[i])
        }
        // ถ้าคะแนนเท่ากันเป๊ะทั้งสี่ค่า หรือส่ายเฉลี่ยเป็น 0 แปลว่าไม่ได้วัดอะไรเลย
        // เช่น ยังไม่ได้สอนเซ็นเซอร์ หุ่นไม่ขยับ หรือเซ็นเซอร์อ่านค่าเดิมตลอด
        // กรณีนี้ตัวเลือก "ดีที่สุด" จะกลายเป็นค่าน้อยสุดของช่วงเสมอ ซึ่งไม่มีความหมาย
        let allSame = true
        for (let i = 1; i < 4; i++) if (means[i] != means[0]) allSame = false
        let valid = (means[best] == 0 || allSame) ? 0 : 1

        serial.writeLine(">>> BEST " + label + " = " + fmt2(values[best]))
        tuneSay(6, "BEST " + fmt2(values[best]))
        // เกณฑ์เดียวกับโปรเจกต์ต้นแบบ: ถ้าสี่ค่าต่างกันน้อยกว่าความคลาดเคลื่อนของการวัด
        // ไล่ซ้ำต่อไปก็ได้แค่ noise
        if (valid == 0) {
            serial.writeLine(">>> NOTHING WAS MEASURED - all four scored the same")
            let why = calDiagnosis()
            serial.writeLine(">>> " + why)
            tuneSay(7, why)
        }
        else if (spread <= Math.max(2, Math.idiv(means[best] * 15, 100))) {
            serial.writeLine(">>> ALL FOUR WITHIN NOISE - USE THIS VALUE")
            tuneSay(7, "ALL SAME - USE IT")
        }
        else {
            tuneSay(7, "narrow range, redo")
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))
        music.playTone(988, music.beat(BeatFraction.Quarter))
        let quiet = spread <= Math.max(2, Math.idiv(means[best] * 15, 100)) ? 1 : 0
        return [values[best], step, quiet, valid]
    }

    /**
     * ไล่ค่าซ้ำ หุบช่วงรอบค่าที่ชนะทุกครั้ง จนกว่าจะเข้าเกณฑ์ noise หรือครบจำนวนรอบ
     */
    function tuneNarrow(label: string, kdFixed: boolean, speed: number, lo: number, hi: number, rounds: number): number {
        let best = lo
        for (let r = 0; r < rounds; r++) {
            serial.writeLine("-- " + label + " round " + (r + 1) + " : " + fmt2(lo) + " .. " + fmt2(hi))
            let res = tuneSweep(label, kdFixed, speed, lo, hi)
            if (res[3] == 0) {
                // วัดไม่ได้ ไม่เอาค่าที่ได้ไปใช้ คืน -1 ให้ผู้เรียกรู้ว่าล้มเหลว
                serial.writeLine("-- " + label + " ABORTED, nothing measured")
                return -1
            }
            best = res[0]
            if (res[2] == 1) {
                serial.writeLine("-- " + label + " settled after round " + (r + 1))
                break
            }
            // ช่วงใหม่กว้างข้างละหนึ่งก้าวเดิม = แคบลงเหลือสองในสามของเดิม
            lo = Math.max(0, best - res[1])
            hi = best + res[1]
        }
        return best
    }

    /**
     * จูนครบทั้งสามขั้นในบล็อกเดียว และหุบช่วงให้เองจนกว่าจะเข้าเกณฑ์ noise
     * ผลลงช่วงความเร็วที่ตรงกับความเร็วที่ทดสอบ
     * ระหว่างจูน ถ้าหุ่นยังคร่อมเส้นอยู่จะวิ่งต่อเอง ถ้าหลุดเส้นจะรอให้กดปุ่ม A
     * @param speed ความเร็วที่จะใช้จริง 0-100
     * @param rounds ไล่ซ้ำได้มากสุดกี่รอบต่อหนึ่งขั้น
     */
    //% group="สั่งเดินตามเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=80
    //% block="จูนอัตโนมัติ ความเร็ว $speed รอบสูงสุดต่อขั้น $rounds"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% rounds.min=1 rounds.max=5 rounds.defl=2
    //% inlineInputMode=inline
    export function lineAutoTune(speed: number, rounds: number): void {
        if (!tuneReady()) return
        speed = kidsClamp(speed, 0, 100)
        rounds = Math.max(1, Math.min(5, Math.floor(rounds)))
        let band = bandOf(speed)
        let name = bandName(band)

        // รอกดปุ่ม B ก่อน จะได้วางหุ่นบนเส้นและเตรียมตัวให้พร้อมก่อนหุ่นออกวิ่ง
        if (oledIsReady()) oledClear()
        tuneSay(1, "AUTO TUNE " + name)
        tuneSay(2, "speed " + speed + " rounds " + rounds)
        tuneSay(3, "put on line")
        tuneSay(4, "press B to start")
        music.playTone(587, music.beat(BeatFraction.Quarter))
        waitButtonBHint()
        music.playTone(784, music.beat(BeatFraction.Quarter))

        serial.writeLine("===== AUTO TUNE " + name + " speed " + speed + " =====")

        // เก็บค่าเดิมไว้ ถ้าจูนล้มเหลวกลางทางจะได้คืนค่าเดิมแทนที่จะทิ้งค่าขยะไว้
        let keepKP = kidsKPBand[band]
        let keepKD = kidsKDBand[band]

        // ขั้นที่ 1 หา KP โดยปิด KD ได้แค่ค่าตั้งต้น
        kidsKDBand[band] = 0
        let step1 = tuneNarrow("KP", false, speed, 0.02, 0.20, rounds)
        if (step1 >= 0) kidsKPBand[band] = step1

        // ขั้นที่ 2 หา KD โดยใช้ KP จากขั้นที่ 1
        let step2 = step1 < 0 ? -1 : tuneNarrow("KD", true, speed, 0, 8, rounds)
        if (step2 >= 0) kidsKDBand[band] = step2

        // ขั้นที่ 3 หา KP ซ้ำโดยคงค่า KD ค่านี้คือค่าที่ใช้จริง
        let step3 = step2 < 0 ? -1 : tuneNarrow("KP", true, speed, 0.02, 0.40, rounds)
        if (step3 >= 0) kidsKPBand[band] = step3

        if (step3 < 0) {
            // ล้มเหลว คืนค่าเดิม ไม่เขียนทับด้วยค่าที่ไม่มีความหมาย
            kidsKPBand[band] = keepKP
            kidsKDBand[band] = keepKD
            serial.writeLine("===== AUTO TUNE " + name + " FAILED - gains unchanged =====")
            let why = calDiagnosis()
            serial.writeLine(">>> " + why)
            if (oledIsReady()) {
                oledClear()
                oledShowLine("AUTO TUNE FAILED", 1)
                oledShowLine(why, 2)
                if (why == "ALL READ AS LINE" || why == "ALL READ AS FLOOR") {
                    oledShowLine("cal range is wrong", 4)
                    oledShowLine("measure real values", 5)
                    oledShowLine("with sensor blocks", 6)
                }
                oledShowLine("gains not changed", 8)
            }
            music.playTone(262, music.beat(BeatFraction.Half))
            music.playTone(196, music.beat(BeatFraction.Half))
            basic.showString("FAIL")
            return
        }

        let kpText = fmt2(kidsKPBand[band])
        let kdText = fmt2(kidsKDBand[band])
        serial.writeLine("===== AUTO TUNE " + name + " DONE =====")
        serial.writeLine("band " + name + " (speed " + bandRange(band) + ")  KP " + kpText + "  KD " + kdText)
        // บรรทัดนี้ก๊อปไปวางในโหมด JavaScript ได้ทันที
        serial.writeLine(">>> COPY THIS LINE INTO YOUR PROGRAM:")
        serial.writeLine("KrathokKidsBit.lineTuning(" + bandEnumName(band) + ", " + kpText + ", " + kdText + ")")

        music.playTone(784, music.beat(BeatFraction.Quarter))
        music.playTone(988, music.beat(BeatFraction.Quarter))
        music.playTone(1175, music.beat(BeatFraction.Half))

        // ค้างหน้าสรุปไว้จนกว่าจะกดปุ่ม A จะได้มีเวลาจดค่าลงบล็อก "ปรับความไว ช่วง"
        if (oledIsReady()) {
            oledClear()
            oledShowLine("AUTO TUNE DONE", 1)
            oledShowLine("band " + name + " " + bandRange(band), 2)
            oledShowLine("KP " + kpText, 4)
            oledShowLine("KD " + kdText, 5)
            oledShowLine("put in block", 7)
            oledShowLine("prabkwamwai chuang", 8)
        }
        while (!input.buttonIsPressed(Button.A)) {
            // เลื่อนค่าบนจอ micro:bit ซ้ำไปเรื่อย ๆ เผื่อหุ่นไม่ได้ต่อจอ OLED
            basic.showString("KP " + kpText + " KD " + kdText)
            if (input.buttonIsPressed(Button.A)) break
            basic.pause(300)
        }
        while (input.buttonIsPressed(Button.A)) basic.pause(20)
        basic.clearScreen()
    }

    /**
     * ปรับความไวในการเดินตามเส้น เลือกได้ว่าจะใช้กับทุกช่วงความเร็ว หรือเฉพาะช่วงเดียว
     * หุ่นจะหยิบค่าของช่วงที่ตรงกับความเร็วที่สั่งไปใช้เอง
     * ค่าที่ได้จากบล็อก "จูนอัตโนมัติ" เอามาใส่บล็อกนี้ได้เลย
     * @param band ช่วงความเร็ว
     * @param kp ค่า KP
     * @param kd ค่า KD
     */
    //% group="ตั้งค่าเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=87
    //% block="ปรับความไว ช่วง $band KP $kp KD $kd"
    //% kp.defl=0.05 kd.defl=0.1
    //% inlineInputMode=inline
    export function lineTuning(band: Kids_Band, kp: number, kd: number): void {
        for (let i = 0; i < 3; i++) {
            if (band == Kids_Band.All || band == i) {
                kidsKPBand[i] = kp
                kidsKDBand[i] = kd
            }
        }
    }

    /**
     * ปรับวิธีอ่านเส้น
     *
     * ความนุ่ม (0-95): ตำแหน่งเส้นกระโดดเป็นขั้นเวลาเซ็นเซอร์เข้าหรือออกจากเกณฑ์
     * ตัว D จึงเด้งเป็นหนาม ทำให้เข้าโค้งกระตุก ค่านี้คุมว่าจะปาดหนามลงแค่ไหน
     * 0 = ไม่กรองเลย มากไปหุ่นจะตอบสนองช้าและเริ่มส่าย แนะนำ 40-70
     *
     * เกณฑ์เห็นเส้น (10-900): ค่าสูงนับเฉพาะตัวที่เห็นเส้นชัด ๆ หุ่นอาจกระตุก
     * ค่าต่ำนับตัวที่เห็นแค่ขอบด้วย ตำแหน่งเปลี่ยนต่อเนื่องกว่า
     * แต่ถ้าต่ำเกินไปจะไวต่อคราบสกปรกบนพื้น แนะนำ 80-200
     * @param smooth ความนุ่มการหักเลี้ยว 0-95
     * @param threshold เกณฑ์นับว่าเห็นเส้น 10-900
     */
    //% group="ตั้งค่าเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=86
    //% block="ปรับการอ่านเส้น ความนุ่ม $smooth เกณฑ์เห็นเส้น $threshold"
    //% smooth.min=0 smooth.max=95 smooth.defl=50
    //% threshold.min=10 threshold.max=900 threshold.defl=200
    //% inlineInputMode=inline
    export function lineReading(smooth: number, threshold: number): void {
        D_Filter = kidsClamp(smooth, 0, 95)
        Sensor_On_Threshold = kidsClamp(threshold, 10, 900)
    }

    // ================= เซ็นเซอร์ =================

    /**
     * ระยะทางจากเซ็นเซอร์อัลตราโซนิก (Trig = P1, Echo = P2) หน่วยเซนติเมตร
     */
    //% group="ระยะทาง"
    //% subcategory="เซ็นเซอร์"
    //% weight=80
    //% block="ระยะทาง (ซม.)"
    export function kidsDistance(): number {
        return distanceRead(Ultrasonic_PIN.P1, Ultrasonic_PIN.P2)
    }

    /**
     * เป็นจริงเมื่อมีสิ่งกีดขวางใกล้กว่าระยะที่กำหนด
     */
    //% group="ระยะทาง"
    //% subcategory="เซ็นเซอร์"
    //% weight=79
    //% block="เจอสิ่งกีดขวางใกล้กว่า $cm ซม."
    //% cm.min=1 cm.max=400 cm.defl=15
    export function kidsObstacle(cm: number): boolean {
        let d = kidsDistance()
        return d > 0 && d < cm
    }

    /**
     * ค่าจากเซ็นเซอร์ช่อง 0-7 (0-4095)
     */
    //% group="เซ็นเซอร์เส้น"
    //% subcategory="เซ็นเซอร์"
    //% weight=78
    //% block="ค่าเซ็นเซอร์ช่อง $ch"
    export function kidsSensor(ch: Kids_Sensor): number {
        return ADCRead(<number>ch)
    }

    /**
     * ทิศทางของหุ่นยนต์ -180 ถึง 180 องศา (ค่าบวก = หันไปทางขวา)
     */
    //% group="ทิศทาง"
    //% subcategory="เซ็นเซอร์"
    //% weight=77
    //% block="ทิศทางหุ่นยนต์ (องศา)"
    export function kidsHeading(): number {
        return Math.round(anglesRead(Angle.Yaw))
    }

    /**
     * ตั้งให้ทิศที่หุ่นยนต์หันอยู่ตอนนี้ = 0 องศา
     */
    //% group="ทิศทาง"
    //% subcategory="เซ็นเซอร์"
    //% weight=76
    //% block="ตั้งทิศทางตอนนี้เป็น 0 องศา"
    export function kidsResetHeading(): void {
        setAngleOffset(Angle.Yaw)
    }

    // ================= เซอร์โว =================

    // ================= แขนและก้าม =================
    // ค่าเริ่มต้นอ้างจากชุด PT KidsBIT (ก้ามที่เซอร์โวช่อง 1 เปิด 175 หนีบ 5)
    // ส่วนมุมแขนเป็นค่ากลาง ๆ ต้องตั้งให้ตรงกับหุ่นของตัวเองก่อนใช้งานจริง
    let gripServo = Kids_Servo.S0
    let gripOpen = 175
    let gripClose = 5
    let armServo = Kids_Servo.S1
    let armUp = 90
    let armDown = 20
    let armStepMs = 400

    /**
     * ตั้งค่าแขนกล ว่าก้ามหนีบกับแขนยกอยู่เซอร์โวช่องไหน และใช้มุมเท่าไร
     * @param gripServoCh ช่องเซอร์โวของก้าม
     * @param open มุมตอนอ้าก้าม
     * @param close มุมตอนหนีบ
     * @param armServoCh ช่องเซอร์โวของแขน
     * @param up มุมตอนยกแขน
     * @param down มุมตอนลดแขน
     * @param ms เวลารอให้เซอร์โวขยับถึงที่ต่อหนึ่งท่า ถ้าแขนหนักหรือขยับไกลให้เพิ่มเวลา
     */
    //% group="แขนและก้าม"
    //% subcategory="เซอร์โว"
    //% weight=69
    //% block="ตั้งค่าแขนกล ก้ามช่อง $gripServoCh เปิด $open หนีบ $close|แขนช่อง $armServoCh ยก $up ลง $down||รอท่าละ $ms มิลลิวินาที"
    //% expandableArgumentMode="toggle"
    //% gripServoCh.defl=Kids_Servo.S0 armServoCh.defl=Kids_Servo.S1
    //% open.shadow="protractorPicker" open.defl=175
    //% close.shadow="protractorPicker" close.defl=5
    //% up.shadow="protractorPicker" up.defl=90
    //% down.shadow="protractorPicker" down.defl=20
    //% ms.shadow="timePicker" ms.defl=400
    //% inlineInputMode=inline
    export function armSetup(gripServoCh: Kids_Servo, open: number, close: number, armServoCh: Kids_Servo, up: number, down: number, ms: number = 400): void {
        gripServo = gripServoCh
        gripOpen = kidsClamp(open, 0, 180)
        gripClose = kidsClamp(close, 0, 180)
        armServo = armServoCh
        armUp = kidsClamp(up, 0, 180)
        armDown = kidsClamp(down, 0, 180)
        armStepMs = Math.max(0, ms)
    }

    // ขยับเซอร์โวหนึ่งท่า แล้วรอให้ถึงที่
    function armMove(servo: Kids_Servo, degrees: number): void {
        kidsServo(servo, degrees)
        basic.pause(armStepMs)
    }

    /**
     * สั่งแขนกลทำท่าที่เลือก
     * จับแล้วยก = อ้าก้าม → ลดแขน → หนีบ → ยกแขน
     * วางแล้วปล่อย = ลดแขน → อ้าก้าม → ยกแขน
     */
    //% group="แขนและก้าม"
    //% subcategory="เซอร์โว"
    //% weight=68
    //% block="แขนกล $action"
    export function armDo(action: Kids_ArmAction): void {
        switch (action) {
            case Kids_ArmAction.OpenGrip: armMove(gripServo, gripOpen); break
            case Kids_ArmAction.CloseGrip: armMove(gripServo, gripClose); break
            case Kids_ArmAction.ArmUp: armMove(armServo, armUp); break
            case Kids_ArmAction.ArmDown: armMove(armServo, armDown); break
            case Kids_ArmAction.GripAndLift:
                armMove(gripServo, gripOpen)
                armMove(armServo, armDown)
                armMove(gripServo, gripClose)
                armMove(armServo, armUp)
                break
            case Kids_ArmAction.PlaceAndRelease:
                armMove(armServo, armDown)
                armMove(gripServo, gripOpen)
                armMove(armServo, armUp)
                break
        }
    }

    /**
     * หมุนเซอร์โวไปที่มุม 0-180 องศา
     */
    //% group="เซอร์โว"
    //% subcategory="เซอร์โว"
    //% weight=70
    //% block="เซอร์โวช่อง $servo หมุนไปที่ $degrees องศา"
    //% degrees.shadow="protractorPicker" degrees.defl=90
    export function kidsServo(servo: Kids_Servo, degrees: number): void {
        servoWrite(<number>servo, kidsClamp(degrees, 0, 180))
    }
}
