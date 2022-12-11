//@ts-check
import {boxSelectPlaneStringList} from "./src/box-select.mjs";

const c1 = await boxSelectPlaneStringList(["BoxSelection", "🌟絵文字OK", "ZWJは非対応", "半角ｶﾅも幅をきちんと計算", "ショートカットキーあり", "矢印キーで選択可能", "キャンセルも検知"]);
console.log(`select:${c1}`);
process.exit(0);
