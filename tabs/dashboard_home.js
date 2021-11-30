//
// Dashboard > Home
// Version history: 1.0
// - Environmental data: ok
// - Weather data: ok
// - Insect count: have to change
// - Toolbox: 1/9
// - Disease:
// - Calendar:
//

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
  ActivityIndicator,
  PixelRatio,
  Dimensions
} from "react-native";
import Select from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 1440;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
}

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_getLocations = base_url + "get_locations.php";
const URL_getCurrentEnvi = base_url + "data_envi_current.php";
const URL_getCurrentCounts = base_url + "data_insect_current2.php";
const URL_getCurrentDisease = base_url + "data_disease_current.php";
const URL_getLocalWeather = base_url + "data_local_weather.php";
const URL_getPesticideCalendar = base_url + "data_pesticide_calendar.php";
const URL_savepesticide = base_url + "save_pesticide_calendar.php";

const base_url_surveillance = "http://140.112.94.123:20012/";
const URL_getCameras = base_url_surveillance + "get_cameras/";

//
// Pages
//
import Login from "../pages/login.js";
import DashboardHomeSummaryBox from "../components/dashboard_home/summary_box.js";
import DashboardHomeToolBox from "../components/dashboard_home/tool_box.js";
import I2PDMHeader from "../components/i2pdm_header.js";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";

