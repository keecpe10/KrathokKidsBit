/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

let Sensor_PIN: number[] = []
let Sensor_Left: number[] = []
let Sensor_Right: number[] = []
let Num_Sensor = 0
let LED_PIN = 0

let PCA = 0x40
let initI2C = false
let SERVOS = 0x06
let Color_Line: number[] = []
let Color_Background: number[] = []
let Color_Line_Left: number[] = []
let Color_Background_Left: number[] = []
let Color_Line_Right: number[] = []
let Color_Background_Right: number[] = []
const ADS7828_ADDR = 0x48   // ADS7828 ตั้งได้ 0x48-0x4B ด้วยขา A0/A1
const ADC_V2_ADDR = 0x49    // บอร์ดรุ่นใหม่ใช้ ADC อีกตัวที่ 0x49 คืนค่า 8 บิต
// 0 = ยังไม่ได้ตรวจ, 1 = 0x48 คืน 12 บิต (0-4095), 2 = 0x49 คืน 8 บิต (0-255)
let adcVersion = 0
// ตั้งเป็น true แล้วจะไม่มีทางกลับเป็น false ได้อีกจนกว่าจะรีเซทหรือเปิดเครื่องใหม่
let kidsHalted = false
let Line_Mode = 0
let Last_Position = 0
let error = 0
let P = 0
let D = 0
let previous_error = 0
let D_Smooth = 0            // ค่า D หลังกรอง ใช้จริงในการคิด PD
let D_Filter = 50           // 0 = ไม่กรอง (เหมือนเดิม) ยิ่งมากยิ่งกรองหนัก
let Sensor_On_Threshold = 200   // ต่ำกว่านี้ถือว่าเซ็นเซอร์ตัวนั้นไม่เห็นเส้น
let PD_Value = 0
let left_motor_speed = 0
let right_motor_speed = 0
let distance = 0
let timer = 0

let BNO055_I2C_ADDR = 0x29
let BNO055_OPR_MODE = 0x3D
let OPERATION_MODE_IMUPLUS = 0X08
let EULER_R_LSB = 0x1C
let EULER_R_MSB = 0x1D
let EULER_P_LSB = 0x1E
let EULER_P_MSB = 0x1F
let EULER_Y_LSB = 0x1A
let EULER_Y_MSB = 0x1B
let initIMU = false
let angle_offset: number[] = [0, 0, 0]

enum _Turn {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum _Spin {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum Servo_Write {
    //% block="S0"
    S0,
    //% block="S1"
    S1,
    //% block="S2"
    S2,
    //% block="S3"
    S3,
    //% block="S4"
    S4,
    //% block="S5"
    S5,
    //% block="S6"
    S6,
    //% block="S7"
    S7
}

enum Ultrasonic_PIN {
    //% block="P1"
    P1,
    //% block="P2"
    P2
}

enum ADC_Read {
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

enum Kids_Button {
    //% block="A"
    A,
    //% block="B"
    B,
    //% block="A+B"
    AB,
    //% block="สัมผัสโลโก้"
    Logo
}

enum Forward_Direction {
    //% block="Forward"
    Forward,
    //% block="Backward"
    Backward
}

enum Find_Line {
    //% block="Left"
    Left,
    //% block="Center"
    Center,
    //% block="Right"
    Right
}

enum LED_Pin {
    //% block="Disable"
    Disable,
    //% block="P1"
    P1,
    //% block="P2"
    P2,
    //% block="P8"
    P8,
    //% block="P12"
    P12
}

enum Turn_Line {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum Cal_Which {
    //% block="บนเส้น"
    Line,
    //% block="บนพื้น"
    Ground
}

enum Angle {
    //% block="Yaw"
    Yaw,
    //% block="Pitch"
    Pitch,
    //% block="Roll"
    Roll
}

//% color="#51cbc7" icon="\u2B9A" block="KrathokKidsBit"
//% groups='["เริ่มและหยุด", "เคลื่อนที่พื้นฐาน", "เคลื่อนที่แม่นยำ", "ตั้งค่าเส้น", "สั่งเดินตามเส้น", "ระยะทาง", "เซ็นเซอร์เส้น", "ทิศทาง", "เซอร์โว", "แขนและก้าม", "เริ่มต้นจอ", "ข้อความและตัวเลข", "วาดรูป", "ตั้งค่าจอ", "เซ็นเซอร์บนจอ"]'
//% subcategories='["เดินตามเส้น", "เซ็นเซอร์", "เซอร์โว", "จอ OLED"]'
namespace KrathokKidsBit {
    /**
     * รอจนกดปุ่ม A แล้วปล่อย ป้องกันการกดค้างข้ามไปยังขั้นตอนถัดไป
     */
    export function waitButton(btn: Button): void {
        waitButtonDown(btn)
        waitButtonUp(btn)
    }

    /**
     * รอจนมีการกดปุ่มครั้งใหม่
     * ถ้าปุ่มยังค้างจากขั้นก่อนหน้า จะรอให้ปล่อยก่อนแล้วค่อยนับว่าเป็นการกดใหม่
     */
    export function waitButtonDown(btn: Button): void {
        while (input.buttonIsPressed(btn)) basic.pause(20)
        while (!input.buttonIsPressed(btn)) basic.pause(20)
    }

    /** รอจนปล่อยปุ่ม กันไม่ให้การกดค้างข้ามไปยังขั้นตอนถัดไป */
    export function waitButtonUp(btn: Button): void {
        while (input.buttonIsPressed(btn)) basic.pause(20)
        basic.pause(100)
    }

    /**
     * กำลังกดอยู่ไหม รองรับทั้งปุ่ม A B A+B และการสัมผัสโลโก้
     * สัมผัสโลโก้มีเฉพาะ micro:bit V2 บน V1 จะได้ false เสมอ
     */
    export function kidsButtonPressed(btn: Kids_Button): boolean {
        if (btn == Kids_Button.Logo) return input.logoIsPressed()
        if (btn == Kids_Button.B) return input.buttonIsPressed(Button.B)
        if (btn == Kids_Button.AB) return input.buttonIsPressed(Button.AB)
        return input.buttonIsPressed(Button.A)
    }

    /** รอจนมีการกดครั้งใหม่ ถ้ายังกดค้างอยู่จะรอให้ปล่อยก่อน */
    export function kidsWaitDown(btn: Kids_Button): void {
        while (kidsButtonPressed(btn)) basic.pause(20)
        while (!kidsButtonPressed(btn)) basic.pause(20)
    }

    /** รอจนปล่อย กันไม่ให้การกดค้างข้ามไปยังขั้นตอนถัดไป */
    export function kidsWaitUp(btn: Kids_Button): void {
        while (kidsButtonPressed(btn)) basic.pause(20)
        basic.pause(100)
    }

    export function waitButtonA(): void {
        waitButton(Button.A)
    }

    /**
     * เปิด/ปิดไฟ LED ของแผงเซ็นเซอร์เส้น ตามขาที่ตั้งไว้ใน LINESensorSET
     */
    function setLineLED(on: boolean): void {
        if (LED_PIN == LED_Pin.Disable) return
        let pin = DigitalPin.P1
        if (LED_PIN == LED_Pin.P2) pin = DigitalPin.P2
        else if (LED_PIN == LED_Pin.P8) pin = DigitalPin.P8
        else if (LED_PIN == LED_Pin.P12) pin = DigitalPin.P12
        pins.digitalWritePin(pin, on ? 1 : 0)
    }

    // คลังค่าคาลิเบรต เก็บตาม "หมายเลขช่อง ADC" 0-7 เป็นแหล่งข้อมูลจริงเพียงที่เดียว
    // Color_* ทั้งหมดถูกสร้างจากคลังนี้ ทำให้เรียก SensorCalibrate กับ LINESensorSET
    // ลำดับไหนก่อนก็ได้ และแยกคาลิเบรตหลายรอบได้
    let Cal_Line_Ch = [0, 0, 0, 0, 0, 0, 0, 0]
    let Cal_Bg_Ch = [0, 0, 0, 0, 0, 0, 0, 0]
    let Cal_Has_Ch = [false, false, false, false, false, false, false, false]

