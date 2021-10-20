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
  AlertIOS
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

export default class TrapImage extends Component {
  //
  //  Copies function from parent
  //
  hideTrapImagePopup = () => {
    this.props.hideTrapImagePopup?.();
  };

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.props.showTrapImagePopup}
        >
          <View
            style={styles.popupBox}
            // onPress={this.props.hideTrapImagePopup}
          >
            <View
              style={{
                backgroundColor: "rgba(217,217,217,1)",
                height: 380,
                width: 400,
                borderRadius: 10,
                padding: 10,
                justifyContent: "center"
              }}
            >
              <ImageViewer
                style={{
                  alignSelf: "center",
                  height: 250,
                  width: 340,
                  marginTop: 10
                }}
                backgroundColor={"rgba(217,217,217,1)"}
                imageUrls={[
                  {
                    url: this.props.imageURL
                  }
                ]}
              />

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.cancelBtn}
                title="CLOSE"
                onPress={() => {
                  this.props.hideTrapImagePopup();
                }}
              >
                <Text allowFontScaling={false} style={{ color: "white" }}>
                  CLOSE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  popupTextLarge: {
    fontSize: 20,
    textAlign: "left",
    fontWeight: "bold"
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

  cancelBtn: {
    width: 200,
    marginLeft: 10,
    marginRight: 10,
    height: 50,
    backgroundColor: "#ff0000",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10
  }
});
