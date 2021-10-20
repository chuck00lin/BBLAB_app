import { StatusBar } from "expo-status-bar";
import React, { Component, useEffect, useState, createRef } from "react";
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
  PixelRatio,
  ToastAndroid,
  Linking
} from "react-native";
// import * as Notifications from "expo-notifications";
// import Constants from "expo-constants";
// import BackgroundAndroidTask from "./BackgroundTask";
// import queueFactory from "react-native-queue";
// import BackgroundTimer from "react-native-background-timer";
// import BGTimer from "react-native-inback-timer-ios";
// import BackgroundTask from "react-native-background-task";
// import BackgroundFetch from "react-native-background-fetch";

// const queue = queueFactory();
//
// // Register the worker function for "example-job" jobs.
// queue.addWorker("example-job", async (id, payload) => {
//   console.log('EXECUTING "example-job" with id: ' + id);
//   console.log(payload, "payload");
//
//   await new Promise(resolve => {
//     setTimeout(() => {
//       console.log('"example-job" has completed!');
//       resolve();
//     }, 1000);
//   });
// });

import moment from "moment-timezone";
import Login from "../pages/login.js";
import Select from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";

var fontScale = PixelRatio.getFontScale();
var fontSize = 16 / fontScale;

//
// Get app version
//
const info = require("../app.json");
const VERSION = info["expo"]["version"];

const info2 = require("../app_info.json");
const ANDROID_LINK = info2["android_link"];
const IOS_LINK = info2["ios_link"];

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_getLocations = base_url + "get_locations.php";
const URL_getUserInfo = base_url + "get_user_info.php";
const URL_getAppVersion = base_url + "get_app_version.php";

import ModalReportSettings from "../components/modals/report_settings.js";
import ModalChangeEmail from "../components/modals/change_email.js";
import ModalAboutUs from "../components/modals/aboutus.js";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";

//
// Global stuff
//
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false
//   })
// });

export default class DashboardAccount extends Component {
  constructor(props) {
    super(props);

    this.notificationListener = createRef();
    this.responseListener = createRef();

    this.state = {
      username: "",
      lang: "en",
      locations: [],
      locationInfo: [],
      locationSelected: "",
      name: "",
      email: "",
      contact: "",
      status: 0,
      n_days: 14,
      week_days: [],
      time: "",
      report_language: "en",
      showReportSettingsPopup: false,
      showChangeEmailPopup: false,
      showAboutUsPopup: false
      // expoPushToken: "",
      // notification: false
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  //
  // Notification
  //
  notifyMessage = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  async saveLanguage(value) {
    console.log("[dashboard_account.js]", "Language set: ", value);
    await AsyncStorage.setItem("language", value).then(
      this.setState({ lang: value })
    );
    this.props.languageResetter();
  }

  async afterSetStateFinished() {
    var lang = await AsyncStorage.getItem("language").then(lang =>
      this.setState({ lang: lang })
    );
  }

  fetchLocations() {
    AsyncStorage.getItem("username").then(username => {
      var thisURL = URL_getLocations + "?username=" + username;
      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var locationList = response.locations;
          var locationInfo = response;

          this.setState(
            {
              locations: locationList,
              locationInfo: locationInfo
            },
            () => {
              this.afterSetStateFinished();
            }
          );
        });
    });
  }