    function validCh(ch: number): boolean {
        return ch >= 0 && ch <= 7
    }

    /**
     * คัดเฉพาะหมายเลขช่อง 0-7 ที่ใช้ได้จริง ตัวที่นอกช่วงถูกตัดทิ้ง
     * กันไม่ให้อ่านเกินขอบตาราง ADC ตอนหุ่นกำลังวิ่ง
     */
    function validChannels(list: number[]): number[] {
        let out: number[] = []
        for (let i = 0; i < list.length; i++) {
            let ch = Math.floor(list[i])
            if (validCh(ch)) out.push(ch)
        }
        return out
    }

    // คาบคงที่ของลูปเดินตามเส้น ใช้ร่วมกันทั้งตอนจูนและตอนวิ่งจริง
    // D = ผลต่างต่อหนึ่งรอบ ไม่ได้หารด้วยเวลา คาบจึงต้องเท่ากันค่า KD ถึงจะใช้ข้ามบล็อกได้
    export const PID_PERIOD = 10

    /** ล้างสถานะ PID ก่อนเริ่มเดินตามเส้นรอบใหม่ */
    export function resetPID(): void {
        previous_error = 0
        D_Smooth = 0
    }

    /**
     * คิดค่า PD หนึ่งจังหวะจากตำแหน่งเส้นล่าสุด
     *
     * ตำแหน่งเส้นกระโดดเป็นขั้นทุกครั้งที่เซ็นเซอร์ตัวหนึ่งเข้าหรือออกจากเกณฑ์
     * ระหว่างขั้นค่าจะนิ่งสนิทแล้วกระโดดทีเดียวหลายร้อยหน่วย
     * D ดิบจึงเป็นศูนย์สลับกับหนามสูง ทำให้หักเลี้ยวกระตุกตอนเข้าโค้ง
     * กรองแบบ low-pass ให้หนามเตี้ยลงแต่ยังเห็นแนวโน้มเดิม
     */
    function pidStep(kp: number, kd: number): void {
        error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
        P = error
        D = error - previous_error
        previous_error = error
        let amount = Math.max(0, Math.min(95, D_Filter))
        let k = (100 - amount) / 100
        D_Smooth = D_Smooth + (D - D_Smooth) * k
        PD_Value = (kp * P) + (kd * D_Smooth)
    }

    /** หน่วงให้ครบคาบ นับจากเวลาที่เริ่มรอบ คาบจึงคงที่ไม่ว่าอ่านเซ็นเซอร์ช้าเร็วแค่ไหน */
    export function pidWait(mark: number): void {
        let used = input.runningTime() - mark
        basic.pause(Math.max(1, PID_PERIOD - used))
    }

    /**
     * คิดความเร็วล้อซ้าย-ขวาจากความเร็วฐานกับค่า PD โดย "รักษาผลต่างซ้าย-ขวา" ไว้
     *
     * วิธีเดิมตัดเฉพาะล้อที่เกินเพดาน ผลต่างจึงหดตามไปด้วย
     * พอสั่งความเร็วเท่าเพดาน (เช่น 100) ล้อนอกจะถูกตรึงไว้ตลอด
     * เหลือแค่เบรกล้อในอย่างเดียว แรงเลี้ยวจึงเหลือครึ่งเดียวของความเร็วอื่น
     *
     * วิธีนี้เลื่อนความเร็ว "ทั้งคู่" ลงเท่า ๆ กันแทนการตัดข้างเดียว
     * ผลต่างที่ PID สั่งจึงอยู่ครบ แรงเลี้ยวเท่ากันทุกความเร็ว
     * และตอนวิ่งตรง (PD = 0) ยังได้ความเร็วเต็มตามที่สั่ง
     *
     * เขียนผลลงตัวแปร left_motor_speed / right_motor_speed
     * @param base ความเร็วฐาน
     * @param pd ค่า PD ที่จะบวกให้ล้อขวา ลบออกจากล้อซ้าย
     * @param top เพดานความเร็วของแต่ละล้อ
     */
    function steerPair(base: number, pd: number, top: number): void {
        let l = base - pd
        let r = base + pd
        let over = Math.max(l, r) - top
        if (over > 0) {
            l -= over
            r -= over
        }
        // ผลต่างเกิน 2 เท่าของเพดานคือทำตามไม่ไหวจริง ๆ ตัดที่ผลต่างมากสุดเท่าที่ได้
        if (l < -top) l = -top
        if (r < -top) r = -top
        left_motor_speed = l
        right_motor_speed = r
    }

    /**
     * ตรวจว่าบอร์ดใช้ ADC รุ่นไหน ตรวจครั้งเดียวแล้วจำไว้
     * รุ่นใหม่มีชิปตอบที่ 0x49 รุ่นเดิมไม่มี จึงแยกได้ด้วยการลองเขียนหาดู
     */
    function adcDetect(): void {
        if (adcVersion != 0) return
        let probe = pins.createBuffer(1)
        probe[0] = ADC_Read.ADC0
        adcVersion = pins.i2cWriteBuffer(ADC_V2_ADDR, probe, false) == 0 ? 2 : 1
    }

    /**
     * ค่าสูงสุดที่ ADC ของบอร์ดนี้อ่านได้ 4095 สำหรับ 12 บิต หรือ 255 สำหรับ 8 บิต
     * ใช้กับโค้ดที่ต้องรู้สเกลจริง เช่น เกณฑ์คาลิเบรตและการคิดเปอร์เซ็นต์
     */
    export function adcFullScale(): number {
        adcDetect()
        return adcVersion == 2 ? 255 : 4095
    }

    /**
     * แปลงหมายเลขช่อง 0-7 เป็นคำสั่งอ่านของ ADS7828
     */
    export function adcCmd(ch: number): number {
        let table = [
            ADC_Read.ADC0, ADC_Read.ADC1, ADC_Read.ADC2, ADC_Read.ADC3,
            ADC_Read.ADC4, ADC_Read.ADC5, ADC_Read.ADC6, ADC_Read.ADC7
        ]
        if (!validCh(ch)) return ADC_Read.ADC0
        return table[ch]
    }

    /**
     * อ่านค่าดิบของเซ็นเซอร์กลางทุกตัว หนึ่งรอบ
     */
    export function readCenterRaw(): number[] {
        let out: number[] = []
        for (let i = 0; i < Sensor_PIN.length; i++) out.push(ADCRead(adcCmd(Sensor_PIN[i])))
        return out
    }

    /**
     * แปลงค่าดิบของเซ็นเซอร์กลางเป็นตำแหน่งเส้น โดยไม่อ่าน ADC ซ้ำ
     */
    export function positionFrom(raw: number[]): number {
        let Average = 0
        let Sum_Value = 0
        let ON_Line = 0
        for (let i = 0; i < Num_Sensor && i < raw.length; i++) {
            let Value_Sensor = 0
            if (Line_Mode == 0) Value_Sensor = pins.map(raw[i], Color_Line[i], Color_Background[i], 1000, 0)
            else Value_Sensor = pins.map(raw[i], Color_Background[i], Color_Line[i], 1000, 0)
            if (Value_Sensor < 0) Value_Sensor = 0
            else if (Value_Sensor > 1000) Value_Sensor = 1000
            if (Value_Sensor > Sensor_On_Threshold) {
                ON_Line = 1
                Average += Value_Sensor * (i * 1000)
                Sum_Value += Value_Sensor
            }
        }
        if (ON_Line == 0) {
            if (Last_Position < (Num_Sensor - 1) * 1000 / 2) return (Num_Sensor - 1) * 1000
            else return 0
        }
        Last_Position = Average / Sum_Value
        return Math.round(((Num_Sensor - 1) * 1000) - Last_Position)
    }

