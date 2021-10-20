//
// Count plots
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

//
// Alarm variables
//
const alarmColors = ["#489147", "#0000ff", "#ffc72b", "#ff7930", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
var windowWidth = Dimensions.get("window").width * 1.2;
var windowHeight = Dimensions.get("window").height / 2;
var widthAdjustment = 1.05;
var boxColors = ["#000000", "#757575", "#000000"];
const assets_dir = "../../assets/";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

const mapper = (data, alarms) => {
  var mapped_data = data.map((d, i) => ({
    x: i,
    y: d,
    fill: alarmColors[alarms[i]]
  }));
  return mapped_data;
};
const range = (start, end, step = 1) => {
  let output = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};
const normalize = (val, max, min) => {
  return (val - min) / (max - min);
};
const cols = range(0, 6, 1);
const rows = range(0, 8, 1);

const typeImages = [
  require("../../assets/t.png"),
  require("../../assets/h.png"),
  require("../../assets/l.png"),
  require("../../assets/tvoc.png"),
  require("../../assets/co2.png"),
  require("../../assets/dli.png"),
  require("../../assets/dd.png")
];

export default class SpatialData extends Component {
  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  // get average
  getAverage = values => {
    var output = "";
    var noNan = values.filter(function(value) {
      return !Number.isNaN(value);
    });
    var noZero = noNan.filter(function(value) {
      if (value != 0) return value;
    });
    if (noZero.length > 0) {
      var avg = noZero.reduce((a, v) => (a = a + v)) / noZero.length;
    } else {
      var avg = 0;
    }
    if (this.props.dataType != 3) {
      output = avg.toFixed(0);
    } else {
      output = avg.toFixed(0) + "%";
    }
    return output;
  };

  // get minimum
  getMinimum = values => {
    var output = "";
    var noNan = values.filter(function(value) {
      return !Number.isNaN(value);
    });
    var noZero = noNan.filter(function(value) {
      if (value != 0) return value;
    });
    if (noZero.length > 0) {
      var min = Math.min.apply(null, noZero);
    } else {
      var min = 0;
    }
    if (this.props.dataType != 3) {
      output = min.toFixed(0);
    } else {
      output = min.toFixed(0) + "%";
    }
    return output;
  };

  // get maximum
  getMaximum = values => {
    var output = "";
    var noNan = values.filter(function(value) {
      return !Number.isNaN(value);
    });
    var noZero = noNan.filter(function(value) {
      if (value != 0) return value;
    });
    if (noZero.length > 0) {
      var max = Math.max.apply(null, noZero);
    } else {
      var max = 0;
    }
    if (this.props.dataType != 3) {
      output = max.toFixed(0);
    } else {
      output = max.toFixed(0) + "%";
    }
    return output;
  };

  // get sum
  getSum = values => {
    var output = "";

    if (this.props.dataType != 3) {
      var noNan = values.filter(function(value) {
        return !Number.isNaN(value);
      });
      var noZero = noNan.filter(function(value) {
        if (value != 0) return value;
      });
      if (noZero.length > 0) {
        var sum = noZero.reduce(function(a, b) {
          return a + b;
        }, 0);
      } else {
        var sum = 0;
      }
      output = this.t("TOTAL", this.props.lang) + ": " + sum.toFixed(0);
    } else {
    }

    return output;
  };

  // show max?
  showMax = type => {
    var thisOutput = <View></View>;

    if (type != "T" && type != "H" && type != "L") {
      thisOutput = (
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 14,
            textTransform: "uppercase",
            fontWeight: "bold",
            textAlign: "center",
            color: "red"
          }}
        >
          {this.getSum(this.props.spatialDATA[type])}
        </Text>
      );
    }
    return thisOutput;
  };

  fontSizeENCN = () => {
    if (this.props.lang == "zh") return 16;
    else return 10;
  };

  // Display images
  displayImage = (img, i) => {
    var dataType = this.props.dataType;

    if (dataType == 1) {
      var image = (
        <TouchableOpacity>
          <Image
            style={{
              width: 60,
              height: 60,
              alignSelf: "center",
              borderRadius: 30
            }}
            source={{
              uri: img
            }}
          />
        </TouchableOpacity>
      );
    }
    if (dataType == 2) {
      var image = (
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
      );
    }

    if (dataType == 3) {
      var image = (
        <TouchableOpacity>
          <Image
            style={{
              width: 60,
              height: 60,
              alignSelf: "center",
              borderRadius: 30
            }}
            source={{
              uri: img
            }}
          />
        </TouchableOpacity>
      );
    }
    return image;
  };

  // Get variable name in ZH or EN
  variableName = (name, i) => {
    if (this.props.lang == "zh") return this.props.spatialNAMES_CN[i];
    return this.props.spatialNAMES[i];
  };

  // The spatial boxes
  spatialBox = (col, row, name) => {
    var matched = 0;
    var nodes = range(0, this.props.spatialNODES, 1);

    var boxname = name + col + row;

    // Blank box
    var box = (
      <View
        style={{
          key: { boxname },
          flex: 1,
          margin: 1,
          backgroundColor: "#ededed",
          borderRadius: 10
        }}
      >
        <Text allowFontScaling={false} style={{ flex: 1 }}></Text>
      </View>
    );

    // Check per node
    nodes.map((a, node) => {
      var x = this.props.spatialYCOORDS[node];
      var y = this.props.spatialXCOORDS[node];

      var nodename = name + node + col + row;
      if (col == x && row == y) {
        var stat = this.props.spatialNODESTATS[node];
        var values = this.props.spatialDATA[name];
        var noNan = values.filter(function(value) {
          return !Number.isNaN(value);
        });
        var noZero = noNan.filter(function(value) {
          if (value != 0) return value;
        });

        var max = Math.max.apply(null, noZero);
        var min = Math.min.apply(null, noZero);
        var data = this.props.spatialDATA[name][node];
        var norm = normalize(data, max, min) * 255;
        var boxColor = "rgb(" + norm + ", 0, 0)";
        var fontSize = 14;

        //  If more than 5 digits
        if (data > 10000) {
          fontSize = 10;
        }
        // If outlier
        if (norm < 150) {
          boxColor = boxColors[stat];
        }
        // If data is nan
        if (isNaN(norm)) {
          norm = 0;
          boxColor = boxColors[1];
        }
        // If node is inactive
        if (stat == 2) {
          data = "-";
          boxColor = boxColors[stat];
        }

        box = (
          <TouchableOpacity
            key={nodename}
            style={{
              flex: 1,
              margin: 1,
              backgroundColor: boxColor,
              borderRadius: 10
            }}
          >
            <Text
              allowFontScaling={false}
              key={"node" + { node }}
              style={{
                textAlign: "center",
                fontSize: 8,
                color: "#ffffff",
                marginTop: 3,
                flex: 1
              }}
            >
              NODE{node + 1}
            </Text>

            <Text
              allowFontScaling={false}
              key={"n" + { node }}
              style={{
                textAlign: "center",
                fontSize: fontSize,
                marginBottom: 6,
                color: "#ffffff"
              }}
            >
              {data}
            </Text>
          </TouchableOpacity>
        );
      }
    });

    if (row == this.props.spatialDOORX && col == this.props.spatialDOORY) {
      var box = (
        <View
          style={{
            key: "door" + row,
            flex: 1,
            margin: 1,
            backgroundColor: "#000000",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              justifyContent: "center",
              color: "#ffffff",
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 10,
              flex: 1
            }}
          >
            {this.t("DOOR", this.props.lang)}
          </Text>
        </View>
      );
    }

    return box;
  };

  render() {
    return (
      <View>
        <ScrollView>
          {this.props.spatialCODES.map((name, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                marginLeft: 15,
                marginRight: 15,
                marginBottom: 20,
                alignItems: "center"
              }}
            >
              {/* Grid */}
              <View key={name + i} style={{ flex: 0.78 }}>
                {cols.map((col, i) => (
                  <View
                    style={{
                      key: col,
                      flex: 1,
                      height: 40,
                      alignItems: "center",
                      flexDirection: "row"
                    }}
                  >
                    {rows.map((row, j) => this.spatialBox(col, row, name))}
                  </View>
                ))}
              </View>

              {/* Right panel */}

              <View
                style={{
                  flex: 0.22
                }}
              >
                <View>
                  {/* Image */}
                  {this.displayImage(this.props.spatialIMAGES[i], i)}

                  {/* Data name */}
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: this.fontSizeENCN(),
                      textTransform: "uppercase",
                      // letterSpacing: 1,
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.variableName(name, i)}
                  </Text>

                  {/* Average */}
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.t("MEAN", this.props.lang)}:{" "}
                    {this.getAverage(this.props.spatialDATA[name])}
                  </Text>

                  {/* Min */}
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.t("MIN", this.props.lang)}:{" "}
                    {this.getMinimum(this.props.spatialDATA[name])}
                  </Text>

                  {/* Max */}
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.t("MAX", this.props.lang)}:{" "}
                    {this.getMaximum(this.props.spatialDATA[name])}
                  </Text>

                  {/* Max */}
                  {this.showMax(name)}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}
