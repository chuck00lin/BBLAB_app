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

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_report_settings = base_url + "get_report_settings.php";
const URL_save_report_settings = base_url + "set_report_settings.php";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

var days_of_the_week_images = [
  require("../../assets/day_1.png"),
  require("../../assets/day_2.png"),
  require("../../assets/day_3.png"),
  require("../../assets/day_4.png"),
  require("../../assets/day_5.png"),
  require("../../assets/day_6.png"),
  require("../../assets/day_7.png")
];

var days_of_the_week_imagesx = [
  require("../../assets/day_1x.png"),
  require("../../assets/day_2x.png"),
  require("../../assets/day_3x.png"),
  require("../../assets/day_4x.png"),
  require("../../assets/day_5x.png"),
  require("../../assets/day_6x.png"),
  require("../../assets/day_7x.png")
];

var time_now = new moment();
export default class AccountReportSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      inputColor: "white",
      status: 0,
      n_days: 14,
      week_days: [],
      time: "",
      report_language: "en",
      report_enabled: false,
      showTime: false,
      timeIOS: time_now
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
  // Report enabled switch
  //
  toggleSwitch = stat => {
    this.setState({ report_enabled: stat });
  };

  //
  //  Copies function from parent
  //
  hideReportSettingsPopup = () => {
    this.props.hideReportSettingsPopup?.();
  };

  //
  // Fetch report settings
  //
  fetchReportSettings(location, username) {
    this.setState({
      location: location,
      showReportSettingsPopup: true
    });

    var thisURL =
      URL_report_settings + "?loc=" + location + "&username=" + username;
    console.log("[report_settings.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var status = response.status;
        var n_days = response.n_days;
        var week_days = response.week_days;
        var time = response.time;
        var report_language = response.language;

        if (n_days == "") n_days = "14";
        if (time == "") time = "07:00";

        var timeIOSx = new moment(time, "HH:mm").valueOf();

        if (status == 1) status = true;
        else status = false;

        this.setState({
          report_enabled: status,
          n_days: n_days,
          week_days: week_days,
          time: time,
          report_language: report_language,
          timeIOS: timeIOSx
        });
      })
      .then(() => {
        this.setState({
          showReportSettingsPopup: true
        });
      });
  }

  // When time is changed
  onChangeTime = (e, d) => {
    var typex = e.type;

    if (Platform.OS === "android") {
      if (typex == "set") {
        var thisx = new moment(d, "HH:mm").add(8, "hour");
        var timex = thisx.utc().format("HH:mm");
        this.setState({ time: timex });
      }
    }
    if (Platform.OS === "ios") {
      var timeIOS = new moment(d).valueOf();
      var thisx = new moment(d, "HH:mm").add(8, "hour");
      var timex = thisx.utc().format("HH:mm");
      this.setState({ time: timex });
      this.setState({ timeIOS: timeIOS });
    }

    this.setState({ showTime: false });
  };

  // Change n days
  onChangeDays = d => {
    this.setState({ n_days: d });
  };

  // Change days of week color display
  changeDaysOfWeek = (i, x) => {
    var thisWeekDays = [];
    {
      this.state.week_days.map((d, a) => {
        if (a == i) {
          thisWeekDays[a] = x;
        } else {
          thisWeekDays[a] = d;
        }
      });
    }
    this.setState({ week_days: thisWeekDays });
  };

  // Change days of week color display
  daysWeekDisplay = (d, i) => {
    var displayBox = <View></View>;
    if (d == 1) {
      displayBox = (
        <TouchableOpacity
          key={i}
          onPress={() => this.changeDaysOfWeek(i, 0)}
          style={{ width: 30, height: 30, marginRight: 3 }}
        >
          <Image
            style={{ width: 30, height: 30 }}
            source={days_of_the_week_images[i]}
          />
        </TouchableOpacity>
      );
    } else {
      displayBox = (
        <TouchableOpacity
          key={i}
          onPress={() => this.changeDaysOfWeek(i, 1)}
          style={{ width: 30, height: 30, marginRight: 3 }}
        >
          <Image
            style={{ width: 30, height: 30 }}
            source={days_of_the_week_imagesx[i]}
          />
        </TouchableOpacity>
      );
    }
    return displayBox;
  };

  //
  // Save the settings
  //
  saveSettings = () => {
    var daysOk = 0;
    var d = 0;
    for (var i = 0; i < this.state.week_days.length; i++) {
      d = this.state.week_days[i];
      if (d == 1) {
        daysOk = 1;
      }
    }

    // If entries are valid
    if (daysOk == 1) {
      var enabled = this.state.report_enabled ? 1 : 0;

      var thisURL =
        URL_save_report_settings +
        "?loc=" +
        this.state.location +
        "&username=" +
        this.props.username +
        "&enabled=" +
        enabled +
        "&n_days=" +
        this.state.n_days +
        "&week_days=" +
        this.state.week_days +
        "&time=" +
        this.state.time +
        "&language=" +
        this.state.report_language;
      console.log("[report_settings.js]", thisURL);

      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var status = response.status;
          if (status == "1")
            this.notifyMessage("Subscription settings successfully saved!");
        })
        .then(() => {
          this.hideReportSettingsPopup();
        });
    } else {
      this.notifyMessage("Please pick at least one day!");
    }
  };

  // Modify display if Android or IOS
  displayTime = () => {
    var displayThis = <View></View>;
    if (Platform.OS == "android") {
      displayThis = (
        <TouchableOpacity
          style={styles.input}
          onPress={() => this.setState({ showTime: true })}
        >
          <Text
            allowFontScaling={false}
            style={{ paddingTop: 5, marginRight: 10 }}
          >
            {this.state.time}
          </Text>
        </TouchableOpacity>
      );
    }
    if (Platform.OS == "ios") {
      displayThis = (
        <View
          style={{
            alignItems: "flex-start",
            justifyContent: "flex-start",
            borderRadius: 25
          }}
        >
          <DateTimePicker
            value={new Date(this.state.timeIOS)}
            // value={new Date()}
            display="default"
            is24Hour={true}
            isVisible={this.state.showTime}
            mode="time"
            // themeVariant="light"
            // textColor="#ffffff"
            onChange={this.onChangeTime}
            style={{
              width: 100,
              height: 45
              // backgroundColor: "#ffffff"
            }}
          />
        </View>
      );
    }
    return displayThis;
  };

  render() {
    return (
      <View>
        {this.state.showTime && Platform.OS == "android" && (
          <DatePicker
            value={new Date()}
            display="spinner"
            is24Hour={true}
            isVisible={this.state.showTime}
            mode="time"
            onChange={this.onChangeTime}
          />
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showReportSettingsPopup}
        >
          <View style={styles.popupBox}>
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                width: 300,
                height: 400,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              {/* Title */}
              <View style={{ flex: 0.15 }}>
                <Text allowFontScaling={false} style={styles.popupTextLarge}>
                  {this.t("REPORT SUBSCRIPTION SETTINGS", this.props.lang)}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text allowFontScaling={false} style={{ flex: 0.5 }}>
                    {this.t("Name", this.props.lang)}: {this.state.location}
                  </Text>
                  <Switch
                    style={{ flex: 0.5 }}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={
                      this.state.report_enabled ? "#f5dd4b" : "#f4f3f4"
                    }
                    onValueChange={stat => this.toggleSwitch(stat)}
                    value={this.state.report_enabled == 1}
                  ></Switch>
                </View>
              </View>

              {/* Details */}
              <View style={{ padding: 5, flex: 0.65 }}>
                {this.state.report_enabled ? (
                  <View>
                    <Text allowFontScaling={false}>
                      {this.t("LANGUAGE", this.props.lang)}
                    </Text>

                    <Select
                      placeholder={{ label: "English (英文)", value: "en" }}
                      useNativeAndroidPickerStyle={false}
                      items={[{ label: "Chinese (中文)", value: "zh" }]}
                      style={dropDownBtn}
                      value={this.state.report_language}
                      onValueChange={value =>
                        this.setState({ report_language: value })
                      }
                    ></Select>

                    <Text allowFontScaling={false}>
                      {this.t("NUMBER OF DAYS", this.props.lang)}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      keyboardType="number-pad"
                      maxLength={3}
                      style={styles.input}
                      value={this.state.n_days}
                      onChangeText={text => this.onChangeDays(text)}
                    />

                    <Text allowFontScaling={false}>
                      {this.t("TIME", this.props.lang)}
                    </Text>
                    {this.displayTime()}

                    <Text allowFontScaling={false}>
                      {this.t("DAYS OF THE WEEK", this.props.lang)}
                    </Text>
                    <View style={{ flexDirection: "row", height: 40 }}>
                      {this.state.week_days.map((d, i) =>
                        this.daysWeekDisplay(d, i)
                      )}
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Buttons */}
              <View style={{ flex: 0.2, flexDirection: "row" }}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.confirmBtn}
                  title="SAVE"
                  onPress={() => this.saveSettings()}
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
                    this.props.hideReportSettingsPopup();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CANCEL", this.props.lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    flex: 0.5,
    marginLeft: 5,
    height: 50,

    backgroundColor: "#ff0000",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  }
});
