//@ts-check
import {boxSelectPlaneStringList} from "./src/box-select.mjs";

const c1 = await boxSelectPlaneStringList(["BoxSelection", "ðçµµæå­OK", "ZWJã¯éå¯¾å¿", "åè§ï½¶ï¾ãå¹ããã¡ãã¨è¨ç®", "ã·ã§ã¼ãã«ããã­ã¼ãã", "ç¢å°ã­ã¼ã§é¸æå¯è½", "ã­ã£ã³ã»ã«ãæ¤ç¥"]);
console.log(`select:${c1}`);
process.exit(0);
