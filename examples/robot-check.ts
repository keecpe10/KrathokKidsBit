// โปรแกรมทดสอบหุ่นทีละขั้น (KrathokKidsBit v2.4+)
// วิธีใช้: สร้างโปรเจกต์ใหม่ เพิ่มส่วนขยาย KrathokKidsBit แล้ววางโค้ดนี้ในแท็บ JavaScript
// แต่ละขั้น จอ OLED จะบอกว่าต้องวางหุ่นอย่างไร กด A = เริ่มทดสอบ, B = ข้ามขั้นนี้
// จบแต่ละขั้นจะแสดงผลค้างไว้ กด A เพื่อไปขั้นถัดไป (ผลส่งออกทางสาย USB ด้วย)
//
// err = หุ่นหยุดเยื้องจากกลางเส้นเท่าไร (0 = ตรงกลางพอดี, 1000 = เยื้องหนึ่งช่องเซ็นเซอร์)

// ---- ค่าของหุ่นตัวนี้ (แก้ให้ตรงกับหุ่นของตัวเอง) ----
KrathokKidsBit.oledInit(OLED_Address.Addr_0x3C, true)
KrathokKidsBit.lineTuning(Kids_Band.All, 0.02, 0.02)
KrathokKidsBit.lineReading(50, 120)
KrathokKidsBit.setSensorCal([929, 1667, 1514, 1362, 1273, 969, 595, 558], [3724, 3833, 3829, 3830, 3814, 3782, 2312, 2450])

const CENTER = 2500   // กลางเส้นของเซ็นเซอร์กลาง 6 ตัว
const TURN_OK = 400   // เยื้องไม่เกินนี้ถือว่าเลี้ยวตรง

function say(line: number, text: string) {
    KrathokKidsBit.oledShowLine(text, line)
    serial.writeLine(text)
}

// แสดงชื่อขั้นกับวิธีวางหุ่น แล้วรอ A (ทดสอบ) หรือ B (ข้าม)
function step(name: string, hint1: string, hint2: string): boolean {
    KrathokKidsBit.oledClear()
    say(1, name)
    say(3, hint1)
    say(4, hint2)
    KrathokKidsBit.oledShowLine("A = test  B = skip", 8)
    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            while (input.buttonIsPressed(Button.A)) basic.pause(20)
            KrathokKidsBit.oledClear()
            say(1, name)
            basic.pause(300)
            return true
        }
        if (input.buttonIsPressed(Button.B)) {
            while (input.buttonIsPressed(Button.B)) basic.pause(20)
            serial.writeLine(name + " SKIPPED")
            return false
        }
        basic.pause(20)
    }
}

// ค้างผลไว้จนกด A
function next() {
    KrathokKidsBit.oledShowLine("A = next", 8)
    KrathokKidsBit.waitForButton(Kids_Button.A)
}

function lineErr(): number {
    return Math.abs(KrathokKidsBit.GETPosition() - CENTER)
}

function judge(err: number, limit: number): string {
    return err <= limit ? "OK" : "CHECK"
}

// ---- 1 ฮาร์ดแวร์ ----
if (step("1/8 HARDWARE", "any place", "")) {
    KrathokKidsBit.oledHardwareCheck()
    next()
}

// ---- 2 มอเตอร์ทีละตัว: ทุกล้อต้องหมุนไปทางเดินหน้า ----
if (step("2/8 MOTORS", "LIFT ROBOT UP", "each wheel = FWD?")) {
    let names = ["M1 left", "M2 left", "M3 right", "M4 right"]
    let motors = [Kids_Motor.M1, Kids_Motor.M2, Kids_Motor.M3, Kids_Motor.M4]
    for (let i = 0; i < 4; i++) {
        say(3, names[i] + " FWD")
        KrathokKidsBit.motorRun(motors[i], Kids_MotorDir.Forward, 40, 0.8)
        basic.pause(300)
    }
    say(3, "all wheels FWD")
    KrathokKidsBit.robotMove(Kids_Move.Forward, 40, 0.8)
    next()
}

