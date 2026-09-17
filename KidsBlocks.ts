/**
 * บล็อกภาษาไทยแบบง่าย สำหรับนักเรียน ป.4-ป.6
 * (บล็อกเดิมทั้งหมดยังใช้ได้ อยู่ในหมวด "เพิ่มเติม" ของ KrathokKidsBit)
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
    let kidsKP = 0.05
    let kidsKD = 0.1

    function kidsClamp(v: number, lo: number, hi: number): number {
        return Math.max(lo, Math.min(hi, v))
    }

    function kidsNormalize(deg: number): number {
        while (deg > 180) deg -= 360
        while (deg < -180) deg += 360
        return deg
    }

    // ================= เคลื่อนที่ =================

    /**
     * สั่งหุ่นยนต์เคลื่อนที่ไปเรื่อยๆ จนกว่าจะสั่งหยุด
     * @param speed ความเร็ว 0-100
     */
    //% group="เคลื่อนที่"
    //% block="หุ่นยนต์ $move ความเร็ว $speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% weight=100
    export function robotMove(move: Kids_Move, speed: number): void {
        speed = kidsClamp(speed, 0, 100)
        switch (move) {
            case Kids_Move.Forward: motorGo(speed, speed, speed, speed); break
            case Kids_Move.Backward: motorGo(-speed, -speed, -speed, -speed); break
            case Kids_Move.TurnLeft: Turn(_Turn.Left, speed); break
            case Kids_Move.TurnRight: Turn(_Turn.Right, speed); break
            case Kids_Move.SpinLeft: Spin(_Spin.Left, speed); break
            case Kids_Move.SpinRight: Spin(_Spin.Right, speed); break
        }
    }

    /**
     * สั่งหุ่นยนต์เคลื่อนที่ตามเวลา (วินาที) แล้วหยุด
     */
    //% group="เคลื่อนที่"
    //% block="หุ่นยนต์ $move ความเร็ว $speed นาน $seconds วินาที"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% seconds.min=0 seconds.defl=1
    //% weight=99
    export function robotMoveFor(move: Kids_Move, speed: number, seconds: number): void {
        robotMove(move, speed)
        basic.pause(Math.max(0, seconds) * 1000)
        motorStop()
    }

    /**
     * หยุดหุ่นยนต์
     */
    //% group="เคลื่อนที่"
    //% block="หุ่นยนต์หยุด"
    //% weight=98
    export function robotStop(): void {
        motorStop()
    }

    /**
     * กำหนดความเร็วล้อซ้ายและล้อขวาเอง (ค่าติดลบ = หมุนถอยหลัง)
     */
    //% group="เคลื่อนที่"
    //% block="ล้อซ้าย $left ล้อขวา $right"
    //% left.min=-100 left.max=100 left.defl=50
    //% right.min=-100 right.max=100 right.defl=50
    //% weight=97
    export function robotWheels(left: number, right: number): void {
        left = kidsClamp(left, -100, 100)
        right = kidsClamp(right, -100, 100)
        motorGo(left, left, right, right)
    }

    /**
     * หมุนตัวตามจำนวนองศา โดยใช้เซ็นเซอร์ทิศทาง (IMU)
     */
    //% group="เคลื่อนที่"
    //% block="หุ่นยนต์หมุน $dir $degrees องศา ความเร็ว $speed"
    //% degrees.min=0 degrees.max=180 degrees.defl=90
    //% speed.min=20 speed.max=100 speed.defl=60
    //% weight=96
    export function robotSpinDegrees(dir: Kids_LeftRight, degrees: number, speed: number): void {
        degrees = kidsClamp(Math.abs(degrees), 0, 180)
        let now = anglesRead(Angle.Yaw)
        let target = dir == Kids_LeftRight.Right ? now + degrees : now - degrees
        spinDegrees(kidsNormalize(target), 80, 20, kidsClamp(speed, 20, 100))
    }

    /**
     * เดินตรงไม่เบี้ยว ตามเวลา (ใช้เซ็นเซอร์ทิศทาง IMU ช่วยคุมทิศ)
     */
    //% group="เคลื่อนที่"
    //% block="หุ่นยนต์ $dir ตรงๆ ความเร็ว $speed นาน $seconds วินาที"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% seconds.min=0 seconds.defl=1
    //% weight=95
    export function robotStraightFor(dir: Kids_Direction, speed: number, seconds: number): void {
        let heading = anglesRead(Angle.Yaw)
        let d = dir == Kids_Direction.Forward ? Forward_Direction.Forward : Forward_Direction.Backward
        goWithDegreesTime(d, Math.max(0, seconds) * 1000, heading, kidsClamp(speed, 0, 100), 100, 2, 1)
    }

    // ================= เดินตามเส้น =================

    /**
     * ตั้งค่าเซ็นเซอร์เส้นแบบมาตรฐาน: เซ็นเซอร์กลาง ช่อง 1,0,7,6 / ซ้าย ช่อง 2 / ขวา ช่อง 5
     */
    //% group="เดินตามเส้น"
    //% block="ตั้งค่าเซ็นเซอร์เส้น แบบมาตรฐาน"
    //% weight=90
    export function lineSetupStandard(): void {
        LINESensorSET([1, 0, 7, 6], [2], [5], LED_Pin.Disable)
    }

    /**
     * สอนเซ็นเซอร์: เสียงปี๊บ → วางเซ็นเซอร์บนเส้น กดปุ่ม A → วางบนพื้น กดปุ่ม A → เสียงปี๊บ 2 ครั้ง = เสร็จ
     */
    //% group="เดินตามเส้น"
    //% block="สอนเซ็นเซอร์รู้จักเส้นและพื้น (กดปุ่ม A)"
    //% weight=89
    export function lineCalibrate(): void {
        if (Sensor_PIN.length == 0) lineSetupStandard()
        let all: number[] = []
        for (let p of Sensor_PIN) all.push(p)
        for (let p of Sensor_Left) if (all.indexOf(p) < 0) all.push(p)
        for (let p of Sensor_Right) if (all.indexOf(p) < 0) all.push(p)
        // ล้างค่าเก่า เพื่อให้สอนใหม่ได้หลายครั้ง
        Color_Line = []
        Color_Line_Left = []
        Color_Line_Right = []
        Color_Background = []
        Color_Background_Left = []
        Color_Background_Right = []
        SensorCalibrate(all)
    }

    /**
     * เดินตามเส้น 1 จังหวะ (ใส่ไว้ในบล็อก "วนซ้ำตลอดไป")
     */
    //% group="เดินตามเส้น"
    //% block="เดินตามเส้น ความเร็ว $speed"
    //% speed.min=0 speed.max=100 speed.defl=40
    //% weight=88
    export function lineFollow(speed: number): void {
        speed = kidsClamp(speed, 0, 100)
        Follower(speed, Math.min(100, speed * 2), kidsKP, kidsKD)
    }

    /**
     * เดินตามเส้นไปจนเจอทางแยกตามจำนวนครั้ง แล้วหยุด
     */
    //% group="เดินตามเส้น"
    //% block="เดินตามเส้นไปจนเจอ $junction จำนวน $count ครั้ง ความเร็ว $speed"
    //% count.min=1 count.defl=1
    //% speed.min=0 speed.max=100 speed.defl=40
    //% weight=87
    export function lineToJunction(junction: Kids_Junction, count: number, speed: number): void {
        speed = kidsClamp(speed, 0, 100)
        let find = junction == Kids_Junction.Left ? Find_Line.Left : (junction == Kids_Junction.Right ? Find_Line.Right : Find_Line.Center)
        ForwardLINECount(Forward_Direction.Forward, find, Math.max(1, Math.floor(count)), speed, Math.min(100, speed * 2), 20, kidsKP, kidsKD)
    }

    /**
     * เดินตามเส้นตามเวลา (วินาที) แล้วหยุด
     */
    //% group="เดินตามเส้น"
    //% block="เดินตามเส้น นาน $seconds วินาที ความเร็ว $speed"
    //% seconds.min=0 seconds.defl=1
    //% speed.min=0 speed.max=100 speed.defl=40
    //% weight=86
    export function lineFollowFor(seconds: number, speed: number): void {
        speed = kidsClamp(speed, 0, 100)
        ForwardTIME(Forward_Direction.Forward, Math.max(0, seconds) * 1000, speed, Math.min(100, speed * 2), kidsKP, kidsKD)
    }

    /**
     * เลี้ยวที่ทางแยก หมุนตัวจนเซ็นเซอร์ตรงกลางเจอเส้นใหม่
     */
    //% group="เดินตามเส้น"
    //% block="เลี้ยว $dir จนเจอเส้น ความเร็ว $speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% weight=85
    export function lineTurn(dir: Kids_LeftRight, speed: number): void {
        if (Num_Sensor == 0) lineSetupStandard()
        let half = Math.max(1, Math.idiv(Num_Sensor, 2))
        if (dir == Kids_LeftRight.Left) {
            TurnLINE(Turn_Line.Left, kidsClamp(speed, 0, 100), half, 200, 20)
        } else {
            TurnLINE(Turn_Line.Right, kidsClamp(speed, 0, 100), Math.min(Num_Sensor, half + 1), 200, 20)
        }
    }

    /**
     * สำหรับครู: ปรับค่าความไวในการเดินตามเส้น (ค่าเริ่มต้น KP 0.05, KD 0.1)
     */
    //% group="เดินตามเส้น"
    //% block="ปรับความไวเดินตามเส้น KP $kp KD $kd"
    //% kp.defl=0.05 kd.defl=0.1
    //% advanced=true
    export function lineTuning(kp: number, kd: number): void {
        kidsKP = kp
        kidsKD = kd
    }

    // ================= เซ็นเซอร์ =================

    /**
     * ระยะทางจากเซ็นเซอร์อัลตราโซนิก (Trig = P1, Echo = P2) หน่วยเซนติเมตร
     */
    //% group="เซ็นเซอร์"
    //% block="ระยะทาง (ซม.)"
    //% weight=80
    export function kidsDistance(): number {
        return distanceRead(Ultrasonic_PIN.P1, Ultrasonic_PIN.P2)
    }

    /**
     * เป็นจริงเมื่อมีสิ่งกีดขวางใกล้กว่าระยะที่กำหนด
     */
    //% group="เซ็นเซอร์"
    //% block="เจอสิ่งกีดขวางใกล้กว่า $cm ซม."
    //% cm.min=1 cm.max=400 cm.defl=15
    //% weight=79
    export function kidsObstacle(cm: number): boolean {
        let d = kidsDistance()
        return d > 0 && d < cm
    }

    /**
     * ค่าจากเซ็นเซอร์ช่อง 0-7 (0-4095)
     */
    //% group="เซ็นเซอร์"
    //% block="ค่าเซ็นเซอร์ช่อง $ch"
    //% weight=78
    export function kidsSensor(ch: Kids_Sensor): number {
        return ADCRead(<number>ch)
    }

    /**
     * ทิศทางของหุ่นยนต์ -180 ถึง 180 องศา (ค่าบวก = หันไปทางขวา)
     */
    //% group="เซ็นเซอร์"
    //% block="ทิศทางหุ่นยนต์ (องศา)"
    //% weight=77
    export function kidsHeading(): number {
        return Math.round(anglesRead(Angle.Yaw))
    }

    /**
     * ตั้งให้ทิศที่หุ่นยนต์หันอยู่ตอนนี้ = 0 องศา
     */
    //% group="เซ็นเซอร์"
    //% block="ตั้งทิศทางตอนนี้เป็น 0 องศา"
    //% weight=76
    export function kidsResetHeading(): void {
        setAngleOffset(Angle.Yaw)
    }

    // ================= เซอร์โว =================

    /**
     * หมุนเซอร์โวไปที่มุม 0-180 องศา
     */
    //% group="เซอร์โว"
    //% block="เซอร์โวช่อง $servo หมุนไปที่ $degrees องศา"
    //% degrees.shadow="protractorPicker" degrees.defl=90
    //% weight=70
    export function kidsServo(servo: Kids_Servo, degrees: number): void {
        servoWrite(<number>servo, kidsClamp(degrees, 0, 180))
    }
}