    /**
     * ดึงค่าคาลิเบรตของเซ็นเซอร์แต่ละกลุ่มออกมาเรียงตามลำดับที่ตั้งไว้
     */
    function calRow(sensors: number[], src: number[]): number[] {
        let out: number[] = []
        for (let i = 0; i < sensors.length; i++) {
            if (validCh(sensors[i])) out.push(src[sensors[i]])
            else out.push(0)
        }
        return out
    }

    /**
     * สร้าง Color_* ใหม่จากคลังค่าคาลิเบรต
     * ถ้าค่าเส้นกับพื้นเท่ากัน pins.map จะหารด้วยศูนย์ จึงถ่างออก 1 หน่วย
     */
    function applyCal(): void {
        Color_Line = calRow(Sensor_PIN, Cal_Line_Ch)
        Color_Background = calRow(Sensor_PIN, Cal_Bg_Ch)
        Color_Line_Left = calRow(Sensor_Left, Cal_Line_Ch)
        Color_Background_Left = calRow(Sensor_Left, Cal_Bg_Ch)
        Color_Line_Right = calRow(Sensor_Right, Cal_Line_Ch)
        Color_Background_Right = calRow(Sensor_Right, Cal_Bg_Ch)
        separateCal(Color_Line, Color_Background)
        separateCal(Color_Line_Left, Color_Background_Left)
        separateCal(Color_Line_Right, Color_Background_Right)
    }

    function separateCal(line: number[], background: number[]): void {
        for (let i = 0; i < line.length && i < background.length; i++) {
            if (line[i] == background[i]) background[i] = line[i] + 1
        }
    }

    function groupCalibrated(sensors: number[]): boolean {
        for (let i = 0; i < sensors.length; i++) {
            if (!validCh(sensors[i]) || !Cal_Has_Ch[sensors[i]]) return false
        }
        return true
    }

    /**
     * ช่องนี้ถูกสอนหรือใส่ค่าไว้แล้วหรือยัง
     * ใช้แยกระหว่าง "ยังไม่ได้ตั้ง" กับ "ตั้งไว้เป็น 0 จริง ๆ"
     */
    export function channelTaught(ch: number): boolean {
        if (!validCh(ch)) return false
        return Cal_Has_Ch[ch]
    }

    /**
     * สอนเซ็นเซอร์ครบทุกตัวที่ตั้งค่าไว้แล้วหรือยัง
     */
    export function lineCalibrated(): boolean {
        return Sensor_PIN.length > 0
            && groupCalibrated(Sensor_PIN)
            && groupCalibrated(Sensor_Left)
            && groupCalibrated(Sensor_Right)
    }

    function calBeepBad(): void {
        music.playTone(262, music.beat(BeatFraction.Quarter))
        music.playTone(196, music.beat(BeatFraction.Quarter))
    }

    function storeCal(ch: number, onLine: number, onGround: number): void {
        Cal_Line_Ch[ch] = Math.max(0, Math.min(4095, Math.floor(onLine)))
        Cal_Bg_Ch[ch] = Math.max(0, Math.min(4095, Math.floor(onGround)))
        Cal_Has_Ch[ch] = true
    }

    /**
     * หยุดการทำงานทั้งหมด หุ่นจะไม่ขยับอีกเลยจนกว่าจะกดปุ่มรีเซทหรือปิดเปิดเครื่องใหม่
     * ใช้ตอนต้องหยุดฉุกเฉิน หรือจบภารกิจแล้วไม่อยากให้หุ่นทำอะไรต่อ
     *
     * มอเตอร์ถูกสั่งหยุดและถูกล็อกไว้ที่ 0 เซอร์โวไม่รับคำสั่งอีก
     * และลูปเกาะเส้นที่ค้างอยู่จะออกจากลูปเอง ต่อให้มีบล็อกอื่นเรียกซ้ำก็ไม่ขยับ
     */
    //% group="เริ่มและหยุด"
    //% weight=90
    //% block="หยุดทำงานทั้งหมด"
    export function haltAll(): void {
        kidsHalted = true
        motorStop()
        setLineLED(false)
        music.playTone(523, music.beat(BeatFraction.Quarter))
        music.playTone(392, music.beat(BeatFraction.Quarter))
        music.playTone(262, music.beat(BeatFraction.Half))
        if (oledIsReady()) {
            oledClear()
            oledShowLine("STOP", 1)
            oledShowLine("press RESET", 3)
            oledShowLine("or power off", 4)
        }
        basic.showString("STOP")
        basic.showIcon(IconNames.No)
        // ค้างอยู่ตรงนี้ตลอด ไม่มีทางออกนอกจากรีเซท
        while (true) {
            motorStop()
            basic.pause(1000)
        }
    }

    /**
     * ใส่ค่าคาลิเบรตของเซ็นเซอร์ทุกช่องในบล็อกเดียว แทนการสอนด้วยปุ่ม A
     * ใส่ค่าเรียงตามช่อง 0, 1, 2, ... 7 ช่องไหนไม่ใส่จะไม่ถูกเปลี่ยน
     * ใช้ตอนรู้ค่าอยู่แล้ว (ดูได้จากบล็อก "จอ OLED แสดง ค่าคาลิเบรต")
     * จะได้ไม่ต้องสอนเซ็นเซอร์ใหม่ทุกครั้งก่อนปล่อยหุ่น
     * @param onLine ค่าที่อ่านได้ตอนเซ็นเซอร์อยู่บนเส้น เรียงช่อง 0-7
     * @param onGround ค่าที่อ่านได้ตอนเซ็นเซอร์อยู่บนพื้น เรียงช่อง 0-7
     */
    //% group="ตั้งค่าเส้น"
    //% subcategory="เดินตามเส้น"
    //% weight=88
    //% block="ตั้งค่าเซ็นเซอร์ บนเส้น $onLine|บนพื้น $onGround"
    //% onLine.shadow="lists_create_with" onGround.shadow="lists_create_with"
    export function setSensorCal(onLine: number[], onGround: number[]): void {
        let n = Math.min(8, Math.min(onLine.length, onGround.length))
        if (n == 0 || onLine.length != onGround.length) calBeepBad()
        for (let ch = 0; ch < n; ch++) storeCal(ch, onLine[ch], onGround[ch])
        applyCal()
    }

    /**
     * อ่านค่าคาลิเบรตที่เก็บไว้ของช่องหนึ่ง
     * @param ch หมายเลขช่อง ADC 0-7
     */
    export function getSensorCal(ch: number, which: Cal_Which): number {
        ch = Math.floor(ch)
        if (!validCh(ch)) return 0
        if (which == Cal_Which.Line) return Cal_Line_Ch[ch]
        return Cal_Bg_Ch[ch]
    }

    function initPCA(): void {
        let i2cData = pins.createBuffer(2)
        initI2C = true
        i2cData[0] = 0
        i2cData[1] = 0x10
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0xFE
        i2cData[1] = 101
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0
        i2cData[1] = 0x81
        pins.i2cWriteBuffer(PCA, i2cData, false)

        for (let servo = 0; servo < 16; servo++) {
            i2cData[0] = SERVOS + servo * 4 + 0
            i2cData[1] = 0x00

            i2cData[0] = SERVOS + servo * 4 + 1
            i2cData[1] = 0x00
            pins.i2cWriteBuffer(PCA, i2cData, false);
        }
    }

    function setServoPCA(servo: number, angle: number): void {
        if (initI2C == false) {
            initPCA()
        }
        let i2cData = pins.createBuffer(2)
        let start = 0
        let angle_input = pins.map(angle, 0, 180, -90, 90)
        angle = Math.max(Math.min(90, angle_input), -90)
        let stop = 369 + angle * 235 / 90
        i2cData[0] = SERVOS + servo * 4 + 2
        i2cData[1] = (stop & 0xff)
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = SERVOS + servo * 4 + 3
        i2cData[1] = (stop >> 8)
        pins.i2cWriteBuffer(PCA, i2cData, false)
    }

