//
// Forgot username/password
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
const URL_getUsernamePassword = base_url + "get_username_password.php";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class ForgotUsernamePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      password: "",
      username: "",
      contact: ""
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  onChangeContact = contact => {
    this.setState({ contact: contact });
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
  hideForgotUsernamePassword = () => {
    this.props.hideForgotUsernamePassword?.();
  };

  //
  // Get username and password``
  //
  //
  // Replace sticky paper traps
  //
  getUsernamePassword = () => {
    var thisURL = URL_getUsernamePassword + "?number=" + this.state.contact;

    console.log("[forgot_userpassword.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var username = response.username;
        var password = response.password;
        var status = response.status;
        if (status == "0") {
          this.notifyMessage("Cannot find from database!");
        } else {
          this.setState({ username: username, password: password });
        }
      });
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showForgotUsernamePassword}
        >
          <TouchableOpacity
            style={styles.popupBox}
            onPress={this.props.hideForgotUsernamePassword}
          >
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                width: 300,
                height: 250,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <Text allowFontScaling={false} style={styles.popupTextLarge}>
                {this.t("FORGOT USERNAME & PASSWORD", this.props.lang)}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("Contact number:", this.props.lang)}
              </Text>
              <TextInput
                allowFontScaling={false}
                keyboardType="numeric"
                style={[
                  styles.inputText,
                  { backgroundColor: this.state.inputColor }
                ]}
                onChangeText={text => this.onChangeContact(text)}
              />

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("Username:", this.props.lang)}
                {this.state.username}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("Password:", this.props.lang)} {this.state.password}
              </Text>

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
                  title="CHECK"
                  onPress={() => {
                    this.getUsernamePassword();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CONFIRM", this.props.lang)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.cancelBtn}
                  title="CANCEL"
                  onPress={() => {
                    this.props.hideForgotUsernamePassword();
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
