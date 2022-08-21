import React, { Component } from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  Switch,
  Image,
  Dimensions
} from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { CalendarList, Calendar } from "react-native-calendars";
import moment from "moment";

const alarmColors = ["#489147", "#0000ff", "#ff7930", "#ffc72b", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
// const boxColor = "#f1ffed";
const boxColor = "#f7f7f7";
import ModalInsectInfo from "../modals/insect_info.js";
import ModalDiseaseInfo from "../modals/disease_info.js";
import ModalPesticideMark from "../modals/pesticide_mark.js";

//2022-8-3-Summarydisease
import SummaryDisease from "./components/summary_disease";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";
var day_now = new moment();

var day_names_en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var day_names_zh = ["日", "一", "二", "三", "四", "五", "六"];

var month_names_en = [
  "January",
  "February",
  "March",
  "April,",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var month_names_zh = [
  "一月",
  "二月",
  "三月",
  "四月,",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月"
];

var fontScale = PixelRatio.getFontScale();
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

var calendarFontSize = 16 / fontScale;
import {
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
  VictoryPie,
  VictoryLabel,
  VictoryContainer,
  VictoryLegend
} from "victory-native";
import { Svg, G, Path } from "react-native-svg";
const legend_mapper = (data1, data2) => {
  var sum = data2.reduce(function(a, b) {
    return a + b;
  }, 0);

  var mapped_data = data1.map((d, i) => ({
    name: data1[i] + " (" + Math.round(100 * (data2[i] / sum)) + "%)"
  }));

  return mapped_data;
};

export default class DashboardSummaryBox extends Component {
  constructor() {
    super();
    this.state = {
      enabledWeather: true,
      showInsectInfoPopup: false,
      showDiseaseInfoPopup: false,
      showPesticideMarkPopup: false,
      selectedInsect: "",
      selectedLocation: "",
      selectedDate: "",
      selectedDate2: "",
      previousDate: ""
      
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  onPesticidePress = d => {
    var datex = new moment(d, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
    var datey = new moment(d, "YYYY-MM-DD").utc();
    this.setState({
      showPesticideMarkPopup: true,
      selectedDate: datex,
      selectedDate2: datey
    });
  };

  hideInsectInfoPopup = () => {
    this.setState({ showInsectInfoPopup: false });
  };

  hideDiseaseInfoPopup = () => {
    this.setState({ showDiseaseInfoPopup: false });
  };

  hidePesticideMarkPopup = () => {
    this.setState({ showPesticideMarkPopup: false });
  };

  calendar_days = () => {
    var day_names = day_names_en;
    if (this.props.lang == "zh") day_names = day_names_zh;
    return day_names;
  };

  calendar_months = () => {
    var month_names = month_names_en;
    if (this.props.lang == "zh") month_names = month_names_zh;
    return month_names;
  };

  //
  // Get day or night for weather data
  //
  getDayNight = d => {
    d = d.substring(11, 13);
    if (Number(d) <= 12) {
      return (
        <Image
          style={styles.weatherIcon}
          source={require("../../assets/day.png")}
        />
      );
    } else {
      return (
        <Image
          style={styles.weatherIcon}
          source={require("../../assets/night.png")}
        />
      );
    }
  };

  //
  // Disease alarm box
  //
  diseaseAlarmBox = d => {
    return (
      <View
        style={[
          styles.diseaseAlarmBox,
          { backgroundColor: alarmColors[Number(d)] }
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[
            styles.diseaseName,
            { textAlign: "center", fontSize: this.fontSizeENCN() }
          ]}
        >
          {this.t(alarmNames[Number(d)], this.props.lang)}
        </Text>
      </View>
    );
  };

  //
  // Count alarm box
  //
  countAlarmBox = d => {
    return (
      <View
        style={[
          styles.countAlarmBox,
          { backgroundColor: alarmColors[Number(d)] }
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[
            styles.countName,
            { textAlign: "center", fontSize: this.fontSizeENCN() }
          ]}
        >
          {this.t(alarmNames[Number(d)], this.props.lang)}
        </Text>
      </View>
    );
  };

  //
  // To show the disease data if available
  //
  showDiseaseData = () => {
    var cropName = this.props.diseaseDATA.crops[0];
    var nDisease = this.props.diseaseDATA.diseases[cropName].length;

    if (nDisease > 0) {
      return (
        <View style={styles.diseaseBox}>
          <View style={{ flex: 1, flexDirection: "row", height: 25 }}>
            <Text allowFontScaling={false} style={styles.dataTitle}>
              {this.t("Plant disease severity risk index", this.props.lang)}
            </Text>
          </View>

          {/* Get per crop  */}
          {this.props.diseaseDATA.crops.map((crop, i) => {
            return (
              <View key={i} style={styles.diseaseDataBox}>
                <View style={{ flex: 1, flexDirection: "row", height: 25 }}>
                  <Text
                    allowFontScaling={false}
                    style={styles.diseaseCropTitle}
                  >
                    {this.cropName(i, this.props.lang)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    height: 25,
                    flex: 1,
                    marginLeft: 10
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={[styles.countColumnTitle, { flex: 0.15 }]}
                  >
                    {this.t("INFO", this.props.lang)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.countColumnTitle, { flex: 0.4 }]}
                  >
                    {this.t("DISEASE", this.props.lang)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.countColumnTitle, { flex: 0.23 }]}
                  >
                    {this.t("ALARM", this.props.lang)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.countColumnTitle, { flex: 0.23 }]}
                  >
                    {this.t("PROBABILITY", this.props.lang)}
                  </Text>
                </View>

                {/* Get disease per crop  */}
                {this.props.diseaseDATA.diseases[crop].map((disease, j) => {
                  return (
                    //  Disease name
                    <View
                      key={j}
                      style={{ flex: 1, marginLeft: 15, marginBottom: 5 }}
                    >
                      <View style={styles.valueContainer}>
                        {/* Information */}
                        <TouchableOpacity
                          style={{ flex: 0.15 }}
                          onPress={() => {
                            var location = this.props.location;
                            this.setState({
                              showDiseaseInfoPopup: true
                            });
                            this.refs.diseaseInfo.fetchDiseaseInfo(
                              disease.disease_name,
                              location
                            );
                          }}
                        >
                          <Image
                            style={[
                              styles.enviIcon,
                              {
                                borderRadius: 25,
                                height: 35,
                                width: 35
                              }
                            ]}
                            source={{
                              // console.log(response.diseases["Tomato"]);
                              uri: this.props.diseaseDATA.diseases[crop][j]
                                .image
                            }}
                          />
                        </TouchableOpacity>

                        {/* Disease name */}
                        <View style={styles.diseaseNameBox}>
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.diseaseName,
                              { fontSize: this.fontSizeENCN2() }
                            ]}
                          >
                            {this.diseaseName(disease, this.props.lang)}
                          </Text>
                        </View>

                        {/* Disease alarm */}
                        {this.diseaseAlarmBox(disease.alarm)}

                        {/* DSV */}
                        <View style={{ flexDirection: "row", flex: 0.23 }}>
                          <Text
                            allowFontScaling={false}
                            style={styles.diseaseValueText}
                          >
                            {Number(disease.dsv3).toFixed(0)}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.diseaseValueUnitText}
                          >
                            %
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      );
    }
  };

  fontSizeENCN = () => {
    if (this.props.lang == "zh") return 15;
    else return 12;
  };

  fontSizeENCN2 = () => {
    if (this.props.lang == "zh") return 14;
    else return 12;
  };

  cityName = () => {
    if (this.props.lang == "zh") return this.props.weatherDATA.CITY_CN;
    else return this.props.weatherDATA.CITY;
  };

  cropName = (i, lang) => {
    if (lang == "zh") return this.props.diseaseDATA.crops_cn[i];
    else return this.props.diseaseDATA.crops[i];
  };

  diseaseName = (disease, lang) => {
    if (lang == "zh") return disease.disease_name_cn;
    else return disease.disease_name;
  };

  toggleWeather = () => {
    this.setState({ enabledWeather: !this.state.enabledWeather });
  };

  insectName = (i, lang) => {
    if (lang == "zh") return this.props.countDATA.species_display_cn[i];
    else return this.props.countDATA.species_display[i];
  };

  speciesList = lang => {
    if (lang == "zh") return this.props.countDATA.species_display_cn;
    else return this.props.countDATA.species_display;
  };

  magicWidth = () => {
    if (windowWidth > 600) return 200;
    return windowWidth * (300 / 411);
  };

  magicPadding = () => {
    if (windowWidth > 600) return 75;
    return 135;
  };

  pieChart = status => {
    var outputBox = "";

    if (status == "0") {
      outputBox = (
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
          <Text> {this.t("No data available yet!", this.props.lang)}</Text>
        </View>
      );
    } else {
      outputBox = (
        <View
          style={{
            height: 300,
            flex: 1,
            marginLeft: 15,
            marginTop: -40,
            marginBottom: -40
          }}
        >
          <Svg height="100%" width="100%" fill="#0000ff" viewBox="0 0 300 300">
            <VictoryPie
              animate={{
                duration: 2000
              }}
              standalone={false}
              width={this.magicWidth()}
              height={300}
              data={this.props.countDATA.total_counts}
              labels={this.speciesList(this.props.lang)}
              cornerRadius={5}
              padAngle={2}
              padding={{
                right: this.magicPadding(),
                left: -10
              }}
              // labelRadius={({ innerRadius }) => innerRadius + 5}
              // radius={({ datum }) => 50 + datum.y * 20}
              innerRadius={20}
              colorScale={[
                "#888888",
                "#a52a2a",
                "#820282",
                "#007d00",
                "#f4d03f",
                "#f39c12",
                "#0000FF",
                "#FF0000"
              ]}
              style={{
                // labels: { fill: "black", fontSize: 12, fontWeight: "bold" }
                labels: { display: "none" }
              }}
            />
            <VictoryLegend
              x={windowWidth * (175 / 411)}
              y={60}
              title=""
              centerTitle
              orientation="vertical"
              rowGutter={-10}
              style={{
                labels: { fontSize: 14 },
                border: { stroke: "none" },
                title: { fontSize: 20 }
              }}
              colorScale={[
                "#888888",
                "#a52a2a",
                "#820282",
                "#007d00",
                "#f4d03f",
                "#f39c12",
                "#0000FF",
                "#FF0000"
              ]}
              data={legend_mapper(
                this.speciesList(this.props.lang),
                this.props.countDATA.total_counts
              )}
            />
          </Svg>
        </View>
      );
    }
    return outputBox;
  };

  showWarning = status => {
    var output = <View></View>;
    if (status == "-1") {
      output = (
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 10,

            padding: 10,
            backgroundColor: "red",
            borderRadius: 5
          }}
        >
          <Text style={{ color: "white" }}>
            {this.t(
              "WARNING: The devices of this location are inactive, please check the devices as soon as possible",
              this.props.lang
            )}
          </Text>
          <Text style={{ color: "white" }}>
            {this.t("LAST UPDATE", this.props.lang)}:{" "}
            {this.props.sensorDATA.last_active}
          </Text>
        </View>
      );
    }
    return output;
  };
  render() {
    var dates = this.props.pesticideDATA.dates;

    return (
      <View>
        <ModalInsectInfo
          ref="insectInfo"
          hideInsectInfoPopup={() => this.hideInsectInfoPopup()}
          showInsectInfoPopup={this.state.showInsectInfoPopup}
          selectedLocation={this.state.selectedLocation}
          selectedInsect={this.state.selectedInsect}
          lang={this.props.lang}
        />

        <ModalDiseaseInfo
          ref="diseaseInfo"
          hideDiseaseInfoPopup={() => this.hideDiseaseInfoPopup()}
          showDiseaseInfoPopup={this.state.showDiseaseInfoPopup}
          selectedLocation={this.state.selectedLocation}
          selectedDisease={this.state.selectedDisease}
          lang={this.props.lang}
        />

        <ModalPesticideMark
          ref="pesticideMark"
          selectedDate={this.state.selectedDate}
          selectedDate2={this.state.selectedDate2}
          selectedLocation={this.props.location}
          hidePesticideMarkPopup={() => this.hidePesticideMarkPopup()}
          showPesticideMarkPopup={this.state.showPesticideMarkPopup}
          pesticideMarks={this.props.pesticideMarks}
          markCalendar={data => this.props.markCalendar({ data })}
          lang={this.props.lang}
        />

        {/*  */}
        {/* Environmental data */}
        {/*  */}

        {this.showWarning(this.props.sensorDATA.status)}

        <View style={styles.enviBox}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text allowFontScaling={false} style={styles.dataTitle}>
              {this.t("Environmental data", this.props.lang)}
            </Text>
          </View>
          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 0.3 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("TEMPERATURE", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/t.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {this.props.sensorDATA.T}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  &deg;C
                </Text>
              </View>
            </View>

            <View style={{ flex: 0.3 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("HUMIDITY", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/h.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {this.props.sensorDATA.H}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  %
                </Text>
              </View>
            </View>

            <View style={{ flex: 0.4 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("LIGHT INTENSITY", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/l.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {this.props.sensorDATA.L}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  lux
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --------------- */}
        {/* Insect count */}
        {/* --------------- */}
        <View style={styles.countBox}>
          <Text allowFontScaling={false} style={styles.dataTitle}>
            {this.t("Insect count data", this.props.lang)}
          </Text>

          {/*  */}
          {/* Pie chart */}
          {/*  */}
          <View
            style={{
              flexDirection: "row",
              height: 20,
              flex: 1,
              marginLeft: 10
            }}
          >
            <Text allowFontScaling={false} style={styles.countColumnTitle}>
              {this.t("PROPORTION", this.props.lang)}
            </Text>
          </View>
          {this.pieChart(this.props.countDATA.status)}

          {/*  */}
          {/* Insect data column names */}
          {/*  */}
          <View
            style={{
              flexDirection: "row",
              height: 25,
              flex: 1,
              marginLeft: 10
            }}
          >
            <Text
              allowFontScaling={false}
              style={[styles.countColumnTitle, { flex: 0.15 }]}
            >
              {this.t("INFO", this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.countColumnTitle, { flex: 0.28 }]}
            >
              {this.t("NAME", this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.countColumnTitle, { flex: 0.22 }]}
            >
              {this.t("ALARM", this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.countColumnTitle, { flex: 0.15 }]}
            >
              {this.t("TOTAL", this.props.lang)}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.countColumnTitle, { flex: 0.18 }]}
            >
              {this.t("INCREASE", this.props.lang)}
            </Text>
          </View>

          {/*  */}
          {/* Tabular insect data */}
          {/*  */}
          {this.props.countDATA.species.map((specie, i) => {
            return (
              <View key={i} style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flex: 1, flexDirection: "row", height: 40 }}>
                  <View style={styles.valueContainer}>
                    {/* Information */}
                    {/* Flex 0.1 */}
                    <TouchableOpacity
                      style={{ flex: 0.15 }}
                      onPress={() => {
                        var location = this.props.location;
                        this.setState({
                          showInsectInfoPopup: true
                        });
                        this.refs.insectInfo.fetchInsectInfo(specie, location);
                      }}
                    >
                      <Image
                        style={[
                          styles.enviIcon,
                          {
                            borderRadius: 25,
                            height: 35,
                            width: 35
                          }
                        ]}
                        // source={require("../../assets/info.png")}
                        source={{
                          uri: this.props.countDATA.images[i]
                        }}
                      />
                    </TouchableOpacity>

                    {/* Insect name */}
                    {/* Flex 0.32 */}
                    <View style={styles.countNameBox}>
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.countName,
                          { textAlign: "center", fontSize: this.fontSizeENCN() }
                        ]}
                      >
                        {this.insectName(i, this.props.lang)}
                      </Text>
                    </View>

                    {/* Count alarm */}
                    {/* Flex 0.25 */}
                    {this.countAlarmBox(this.props.countDATA.alarms[i])}

                    {/* Count */}
                    {/* Flex 0.2 */}
                    <Text
                      allowFontScaling={false}
                      style={styles.countValueText}
                    >
                      {Number(this.props.countDATA.total_counts[i]).toFixed(0)}
                    </Text>

                    {/* Increase */}
                    {/* Flex 0.2 */}
                    <Text
                      allowFontScaling={false}
                      style={styles.countValueText2}
                    >
                      {"(+" +
                        Number(this.props.countDATA.counts[i]).toFixed(0) +
                        ")"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/*  */}
        {/* #Disease data */}
        {/*  */}
        {this.showDiseaseData()}
        
        {/*  */}
        {/* Scroll Disease data */}
        {/*  */}
        <SummaryDisease
                  ref="SummaryDisease"
                  diseaseDATA={this.props.diseaseDATA}
                  lang={this.props.lang}
        />
        <View style={{marginTop: 0,marginBottom:10}}>
              <ScrollView
                horizontal= {true}
                showsHorizontalScrollIndicator= {false}
              >
                <SummaryDisease
                  ref="SummaryDisease"
                  diseaseDATA={this.props.diseaseDATA}
                  lang={this.props.lang}
                />
                <SummaryDisease
                  ref="SummaryDisease"
                  diseaseDATA={this.props.diseaseDATA}
                  lang={this.props.lang}
                />
              </ScrollView>
        </View>

        {/*  */}
        {/* Weather data */}
        {/*  */}
        <View style={styles.weatherBox}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text allowFontScaling={false} style={styles.dataTitle}>
              {this.t("Weather data", this.props.lang)}
            </Text>
            {/* <Switch
              style={[styles.switch, { transform: [{ scaleX: 1.1 }] }]}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={this.state.enabledWeather ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={this.toggleWeather}
              value={this.state.enabledWeather}
            /> */}
          </View>
          <View>
            <Text allowFontScaling={false} style={styles.subTitle}>
              {this.cityName()}
            </Text>
          </View>

          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("TEMPERATURE", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/t.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {Number(this.props.weatherDATA.T).toFixed(0)}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  &deg;C
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("HUMIDITY", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/h.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {Number(this.props.weatherDATA.H).toFixed(0)}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  %
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("RAIN PROBABILITY", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/rpop.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {this.props.weatherDATA.RPOP}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  %
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.dataLabel}>
                {this.t("WIND SPEED", this.props.lang)}
              </Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../../assets/ws.png")}
                />
                <Text allowFontScaling={false} style={styles.valueText}>
                  {this.props.weatherDATA.WS}
                </Text>
                <Text allowFontScaling={false} style={styles.valueUnitText}>
                  m/s
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={{
              flex: 1,
              marginLeft: 5,
              marginTop: 5
            }}
            horizontal={true}
          >
            {this.props.weatherDATA.TPREDS.map((tpred, i) => (
              <TouchableOpacity key={i} style={styles.weatherPredBox}>
                <Text
                  allowFontScaling={false}
                  style={{
                    width: 100,
                    flex: 1,
                    textAlign: "center",
                    fontSize: 11
                  }}
                >
                  {this.props.weatherDATA.DATES[i].substring(5, 13)}
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-start",
                    flexDirection: "row",
                    marginBottom: 3
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: 20,
                      height: 30,
                      fontSize: 16
                    }}
                  >
                    {tpred}
                  </Text>
                  <Text allowFontScaling={false} style={styles.valueUnitText}>
                    &deg;C
                  </Text>
                </View>
                {this.getDayNight(this.props.weatherDATA.DATES[i])}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/*  */}
        {/* Pesticide calendar */}
        {/*  */}
        <View style={styles.calendarBox}>
          <Text allowFontScaling={false} style={styles.dataTitle}>
            {this.t("PESTICIDE CALENDAR", this.props.lang)}
          </Text>
          <Text style={{ marginBottom: -10 }}></Text>

          <CalendarPicker
            onDateChange={this.onPesticidePress}
            // minDate={minDate}
            weekdays={this.calendar_days()}
            months={this.calendar_months()}
            customDatesStyles={this.props.pesticideMarks}
            maxDate={day_now}
            nextTitleStyle={{
              paddingLeft: 20,
              paddingRight: 20,
              fontSize: calendarFontSize,
              marginRight: 25,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "#75ff9a",
              borderRadius: 15,
              overflow: "hidden"
            }}
            previousTitleStyle={{
              paddingLeft: 20,
              marginLeft: 25,
              paddingRight: 20,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: calendarFontSize,
              backgroundColor: "#ff8f9e",
              borderRadius: 15,
              overflow: "hidden"
            }}
            nextTitle={">"}
            previousTitle={"<"}
            scaleFactor={420}
            dayLabelsWrapper={{
              borderTopWidth: 0,
              borderBottomWidth: 0
            }}
            textStyle={{
              fontSize: calendarFontSize
            }}
            disabledDatesTextStyle={{
              fontSize: calendarFontSize
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 50,
    height: 300
  },

  //
  // Weather data
  //
  weatherIcon: {
    width: 30,
    height: 30
  },
  weatherBox: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: "stretch",
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    padding: 5,
    backgroundColor: boxColor
  },
  weatherPredBox: {
    height: 100,
    width: 60,
    marginRight: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderRadius: 15,
    justifyContent: "center",
    padding: 10,
    marginTop: 5,
    marginBottom: 5
  },

  //
  // Environmental data
  //
  enviIcon: {
    width: 40,
    height: 40
  },
  enviBox: {
    flex: 1,
    alignSelf: "stretch",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: boxColor
  },

  //
  // Disease
  //
  diseaseBox: {
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    flex: 1,
    borderRadius: 10,
    backgroundColor: boxColor,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10
  },
  diseaseCropTitle: {
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: "#000000"
  },
  diseaseDataBox: {
    flex: 1
  },
  diseaseNameBox: {
    height: 40,
    flex: 0.4,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#550d80",
    borderRadius: 10
  },
  diseaseAlarmBox: {
    height: 40,
    flex: 0.23,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#550d80",
    borderRadius: 10
  },
  diseaseName: {
    padding: 5,
    fontSize: 14,
    textAlign: "center",
    color: "#ffffff",
    alignItems: "center",
    borderRadius: 10
  },

  //
  // Calendar
  //
  calendarBox: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    backgroundColor: boxColor,
    borderRadius: 10
  },

  //
  // Insect count
  //
  countBox: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    backgroundColor: boxColor,
    borderRadius: 10,
    padding: 5
  },
  countNameBox: {
    height: 35,
    flex: 0.28,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3d3d3d",
    borderRadius: 10
  },
  countAlarmBox: {
    height: 35,
    flex: 0.22,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3d3d3d",
    borderRadius: 10
  },
  countName: {
    padding: 5,
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
    alignItems: "center",
    borderRadius: 10
  },
  countValueText: {
    height: 45,
    flex: 0.15,
    fontSize: 22,
    marginLeft: 5,
    color: "#000000"
  },
  countValueText2: {
    fontSize: 18,
    paddingTop: 2,
    textAlign: "left",
    color: "#000000",
    flex: 0.18,
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "flex-start"
  },
  countColumnTitle: {
    height: 20,
    marginRight: 5,
    textAlign: "left",
    marginTop: 5,
    fontSize: 12,
    color: "#000000"
  },

  dataTitle: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    flex: 1,
    color: "#000000",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  subTitle: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 10,
    // marginTop: 5,
    paddingBottom: 3,
    color: "#000000"
  },

  //
  // Data
  //
  dataLabel: {
    flex: 0,
    height: 18,
    textAlign: "left",
    fontSize: 11,
    color: "#000000"
    // backgroundColor: "#ff0000"
  },
  dataBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    alignSelf: "stretch",
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 3,
    marginTop: 3
  },

  //
  // Values
  //
  valueContainer: {
    flexDirection: "row",
    flex: 1,
    textAlign: "left",
    alignItems: "flex-start"
  },
  valueText: {
    fontSize: 26,
    marginLeft: 5,
    textAlign: "center",
    color: "#000000"
  },
  valueUnitText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    color: "#000000"
  },
  diseaseValueText: {
    fontSize: 26,
    marginLeft: 3,
    color: "#000000"
  },
  diseaseValueUnitText: {
    fontSize: 12,
    marginTop: 5,
    color: "#000000"
  },
  switch: {
    // alignSelf: "flex-end",
    marginLeft: "auto",
    flex: 1,
    marginRight: 10,
    marginTop: -5
  }
});
