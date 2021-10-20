//
// Individual page header
// Input: title

import { StyleSheet, Text, View, Image } from "react-native";
import React, { Component, useEffect, useState } from "react";

const info = require("../app.json");
const VERSION = info["expo"]["version"];

export default class I2PDMHeader extends Component {
  //
  // Get Daily date
  //
  getCurrentDate = () => {
    var months = [
      "",
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "June",
      "July",
      "Aug.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec."
    ];

    var date = new Date().getDate();
    var month = months[new Date().getMonth() + 1];
    var m = new Date().getMonth() + 1;
    var year = new Date().getFullYear();

    if (this.props.lang == "zh") return year + "年" + m + "月" + date + "日";
    else return month + " " + date + ", " + year;
  };

  render() {
    return (
      <View
        style={{
          height: 50,
          marginTop: 40,
          marginLeft: 20,
          flexDirection: "row"
        }}
      >
        <Image
          style={{ width: 100, height: 40 }}
          source={require("../assets/i2pdm_text_bg.png")}
        />
        <Text
          allowFontScaling={false}
          style={{
            height: 50,
            marginLeft: 5,
            marginTop: 15,
            fontSize: 18,
            letterSpacing: 1,
            fontWeight: "bold"
          }}
        >
          {this.props.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            height: 50,
            marginLeft: 5,
            flex: 1,
            fontSize: 12,
            marginTop: 20
          }}
        >
          {this.getCurrentDate()}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            height: 50,
            textAlign: "right",
            marginRight: 20,
            fontSize: 12,
            marginTop: 20
          }}
        >
          v{VERSION}
        </Text>
      </View>
    );
  }
}
