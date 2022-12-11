//@ts-check
/// アイテムの間に表示する余白の数
const spaceWidth = 1;
export class ChoiseBoxLayout {
  /**
   * 選択肢のレイアウトを作成する。この処理は各選択肢の中身は一切見ない。
   * 以下、ターミナルの幅が6ptの場合の例。
   * |123456 | 幅が6ptの場合、一番右は改行専用になる
   * |A_B_C↓| 選択肢の幅が1の場合、1の間隔を含めて1行に3項目表示出来る
   * |AA_BB↓| 選択肢の幅が2の場合、同じく間隔を含めて1行に2項目
   * |AAA__↓| 選択肢の幅が3の場合、割り切れないので余白が発生する
   * @param {number} consoleWidth コンソールの幅。一番右の改行専用領域も含む。process.stdout.columns の値をそのまま渡せばよい
   * @param {number} itemMaxWidth 選択肢の一番広い幅
   * @param {number} itemCount 選択肢の個数
   */
  constructor(consoleWidth, itemMaxWidth, itemCount) {
    /** @private */
    this.consoleWidth = consoleWidth;
    /** @private */
    this.itemMaxWidth = itemMaxWidth;
    /** @private */
    this.itemCount = itemCount;
  }
  /**
   * @private
   */
  props() {
    /// 横にアイテムを何個表示出来るか？。最低は1、最大は アイテムの幅が1としても余白があるので
    /// 1 <= x <= (consoleWidth/2)
    const yokoItemCount = Math.max(1, Math.floor(this.consoleWidth / (this.itemMaxWidth + spaceWidth)));
    const paddingRight = this.consoleWidth - spaceWidth - yokoItemCount * this.itemMaxWidth - (yokoItemCount - 1) * spaceWidth;
    /// 1以上
    const tateItemCount = Math.ceil(this.itemCount / yokoItemCount);
    return {yokoItemCount, paddingRight, tateItemCount};
  }
  get tateCount() {
    return this.props().tateItemCount;
  }
  *list() {
    for (let v of this.listPrivate()) {
      yield {
        hasPrefixNewLine: v.hasPrefixNewLine,
        prefixSpaceCount: v.prefixSpaceCount,
        itemIndex: v.itemIndex,
        itemWidth: v.itemWidth,
      };
    }
  }
  /** @private */
  *listPrivate() {
    const {yokoItemCount, tateItemCount, paddingRight} = this.props();
    for (let i = 0; i < yokoItemCount * tateItemCount; i++) {
      // 0<=x<yokoItemCount;
      let x = i % yokoItemCount;
      // 0<=y<tateCount
      let y = Math.floor(i / yokoItemCount);
      let hasPrefixNewLine = false;
      /** ブロックの右に必要なスペース */
      let prefixSpaceCount = 0;
      /** @type {number|null} */
      let itemIndex = null;
      if (i < this.itemCount) {
        // アイテムがある
        itemIndex = i;
      }
      // 一番右のブロックで、最後の行以外の場合は改行が必要
      if (x == yokoItemCount - 1 && y != tateItemCount - 1) {
        hasPrefixNewLine = true;
      }
      // 一番右のブロックの場合、paddingが必要な場合がある
      if (x == yokoItemCount - 1) {
        prefixSpaceCount = paddingRight;
      } else {
        // 一番右でない場合、スペースが必要
        prefixSpaceCount = spaceWidth;
      }
      yield {
        x,
        y,
        hasPrefixNewLine,
        /** ブロックの右に必要なスペース */
        prefixSpaceCount,
        itemIndex,
        itemWidth: Math.min(this.consoleWidth - 1, this.itemMaxWidth),
      };
    }
  }
  /**
   *
   * @param {number} currentIndex
   * @param {"up"|"down"|"left"|"right"} moveArrow
   * @returns {number}
   */
  getNextIndex(currentIndex, moveArrow) {
    const {yokoItemCount, tateItemCount} = this.props();
    let x = -1;
    let y = -1;
    const listPrivateALl = [...this.listPrivate()];
    /** @type {Map<`${number}-${number}`,{x:number,y:number,index:number}>} */
    const xyMap = new Map();
    for (let v of listPrivateALl) {
      if (v.itemIndex != null) {
        xyMap.set(`${v.x}-${v.y}`, {
          x: v.x,
          y: v.y,
          index: v.itemIndex,
        });
      }
      if (v.itemIndex == currentIndex) {
        x = v.x;
        y = v.y;
      }
    }
    if (x == -1 || y == -1) {
      throw new Error("");
    }
    let cursorXYList = this.getCursorNextXYList2(x, y, yokoItemCount, tateItemCount, moveArrow);
    if (cursorXYList.length == 0) {
      throw new Error();
    }
    let xyListIndex = cursorXYList.indexOf(`${x}-${y}`);
    if (xyListIndex == -1) {
      xyListIndex = 0;
    }
    let xyOffset = 0;
    if (moveArrow == "down" || moveArrow == "right") {
      xyOffset = 1;
    } else {
      xyOffset = -1;
    }
    let loopCount = cursorXYList.length * 2;
    do {
      xyListIndex += xyOffset;
      xyListIndex += cursorXYList.length;
      xyListIndex = xyListIndex % cursorXYList.length;
      const xyKey = cursorXYList[xyListIndex];
      const xyVal = xyMap.get(xyKey);
      if (xyVal != null) {
        //console.log(`r:${xyVal.index}`);
        return xyVal.index;
      }
      loopCount -= 1;
      if (loopCount == 0) {
        throw new Error(`無限ループエラー`);
      }
    } while (true);
  }
  /**
   * 上下左右ループのカーソル移動位置リストを作成する
   * 同じキーを押し続けた時、同じXY軸をループする
   * @param {number} x
   * @param {number} y
   * @param {number} yokoItemCount
   * @param {number} tateItemCount
   * @param {"up"|"down"|"left"|"right"} moveArrow
   */
  getCursorNextXYList(x, y, yokoItemCount, tateItemCount, moveArrow) {
    /** @type {`${number}-${number}`[]} */
    let cursorXYList = [];
    if (moveArrow == "down" || moveArrow == "up") {
      for (let i = 0; i < tateItemCount; i++) {
        cursorXYList.push(`${x}-${i}`);
      }
    } else {
      for (let i = 0; i < yokoItemCount; i++) {
        cursorXYList.push(`${i}-${y}`);
      }
    }
    return cursorXYList;
  }
  /**
   * 上下左右順番に移動するカーソル移動位置リストを作成する
   * 同じキーを押し続けた場合でも全ての要素に順番に移動出来る
   * @param {number} x
   * @param {number} y
   * @param {number} yokoItemCount
   * @param {number} tateItemCount
   * @param {"up"|"down"|"left"|"right"} moveArrow
   */
  getCursorNextXYList2(x, y, yokoItemCount, tateItemCount, moveArrow) {
    /** @type {`${number}-${number}`[]} */
    let cursorXYList = [];
    if (moveArrow == "down" || moveArrow == "up") {
      for (let x = 0; x < yokoItemCount; x++) {
        for (let y = 0; y < tateItemCount; y++) {
          cursorXYList.push(`${x}-${y}`);
        }
      }
    } else {
      for (let y = 0; y < tateItemCount; y++) {
        for (let x = 0; x < yokoItemCount; x++) {
          cursorXYList.push(`${x}-${y}`);
        }
      }
    }
    return cursorXYList;
  }
}

/**
 * ceil 切り上げ
 * floor 切り捨て
 */
