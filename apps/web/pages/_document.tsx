import {Html, Head, Main, NextScript} from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head title="zk-starter" />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="/snarkjs.0.5.0.min.js"></script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}