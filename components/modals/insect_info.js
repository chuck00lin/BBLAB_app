//
// Insect info popup
// Version history: 1.0
// - Cancel button: ok
// - Insect image: ok
// - Insect size/temperature: X
// - Insect alarms: ok
// - Pesticide info: X
//

import React, { Component } from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Modal,
  ToastAndroid,
  Platform,
  AlertIOS
} from "react-native";
import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_insect_info = base_url + "get_insect_info.php";

//
// Alarm variables
//
const alarmColors = ["#489147", "#0000ff", "#ff7930", "#ffc72b", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
const alarmRecommendations = [
  "No action required",
  "Intervention is recommended",
  "Environmental control is recommended",
  "Chemical control is reocmmended",
  "Chemical control is highly recommended"
];

export default class InsectInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      authorizationCode: 0,
      specie: "",
      location: "",
      info: [],
      alarms: [],
      crops: [],
      pesticides: [],
      loaded: 0,
      tmin1: 0,
      tmax: 0,
      tmin2: 0,
      size: ""
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  //
  // Fetch insect info
  //
  fetchInsectInfo = (specie, location) => {
    var thisURL = URL_insect_info + "?specie=" + specie + "&loc=" + location;

    this.setState({ specie: specie, location: location });
    console.log("[insect_info.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        this.setState({
          info: response,
          alarms: response.alarm,
          crops: response.crops,
          pesticides: response.pesticide,
          tmin1: response.temperature[0],
          tmax: response.temperature[1],
          tmin2: response.temperature[2],
          size: response.size,
          loaded: 0
        });
      })
      .then(response => {
        this.setState({ loaded: 1 });
      });
  };

  //
  // Notification
  //
  notifyMessage(msg: string) {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  }

  specieName(lang) {
    if (lang == "zh") return this.state.info.specie_cn;
    else return this.state.info.specie;
  }

  alarmInfo = i => {
    var tSize = 12;
    if (this.props.lang == "zh") tSize = 14;
    else tSize = 12;

    if (i < 4) {
      return (
        <View
          style={{
            marginBottom: 5,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <View
            style={[
              styles.countNameBox,
              { backgroundColor: alarmColors[Number(i)] }
            ]}
          >
            <Text
              allowFontScaling={false}
              style={{ fontSize: 12, color: "#ffffff" }}
            >
              {this.t(alarmNames[i], this.props.lang)}
            </Text>
          </View>
          <View>
            <Text
              allowFontScaling={false}
              style={{ fontSize: tSize, color: "black", fontWeight: "bold" }}
            >
              {this.t(alarmRecommendations[i], this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontSize: 12, color: "black" }}
            >
              {this.t("Range", this.props.lang)}: {this.state.alarms[i]}{" "}
              {"< C <="} {this.state.alarms[i + 1]}
            </Text>
          </View>
        </View>
      );
    }
    if (i == 4) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={[
              styles.countNameBox,
              { backgroundColor: alarmColors[Number(i)] }
            ]}
          >
            <Text
              allowFontScaling={false}
              style={{ fontSize: 12, color: "#ffffff" }}
            >
              {this.t(alarmNames[i], this.props.lang)}
            </Text>
          </View>

          <View>
            <Text
              allowFontScaling={false}
              style={{ fontSize: tSize, color: "black", fontWeight: "bold" }}
            >
              {this.t(alarmRecommendations[i], this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ fontSize: 12, color: "black" }}
            >
              {this.t("Range", this.props.lang)}: {this.state.alarms[i]}{" "}
              {"< C "}
            </Text>
          </View>
        </View>
      );
    }
  };

  pesticideInfo = () => {
    if (this.state.loaded == 1) {
      var pesticideInfo = JSON.stringify(this.state.pesticides);
      var crop = this.state.info.crops[0];
      if (pesticideInfo.length > 20) {
        return (
          <ScrollView
            style={{
              backgroundColor: "#ebe8e8",
              borderRadius: 10,
              padding: 10,
              height: 150,
              marginBottom: 10
            }}
          >
            {this.state.pesticides[crop].map((pesticide, i) => (
              <View key={pesticide + i}>
                <View key={i}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      backgroundColor: "#feffa8",
                      borderRadius: 5,
                      padding: 4,
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 2
                    }}
                  >
                    {this.t("Pesticide", this.props.lang)} #{i + 1}:{" "}
                    {pesticide.PN_CN}
                  </Text>
                </View>
                <View style={{ marginLeft: 5 }} key={pesticide}>
                  <Text allowFontScaling={false}>
                    {this.t("Category", this.props.lang)}: {pesticide.PC_CN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Spraying period", this.props.lang)}:{" "}
                    {pesticide.SP_EN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Dosage per hectare", this.props.lang)}:{" "}
                    {pesticide.DPH_EN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Total content", this.props.lang)}:{" "}
                    {pesticide.TC_EN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Formulation", this.props.lang)}: {pesticide.F_CN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t(
                      "Physical and chemical properties",
                      this.props.lang
                    )}
                    : {pesticide.PHYCHEM_CN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Manufacturer", this.props.lang)}: {pesticide.MN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t("Manufacturer address", this.props.lang)}:{" "}
                    {pesticide.MA}
                  </Text>
                  <Text allowFontScaling={false}></Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      } else {
      }
    }
  };

  //
  //  Copies function from parent
  //
  hideInsectInfoPopup = () => {
    this.props.hideInsectInfoPopup?.();
  };

  render() {
    return (
      <View>
        <Modal
          style={{ backgroundColor: "black", flex: 1 }}
          animationType="fade"
          transparent={true}
          visible={this.props.showInsectInfoPopup}
        >
          <View
            style={styles.popupBox}
            // onPress={this.props.hideInsectInfoPopup}
          >
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                width: 350,
                // height:800
                borderRadius: 10,
                padding: 20
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 0.45 }}>
                  <Image
                    style={{
                      alignSelf: "center",
                      height: 120,
                      width: 120,
                      borderRadius: 75
                    }}
                    source={{
                      uri: this.state.info.image
                    }}
                  />
                </View>

                <View style={{ flex: 0.55 }}>
                  <Text allowFontScaling={false} style={styles.popupTextLarge}>
                    {this.specieName(this.props.lang)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.popupText, { fontWeight: "bold" }]}
                  >
                    {this.t("Insect characteristics", this.props.lang)}:
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Typical size", this.props.lang)}: {this.state.size}
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Min. niche temperature", this.props.lang)}:{" "}
                    {this.state.tmin1}°C
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Peak niche temperature", this.props.lang)}:{" "}
                    {this.state.tmax}°C
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Max. niche temperature", this.props.lang)}:{" "}
                    {this.state.tmin2}°C
                  </Text>
                </View>
              </View>

              <Text allowFontScaling={false}> </Text>

              {this.alarmInfo(0)}
              {this.alarmInfo(1)}
              {this.alarmInfo(2)}
              {this.alarmInfo(3)}
              {this.alarmInfo(4)}
              <Text allowFontScaling={false}> </Text>

              {this.pesticideInfo()}

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.cancelBtn}
                title="CANCEL"
                onPress={() => {
                  this.props.hideInsectInfoPopup();
                }}
              >
                <Text allowFontScaling={false} style={{ color: "white" }}>
                  CLOSE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  popupTextLarge: {
    fontSize: 22,
    fontWeight: "bold"
  },

  popupBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    // alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  },

  pesticideBox: {
    height: 300,
    backgroundColor: "#ff0000",
    width: 300
  },

  countNameBox: {
    height: 30,
    width: 80,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    color: "#ffffff"
  },

  popupText: {
    fontSize: 16
  },

  inputText: {
    padding: 5
  },

  cancelBtn: {
    marginLeft: 5,
    height: 50,
    width: 125,
    backgroundColor: "#ff0000",

    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  }
});