    function analogWritePCA(channel: number, value: number): void {
        if (initI2C == false) {
            initPCA();
        }

        value = Math.max(0, Math.min(4095, value));
        let onValue = 0;
        let offValue = value;
        let i2cData = pins.createBuffer(2);
        i2cData[0] = SERVOS + channel * 4;
        i2cData[1] = onValue & 0xff;
        pins.i2cWriteBuffer(PCA, i2cData, false);

        i2cData[0] = SERVOS + channel * 4 + 1;
        i2cData[1] = (onValue >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA, i2cData, false);

        i2cData[0] = SERVOS + channel * 4 + 2;
        i2cData[1] = offValue & 0xff;
        pins.i2cWriteBuffer(PCA, i2cData, false);

        i2cData[0] = SERVOS + channel * 4 + 3;
        i2cData[1] = (offValue >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA, i2cData, false);
    }

    function initBNO055() {
        pins.i2cWriteNumber(
            BNO055_I2C_ADDR,
            (BNO055_OPR_MODE << 8) | 0x00,
            NumberFormat.UInt16BE,
            false
        )
        basic.pause(10)
        pins.i2cWriteNumber(
            BNO055_I2C_ADDR,
            (BNO055_OPR_MODE << 8) | OPERATION_MODE_IMUPLUS,
            NumberFormat.UInt16BE,
            false
        )
        basic.pause(1000)
    }

    function read16BitRegister(lsb: number, msb: number): number {
        pins.i2cWriteNumber(BNO055_I2C_ADDR, lsb, NumberFormat.UInt8BE)
        let lsbValue = pins.i2cReadNumber(BNO055_I2C_ADDR, NumberFormat.UInt8BE)
        pins.i2cWriteNumber(BNO055_I2C_ADDR, msb, NumberFormat.UInt8BE)
        let msbValue = pins.i2cReadNumber(BNO055_I2C_ADDR, NumberFormat.UInt8BE)
        return (msbValue << 8) | lsbValue
    }

    function getNormalizedOrientation(angles: number, offset: number): number {
        let adjustedYaw = angles - offset
        while (adjustedYaw > 180) {
            adjustedYaw -= 360
        }
        while (adjustedYaw < -180) {
            adjustedYaw += 360
        }
        return adjustedYaw
    }

    /**
     * Stop all Motor
     */
    export function motorStop(): void {
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        motorGo(0, 0, 0, 0)
    }

    /**
     * Forward or Backward with degrees.
     */
    export function goWithDegreesTime(direction: Forward_Direction, time: number, degrees: number, min_speed: number, max_speed: number, kp: number, kd: number) {
        let timer = control.millis()
        previous_error = 0
        while (control.millis() - timer < time) {
            error = degrees - anglesRead(Angle.Yaw)
            if (error > 180) {
                error += 0 - 360
            } else if (error < -180) {
                error += 360
            }
            P = error
            D = error - previous_error
            PD_Value = (kp * P) + (kd * D)
            previous_error = error

            steerPair(min_speed, -PD_Value, max_speed)

            if (direction == Forward_Direction.Forward) {
                motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
            }
            else {
                motorGo(-right_motor_speed, -right_motor_speed, -left_motor_speed, -left_motor_speed)
            }
        }
        motorStop()
    }

    /**
     * Spin the Robot to Degrees.
     */
    export function spinDegrees(degrees: number, low_degrees: number, min_speed: number, max_speed: number): void {
        if (initIMU == false) {
            initBNO055()
            initIMU = true
        }

        let timer_turn = 0
        while (true) {
            let error_yaw = degrees - anglesRead(Angle.Yaw)

            if (error_yaw > 180) {
                error_yaw += 0 - 360
            } else if (error_yaw < -180) {
                error_yaw += 360
            }

            serial.writeLine("" + error_yaw)

            let pd_value = error_yaw * (max_speed * 0.02)

            if (Math.abs(error_yaw) < low_degrees) {
                if (error_yaw < -0.3) {
                    motorGo(-min_speed, -min_speed, min_speed, min_speed)
                }
                else if (error_yaw > 0.3) {
                    motorGo(min_speed, min_speed, -min_speed, -min_speed)
                }
                else {
                    motorStop()
                    break;
                }
            }
            else {
                motorGo(pd_value, pd_value, -pd_value, -pd_value)
                timer_turn = control.millis()
            }
        }
    }

    /**
     * Spin the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    export function Spin(spin: _Spin, speed: number): void {
        if (spin == _Spin.Left) {
            motorGo(-speed, -speed, speed, speed)
        }
        else if (spin == _Spin.Right) {
            motorGo(speed, speed, -speed, -speed)
        }
    }

    /**
     * Turn the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    export function Turn(turn: _Turn, speed: number): void {
        if (turn == _Turn.Left) {
            motorGo(0, 0, speed, speed)
        }
        else if (turn == _Turn.Right) {
            motorGo(speed, speed, 0, 0)
        }
    }

    /**
     * Control motors speed both at the same time. The speed motors is adjustable between -100 to 100.
     */
    export function motorGo(speed1: number, speed2: number, speed3: number, speed4: number): void {
        // หลังสั่งหยุดทำงานทั้งหมด บังคับเป็น 0 แทนการ return
        // เพื่อให้ขามอเตอร์ถูกขับให้หยุดจริง ไม่ใช่ค้างค่าเดิมไว้
        if (kidsHalted) {
            speed1 = 0
            speed2 = 0
            speed3 = 0
            speed4 = 0
        }
        speed1 = pins.map(speed1, -100, 100, -1023, 1023)
        speed2 = pins.map(speed2, -100, 100, -1023, 1023)
        speed3 = pins.map(speed3, -100, 100, -1023, 1023)
        speed4 = pins.map(speed4, -100, 100, -1023, 1023)

        if (speed1 < -1023) speed1 = -1023
        else if (speed1 > 1023) speed1 = 1023
        if (speed2 < -1023) speed2 = -1023
        else if (speed2 > 1023) speed2 = 1023
        if (speed3 < -1023) speed3 = -1023
        else if (speed3 > 1023) speed3 = 1023
        if (speed4 < -1023) speed4 = -1023
        else if (speed4 > 1023) speed4 = 1023

        if (speed1 < 0) {
            analogWritePCA(13, 0)
            pins.analogWritePin(AnalogPin.P14, -speed1)
            pins.analogSetPeriod(AnalogPin.P14, 50)
        }
        else if (speed1 >= 0) {
            analogWritePCA(13, 4095)
            pins.analogWritePin(AnalogPin.P14, speed1)
            pins.analogSetPeriod(AnalogPin.P14, 50)
        }

        if (speed2 < 0) {
            analogWritePCA(12, 0)
            pins.analogWritePin(AnalogPin.P13, -speed2)
            pins.analogSetPeriod(AnalogPin.P13, 50)
        }
        else if (speed2 >= 0) {
            analogWritePCA(12, 4095)
            pins.analogWritePin(AnalogPin.P13, speed2)
            pins.analogSetPeriod(AnalogPin.P13, 50)
        }

        if (speed3 < 0) {
            analogWritePCA(14, 0)
            pins.analogWritePin(AnalogPin.P16, -speed3)
            pins.analogSetPeriod(AnalogPin.P16, 50)
        }
        else if (speed3 >= 0) {
            analogWritePCA(14, 4095)
            pins.analogWritePin(AnalogPin.P16, speed3)
            pins.analogSetPeriod(AnalogPin.P16, 50)
        }

        if (speed4 < 0) {
            analogWritePCA(15, 0)
            pins.analogWritePin(AnalogPin.P15, -speed4)
            pins.analogSetPeriod(AnalogPin.P15, 50)
        }
        else if (speed4 >= 0) {
            analogWritePCA(15, 4095)
            pins.analogWritePin(AnalogPin.P15, speed4)
            pins.analogSetPeriod(AnalogPin.P15, 50)
        }
    }

