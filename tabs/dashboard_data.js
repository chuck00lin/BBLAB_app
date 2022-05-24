//
// Dashboard > Data Analysis
// Version history: 1.0
// - Environmental data: ok
//

import { Svg, G, Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import React, { Component, useEffect, useState } from "react";
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
  BackHandler,
  Dimensions,
  ActivityIndicator,
  PixelRatio
} from "react-native";

import Select from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";

moment.tz.setDefault("Asia/Taipei");

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_getLocations = base_url + "get_locations.php";
const URL_getTableData = base_url + "data_nodal.php";
const URL_getDailyEnvi = base_url + "data_envi_daily2.php";
const URL_getMonthlyEnvi = base_url + "data_envi_monthly.php";
const URL_getDailyCounts = base_url + "data_insect_daily2.php";
const URL_getMonthlyCounts = base_url + "data_insect_monthly.php";
const URL_getDailyDisease = base_url + "data_disease_3dailyacc.php";
const URL_getMonthlyDisease = base_url + "data_disease_monthly.php";
const URL_getLocalWeather = base_url + "data_local_weather.php";
const URL_getSpatialData = base_url + "data_spatial.php";
const URL_report_details = base_url + "get_report_details.php";
const assets_dir = "../../assets/";
const leftImage = "../assets/left.png";
const rightImage = "../assets/right.png";

//
// Pages
//
import Login from "../pages/login.js";
import I2PDMHeader from "../components/i2pdm_header.js";
import CountPlots from "../components/dashboard_data/plots/count_plots.js";
import EnviPlots from "../components/dashboard_data/plots/envi_plots.js";
import DiseasePlots from "../components/dashboard_data/plots/disease_plots.js";
import TableData from "../components/dashboard_data/table_data.js";
import SpatialData from "../components/dashboard_data/spatial_data.js";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";

var fontScale = PixelRatio.getFontScale();
var fontSize = 16 / fontScale;

var day_now = new moment();
var day_now3 = new moment().format("YYYY-MM-DD");
var days_before = new moment(day_now.valueOf() - 14 * 24 * 3600 * 1000);
var days_before3 = days_before.format("YYYY-MM-DD");

