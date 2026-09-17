/**
 * OLED 1.3 inch (SH1106, 128x64, I2C) for KrathokKidsBit
 * Ported from Adafruit_SH110X (Adafruit_SH1106G) + Adafruit GFX classic 5x7 font
 * Wiring: VCC -> 3V3, GND -> GND, SCL -> P19 (SCL), SDA -> P20 (SDA)
 */

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

enum OLED_OnOff {
    //% block="เปิด"
    On,
    //% block="ปิด"
    Off
}

namespace KrathokKidsBit {
    const OLED_W = 128
    const OLED_H = 64
    const OLED_PAGE_OFFSET = 2 // SH1106 RAM is 132 columns; visible area starts at column 2

    let oledAddr = 0x3C
    let oledReady = false
    let oledAuto = true
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
        oledCommand(0xA1)            // segment remap
        oledCommand(0xC8)            // COM scan dec
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

    //% group="จอ OLED"
    /**
     * Initialize OLED 1.3 inch (SH1106 128x64) on I2C (SCL=P19, SDA=P20)
     */
    //% block="เริ่มใช้จอ OLED ที่อยู่ %addr"
    //% advanced=true
    //% addr.defl=OLED_Address.Addr_0x3C
    //% weight=100
    export function oledInit(addr: OLED_Address): void {
        oledBegin(addr)
    }

