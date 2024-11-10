/**
 * 文字列の配列から選択肢を作成する。
 * ショートカットキーを自動的に付与する
 * @param choiseList - 選択肢として使用する文字列の配列
 * @returns Promise<void>
 */
export declare function boxSelectPlaneStringList(choiseList: string[]): Promise<number | undefined>;
/**
 * 文字列の配列から選択肢を作成する。
 * 選択をキャンセルされた場合はnullを返す。
 * なにかの選択が行われた場合、番号を返す。0始まり
 * @param {{label:string,shortcutKey?:string|null}[]} choiseList
 * @returns {Promise<number|null>}
 */
export declare function boxSelectCb2(choiseList: { label: string; shortcutKey?: string | null; }[]): Promise<number | null>