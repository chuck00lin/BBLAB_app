//
// Mark pesticide calendar
// Version history: 1.0
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
  Alert
} from "react-native";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";
import moment from "moment";
import DateTimePicker from '@react-native-community/datetimepicker';
//import DatePicker from 'rsuite/DatePicker';


var radio_colors = ["#ff0000", "#000000"];

//
// URLS
//
const base_url = "http://140.112.94.123:20000/PEST_DETECT_TEST/_app/";
const URL_savePesticideDate = base_url + "save_pesticide_calendar.php";

import { TRANSLATIONS_ZH } from "../../translations/zh/translations";
import { TRANSLATIONS_EN } from "../../translations/en/translations";

export default class PesticideMark extends Component {
  constructor() {
    super();
    this.state = {
      radioValue: 1
    };
  }

  t(myString, language) {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  }

  //
  //  Copies function from parent
  //
  hidePesticideMarkPopup = () => {
    this.props.hidePesticideMarkPopup?.();
  };

  setValue = (obj, i) => {
    this.setState({ radioValue: obj.value });
  };

  notifyMessage(msg: string) {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  }

  getRadioProps = lang => {
    var radio_props = [
      { label: "Sprayed pesticides", value: 0 },
      { label: "Did not spray pesticides", value: 1 }
    ];
    console.log(lang);
    if (lang == "en") {
      radio_props = [
        { label: "Sprayed pesticides", value: 0 },
        { label: "Did not spray pesticides", value: 1 }
      ];
    }
    if (lang == "zh") {
      radio_props = [
        { label: "已施藥", value: 0 },
        { label: "未施藥", value: 1 }
      ];
    }
    return radio_props;
  };

  markCalendarx = () => {
    var location = this.props.selectedLocation;
    var date = this.props.selectedDate;
    var pesticide = this.state.radioValue;

    var thisData = {
      date: date,
      pesticide: pesticide
    };
    this.props.markCalendar(thisData);
    this.props.hidePesticideMarkPopup();

    pesticide = !pesticide ? 1 : 0;

    var thisURL =
      URL_savePesticideDate +
      "?loc=" +
      location +
      "&date=" +
      date +
      "&pesticide=" +
      pesticide;

    fetch(thisURL)
      .then(response => response.json())
      .then(response => {
        var status = response.status;
        if (status == 1) {
          this.notifyMessage("Successful!");
        }
      });
  };
  //test timepicker
  onChangeTemporalDate1 = (e, d) => {
    var typex = e.type;
    if (Platform.OS === "android") {
      if (typex == "set") {
        var datex = new moment(d);
        console.log(datex)
      }
    } else {
      var datex = new moment(d);
      console.log(datex)
    }
  };

  //end

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showPesticideMarkPopup}
        >
          <View
            style={styles.popupBox}
            onPress={this.props.hidePesticideMarkPopup}
          >
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                height: 250,
                width: 300,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <Text allowFontScaling={false} style={styles.popupTextLarge}>
                {this.t("Mark pesticide calendar", this.props.lang)}
              </Text>
              
              <View
                style={{flex: 1,
                flexDirection: "row",
                alignItems: "center"
              }}
              >
                <Text allowFontScaling={false} style={{fontSize: 18}}>
                  {this.t("DATE", this.props.lang)}: {this.props.selectedDate}
                </Text>
                <View>
                  <DateTimePicker 
                      
                      value={new Date(this.props.selectedDate)}
                      display="default"
                      mode="time"
                      is24Hour={true}
                      onChange={this.onChangeTemporalDate1}
                      style={{
                        width: 80,
                        height: 45,
                        color: "white",
                      }}
                  />
                </View>

              </View>

              <RadioForm formHorizontal={false} initial={1} animation={true}>
                {this.getRadioProps(this.props.lang).map((obj, i) => (
                  <RadioButton labelHorizontal={true} key={i}>
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.radioValue == i}
                      onPress={value => {
                        this.setValue({ value });
                      }}
                      borderWidth={1}
                      buttonInnerColor={radio_colors[i]}
                      buttonOuterColor={"#000"}
                      buttonSize={15}
                      buttonOuterSize={25}
                      buttonStyle={{}}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={value => {
                        this.setValue({ value });
                      }}
                      labelStyle={{ fontSize: 16 }}
                      labelWrapStyle={{ marginBottom: 15 }}
                    />
                  </RadioButton>
                ))}
              </RadioForm>
              {/* <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    backgroundColor: "#ffffff",
                    borderRadius: 25
                  }}
                >
                  <DateTimePicker
                    value={new Date(this.props.selectedDate)}
                    // minimumDate={new Date(1598051730000)}
                    // maximumDate={
                    //   new Date(this.state.temporalDateSelectedValue2.valueOf())
                    // }
                    display="default"
                    mode="time"
                    is24Hour={true}
                    onChange={this.onChangeTemporalDate1}
                    style={{
                      width: 180,
                      height: 45,
                      color: "white",
                      backgroundColor: "#ffffff"
                    }}
                  />
              </View> */}

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
                  title="CONFIRM"
                  onPress={() => {
                    this.markCalendarx();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CONFIRM", this.props.lang)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.cancelBtn}
                  title="CANCEL"
                  onPress={() => {
                    this.props.hidePesticideMarkPopup();
                  }}
                >
                  <Text allowFontScaling={false} style={{ color: "white" }}>
                    {this.t("CANCEL", this.props.lang)}
                  </Text>
                </TouchableOpacity>
                
{/* 
                <TouchableOpacity 
                  style={styles.confirmBtn} 
                  //onPress={this.showTimepicker }
                  //onPress={function(){ console.log('按到我了')}}
                >
                  <Text style={styles.buttonText}> TouchableOpacity Button </Text>
                </TouchableOpacity> */}


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
    fontSize: 17,
    textAlign: "left",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10
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
    fontSize: 18,
    marginBottom: 15
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
