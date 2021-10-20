//
// Main login page
//

import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
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
  ToastAndroid,
  PixelRatio
} from "react-native";
import Logo from "../components/i2pdm_logo.js";
import Select from "react-native-picker-select";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import ModalForgotUsernamePassword from "../components/modals/forgot_userpassword.js";
import ModalUpdate from "../components/modals/update_app.js";
var fontScale = PixelRatio.getFontScale();
var fontSize = 16 / fontScale;

//
// URLs
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const account_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/account/";
const req_getlocs = base_url + "get_locations_list.php";
const req_login = account_url + "login.php";
const get_app_version = base_url + "get_app_version.php";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";
const info = require("../app.json");
const VERSION = info["expo"]["version"];

const info2 = require("../app_info.json");
const ANDROID_LINK = info2["android_link"];
const IOS_LINK = info2["ios_link"];

export default function Login({ navigation }) {
  const [lang, setLanguage] = useState("en");
  const [autoLogin, setIsEnabled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [username, onChangeUsername] = useState("");
  const [password, onChangePassword] = useState("");
  const [passwordColor, onPasswordtry] = useState("#ffffff");
  const [modalVisibility, toggleUsernamePassword] = useState(false);
  const [updateVisibility, toggleUpdateApp] = useState(false);

  const t = (myString, language) => {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  };

  const saveLanguage = async value => {
    console.log(value);
    await AsyncStorage.setItem("language", value);
    setLanguage(value);
  };

  const toggleSwitch = async () => {
    setIsEnabled(previousState => !previousState);
    await AsyncStorage.setItem("settings_login", (!autoLogin).toString());
    var loginer = await AsyncStorage.getItem("settings_login");
  };

  //
  // Notification
  //
  const notifyMessage = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  //
  // If screen went back here
  //
  const isFocused = useIsFocused();
  useEffect(() => {
    async function reLanguage() {
      var lang = await AsyncStorage.getItem("language");
      setLanguage(lang);
    }
    reLanguage();
  }, [isFocused]);

  //
  // Auto log in
  //
  useEffect(() => {
    async function checkAutoLogin() {
      try {
        // 1) Get language settings
        // 2) Get auto log in settings
        var lang = await AsyncStorage.getItem("language");
        setLanguage(lang);
        var loginer = await AsyncStorage.getItem("settings_login");

        var logBoolean = true;

        if (loginer == "true") {
          logBoolean = true;
        }
        if (loginer == "false") {
          logBoolean = false;
        }

        setIsEnabled(logBoolean);

        try {
          await AsyncStorage.getItem("username").then(value =>
            onChangeUsername(value)
          );
        } catch (error) {}
        try {
          await AsyncStorage.getItem("password").then(value =>
            onChangePassword(value)
          );
        } catch (error) {}

        var u = await AsyncStorage.getItem("username");
        var p = await AsyncStorage.getItem("password");

        if (u === null || p === null) {
          logBoolean = false;
        }
        var update = await checkAppVersion();

        if (update == 1) {
          showUpdateApp();
          console.log("[SYSTEM] Automatic update");
        }

        if (logBoolean == true && update == 0) {
          console.log("[SYSTEM] Automatic log-in");
          //
          // Auto log in
          //
          signInRequest2();
        }
      } catch (error) {}
    }

    checkAutoLogin();
  }, []);

  //
  // Sign in function
  //
  const signInRequest = async () => {
    try {
      var u = username;
      var p = password;
      let response = await fetch(req_login, {
        method: "POST",
        body: JSON.stringify({
          username: u,
          password: p
        })
      });
      let json = await response.json();

      var status = json.status;
      var locations = JSON.stringify(json.locations);

      try {
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("password", password);
      } catch (error) {
        console.error(error);
      }

      //
      // If success
      //
      if (status == 0) {
        onPasswordtry(passwordColor => "#ffffff");
        await AsyncStorage.setItem("locations", locations);
        navigation.navigate("Dashboard");
      } else {
        notifyMessage("Wrong password!");
        onPasswordtry(passwordColor => "#ff7c75");
      }
      return "";
    } catch (error) {
      console.error(error);
    }
  };

  const signInRequest2 = async () => {
    try {
      var u = await AsyncStorage.getItem("username");
      var p = await AsyncStorage.getItem("password");
      var goSignIn = true;

      if (u === null || p === null) {
        goSignIn = false;
      }
      if (goSignIn == true) {
        let response = await fetch(req_login, {
          method: "POST",
          body: JSON.stringify({
            username: u,
            password: p
          })
        });
        let json = await response.json();

        var status = json.status;
        var locations = JSON.stringify(json.locations);

        try {
          await AsyncStorage.setItem("username", u);
          await AsyncStorage.setItem("password", p);
        } catch {}

        //
        // If success
        //
        if (status == 0) {
          onPasswordtry(passwordColor => "#ffffff");
          await AsyncStorage.setItem("locations", locations);
          navigation.navigate("Dashboard");
        } else {
          notifyMessage("Wrong password!");
          onPasswordtry(passwordColor => "#ff7c75");
        }
        return "";
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkAppVersion = async () => {
    try {
      let response = await fetch(get_app_version, {
        method: "POST"
      });
      let json = await response.json();
      var LATEST_VERSION = json["version"];
      var update = 0;

      if (VERSION < LATEST_VERSION) {
        console.log("App is outdated!");
        update = 1;
      }
      if (VERSION == LATEST_VERSION) {
        console.log("App is up-to-date");
        hideUpdateApp();
      }
      if (VERSION > LATEST_VERSION) {
        console.log("App is updated!");
      }

      return update;
    } catch (error) {
      console.error(error);
    }
  };

  const showForgotUsernamePassword = async () => {
    toggleUsernamePassword(true);
  };

  const hideForgotUsernamePassword = async () => {
    toggleUsernamePassword(false);
  };

  const showUpdateApp = async () => {
    toggleUpdateApp(true);
  };

  const hideUpdateApp = async () => {
    toggleUpdateApp(false);
  };

  return (
    <View style={styles.container}>
      <ModalForgotUsernamePassword
        hideForgotUsernamePassword={() => hideForgotUsernamePassword()}
        showForgotUsernamePassword={modalVisibility}
        lang={lang}
      />
      <ModalUpdate
        hideUpdateApp={() => hideUpdateApp()}
        showUpdateApp={updateVisibility}
        lang={lang}
      />

      <Logo />

      {/* Username and password input */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Username", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        style={styles.input}
        value={username}
        onChangeText={text => onChangeUsername(text)}
      />
      <Text allowFontScaling={false} style={styles.text}>
        {t("Password", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        secureTextEntry={true}
        value={password}
        style={[styles.input, { backgroundColor: passwordColor }]}
        onChangeText={text => onChangePassword(text)}
      />

      {/* Sign in button */}
      <TouchableOpacity
        disabled={disabled}
        accessibilityRole="button"
        style={styles.signInBtn}
        title={t("SIGN IN", lang)}
        onPress={signInRequest}
      >
        <Text allowFontScaling={false} style={styles.btnText}>
          {t("SIGN IN", lang)}
        </Text>
      </TouchableOpacity>

      {/* Remember me */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <Text allowFontScaling={false} style={styles.text}>
          {t("Auto log-in", lang)}
        </Text>
        <Switch
          style={styles.switch}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={autoLogin ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={autoLogin}
        />
      </View>

      {/* Forgot username/password */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          marginBottom: 0,
          height: 20
        }}
        onPress={showForgotUsernamePassword}
      >
        <Text
          allowFontScaling={false}
          style={(styles.text, { color: "#faff78" })}
        >
          {t("Forgot username & password?", lang)}
        </Text>
      </TouchableOpacity>

      {/* Register button */}
      <TouchableOpacity
        disabled={disabled}
        accessibilityRole="button"
        style={styles.registerBtn}
        title={t("REGISTER", lang)}
        onPress={() => navigation.navigate("Register")}
      >
        <Text allowFontScaling={false} style={styles.btnTextBlack}>
          {t("REGISTER", lang)}
        </Text>
      </TouchableOpacity>

      {/* Choose language */}
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Select
          allowFontScaling={false}
          placeholder={{
            label: "English (英文)",
            value: "en"
          }}
          onValueChange={value => saveLanguage(value)}
          useNativeAndroidPickerStyle={false}
          style={dropDownBtn}
          items={[{ label: "Chinese (中文)", value: "zh" }]}
          value={lang}
        />
      </View>
    </View>
  );
}

const dropDownBtn = StyleSheet.create({
  inputWeb: {
    height: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    width: 200
  },
  inputIOS: {
    height: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    width: 200
  },
  inputAndroid: {
    height: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    width: 200
  },

  placeholder: {
    height: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    backgroundColor: "#fff",
    width: 200
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2b2b2b",
    alignItems: "center",
    justifyContent: "center"
  },

  text: {
    color: "#fff"
  },

  btnText: {
    color: "#fff"
  },

  btnTextBlack: {
    color: "#000"
  },

  switch: {
    // scaleX: 1,
    // scaleY: 1,
    marginLeft: 5
  },

  signInBtn: {
    height: 50,
    width: 200,
    backgroundColor: "#5f9657",
    margin: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 32
  },

  hovered: {
    backgroundColor: "#ddd"
  },

  registerBtn: {
    height: 50,
    width: 200,
    backgroundColor: "#cccccc",
    margin: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 32
  },

  input: {
    height: 40,
    width: 200,
    padding: 5,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1
  }
});
