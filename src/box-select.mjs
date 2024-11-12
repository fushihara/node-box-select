//@ts-check
import { ChoiseBoxLayout } from "./choise-box-layout.mjs";
import { Console } from "./module.mjs";
import { StringWidth } from "./string-width.mjs";
/**
 *  @typedef { {  label: string;  value: T;  shortcutKey?: string;}} Prop<T>
 *  @template {string} T
 */

/**
 * @template {string} T
 * @param {Array<Prop<T>>} selection - Array of options for selection.
 * @returns {Promise<T|null>} - The selected value, or null if no selection is made.
 */
export async function boxSelect (selection) {
  const selectId = await boxSelectLocal(selection.map((i) => {
    return {
      label: i.label,
      shortcutKey: i.shortcutKey ?? null,
    };
  }));
  if (selectId == null) {
    return null;
  }
  const result = selection[selectId].value;
  return result;
}
/**
 * 文字列の配列から選択肢を作成する。
 * ショートカットキーを自動的に付与する
 * @param {string[]} choiseList
 */
export async function boxSelectPlaneStringList (choiseList) {
  const sk = [
    //"1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  return boxSelectLocal(
    choiseList.map((a, index) => {
      return {
        label: a,
        shortcutKey: sk[index],
      };
    })
  );
}
/**
 * ショートカットキーはアルファベットの大文字or数字の1文字ornull
 * @param {{label:string,shortcutKey:string|null}[]} choiseList
 */
async function boxSelectLocal (choiseList) {
  if (process.stdout.isTTY == false) {
    throw new Error(`TTYでの動作を前提にしています`);
  }
  process.stdin.resume();
  let selectIndex = 0;
  const p = new Console();
  p.rawMode = true;
  p.showCursor = false;
  let isFirstDisplay = true;
  /** @type {number|null} */
  let userSelectIndex = null;
  /** @type {Map<string,number>} */
  let shortcutKeyMap = new Map();
  for (let v of choiseList) {
    if (v.shortcutKey != null) {
      if (v.shortcutKey.length != 1) {
        throw new Error(`ショートカットキーは1文字の必要あり`);
      }
      if (shortcutKeyMap.has(v.shortcutKey)) {
        throw new Error(`ショートカットキーが重複している`);
      }
      shortcutKeyMap.set(v.shortcutKey, choiseList.indexOf(v));
    }
    v.label = v.label.trim().replaceAll(/\t|\n/g, "");
    if (v.label == "") {
      throw new Error(`空文字のラベルは禁止`);
    }
  }
  // ショートカットキーを押した時、画面表示を更新してからbreakする
  let breakAfterDisplay = false;
  while (true) {
    const consoleWidth = process.stdout.columns;
    /// 表示するアイテムの最大幅。この段階では画面の横幅を超える値の可能性がある
    const choiseItemMaxWidth = choiseList.map((a) => new StringWidth(shortcutKeyString(a.label, a.shortcutKey).allString).width).reduce((a, b) => Math.max(a, b), 0);
    if (choiseItemMaxWidth <= 0) {
      throw new Error(``);
    }
    const choiseBoxLayout = new ChoiseBoxLayout(consoleWidth, choiseItemMaxWidth, choiseList.length);
    const tateCount = choiseBoxLayout.tateCount;
    if (isFirstDisplay) {
      p.moveCursorX(0);
    } else if (1 < tateCount) {
      p.moveCursorUp(tateCount - 1);
      p.moveCursorX(0);
    } else {
      p.moveCursorX(0);
    }
    //console.log(`画面幅:${consoleWidth},横にアイテム:${yokoItemCount}個,1アイテム幅:${oneItemWidth},縦:${tateCount}行`);
    for (let v of choiseBoxLayout.list()) {
      let isSelected = false;
      if (v.itemIndex != null) {
        const label = choiseList[v.itemIndex];
        const ss = shortcutKeyString(label.label, label.shortcutKey);
        if (selectIndex == v.itemIndex) {
          isSelected = true;
        }
        ss.writeToConsole(p, choiseItemMaxWidth, isSelected);
      } else {
        p.writeText(" ".repeat(choiseItemMaxWidth));
      }
      if (0 < v.prefixSpaceCount) {
        p.writeText(" ".repeat(v.prefixSpaceCount));
      }
      if (v.hasPrefixNewLine) {
        process.stdout.write("\n");
      }
    }
    if (breakAfterDisplay) {
      break;
    }
    const pressKey = await p.waitKeyInput();
    if (pressKey.isExit) {
      break;
    }
    const alphabetOrDigit = pressKey.alphabetOrDigit;
    if (pressKey.isArrowLeft) {
      selectIndex = choiseBoxLayout.getNextIndex(selectIndex, "left");
    } else if (pressKey.isArrowRight) {
      selectIndex = choiseBoxLayout.getNextIndex(selectIndex, "right");
    } else if (pressKey.isArrowUp) {
      selectIndex = choiseBoxLayout.getNextIndex(selectIndex, "up");
    } else if (pressKey.isArrowDown) {
      selectIndex = choiseBoxLayout.getNextIndex(selectIndex, "down");
    } else if (pressKey.isEnter) {
      userSelectIndex = selectIndex;
      break;
    } else if (alphabetOrDigit != null) {
      const si = shortcutKeyMap.get(alphabetOrDigit);
      if (si != null) {
        selectIndex = si;
        userSelectIndex = si;
        breakAfterDisplay = true;
      }
    }
    isFirstDisplay = false;
  }
  p.rawMode = false;
  p.showCursor = true;
  process.stdout.write("\n");
  process.stdin.pause(); // ここでpauseをしないとstdinをハンドルが開きっぱなしになる
  return userSelectIndex;
}

/**
 * ラベルとショートカットキーの組み合わせを管理
 * @param {string} label
 * @param {string|null} shortcutKey
 * @returns {{allString:string,writeToConsole:(p:Console,choiseItemMaxWidth:number,isSelected:boolean)=>void}}
 */
function shortcutKeyString (label, shortcutKey) {
  if (shortcutKey == null) {
    return {
      allString: `${label}`,
      writeToConsole: (p, choiseItemMaxWidth, isSelected) => {
        const stringWidth = new StringWidth(label);
        const substr = stringWidth.substrRight(choiseItemMaxWidth);
        p.writeText(substr.str, isSelected, false);
        if (0 < substr.paddingRight) {
          p.writeText(" ".repeat(substr.paddingRight));
        }
      },
    };
  } else {
    if (shortcutKey.length != 1) {
      throw new Error(`ショートカットキーの文字は1文字である必要があります`);
    }
    return {
      allString: `${label}(${shortcutKey})`,
      writeToConsole: (p, choiseItemMaxWidth, isSelected) => {
        const stringWidth = new StringWidth(label);
        const substr = stringWidth.substrRight(choiseItemMaxWidth - 3);
        p.writeText(substr.str + "(", isSelected, false);
        p.writeText(shortcutKey, isSelected, true);
        p.writeText(")", isSelected, false);
        if (0 < substr.paddingRight) {
          p.writeText(" ".repeat(substr.paddingRight));
        }
      },
    };
  }
}
