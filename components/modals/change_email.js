//
// Change email
// Version history: 1.0
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
  Alert
} from "react-native";

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_saveNewEmail = base_url + "save_new_email.php";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class ChangeEmailAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      newEmail: ""
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  //
  // Change email in layout
  //
  onChangeEmail = newEmail => {
    this.setState({ newEmail: newEmail });
  };

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
  hideChangeEmailPopup = () => {
    this.props.hideChangeEmailPopup?.();
  };

  //
  // Change email address
  //
  changeEmailAddress = () => {
    var thisURL =
      URL_saveNewEmail +
      "?username=" +
      this.props.username +
      "&email=" +
      this.state.newEmail;

    console.log("[change_email.js]", thisURL);

    var n = this.state.newEmail.includes("@");
    if (n == false) {
      this.notifyMessage("Invalid e-mail address!");
    } else {
      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var status = response.status;
          this.props.changeEmail(this.state.newEmail);
          if (status == "0") {
            this.notifyMessage("E-mail address cannot be blank!");
          } else {
            this.notifyMessage("E-mail address changed successfully!");
            this.props.hideChangeEmailPopup();
          }
        });
    }
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showChangeEmailPopup}
        >
          <TouchableOpacity
            style={styles.popupBox}
            onPress={this.props.hideChangeEmailPopup}
          >
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                width: 300,
                height: 220,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <Text allowFontScaling={false} style={styles.popupTextLarge}>
                {this.t("CHANGE E-MAIL ADDRESS", this.props.lang)}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("Current e-mail address", this.props.lang)}:
              </Text>
              <Text allowFontScaling={false} style={styles.popupText}>
                {this.props.email}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("New e-mail address", this.props.lang)}:
              </Text>
              <TextInput
                allowFontScaling={false}
                style={[
                  styles.inputText,
                  { backgroundColor: this.state.inputColor }
                ]}
                onChangeText={text => this.onChangeEmail(text)}
              />

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "flex-end"
                }}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.confirmBtn}
                  title="SAVE"
                  onPress={() => {
                    this.changeEmailAddress();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("SAVE", this.props.lang)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.cancelBtn}
                  title="CANCEL"
                  onPress={() => {
                    this.props.hideChangeEmailPopup();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CANCEL", this.props.lang)}
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

const styles = StyleSheet.create({
  popupTextLarge: {
    fontSize: 17,
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
    padding: 5,
    marginBottom: 10
  },
  confirmBtn: {
    flex: 1,
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
    flex: 1,
    marginLeft: 5,
    height: 50,
    width: 125,
    backgroundColor: "#ff0000",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  }
});
