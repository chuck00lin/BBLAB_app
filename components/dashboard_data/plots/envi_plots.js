//
// Envi plots
// alarm color: ok
// data: ok
// right panel: ok
//

import { Svg, G, Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import React, { Component, useEffect, useState } from "react";
import {
  ScrollView,
  Button,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  TextInput,
  View,
  Image,
  Switch,
  Platform,
  TouchableOpacity,
  BackHandler,
  Dimensions
} from "react-native";
import {
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
  VictoryBar,
  VictoryLabel,
  VictoryContainer,
  VictoryLine
} from "victory-native";

//
// Envi variables
//
const alarmColors = ["#489147", "#0000ff", "#ffc72b", "#ff7930", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
const typeColors = [
  "red",
  "blue",
  "orange",
  "violet",
  "brown",
  "orange",
  "red"
];
const typeImages = [
  require("../../../assets/t.png"),
  require("../../../assets/h.png"),
  require("../../../assets/l.png"),
  require("../../../assets/tvoc.png"),
  require("../../../assets/co2.png"),
  require("../../../assets/dli.png"),
  require("../../../assets/dd.png")
];
const windowWidth = Dimensions.get("window").width * 1.2;
var windowHeight = Dimensions.get("window").height / 2;
const mapper = (data, alarms) => {
  var mapped_data = data.map((d, i) => ({
    x: i,
    y: d,
    fill: alarmColors[alarms[i]]
  }));

  return mapped_data;
};

import { TRANSLATIONS_ZH } from "../../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../../translations/en/translations";

export default class EnviPlots extends Component {
  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  sensorName = i => {
    var thisName = "";
    if (this.props.lang == "zh") thisName = this.props.sensorDATA.types_cn[i];
    if (this.props.lang == "en") thisName = this.props.sensorDATA.types_en[i];
    return thisName;
  };

  fontSizeENCN = () => {
    if (this.props.lang == "zh") return 16;
    else return 10;
  };

  render() {
    // Auto adjust height
    if (Dimensions.get("window").width >= 450) {
      windowHeight = Dimensions.get("window").height / 3;
    }
    return (
      <View>
        <ScrollView>
          {this.props.sensorDATA.types.map((type, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                flex: 1,
                marginLeft: 15,
                marginRight: 15
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 200
                }}
              >
                <Svg
                  height="100%"
                  width="100%"
                  fill="#0000ff"
                  viewBox={`0 0 ${windowWidth} ${windowHeight} `}
                >
                  {/* Dates */}
                  <VictoryAxis
                    width={windowWidth * 1.1}
                    height={windowHeight * 0.9}
                    label={this.t("DATE", this.props.lang)}
                    // tickCount={5}
                    axisLabelComponent={<VictoryLabel dy={25} />}
                    tickValues={this.props.sensorDATESINDICES}
                    tickFormat={this.props.sensorDATESOUTPUT}
                    standalone={false}
                    domain={[-1, this.props.sensorDATES.length]}
                    style={{
                      ticks: { stroke: "black", size: 10 },
                      tickLabels: {
                        fontSize: 20,
                        textAlign: "right",
                        padding: 15,
                        angle: -35
                      },
                      axisLabel: {
                        fontSize: 24,
                        fontWeight: "bold",
                        padding: 35
                      }
                    }}
                  />

                  {/* Values y-axis*/}
                  <VictoryAxis
                    height={windowHeight * 0.9}
                    width={windowWidth}
                    tickCount={6}
                    domain={[
                      this.props.sensorDATA.ymin[type],
                      this.props.sensorDATA.ymax[type]
                    ]}
                    // tickValues={this.props.sensorYVALUES}
                    // tickFormat={this.props.sensorYFORMAT}
                    style={{
                      ticks: { stroke: "black", size: 10 },
                      tickLabels: {
                        fontSize: 24,
                        padding: 10
                      },
                      axisLabel: {
                        fontWeight: "bold",
                        fontSize: 24,
                        padding: 40
                      }
                    }}
                    dependentAxis
                    standalone={false}
                    axisLabelComponent={<VictoryLabel dy={-25} />}
                    // label={this.props.sensorUNITS[i]}
                  />

                  {/* Data itself */}
                  <VictoryLine
                    domain={{
                      x: [-1, this.props.sensorDATES.length],
                      y: [
                        this.props.sensorDATA.ymin[type],
                        this.props.sensorDATA.ymax[type]
                      ]
                    }}
                    height={windowHeight * 0.9}
                    width={windowWidth * 1.1}
                    style={{
                      data: { stroke: typeColors[i], strokeWidth: 8 }
                    }}
                    standalone={false}
                    data={this.props.sensorDATA.values[type]}
                  />

                  <VictoryLine
                    domain={{
                      x: [-1, this.props.sensorDATES.length],
                      y: [
                        this.props.sensorDATA.ymin[type],
                        this.props.sensorDATA.ymax[type]
                      ]
                    }}
                    height={windowHeight * 0.9}
                    width={windowWidth * 1.1}
                    style={{
                      data: { stroke: typeColors[i], strokeDasharray: "4,4" }
                    }}
                    standalone={false}
                    data={this.props.sensorDATA.values_max[type]}
                  />

                  <VictoryLine
                    domain={{
                      x: [-1, this.props.sensorDATES.length],
                      y: [
                        this.props.sensorDATA.ymin[type],
                        this.props.sensorDATA.ymax[type]
                      ]
                    }}
                    height={windowHeight * 0.9}
                    width={windowWidth * 1.1}
                    style={{
                      data: { stroke: typeColors[i], strokeDasharray: "4,4" }
                    }}
                    standalone={false}
                    data={this.props.sensorDATA.values_min[type]}
                  />
                </Svg>
              </View>

              {/* Right panel */}
              <View
                style={{
                  paddingTop: 20,
                  width: 100,
                  height: 200
                }}
              >
                {/* Image */}
                <TouchableOpacity>
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      alignSelf: "center",
                      borderRadius: 30
                    }}
                    source={typeImages[i]}
                  />
                </TouchableOpacity>

                {/* Sensor name */}
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: this.fontSizeENCN(),
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  {this.sensorName(i)}
                </Text>

                {/* Value */}
                <View
                  style={{
                    flexDirection: "row",
                    textAlign: "center",
                    alignSelf: "center"
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 22,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {
                      this.props.sensorDATA.values[type][
                        this.props.sensorDATA.values[type].length - 1
                      ]
                    }
                  </Text>
                  <Text allowFontScaling={false} style={styles.valueUnitText}>
                    {this.props.sensorDATA.type_units[i]}
                  </Text>
                </View>

                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  Min:
                  {
                    this.props.sensorDATA.values_min[type][
                      this.props.sensorDATA.values[type].length - 1
                    ]
                  }
                </Text>

                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  Max:
                  {
                    this.props.sensorDATA.values_max[type][
                      this.props.sensorDATA.values[type].length - 1
                    ]
                  }
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  valueUnitText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    color: "#000000"
  }
});
