//
// Toolbox
// Version history: 1.0
// - Data analysis:
// - Sticky paper trap: 05/25/2021
// - Report:
// - Sticky paper camera:
// - Location management:
// - Alarm test:
// - Setup device:
// - Setup device2:
//

import React, { Component } from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  PixelRatio,
  Image,
  Modal
} from "react-native";
import Select from "react-native-picker-select";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalStickyPaperTrap from "../modals/replace_trap.js";
import ModalGenerateReport from "../modals/generate_report.js";
const boxColor = "#f7f7f7";

var fontScale = PixelRatio.getFontScale();
var fontSize = 12 / fontScale;

const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
var URL_report_details = base_url + "get_report_details.php";
var URL_blank = base_url + "blank.php";

const base_url_surveillance = "http://140.112.94.123:20012/";
const URL_cmd_cameras = base_url_surveillance + "video_feed/";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

const camera_mapper = data => {
  var mapped_data = data.map((d, i) => ({
    label: data[i],
    value: data[i]
  }));

  return mapped_data;
};

export default class DashboardToolBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: this.props.location,
      showPaperPopup: false,
      showReportPopup: false,
      showSurveillance: false,
      playStop: 0,
      surveillanceQuality: 10,
      surveillanceURL: URL_blank,
      minDate: "",
      startDate: "",
      maxDate: "",
      camera_id: 0,
      shown: 0
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  async changeQuality(quality) {
    if (this.state.playStop == 1) {
      await this.setState({ surveillanceQuality: quality }, () => {
        this.surveillanceFetch(1);
      });
    }
  }

  surveillanceQualityBtn = mode => {
    if (this.state.playStop == 1) {
      if (mode == 0 && this.state.surveillanceQuality == 10)
        return require("../../assets/surveillance_low_on.png");
      if (mode == 0 && this.state.surveillanceQuality != 10)
        return require("../../assets/surveillance_low_off.png");

      if (mode == 1 && this.state.surveillanceQuality == 50)
        return require("../../assets/surveillance_high_on.png");
      if (mode == 1 && this.state.surveillanceQuality != 50)
        return require("../../assets/surveillance_high_off.png");
    } else {
      if (mode == 0) return require("../../assets/surveillance_low_off.png");
      if (mode == 1) return require("../../assets/surveillance_high_off.png");
    }
  };

  surveillanceBtn = () => {
    var output = <View></View>;
    if (this.props.surveillanceDATA.status == 1) {
      output = (
        <TouchableOpacity
          style={styles.tool}
          onPress={() => {
            this.setState({
              showSurveillance: !this.state.showSurveillance
            });
          }}
        >
          <Image
            style={styles.toolIcon}
            source={require("../../assets/tools_surveillance.png")}
          />
          <Text allowFontScaling={false} style={styles.valueText}>
            {this.t("SHOW/HIDE SURVEILLANCE", this.props.lang)}
          </Text>
        </TouchableOpacity>
      );
    }
    return output;
  };

  surveillanceFetch = playstop => {
    var thisCam = this.props.surveillanceDATA.ids[this.state.camera_id];
    var cmd_string = "start";

    if (playstop == 2) {
      cmd_string = "stop";
      this.setState({
        surveillanceURL: URL_blank,
        playStop: 0
      });
    }
    if (playstop == 1) {
      cmd_string = "start";
      this.setState({
        playStop: 1
      });
    }
    if (playstop == 0) {
      cmd_string = "stop";
      this.setState({
        surveillanceURL: URL_blank,
        playStop: 0
      });
    }

    var thisURL =
      URL_cmd_cameras +
      thisCam +
      "/" +
      cmd_string +
      "/" +
      this.state.surveillanceQuality;
    console.log("[surveillance]", thisURL);

    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        console.log("[surveillance]", response.status);

        if (playstop == 1) {
          this.setState({
            surveillanceURL: response.url
          });
        }
      });
  };

  surveillancePlayStop = () => {
    var outputx = <View></View>;
    if (this.state.playStop == 0) {
      outputx = (
        <TouchableOpacity
          onPress={() => {
            this.surveillanceFetch(1);
          }}
        >
          <Image
            style={{ marginTop: 5, width: 40, height: 40 }}
            source={require("../../assets/surveillance_play.png")}
          />
        </TouchableOpacity>
      );
    }
    if (this.state.playStop == 1) {
      outputx = (
        <TouchableOpacity
          onPress={() => {
            this.surveillanceFetch(0);
          }}
        >
          <Image
            style={{ marginTop: 5, width: 40, height: 40 }}
            source={require("../../assets/surveillance_stop.png")}
          />
        </TouchableOpacity>
      );
    }
    return outputx;
  };

  async showReport() {
    var thisURL = URL_report_details + "?loc=" + this.props.location;
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        this.setState({
          minDate: response.min_date,
          startDate: response.max_n_date,
          maxDate: response.max_date
        });
      })
      .then(() => {
        this.setState({
          showReportPopup: true
        });
      });
  }

  hidePaperPopup = () => {
    this.setState({ showPaperPopup: false });
  };
  hideReportPopup = () => {
    this.setState({ showReportPopup: false });
  };

  render() {
    return (
      <View>
        <ModalStickyPaperTrap
          hidePaperPopup={() => this.hidePaperPopup()}
          showPaperPopup={this.state.showPaperPopup}
          location={this.props.location}
          lang={this.props.lang}
        />

        <ModalGenerateReport
          hideReportPopup={() => this.hideReportPopup()}
          showReportPopup={this.state.showReportPopup}
          location={this.props.location}
          minDate={this.state.minDate}
          startDate={this.state.startDate}
          maxDate={this.state.maxDate}
          lang={this.props.lang}
        />

        {this.state.showSurveillance && (
          <View style={styles.surveilanceBox}>
            <View>
              <Text allowFontScaling={false} style={styles.dataTitle}>
                {this.t("Surveillance", this.props.lang)}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.subTitle}>
                  {this.t("CAMERA ID", this.props.lang)}
                </Text>
                <Text style={styles.subTitle}>
                  {this.t("QUALITY", this.props.lang)}
                </Text>
                <Text style={{ flex: 0.1 }}></Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  height: 60
                }}
              >
                <View style={{ flex: 0.42, marginRight: 10 }}>
                  <Select
                    allowFontScaling={false}
                    placeholder={{}}
                    onValueChange={(value, i) => {
                      this.setState({ camera_id: i });
                      this.surveillanceFetch(2);
                    }}
                    useNativeAndroidPickerStyle={false}
                    style={dropDownBtn}
                    items={camera_mapper(this.props.surveillanceDATA.ids)}
                    // value={this.state.camera_id}
                  />
                </View>
                <View
                  style={{ flex: 0.42, marginLeft: 10, flexDirection: "row" }}
                >
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => this.changeQuality(10)}
                  >
                    <Image
                      style={styles.selectorIcon}
                      source={this.surveillanceQualityBtn(0)}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => this.changeQuality(50)}
                  >
                    <Image
                      style={styles.selectorIcon}
                      source={this.surveillanceQualityBtn(1)}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 0.1 }}>{this.surveillancePlayStop()}</View>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <WebView
                source={{
                  uri: this.state.surveillanceURL
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={{
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: 5,
                  flex: 1,
                  maxHeight: 300
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.toolBox}>
          <Text allowFontScaling={false} style={styles.dataTitle}>
            {this.t("Toolbox", this.props.lang)}
          </Text>

          {/*  */}
          {/* ROW 1 */}
          {/*  */}
          <View style={styles.dataBox}>
            {/* Data analysis */}
            <TouchableOpacity
              style={styles.tool}
              onPress={() => {
                this.props.navigation.navigate("DashboardData");
                AsyncStorage.setItem("updateDataAnalysis", "1");
              }}
            >
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_dataanalysis.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>
                {this.t("DATA ANALYSIS", this.props.lang)}
              </Text>
            </TouchableOpacity>

            {/* Replace sticky papers */}
            <TouchableOpacity
              onPress={() => {
                this.setState({ showPaperPopup: true });
              }}
              style={styles.tool}
            >
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_stickypapertrap.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>
                {this.t("REPLACE STICKY PAPERS", this.props.lang)}
              </Text>
            </TouchableOpacity>

            {/* Report generator */}
            <TouchableOpacity
              onPress={() => {
                this.showReport();
              }}
              style={styles.tool}
            >
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_report.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>
                {this.t("REPORT", this.props.lang)}
              </Text>
            </TouchableOpacity>
          </View>

          {/*  */}
          {/* ROW 2 */}
          {/*  */}
          {/* <View style={styles.dataBox}> */}
          {/* Sticky paper camera */}
          {/* <View style={styles.tool}>
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_camera.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>STICKY PAPER {"\n"}CAMERA</Text>
            </View> */}

          {/* Location management */}
          {/* <View style={styles.tool}>
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_locationmanagement.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>LOCATION MANAGEMENT</Text>
            </View> */}

          {/* Alarm test */}
          {/* <View style={styles.tool}>
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_alarmtest.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>ALARM TEST</Text>
            </View>
          </View> */}

          {/*  */}
          {/* ROW 2 */}
          {/*  */}

          {/*  Device setup bluetooth */}
          {/* <TouchableOpacity style={styles.tool}>
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_adddevicebt.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>
                SETUP DEVICE{"\n"}(BLUETOOTH)
              </Text>
            </TouchableOpacity> */}

          {/* Device setup mesh */}
          {/* <TouchableOpacity style={styles.tool}>
              <Image
                style={styles.toolIcon}
                source={require("../../assets/tools_adddevicemesh.png")}
              />
              <Text allowFontScaling={false} style={styles.valueText}>
                SETUP DEVICE{"\n"}(MESH)
              </Text>
            </TouchableOpacity> */}

          {/* Surveillance */}
          {this.props.surveillanceDATA.status == 1 && (
            <View style={styles.dataBox}>
              {this.surveillanceBtn()}
              <TouchableOpacity style={styles.tool}></TouchableOpacity>
              <TouchableOpacity style={styles.tool}></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const dropDownBtn = StyleSheet.create({
  inputWeb: {
    width: 150,
    minHeight: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#fff"
  },
  inputIOS: {
    width: 150,
    minHeight: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#fff"
  },
  inputAndroid: {
    width: 150,
    minHeight: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#fff"
  },

  placeholder: {
    width: 150,
    minHeight: 50,
    fontSize: fontSize,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    color: "black",

    marginLeft: 10,
    marginTop: 5
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 50,
    height: 300
  },

  toolIcon: {
    width: 50,
    height: 50
  },
  toolBox: {
    flex: 1,
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: boxColor
  },
  surveilanceBox: {
    flex: 1,
    height: 400,
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: boxColor
  },
  tool: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  valueText: {
    height: 40,
    fontSize: 14,
    // marginLeft: 5,
    textAlign: "center",
    color: "#000000"
  },

  dataBox: {
    flexDirection: "row",
    height: 100,
    alignSelf: "stretch",
    marginLeft: 5,
    marginRight: 5
  },
  dataTitle: {
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: "bold"
  },
  selectorIcon: {
    width: 50,
    height: 50
  },
  selector: {
    margin: 2,
    alignItems: "center",
    marginRight: 8
  },
  subTitle: {
    flex: 0.42,
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 10,
    marginTop: 5,
    paddingBottom: 3,
    color: "#000000"
  }
});