    //% group="จอ OLED"
    /**
     * Clear the whole screen
     */
    //% block="ล้างจอ OLED"
    //% weight=99
    export function oledClear(): void {
        oledCheck()
        oledBuf.fill(0)
        oledDirty = 0xFF
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * แสดงข้อความที่บรรทัด 1-8 (ลบข้อความเดิมในบรรทัดนั้นก่อน)
     */
    //% block="จอ OLED แสดงข้อความ %text|บรรทัดที่ %line"
    //% text.defl="Hello"
    //% line.min=1 line.max=8 line.defl=1
    //% weight=98
    export function oledShowLine(text: string, line: number): void {
        oledCheck()
        line = Math.max(0, Math.min(7, Math.floor(line) - 1))
        oledFillRectRaw(0, line * 8, OLED_W, 8, OLED_Color.Black)
        oledText(text, 0, line * 8, 1, OLED_Color.White)
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * แสดงตัวเลขที่บรรทัด 1-8
     */
    //% block="จอ OLED แสดงตัวเลข %num|บรรทัดที่ %line"
    //% line.min=1 line.max=8 line.defl=2
    //% weight=97
    export function oledShowNumberLine(num: number, line: number): void {
        oledShowLine("" + num, line)
    }

    //% group="จอ OLED"
    /**
     * Show text at position x (0-127), y (0-63) with size 1-4
     */
    //% block="จอ OLED เขียนข้อความ %text|ที่ x %x|y %y|ขนาด %size|สี %color"
    //% advanced=true
    //% text.defl="KidsBit"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% size.min=1 size.max=4 size.defl=1
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=96
    export function oledShowString(text: string, x: number, y: number, size: number, color: OLED_Color): void {
        oledCheck()
        oledText(text, x, y, size, color)
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * Show number at position x (0-127), y (0-63) with size 1-4
     */
    //% block="จอ OLED เขียนตัวเลข %num|ที่ x %x|y %y|ขนาด %size|สี %color"
    //% advanced=true
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% size.min=1 size.max=4 size.defl=1
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=95
    export function oledShowNumber(num: number, x: number, y: number, size: number, color: OLED_Color): void {
        oledShowString("" + num, x, y, size, color)
    }

    //% group="จอ OLED"
    /**
     * Draw a single pixel
     */
    //% block="จอ OLED วาดจุด x %x|y %y|สี %color"
    //% advanced=true
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=94
    export function oledDrawPixel(x: number, y: number, color: OLED_Color): void {
        oledCheck()
        oledPixel(x, y, color)
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * Draw a line from (x0, y0) to (x1, y1)
     */
    //% block="จอ OLED วาดเส้นตรง จาก x %x0|y %y0|ไป x %x1|y %y1|สี %color"
    //% x0.min=0 x0.max=127 y0.min=0 y0.max=63
    //% x1.min=0 x1.max=127 y1.min=0 y1.max=63 x1.defl=127 y1.defl=63
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=93
    export function oledDrawLine(x0: number, y0: number, x1: number, y1: number, color: OLED_Color): void {
        oledCheck()
        oledLineRaw(Math.floor(x0), Math.floor(y0), Math.floor(x1), Math.floor(y1), color)
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * Draw a rectangle
     */
    //% block="จอ OLED วาดสี่เหลี่ยม x %x|y %y|กว้าง %w|สูง %h|แบบ %fill|สี %color"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% w.defl=40 h.defl=20
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=92
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

    //% group="จอ OLED"
    /**
     * Draw a circle with center (x, y) and radius r
     */
    //% block="จอ OLED วาดวงกลม x %x|y %y|รัศมี %r|แบบ %fill|สี %color"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% x.defl=64 y.defl=32 r.defl=10
    //% color.defl=OLED_Color.White
    //% inlineInputMode=inline
    //% weight=91
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

    //% group="จอ OLED"
    /**
     * Draw a progress bar (0-100 %)
     */
    //% block="จอ OLED แถบพลัง x %x|y %y|กว้าง %w|สูง %h|ค่า %value|เปอร์เซ็นต์"
    //% advanced=true
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% w.defl=100 h.defl=10
    //% value.min=0 value.max=100 value.defl=50
    //% inlineInputMode=inline
    //% weight=90
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

    //% group="จอ OLED"
    /**
     * แสดงชื่อและค่า เช่น ระยะ = 25 ที่บรรทัด 1-8
     */
    //% block="จอ OLED แสดง %label|= %value|บรรทัดที่ %line"
    //% label.defl="Distance"
    //% line.min=1 line.max=8 line.defl=3
    //% inlineInputMode=inline
    //% weight=97
    export function oledShowValue(label: string, value: number, line: number): void {
        oledShowLine(label + " = " + value, line)
    }

    //% group="จอ OLED"
    /**
     * แสดงข้อความตัวใหญ่ (สูง 2 บรรทัด) เริ่มที่บรรทัด 1-7
     */
    //% block="จอ OLED แสดงตัวใหญ่ %text|บรรทัดที่ %line"
    //% text.defl="GO!"
    //% line.min=1 line.max=7 line.defl=4
    //% weight=96
    export function oledShowBig(text: string, line: number): void {
        oledCheck()
        let y = Math.max(0, Math.min(6, Math.floor(line) - 1)) * 8
        oledFillRectRaw(0, y, OLED_W, 16, OLED_Color.Black)
        oledText(text, 0, y, 2, OLED_Color.White)
        oledUpdate()
    }

    //% group="จอ OLED"
    /**
     * Invert the whole display colors
     */
    //% block="จอ OLED กลับสีทั้งจอ %invert"
    //% advanced=true
    //% invert.shadow="toggleOnOff"
    //% weight=80
    export function oledInvert(invert: boolean): void {
        oledCheck()
        oledCommand(invert ? 0xA7 : 0xA6)
    }

    //% group="จอ OLED"
    /**
     * Set display brightness (contrast) 0-255
     */
    //% block="จอ OLED ความสว่าง %value"
    //% advanced=true
    //% value.min=0 value.max=255 value.defl=255
    //% weight=79
    export function oledBrightness(value: number): void {
        oledCheck()
        oledCommand2(0x81, Math.max(0, Math.min(255, Math.floor(value))))
    }

    //% group="จอ OLED"
    /**
     * Turn display ON or OFF (keeps screen memory)
     */
    //% block="จอ OLED %state จอ"
    //% advanced=true
    //% weight=78
    export function oledDisplay(state: OLED_OnOff): void {
        oledCheck()
        oledCommand(state == OLED_OnOff.On ? 0xAF : 0xAE)
    }

    //% group="จอ OLED"
    /**
     * Auto update: ON = each block refreshes the screen immediately.
     * OFF = draw many things, then use "OLED refresh" once (faster, no flicker).
     */
    //% block="จอ OLED อัปเดตทันที %on"
    //% advanced=true
    //% on.shadow="toggleOnOff" on.defl=true
    //% weight=77
    export function oledSetAutoUpdate(on: boolean): void {
        oledAuto = on
        if (on) oledFlush()
    }

    //% group="จอ OLED"
    /**
     * Send the drawing buffer to the screen
     */
    //% block="จอ OLED แสดงภาพที่วาด"
    //% advanced=true
    //% weight=76
    export function oledRefresh(): void {
        oledCheck()
        oledFlush()
    }
}
