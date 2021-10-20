import * as React from "react";
import { WebView } from "react-native-webview";

function BackgroundAndroidTask(props) {
  return (
    <WebView
      onMessage={props.function}
      startInLoadingState={true}
      javaScriptEnabled={true}
      source={{
        html: `<script>
          setInterval(()=>{window.ReactNativeWebView.postMessage("");}, ${props.interval})
          </script>`
      }}
    />
  );
}
export default BackgroundAndroidTask;
