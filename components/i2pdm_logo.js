//
// Logo
// Version history: 2.0
//

import React, { Component } from "react";
import { View, Image } from "react-native";

const I2PDMLogo = () => (
  <View
    style={{
      alignItems: "center",
      marginBottom: 20
    }}
  >
    <Image
      style={{ width: 200, height: 80 }}
      source={require("../assets/i2pdm_fg.png")}
    />

    <View
      style={{
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <Image
        style={{ width: 80, height: 80 }}
        source={require("../assets/ntu.png")}
      />
      <Image
        style={{ width: 80, height: 80 }}
        source={require("../assets/tainandares.png")}
      />
    </View>
  </View>
);
export default I2PDMLogo;