const range = (start, end, step = 1) => {
  let output = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

export default class DashboardData extends Component {
  state = {
    lang: "en",
    status: "0",
    buttonColors: [],
    city: "",
    locations: [],
    locationSelected: [],
    actives: [],
    nodes: [],
    dataSelected: 1,
    previousDataSelected: 1,
    displaySelected: 1,
    previousDisplaySelected: 1,
    freqSelected: 2,

    //  Sensor data
    sensorDATA: [0],
    sensorDATES: [""],
    sensorDATESOUTPUT: [""],
    sensorDATESINDICES: [0],

    //  Count data
    countDATA: [0],
    countDATES: [""],
    countDATESOUTPUT: [""],
    countDATESINDICES: [0],

    // Spatial data
    spatialXCOORDS: [],
    spatialYCOORDS: [],
    spatialDATA: [],
    spatialNAMES: [],
    spatialNAMES_CN: [],
    spatialDOORX: [],
    spatialDOORY: [],
    spatialNODESTATS: [],
    spatialNODES: 0,
    spatialIMAGES: [],

    // Tabular data
    tableNODES: [],
    tableENVITYPES: [],
    tableINSECTTYPES: [],
    tableDATA: [],

    weatherDATA: [],
    diseaseDATA: [],
    diseaseDATES: [""],
    diseaseDATESOUTPUT: [""],
    diseaseDATESINDICES: [0],
    disease_available: [0],

    startDateIOS: day_now,
    startDate: day_now3,
    dateSelected: day_now3,
    dateSelectedValue: day_now,
    minDate: day_now,
    maxDate: day_now,
    selectDateVisible: false,

    temporalDate1Visible: false,
    temporalDate2Visible: false,
    temporalDate1: days_before3,
    temporalDate1IOS: days_before,
    temporalDateSelected1: days_before3,
    temporalDateSelectedValue1: days_before,
    temporalDate2: day_now3,
    temporalDate2IOS: day_now,
    temporalDateSelected2: day_now3,
    temporalDateSelectedValue2: day_now
  };

  async fetchMinMaxDate() {
    var thisURL = URL_report_details + "?loc=" + this.state.locationSelected;
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        // var min_date = response.min_date + " 00:00:00";
        // var max_date = response.max_date + " 00:00:00";

        this.setState({
          minDate: response.min_date,
          maxDate: response.max_date,
          dateSelected: response.max_date,
          dateSelectedValue: moment(response.max_date)
        });
      });
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  //  index: Data type, index2: display type
  async changeDisplayType(index, index2) {
    // If display was changed
    if (index == 4) {
      index = this.state.previousDataSelected;
    }

    // If there are changes in data/display AND if not table
    if (index2 != 3) {
      // If from table to charts/grid
      if (this.state.previousDisplaySelected == 3) {
        // console.log("Recalled");
        await this.setState({
          displaySelected: index2,
          dataSelected: this.state.previousDataSelected,
          status: "0"
        });
        this.afterFetchLocations();
      }

      if (
        this.state.dataSelected != index ||
        this.state.displaySelected != index2
      ) {
        // console.log("Not table mode");
        await this.setState({
          displaySelected: index2,
          dataSelected: index,
          status: "0"
        });
        this.afterFetchLocations();
      }
    }

    //  If table mode
    if (index2 == 3 && index == 0) {
      if (this.state.previousDisplaySelected != index2) {
        await this.setState({
          displaySelected: index2,
          dataSelected: index,
          status: "0"
        });
        this.afterFetchLocations();
      }
    }

    // If display is not a table
    if (index2 != 3) {
      // console.log("Changed previous data");
      await this.setState({
        previousDataSelected: index
      });
    }

    await this.setState({
      previousDisplaySelected: index2
    });
  }

  async changeFrequencyType(index) {
    await this.setState({ status: "0", freqSelected: index });
    if (index != 0 && this.state.displaySelected == 1) {
      this.setState({ freqSelected: index });
    } else if (this.state.displaySelected == 1) {
      this.setState({ status: "0", freqSelected: index });
    }
    this.afterFetchLocations();
  }

  getDisplayIcon = index => {
    if (index == 1 && this.state.displaySelected == 1)
      return require("../assets/data_charts_active.png");
    if (index == 1 && this.state.displaySelected != 1)
      return require("../assets/data_charts_inactive.png");

    if (index == 2 && this.state.displaySelected == 2)
      return require("../assets/data_grid_active.png");
    if (index == 2 && this.state.displaySelected != 2)
      return require("../assets/data_grid_inactive.png");

    if (index == 3 && this.state.displaySelected == 3)
      return require("../assets/data_table_active.png");
    if (index == 3 && this.state.displaySelected != 3)
      return require("../assets/data_table_inactive.png");
  };

  getDataIcon = index => {
    if (this.state.displaySelected != 3) {
      if (index == 1 && this.state.dataSelected == 1)
        return require("../assets/data_insect_active.png");
      if (index == 1 && this.state.dataSelected != 1)
        return require("../assets/data_insect_inactive.png");

      if (index == 2 && this.state.dataSelected == 2)
        return require("../assets/data_envi_active.png");
      if (index == 2 && this.state.dataSelected != 2)
        return require("../assets/data_envi_inactive.png");

      if (index == 3 && this.state.dataSelected == 3)
        return require("../assets/data_disease_active.png");
      if (index == 3 && this.state.dataSelected != 3)
        return require("../assets/data_disease_inactive.png");
    } else {
      if (index == 1) return require("../assets/data_insect_inactive.png");
      if (index == 2) return require("../assets/data_envi_inactive.png");
      if (index == 3) return require("../assets/data_disease_inactive.png");
    }
  };

  getResolutionIcon = index => {
    // if (index == 1 && this.state.freqSelected == 1)
    //   return require("../assets/freq_hour.png");
    // if (index == 1 && this.state.freqSelected != 1)
    //   return require("../assets/freq_hourx.png");

    if (index == 2 && this.state.freqSelected == 2)
      return require("../assets/freq_day.png");
    if (index == 2 && this.state.freqSelected != 2)
      return require("../assets/freq_dayx.png");

    if (index == 3 && this.state.freqSelected == 3)
      return require("../assets/freq_month.png");
    if (index == 3 && this.state.freqSelected != 3)
      return require("../assets/freq_monthx.png");
  };

  //
  // Get active nodes list
  //
  getActives = (actives, nodes) => {
    if (actives != nodes) {
      return (
        <View style={{ flexDirection: "row" }}>
          <Text allowFontScaling={false} style={{ color: "red" }}>
            {actives}
          </Text>
          <Text allowFontScaling={false}>/{nodes}</Text>
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: "row" }}>
          <Text
            allowFontScaling={false}
            style={{ color: "green", fontWeight: "bold" }}
          >
            {actives}
          </Text>
          <Text allowFontScaling={false}>/{nodes}</Text>
        </View>
      );
    }
  };

  //
  // Get table data
  //
  fetchTableData(location) {
    var thisURL = URL_getTableData + "?loc=" + location;
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var tableNODES = range(1, Number(response.nodes) + 1, 1);
        var tableENVITYPES = response.envi;
        var tableINSECTTYPES = response.species;
        var tableDATA = response;
        this.setState({
          status: response.status,
          tableNODES: tableNODES,
          tableENVITYPES: tableENVITYPES,
          tableINSECTTYPES: tableINSECTTYPES,
          tableDATA: tableDATA
        });
      });
  }

  //
  // Get spatial data
  //
  fetchSpatialData(location) {
    var thisURL =
      URL_getSpatialData +
      "?loc=" +
      location +
      "&date=" +
      this.state.dateSelected;

    console.log("[dashboard_data.js]", thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var spatialXCOORDS = response.x_coords;
        var spatialYCOORDS = response.y_coords;

        var spatialCOUNT = response.counts;
        var spatialCOUNTCODES = response.counts_names;
        var spatialCOUNTNAMES = response.counts_display_en_names;
        var spatialCOUNTNAMES_CN = response.counts_display_cn_names;

        var spatialENVI = response.envi;
        var spatialENVICODES = response.envi_names;
        var spatialENVINAMES = response.envi_display_en_names;
        var spatialENVINAMES_CN = response.envi_display_cn_names;

        var spatialDISEASE = response.disease;
        var spatialDISEASECODES = response.disease_names;
        var spatialDISEASENAMES = response.disease_display_en_names;
        var spatialDISEASENAMES_CN = response.disease_display_cn_names;

        var spatialDOORX = response.door_x;
        var spatialDOORY = response.door_y;
        var spatialNODESTATS = response.nodestat;
        var spatialNODES = response.nodes;

        var spatialIMAGES = [];
        var spatialDATA = [];
        var spatialNAMES = [];
        var spatialNAMES_CN = [];
        var spatialCODES = [];

        if (this.state.dataSelected == 1) {
          spatialDATA = spatialCOUNT;
          spatialCODES = spatialCOUNTCODES;
          spatialNAMES = spatialCOUNTNAMES;
          spatialNAMES_CN = spatialCOUNTNAMES_CN;
          spatialIMAGES = response.insect_images;
        }
        if (this.state.dataSelected == 2) {
          spatialDATA = spatialENVI;
          spatialCODES = spatialENVICODES;
          spatialNAMES = spatialENVINAMES;
          spatialNAMES_CN = spatialENVINAMES_CN;
          spatialIMAGES = spatialCODES.map(
            name => assets_dir + name.toLowerCase() + ".png"
          );
        }
        if (this.state.dataSelected == 3) {
          spatialDATA = spatialDISEASE;
          spatialCODES = spatialDISEASECODES;
          spatialNAMES = spatialDISEASENAMES;
          spatialNAMES_CN = spatialDISEASENAMES_CN;
          spatialIMAGES = response.disease_images;
        }

        console.log(spatialIMAGES);

        this.setState({
          status: response.status,
          spatialXCOORDS: spatialXCOORDS,
          spatialYCOORDS: spatialYCOORDS,
          spatialDATA: spatialDATA,
          spatialCODES: spatialCODES,
          spatialNAMES: spatialNAMES,
          spatialNAMES_CN: spatialNAMES_CN,
          spatialDOORX: spatialDOORX,
          spatialDOORY: spatialDOORY,
          spatialNODESTATS: spatialNODESTATS,
          spatialNODES: spatialNODES,
          spatialIMAGES: spatialIMAGES
        });
      });
  }

  //
  // Get daily counts
  //
  fetchDailyCounts(location) {
    if (this.state.freqSelected == 2)
      var thisURL =
        URL_getDailyCounts +
        "?loc=" +
        location +
        "&start=" +
        this.state.temporalDateSelected1 +
        "&end=" +
        this.state.temporalDateSelected2;
    if (this.state.freqSelected == 3)
      var thisURL = URL_getMonthlyCounts + "?loc=" + location;

    console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var countDATA = response;
        var countSPECIES = response.species;
        var countSPECIES_CN = response.species_cn;

        if (this.state.freqSelected == 2) {
          var countDATES = response.dates.map(d => d.substring(6, 11));
        }
        if (this.state.freqSelected == 3) {
          var countDATES = response.dates.map(d => d.substring(1, 8));
        }
        var countLENGTH = countDATES.length;

        var seq = 3;
        if (countLENGTH < 10) seq = 1;
        if (countLENGTH >= 10) seq = 3;
        if (countLENGTH > 25) seq = 6;
        if (countLENGTH > 100) seq = 9;

        var countDATESINDICES = range(0, countDATES.length, seq);
        var countDATESOUTPUT = countDATESINDICES.map(i => countDATES[i]);
        if (this.state.dataSelected == 1) {
          this.setState({
            status: response.status,
            countDATESINDICES: countDATESINDICES,
            countDATESOUTPUT: countDATESOUTPUT,
            countDATA: countDATA
          });
        }
      });
  }

  //
  //  Get daily disease data
  //
  fetchDiseaseData(location) {
    if (this.state.freqSelected == 2)
      var thisURL =
        URL_getDailyDisease +
        "?loc=" +
        location +
        "&start=" +
        this.state.temporalDateSelected1 +
        "&end=" +
        this.state.temporalDateSelected2;
    if (this.state.freqSelected == 3)
      var thisURL = URL_getMonthlyDisease + "?loc=" + location;

    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var diseaseDATA = response;
        var diseaseCODES = response.diseases;
        var diseaseNAMES_EN = response.diseases_display_en;
        var diseaseNAMES_CN = response.diseases_display_cn;

        if (this.state.freqSelected == 2) {
          var diseaseDATES = response.dates.map(d => d.substring(6, 11));
        }
        if (this.state.freqSelected == 3) {
          var diseaseDATES = response.dates.map(d => d.substring(1, 8));
        }
        var diseaseLENGTH = diseaseDATES.length;

        var seq = 3;
        if (diseaseLENGTH < 10) seq = 1;
        if (diseaseLENGTH >= 10) seq = 3;
        if (diseaseLENGTH > 25) seq = 6;
        if (diseaseLENGTH > 100) seq = 9;

        var diseaseDATESINDICES = range(0, diseaseDATES.length, seq);
        var diseaseDATESOUTPUT = diseaseDATESINDICES.map(i => diseaseDATES[i]);

        if (this.state.dataSelected == 3) {
          this.setState({
            status: response.status,
            diseaseDATESINDICES: diseaseDATESINDICES,
            diseaseDATESOUTPUT: diseaseDATESOUTPUT,
            diseaseDATA: diseaseDATA
          });
        }
      });
  }

  //
  // Fetch daily envi
  //
  fetchDailyEnvi(location) {
    if (this.state.freqSelected == 2)
      var thisURL =
        URL_getDailyEnvi +
        "?loc=" +
        location +
        "&start=" +
        this.state.temporalDateSelected1 +
        "&end=" +
        this.state.temporalDateSelected2;
      console.log(thisURL);
    if (this.state.freqSelected == 3)
      var thisURL = URL_getMonthlyEnvi + "?loc=" + location;

    // console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var sensorDATA = response;
        var sensorDATES = response.dates.map(d => d.substring(6, 11));
        var sensorDATESOUTPUT = [];
        var sensorDATESINDICES = [];

        if (this.state.freqSelected == 2) {
          var sensorDATES = response.dates.map(d => d.substring(6, 11));
        }
        if (this.state.freqSelected == 3) {
          var sensorDATES = response.dates.map(d => d.substring(1, 8));
        }
        var sensorLENGTH = sensorDATES.length;

        var seq = 3;
        if (sensorLENGTH < 10) seq = 1;
        if (sensorLENGTH >= 10) seq = 3;
        if (sensorLENGTH > 25) seq = 6;
        if (sensorLENGTH > 100) seq = 9;

        var sensorDATESINDICES = range(0, sensorLENGTH, seq);
        var sensorDATESOUTPUT = sensorDATESINDICES.map(i => sensorDATES[i]);

        if (this.state.dataSelected == 2) {
          this.setState({
            status: response.status,
            sensorDATES: sensorDATES,
            sensorDATESOUTPUT: sensorDATESOUTPUT,
            sensorDATESINDICES: sensorDATESINDICES,
            sensorDATA: sensorDATA
          });
        }
      });
  }

  //
  // On select of location
  //
  changeButtonColor(location) {
    var buttonColors = [];
    var index = this.state.locations.findIndex(obj => obj === location);
    this.state.locations.map((z, i) => (buttonColors[i] = "#ffffff"));
    buttonColors[index] = "#fff4cf";
    this.setState({
      locationSelected: location,
      buttonColors: buttonColors
    });
  }

  //
  // Do this everytime the tab is selected
  //
  componentDidUpdate() {
    this.checkUpdate();
  }

  componentDidMount() {
    AsyncStorage.setItem("updateDataAnalysis", "1");
    this.checkUpdate();
  }

  temporalDataSelector = () => {
    var selectorBox = <View></View>;
    var dateSelector1 = <View></View>;
    var dateSelector2 = <View></View>;

    // Show date picker when daily
    if (this.state.freqSelected == 2) {
      if (Platform.OS == "android") {
        dateSelector1 = (
          <View style={{ flexDirection: "row" }}>
            <Text
              allowFontScaling={false}
              style={{
                width: 50,
                justifyContent: "center",
                alignSelf: "center",
                marginRight: 10,
                textAlign: "right",
                fontSize: 12
              }}
            >
              FROM:
            </Text>

            <TouchableOpacity
              style={{
                height: 35,
                width: 135,
                padding: 5,
                backgroundColor: "#ebebeb",
                borderRadius: 10,
                paddingLeft: 20,
                paddingRight: 20,
                marginBottom: 5
              }}
              onPress={() => this.setState({ temporalDate1Visible: true })}
            >
              <Text
                allowFontScaling={false}
                style={
                  ([styles.popupText],
                  { fontSize: fontSize, textAlign: "center" })
                }
              >
                {this.state.temporalDateSelected1}
              </Text>
            </TouchableOpacity>
          </View>
        );
        dateSelector2 = (
          <View style={{ flexDirection: "row" }}>
            <Text
              allowFontScaling={false}
              style={{
                width: 50,
                justifyContent: "center",
                alignSelf: "center",
                marginRight: 10,
                textAlign: "right",
                fontSize: 12
              }}
            >
              TO:
            </Text>
            <TouchableOpacity
              style={{
                width: 135,
                height: 35,
                padding: 5,
                backgroundColor: "#ebebeb",
                borderRadius: 10,
                paddingLeft: 20,
                paddingRight: 20
              }}
              onPress={() => this.setState({ temporalDate2Visible: true })}
            >
              <Text
                allowFontScaling={false}
                style={
                  ([styles.popupText],
                  { fontSize: fontSize, textAlign: "center" })
                }
              >
                {this.state.temporalDateSelected2}
              </Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        dateSelector1 = (
          <View style={{ flexDirection: "row" }}>
            <Text
              allowFontScaling={false}
              style={{
                width: 50,
                justifyContent: "center",
                alignSelf: "center",
                marginRight: 10,
                textAlign: "right",
                fontSize: 12
              }}
            >
              FROM:
            </Text>

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
                value={new Date(this.state.temporalDateSelected1.valueOf())}
                minimumDate={new Date(this.state.minDate.valueOf())}
                maximumDate={
                  new Date(this.state.temporalDateSelectedValue2.valueOf())
                }
                display="default"
                mode="date"
                onChange={this.onChangeTemporalDate1}
                style={{
                  width: 180,
                  height: 45,
                  color: "white",
                  backgroundColor: "#ffffff"
                }}
              />
            </View>
          </View>
        );
        dateSelector2 = (
          <View style={{ flexDirection: "row" }}>
            <Text
              allowFontScaling={false}
              style={{
                width: 50,
                justifyContent: "center",
                alignSelf: "center",
                marginRight: 10,
                textAlign: "right",
                fontSize: 12
              }}
            >
              TO:
            </Text>

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
                value={new Date(this.state.temporalDateSelected2.valueOf())}
                minimumDate={
                  new Date(this.state.temporalDateSelectedValue1.valueOf())
                }
                maximumDate={new Date(this.state.maxDate.valueOf())}
                display="default"
                mode="date"
                onChange={this.onChangeTemporalDate2}
                style={{
                  width: 180,
                  height: 45,
                  color: "white",
                  backgroundColor: "#ffffff"
                }}
              />
            </View>
          </View>
        );
      }
    }

    if (this.state.displaySelected == 1) {
      selectorBox = (
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            height: 80,
            flexDirection: "row"
          }}
        >
          {/* Resolution picker */}
          <View style={{ flex: 1, height: 80 }}>
            <Text allowFontScaling={false} style={styles.title}>
              {this.t("RESOLUTION", this.props.lang)}
            </Text>

            <View style={{ marginLeft: 15, flexDirection: "row" }}>
              {/* <TouchableOpacity
                style={styles.selector}
                // onPress={() => this.changeDataType(1)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("HOURLY", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getResolutionIcon(1)}
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.selector}
                onPress={() => this.changeFrequencyType(2)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("DAILY", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getResolutionIcon(2)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => this.changeFrequencyType(3)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("MONTHLY", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getResolutionIcon(3)}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date picker */}
          <View
            style={{
              flex: 1,
              height: 80,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              marginRight: 30
            }}
          >
            <View style={{ flexDirection: "row" }}>{dateSelector1}</View>
            <View style={{ flexDirection: "row" }}>{dateSelector2}</View>
            <View style={{ marginLeft: 15, flexDirection: "row" }}></View>
          </View>
        </View>
      );
    }
    return selectorBox;
  };

  //
  // Show start date picker for spatial data
  //
  showSpatialDatePicker = () => {
    var output = <View></View>;
    if (Platform.OS == "android") {
      output = (
        <TouchableOpacity
          style={{
            padding: 5,
            backgroundColor: "#ebebeb",
            borderRadius: 10,
            paddingLeft: 20,
            paddingRight: 20
          }}
          onPress={() => this.setState({ selectDateVisible: true })}
        >
          <Text
            allowFontScaling={false}
            style={([styles.popupText], { fontSize: fontSize })}
          >
            {this.state.dateSelected}
          </Text>
        </TouchableOpacity>
      );
    } else {
      output = (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            alingSelf: "center",
            color: "white",
            backgroundColor: "#ffffff",
            borderRadius: 25
          }}
        >
          <DateTimePicker
            value={new Date(this.state.dateSelectedValue)}
            minimumDate={new Date(this.state.minDate.valueOf())}
            maximumDate={new Date(this.state.maxDate.valueOf())}
            display="default"
            mode="date"
            textColor="black"
            onChange={this.onChangeSpatialDate}
            style={{
              alignItems: "center",
              justifyContent: "center",
              alingSelf: "center",
              width: 100,
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

  //
  // Spatial data selector
  //
  spatialDataSelector() {
    var selectorBox = <View></View>;

    if (this.state.displaySelected == 2) {
      selectorBox = (
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginTop: 10,
            marginBottom: 15,
            height: 40,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center"
          }}
        >
          {/* Date selector */}
          <TouchableOpacity
            style={{ marginRight: 30 }}
            onPress={() => this.changeSpatialDate(0)}
          >
            <Image style={styles.leftRightIcon} source={require(leftImage)} />
          </TouchableOpacity>

          {this.showSpatialDatePicker()}

          <TouchableOpacity
            style={{ marginLeft: 30 }}
            onPress={() => this.changeSpatialDate(1)}
          >
            <Image style={styles.leftRightIcon} source={require(rightImage)} />
          </TouchableOpacity>
        </View>
      );
    }

    return selectorBox;
  }

  //
  // When a date in the calendar is selected
  //
  onChangeSpatialDate = (e, d) => {
    this.setState({ selectDateVisible: false });
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d);
        this.setState({
          dateSelectedValue: datex
        });
        this.changeSpatialDate(2);
      }
    } else {
      var datex = new moment(d);
      this.setState({
        dateSelectedValue: datex
      });
      this.changeSpatialDate(2);
    }
  };

  //
  // Change spatial date
  //
  changeSpatialDate(mode) {
    var newDate = "";

    var nowDate = this.state.dateSelectedValue.valueOf();
    var mxDate = moment(this.state.maxDate, "YYYY-MM-DD").add("h", 8);

    if (mode == 0) {
      newDate = moment(nowDate - 24 * 3600 * 1000);
      console.log(newDate, mxDate);
      if (newDate <= mxDate) {
        this.setState({
          dateSelectedValue: newDate
        });
      }
    }
    if (mode == 1) {
      newDate = moment(nowDate + 24 * 3600 * 1000);
      console.log(newDate, mxDate);
      if (newDate <= mxDate) {
        this.setState({
          dateSelectedValue: newDate
        });
      }
    }
    if (mode == 2) {
      newDate = moment(nowDate);
    }

    if (newDate <= mxDate) {
      this.setState({
        status: 0,
        dateSelected: newDate.format("YYYY-MM-DD")
        // dateSelectedValue: newDate
      });
      this.afterFetchLocations();
    } else {
      console.log("Exceeded date limit!");
    }

    console.log(mode);
  }

  //
  // Change temporal date 1 or 2
  //
  changeTemporalDate(fromTo, newDate) {
    if (fromTo == 0)
      var nowDate = this.state.temporalDateSelectedValue1.valueOf();
    if (fromTo == 1)
      var nowDate = this.state.temporalDateSelectedValue2.valueOf();
    var mxDate = moment(this.state.maxDate, "YYYY-MM-DD").add("h", 8);

    if (newDate <= mxDate) {
      if (fromTo == 0) {
        this.setState(
          {
            status: 0,
            temporalDateSelected1: newDate.format("YYYY-MM-DD")
          },
          () => {
            this.afterFetchLocations();
          }
        );
      }
      if (fromTo == 1) {
        this.setState(
          {
            status: 0,
            temporalDateSelected2: newDate.format("YYYY-MM-DD")
          },
          () => {
            this.afterFetchLocations();
          }
        );
      }
    } else {
      console.log("WHY");
    }
  }

  onChangeTemporalDate1 = (e, d) => {
    this.setState({ temporalDate1Visible: false });
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d);
        this.setState(
          {
            temporalDateSelectedValue1: datex
          },
          () => {
            this.changeTemporalDate(0, datex);
          }
        );
      }
    } else {
      var datex = new moment(d);
      this.setState(
        {
          temporalDateSelected1: d,
          temporalDateSelectedValue1: datex
        },
        () => {
          this.changeTemporalDate(0, datex);
        }
      );
    }
  };

  onChangeTemporalDate2 = (e, d) => {
    this.setState({ temporalDate2Visible: false });
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d);
        this.setState(
          {
            temporalDateSelectedValue2: datex
          },
          () => {
            this.changeTemporalDate(1, datex);
          }
        );
      }
    } else {
      var datex = new moment(d);
      this.setState(
        {
          temporalDateSelected2: d,
          temporalDateSelectedValue2: datex
        },
        () => {
          this.changeTemporalDate(1, datex);
        }
      );
    }
  };

  //
  // Do on update
  //
  async checkUpdate() {
    await AsyncStorage.getItem("updateDataAnalysis").then(update => {
      if (this.state.locations.length > 0) {
        // this.state.locations.map(
        //   (z, i) => (this.state.buttonColors[i] = "#ffffff")
        // );
      }
      if (update == "1") {
        this.fetchLocations();
        AsyncStorage.setItem("updateDataAnalysis", "0");

        AsyncStorage.getItem("locationSelected").then(location => {
          this.setState({ locationSelected: location });
        });
      }
    });
  }

  //
  // Fetches locations on update
  //
  async fetchLocations() {
    await AsyncStorage.getItem("username").then(username => {
      var thisURL = URL_getLocations + "?username=" + username;
      console.log("[dashboard_data.js]", thisURL);
      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var locationList = response.locations;
          var activesList = response.actives;
          var nodesList = response.nodes;
          var disease_available = response.diseases;
          var buttonColors = [];

          locationList.map((z, i) => (buttonColors[i] = "#ffffff"));
          // buttonColors[0] = "#e7ff61";
          this.setState(
            {
              locations: locationList,
              actives: activesList,
              nodes: nodesList,
              buttonColors: buttonColors,
              disease_available: disease_available
            },
            () => {
              this.afterFetchLocations();
              this.fetchMinMaxDate();
            }
          );
        });
    });
  }

  //
  // After fetchLocations()
  //
  async afterFetchLocations() {
    var thisLocation = this.state.locationSelected;
    console.log(
      "[dashboard_data.js] Fetching data from... " +
        thisLocation +
        " " +
        this.state.dataSelected +
        this.state.displaySelected +
        this.state.freqSelected
    );

    this.changeButtonColor(thisLocation);

    //  If table
    if (this.state.displaySelected == 3 && this.state.status == "0") {
      await this.fetchTableData(thisLocation);
    }

    // If charts
    if (this.state.displaySelected == 1 && this.state.dataSelected == 1) {
      await this.fetchDailyCounts(thisLocation);
    }
    if (this.state.displaySelected == 1 && this.state.dataSelected == 2) {
      await this.fetchDailyEnvi(thisLocation);
    }
    if (this.state.displaySelected == 1 && this.state.dataSelected == 3) {
      await this.fetchDiseaseData(thisLocation);
    }

    //  If spatial
    if (this.state.displaySelected == 2) {
      await this.fetchSpatialData(thisLocation);
    }

    console.log("[dashboard_data.js] Finished fetching data");
  }

  //
  // After afterSetStateFinished()
  //
  async refreshDashboard(location) {
    var index = this.state.locations.findIndex(obj => obj === location);
    var disease_ok = this.state.disease_available[index];
    if (disease_ok == 0) {
      await this.setState({ status: "0", dataSelected: 1 });
    }

    await this.setState({ status: "0", locationSelected: location });
    await this.fetchMinMaxDate();
    this.afterFetchLocations();
  }

  showDiseaseButton = () => {
    var index = this.state.locations.findIndex(
      obj => obj === this.state.locationSelected
    );
    var disease_ok = this.state.disease_available[index];
    var outputButton = <View></View>;

    if (disease_ok == 1) {
      var outputButton = (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => this.changeDisplayType(3, this.state.displaySelected)}
        >
          <Text style={styles.dataSubtitle}>
            {this.t("DISEASE", this.props.lang)}
          </Text>
          <Image style={styles.selectorIcon} source={this.getDataIcon(3)} />
        </TouchableOpacity>
      );
    }
    return outputButton;
  };

  render() {
    let dataBox;
    let locationScrollView;
    let dataDisplayTools;

    //
    // If there are locations available
    //
    if (this.state.locations[0] != "") {
      dataDisplayTools = (
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginTop: 10,
            height: 80,
            flexDirection: "row"
          }}
        >
          {/* Data type */}
          <View style={{ flex: 1, height: 80 }}>
            <Text allowFontScaling={false} style={styles.title}>
              {this.t("DATA TYPE", this.props.lang)}
            </Text>
            <View style={{ marginLeft: 15, flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.selector}
                onPress={() =>
                  this.changeDisplayType(1, this.state.displaySelected)
                }
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("INSECT", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getDataIcon(1)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selector}
                onPress={() =>
                  this.changeDisplayType(2, this.state.displaySelected)
                }
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("ENVI", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getDataIcon(2)}
                />
              </TouchableOpacity>

              {this.showDiseaseButton()}
            </View>
          </View>

          {/* Display mode */}
          <View style={{ flex: 1, height: 80 }}>
            <Text allowFontScaling={false} style={styles.title}>
              {this.t("DISPLAY MODE", this.props.lang)}
            </Text>
            <View style={{ marginLeft: 15, flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => this.changeDisplayType(4, 1)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("CHARTS", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getDisplayIcon(1)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => this.changeDisplayType(4, 2)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("GRID", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getDisplayIcon(2)}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selector}
                onPress={() => this.changeDisplayType(0, 3)}
              >
                <Text allowFontScaling={false} style={styles.dataSubtitle}>
                  {this.t("TABLE", this.props.lang)}
                </Text>
                <Image
                  style={styles.selectorIcon}
                  source={this.getDisplayIcon(3)}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
      locationScrollView = (
        <ScrollView style={{ height: 100, marginLeft: 20 }} horizontal={true}>
          {this.state.locations.map((location, i) => (
            <TouchableOpacity
              onPress={() => this.refreshDashboard(location)}
              key={i}
              style={{
                backgroundColor: this.state.buttonColors[i],
                height: 100,
                width: 100,
                marginRight: 10,
                borderColor: "#1e6136",
                borderWidth: 2,
                alignItems: "center",
                borderRadius: 15,
                justifyContent: "center"
              }}
            >
              <Image
                style={{ width: 60, height: 60 }}
                source={require("../assets/ghouse.png")}
              />
              <Text
                allowFontScaling={false}
                style={{
                  width: 100,
                  height: 15,
                  textAlign: "center",
                  fontSize: 10
                }}
              >
                {location}
              </Text>
              {this.getActives(this.state.actives[i], this.state.nodes[i])}
            </TouchableOpacity>
          ))}
        </ScrollView>
      );

      //
      // If data is loaded
      //
      if (this.state.status == 3) {
        //
        // TEMPORAL DATA
        //
        if (this.state.dataSelected == 1 && this.state.displaySelected == 1) {
          dataBox = (
            <CountPlots
              location={this.state.locationSelected}
              status={this.state.status}
              countDATA={this.state.countDATA}
              countDATESOUTPUT={this.state.countDATESOUTPUT}
              countDATESINDICES={this.state.countDATESINDICES}
              lang={this.props.lang}
              resolution={this.state.freqSelected}
            />
          );
        }
        if (this.state.dataSelected == 3 && this.state.displaySelected == 1) {
          dataBox = (
            <DiseasePlots
              location={this.state.locationSelected}
              status={this.state.status}
              diseaseDATA={this.state.diseaseDATA}
              diseaseDATESOUTPUT={this.state.diseaseDATESOUTPUT}
              diseaseDATESINDICES={this.state.diseaseDATESINDICES}
              lang={this.props.lang}
              resolution={this.state.freqSelected}
            />
          );
        }
        if (
          this.state.dataSelected == 2 &&
          this.state.displaySelected == 1 &&
          this.state.status == 3
        ) {
          dataBox = (
            <EnviPlots
              location={this.state.locationSelected}
              status={this.state.status}
              sensorDATA={this.state.sensorDATA}
              sensorDATES={this.state.sensorDATES}
              sensorDATESOUTPUT={this.state.sensorDATESOUTPUT}
              sensorDATESINDICES={this.state.sensorDATESINDICES}
              lang={this.props.lang}
              resolution={this.state.freqSelected}
            />
          );
        }

        //
        // SPATIAL DATA
        //
        if (this.state.displaySelected == 2) {
          dataBox = (
            <SpatialData
              location={this.state.locationSelected}
              status={this.state.status}
              spatialNODES={this.state.spatialNODES}
              spatialCODES={this.state.spatialCODES}
              spatialNAMES={this.state.spatialNAMES}
              spatialNAMES_CN={this.state.spatialNAMES_CN}
              spatialDATA={this.state.spatialDATA}
              spatialXCOORDS={this.state.spatialXCOORDS}
              spatialYCOORDS={this.state.spatialYCOORDS}
              spatialDOORX={this.state.spatialDOORX}
              spatialDOORY={this.state.spatialDOORY}
              spatialNODESTATS={this.state.spatialNODESTATS}
              spatialIMAGES={this.state.spatialIMAGES}
              dataType={this.state.dataSelected}
              lang={this.props.lang}
            />
          );
        }

        //
        // TABLE DATA
        //
        if (this.state.displaySelected == 3) {
          dataBox = (
            <TableData
              location={this.state.locationSelected}
              status={this.state.status}
              tableNODES={this.state.tableNODES}
              tableENVITYPES={this.state.tableENVITYPES}
              tableINSECTTYPES={this.state.tableINSECTTYPES}
              tableDATA={this.state.tableDATA}
              lang={this.props.lang}
            />
          );
        }
      }

      //
      // If loading data
      //
      if (this.state.status == "0") {
        dataBox = (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center"
            }}
          >
            <ActivityIndicator
              style={{ marginTop: 200, alignSelf: "center" }}
              size="large"
              color="#000000"
            />
          </View>
        );
      }

      //
      //  If totally no data available
      //
      if (this.state.status == "-1") {
        dataBox = (
          <View
            style={{
              height: 100,
              flex: 1,
              marginTop: -10,
              marginBottom: -10,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text> No data available yet!</Text>
          </View>
        );
      }
    }
    //
    // If there are NO locations available
    //
    else {
      dataBox = (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center"
          }}
        >
          <View
            style={{
              flex: 1,
              marginTop: 200,
              textAlign: "center",
              alignSelf: "center"
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold"
              }}
            >
              Welcome to the I2PDM system!
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                textAlign: "center"
              }}
            >
              Set-up your location first
            </Text>
            <Image
              style={{
                marginTop: 20,
                width: 100,
                height: 100,
                alignSelf: "center"
              }}
              source={require("../assets/addlocation.png")}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {/* Date picker popup */}
        {this.state.selectDateVisible && Platform.OS == "android" && (
          <DatePicker
            value={new Date(this.state.dateSelectedValue)}
            minimumDate={new Date(this.state.minDate.valueOf())}
            maximumDate={new Date(this.state.maxDate.valueOf())}
            display="calendar"
            isVisible={this.state.selectDateVisible}
            mode="date"
            onChange={this.onChangeSpatialDate}
          />
        )}

        {/* Date picker popup [Temporal 1]*/}
        {this.state.temporalDate1Visible && Platform.OS == "android" && (
          <DatePicker
            value={new Date(this.state.temporalDateSelected1)}
            minimumDate={new Date(this.state.minDate.valueOf())}
            maximumDate={
              new Date(this.state.temporalDateSelectedValue2.valueOf())
            }
            display="calendar"
            isVisible={this.state.temporalDate1Visible}
            mode="date"
            onChange={this.onChangeTemporalDate1}
          />
        )}

        {/* Date picker popup [Temporal 2]*/}
        {this.state.temporalDate2Visible && Platform.OS == "android" && (
          <DatePicker
            value={new Date(this.state.temporalDateSelected2)}
            minimumDate={new Date(this.state.temporalDateSelected1.valueOf())}
            maximumDate={new Date(this.state.maxDate.valueOf())}
            display="calendar"
            isVisible={this.state.temporalDate2Visible}
            mode="date"
            onChange={this.onChangeTemporalDate2}
          />
        )}

        {/* Header */}
        <I2PDMHeader
          lang={this.props.lang}
          title={this.t("DATA ANALYSIS", this.props.lang)}
        />

        {/* Location scrollview */}
        <View>{locationScrollView}</View>

        {/* Upper tools */}
        <View>{dataDisplayTools}</View>
        <View>{this.temporalDataSelector()}</View>
        <View>{this.spatialDataSelector()}</View>

        {/* Plots */}
        <ScrollView>
          <View>{dataBox}</View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 12
  },
  dataSubtitle: {
    fontSize: 10
  },
  selectorIcon: {
    width: 40,
    height: 40
  },
  leftRightIcon: {
    borderRadius: 10,
    width: 50,
    height: 35,
    marginBottom: 3
  },
  popupText: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 5,
    marginTop: 3
  },
  selector: {
    margin: 2,
    alignItems: "center",
    marginRight: 8
  },

  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  countBox: {
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    borderRadius: 5,
    borderColor: "#000000"
  },

  dataTitle: {
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold"
  }
});
