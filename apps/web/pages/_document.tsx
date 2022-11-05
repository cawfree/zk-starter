import {Html, Head, Main, NextScript} from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head title="zk-starter" />
      {/* https://tailwindui.com/documentation */}
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="/snarkjs.0.5.0.min.js"></script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}