// ---- 3 เซ็นเซอร์เส้น: เลื่อนหุ่นข้ามเส้น แท่งต้องไล่ซ้ายไปขวาตามจริง ----
if (step("3/8 LINE SENSORS", "slide robot over", "line, A = done")) {
    while (!input.buttonIsPressed(Button.A)) {
        KrathokKidsBit.oledLineSensorBars()
    }
    while (input.buttonIsPressed(Button.A)) basic.pause(20)
}

// ---- 4 เดินตามเส้นไปทางแยกแรก ----
if (step("4/8 TO JUNCTION", "put on line,", "junction ahead")) {
    let t = input.runningTime()
    KrathokKidsBit.lineToJunction(Kids_Junction.Center, 1, 60)
    say(3, "time " + (input.runningTime() - t) + " ms")
    say(4, "stopped at junction?")
    next()
}

// ---- 5 เลี้ยวซ้ายแล้วเลี้ยวขวา: ดูว่าหยุดตรงกลางเส้นแค่ไหน ----
if (step("5/8 TURN L + R", "put at junction", "(after step 4)")) {
    let t = input.runningTime()
    KrathokKidsBit.lineTurn(Kids_LeftRight.Left, 50)
    let tl = input.runningTime() - t
    basic.pause(300)
    let el = lineErr()
    say(3, "L " + tl + "ms err " + el + " " + judge(el, TURN_OK))
    basic.pause(500)
    t = input.runningTime()
    KrathokKidsBit.lineTurn(Kids_LeftRight.Right, 50)
    let tr = input.runningTime() - t
    basic.pause(300)
    let er = lineErr()
    say(4, "R " + tr + "ms err " + er + " " + judge(er, TURN_OK))
    next()
}

// ---- 6 วิ่งเร็วนับ 2 ทางแยกแล้วเลี้ยวซ้าย (แบบโปรแกรมแข่ง) ----
if (step("6/8 FAST RUN", "2 junctions ahead,", "speed 80 + turn L")) {
    let t = input.runningTime()
    KrathokKidsBit.lineToJunction(Kids_Junction.Center, 2, 80, Kids_Then.TurnLeft, 50)
    basic.pause(300)
    let e = lineErr()
    say(3, "time " + (input.runningTime() - t) + " ms")
    say(4, "err " + e + " " + judge(e, TURN_OK))
    say(5, "counted 2 junctions?")
    next()
}

// ---- 7 เดินตามเส้นไปจนเจอสิ่งกีดขวาง (ตั้งหยุดที่ 15 ซม.) ----
if (step("7/8 OBSTACLE", "line + box ahead", "stop at 15 cm")) {
    KrathokKidsBit.lineToObstacle(15, 40)
    basic.pause(300)
    say(3, "distance " + KrathokKidsBit.kidsDistance() + " cm")
    say(4, "no crash?")
    next()
}

// ---- 8 เซอร์โวค่อยๆ หมุน และแขนกล ----
if (step("8/8 SERVO + ARM", "servo on ch 1,2", "B = skip if none")) {
    say(3, "servo 1 smooth")
    KrathokKidsBit.kidsServo(Kids_Servo.S0, 90)
    basic.pause(500)
    KrathokKidsBit.kidsServoSmooth(Kids_Servo.S0, 20, 1.5)
    KrathokKidsBit.kidsServoSmooth(Kids_Servo.S0, 160, 1.5)
    KrathokKidsBit.kidsServoSmooth(Kids_Servo.S0, 90, 1)
    say(3, "arm grip + lift")
    KrathokKidsBit.armDo(Kids_ArmAction.ArmUp)
    KrathokKidsBit.armDo(Kids_ArmAction.OpenGrip)
    KrathokKidsBit.armDo(Kids_ArmAction.GripAndLift)
    say(3, "arm place + release")
    KrathokKidsBit.armDo(Kids_ArmAction.PlaceAndRelease)
    say(4, "smooth, no jerk?")
    next()
}

KrathokKidsBit.oledClear()
say(1, "ALL DONE")
basic.showIcon(IconNames.Yes)