  fetchUserinfo() {
    AsyncStorage.getItem("username").then(username => {
      var thisURL = URL_getUserInfo + "?username=" + username;
      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var name = response.name;
          var email = response.email;
          var contact = response.contact;

          this.setState({
            username: username,
            name: name,
            email: email,
            contact: contact
          });
        });
    });
  }

  showReportSettingsPopup = location => {
    this.refs.reportSettings.fetchReportSettings(location, this.state.username);
    this.setState({ showReportSettingsPopup: true });
  };

  hideReportSettingsPopup = () => {
    this.setState({ showReportSettingsPopup: false });
  };

  changeEmail = email => {
    this.setState({ email: email });
  };

  showChangeEmailPopup = () => {
    this.setState({ showChangeEmailPopup: true });
  };

  hideChangeEmailPopup = () => {
    this.setState({ showChangeEmailPopup: false });
  };

  showAboutUsPopup = () => {
    this.setState({ showAboutUsPopup: true });
  };

  hideAboutUsPopup = () => {
    this.setState({ showAboutUsPopup: false });
  };

  /*
  setExpoPushToken = token => {
    this.setState({ expoPushToken: token });
  };

  setNotification = notification => {
    this.setState({ notification: notification });
  };

  async startNotificationService() {
    //
    // Set token, listener, and responseListener
    //
    this.registerForPushNotificationsAsync().then(token =>
      this.setExpoPushToken(token)
    );
    this.notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        this.setNotification(notification);
      }
    );
    this.responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log(response);
      }
    );

    //
    // Start background fetch
    //

    return () => {
      Notifications.removeNotificationSubscription(
        this.notificationListener.current
      );
      Notifications.removeNotificationSubscription(
        this.responseListener.current
      );
    };
  }*/

  componentDidMount() {
    this.fetchLocations();
    this.fetchUserinfo();
    //this.startNotificationService();
    // this.registerBackgroundFetchAsync();
  }

  // 2. Register the task at some point in your app by providing the same name, and some configuration options for how the background fetch should behave
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  // async registerBackgroundFetchAsync() {
  //   BackgroundFetch.configure(
  //     {
  //       minimumFetchInterval: 15
  //     },
  //     async taskId => {
  //       console.log("Received background-fetch event: " + taskId);
  //
  //       /* process background tasks */
  //
  //       BackgroundFetch.finish(taskId);
  //     },
  //     error => {
  //       console.log("RNBackgroundFetch failed to start");
  //     }
  //   );

  // try {
  //   BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
  //     minimumInterval: 5,
  //     stopOnTerminate: false, // android only,
  //     startOnBoot: true // android only
  //   });
  //   console.log("Task Register success");
  // } catch (err) {
  //   console.log("Task Register failed:", err);
  // }
  // }

  // async registerForPushNotificationsAsync() {
  //   let token;
  //   if (Constants.isDevice) {
  //     const {
  //       status: existingStatus
  //     } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;
  //     if (existingStatus !== "granted") {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }
  //     if (finalStatus !== "granted") {
  //       alert("Failed to get push token for push notification!");
  //       return;
  //     }
  //     token = (await Notifications.getExpoPushTokenAsync()).data;
  //     console.log(token);
  //   } else {
  //     alert("Must use physical device for Push Notifications");
  //   }
  //
  //   if (Platform.OS === "android") {
  //     Notifications.setNotificationChannelAsync("default", {
  //       name: "default",
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //       lightColor: "#ff0000"
  //     });
  //   }
  //
  //   return token;
  // }
  //
  // async schedulePushNotification() {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "I2PDM Alarm",
  //       body: "CHIAYI_GH whitefly count SEVERE!",
  //       data: { data: "goes here" }
  //     },
  //     trigger: { seconds: 2 }
  //   });
  // }

  checkAppVersion = () => {
    fetch(URL_getAppVersion)
      .then(response => response.json())
      .then(response => {
        var LATEST_VERSION = response["version"];
        if (VERSION < LATEST_VERSION) {
          this.notifyMessage("App is outdated!");
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
        }
        if (VERSION == LATEST_VERSION) {
          this.notifyMessage("App is up-to-date");
        }
        if (VERSION > LATEST_VERSION) {
          this.notifyMessage("App is updated!");
        }
      });
  };

  joinLineGroup = () => {
    Linking.canOpenURL("https://line.me/R/ti/g/6t55df-6AQ").then(supported => {
      if (supported) {
        Linking.openURL("https://line.me/R/ti/g/6t55df-6AQ");
      } else {
        console.log("Don't know how to open URI");
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {/* <BackgroundAndroidTask
          interval={1000}
          function={() => {
            console.log("My task " + moment().format("YYYY-MM-DD mm:ss"));
          }}
        /> */}

        <ModalReportSettings
          ref="reportSettings"
          hideReportSettingsPopup={() => this.hideReportSettingsPopup()}
          showReportSettingsPopup={this.state.showReportSettingsPopup}
          location={this.state.locationSelected}
          username={this.state.username}
          lang={this.state.lang}
        />

        <ModalChangeEmail
          hideChangeEmailPopup={() => this.hideChangeEmailPopup()}
          showChangeEmailPopup={this.state.showChangeEmailPopup}
          username={this.state.username}
          email={this.state.email}
          changeEmail={emailx => this.changeEmail(emailx)}
          lang={this.state.lang}
        />

        <ModalAboutUs
          showAboutUsPopup={this.state.showAboutUsPopup}
          hideAboutUsPopup={() => this.hideAboutUsPopup()}
          lang={this.state.lang}
        />

        <View
          style={{
            height: 180,
            flexDirection: "row",
            backgroundColor: "#303030",
            marginBottom: 0
          }}
        >
          <Image
            style={{ marginTop: 50, marginLeft: 25, width: 100, height: 100 }}
            source={require("../assets/user.png")}
          />
          <View>
            <Text
              allowFontScaling={false}
              style={{
                height: 25,
                marginLeft: 5,
                marginTop: 60,
                fontSize: 18,
                letterSpacing: 1,
                fontWeight: "bold",
                color: "#ffffff"
              }}
            >
              {this.state.name}
            </Text>

            {/* Email address */}
            <View style={{ flexDirection: "row" }}>
              <Text
                allowFontScaling={false}
                style={{
                  height: 30,
                  marginLeft: 5,
                  fontSize: 16,
                  letterSpacing: 1,
                  fontWeight: "bold",
                  color: "#ffffff",
                  marginRight: 10
                }}
              >
                {this.state.email}
              </Text>
              <TouchableOpacity onPress={() => this.showChangeEmailPopup()}>
                <Image
                  style={{ width: 25, height: 25 }}
                  source={require("../assets/modify.png")}
                ></Image>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                height: 30,
                width: 80,
                marginLeft: 5,
                fontSize: 18,
                marginTop: 5,
                letterSpacing: 1,
                fontWeight: "bold",
                color: "#ffffff",
                backgroundColor: "red",
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center"
              }}
              onPress={() => this.props.navigation.navigate("Login")}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: "#ffffff"
                }}
              >
                {this.t("LOGOUT", this.state.lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          <View style={{ flex: 1 }}>
            {/* Location list */}
            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                marginTop: 10,
                flexDirection: "row"
              }}
            >
              <Text
                allowFontScaling={false}
                style={
                  ([styles.settingsTitle],
                  {
                    height: 30,
                    paddingTop: 10,
                    flex: 0.5,
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 10
                  })
                }
              >
                {this.t("MY LOCATIONS", this.state.lang)}
              </Text>
              <TouchableOpacity
                style={{
                  flex: 0.5,
                  alignSelf: "flex-end",
                  justifyContent: "flex-end",
                  marginRight: 20,
                  flexDirection: "row"
                }}
              >
                {/* <Text style={{ padding: 7 }}> Add new location </Text>
                <Image
                  style={{ width: 35, height: 35 }}
                  source={require("../assets/addlocation.png")}
                ></Image> */}
              </TouchableOpacity>
            </View>

            {this.state.locations.map((location, i) => (
              <View
                key={location}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  marginRight: 15
                }}
              >
                <Text allowFontScaling={false} style={styles.tableEntryName}>
                  {location} ({this.state.locationInfo.names[i]})
                </Text>

                {/* <Text style={styles.tableEntry}>{this.state.locationInfo.crops[i]}</Text> */}
                {/* <Text style={styles.tableEntry}>{this.state.locationInfo.days[i]} days</Text> */}

                <TouchableOpacity style={styles.tableEntry}>
                  {/* <Image
                    style={{ width: 35, height: 35 }}
                    source={require("../assets/modify.png")}
                  ></Image> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tableEntry}
                  onPress={() => this.showReportSettingsPopup(location)}
                >
                  <Image
                    style={{ width: 35, height: 35 }}
                    source={require("../assets/tools_report.png")}
                  ></Image>
                </TouchableOpacity>
              </View>
            ))}

            {/* Display */}
            <Text allowFontScaling={false} style={styles.settingsTitle}>
              {this.t("DISPLAY SETTINGS", this.state.lang)}
            </Text>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text allowFontScaling={false} style={styles.settingsLabel}>
                {this.t("LANGUAGE", this.state.lang)}
              </Text>
              <View style={styles.settingsRow}>
                <Select
                  allowFontScaling={false}
                  placeholder={{
                    label: "English (英文)",
                    value: "en"
                  }}
                  onValueChange={value => this.saveLanguage(value)}
                  useNativeAndroidPickerStyle={false}
                  style={dropDownBtn}
                  items={[{ label: "Chinese (中文)", value: "zh" }]}
                  value={this.state.lang}
                />
              </View>
            </View>

            {/*  General settings */}
            {/* <Text style={styles.settingsTitle}>
              {this.t("GENERAL SETTINGS", this.state.lang)}
            </Text> */}

            {/* Notification settings */}
            {/* <Text style={styles.settingsTitle}>
              {this.t("NOTIFICATION SETTINGS", this.state.lang)}
            </Text>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text allowFontScaling={false} style={styles.settingsLabel}>
                {this.t("ENABLE NOTIFICATIONS", this.state.lang)}
              </Text>
              <View style={styles.settingsRow}>
                <Switch></Switch>
              </View>
            </View> */}

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                style={styles.buttonStyle1}
                onPress={this.checkAppVersion}
              >
                <Text
                  allowFontScaling={false}
                  style={{ textAlign: "center", color: "white" }}
                >
                  {this.t("Check for APP updates", this.state.lang)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonStyle2}
                onPress={this.joinLineGroup}
              >
                <Text
                  allowFontScaling={false}
                  style={{ textAlign: "center", color: "black" }}
                >
                  {this.t("Join our LINE group", this.state.lang)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonStyle3}
                onPress={this.showAboutUsPopup}
              >
                <Text
                  allowFontScaling={false}
                  style={{ textAlign: "center", color: "black" }}
                >
                  {this.t("About us", this.state.lang)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const dropDownBtn = StyleSheet.create({
  inputWeb: {
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    backgroundColor: "#fff",
    width: 200
  },
  inputAndroid: {
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    backgroundColor: "#fff",
    width: 200
  },

  placeholder: {
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    marginRight: 10,
    width: 200
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  settingsRow: {
    flex: 0.5,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginRight: 10,
    flexDirection: "row"
  },
  settingsTitle: {
    height: 30,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    marginTop: 10,
    color: "#000000",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  settingsLabel: {
    flex: 0.5,
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    paddingLeft: 20,
    color: "#000000",
    letterSpacing: 0.5
  },
  tableEntryName: {
    flex: 0.85,

    marginLeft: 10,
    fontSize: 14,
    paddingLeft: 20,
    color: "#000000"
  },
  tableEntry: {
    flex: 0.15,
    height: 40,
    fontSize: 13,
    color: "#000000"
  },

  buttonStyle1: {
    flex: 1,
    height: 40,
    fontSize: 13,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "gray",
    justifyContent: "center"
  },
  buttonStyle2: {
    flex: 1,
    height: 40,
    fontSize: 13,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#ccff99",
    justifyContent: "center"
  },
  buttonStyle3: {
    flex: 1,
    height: 40,
    fontSize: 13,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#99ccff",
    justifyContent: "center"
  }
});
