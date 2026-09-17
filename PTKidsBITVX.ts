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
let Line_Mode = 0
let Last_Position = 0
let error = 0
let P = 0
let D = 0
let previous_error = 0
let PD_Value = 0
let left_motor_speed = 0
let right_motor_speed = 0
let last_degree_P8 = 0;
let last_degree_P12 = 0;
let distance = 0
let timer = 0

let BNO055_I2C_ADDR = 0x29
let BNO055_OPR_MODE = 0x3D
let OPERATION_MODE_GYRONLY = 0X03
let OPERATION_MODE_ACCGYRO = 0X05
let OPERATION_MODE_IMUPLUS = 0X08
let OPERATION_MODE_NDOF_FMC_OFF = 0X0B
let OPERATION_MODE_NDOF = 0x0C
let EULER_R_LSB = 0x1C
let EULER_R_MSB = 0x1D
let EULER_P_LSB = 0x1E
let EULER_P_MSB = 0x1F
let EULER_Y_LSB = 0x1A
let EULER_Y_MSB = 0x1B
let initIMU = false
let angle_offset: number[] = []

enum Motor_Write {
    //% block="1"
    Motor_1,
    //% block="2"
    Motor_2,
    //% block="3"
    Motor_3,
    //% block="4"
    Motor_4
}

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

enum Button_Status {
    //% block="Pressed"
    Pressed,
    //% block="Released"
    Released
}

enum Button_Pin {
    //% block="P1"
    P1,
    //% block="P2"
    P2,
    //% block="P8"
    P8,
    //% block="P12"
    P12
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

enum Angle {
    //% block="Yaw"
    Yaw,
    //% block="Pitch"
    Pitch,
    //% block="Roll"
    Roll
}

//% color="#51cbc7" icon="\u2B9A"
namespace PTKidsBITVX {
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

    //% group="Motor Control"
    /**
     * Stop all Motor
     */
    //% block="Motor Stop"
    export function motorStop(): void {
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        motorGo(0, 0, 0, 0)
    }

    //% group="Motor Control"
    /**
     * Forward or Backward with degrees.
     */
    //% block="Direction %Forward_Direction|Time %time|Go Degree %degrees|Min Speed %min_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% degrees.min=-180 degrees.max=180
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% time.shadow="timePicker"
    //% time.defl=500
    //% min_speed.defl=70
    //% max_speed.defl=100
    //% kp.defl=2
    //% kd.defl=1
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

            left_motor_speed = min_speed + PD_Value
            right_motor_speed = min_speed - PD_Value

            if (left_motor_speed > max_speed) {
                left_motor_speed = max_speed
            }
            else if (left_motor_speed < -max_speed) {
                left_motor_speed = -max_speed
            }

            if (right_motor_speed > max_speed) {
                right_motor_speed = max_speed
            }
            else if (right_motor_speed < -max_speed) {
                right_motor_speed = -max_speed
            }

