//@ts-check
export class StringWidth {
  /** @param {string} str */
  constructor(str) {
    this.str = str;
  }
  get width() {
    return this.split()
      .map((a) => a.width)
      .reduce((a, b) => a + b);
  }
  /**
   * 指定の幅以上の文字を切断して返す
   * @param {number} needWidth
   *  */
  substrRight(needWidth) {
    if (needWidth <= 0) {
      throw new Error(`幅は1以上`);
    }
    /** @type {string} */
    let result = "";
    let nowWidth = 0;
    for (let v of this.split()) {
      let nextWidth = nowWidth + v.width;
      if (needWidth < nextWidth) {
        break;
      }
      result += v.str;
      nowWidth += v.width;
    }
    return {
      str: result,
      width: nowWidth,
      paddingRight: needWidth - nowWidth,
    };
  }
  /** @private */
  split() {
    const a = this.splitOneCharacterList();
    /** @type {{str:string,width:number}[]} */
    let result = [];
    for (let v of a) {
      if (v.length == 0) {
        throw new Error(`幅が0文字の文字が入力された`);
      } else if (2 <= v.length) {
        result.push({
          str: v,
          width: 2,
        });
        continue;
      }
      const charCode = v.charCodeAt(0);
      if (charCode <= 31) {
        throw new Error(`制御文字が入っている`);
      } else if (32 <= charCode && charCode <= 126) {
        /// 半角のASCII文字は唯一の幅1
        result.push({
          str: v,
          width: 1,
        });
      } else if (65377 <= charCode && charCode <= 65439) {
        /// 半角カナ記号
        result.push({
          str: v,
          width: 1,
        });
      } else {
        result.push({
          str: v,
          width: 2,
        });
      }
    }
    return result;
  }
  /** @private */
  splitOneCharacterList() {
    if (true) {
      let a = [...String(this.str)];
      /// ZWJを明示的に取り除く
      //a = a.filter((a) => a.length != 1 || a.charCodeAt(0) != 8205);
      return a;
    } else {
      /// ZWJ対応するには以下を有効にする
      /// 👩‍❤️‍👩 が対応する
      let segmenter = new Intl.Segmenter();
      return [...segmenter.segment(this.str)].map((a) => a.segment);
    }
  }
}
