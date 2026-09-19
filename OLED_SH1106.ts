/**
 * OLED 1.3 inch (SH1106, 128x64, I2C) for KrathokKidsBit
 * Ported from Adafruit_SH110X (Adafruit_SH1106G) + Adafruit GFX classic 5x7 font
 * Wiring: VCC -> 3V3, GND -> GND, SCL -> P19 (SCL), SDA -> P20 (SDA)
 */

enum OLED_SensorView {
    //% block="ค่าเซ็นเซอร์เส้น"
    Values,
    //% block="กราฟแท่งเซ็นเซอร์เส้น"
    Bars,
    //% block="ค่าเซ็นเซอร์รายช่อง"
    Channels,
    //% block="ค่าคาลิเบรต"
    Calibration,
    //% block="ตรวจสอบฮาร์ดแวร์"
    Hardware
}

enum OLED_Address {
    //% block="0x3C"
    Addr_0x3C = 0x3C,
    //% block="0x3D"
    Addr_0x3D = 0x3D
}

enum OLED_Color {
    //% block="ขาว"
    White = 1,
    //% block="ดำ"
    Black = 0,
    //% block="สลับสี"
    Inverse = 2
}

enum OLED_Fill {
    //% block="เส้นขอบ"
    Outline,
    //% block="ทึบ"
    Filled
}

namespace KrathokKidsBit {
    const OLED_W = 128
    const OLED_H = 64
    const OLED_PAGE_OFFSET = 2 // SH1106 RAM is 132 columns; visible area starts at column 2

    let oledAddr = 0x3C
    let oledReady = false
    let oledAuto = true
    let oledFlip180 = false
    let oledDirty = 0
    let oledBuf: Buffer = null
    let oledCmd1: Buffer = null
    let oledCmd2: Buffer = null
    let oledCmd4: Buffer = null
    let oledData: Buffer = null

    // Adafruit GFX glcdfont, ASCII 32..126, 5 bytes per char (column bitmaps, bit0 = top)
    const OLED_FONT = hex`
000000000000005f00000007000700147f147f14242a7f2a12231308646236495620500008070300001c2241000041221c00
2a1c7f1c2a08083e080800807030000808080808000060600020100804023e5149453e00427f400072494949462141494d33
1814127f1027454545393c4a49493141211109073649494936464949291e0000140000004034000000081422411414141414
004122140802015909063e415d594e7c1211127c7f494949363e414141227f4141413e7f494949417f090909013e41415173
7f0808087f00417f41002040413f017f081422417f404040407f021c027f7f0408107f3e4141413e7f090909063e4151215e
7f09192946264949493203017f01033f4040403f1f2040201f3f4038403f631408146303047804036159494d43007f414141
0204081020004141417f04020102044040404040000307080020545478407f284444383844444428384444287f3854545418
00087e090218a4a49c787f0804047800447d40002040403d007f1028440000417f40007c047804787c080404783844444438
fc1824241818242418fc7c08040408485454542404043f44243c4040207c1c2040201c3c4030403c44281028444c9090907c
4464544c440008364100000077000000413608000201020402
`

    function oledCommand(c: number): void {
        oledCmd1[0] = 0x00
        oledCmd1[1] = c
        pins.i2cWriteBuffer(oledAddr, oledCmd1, false)
    }

    function oledCommand2(c: number, v: number): void {
        oledCmd2[0] = 0x00
        oledCmd2[1] = c
        oledCmd2[2] = v
        pins.i2cWriteBuffer(oledAddr, oledCmd2, false)
    }

    /**
     * กำหนดทิศทางการวางภาพของ SH1106
     * 0xA1/0xC8 = ปกติ, 0xA0/0xC0 = กลับหัว (หมุน 180 องศา)
     * แผงจอ 128 จุดถูกต่อไว้กลาง RAM 132 คอลัมน์ (SEG2-SEG129)
     * ระยะเยื้อง OLED_PAGE_OFFSET จึงเท่ากับ 2 เท่ากันทั้งสองทิศทาง
     */
    function oledApplyRotation(): void {
        if (oledFlip180) {
            oledCommand(0xA0)        // segment remap ปกติ
            oledCommand(0xC0)        // COM scan เพิ่มขึ้น
        }
        else {
            oledCommand(0xA1)        // segment remap กลับ
            oledCommand(0xC8)        // COM scan ลดลง
        }
    }

