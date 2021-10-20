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
const enviImages = [
  require("../../assets/t.png"),
  require("../../assets/h.png"),
  require("../../assets/l.png")
];
const boxColors = ["#ffffff", "#f7f7f7", "#ff8d85"];

import ModalTrapImage from "../modals/trap_image.js";
import ModalInsectInfo from "../modals/insect_info.js";

export default class TableData extends Component {
  constructor() {
    super();
    this.state = {
      showTrapImagePopup: false,
      showInsectInfoPopup: false,
      imageURL: "",
      selectedInsect: "",
      selectedLocation: ""
    };
  }

  hideInsectInfoPopup = () => {
    this.setState({ showInsectInfoPopup: false });
  };
  hideTrapImagePopup = () => {
    this.setState({ showTrapImagePopup: false });
  };

  render() {
    return (
      <View>
        <ModalTrapImage
          ref="trapImage"
          hideTrapImagePopup={() => this.hideTrapImagePopup()}
          showTrapImagePopup={this.state.showTrapImagePopup}
          imageURL={this.state.imageURL}
        />
        <ModalInsectInfo
          ref="insectInfo"
          hideInsectInfoPopup={() => this.hideInsectInfoPopup()}
          showInsectInfoPopup={this.state.showInsectInfoPopup}
          selectedLocation={this.state.selectedLocation}
          selectedInsect={this.state.selectedInsect}
        />

        <ScrollView>
          {this.props.tableNODES.map((node, i) => (
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
                  paddingTop: 10,
                  paddingBottom: 10,
                  flex: 1,
                  backgroundColor: boxColors[this.props.tableDATA.nodestat[i]],
                  borderRadius: 10,
                  padding: 5,
                  marginBottom: 20
                }}
              >
                <View>
                  <View style={{ flexDirection: "row" }}>
                    {/* Node info */}
                    <View style={{ marginLeft: 5, flex: 0.4 }}>
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontWeight: "bold",
                          letterSpacing: 1,
                          fontSize: 12
                        }}
                      >
                        NODE {node}
                      </Text>

                      {/* <Image
                        style={{
                          alignSelf: "flex-start",
                          height: 50,
                          width: 80
                        }}
                        source={{
                          uri: this.props.tableDATA.images[i]
                        }}
                      /> */}
                      <Text allowFontScaling={false} style={styles.subText}>
                        {this.props.tableDATA.dates[i]}
                      </Text>
                      <Text allowFontScaling={false} style={styles.subText2}>
                        IP: {this.props.tableDATA.ip[i]}
                      </Text>
                      <Text allowFontScaling={false} style={styles.subText2}>
                        MAC: {this.props.tableDATA.mac[i]}
                      </Text>
                      <Text allowFontScaling={false} style={styles.subText2}>
                        CPU: {this.props.tableDATA.cpu[i]}°C
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({
                            showTrapImagePopup: true,
                            imageURL: this.props.tableDATA.images[i]
                          });
                        }}
                      >
                        <Image
                          style={{
                            alignSelf: "center",
                            height: 50,
                            width: 50
                          }}
                          source={require("../../assets/stickytrap.png")}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      {/* Sensor data*/}
                      <View
                        style={{
                          flexDirection: "row",
                          marginBottom: 10
                        }}
                      >
                        {this.props.tableENVITYPES.map((envi, j) => (
                          <View
                            key={j}
                            style={{
                              flex: 1,
                              flexDirection: "row"
                            }}
                          >
                            <Image
                              style={{
                                height: 25,
                                width: 25,
                                marginRight: 2
                              }}
                              source={enviImages[j]}
                            />
                            <Text
                              allowFontScaling={false}
                              style={{ fontSize: 16 }}
                            >
                              {this.props.tableDATA.envi_data[envi][i]}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              style={{ fontSize: 12 }}
                            >
                              {this.props.tableDATA.envi_units[j]}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Count data row 1*/}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row"
                        }}
                      >
                        {this.props.tableINSECTTYPES
                          .slice(0, 4)
                          .map((insect, j) => (
                            <View
                              key={j}
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 10
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => {
                                  var location = this.props.location;

                                  this.setState({
                                    showInsectInfoPopup: true,
                                    selectedInsect: insect
                                  });
                                  this.refs.insectInfo.fetchInsectInfo(
                                    insect,
                                    location
                                  );
                                }}
                              >
                                <Image
                                  style={{
                                    height: 30,
                                    width: 30,
                                    marginRight: 2,
                                    borderRadius: 25
                                  }}
                                  source={{
                                    uri: this.props.tableDATA.species_image[j]
                                  }}
                                />
                              </TouchableOpacity>
                              <Text
                                allowFontScaling={false}
                                style={{ fontSize: 16, flex: 1 }}
                              >
                                {this.props.tableDATA.count_data[insect][i]}
                              </Text>
                            </View>
                          ))}
                      </View>
                      {/* Count data row 2*/}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          alignContent: "center",
                          marginBottom: 10
                        }}
                      >
                        {this.props.tableINSECTTYPES
                          .slice(4, 8)
                          .map((insect, j) => (
                            <View
                              key={j}
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => {
                                  var location = this.props.location;

                                  this.setState({
                                    showInsectInfoPopup: true,
                                    selectedInsect: insect
                                  });
                                  this.refs.insectInfo.fetchInsectInfo(
                                    insect,
                                    location
                                  );
                                }}
                              >
                                <Image
                                  style={{
                                    height: 30,
                                    width: 30,
                                    marginRight: 2,
                                    borderRadius: 25,
                                    alignSelf: "center"
                                  }}
                                  source={{
                                    uri: this.props.tableDATA.species_image[
                                      j + 4
                                    ]
                                  }}
                                />
                              </TouchableOpacity>
                              <Text
                                allowFontScaling={false}
                                style={{
                                  fontSize: 16,
                                  flex: 1
                                }}
                              >
                                {this.props.tableDATA.count_data[insect][i]}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  </View>
                </View>
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
  },
  subText: {
    fontSize: 11
  },
  subText2: {
    fontSize: 9
  }
});
