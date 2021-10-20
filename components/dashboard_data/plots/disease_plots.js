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
import {
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
  VictoryBar,
  VictoryLabel,
  VictoryContainer
} from "victory-native";

//
// Alarm variables
//
const alarmColors = ["#489147", "#0000ff", "#ffc72b", "#ff7930", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
const alarmNames_CN = ["低", "警戒", "較高", "高", "嚴重"];
var windowWidth = Dimensions.get("window").width * 0.9;
var windowHeight = Dimensions.get("window").height / 2;
var widthAdjustment = 1.22;

import ModalDiseaseInfo from "../../modals/disease_info.js";

import { TRANSLATIONS_ZH } from "../../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../../translations/en/translations";

export default class DiseasePlots extends Component {
  constructor() {
    super();
    this.state = {
      showDiseaseInfoPopup: false,
      selectedDisease: "",
      selectedLocation: ""
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  hideDiseaseInfoPopup = () => {
    this.setState({ showDiseaseInfoPopup: false });
  };

  diseaseName = (name, i) => {
    var thisName = name;
    if (this.props.lang == "zh")
      return this.props.diseaseDATA.diseases_display_cn[i];
    return this.props.diseaseDATA.diseases_display_en[i];
  };

  fontSizeENCN = () => {
    if (this.props.lang == "zh") return 14;
    else return 10;
  };

  barMax = (disease, x) => {
    var output = 25;
    var maxD = this.props.diseaseDATA.values[disease].length;
    var maxC = Math.max.apply(1, this.props.diseaseDATA.values[disease]);

    if (maxD <= 0) maxD = 10;
    if (maxC <= 0) maxC = 5;
    if (x == 0) output = maxD;
    if (x == 1) output = maxC * 1.2;
    return output;
  };

  outputData = (resolution, disease) => {
    var output = [];

    var data = this.props.diseaseDATA.values[disease];
    if (resolution == 2) {
      var alarms = this.props.diseaseDATA.alarms[disease];
      output = data.map((d, i) => ({
        x: i,
        y: d,
        fill: alarmColors[alarms[i]]
      }));
    }
    if (resolution == 3) {
      output = data.map((d, i) => ({
        x: i,
        y: d,
        fill: "#804303"
      }));
    }
    return output;
  };

  pesticideData = (resolution, max) => {
    var output = [];

    if (resolution == 2) {
      var data = this.props.diseaseDATA.pesticides;
      output = data.map((d, i) => ({
        x: i,
        y: d * max,
        fill: "#ededed"
      }));
    }
    // if (resolution == 3) {
    //   var data = this.props.countDATA.total_counts;
    // output = data.map((d, i) => ({
    //   x: i,
    //   y: 0,
    //   fill: "#ededed"
    // }));
    // }
    return output;
  };

  outputAlarm = (resolution, disease) => {
    var output = <View></View>;

    if (resolution == 2) {
      var alarms = this.props.diseaseDATA.alarms[disease];

      var thisAlarm =
        alarmNames[
          this.props.diseaseDATA.alarms[disease][
            this.props.diseaseDATA.values[disease].length - 1
          ]
        ];

      if (this.props.lang == "zh") {
        thisAlarm =
          alarmNames_CN[
            this.props.diseaseDATA.alarms[disease][
              this.props.diseaseDATA.values[disease].length - 1
            ]
          ];
      }

      output = (
        <Text
          allowFontScaling={false}
          style={{
            width: 80,
            fontSize: 12,
            color: "#ffffff",
            padding: 5,
            textTransform: "uppercase",
            fontWeight: "bold",
            textAlign: "center",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor:
              alarmColors[
                this.props.diseaseDATA.alarms[disease][
                  this.props.diseaseDATA.values[disease].length - 1
                ]
              ]
          }}
        >
          {thisAlarm}
        </Text>
      );
    }

    return output;
  };

  outputXLabel = resolution => {
    if (resolution == 2) var output = this.t("DATE", this.props.lang);
    if (resolution == 3) var output = this.t("MONTH", this.props.lang);
    return output;
  };

  outputYLabel = resolution => {
    if (resolution == 2)
      var output = this.t("DAILY PROBABILITY", this.props.lang) + "(%)";
    if (resolution == 3)
      var output = this.t("MONTHLY PROBABILITY", this.props.lang) + "(%)";
    // console.log(output);
    return output;
  };

  render() {
    // Auto adjust height
    if (Dimensions.get("window").width >= 450) {
      windowHeight = Dimensions.get("window").height / 3;
    }
    return (
      <View>
        <ModalDiseaseInfo
          ref="diseaseInfo"
          hideDiseaseInfoPopup={() => this.hideDiseaseInfoPopup()}
          showDiseaseInfoPopup={this.state.showDiseaseInfoPopup}
          selectedLocation={this.state.selectedLocation}
          selectedDisease={this.state.selectedDisease}
        />

        <ScrollView>
          {this.props.diseaseDATA.diseases.map((disease, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
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
                    width={windowWidth * widthAdjustment}
                    height={windowHeight * 0.9}
                    label={this.outputXLabel(this.props.resolution)}
                    // tickCount={8}
                    axisLabelComponent={<VictoryLabel dy={25} />}
                    tickValues={this.props.diseaseDATESINDICES}
                    tickFormat={this.props.diseaseDATESOUTPUT}
                    standalone={false}
                    domain={[
                      -1,
                      Math.max.apply(1, [
                        1,
                        this.props.diseaseDATA.values[disease].length
                      ])
                    ]}
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

                  {/* Increase in count */}
                  <VictoryAxis
                    height={windowHeight * 0.9}
                    width={windowWidth}
                    tickCount={6}
                    domain={[0, this.barMax(disease, 1)]}
                    style={{
                      ticks: { stroke: "black", size: 10 },
                      tickLabels: {
                        fontSize: 24,
                        padding: 10
                      },
                      axisLabel: {
                        fontWeight: "bold",
                        fontSize: 24,
                        padding: 35
                      }
                    }}
                    dependentAxis
                    standalone={false}
                    axisLabelComponent={<VictoryLabel dy={-45} />}
                    label={this.outputYLabel(this.props.resolution)}
                  />

                  {/* Pesticide data */}
                  <VictoryBar
                    domain={{
                      x: [-1, this.barMax(disease, 0)],
                      y: [0, this.barMax(disease, 1)]
                    }}
                    width={windowWidth * widthAdjustment}
                    height={windowHeight * 0.9}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill
                      }
                    }}
                    barRatio={0.6}
                    standalone={false}
                    data={this.pesticideData(
                      this.props.resolution,
                      this.barMax(disease, 1)
                    )}
                  />

                  {/* Data itself */}
                  <VictoryBar
                    domain={{
                      x: [-1, this.barMax(disease, 0)],
                      y: [0, this.barMax(disease, 1)]
                    }}
                    width={windowWidth * widthAdjustment}
                    height={windowHeight * 0.9}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill
                      }
                    }}
                    barRatio={0.6}
                    standalone={false}
                    data={this.outputData(this.props.resolution, disease)}
                  />
                </Svg>
              </View>

              {/* Right panel */}
              <View
                style={{
                  // paddingTop: 20,
                  width: 140,
                  height: 200,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* Image */}
                <TouchableOpacity
                  onPress={() => {
                    var location = this.props.location;

                    this.setState({
                      showDiseaseInfoPopup: true
                    });
                    this.refs.diseaseInfo.fetchDiseaseInfo(
                      this.props.diseaseDATA.diseases_display_en[i],
                      location
                    );
                  }}
                >
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      alignSelf: "center",
                      borderRadius: 30
                    }}
                    source={{
                      uri: this.props.diseaseDATA.images[i]
                    }}
                  />
                </TouchableOpacity>

                {/* Disease name */}
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
                  {this.diseaseName(disease, i)}
                </Text>

                {/* Value */}
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 16,
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  {
                    this.props.diseaseDATA.values[disease][
                      this.props.diseaseDATA.values[disease].length - 1
                    ]
                  }
                  %
                </Text>

                {/* Alarm */}
                {this.outputAlarm(this.props.resolution, disease)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}