    function oledBegin(addr: number): void {
        oledAddr = addr
        if (!oledBuf) {
            oledBuf = pins.createBuffer(OLED_W * 8)
            oledCmd1 = pins.createBuffer(2)
            oledCmd2 = pins.createBuffer(3)
            oledCmd4 = pins.createBuffer(4)
            oledData = pins.createBuffer(33)
        }
        oledReady = true
        // Init sequence from Adafruit_SH1106G::begin()
        oledCommand(0xAE)            // display off
        oledCommand2(0xD5, 0x80)     // clock divide
        oledCommand2(0xA8, 0x3F)     // multiplex 64
        oledCommand2(0xD3, 0x00)     // display offset
        oledCommand(0x40)            // start line
        oledCommand2(0xAD, 0x8B)     // DC/DC on
        oledApplyRotation()          // ทิศทางจอ ตามค่าที่ตั้งไว้
        oledCommand2(0xDA, 0x12)     // COM pins
        oledCommand2(0x81, 0xFF)     // contrast
        oledCommand2(0xD9, 0x1F)     // precharge
        oledCommand2(0xDB, 0x40)     // VCOM detect
        oledCommand(0x33)            // VPP 9V
        oledCommand(0xA6)            // normal display
        oledCommand2(0x20, 0x10)     // memory mode
        oledCommand(0xA4)            // display RAM
        basic.pause(100)
        oledCommand(0xAF)            // display on
        oledBuf.fill(0)
        oledDirty = 0xFF
        oledFlush()
    }

    function oledCheck(): void {
        if (!oledReady) oledBegin(oledAddr)
    }

    function oledFlush(): void {
        if (!oledReady || oledDirty == 0) return
        for (let page = 0; page < 8; page++) {
            if ((oledDirty & (1 << page)) == 0) continue
            oledCmd4[0] = 0x00
            oledCmd4[1] = 0xB0 | page
            oledCmd4[2] = OLED_PAGE_OFFSET & 0x0F
            oledCmd4[3] = 0x10 | ((OLED_PAGE_OFFSET >> 4) & 0x0F)
            pins.i2cWriteBuffer(oledAddr, oledCmd4, false)
            // send 128 bytes in 32-byte chunks (column pointer auto-increments)
            for (let col = 0; col < OLED_W; col += 32) {
                oledData[0] = 0x40
                for (let i = 0; i < 32; i++) {
                    oledData[i + 1] = oledBuf[page * OLED_W + col + i]
                }
                pins.i2cWriteBuffer(oledAddr, oledData, false)
            }
        }
        oledDirty = 0
    }

    function oledUpdate(): void {
        if (oledAuto) oledFlush()
    }

    function oledPixel(x: number, y: number, color: number): void {
        x = Math.floor(x)
        y = Math.floor(y)
        if (x < 0 || x >= OLED_W || y < 0 || y >= OLED_H) return
        let page = y >> 3
        let idx = page * OLED_W + x
        let mask = 1 << (y & 7)
        if (color == OLED_Color.White) oledBuf[idx] = oledBuf[idx] | mask
        else if (color == OLED_Color.Black) oledBuf[idx] = oledBuf[idx] & (~mask & 0xFF)
        else oledBuf[idx] = oledBuf[idx] ^ mask
        oledDirty |= (1 << page)
    }

    function oledHLine(x: number, y: number, w: number, color: number): void {
        for (let i = 0; i < w; i++) oledPixel(x + i, y, color)
    }

    function oledVLine(x: number, y: number, h: number, color: number): void {
        for (let i = 0; i < h; i++) oledPixel(x, y + i, color)
    }

    function oledFillRectRaw(x: number, y: number, w: number, h: number, color: number): void {
        for (let i = 0; i < h; i++) oledHLine(x, y + i, w, color)
    }

    function oledLineRaw(x0: number, y0: number, x1: number, y1: number, color: number): void {
        let dx = Math.abs(x1 - x0)
        let dy = -Math.abs(y1 - y0)
        let sx = x0 < x1 ? 1 : -1
        let sy = y0 < y1 ? 1 : -1
        let err = dx + dy
        while (true) {
            oledPixel(x0, y0, color)
            if (x0 == x1 && y0 == y1) break
            let e2 = 2 * err
            if (e2 >= dy) { err += dy; x0 += sx }
            if (e2 <= dx) { err += dx; y0 += sy }
        }
    }

    function oledChar(ch: number, x: number, y: number, size: number, color: number): void {
        if (ch < 32 || ch > 126) ch = 63 // '?'
        let base = (ch - 32) * 5
        for (let col = 0; col < 5; col++) {
            let line = OLED_FONT[base + col]
            for (let row = 0; row < 8; row++) {
                if (line & (1 << row)) {
                    if (size == 1) oledPixel(x + col, y + row, color)
                    else oledFillRectRaw(x + col * size, y + row * size, size, size, color)
                }
            }
        }
    }

