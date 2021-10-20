import React, { Component } from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Image
} from "react-native";
import {
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
  VictoryBar,
  VictoryLabel
} from "victory";

const alarmColors = ["#489147", "#0000ff", "#ff7930", "#ffc72b", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];

export default class DashboardSummaryBox extends Component {
  constructor() {
    super();
    this.state = {
      enabledWeather: true
    };
  }

  getDayNight = d => {
    d = d.substring(11, 13);
    if (Number(d) <= 12) {
      return (
        <Image
          style={styles.weatherIcon}
          source={require("../assets/day.png")}
        />
      );
    } else {
      return (
        <Image
          style={styles.weatherIcon}
          source={require("../assets/night.png")}
        />
      );
    }
  };

  diseaseAlarmBox = d => {
    return (
      <View
        style={[
          styles.diseaseNameBox,
          { backgroundColor: alarmColors[Number(d)] }
        ]}
      >
        <Text
          style={[styles.diseaseName, { textAlign: "center", fontSize: 11 }]}
        >
          {alarmNames[Number(d)]}
        </Text>
      </View>
    );
  };

  toggleWeather = () => {
    this.setState({ enabledWeather: !this.state.enabledWeather });
  };

  render() {
    const getCurrentDate = () => {
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      var date = new Date().getDate();
      var month = months[new Date().getMonth() + 1];
      var year = new Date().getFullYear();
      return month + " " + date + ", " + year;
    };

    return (
      <View>
        {/*  */}
        {/* Environmental data */}
        {/*  */}
        <View style={styles.enviBox}>
          <View style={{ flexDirection: "row", height: 25 }}>
            <Text style={styles.dataTitle}>Environmental data</Text>
          </View>
          <Text style={styles.subTitle}>{getCurrentDate()}</Text>
          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>TEMPERATURE</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/t.png")}
                />
                <Text style={styles.valueText}>{this.props.sensorDATA.T}</Text>
                <Text style={styles.valueUnitText}>&deg;C</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>HUMIDITY</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/h.png")}
                />
                <Text style={styles.valueText}>{this.props.sensorDATA.H}</Text>
                <Text style={styles.valueUnitText}>%</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>LIGHT INTENSITY</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/l.png")}
                />
                <Text style={styles.valueText}>{this.props.sensorDATA.L}</Text>
                <Text style={styles.valueUnitText}>lux</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --------------- */}
        {/* Insect count */}
        {/* --------------- */}
        <View style={styles.countBox}>
          <Text style={styles.dataTitle}>Insect count data</Text>
          <View
            style={{
              width: 250,
              height: 260,
              marginLeft: 10,
              backgroundColor: "#ff000"
            }}
          >
            <VictoryChart
              height={250}
              padding={{ left: 65, bottom: 50, top: 25, right: 75 }}
              theme={VictoryTheme.material}
              // domainPadding={{ x: 1.5 }}
            >
              <VictoryAxis
                // label="Insect"
                tickValues={[0, 1, 2, 3, 4, 5, 6, 7]}
                // axisLabelComponent={<VictoryLabel dy={-40} />}

                tickFormat={this.props.countDATA.species}
              />
              <VictoryAxis
                dependentAxis
                axisLabelComponent={<VictoryLabel dy={20} />}
                label="Count"
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 }
                }}
              />
              <VictoryBar
                horizontal
                style={{
                  data: { fill: "#c43a31" }
                }}
                barRatio={0.8}
                labels={this.props.countDATA.total_counts}
                data={this.props.countDATA.total_counts}
              />
            </VictoryChart>
          </View>
        </View>

        {/*  */}
        {/* #Disease data */}
        {/*  */}
        <View style={styles.diseaseBox}>
          <View style={{ flexDirection: "row", height: 25 }}>
            <Text style={styles.dataTitle}>Disease data</Text>
          </View>

          {/* Get per crop  */}
          {this.props.diseaseDATA.crops.map((crop, i) => {
            return (
              <View key={i} style={styles.diseaseDataBox}>
                <View style={{ flexDirection: "row", height: 25 }}>
                  <Text style={styles.diseaseCropTitle}>{crop}</Text>
                </View>

                {/* Get disease per crop  */}
                {this.props.diseaseDATA.diseases[crop].map((disease, j) => {
                  return (
                    //  Disease name
                    <View
                      key={j}
                      style={{ flex: 1, height: 60, marginLeft: 15 }}
                    >
                      <Text
                        style={[
                          styles.dataLabel,
                          { textTransform: "uppercase" }
                        ]}
                      >
                        {disease.disease_name}
                      </Text>

                      <View style={styles.valueContainer}>
                        {/* Disease acronym */}
                        <View style={styles.diseaseNameBox}>
                          <Text style={styles.diseaseName}>
                            {disease.disease_acronym}
                          </Text>
                        </View>

                        {/* Disease alarm */}
                        {this.diseaseAlarmBox(disease.alarm)}

                        {/* DSV */}
                        <Text style={styles.valueText}>
                          {Number(disease.dsv3).toFixed(2)}
                        </Text>
                        <Text style={styles.valueUnitText}>%</Text>

                        {/* Information */}
                        <TouchableOpacity>
                          <Image
                            style={[styles.enviIcon, { marginLeft: 10 }]}
                            source={require("../assets/info.png")}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        {/*  */}
        {/* Weather data */}
        {/*  */}
        <View style={styles.weatherBox}>
          <View style={{ flexDirection: "row", height: 10 }}>
            <Text style={styles.dataTitle}>Weather data</Text>
            <Switch
              style={[styles.switch, { transform: [{ scaleX: 1.1 }] }]}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={this.state.enabledWeather ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={this.toggleWeather}
              value={this.state.enabledWeather}
            />
          </View>
          <View>
            <Text style={styles.subTitle}>{this.props.city}</Text>
          </View>

          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>TEMPERATURE</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/t.png")}
                />
                <Text style={styles.valueText}>
                  {Number(this.props.weatherDATA.T).toFixed(0)}
                </Text>
                <Text style={styles.valueUnitText}>&deg;C</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>HUMIDITY</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/h.png")}
                />
                <Text style={styles.valueText}>
                  {Number(this.props.weatherDATA.H).toFixed(0)}
                </Text>
                <Text style={styles.valueUnitText}>%</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>RAIN PROBABILITY</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/rpop.png")}
                />
                <Text style={styles.valueText}>
                  {this.props.weatherDATA.RPOP}
                </Text>
                <Text style={styles.valueUnitText}>%</Text>
              </View>
            </View>
          </View>

          <View style={[styles.dataBox, { flexDirection: "row" }]}>
            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <Text style={styles.dataLabel}>WIND SPEED</Text>
              <View style={styles.valueContainer}>
                <Image
                  style={styles.enviIcon}
                  source={require("../assets/ws.png")}
                />
                <Text style={styles.valueText}>
                  {this.props.weatherDATA.WS}
                </Text>
                <Text style={styles.valueUnitText}>m/s</Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={{
              height: 20,
              marginTop: 15,
              marginLeft: 15
            }}
            horizontal={true}
          >
            {this.props.weatherDATA.TPREDS.map((tpred, i) => (
              <TouchableOpacity key={i} style={styles.weatherPredBox}>
                <Text
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
                    style={{
                      width: 20,
                      height: 30,
                      fontSize: 18
                    }}
                  >
                    {tpred}
                  </Text>
                  <Text style={styles.valueUnitText}>&deg;C</Text>
                </View>
                {this.getDayNight(this.props.weatherDATA.DATES[i])}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    height: 280,
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    borderRadius: 10
  },
  weatherPredBox: {
    height: 100,
    width: 60,
    marginRight: 10,
    backgroundColor: "#eeeeee",
    alignItems: "center",
    borderRadius: 15,
    justifyContent: "center",
    padding: 10,
    marginTop: 5
  },

  //
  // Environmental data
  //
  enviIcon: {
    width: 40,
    height: 40
  },
  enviBox: {
    height: 110,
    alignSelf: "stretch",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    borderRadius: 10
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
    borderRadius: 10
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
    width: 80,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#550d80",
    borderRadius: 10
  },
  diseaseName: {
    padding: 5,
    fontSize: 20,
    textAlign: "center",
    color: "#ffffff",
    alignItems: "center",
    borderRadius: 10
  },

  //
  // Insect count
  //
  countBox: {
    height: 260,
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
  },
  subTitle: {
    height: 15,
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
    height: 60,
    alignSelf: "stretch",
    marginLeft: 5,
    marginRight: 5,
    padding: 10,
    borderRadius: 10,
    // backgroundColor: "#fff9c9",
    // backgroundColor: "#f0f0f0",
    borderColor: "#000000"
    // borderWidth: 2,
  },

  //
  // Values
  //
  valueContainer: {
    flexDirection: "row",
    flex: 1,
    height: 30,
    marginBottom: -30,
    textAlign: "left",
    alignItems: "flex-start"
  },
  valueText: {
    height: 45,
    fontSize: 26,
    marginLeft: 5,
    textAlign: "center",
    color: "#000000"
  },
  valueUnitText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    color: "#000000"
  },
  switch: {
    // alignSelf: "flex-end",
    marginLeft: "auto",
    height: 20,
    marginRight: 5,
    marginTop: 3
  }
});
