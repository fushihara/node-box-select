/**
 * 文字列の配列から選択肢を作成する。
 * ショートカットキーを自動的に付与する
 * @param choiseList - 選択肢として使用する文字列の配列
 * @returns Promise<void>
 */
export declare function boxSelectPlaneStringList(choiseList: string[]): Promise<number | undefined>;

type Prop<T> = {
  label: string;
  value: T;
  shortcutKey?: string;
};
export declare function boxSelect<T extends string>(selection: Prop<T>[]): Promise<string | null>;