    /**
     * Control Servo Motor 0 - 180 Degrees
     */
    export function servoWrite(servo: Servo_Write, degree: number): void {
        if (kidsHalted) return
        if (servo == Servo_Write.S0) {
            setServoPCA(0, degree)
        }
        else if (servo == Servo_Write.S1) {
            setServoPCA(1, degree)
        }
        else if (servo == Servo_Write.S2) {
            setServoPCA(2, degree)
        }
        else if (servo == Servo_Write.S3) {
            setServoPCA(3, degree)
        }
        else if (servo == Servo_Write.S4) {
            setServoPCA(4, degree)
        }
        else if (servo == Servo_Write.S5) {
            setServoPCA(5, degree)
        }
        else if (servo == Servo_Write.S6) {
            setServoPCA(6, degree)
        }
        else if (servo == Servo_Write.S7) {
            setServoPCA(7, degree)
        }
    }

    /**
     * Read Angles from IMU
     */
    export function anglesRead(anglesRead: Angle): number {
        if (initIMU == false) {
            initBNO055()
            initIMU = true
        }
        if (anglesRead == Angle.Roll) {
            return getNormalizedOrientation(read16BitRegister(EULER_R_LSB, EULER_R_MSB) / 16, angle_offset[0])
        }
        else if (anglesRead == Angle.Pitch) {
            return getNormalizedOrientation(read16BitRegister(EULER_P_LSB, EULER_P_MSB) / 16, angle_offset[1])
        }
        else if (anglesRead == Angle.Yaw) {
            return getNormalizedOrientation(read16BitRegister(EULER_Y_LSB, EULER_Y_MSB) / 16, angle_offset[2])
        }
        return 0
    }

    /**
     * Set IMU offset to 0
     */
    export function setAngleOffset(setAngles: Angle): void {
        if (setAngles == Angle.Roll) {
            angle_offset[0] = getNormalizedOrientation(read16BitRegister(EULER_R_LSB, EULER_R_MSB) / 16, 0)
        }
        else if (setAngles == Angle.Pitch) {
            angle_offset[1] = getNormalizedOrientation(read16BitRegister(EULER_P_LSB, EULER_P_MSB) / 16, 0)
        }
        else if (setAngles == Angle.Yaw) {
            angle_offset[2] = getNormalizedOrientation(read16BitRegister(EULER_Y_LSB, EULER_Y_MSB) / 16, 0)
        }
    }

    /**
     * Read Distance from Ultrasonic Sensor
     */
    export function distanceRead(Trigger_PIN: Ultrasonic_PIN, Echo_PIN: Ultrasonic_PIN): number {
        let duration
        let maxCmDistance = 500

        if (control.millis() - timer > 1000) {
            if (Trigger_PIN == Ultrasonic_PIN.P1 && Echo_PIN == Ultrasonic_PIN.P2) {
                pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
                pins.digitalWritePin(DigitalPin.P1, 0)
                control.waitMicros(2)
                pins.digitalWritePin(DigitalPin.P1, 1)
                control.waitMicros(10)
                pins.digitalWritePin(DigitalPin.P1, 0)
                duration = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58)
                distance = Math.idiv(duration, 58)
            }
            else if (Trigger_PIN == Ultrasonic_PIN.P2 && Echo_PIN == Ultrasonic_PIN.P1) {
                pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
                pins.digitalWritePin(DigitalPin.P2, 0)
                control.waitMicros(2)
                pins.digitalWritePin(DigitalPin.P2, 1)
                control.waitMicros(10)
                pins.digitalWritePin(DigitalPin.P2, 0)
                duration = pins.pulseIn(DigitalPin.P1, PulseValue.High, maxCmDistance * 58)
                distance = Math.idiv(duration, 58)
            }
        }

        if (Trigger_PIN == Ultrasonic_PIN.P1 && Echo_PIN == Ultrasonic_PIN.P2) {
            pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
            pins.digitalWritePin(DigitalPin.P1, 0)
            control.waitMicros(2)
            pins.digitalWritePin(DigitalPin.P1, 1)
            control.waitMicros(10)
            pins.digitalWritePin(DigitalPin.P1, 0)
            duration = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58)
        }
        else if (Trigger_PIN == Ultrasonic_PIN.P2 && Echo_PIN == Ultrasonic_PIN.P1) {
            pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
            pins.digitalWritePin(DigitalPin.P2, 0)
            control.waitMicros(2)
            pins.digitalWritePin(DigitalPin.P2, 1)
            control.waitMicros(10)
            pins.digitalWritePin(DigitalPin.P2, 0)
            duration = pins.pulseIn(DigitalPin.P1, PulseValue.High, maxCmDistance * 58)
        }

        let d = Math.idiv(duration, 58)

        if (d != 0) {
            distance = (0.1 * d) + (1 - 0.1) * distance
        }
        timer = control.millis()
        return Math.round(distance)
    }

    /**
     * Read Analog from ADC Channel
     */
    export function ADCRead(channel: ADC_Read): number {
        adcDetect()
        if (adcVersion == 2) {
            pins.i2cWriteNumber(ADC_V2_ADDR, channel, NumberFormat.UInt8LE, false)
            control.waitMicros(100)
            return pins.i2cReadNumber(ADC_V2_ADDR, NumberFormat.UInt8LE, false) & 0xFF
        }
        pins.i2cWriteNumber(ADS7828_ADDR, channel, NumberFormat.UInt8LE, false)
        control.waitMicros(100)
        // ADS7828 ส่งค่า 12 บิตมาใน 2 ไบต์ โดยไบต์แรกมีศูนย์นำหน้า 4 บิต
        // ค่าปกติจึงอยู่ในช่วง 0-4095 อยู่แล้ว มาสก์ไว้กันกรณีชิปไม่ตอบ
        // ซึ่งบัส I2C จะคืน 0xFFFF ออกมาเป็นค่าเซ็นเซอร์
        return pins.i2cReadNumber(ADS7828_ADDR, NumberFormat.UInt16BE, false) & 0x0FFF
    }

    // ---------- เลี้ยวหาเส้นแบบเร็วและแม่นยำ (TurnLINEPro) ----------

    // ค่าเซ็นเซอร์กลางตัวที่ i เป็น 0-1000 (1000 = อยู่บนเส้น)
    function lineValue(i: number): number {
        let raw = ADCRead(adcCmd(Sensor_PIN[i]))
        let v = Line_Mode == 0
            ? pins.map(raw, Color_Line[i], Color_Background[i], 1000, 0)
            : pins.map(raw, Color_Background[i], Color_Line[i], 1000, 0)
        return Math.max(0, Math.min(1000, v))
    }

    // ค่าเซ็นเซอร์ทางแยกตัวแรก (ซ้ายหรือขวา) 0-1000, คืน 0 ถ้าไม่ได้ตั้งค่าไว้
    function sideValue(left: boolean): number {
        let pin = left ? Sensor_Left : Sensor_Right
        let line = left ? Color_Line_Left : Color_Line_Right
        let ground = left ? Color_Background_Left : Color_Background_Right
        if (pin.length == 0 || line.length == 0 || ground.length == 0) return 0
        let raw = ADCRead(adcCmd(pin[0]))
        let v = Line_Mode == 0
            ? pins.map(raw, line[0], ground[0], 1000, 0)
            : pins.map(raw, ground[0], line[0], 1000, 0)
        return Math.max(0, Math.min(1000, v))
    }

    // ตำแหน่งเส้นใต้เซ็นเซอร์กลาง 0 (ซ้ายสุด) ถึง (Num_Sensor-1)*1000 (ขวาสุด), -1 = ไม่เจอเส้น
    // ต่างจาก positionFrom ตรงที่ไม่เดาตำแหน่งตอนหลุดเส้น และไม่กลับทิศ
    function centerPosition(): number {
        let sum = 0
        let weighted = 0
        for (let i = 0; i < Num_Sensor; i++) {
            let v = lineValue(i)
            if (v > Sensor_On_Threshold) {
                weighted += v * i * 1000
                sum += v
            }
        }
        if (sum == 0) return -1
        return weighted / sum
    }

