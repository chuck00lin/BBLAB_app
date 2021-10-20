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
  Alert
} from "react-native";

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_replacepapers = base_url + "save_new_paper.php";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class ToolsStickyPaperTrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      authorizationCode: 0
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
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
  // Replace sticky paper traps
  //
  fetchReplacePapers = () => {
    var thisURL =
      URL_replacepapers +
      "?loc=" +
      this.props.location +
      "&auth=" +
      this.state.authorizationCode;
    console.log("[replace_trap.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var status = Number(response.status);
        if (status == 0) {
          this.setState({ inputColor: "#ff7c75" });
        } else {
          this.props.hidePaperPopup();
          this.notifyMessage("Success!");
          this.setState({ inputColor: "#ffffff" });
        }
      });
  };

  //
  //  Updates auth code value
  //
  onChangeAuthorizationCode(authorizationCode) {
    this.setState({ authorizationCode: authorizationCode });
  }

  //
  //  Copies function from parent
  //
  hidePaperPopup = () => {
    this.props.hidePaperPopup?.();
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showPaperPopup}
        >
          <TouchableOpacity
            style={styles.popupBox}
            onPress={this.props.hidePaperPopup}
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
                {this.t("STICKY PAPER REPLACEMENT", this.props.lang)}
              </Text>

              <Text allowFontScaling={false} style={styles.popupText}>
                {this.t(
                  "Did you replace the sticky paper traps in ",
                  this.props.lang
                )}
                {this.props.location}?
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.popupText, { fontWeight: "bold" }]}
              >
                {this.t("Authorization code:", this.props.lang)}
              </Text>
              <TextInput
                allowFontScaling={false}
                keyboardType="numeric"
                style={[
                  styles.inputText,
                  { backgroundColor: this.state.inputColor }
                ]}
                onChangeText={text => this.onChangeAuthorizationCode(text)}
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
                  title="CONFIRM"
                  onPress={() => {
                    this.fetchReplacePapers();
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
                    this.props.hidePaperPopup();
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
    padding: 5
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
