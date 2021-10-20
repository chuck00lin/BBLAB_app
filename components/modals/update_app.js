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
  Linking
} from "react-native";

//
// URLS
//
const info = require("../../app.json");
const VERSION = info["expo"]["version"];

const info2 = require("../../app_info.json");
const ANDROID_LINK = info2["android_link"];
const IOS_LINK = info2["ios_link"];

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class UpdateApp extends Component {
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

  handleUpdate = () => {
    var thisLink = "";
    if (Platform.OS === "android") {
      thisLink = ANDROID_LINK;
    } else {
      thisLink = IOS_LINK;
    }

    Linking.canOpenURL(thisLink).then(supported => {
      if (supported) {
        Linking.openURL(thisLink);
      } else {
        console.log("Don't know how to open URI: " + this.props.url);
      }
    });
  };

  //
  //  Copies function from parent
  //
  hideUpdateApp = () => {
    this.props.hideUpdateApp?.();
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showUpdateApp}
        >
          <View style={styles.popupBox}>
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
              <TouchableOpacity onPress={this.handleUpdate}>
                <Image
                  style={{
                    alignSelf: "center",
                    width: 200,
                    height: 100,
                    borderRadius: 10
                  }}
                  source={require("../../assets/icon.png")}
                />
              </TouchableOpacity>
              <Text
                allowFontScaling={false}
                style={{ color: "black", textAlign: "center", marginTop: 10 }}
              >
                {this.t(
                  "Touch icon to update your APP to the latest version",
                  this.props.lang
                )}
              </Text>
            </View>
          </View>
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
