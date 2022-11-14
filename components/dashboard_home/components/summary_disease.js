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
  AlertIOS
} from "react-native";
import { TRANSLATIONS_ZH } from "../../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../../translations/en/translations";

const alarmColors = ["#489147", "#0000ff", "#ff7930", "#ffc72b", "#ff0000"];
const alarmNames = ["LOW", "GUARDED", "MODERATE", "HIGH", "SEVERE"];
const boxColor = "#f7f7f7";

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_disease_info = base_url + "get_disease_info.php";

export default class SummaryDisease extends Component {
    constructor(props) {
      super(props);
      this.state = {
        inputColor: "white",
        authorizationCode: 0,
        disease: [], //"" to []_2022/11/11
        location: "",
        info: [],
        t_ranges: [],
        humidity: "",
        alarms: [],
        crops: [],
        pesticides: [],
        loaded: 0,
        size: ""
      };
    }
  
    t(myString, language) {
      if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
      else outputString = myString;
      return outputString;
    }

    cropName = (i, lang) => {
        if (lang == "zh") return this.props.diseaseDATA.crops_cn[i];
        else return this.props.diseaseDATA.crops[i];      
    };
    fontSizeENCN2 = () => {
        if (this.props.lang == "zh") return 14;
        else return 12;
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
            { textAlign: "center", fontSize: this.fontSizeENCN2() }
          ]}
        >
          {this.t(alarmNames[Number(d)], this.props.lang)}
          ddfiojs
        </Text>
      </View>
    );
  };

  diseaseName = (disease, lang) => {
    if (lang == "zh") return disease.disease_name_cn;
    else return disease.disease_name;
  };
    
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
                  <View key={i} style={{flex:1}}>
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
                                this.diseaseInfo.fetchDiseaseInfo(
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
                                  // console.log(response.diseases["Tomato"]),
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

render() {
    // {this.showDiseaseData()}
    return (
        <View>
          {this.showDiseaseData()}
            {/* <Text>
                ccc
                {this.props.diseaseDATA.crops[0]}
                {this.state.location}
                dddd
            </Text> */}
        </View>
    )
  }
}

const styles = StyleSheet.create({
  popupTextLarge: {
    fontSize: 20,
    fontWeight: "bold"
  },

  popupBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    // alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
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
  pesticideBox: {
    height: 300,
    backgroundColor: "#ff0000",
    width: 300
  },
  countColumnTitle: {
    height: 20,
    marginRight: 5,
    textAlign: "left",
    marginTop: 5,
    fontSize: 12,
    color: "#000000"
  },
  countNameBox: {
    height: 30,
    width: 80,
    marginRight: 5,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    color: "#ffffff"
  },

  popupText: {
    fontSize: 16
  },

  inputText: {
    padding: 5
  },

  cancelBtn: {
    marginLeft: 5,
    height: 50,
    width: 125,
    backgroundColor: "#ff0000",

    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  },
  diseaseBox: {
    width: 360, //RWD 只適合iphone 13
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
  valueContainer: {
    flexDirection: "row",
    flex: 1,
    textAlign: "left",
    alignItems: "flex-start"
  },
  enviIcon: {
    width: 40,
    height: 40
  },
});
