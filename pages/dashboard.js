//
// Dashboard
//

import { StatusBar } from "expo-status-bar";
import React, { Component, useEffect, useState } from "react";
import { Text, ScrollView, Button, StyleSheet } from "react-native";
import Select from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { TRANSLATIONS_ZH } from "../translations/zh/translations";
import { TRANSLATIONS_EN } from "../translations/en/translations";

//
// Tabs
//
import DashboardHome from "../tabs/dashboard_home.js";
import DashboardAccount from "../tabs/dashboard_account.js";
import DashboardData from "../tabs/dashboard_data.js";

export default function Dashboard({ navigation }) {
  const [lang, setLanguage] = useState("en");

  const languageResetter = async () => {
    await AsyncStorage.getItem("language").then(value => {
      setLanguage(value);
      console.log(value);
    });
  };
  // const usernameResetter = async () => {
  //   await AsyncStorage.getItem("username").then(value => {
  //     console.log(value);
  //   });
  // };
  useEffect(() => {
    languageResetter();
    // usernameResetter();.
  });
  const t = (myString, language) => {
    if (language == "zh") var outputString = TRANSLATIONS_ZH[myString];
    else outputString = myString;
    return outputString;
  };

  const Tab = createMaterialBottomTabNavigator();

  return (
    <Tab.Navigator
      backBehavior="initalRoute"
      activeColor="#327529"
      inactiveColor="#cccccc"
      inactiveBackgroundColor="#327529"
      barStyle={{ backgroundColor: "#ffffff" }}
    >
      <Tab.Screen
        name="DashboardHome"
        children={() => (
          <DashboardHome
            navigation={navigation}
            languageResetter={languageResetter}
            lang={lang}
          />
        )}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            navigation.navigate("DashboardHome", {});
            // AsyncStorage.setItem("updateDataAnalysis", "0");
          }
        })}
        options={{
          tabBarColor: "#ffffff",
          tabBarLabel: (
            <Text allowFontScaling={false} style={{ fontSize: 10 }}>
              {t("Home", lang)}
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          )
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="DashboardData"
        children={() => (
          <DashboardData
            navigation={navigation}
            languageResetter={languageResetter}
            lang={lang}
          />
        )}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            AsyncStorage.setItem("updateDataAnalysis", "1");
          }
        })}
        options={{
          tabBarColor: "#ffffff",
          tabBarLabel: (
            <Text allowFontScaling={false} style={{ fontSize: 10 }}>
              {t("Data analysis", lang)}
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="google-analytics"
              color={color}
              size={26}
            />
          )
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="DashboardAccount"
        children={() => (
          <DashboardAccount
            navigation={navigation}
            languageResetter={languageResetter}
          />
        )}
        options={{
          tabBarColor: "#ffffff",
          tabBarLabel: (
            <Text allowFontScaling={false} style={{ fontSize: 10 }}>
              {t("Account", lang)}
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          )
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 50,
    height: 300
  }
});
