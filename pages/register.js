import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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
  AlertIOS
} from "react-native";
import Logo from "../components/i2pdm_logo.js";
import Select from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";

const base_url = "http://140.112.94.123:20000/PEST_DETECT/_app/";
const account_url = "http://140.112.94.123:20000/PEST_DETECT/account/";
const req_getlocs = base_url + "get_locations_list.php";
const req_register = account_url + "register.php";

import Login from "./login.js";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";

export default function Register({ navigation }) {
  const [lang, setLanguage] = useState("en");
  const [isEnabled, setIsEnabled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [passwordColor, onPasswordtry] = useState("#ffffff");
  const [usernameColor, onUsernametry] = useState("#ffffff");
  const [nameColor, onNameentry] = useState("#ffffff");

  const [name, onChangeName] = useState("");
  const [username, onChangeUsername] = useState("");
  const [password, onChangePassword] = useState("");
  const [passwordConfirm, onChangePasswordConfirm] = useState("");
  const [email, onChangeEmail] = useState("");
  const [number, onChangeNumber] = useState("");

  const t = (myString, language) => {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  };

  //
  // Auto log in
  //
  useEffect(() => {
    async function checkLanguage() {
      try {
        // 1) Get language settings
        var lang = await AsyncStorage.getItem("language");
        console.log(lang);
        setLanguage(lang);
      } catch (error) {}
    }

    checkLanguage();
  }, []);

  //
  // Notification
  //
  const notifyMessage = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  };

  //
  // Sign in function
  //
  const registerRequest = async () => {
    var dontRegister = 0;

    if (password == passwordConfirm) {
      onPasswordtry(passwordColor => "#ffffff");
    } else {
      notifyMessage("Unmatched password!");
      dontRegister = 1;
      onPasswordtry(passwordColor => "#ff7c75");
    }

    if (password.length == 0) {
      notifyMessage("Password cannot be empty!");
      onPasswordtry(passwordColor => "#ff7c75");
      dontRegister = 1;
    } else {
      onPasswordtry(passwordColor => "#ffffff");
    }

    if (passwordConfirm.length == 0) {
      notifyMessage("Password cannot be empty!");
      onPasswordtry(passwordColor => "#ff7c75");
      dontRegister = 1;
    } else {
      onPasswordtry(passwordColor => "#ffffff");
    }

    if (name.length == 0) {
      notifyMessage("Name cannot be empty!");
      onNameentry(nameColor => "#ff7c75");
      dontRegister = 1;
    } else {
      onNameentry(nameColor => "#ffffff");
    }

    if (username.length < 6) {
      notifyMessage("Username too short!");
      onUsernametry(usernameColor => "#ff7c75");
      dontRegister = 1;
    } else {
      onUsernametry(usernameColor => "#ffffff");
    }

    //
    // If success
    //
    console.log(dontRegister);
    if (dontRegister == 0) {
      try {
        let response = await fetch(req_register, {
          method: "POST",
          body: JSON.stringify({
            username: username,
            password: password,
            name: name,
            email: email,
            contact: number
          })
        });
        let json = await response.json();
        console.log(json);

        var status = json.status;
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("password", password);

        if (json.status == "0") {
          navigation.navigate("Login");
        }
        if (json.status == "1") {
          notifyMessage("Registration failed: User exists!");
        }

        return "";
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.titleText}>
        {t("REGISTRATION", lang)}
      </Text>
      {/* Name */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Name", lang)}
      </Text>
      <TextInput
        onChangeText={text => onChangeName(text)}
        maxLength={30}
        style={[styles.input, { backgroundColor: nameColor }]}
      />
      {/* Username */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Username", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        maxLength={30}
        onChangeText={text => onChangeUsername(text.toLowerCase())}
        value={username}
        style={[styles.input, { backgroundColor: usernameColor }]}
      />
      {/* Password */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Password (EN only)", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        onChangeText={text => onChangePassword(text)}
        secureTextEntry={true}
        maxLength={15}
        style={[styles.input, { backgroundColor: passwordColor }]}
      />
      {/* Confirm password */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Confirm password", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        onChangeText={text => onChangePasswordConfirm(text)}
        secureTextEntry={true}
        maxLength={15}
        style={[styles.input, { backgroundColor: passwordColor }]}
      />
      {/* Email */}
      <Text allowFontScaling={false} style={styles.text}>
        E-mail address
      </Text>
      <TextInput
        allowFontScaling={false}
        onChangeText={text => onChangeEmail(text)}
        keyboardType="email-address"
        maxLength={30}
        style={styles.input}
      />
      {/* Number */}
      <Text allowFontScaling={false} style={styles.text}>
        {t("Contact number", lang)}
      </Text>
      <TextInput
        allowFontScaling={false}
        keyboardType="number-pad"
        onChangeText={text => onChangeNumber(text)}
        style={styles.input}
      />

      {/*Register */}
      <TouchableOpacity
        disabled={disabled}
        accessibilityRole="button"
        delayPressIn={0}
        delayPressOut={0}
        style={styles.registerBtn}
        onPress={registerRequest}
      >
        <Text allowFontScaling={false} style={styles.btnText}>
          {t("REGISTER", lang)}
        </Text>
      </TouchableOpacity>

      {/* Back to login */}
      <TouchableOpacity
        disabled={disabled}
        accessibilityRole="button"
        delayPressIn={0}
        delayPressOut={0}
        style={styles.signInBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text allowFontScaling={false} style={styles.btnText}>
          {t("BACK TO LOG IN", lang)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const dropDownBtn = StyleSheet.create({
  inputWeb: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    width: 200
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    width: 200
  },

  placeholder: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
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
  titleText: {
    color: "#ffffff",
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "bold"
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
    backgroundColor: "#0000ff",
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
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1
  }
});