    // หมุนตัวอยู่กับที่ ค่าบวก = หมุนไปทาง turn, ค่าลบ = หมุนกลับทาง
    function spinToward(turn: Turn_Line, speed: number): void {
        if (turn == Turn_Line.Left) motorGo(-speed, -speed, speed, speed)
        else motorGo(speed, speed, -speed, -speed)
    }

    /**
     * Turn Left or Right until the center sensors are exactly on the new line.
     * Fast sweep, slow approach, active brake and fine correction.
     * Gives up and stops after 4 seconds if no line is found.
     */
    export function TurnLINEPro(turn: Turn_Line, fast_speed: number, slow_speed: number, brake_time: number): void {
        if (Num_Sensor == 0 || kidsHalted) return
        let fast = Math.max(0, Math.min(100, fast_speed))
        let slow = Math.max(0, Math.min(fast, slow_speed))
        // ช่วงเข้าเส้นมีระยะแค่ราว 1.5 ช่องเซ็นเซอร์ เริ่มที่ fast จะเบรกไม่ทัน
        let approach = (fast + slow) / 2
        let left = turn == Turn_Line.Left
        let center = (Num_Sensor - 1) * 500
        let lead = left ? 0 : Num_Sensor - 1
        let start = control.millis()
        let timeout = 4000

        // 1) หนีเส้นเดิม: หมุนเร็วจนเซ็นเซอร์กลางทุกตัวพ้นเส้น 2 รอบติดกัน
        spinToward(turn, fast)
        let clear = 0
        while (clear < 2) {
            if (kidsHalted || control.millis() - start > timeout) { motorStop(); return }
            let on = false
            for (let i = 0; i < Num_Sensor; i++) {
                if (lineValue(i) >= 300) { on = true; break }
            }
            clear = on ? 0 : clear + 1
        }

        // 2) กวาดเร็ว: อ่านเฉพาะเซ็นเซอร์ทางแยกกับเซ็นเซอร์กลางตัวนอกสุดฝั่งที่หันไป
        //    เซ็นเซอร์ทางแยกจะนับก็ต่อเมื่อเคยพ้นเส้นมาก่อน (กันเส้นเดิมหลอก)
        let side_armed = false
        while (true) {
            if (kidsHalted || control.millis() - start > timeout) { motorStop(); return }
            let side = sideValue(left)
            if (side < 300) side_armed = true
            if ((side_armed && side >= 500) || lineValue(lead) >= 500) break
        }

        // 3) เข้าเส้นช้า: ยิ่งเส้นใกล้กลางยิ่งช้า หยุดเมื่อถึงหรือเลยกลาง
        spinToward(turn, approach)
        while (true) {
            if (kidsHalted || control.millis() - start > timeout) { motorStop(); return }
            let pos = centerPosition()
            if (pos < 0) {
                spinToward(turn, slow)
                continue
            }
            let remain = left ? center - pos : pos - center
            if (remain <= 0) break
            spinToward(turn, slow + (approach - slow) * remain / center)
        }

        // 4) เบรก: กลับทางเต็มแรงช่วงสั้นๆ
        if (brake_time > 0) {
            spinToward(turn, -100)
            basic.pause(brake_time)
        }
        motorStop()

        // 5) แก้ตำแหน่ง: ถ้ายังเยื้องกลางเกิน 250 ขยับช้าๆ เข้าหาเส้น ไม่เกิน 150 ms
        let fix_start = control.millis()
        while (!kidsHalted && control.millis() - fix_start < 150) {
            let pos = centerPosition()
            if (pos < 0 || Math.abs(pos - center) <= 250) break
            // เส้นอยู่ทางซ้ายของกลาง → หมุนซ้ายจะเลื่อนเส้นมาทางขวา
            spinToward(Turn_Line.Left, pos < center ? slow : -slow)
        }
        motorStop()
    }

    /**
     * Line Follower Forward Timer
     */
    export function ForwardTIME(direction: Forward_Direction, time: number, min_speed: number, max_speed: number, kp: number, kd: number) {
        let timer = control.millis()
        resetPID()
        while (control.millis() - timer < time) {
            let mark = input.runningTime()
            pidStep(kp, kd)
            steerPair(min_speed, PD_Value, max_speed)

            if (direction == Forward_Direction.Forward) {
                motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
            }
            else {
                motorGo(-left_motor_speed, -left_motor_speed, -right_motor_speed, -right_motor_speed)
            }
            pidWait(mark)
        }
        motorStop()
    }

    /**
     * Line Follower Forward with Counter Line
     */
    export function ForwardLINECount(direction: Forward_Direction, find: Find_Line, count: number, min_speed: number, max_speed: number, break_time: number, kp: number, kd: number) {
        for (let i = 0; i < count; i++) {
            if (i < count - 1) {
                ForwardLINE(direction, find, min_speed, max_speed, 0, kp, kd)
            }
            else {
                ForwardLINE(direction, find, min_speed, max_speed, break_time, kp, kd)
            }
        }
    }

