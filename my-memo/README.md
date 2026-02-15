開発コマンド一覧

1. node -v
React（画面を作る道具）を動かしたり、便利なライブラリをダウンロードしたりするために必要だからです。

2. curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
Rust（ラスト）というプログラミング言語の実行環境をインストールするための魔法の一行です

3. source "$HOME/.cargo/env"
Rustの道具（コマンド）は $HOME/.cargo/bin という隠しフォルダの中に置かれます。
この source コマンドを実行することで、「Rustの道具はここにあるよ！」という情報を今のターミナルに教えてあげることができます（これを「パスを通す」と言います）。

4. npx create-tauri-app@latest .
Tauri公式が用意している「プロジェクト作成用ツール」

5. npm install turndown
ブラウザ上の「リッチな文字（HTML）」を「マークダウン（# や **）」に変換する機能を自分のアプリで使えるようにするためです。

6. npm install --save-dev @types/turndown
TypeScriptを使っている場合に、ヒント（型定義）をVSCodeに教えてあげるためです。これを入れると、コードを書く時に補完が効くようになります。

7. npm i

8. npm run tauri dev
アプリを動かすコマンドです。これを実行すると、開発中のアプリが起動します。

9. 動作確認完了

10. npm run tauri build
今までは「ソースコードを読み取って仮に動かしていた」だけですが、ビルドを行うことで Macが直接実行できるバイナリ（塊） に変換される。
完了すると、src-tauri/target/release/bundle/dmg/ という場所に、あなたの作ったアプリのインストール用ファイル（.dmg）ができあがります。

11. tailwindw化