export default class DashboardHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "1",
      status_surveillance: "0",
      lang: "en",
      loaded: false,
      loaded2: false,
      buttonColors: [],
      city: "",
      locations: [],
      actives: [],
      nodes: [],
      locationSelected: "",
      surveillanceDATA: [],
      sensorDATA: [],
      countDATA: [],
      weatherDATA: [],
      diseaseDATA: [],
      pesticideDATA: [],
      pesticideMarks: []
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

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
  // Get current counts
  // > Connected to dashboard_summary_box
  //
  fetchCurrentCounts({ location }) {
    var thisURL = URL_getCurrentCounts + "?loc=" + location;
    // console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var countDATA = response;
        console.log("[count]", response.status);

        this.setState({
          // status: response.status,
          countDATA: countDATA
        });
      });
  }

  //
  // Get local weather
  // > Connected to dashboard_summary_box
  //
  fetchLocalWeather({ location }) {
    var thisURL = URL_getLocalWeather + "?loc=" + location;
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var weatherDATA = response;
        this.setState({
          weatherDATA: weatherDATA,
          city: response.CITY,
          loaded2: true
        });
      });
  }

  //
  // Get current envi
  // > Connected to dashboard_summary_box
  //
  fetchCurrentEnvi({ location }) {
    var thisURL = URL_getCurrentEnvi + "?loc=" + location;
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var sensorDATA = response;
        console.log("[sensors]", response.status);
        this.setState({
          sensorDATA: sensorDATA,
          status: response.status
        });
      });
  }

  //
  // Get disease data
  // > Connected to dashboard_summary_box
  //
  fetchCurrentDisease({ location }) {
    var thisURL = URL_getCurrentDisease + "?loc=" + location;
    // console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var diseaseDATA = response;
        console.log("[disease]", response.status);

        this.setState({
          diseaseDATA: diseaseDATA,
          loaded: true
        });
      });
  }

  //
  // Get pesticide calendar
  // > Connected to dashboard_summary_box
  fetchPesticideCalendar({ location }) {
    var thisURL = URL_getPesticideCalendar + "?loc=" + location;
    // console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var pesticideDATA = response;

        var pesticideMarks = [];
        pesticideDATA.dates.map((d, i) => {
          var m_date = new moment(d, "YYYY-MM-DD");
          pesticideMarks.push({
            date: m_date,
            style: { backgroundColor: "#e86879" },
            textStyle: { color: "black" },
            containerStyle: [],
            allowDisabled: true
          });
        });

        this.setState({
          pesticideDATA: pesticideDATA,
          pesticideMarks: pesticideMarks
        });
      });
  }

  // -testing: show new api's time 
  fetchPesticideCalendarTime({ location }) {
    var thisURL = "http://140.112.94.123:20000/PEST_DETECT/_app/data_pesticide_calendar_t.php?loc=TEST_GH";

    //var thisURL = URL_getPesticideCalendar + "?loc=" + location;
    // console.log(thisURL);
    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var pesticideDATA = response;

        pesticideDATA.time.map((t, i) => {
          // var m_date = new moment(d, "YYYY-MM-DD");
          console.log(t);
          console.log(i);
        });
      });
  }


  //
  // Get camera list, if there is
  //
  fetchSurveillanceCameras({ location }) {
    var thisURL = URL_getCameras + location;
    console.log(thisURL);

    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        console.log("[cameras]", response.status);

        this.setState({
          status_surveillance: response.status,
          surveillanceDATA: response
        });
      })
      .catch(error => {
        // console.log(error);
        this.setState({
          status_surveillance: "0"
        });
      });
  }

  markCalendar({ data }) {
    var thisDate = data.data.date;
    var thisPesticide = data.data.pesticide;
   
    var thisURL =
      URL_savepesticide +
      "?loc=" +
      this.state.locationSelected +
      "&date=" +
      thisDate +
      "&pesticide=" +
      thisPesticide;
    console.log(thisURL);

    var itExists = 0;
    for (let [i, mark] of this.state.pesticideMarks.entries()) {
      var d = new moment(mark.date, "YYYY-MM-DD").format("YYYY-MM-DD");
      if (d == thisDate) {
        if (thisPesticide == 1)
          this.state.pesticideMarks[i].style.backgroundColor = "#f7f7f7";
        if (thisPesticide == 0)
          this.state.pesticideMarks[i].style.backgroundColor = "#ff0000";
        itExists = 1;
      }
    }

    if (itExists == 0) {
      if (thisPesticide == 0) {
        this.state.pesticideMarks.push({
          date: thisDate,
          style: { backgroundColor: "#ff0000" },
          textStyle: { color: "black" },
          containerStyle: [],
          allowDisabled: true
        });
      }
      if (thisPesticide == 1) {
        this.state.pesticideMarks.push({
          date: thisDate,
          style: { backgroundColor: "#f7f7f7" },
          textStyle: { color: "black" },
          containerStyle: [],
          allowDisabled: true
        });
      }
    }

    // console.log(this.state.pesticideMarks.length);
    // this.state.pesticideMarks = this.state.pesticideMarks.filter(
    //   mark =>
    //     new moment(mark.date, "YYYY-MM-DD").format("YYYY-MM-DD") !== thisDate
    // );
    // console.log(this.state.pesticideMarks.length);

    // this.props.pesticideMarks = newArray;

    /*
        if (thisPesticide == "0") {
          this.props.pesticideMarks.push({
            date: thisDate2,
            style: { backgroundColor: "#ff0000" },
            textStyle: { color: "black" },
            containerStyle: [],
            allowDisabled: true
          });
        }
        if (thisPesticide == "1") {
          this.props.pesticideMarks.push({
            date: thisDate2,
            style: { backgroundColor: "#f7f7f7" },
            textStyle: { color: "black" },
            containerStyle: [],
            allowDisabled: true
          });
        }
        console.log("[pesticide_mark.js]", thisURL);
    */

    /*
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
            });*/
  }

  //
  // On select of location
  //
  changeButtonColor({ location }) {
    var buttonColors = [];
    var index = this.state.locations.findIndex(obj => obj === location);

    this.state.locations.map((z, i) => (buttonColors[i] = "#ffffff"));
    buttonColors[index] = "#fff4cf";

    this.setState({
      buttonColors: buttonColors
    });
  }

  async refreshDashboard({ location }) {
    this.setState({ loaded2: 0, loaded: 0, locationSelected: location });

    this.changeButtonColor({ location });
    await Promise.all([
      this.fetchCurrentEnvi({ location }),
      this.fetchCurrentCounts({ location }),
      this.fetchLocalWeather({ location }),
      this.fetchCurrentDisease({ location }),
      this.fetchPesticideCalendar({ location }),
      this.fetchPesticideCalendarTime({ location }),
      this.fetchSurveillanceCameras({ location })
    ]);
    AsyncStorage.setItem("locationSelected", location);
    // console.log("DONE");
  }

  async afterSetStateFinished() {
    var location = this.state.locationSelected;
    this.refreshDashboard({ location });
  }

  async fetchLocations() {
    var u = await AsyncStorage.getItem("username");
    console.log(u);
    await AsyncStorage.getItem("username").then(username => {
      var thisURL = URL_getLocations + "?username=" + username;
      console.log(thisURL);
      fetch(thisURL)
        .then(response => response.json())
        .then(response => {
          var locationList = response.locations;
          var activesList = response.actives;
          var nodesList = response.nodes;
          var buttonColors = [];

          locationList.map((z, i) => (buttonColors[i] = "#ffffff"));
          buttonColors[0] = "#e7ff61";
          this.setState(
            {
              locations: locationList,
              locationSelected: locationList[0],
              actives: activesList,
              nodes: nodesList,
              buttonColors: buttonColors
            },
            () => {
              this.afterSetStateFinished();
            }
          );
        });
    });
  }
  componentDidMount() {
    this.fetchLocations();
  }

  render() {
    let summaryBox;
    let toolbox;
    let locationScrollView;

    if (
      (this.state.status == "2" || this.state.status == "-1") &&
      this.state.locations[0] != ""
    ) {
      locationScrollView = (
        <ScrollView style={{ height: 100, marginLeft: 20 }} horizontal={true}>
          {this.state.locations.map((location, i) => (
            <TouchableOpacity
              onPress={() => this.refreshDashboard({ location })}
              key={location}
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

      if (this.state.loaded && this.state.loaded2) {
        summaryBox = (
          <DashboardHomeSummaryBox
            city={this.state.city}
            lang={this.props.lang}
            location={this.state.locationSelected}
            sensorDATA={this.state.sensorDATA}
            countDATA={this.state.countDATA}
            weatherDATA={this.state.weatherDATA}
            diseaseDATA={this.state.diseaseDATA}
            pesticideDATA={this.state.pesticideDATA}
            pesticideMarks={this.state.pesticideMarks}
            markCalendar={data => this.markCalendar({ data })}
          />
        );
        toolbox = (
          <DashboardHomeToolBox
            location={this.state.locationSelected}
            navigation={this.props.navigation}
            surveillanceDATA={this.state.surveillanceDATA}
            lang={this.props.lang}
          />
        );
      } else {
        summaryBox = (
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
        toolbox = (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center"
            }}
          ></View>
        );
      }
    }
    if (this.state.locations[0] == "") {
      summaryBox = (
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
        {/* Header */}
        <I2PDMHeader
          title={this.t("HOME", this.props.lang)}
          lang={this.props.lang}
        />

        {/* Location scrollview */}
        <View>{locationScrollView}</View>

        {/* Summary boxes */}
        <ScrollView style={{ flex: 1 }}>
          <View>
            {summaryBox}
            {toolbox}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  }
});