    /**
     * Line Follower Forward
     */
    export function ForwardLINE(direction: Forward_Direction, find: Find_Line, min_speed: number, max_speed: number, break_time: number, kp: number, kd: number) {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let found_left = 0
        let found_right = 0
        let last_left = 0
        let last_center = 0
        let last_right = 0
        let line_state = 0
        let on_line = 0
        let on_line_LR = 0
        resetPID()

        while (1) {
            if (kidsHalted) break
            found_left = 0
            found_right = 0
            for (let i = 0; i < Sensor_Left.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Left[i]]), Color_Line_Left[i], Color_Background_Left[i], 1000, 0)) >= 500) {
                    if (found_left < Sensor_Left.length) {
                        found_left += 1
                    }
                }
            }

            for (let i = 0; i < Sensor_Right.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Right[i]]), Color_Line_Right[i], Color_Background_Right[i], 1000, 0)) >= 500) {
                    if (found_right < Sensor_Right.length) {
                        found_right += 1
                    }
                }
            }

            if (found_left > 0 || found_right > 0) {
                motorGo(min_speed, min_speed, min_speed, min_speed)
            }
            else {
                break
            }
        }

        found_left = 0
        found_right = 0

        while (1) {
            if (kidsHalted) break
            for (let i = 0; i < Sensor_PIN.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)) >= 200) {
                    last_center += 1
                }
            }

            pidStep(kp, kd)

            steerPair(min_speed, direction == Forward_Direction.Forward ? PD_Value : -PD_Value, max_speed)

            if (direction == Forward_Direction.Forward) {
                if (last_center > 0) {
                    motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
                }
                else {
                    motorGo(min_speed, min_speed, min_speed, min_speed)
                }
            }
            else {
                if (last_center > 0) {
                    motorGo(-left_motor_speed, -left_motor_speed, -right_motor_speed, -right_motor_speed)
                }
                else {
                    motorGo(-min_speed, -min_speed, -min_speed, -min_speed)
                }
            }

            last_center = 0

            for (let i = 0; i < Sensor_Left.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Left[i]]), Color_Line_Left[i], Color_Background_Left[i], 1000, 0)) >= 500) {
                    if (found_left < Sensor_Left.length) {
                        found_left += 1
                    }
                }
            }

            for (let i = 0; i < Sensor_Right.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Right[i]]), Color_Line_Right[i], Color_Background_Right[i], 1000, 0)) >= 500) {
                    if (found_right < Sensor_Right.length) {
                        found_right += 1
                    }
                }
            }

            if (line_state == 0) {
                if (found_left == Sensor_Left.length || found_right == Sensor_Right.length) {
                    line_state = 1
                }
            }
            else if (line_state == 1) {
                if (direction == Forward_Direction.Forward) {
                    motorGo(min_speed, min_speed, min_speed, min_speed)
                }
                else {
                    motorGo(-min_speed, -min_speed, -min_speed, -min_speed)
                }
                while (1) {
            if (kidsHalted) break
                    for (let i = 0; i < Sensor_Left.length; i++) {
                        if ((pins.map(ADCRead(ADC_PIN[Sensor_Left[i]]), Color_Line_Left[i], Color_Background_Left[i], 1000, 0)) >= 500) {
                            last_left += 1
                            if (found_left < Sensor_Left.length) {
                                found_left += 1
                            }
                        }
                    }

                    for (let i = 0; i < Sensor_Right.length; i++) {
                        if ((pins.map(ADCRead(ADC_PIN[Sensor_Right[i]]), Color_Line_Right[i], Color_Background_Right[i], 1000, 0)) >= 500) {
                            last_right += 1
                            if (found_right < Sensor_Right.length) {
                                found_right += 1
                            }
                        }
                    }

                    if (last_left != Sensor_Left.length && last_right != Sensor_Right.length) {
                        line_state = 2
                        break
                    }

                    last_left = 0
                    last_right = 0
                }
            }
            else if (line_state == 2) {
                if (find == Find_Line.Left) {
                    if (found_left == Sensor_Left.length && found_right != Sensor_Right.length) {
                        if (break_time > 0) {
                            if (direction == Forward_Direction.Forward) {
                                motorGo(-100, -100, -100, -100)
                            }
                            else {
                                motorGo(100, 100, 100, 100)
                            }
                            basic.pause(break_time)
                            motorStop()
                        }
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
                else if (find == Find_Line.Center) {
                    if (found_left == Sensor_Left.length || found_right == Sensor_Right.length) {
                        if (break_time > 0) {
                            if (direction == Forward_Direction.Forward) {
                                motorGo(-100, -100, -100, -100)
                            }
                            else {
                                motorGo(100, 100, 100, 100)
                            }
                            basic.pause(break_time)
                            motorStop()
                        }
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
                else if (find == Find_Line.Right) {
                    if (found_left != Sensor_Left.length && found_right == Sensor_Right.length) {
                        if (break_time > 0) {
                            if (direction == Forward_Direction.Forward) {
                                motorGo(-100, -100, -100, -100)
                            }
                            else {
                                motorGo(100, 100, 100, 100)
                            }
                            basic.pause(break_time)
                            motorStop()
                        }
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
            }
        }
    }

    /**
     * Basic Line Follower
     */
    export function Follower(min_speed: number, max_speed: number, kp: number, kd: number) {
        pidStep(kp, kd)
        steerPair(min_speed, PD_Value, max_speed)
        motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
    }

    /**
     * Get Position Line
     */
    export function GETPosition(): number {
        return positionFrom(readCenterRaw())
    }

    /**
     * Set Line Sensor Pin
     */
    export function LINESensorSET(adc_pin: number[], sensor_left: number[], sensor_right: number[], led_pin: LED_Pin): void {
        let asked = adc_pin.length + sensor_left.length + sensor_right.length
        Sensor_PIN = validChannels(adc_pin)
        Sensor_Left = validChannels(sensor_left)
        Sensor_Right = validChannels(sensor_right)
        Num_Sensor = Sensor_PIN.length
        LED_PIN = led_pin
        setLineLED(true)
        // สร้าง Color_* จากค่าที่สอนไว้แล้ว เผื่อคาลิเบรตมาก่อนตั้งค่าเซ็นเซอร์
        applyCal()
        if (Sensor_PIN.length + Sensor_Left.length + Sensor_Right.length < asked) {
            // มีเลขช่องนอกช่วง 0-7 ถูกตัดทิ้ง บอกตั้งแต่ตอนตั้งค่า
            // ดีกว่าปล่อยให้ไปพังตอนหุ่นวิ่ง
            music.playTone(262, music.beat(BeatFraction.Quarter))
            music.playTone(196, music.beat(BeatFraction.Quarter))
            basic.showString("PIN?")
        }
    }

    // ---------- คาลิเบรตแบบลากหุ่นผ่านเส้น ----------
    // เก็บเฉพาะสถิติระหว่างลาก (ต่ำสุด สูงสุด ผลรวม จำนวน) ไม่เก็บตัวอย่างทุกตัวไว้
    // จึงใช้แรมคงที่ ไม่ว่าจะลากนานแค่ไหน
    const CAL_SWEEP_STEP = 10        // เวลาต่อหนึ่งรอบอ่าน (ms)
    const CAL_SWEEP_EDGE = 25        // นับเป็น "ปลายสุด" เมื่ออยู่ใน % นี้ของช่วง
    const CAL_SWEEP_MIN_RANGE = 150  // ต่างกันน้อยกว่านี้ถือว่าไม่เคยผ่านเส้น (สเกล 12 บิต)

    let calSweepBar = -1

    /** แถบความคืบหน้าแถวล่างสุดของจอ LED วาดเพิ่มทีละดวง ไม่วาดซ้ำทุกรอบ */
    function calSweepProgress(elapsed: number, total: number): void {
        let seg = Math.idiv(elapsed * 5, total)
        if (seg > 4) seg = 4
        while (calSweepBar < seg) {
            calSweepBar++
            led.plot(calSweepBar, 4)
        }
    }

    /**
     * สอนเซ็นเซอร์ด้วยการลากหุ่นกลับไปกลับมาข้ามเส้น
     * อ่านค่าตลอดเวลาที่ลาก แล้วหาค่าเฉลี่ยของ "ตอนอยู่บนเส้น" กับ "ตอนอยู่บนพื้น" ให้เอง
     * @param seconds เวลาที่ใช้ลาก หน่วยวินาที
     */
    export function SensorCalibrateSweep(adc_pin: number[], seconds: number): void {
        let chs = validChannels(adc_pin)
        let n = chs.length
        if (n == 0) {
            music.playTone(262, music.beat(BeatFraction.Half))
            music.playTone(196, music.beat(BeatFraction.Half))
            basic.showIcon(IconNames.No)
            return
        }
        if (seconds < 3) seconds = 3
        if (seconds > 30) seconds = 30

        let cmd: number[] = []
        let vmin: number[] = []
        let vmax: number[] = []
        let loSum: number[] = []
        let loCnt: number[] = []
        let hiSum: number[] = []
        let hiCnt: number[] = []
        let lastB: number[] = []     // -1 = ช่วงกลาง, 0 = ปลายต่ำ, 1 = ปลายสูง
        for (let i = 0; i < n; i++) {
            cmd.push(adcCmd(chs[i]))
            vmin.push(adcFullScale())
            vmax.push(0)
            loSum.push(0)
            loCnt.push(0)
            hiSum.push(0)
            hiCnt.push(0)
            lastB.push(-1)
        }

        setLineLED(true)

        // บอกให้ลากซ้าย-ขวาข้ามเส้น แล้วกดปุ่ม A เริ่ม
        music.playTone(587, music.beat(BeatFraction.Quarter))
        music.playTone(784, music.beat(BeatFraction.Quarter))
        basic.showArrow(ArrowNames.West, 300)
        basic.showArrow(ArrowNames.East, 300)
        waitButtonA()
        music.playTone(784, music.beat(BeatFraction.Quarter))
        basic.clearScreen()
        calSweepBar = -1

        // ช่วงที่ 1 - หาช่วงค่าต่ำสุด/สูงสุดของแต่ละช่อง
        let total = seconds * 1000
        let half = Math.idiv(total, 2)
        let t0 = input.runningTime()
        while (input.runningTime() - t0 < half) {
            if (kidsHalted) return
            for (let i = 0; i < n; i++) {
                let v = ADCRead(cmd[i])
                if (v < vmin[i]) vmin[i] = v
                if (v > vmax[i]) vmax[i] = v
            }
            calSweepProgress(input.runningTime() - t0, total)
            basic.pause(CAL_SWEEP_STEP)
        }

        // รู้ช่วงแล้ว กำหนดเส้นแบ่ง "ปลายสุด" ของแต่ละช่อง
        // ค่าที่ตกอยู่ตรงกลางคือช่วงกำลังข้ามขอบเส้น ทิ้งไปไม่เอามาเฉลี่ย
        let loTh: number[] = []
        let hiTh: number[] = []
        for (let i = 0; i < n; i++) {
            let edge = Math.idiv((vmax[i] - vmin[i]) * CAL_SWEEP_EDGE, 100)
            loTh.push(vmin[i] + edge)
            hiTh.push(vmax[i] - edge)
        }
        music.playTone(659, music.beat(BeatFraction.Quarter))

        // ช่วงที่ 2 - เก็บค่าเฉลี่ยของทั้งสองปลาย ระหว่างที่ยังลากต่อ
        let blink = false
        while (input.runningTime() - t0 < total) {
            if (kidsHalted) return
            let crossed = false
            for (let i = 0; i < n; i++) {
                let v = ADCRead(cmd[i])
                if (v < vmin[i]) vmin[i] = v
                if (v > vmax[i]) vmax[i] = v
                let b = -1
                if (v <= loTh[i]) {
                    loSum[i] += v
                    loCnt[i]++
                    b = 0
                }
                else if (v >= hiTh[i]) {
                    hiSum[i] += v
                    hiCnt[i]++
                    b = 1
                }
                if (b >= 0) {
                    if (lastB[i] >= 0 && lastB[i] != b) crossed = true
                    lastB[i] = b
                }
            }
            // ไฟกลางติดและมีเสียงคลิก ทุกครั้งที่มีเซ็นเซอร์ข้ามเส้น
            // ผู้ใช้จะรู้ได้ทันทีว่าลากแล้วหุ่นเห็นเส้นจริงหรือเปล่า
            if (crossed != blink) {
                blink = crossed
                if (blink) led.plot(2, 1)
                else led.unplot(2, 1)
            }
            if (crossed) music.playTone(1568, 15)
            calSweepProgress(input.runningTime() - t0, total)
            basic.pause(CAL_SWEEP_STEP)
        }
        led.unplot(2, 1)

        // เซ็นเซอร์ทุกตัวเป็นชนิดเดียวกัน ปลายที่เป็น "พื้น" จึงต้องเป็นด้านเดียวกันทั้งชุด
        // เส้นแคบกว่าพื้นมาก ตัวอย่างส่วนใหญ่จึงเป็นพื้น ใช้เสียงข้างมากทั้งชุดตัดสิน
        // แบบนี้ช่องเดียวที่อ่านเพี้ยนจะพลิกขั้วของทั้งชุดไม่ได้
        let loAll = 0
        let hiAll = 0
        for (let i = 0; i < n; i++) {
            loAll += loCnt[i]
            hiAll += hiCnt[i]
        }
        let groundIsLow = loAll >= hiAll

        let failed: number[] = []
        for (let i = 0; i < n; i++) {
            let ch = chs[i]
            // ไม่ผ่านเมื่อช่วงแคบเกิน (ไม่เคยผ่านเส้น) หรือเก็บได้ไม่ครบทั้งสองปลาย
            // (หยุดลากไปก่อนช่วงที่ 2 จบ) ช่องที่ไม่ผ่านจะคงค่าเดิมไว้ ไม่เขียนทับของดี
            let minRange = Math.idiv(CAL_SWEEP_MIN_RANGE * adcFullScale(), 4095)
            if (vmax[i] - vmin[i] < minRange || loCnt[i] == 0 || hiCnt[i] == 0) {
                failed.push(ch)
                continue
            }
            let loAvg = Math.round(loSum[i] / loCnt[i])
            let hiAvg = Math.round(hiSum[i] / hiCnt[i])
            if (groundIsLow) {
                Cal_Bg_Ch[ch] = loAvg
                Cal_Line_Ch[ch] = hiAvg
            }
            else {
                Cal_Bg_Ch[ch] = hiAvg
                Cal_Line_Ch[ch] = loAvg
            }
            Cal_Has_Ch[ch] = true
        }
        applyCal()

        if (failed.length == 0) {
            music.playTone(784, music.beat(BeatFraction.Quarter))
            music.playTone(988, music.beat(BeatFraction.Quarter))
            basic.showIcon(IconNames.Yes, 500)
        }
        else {
            music.playTone(262, music.beat(BeatFraction.Half))
            music.playTone(196, music.beat(BeatFraction.Half))
            basic.showIcon(IconNames.No, 500)
            // บอกเลขช่องที่ไม่ผ่าน จะได้ลากใหม่ให้ครอบคลุมตัวที่พลาด
            let msg = "FAIL"
            for (let i = 0; i < failed.length; i++) msg += " " + failed[i]
            basic.showString(msg)
        }
        basic.clearScreen()

        // แสดงค่าที่อ่านได้ทันทีหลังสอนเสร็จ
        if (oledIsReady()) oledShowCalibration()
    }

    /**
     * Calibrate Sensor
     */
    export function SensorCalibrate(adc_pin: number[]): void {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let _Sensor_PIN = validChannels(adc_pin)
        let _Num_Sensor = _Sensor_PIN.length

        // เก็บค่าคาลิเบรตตาม "หมายเลขช่อง ADC" (0-7) ไม่ใช่ตามลำดับใน adc_pin
        // เพื่อให้จับคู่กับ Sensor_PIN / Sensor_Left / Sensor_Right ได้ถูกต้อง
        // ไม่ว่าจะส่ง adc_pin มาเรียงลำดับแบบไหน
        let Line_Cal = [0, 0, 0, 0, 0, 0, 0, 0]
        let Background_Cal = [0, 0, 0, 0, 0, 0, 0, 0]

        setLineLED(true)

        music.playTone(587, music.beat(BeatFraction.Quarter))
        music.playTone(784, music.beat(BeatFraction.Quarter))

        ////Calibrate Follower Line
        waitButtonA()
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Line_Cal[_Sensor_PIN[j]] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let j = 0; j < _Num_Sensor; j++) {
            Line_Cal[_Sensor_PIN[j]] = Line_Cal[_Sensor_PIN[j]] / 20
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))

        ////Calibrate Background
        waitButtonA()
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Background_Cal[_Sensor_PIN[j]] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let j = 0; j < _Num_Sensor; j++) {
            Background_Cal[_Sensor_PIN[j]] = Background_Cal[_Sensor_PIN[j]] / 20
        }

        // เก็บลงคลังตามหมายเลขช่อง เฉพาะช่องที่วัดในรอบนี้
        // ช่องอื่นคงค่าเดิมไว้ จึงแยกคาลิเบรตหลายรอบได้ตามคู่มือ PT KidsBIT
        let bad = false
        for (let j = 0; j < _Num_Sensor; j++) {
            let ch = _Sensor_PIN[j]
            if (!validCh(ch)) continue
            Cal_Line_Ch[ch] = Line_Cal[ch]
            Cal_Bg_Ch[ch] = Background_Cal[ch]
            Cal_Has_Ch[ch] = true
            if (Line_Cal[ch] == Background_Cal[ch]) bad = true
        }
        applyCal()

        if (bad) {
            // เส้นกับพื้นให้ค่าเท่ากัน แปลว่าคาลิเบรตไม่ผ่าน (เสียงต่ำ 2 ครั้ง)
            music.playTone(262, music.beat(BeatFraction.Half))
            music.playTone(196, music.beat(BeatFraction.Half))
        }
        else {
            music.playTone(784, music.beat(BeatFraction.Quarter))
            music.playTone(587, music.beat(BeatFraction.Quarter))
        }
        basic.pause(500)
    }

    anglesRead(Angle.Yaw)
}