    function oledText(text: string, x: number, y: number, size: number, color: number): void {
        size = Math.max(1, Math.min(4, Math.floor(size)))
        let cx = x
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i)
            if (c == 10) { // newline
                cx = x
                y += 8 * size
                continue
            }
            if (cx + 6 * size > OLED_W) { // wrap
                cx = x
                y += 8 * size
            }
            if (color != OLED_Color.Inverse) {
                // opaque background so new text overwrites old text cleanly
                oledFillRectRaw(cx, y, 6 * size, 8 * size, color == OLED_Color.White ? OLED_Color.Black : OLED_Color.White)
            }
            oledChar(c, cx, y, size, color)
            cx += 6 * size
        }
    }

    /**
     * เริ่มใช้จอ OLED 1.3 นิ้ว (SH1106 128x64) ต่อ I2C (SCL=P19, SDA=P20)
     * ถ้าติดจอกลับหัว กด ⊕ แล้วเปิด "หมุนจอ 180 องศา"
     */
    //% group="เริ่มต้นจอ"
    //% subcategory="จอ OLED"
    //% weight=100
    //% block="เริ่มใช้จอ OLED ที่อยู่ %addr||หมุนจอ 180 องศา %rotate"
    //% expandableArgumentMode="toggle"
    //% addr.defl=OLED_Address.Addr_0x3C
    //% rotate.shadow="toggleOnOff" rotate.defl=true
    export function oledInit(addr: OLED_Address, rotate: boolean = false): void {
        oledRotate180(rotate)
        oledBegin(addr)
    }

    /**
     * Clear the whole screen
     */
    //% group="เริ่มต้นจอ"
    //% subcategory="จอ OLED"
    //% weight=99
    //% block="ล้างจอ OLED"
    export function oledClear(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        oledUpdate()
    }

    /**
     * แสดงข้อความหรือตัวเลขที่บรรทัด 1-8 (ลบของเดิมในบรรทัดนั้นก่อน)
     * อยากแสดงชื่อคู่กับค่า ใช้บล็อก "ต่อข้อความ" เช่น ระยะ = 25
     */
    //% group="ข้อความและตัวเลข"
    //% subcategory="จอ OLED"
    //% weight=90
    //% block="จอ OLED แสดง %text|บรรทัดที่ %line"
    //% text.shadow="text" text.defl="Hello"
    //% line.min=1 line.max=8 line.defl=1
    export function oledShowLine(text: any, line: number): void {
        oledCheck()
        line = Math.max(0, Math.min(7, Math.floor(line) - 1))
        oledFillRectRaw(0, line * 8, OLED_W, 8, OLED_Color.Black)
        oledText("" + text, 0, line * 8, 1, OLED_Color.White)
        oledUpdate()
    }

    /**
     * เขียนข้อความหรือตัวเลขที่ตำแหน่ง x (0-127), y (0-63) ขนาด 1-4
     */
    //% group="ข้อความและตัวเลข"
    //% subcategory="จอ OLED"
    //% weight=86
    //% block="จอ OLED เขียน %text|ที่ x %x|y %y|ขนาด %size|สี %color"
    //% text.shadow="text" text.defl="KidsBit"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% size.min=1 size.max=4 size.defl=1
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    export function oledShowString(text: any, x: number, y: number, size: number, color: OLED_Color): void {
        oledCheck()
        oledText("" + text, x, y, size, color)
        oledUpdate()
    }

    /**
     * Draw a single pixel
     */
    //% group="วาดรูป"
    //% subcategory="จอ OLED"
    //% weight=80
    //% block="จอ OLED วาดจุด x %x|y %y|สี %color"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    export function oledDrawPixel(x: number, y: number, color: OLED_Color): void {
        oledCheck()
        oledPixel(x, y, color)
        oledUpdate()
    }

    /**
     * Draw a line from (x0, y0) to (x1, y1)
     */
    //% group="วาดรูป"
    //% subcategory="จอ OLED"
    //% weight=79
    //% block="จอ OLED วาดเส้นตรง จาก x %x0|y %y0|ไป x %x1|y %y1|สี %color"
    //% x0.min=0 x0.max=127 y0.min=0 y0.max=63
    //% x1.min=0 x1.max=127 y1.min=0 y1.max=63 x1.defl=127 y1.defl=63
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    export function oledDrawLine(x0: number, y0: number, x1: number, y1: number, color: OLED_Color): void {
        oledCheck()
        oledLineRaw(Math.floor(x0), Math.floor(y0), Math.floor(x1), Math.floor(y1), color)
        oledUpdate()
    }

    /**
     * Draw a rectangle
     */
    //% group="วาดรูป"
    //% subcategory="จอ OLED"
    //% weight=78
    //% block="จอ OLED วาดสี่เหลี่ยม x %x|y %y|กว้าง %w|สูง %h|แบบ %fill|สี %color"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% w.defl=40 h.defl=20
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    export function oledDrawRect(x: number, y: number, w: number, h: number, fill: OLED_Fill, color: OLED_Color): void {
        oledCheck()
        x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h)
        if (w <= 0 || h <= 0) return
        if (fill == OLED_Fill.Filled) {
            oledFillRectRaw(x, y, w, h, color)
        } else {
            oledHLine(x, y, w, color)
            if (h > 1) oledHLine(x, y + h - 1, w, color)
            if (h > 2) {
                oledVLine(x, y + 1, h - 2, color)
                if (w > 1) oledVLine(x + w - 1, y + 1, h - 2, color)
            }
        }
        oledUpdate()
    }

    /**
     * Draw a circle with center (x, y) and radius r
     */
    //% group="วาดรูป"
    //% subcategory="จอ OLED"
    //% weight=77
    //% block="จอ OLED วาดวงกลม x %x|y %y|รัศมี %r|แบบ %fill|สี %color"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% x.defl=64 y.defl=32 r.defl=10
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    export function oledDrawCircle(x: number, y: number, r: number, fill: OLED_Fill, color: OLED_Color): void {
        oledCheck()
        x = Math.floor(x); y = Math.floor(y); r = Math.floor(r)
        if (r < 0) return
        if (fill == OLED_Fill.Filled) {
            // one vertical line per column, no overlap (works with Inverse)
            for (let dx = -r; dx <= r; dx++) {
                let hh = Math.floor(Math.sqrt(r * r - dx * dx))
                oledVLine(x + dx, y - hh, 2 * hh + 1, color)
            }
        } else {
            let f = 1 - r
            let ddx = 1
            let ddy = -2 * r
            let px = 0
            let py = r
            oledPixel(x, y + r, color)
            oledPixel(x, y - r, color)
            oledPixel(x + r, y, color)
            oledPixel(x - r, y, color)
            while (px < py) {
                if (f >= 0) {
                    py--
                    ddy += 2
                    f += ddy
                }
                px++
                ddx += 2
                f += ddx
                oledPixel(x + px, y + py, color)
                oledPixel(x - px, y + py, color)
                oledPixel(x + px, y - py, color)
                oledPixel(x - px, y - py, color)
                if (px != py) {
                    oledPixel(x + py, y + px, color)
                    oledPixel(x - py, y + px, color)
                    oledPixel(x + py, y - px, color)
                    oledPixel(x - py, y - px, color)
                }
            }
        }
        oledUpdate()
    }

    /**
     * Draw a progress bar (0-100 %)
     */
    //% group="วาดรูป"
    //% subcategory="จอ OLED"
    //% weight=76
    //% block="จอ OLED แถบพลัง x %x|y %y|กว้าง %w|สูง %h|ค่า %value|เปอร์เซ็นต์"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% w.defl=100 h.defl=10
    //% value.min=0 value.max=100 value.defl=50
    //% inlineInputMode=inline
    export function oledProgressBar(x: number, y: number, w: number, h: number, value: number): void {
        oledCheck()
        x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h)
        if (w < 3 || h < 3) return
        value = Math.max(0, Math.min(100, value))
        let fillW = Math.floor((w - 2) * value / 100)
        oledFillRectRaw(x, y, w, h, OLED_Color.Black)
        oledHLine(x, y, w, OLED_Color.White)
        oledHLine(x, y + h - 1, w, OLED_Color.White)
        oledVLine(x, y, h, OLED_Color.White)
        oledVLine(x + w - 1, y, h, OLED_Color.White)
        oledFillRectRaw(x + 1, y + 1, fillW, h - 2, OLED_Color.White)
        oledUpdate()
    }

    /**
     * แสดงข้อความตัวใหญ่ (สูง 2 บรรทัด) เริ่มที่บรรทัด 1-7
     */
    //% group="ข้อความและตัวเลข"
    //% subcategory="จอ OLED"
    //% weight=87
    //% block="จอ OLED แสดงตัวใหญ่ %text|บรรทัดที่ %line"
    //% text.defl="GO!"
    //% line.min=1 line.max=7 line.defl=4
    export function oledShowBig(text: string, line: number): void {
        oledCheck()
        let y = Math.max(0, Math.min(6, Math.floor(line) - 1)) * 8
        oledFillRectRaw(0, y, OLED_W, 16, OLED_Color.Black)
        oledText(text, 0, y, 2, OLED_Color.White)
        oledUpdate()
    }

    /**
     * ตั้งค่าจอ: กลับสีทั้งจอ และความสว่าง 0-255
     */
    //% group="ตั้งค่าจอ"
    //% subcategory="จอ OLED"
    //% weight=70
    //% block="ตั้งค่าจอ OLED กลับสี %invert|ความสว่าง %brightness"
    //% invert.shadow="toggleOnOff" invert.defl=false
    //% brightness.min=0 brightness.max=255 brightness.defl=255
    //% inlineInputMode=inline
    export function oledSettings(invert: boolean, brightness: number): void {
        oledCheck()
        oledCommand(invert ? 0xA7 : 0xA6)
        oledCommand2(0x81, Math.max(0, Math.min(255, Math.floor(brightness))))
    }

    /**
     * หมุนภาพบนจอ 180 องศา สำหรับตอนติดตั้งจอกลับหัว
     * ตั้งค่าไว้ได้ก่อนเรียก "เริ่มใช้จอ OLED" ค่าจะไม่หายเมื่อจอเริ่มทำงาน
     */
    export function oledRotate180(on: boolean): void {
        oledFlip180 = on
        if (!oledReady) return
        oledApplyRotation()
        oledDirty = 0xFF
        oledUpdate()
    }

    /**
     * Auto update: ON = each block refreshes the screen immediately.
     * OFF = draw many things, then use "OLED refresh" once (faster, no flicker).
     */
    //% group="เริ่มต้นจอ"
    //% subcategory="จอ OLED"
    //% weight=97
    //% block="จอ OLED อัปเดตทันที %on"
    //% on.shadow="toggleOnOff" on.defl=true
    export function oledSetAutoUpdate(on: boolean): void {
        oledAuto = on
        if (on) oledFlush()
    }

    /**
     * Send the drawing buffer to the screen
     */
    // ================= เซ็นเซอร์บนจอ =================

    /**
     * อ่านค่าที่สอนไว้แบบปลอดภัย ถ้ายังไม่ได้สอนจะได้ 0 แทนการอ่านเกินขอบอาเรย์
     */
    function oledCal(arr: number[], i: number): number {
        if (i < 0 || i >= arr.length) return 0
        return arr[i]
    }

    /**
     * แปลงค่าดิบเป็น 0-100 โดย 100 = อยู่บนเส้น
     * ถ้ายังไม่ได้สอนเซ็นเซอร์ จะย่อค่าดิบตามสเกลจริงของบอร์ดมาแสดงแทน
     */
    function oledSensorPct(raw: number, line: number, bg: number): number {
        let v = 0
        if (line == bg) v = Math.idiv(raw * 100, adcFullScale())
        else v = Math.idiv(pins.map(raw, line, bg, 1000, 0), 10)
        return Math.max(0, Math.min(100, v))
    }

    /**
     * อ่านค่าดิบของเซ็นเซอร์กลุ่มหนึ่งครั้งเดียว
     */
    function oledReadRaw(sensors: number[]): number[] {
        let out: number[] = []
        for (let i = 0; i < sensors.length; i++) out.push(ADCRead(adcCmd(sensors[i])))
        return out
    }

    /**
     * แปลงค่าดิบที่อ่านมาแล้วเป็นเปอร์เซ็นต์ทั้งกลุ่ม
     */
    function oledPctOf(raw: number[], line: number[], bg: number[]): number[] {
        let out: number[] = []
        for (let i = 0; i < raw.length; i++) {
            out.push(oledSensorPct(raw[i], oledCal(line, i), oledCal(bg, i)))
        }
        return out
    }

    function oledNumParts(values: number[]): string[] {
        let out: string[] = []
        for (let i = 0; i < values.length; i++) out.push("" + values[i])
        return out
    }

    // ตัวอักษรกว้าง 6px ที่ขนาด 1 จอกว้าง 128px จึงได้ 21 ตัวต่อบรรทัด
    const OLED_COLS = 21

    /**
     * ต่อค่าเข้ากับหัวแถว ถ้ายาวเกินบรรทัดจะขึ้นบรรทัดใหม่ให้เอง
     * จำนวนเซ็นเซอร์จึงไม่ทำให้ค่าล้นหายไปนอกจอ
     */
    function oledAddRow(lines: string[], prefix: string, parts: string[]): void {
        let cur = prefix
        for (let i = 0; i < parts.length; i++) {
            let next = cur + " " + parts[i]
            if (next.length > OLED_COLS) {
                lines.push(cur)
                cur = " " + parts[i]
            }
            else {
                cur = next
            }
        }
        lines.push(cur)
    }

    /**
     * แสดงข้อมูลเซ็นเซอร์บนจอ เลือกแบบที่ต้องการ
     * ค่าเซ็นเซอร์เส้น / กราฟแท่ง / รายช่อง ใส่ไว้ใน "วนซ้ำตลอดไป" เพื่อดูค่าสด
     */
    //% group="เซ็นเซอร์บนจอ"
    //% subcategory="จอ OLED"
    //% weight=60
    //% block="จอ OLED แสดง %view"
    export function oledShowSensor(view: OLED_SensorView): void {
        switch (view) {
            case OLED_SensorView.Values: oledLineSensorValues(); break
            case OLED_SensorView.Bars: oledLineSensorBars(); break
            case OLED_SensorView.Channels: oledLineSensorChannels(); break
            case OLED_SensorView.Calibration: oledShowCalibration(); break
            case OLED_SensorView.Hardware: oledHardwareCheck(); break
        }
    }

    /**
     * แสดงค่าเซ็นเซอร์เดินตามเส้นเป็นตัวเลขบนจอ
     * L = ซ้าย, C = กลาง, R = ขวา (ค่าดิบจาก ADC), % = ค่าที่แปลงแล้ว (100 = บนเส้น)
     */
    export function oledLineSensorValues(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        if (Sensor_PIN.length == 0) {
            oledText("NO SENSOR SETUP", 0, 24, 1, OLED_Color.White)
            oledUpdate()
            return
        }
        // อ่าน ADC ครั้งเดียวแล้วใช้ซ้ำทุกแถว ตัวเลขทุกแถวจึงมาจากจังหวะเดียวกัน
        let rawL = oledReadRaw(Sensor_Left)
        let rawC = oledReadRaw(Sensor_PIN)
        let rawR = oledReadRaw(Sensor_Right)
        let lines: string[] = []
        if (lineCalibrated()) lines.push("POS " + positionFrom(rawC) + "/" + (Num_Sensor - 1) * 1000)
        else lines.push("NOT CALIBRATED")
        oledAddRow(lines, "L", oledNumParts(rawL))
        oledAddRow(lines, "C", oledNumParts(rawC))
        oledAddRow(lines, "R", oledNumParts(rawR))
        oledAddRow(lines, "%", oledNumParts(oledPctOf(rawC, Color_Line, Color_Background)))
        // จอสูง 64px ตัวอักษรสูง 8px จึงแสดงได้ 8 บรรทัด
        let rows = Math.min(8, lines.length)
        for (let i = 0; i < rows; i++) {
            oledText(lines[i], 0, i * 8, 1, OLED_Color.White)
        }
        oledUpdate()
    }

    /**
     * จอเริ่มทำงานแล้วหรือยัง ใช้เช็คก่อนเขียนจอ เพื่อไม่ไปปลุกจอที่ไม่ได้ต่อไว้
     */
    export function oledIsReady(): boolean {
        return oledReady
    }

    function oledChIn(list: number[], ch: number): boolean {
        for (let i = 0; i < list.length; i++) if (list[i] == ch) return true
        return false
    }

    /**
     * หมายเลขช่องที่ตั้งค่าไว้ทั้งหมด เรียงจากน้อยไปมากและไม่ซ้ำ
     */
    function oledUsedChannels(): number[] {
        let out: number[] = []
        for (let ch = 0; ch <= 7; ch++) {
            if (oledChIn(Sensor_PIN, ch) || oledChIn(Sensor_Left, ch) || oledChIn(Sensor_Right, ch)) out.push(ch)
        }
        return out
    }

    function oledIndexOfCh(list: number[], ch: number): number {
        for (let i = 0; i < list.length; i++) if (list[i] == ch) return i
        return -1
    }

    /**
     * แสดงค่าเซ็นเซอร์พร้อมหมายเลขช่อง เช่น CH0 1200
     * ใช้จดค่าตอนอยู่บนเส้น (ดำ) และบนพื้น (ขาว) ไปใส่บล็อก "ตั้งค่าเซ็นเซอร์" เรียงตามหมายเลขช่อง
     */
    export function oledLineSensorChannels(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        let chs = oledUsedChannels()
        if (chs.length == 0) {
            oledText("NO SENSOR SETUP", 0, 24, 1, OLED_Color.White)
            oledUpdate()
            return
        }
        // อ่านช่องละครั้งเดียว แล้วใช้ซ้ำทั้งตารางและการคำนวณตำแหน่ง
        let raw: number[] = []
        for (let i = 0; i < chs.length; i++) raw.push(ADCRead(adcCmd(chs[i])))

        oledText("LINE SENSOR", 0, 0, 1, OLED_Color.White)
        // สองคอลัมน์ คอลัมน์ละไม่เกิน 4 แถว รองรับครบ 8 ช่อง
        for (let i = 0; i < chs.length; i++) {
            let col = i >= 4 ? 66 : 0
            let row = i >= 4 ? i - 4 : i
            oledText("CH" + chs[i] + " " + raw[i], col, 12 + row * 10, 1, OLED_Color.White)
        }
        let rawC: number[] = []
        for (let i = 0; i < Sensor_PIN.length; i++) {
            let idx = oledIndexOfCh(chs, Sensor_PIN[i])
            if (idx >= 0) rawC.push(raw[idx])
            else rawC.push(0)
        }
        if (lineCalibrated()) oledText("POS " + positionFrom(rawC), 0, 54, 1, OLED_Color.White)
        else oledText("NOT CALIBRATED", 0, 54, 1, OLED_Color.White)
        oledUpdate()
    }

    /** เติมช่องว่างหน้าข้อความให้ครบความกว้าง เพื่อให้ตัวเลขตรงคอลัมน์ */
    function oledPadLeft(text: string, width: number): string {
        let out = text
        while (out.length < width) out = " " + out
        return out
    }

    /** ช่องที่ควรแสดงค่าคาลิเบรต = ช่องที่ตั้งไว้ในผัง รวมกับช่องที่ถูกสอนค่าไว้ */
    function oledCalChannels(): number[] {
        let out: number[] = []
        for (let ch = 0; ch <= 7; ch++) {
            if (oledChIn(Sensor_PIN, ch) || oledChIn(Sensor_Left, ch)
                || oledChIn(Sensor_Right, ch) || channelTaught(ch)) out.push(ch)
        }
        return out
    }

    /** ลองคุยกับอุปกรณ์ I2C ที่อยู่นี้ ตอบ true ถ้ามีตัวตอบรับ */
    function i2cPresent(addr: number): boolean {
        // เขียน 1 ไบต์เป็นการตั้งตัวชี้รีจิสเตอร์เฉย ๆ ไม่เปลี่ยนค่าในชิป
        // i2cWriteBuffer คืน 0 เมื่อมีตัวตอบรับ คืนค่าอื่นเมื่อไม่มีใครตอบ
        let probe = pins.createBuffer(1)
        probe[0] = 0
        return pins.i2cWriteBuffer(addr, probe, false) == 0
    }

    function oledHex2(v: number): string {
        let d = "0123456789ABCDEF"
        return d.charAt((v >> 4) & 0xF) + d.charAt(v & 0xF)
    }

    /**
     * ตรวจว่าฮาร์ดแวร์บนหุ่นตรงกับที่ส่วนขยายนี้คาดไว้ไหม
     * ไล่หาอุปกรณ์ I2C แล้วอ่านค่าดิบครบทั้ง 8 ช่อง ADC
     * แสดงบนจอ OLED และส่งออกทางสาย USB พร้อมกัน จึงดูได้แม้ไม่มีจอ
     */
    export function oledHardwareCheck(): void {
        // บอร์ดรุ่นใหม่ใช้ ADC ที่ 0x49 คืนค่า 8 บิต รุ่นเดิมใช้ ADS7828 ที่ 0x48 คืน 12 บิต
        // ไล่ต่อถึง 0x4B ด้วย เพราะ ADS7828 ตั้งที่อยู่ได้ด้วยขา A0/A1
        let adcAt = -1
        if (i2cPresent(ADC_V2_ADDR)) adcAt = ADC_V2_ADDR
        else if (i2cPresent(ADS7828_ADDR)) adcAt = ADS7828_ADDR
        else {
            // ยังไม่เจอ ลองที่อยู่ที่เหลือของ ADS7828 ซึ่งตั้งได้ด้วยขา A0/A1
            for (let a = 0x4A; a <= 0x4B; a++) {
                if (i2cPresent(a)) {
                    adcAt = a
                    break
                }
            }
        }
        let motorAt = i2cPresent(PCA) ? PCA : -1
        let oledAt = -1
        if (i2cPresent(0x3C)) oledAt = 0x3C
        else if (i2cPresent(0x3D)) oledAt = 0x3D

        let rows: string[] = []
        let adcRow = "ADC   "
        if (adcAt < 0) adcRow += "NOT FOUND"
        // บอกสเกลที่ใช้จริงด้วย เพราะสองรุ่นให้ช่วงค่าต่างกันคนละเท่า
        else if (adcAt == ADS7828_ADDR) adcRow += "0x" + oledHex2(adcAt) + " 12BIT"
        else if (adcAt == ADC_V2_ADDR) adcRow += "0x" + oledHex2(adcAt) + " 8BIT"
        // เจอชิปที่ที่อยู่ซึ่งโค้ดยังไม่รองรับ ค่าที่อ่านได้จะไม่ถูกต้อง
        else adcRow += "0x" + oledHex2(adcAt) + " UNKNOWN"
        rows.push(adcRow)
        rows.push("MOTOR " + (motorAt < 0 ? "NOT FOUND" : "0x" + oledHex2(motorAt) + " OK"))
        rows.push("OLED  " + (oledAt < 0 ? "NOT FOUND" : "0x" + oledHex2(oledAt) + " OK"))

        // อ่านค่าดิบครบทั้ง 8 ช่อง ไม่สนว่าตั้งค่าเซ็นเซอร์ไว้กี่ช่อง
        // ช่องที่ไม่ได้ต่ออะไรจะนิ่งอยู่สุดปลายด้านใดด้านหนึ่ง
        for (let ch = 0; ch < 8; ch += 2) {
            let a = adcAt < 0 ? "----" : "" + ADCRead(adcCmd(ch))
            let b = adcAt < 0 ? "----" : "" + ADCRead(adcCmd(ch + 1))
            rows.push(ch + ":" + oledPadLeft(a, 4) + "  " + (ch + 1) + ":" + oledPadLeft(b, 4))
        }

        for (let i = 0; i < rows.length; i++) serial.writeLine(rows[i])

        if (!oledIsReady()) {
            // ไม่มีจอก็ยังดูผลทางสาย USB ได้ บอกด้วยไอคอนว่าตรวจเสร็จแล้ว
            basic.showIcon(IconNames.Yes, 500)
            basic.clearScreen()
            return
        }
        oledBuf.fill(0)
        oledDirty = 0xFF
        for (let i = 0; i < rows.length && i < 8; i++) {
            oledText(rows[i], 0, i * 8, 1, OLED_Color.White)
        }
        oledUpdate()
    }

    /**
     * แสดงค่าคาลิเบรตที่เก็บไว้ของทุกช่อง ทั้งค่าบนเส้นและค่าบนพื้น
     * ใช้ตรวจว่าค่าที่สอนหรือใส่ไว้ตรงกับที่เซ็นเซอร์อ่านได้จริงไหม
     * ช่องที่ยังไม่ได้ตั้งค่าจะขึ้นขีด
     */
    export function oledShowCalibration(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        let chs = oledCalChannels()
        if (chs.length == 0) {
            oledText("NO SENSOR SETUP", 0, 24, 1, OLED_Color.White)
            oledUpdate()
            return
        }
        // จอสูง 64 px แสดงได้ 8 บรรทัด ถ้าช่องไม่เกิน 7 ยังเหลือที่ใส่หัวตาราง
        let row = 0
        if (chs.length <= 7) {
            oledText("CH LINE  GND", 0, 0, 1, OLED_Color.White)
            row = 1
        }
        for (let i = 0; i < chs.length && row + i < 8; i++) {
            let ch = chs[i]
            let line = "-"
            let ground = "-"
            if (channelTaught(ch)) {
                line = "" + getSensorCal(ch, Cal_Which.Line)
                ground = "" + getSensorCal(ch, Cal_Which.Ground)
            }
            let text = oledPadLeft("" + ch, 2) + " "
                + oledPadLeft(line, 4) + " " + oledPadLeft(ground, 4)
            oledText(text, 0, (row + i) * 8, 1, OLED_Color.White)
        }
        oledUpdate()
    }

    /**
     * แสดงค่าเซ็นเซอร์เดินตามเส้นเป็นกราฟแท่ง เรียงตามตำแหน่งจริงซ้าย -> ขวา
     * แท่งยิ่งสูง = ยิ่งเห็นเส้นชัด แถบทึบใต้แท่ง = เซ็นเซอร์ตัวนั้นอยู่บนเส้น
     */
    export function oledLineSensorBars(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        // อ่าน ADC ครั้งเดียว ทั้งแท่งกราฟและตำแหน่งเส้นใช้ค่าชุดเดียวกัน
        let rawL = oledReadRaw(Sensor_Left)
        let rawC = oledReadRaw(Sensor_PIN)
        let rawR = oledReadRaw(Sensor_Right)
        let pct: number[] = []
        let pctL = oledPctOf(rawL, Color_Line_Left, Color_Background_Left)
        let pctC = oledPctOf(rawC, Color_Line, Color_Background)
        let pctR = oledPctOf(rawR, Color_Line_Right, Color_Background_Right)
        for (let i = 0; i < pctL.length; i++) pct.push(pctL[i])
        for (let i = 0; i < pctC.length; i++) pct.push(pctC[i])
        for (let i = 0; i < pctR.length; i++) pct.push(pctR[i])
        let n = pct.length
        if (n == 0) {
            oledText("NO SENSOR SETUP", 0, 24, 1, OLED_Color.White)
            oledUpdate()
            return
        }
        if (lineCalibrated()) {
            oledText("POS " + positionFrom(rawC), 0, 0, 1, OLED_Color.White)
        }
        else {
            oledText("NOT CALIBRATED", 0, 0, 1, OLED_Color.White)
        }
        let slot = Math.idiv(OLED_W, n)
        let bw = Math.max(3, slot - 3)
        let base = 56
        let maxH = 44
        for (let i = 0; i < n; i++) {
            let x = i * slot + Math.idiv(slot - bw, 2)
            let h = Math.idiv(pct[i] * maxH, 100)
            if (h > 0) oledFillRectRaw(x, base - h, bw, h, OLED_Color.White)
            oledHLine(x, base, bw, OLED_Color.White)
            if (pct[i] >= 50) oledFillRectRaw(x, base + 3, bw, 4, OLED_Color.White)
        }
        oledUpdate()
    }

    //% group="เริ่มต้นจอ"
    //% subcategory="จอ OLED"
    //% weight=98
    //% block="จอ OLED แสดงภาพที่วาด"
    export function oledRefresh(): void {
        oledCheck()
        oledFlush()
    }
}
