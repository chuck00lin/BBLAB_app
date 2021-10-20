//
// Replace sticky paper popup
// Version history: 1.0
// - Confirm button: ok
// - Cancel button: ok
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
  Alert,
  Switch
} from "react-native";
import Select from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import Logo from "../i2pdm_logo.js";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

var time_now = new moment();
export default class AccountReportSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = TRANSLATIONS_EN[myString];
    return outputString;
  }

  //
  // Wrong auth code notification
  //
  notifyMessage(msg: string) {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  }

  //
  //  Copies function from parent
  //
  hideAboutUsPopup = () => {
    this.props.hideAboutUsPopup?.();
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showAboutUsPopup}
        >
          <TouchableOpacity
            style={styles.popupBox}
            onPress={() => {
              this.props.hideAboutUsPopup();
            }}
          >
            <View
              style={{
                backgroundColor: "#303030",
                width: 380,
                height: 500,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <Logo />

              {/* Details */}
              <View>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {this.t("Developer", this.props.lang)}:
                </Text>
                <Text style={{ color: "white" }}>
                  {this.t("NTU", this.props.lang)}
                </Text>
                <Text style={{ color: "white" }}>
                  {this.t("BME", this.props.lang)}
                </Text>
                <Text style={{ color: "white" }}>
                  {this.t("LAB", this.props.lang)}
                </Text>
                <Text></Text>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  E-mail:
                </Text>
                <Text style={{ color: "white" }}>ntubblab@gmail.com</Text>

                <Text></Text>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {this.t("PARTNER", this.props.lang)}:
                </Text>
                <Text style={{ color: "white" }}>
                  {this.t("TDARES", this.props.lang)}
                </Text>
              </View>

              {/* Buttons */}
              <View>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.cancelBtn}
                  title="CLOSE"
                  onPress={() => {
                    this.props.hideAboutUsPopup();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CLOSE", this.props.lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const dropDownBtn = StyleSheet.create({
  inputWeb: {
    fontSize: 10,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    backgroundColor: "#fff",
    width: 200
  },
  inputIOS: {
    fontSize: 10,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    backgroundColor: "#fff",
    width: 220
  },
  inputAndroid: {
    fontSize: 10,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    backgroundColor: "#fff",
    width: 220
  },

  placeholder: {
    fontSize: 10,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    width: 220
  }
});

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    width: 200,
    backgroundColor: "#ffffff"
  },

  popupTextLarge: {
    fontSize: 14,
    textAlign: "left",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5
  },

  popupBox: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  },

  popupText: {
    fontSize: 16
  },

  inputText: {
    height: 40,
    width: 280,
    padding: 5
  },
  confirmBtn: {
    flex: 0.5,
    height: 50,
    marginRight: 5,
    backgroundColor: "#5f9657",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  },
  cancelBtn: {
    // flex: 0.5,
    marginLeft: 20,
    marginRight: 20,
    height: 40,

    backgroundColor: "#ff0000",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  }
});
