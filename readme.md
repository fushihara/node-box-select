# windows＆mac＆日本語＆絵文字確認 console で上下を選択するライブラリ

以下の nyagos を参考にした
https://github.com/nyaosorg/go-box

# windows での使い方

nyagos を使う事を想定

# mac での使い方

zsh で動作確認。以下の内容をプロファイルに記載

```sh
function box_select_demo() {
    node demo.js <"$TTY"
    zle reset-prompt
}
zle -N box_select_demo
bindkey '^Z' box_select_demo
```

zle は stdin を null にリダイレクトするので、`<"$TTY"`が必要。以下の issue より
https://github.com/junegunn/fzf/issues/2167

# 文字の幅計算方法

文字の幅は`src\string-width.mjs`の`StringWidth`クラスで計算している。
`[...str]`で分割し ASCII の英数字と半角カナのみ 1 文字幅と定義している。
ZWJ の絵文字は分割した状態で表示される(windows terminal が対応していなかったので)
