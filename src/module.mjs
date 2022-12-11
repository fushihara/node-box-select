//@ts-check
export class Console {
  constructor() {}
  /**
   * キーボードを入力してもエコーバックしないようにする
   * 作業後にfalseに戻すこと
   * @param {boolean} flag trueの場合はエコーバックしない
   */
  set rawMode(flag) {
    process.stdin.setRawMode(flag);
  }
  /**
   * カーソルの表示・非表示を切り替える
   * @param {boolean} flag trueの場合はカーソルを表示する。falseの場合は非表示にする
   */
  set showCursor(flag) {
    if (flag) {
      process.stdout.write("\x1B[?25h");
    } else {
      process.stdout.write("\x1B[?25l");
    }
  }
  async waitKeyInput() {
    /** @type {KeyDownBuffer} */
    const pressKey = await new Promise((resolve) => {
      process.stdin.once("data", (k) => {
        //console.log(`keyDown:${JSON.stringify(k)}`);
        //console.log(`keyDown:${JSON.stringify(k.toString("hex"))}`);
        resolve(new KeyDownBuffer(k));
      });
    });
    return pressKey;
  }
  /**
   * @param {string} str
   * @param {boolean} isFocus
   * @param {boolean} isUnderLine
   */
  writeText(str, isFocus = false, isUnderLine = false) {
    if (isFocus) {
      process.stdout.write("\x1B[0;1;7m");
    }
    if (isUnderLine) {
      process.stdout.write("\x1B[4m");
    }
    process.stdout.write(str);
    if (isUnderLine) {
      process.stdout.write("\x1B[24m");
    }
    process.stdout.write("\x1B[0m");
  }
  /**
   * カーソルを今の行から上y文字移動する
   * @param {number} y 0の場合は1と同じになる
   */
  moveCursorUp(y) {
    process.stdout.write(`\x1B[${y}A`);
  }
  /**
   * カーソルを今の行の横x文字目に移動する
   * @param {number} x
   */
  moveCursorX(x) {
    process.stdout.write(`\x1B[${x}G`);
  }
}
export class KeyDownBuffer {
  /**
   * @param {Buffer} buffer
   */
  constructor(buffer) {
    /**
     * @private
     */
    this.buffer = buffer;
  }
  /**
   * Ctrl+X もしくはEscを押した時
   */
  get isExit() {
    if (this.buffer.compare(Buffer.from([0x1b])) == 0) {
      return true;
    }
    if (this.buffer.compare(Buffer.from([0x03])) == 0) {
      return true;
    }
    return false;
  }
  get isArrowLeft() {
    if (this.buffer.compare(Buffer.from([0x1b, 0x5b, 0x44])) == 0) {
      return true;
    }
  }
  get isArrowRight() {
    if (this.buffer.compare(Buffer.from([0x1b, 0x5b, 0x43])) == 0) {
      return true;
    }
  }
  get isArrowUp() {
    if (this.buffer.compare(Buffer.from([0x1b, 0x5b, 0x41])) == 0) {
      return true;
    }
  }
  get isArrowDown() {
    if (this.buffer.compare(Buffer.from([0x1b, 0x5b, 0x42])) == 0) {
      return true;
    }
  }
  get isEnter() {
    if (this.buffer.compare(Buffer.from([0x0d])) == 0) {
      return true;
    }
  }
  /**
   * アルファベットの場合は大文字にする
   */
  get alphabetOrDigit() {
    if (this.buffer.byteLength != 1) {
      return null;
    }
    const buf = this.buffer[0];
    if (0x61 <= buf && buf <= 0x7a) {
      // アルファベット
      return String.fromCharCode(buf).toUpperCase();
    } else if (0x30 <= buf && buf <= 0x39) {
      // 数字
      return String.fromCharCode(buf);
    } else {
      return null;
    }
  }
}
