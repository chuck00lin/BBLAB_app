//
// Replace sticky paper popup
// Version history: 1.0
// - Confirm button: ok
// - Cancel button: ok
//

import React, { Component, useEffect } from "react";
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
  ActivityIndicator,
  Linking
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "@react-native-community/datetimepicker";
import moment from "moment";

//
// URLS
//
const base_url_pdf = "http://140.112.94.123:20000/PEST_DETECT_TEST/_pdfscript/";
const URL_generate_report = base_url_pdf + "report_gen.php";

var day_now = new moment();
var day_now3 = new moment().format("YYYY-MM-DD");
var days_before = new moment(day_now.valueOf() - 14 * 24 * 3600 * 1000);
var days_before3 = days_before.format("YYYY-MM-DD");

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class ToolsGenerateReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputColor: "white",
      minDate: this.props.minDate,

      startDateIOS: days_before,
      endDateIOS: day_now,

      startDate: days_before3,
      endDate: day_now3,

      maxDate: this.props.maxDate,
      startDateVisible: false,
      endDateVisible: false,

      showLoader: false
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
  async generateReport() {
    var start = this.state.startDate;
    var end = this.state.endDate;
    console.log(this.state.startDate, this.state.endDate);
    this.props.hideReportPopup();
    this.setState({ showLoader: true });

    var thisURL =
      URL_generate_report +
      "?loc=" +
      this.props.location +
      "&start=" +
      start +
      "&end=" +
      end +
      "&mode=date" +
      "&lang=" +
      this.props.lang;
    console.log(thisURL);
    await fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        console.log(response);

        this.setState({ showLoader: false });
        Linking.openURL(response.download_link);
      });
  }

  onChangeStartDate = (e, d) => {
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
        this.setState({ startDate: datex });
      }
    }
    if (Platform.OS === "ios") {
      var datey = new moment(d).valueOf();
      var datex = new moment(d, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
      this.setState({ startDate: datex });
      this.setState({ startDateIOS: datey });
    }
    this.setState({ startDateVisible: false });
  };

  onChangeEndDate = (e, d) => {
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
        this.setState({ endDate: datex });
      }
    }
    if (Platform.OS === "ios") {
      var datey = new moment(d).valueOf();
      var datex = new moment(d, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
      this.setState({ endDate: datex });
      this.setState({ endDateIOS: datey });
    }
    this.setState({ endDateVisible: false });
  };

  //
  //  Copies function from parent
  //
  hideReportPopup = () => {
    this.props.hideReportPopup?.();
  };

  showStartDatePicker = () => {
    var output = <View></View>;
    if (Platform.OS == "android") {
      output = (
        <TouchableOpacity
          style={{
            padding: 5,
            backgroundColor: "#ffffff",
            borderRadius: 5
          }}
          onPress={() => this.setState({ startDateVisible: true })}
        >
          <Text
            allowFontScaling={false}
            style={([styles.popupText], { fontSize: 20 })}
          >
            {this.state.startDate}
          </Text>
        </TouchableOpacity>
      );
    } else {
      output = (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            backgroundColor: "#ffffff",
            borderRadius: 25
          }}
        >
          <DateTimePicker
            value={new Date(this.state.startDateIOS)}
            minimumDate={new Date(this.props.minDate.valueOf())}
            maximumDate={new Date(this.state.endDateIOS)}
            display="default"
            mode="date"
            onChange={this.onChangeStartDate}
            style={{
              width: 180,
              height: 45,
              color: "white",
              backgroundColor: "#ffffff"
            }}
          />
        </View>
      );
    }

    return output;
  };

  showEndDatePicker = () => {
    var output = <View></View>;
    if (Platform.OS == "android") {
      output = (
        <TouchableOpacity
          style={{
            padding: 5,
            backgroundColor: "#ffffff",
            borderRadius: 5
          }}
          onPress={() => this.setState({ endDateVisible: true })}
        >
          <Text
            allowFontScaling={false}
            style={([styles.popupText], { fontSize: 20 })}
          >
            {this.state.endDate}
          </Text>
        </TouchableOpacity>
      );
    } else {
      output = (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            backgroundColor: "#ffffff",
            borderRadius: 25
          }}
        >
          <DateTimePicker
            value={new Date(this.state.endDateIOS)}
            minimumDate={new Date(this.props.minDate.valueOf())}
            maximumDate={new Date(day_now.valueOf())}
            display="default"
            mode="date"
            onChange={this.onChangeEndDate}
            style={{
              width: 180,
              fontSize: 14,
              height: 45,
              color: "white",
              backgroundColor: "#ffffff"
            }}
          />
        </View>
      );
    }

    return output;
  };

  render() {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {this.state.startDateVisible && Platform.OS == "android" && (
          <DatePicker
            value={new Date(days_before)}
            minimumDate={new Date(this.props.minDate.valueOf())}
            maximumDate={new Date(this.state.endDate)}
            display="calendar"
            isVisible={this.state.endDateVisible}
            mode="date"
            onChange={this.onChangeStartDate}
          />
        )}

        {this.state.endDateVisible && Platform.OS == "android" && (
          <DatePicker
            value={new Date(day_now.valueOf())}
            minimumDate={new Date(this.props.minDate.valueOf())}
            maximumDate={new Date(day_now.valueOf())}
            display="calendar"
            isVisible={this.state.endDateVisible}
            onChange={this.onChangeEndDate}
            mode="date"
          />
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showLoader}
        >
          <TouchableOpacity style={styles.popupBox}>
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                width: 300,
                height: 150,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <Text
                allowFontScaling={false}
                style={{ textAlign: "center", fontSize: 24, marginBottom: 10 }}
              >
                {this.t("Now generating report", this.props.lang)}...
              </Text>
              <ActivityIndicator size="large" color="#000000" />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showReportPopup}
        >
          <View
            style={styles.popupBox}
            // onPress={this.props.hideReportPopup}
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
                {this.t("Report generator", this.props.lang)}
              </Text>

              {/* Start date */}
              <Text allowFontScaling={false} style={styles.popupText}>
                {this.t("Start date", this.props.lang)}:
              </Text>
              {this.showStartDatePicker()}

              {/* End date */}
              <Text allowFontScaling={false} style={styles.popupText}>
                {this.t("End date", this.props.lang)}:
              </Text>
              {this.showEndDatePicker()}

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
                  title={this.t("GENERATE", this.props.lang)}
                  onPress={() => {
                    this.generateReport();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("GENERATE", this.props.lang)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.cancelBtn}
                  title={this.t("CANCEL", this.props.lang)}
                  onPress={() => {
                    this.props.hideReportPopup();
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

const styles = StyleSheet.create({
  popupTextLarge: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5
  },
  pickerContainerStyleIOS: {
    backgroundColor: "black",
    paddingHorizontal: 40
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
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 5,
    marginTop: 3
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
