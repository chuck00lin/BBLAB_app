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
const URL_disease_info = base_url + "get_disease_info.php";

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

export default class DiseaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      authorizationCode: 0,
      disease: "",
      location: "",
      info: [],
      t_ranges: [],
      humidity: "",
      alarms: [],
      crops: [],
      pesticides: [],
      loaded: 0,
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
  fetchDiseaseInfo = (disease, location) => {
    var thisURL = URL_disease_info + "?disease=" + disease + "&loc=" + location;

    this.setState({ disease: disease, location: location });
    console.log("[disease_info.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.setState({
          info: response,
          alarms: response.alarm,
          crops: response.crop,
          pesticides: response.pesticide,
          t_ranges: response.t_ranges,
          humidity: response.humidity,
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

  diseaseName(lang) {
    if (lang == "zh") return this.state.info.disease_name_cn;
    else return this.state.info.disease_name;
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
              {"< DSV <="} {this.state.alarms[i + 1]}
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
              {"< DSV "}
            </Text>
          </View>
        </View>
      );
    }
  };

  diseaseInfo = () => {
    if (this.state.loaded == 1) {
      var pesticideInfo = JSON.stringify(this.state.pesticides);
      var crop = this.state.info.crop;
      if (pesticideInfo.length > 20) {
        return (
          <ScrollView
            style={{
              backgroundColor: "#ebe8e8",
              borderRadius: 10,
              padding: 10,
              height: 163,
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
                    {this.t("Formulation", this.props.lang)}: {pesticide.F_EN}
                  </Text>
                  <Text allowFontScaling={false}>
                    {this.t(
                      "Physical and chemical properties",
                      this.props.lang
                    )}
                    : {pesticide.PHYCHEM_EN}
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
  hideDiseaseInfoPopup = () => {
    this.props.hideDiseaseInfoPopup?.();
  };

  render() {
    return (
      <View>
        <Modal
          style={{ backgroundColor: "black", flex: 1 }}
          animationType="fade"
          transparent={true}
          visible={this.props.showDiseaseInfoPopup}
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
                      uri: this.state.info.display_img
                    }}
                  />
                </View>

                <View style={{ flex: 0.55, justifyContent: "center" }}>
                  <Text allowFontScaling={false} style={styles.popupTextLarge}>
                    {this.diseaseName(this.props.lang)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.popupText,
                      { fontWeight: "bold", fontSize: 13 }
                    ]}
                  >
                    {this.t("Disease characteristics", this.props.lang)}:
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Min. niche temperature", this.props.lang)}:{" "}
                    {this.state.t_ranges[0]}°C
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Peak niche temperature", this.props.lang)}:{" "}
                    {this.state.t_ranges[1]}°C
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 12 }}>
                    {this.t("Humidity requirement", this.props.lang)}: >
                    {this.state.humidity}%
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

              {this.diseaseInfo()}

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.cancelBtn}
                title="CANCEL"
                onPress={() => {
                  this.props.hideDiseaseInfoPopup();
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
    fontSize: 20,
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