            if (direction == Forward_Direction.Forward) {
                motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
            }
            else {
                motorGo(-right_motor_speed, -right_motor_speed, -left_motor_speed, -left_motor_speed)
            }
        }
        motorStop()
    }

    //% group="Motor Control"
    /**
     * Forward or Backward with degrees.
     */
    //% block="Direction %Forward_Direction|Go Degree %degrees|Min Speed %min_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% degrees.min=-180 degrees.max=180
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% min_speed.defl=70
    //% max_speed.defl=100
    //% kp.defl=2
    //% kd.defl=1
    export function goWithDegrees(direction: Forward_Direction, degrees: number, min_speed: number, max_speed: number, kp: number, kd: number) {
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

        left_motor_speed = min_speed + PD_Value
        right_motor_speed = min_speed - PD_Value

        if (left_motor_speed > max_speed) {
            left_motor_speed = max_speed
        }
        else if (left_motor_speed < -max_speed) {
            left_motor_speed = -max_speed
        }

        if (right_motor_speed > max_speed) {
            right_motor_speed = max_speed
        }
        else if (right_motor_speed < -max_speed) {
            right_motor_speed = -max_speed
        }

        if (direction == Forward_Direction.Forward) {
            motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
        }
        else {
            motorGo(-right_motor_speed, -right_motor_speed, -left_motor_speed, -left_motor_speed)
        }
    }

    //% group="Motor Control"
    /**
     * Spin the Robot to Degrees.
     */
    //% block="Spin Degree %degrees|Low Degree\n %low_degrees|Min Speed\n\n %min_speed|Max Speed\n\n %max_speed"
    //% degrees.min=-180 degrees.max=180
    //% low_degrees.min=0 low_degrees.max=180
    //% min_speed.min=10 min_speed.max=100
    //% max_speed.min=10 max_speed.max=100
    //% degrees.defl=90
    //% low_degrees.defl=80
    //% min_speed.defl=20
    //% max_speed.defl=100
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

    //% group="Motor Control"
    /**
     * Turn the Robot to Degrees.
     */
    //% block="Direction\n\n %Forward_Direction|Turn Degree %degrees|Low Degree\n %low_degrees|Min Speed\n\n %min_speed|Max Speed\n\n %max_speed"
    //% degrees.min=-180 degrees.max=180
    //% low_degrees.min=0 low_degrees.max=180
    //% min_speed.min=10 min_speed.max=100
    //% max_speed.min=10 max_speed.max=100
    //% degrees.defl=90
    //% low_degrees.defl=45
    //% min_speed.defl=20
    //% max_speed.defl=100
    export function turnDegrees(direction: Forward_Direction, degrees: number, low_degrees: number, min_speed: number, max_speed: number): void {
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

            let pd_value = error_yaw * (max_speed * 0.02)

            if (Math.abs(error_yaw) < low_degrees) {
                if (error_yaw < -0.3) {
                    if (direction == Forward_Direction.Forward) motorGo(min_speed / 4, min_speed / 4, min_speed, min_speed)
                    else if (direction == Forward_Direction.Backward) motorGo(-min_speed, -min_speed, -min_speed / 4, -min_speed / 4)
                }
                else if (error_yaw > 0.3) {
                    if (direction == Forward_Direction.Forward) motorGo(min_speed, min_speed, min_speed / 4, min_speed / 4)
                    else if (direction == Forward_Direction.Backward) motorGo(-min_speed / 4, -min_speed / 4, -min_speed, -min_speed)
                }
                else {
                    motorStop()
                    break;
                }
            }
            else {
                if (error_yaw < 0) {
                    if (direction == Forward_Direction.Forward) motorGo(min_speed / 4, min_speed / 4, -pd_value, -pd_value)
                    else if (direction == Forward_Direction.Backward) motorGo(pd_value, pd_value, -min_speed / 4, -min_speed / 4)
                } else if (error_yaw > 0) {
                    if (direction == Forward_Direction.Forward) motorGo(pd_value, pd_value, min_speed / 4, min_speed / 4)
                    else if (direction == Forward_Direction.Backward) motorGo(-min_speed / 4, -min_speed / 4, -pd_value, -pd_value)
                }
                timer_turn = control.millis()
            }
        }
    }

    //% group="Motor Control"
    /**
     * Spin the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Spin %_Spin|Speed %Speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function Spin(spin: _Spin, speed: number): void {
        if (spin == _Spin.Left) {
            motorGo(-speed, -speed, speed, speed)
        }
        else if (spin == _Spin.Right) {
            motorGo(speed, speed, -speed, -speed)
        }
    }

    //% group="Motor Control"
    /**
     * Turn the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Turn %_Turn|Speed %Speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    export function Turn(turn: _Turn, speed: number): void {
        if (turn == _Turn.Left) {
            motorGo(0, 0, speed, speed)
        }
        else if (turn == _Turn.Right) {
            motorGo(speed, speed, 0, 0)
        }
    }

    //% group="Motor Control"
    /**
     * Control motors speed both at the same time. The speed motors is adjustable between -100 to 100.
     */
    //% block="Motor 1 %Motor1|Motor 2 %Motor2|Motor 3 %Motor3|Motor 4 %Motor4"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% speed3.min=-100 speed3.max=100
    //% speed4.min=-100 speed4.max=100
    //% speed1.defl=50
    //% speed2.defl=50
    //% speed3.defl=50
    //% speed4.defl=50
    export function motorGo(speed1: number, speed2: number, speed3: number, speed4: number): void {
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

    //% group="Motor Control"
    /**
     * Control motor speed 1 channel. The speed motor is adjustable between -100 to 100.
     */
    //% block="Motor %Motor_Write|Speed %Speed"
    //% speed.min=-100 speed.max=100
    //% speed.defl=50
    export function motorWrite(motor: Motor_Write, speed: number): void {
        speed = pins.map(speed, -100, 100, -1023, 1023)

        if (speed < -1023) speed = -1023
        else if (speed > 1023) speed = 1023

        if (motor == Motor_Write.Motor_1) {
            if (speed < 0) {
                analogWritePCA(13, 0)
                pins.analogWritePin(AnalogPin.P14, -speed)
                pins.analogSetPeriod(AnalogPin.P14, 2000)
            }
            else if (speed >= 0) {
                analogWritePCA(13, 4095)
                pins.analogWritePin(AnalogPin.P14, speed)
                pins.analogSetPeriod(AnalogPin.P14, 2000)
            }
        }
        else if (motor == Motor_Write.Motor_2) {
            if (speed < 0) {
                analogWritePCA(12, 0)
                pins.analogWritePin(AnalogPin.P13, -speed)
                pins.analogSetPeriod(AnalogPin.P13, 2000)
            }
            else if (speed >= 0) {
                analogWritePCA(12, 4095)
                pins.analogWritePin(AnalogPin.P13, speed)
                pins.analogSetPeriod(AnalogPin.P13, 2000)
            }
        }
        else if (motor == Motor_Write.Motor_3) {
            if (speed < 0) {
                analogWritePCA(14, 0)
                pins.analogWritePin(AnalogPin.P16, -speed)
                pins.analogSetPeriod(AnalogPin.P16, 2000)
            }
            else if (speed >= 0) {
                analogWritePCA(14, 4095)
                pins.analogWritePin(AnalogPin.P16, speed)
                pins.analogSetPeriod(AnalogPin.P16, 2000)
            }
        }
        else if (motor == Motor_Write.Motor_4) {
            if (speed < 0) {
                analogWritePCA(15, 0)
                pins.analogWritePin(AnalogPin.P15, -speed)
                pins.analogSetPeriod(AnalogPin.P15, 2000)
            }
            else if (speed >= 0) {
                analogWritePCA(15, 4095)
                pins.analogWritePin(AnalogPin.P15, speed)
                pins.analogSetPeriod(AnalogPin.P15, 2000)
            }
        }
    }

    //% group="Servo Control"
    /**
     * Control Servo Motor 0 - 180 Degrees
     */
    //% block="Servo %Servo_Write|Degree %Degree"
    //% degree.min=0 degree.max=180
    //% degree.defl=90
    export function servoWrite(servo: Servo_Write, degree: number): void {
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

    //% group="Sensor and ADC"
    /**
     * Read Angles from IMU
     */
    //% block="Read Angle %Angle"
    //% offset.min=-180 offset.max=180
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

    //% group="Sensor and ADC"
    /**
     * Set IMU offset to 0
     */
    //% block="Set Angle Offset %Angle"
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

    //% group="Sensor and ADC"
    /**
     * Read Distance from Ultrasonic Sensor
     */
    //% block="Read Distance Triger %Trigger_PIN|Echo %Echo_PIN"
    //% Echo_PIN.defl=Ultrasonic_PIN.P2
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

    //% group="Sensor and ADC"
    /**
     * Read Analog from ADC Channel
     */
    //% block="Read ADC %ADC_Read"
    export function ADCRead(ADCRead: ADC_Read): number {
        pins.i2cWriteNumber(0x48, ADCRead, NumberFormat.UInt8LE, false)
        control.waitMicros(100)
        return ADCRead = pins.i2cReadNumber(0x48, NumberFormat.UInt16BE, false)
    }

    //% group="Line Follower"
    /**
     * Turn Left or Right Follower Line Mode
     */
    //% block="TurnLINE %turn|Speed\n %speed|Sensor %sensor|Fast Time\n %time|Break Time %break_delay"
    //% speed.min=0 speed.max=100
    //% time.shadow="timePicker"
    //% break_delay.shadow="timePicker"
    //% time.defl=200
    //% break_delay.defl=20
    export function TurnLINE(turn: Turn_Line, speed: number, sensor: number, time: number, break_delay: number) {
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
        let on_line = 0
        let adc_sensor_pin = sensor - 1
        // let position = pins.map(sensor, 1, Num_Sensor, 0, (Num_Sensor - 1) * 1000)
        let error = 0
        let timer = 0
        let motor_speed = 0
        let motor_slow = Math.round(speed / 2)
        while (1) {
            on_line = 0
            for (let i = 0; i < Sensor_PIN.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)) >= 500) {
                    on_line += 1;
                }
            }

            if (on_line == 0) {
                break
            }

            if (turn == Turn_Line.Left) {
                motorGo(-speed, -speed, speed, speed)
            }
            else if (turn == Turn_Line.Right) {
                motorGo(speed, speed, -speed, -speed)
            }
        }
        timer = control.millis()
        while (1) {
            if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[adc_sensor_pin]]), Color_Line[adc_sensor_pin], Color_Background[adc_sensor_pin], 1000, 0)) >= 500) {
                basic.pause(break_delay)
                motorStop()
                break
            }
            else {
                error = timer - (control.millis() - time)
                motor_speed = error

                if (motor_speed > 100) {
                    motor_speed = 100
                }
                else if (motor_speed < 0) {
                    motor_speed = motor_slow
                }

                if (turn == Turn_Line.Left) {
                    motorGo(-motor_speed, -motor_speed, motor_speed, motor_speed)
                }
                else if (turn == Turn_Line.Right) {
                    motorGo(motor_speed, motor_speed, -motor_speed, -motor_speed)
                }
            }
        }
    }

    //% group="Line Follower"
    /**
     * Line Follower Forward Timer
     */
    //% block="Direction %Forward_Direction|Time %time|Min Speed %base_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% time.shadow="timePicker"
    //% time.defl=200
    export function ForwardTIME(direction: Forward_Direction, time: number, min_speed: number, max_speed: number, kp: number, kd: number) {
        let timer = control.millis()
        previous_error = 0
        while (control.millis() - timer < time) {
            error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
            P = error
            D = error - previous_error
            PD_Value = (kp * P) + (kd * D)
            previous_error = error

            left_motor_speed = min_speed - PD_Value
            right_motor_speed = min_speed + PD_Value

            if (left_motor_speed > max_speed) {
                left_motor_speed = max_speed
            }
            else if (left_motor_speed < -max_speed) {
                left_motor_speed = -max_speed
            }

            if (right_motor_speed > max_speed) {
                right_motor_speed = max_speed
            }
            else if (right_motor_speed < -max_speed) {
                right_motor_speed = -max_speed
            }

            if (direction == Forward_Direction.Forward) {
                motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
            }
            else {
                motorGo(-left_motor_speed, -left_motor_speed, -right_motor_speed, -right_motor_speed)
            }
        }
        motorStop()
    }

    //% group="Line Follower"
    /**
     * Line Follower Forward with Counter Line
     */
    //% block="Direction %Forward_Direction|Find %Find_Line|Count Line %count|Min Speed\n %base_speed|Max Speed\n %max_speed|Break Time %break_time|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% break_time.shadow="timePicker"
    //% count.defl=2
    //% break_time.defl=20
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

    //% group="Line Follower"
    /**
     * Line Follower Forward
     */
    //% block="Direction %Forward_Direction|Find %Find_Line|Min Speed\n %base_speed|Max Speed\n %max_speed|Break Time %break_time|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% break_time.shadow="timePicker"
    //% break_time.defl=20
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
        previous_error = 0

        while (1) {
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
            for (let i = 0; i < Sensor_PIN.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)) >= 200) {
                    last_center += 1
                }
            }

            error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
            P = error
            D = error - previous_error
            PD_Value = (kp * P) + (kd * D)
            previous_error = error

            if (direction == Forward_Direction.Forward) {
                left_motor_speed = min_speed - PD_Value
                right_motor_speed = min_speed + PD_Value
            }
            else {
                left_motor_speed = min_speed + PD_Value
                right_motor_speed = min_speed - PD_Value
            }

            if (left_motor_speed > max_speed) {
                left_motor_speed = max_speed
            }
            else if (left_motor_speed < -max_speed) {
                left_motor_speed = -max_speed
            }

            if (right_motor_speed > max_speed) {
                right_motor_speed = max_speed
            }
            else if (right_motor_speed < -max_speed) {
                right_motor_speed = -max_speed
            }

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

    //% group="Line Follower"
    /**
     * Basic Line Follower
     */
    //% block="Min Speed %base_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    export function Follower(min_speed: number, max_speed: number, kp: number, kd: number) {
        error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
        P = error
        D = error - previous_error
        PD_Value = (kp * P) + (kd * D)
        previous_error = error

        left_motor_speed = min_speed - PD_Value
        right_motor_speed = min_speed + PD_Value

        if (left_motor_speed > max_speed) {
            left_motor_speed = max_speed
        }
        else if (left_motor_speed < -max_speed) {
            left_motor_speed = -max_speed
        }

        if (right_motor_speed > max_speed) {
            right_motor_speed = max_speed
        }
        else if (right_motor_speed < -max_speed) {
            right_motor_speed = -max_speed
        }

        motorGo(left_motor_speed, left_motor_speed, right_motor_speed, right_motor_speed)
    }

    //% group="Line Follower"
    /**
     * Get Position Line
     */
    //% block="GETPosition"
    export function GETPosition() {
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
        let Average = 0
        let Sum_Value = 0
        let ON_Line = 0

        for (let i = 0; i < Num_Sensor; i++) {
            let Value_Sensor = 0;
            if (Line_Mode == 0) {
                Value_Sensor = pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)
                if (Value_Sensor < 0) {
                    Value_Sensor = 0
                }
                else if (Value_Sensor > 1000) {
                    Value_Sensor = 1000
                }
            }
            else {
                Value_Sensor = pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Background[i], Color_Line[i], 1000, 0)
                if (Value_Sensor < 0) {
                    Value_Sensor = 0
                }
                else if (Value_Sensor > 1000) {
                    Value_Sensor = 1000
                }
            }
            if (Value_Sensor > 200) {
                ON_Line = 1;
                Average += Value_Sensor * (i * 1000)
                Sum_Value += Value_Sensor
            }
        }
        if (ON_Line == 0) {
            if (Last_Position < (Num_Sensor - 1) * 1000 / 2) {
                return (Num_Sensor - 1) * 1000
            }
            else {
                return 0
            }
        }
        Last_Position = Average / Sum_Value;
        return Math.round(((Num_Sensor - 1) * 1000) - Last_Position)
    }

    //% group="Line Follower"
    /**
     * Print Sensor Value
     */
    //% block="PrintSensorValue"
    export function PrintSensorValue() {
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

        let sensor_left = "Sensor Left:"
        let sensor_center = "Sensor Center:"
        let sensor_right = "Sensor Right:"

        for (let i = 0; i < Sensor_Left.length; i++) {
            sensor_left += " " + ADCRead(ADC_PIN[Sensor_Left[i]])
        }

        for (let i = 0; i < Sensor_PIN.length; i++) {
            sensor_center += " " + ADCRead(ADC_PIN[Sensor_PIN[i]])
        }

        for (let i = 0; i < Sensor_Right.length; i++) {
            sensor_right += " " + ADCRead(ADC_PIN[Sensor_Right[i]])
        }

        serial.writeLine("" + sensor_left)
        serial.writeLine("" + sensor_center)
        serial.writeLine("" + sensor_right)
    }

    //% group="Line Follower"
    /**
     * Set Value Sensor
     */
    //% block="SETColorLine\n\n $line_center|Line Left\n\n\n\n\n $line_left|Line Right\n\n\n\n $line_right|SETColorGround $ground_center|Ground Left\n\n\n $ground_left|Ground Right\n\n $ground_right"
    export function ValueSensorSET(line_center: number[], line_left: number[], line_right: number[], ground_center: number[], ground_left: number[], ground_right: number[]): void {
        Color_Line = line_center
        Color_Line_Left = line_left
        Color_Line_Right = line_right
        Color_Background = ground_center
        Color_Background_Left = ground_left
        Color_Background_Right = ground_right
    }

    //% group="Line Follower"
    /**
     * Set Line Sensor Pin
     */
    //% block="LINESensorSET $adc_pin|Sensor Left\n\n $sensor_left|Sensor Right\n $sensor_right|ON OFF Sensor $led_pin"
    export function LINESensorSET(adc_pin: number[], sensor_left: number[], sensor_right: number[], led_pin: LED_Pin): void {
        Sensor_PIN = adc_pin
        Sensor_Left = sensor_left
        Sensor_Right = sensor_right
        Num_Sensor = Sensor_PIN.length
        LED_PIN = led_pin
    }

    //% group="Line Follower"
    /**
     * Calibrate Sensor
     */
    //% block="SensorCalibrate $adc_pin"
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
        let _Sensor_PIN = adc_pin
        let _Num_Sensor = _Sensor_PIN.length
        let Line_Cal = [0, 0, 0, 0, 0, 0, 0, 0]
        let Background_Cal = [0, 0, 0, 0, 0, 0, 0, 0]

        music.playTone(587, music.beat(BeatFraction.Quarter))
        music.playTone(784, music.beat(BeatFraction.Quarter))
        ////Calibrate Follower Line
        while (!input.buttonIsPressed(Button.A));
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Line_Cal[j] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let i = 0; i < _Num_Sensor; i++) {
            Line_Cal[i] = Line_Cal[i] / 20
            for (let j = 0; j < Sensor_Left.length; j++) {
                if (Sensor_Left[j] == _Sensor_PIN[i]) {
                    Color_Line_Left.push(Line_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_PIN.length; j++) {
                if (Sensor_PIN[j] == _Sensor_PIN[i]) {
                    Color_Line.push(Line_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_Right.length; j++) {
                if (Sensor_Right[j] == _Sensor_PIN[i]) {
                    Color_Line_Right.push(Line_Cal[i])
                }
            }
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))

        ////Calibrate Background
        while (!input.buttonIsPressed(Button.A));
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Background_Cal[j] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let i = 0; i < _Num_Sensor; i++) {
            Background_Cal[i] = Background_Cal[i] / 20
            for (let j = 0; j < Sensor_Left.length; j++) {
                if (Sensor_Left[j] == _Sensor_PIN[i]) {
                    Color_Background_Left.push(Background_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_PIN.length; j++) {
                if (Sensor_PIN[j] == _Sensor_PIN[i]) {
                    Color_Background.push(Background_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_Right.length; j++) {
                if (Sensor_Right[j] == _Sensor_PIN[i]) {
                    Color_Background_Right.push(Background_Cal[i])
                }
            }
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))
        music.playTone(587, music.beat(BeatFraction.Quarter))
        basic.pause(500)
    }

    anglesRead(Angle.Yaw)
}
