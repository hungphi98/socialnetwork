import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Button, AsyncStorage, Platform, Image, TouchableOpacity } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob';

const storage = firebase.storage();


export default class TextPost extends React.Component {
  state = { post_title : "", post_content: '', errorMessage: null,user: "",  location: {}, isText: true }
  constructor(props){
      super(props);
      this._retrieveData();
      this.ref = firebase.firestore().collection('posts');
  }
  componentDidMount(){
      navigator.geolocation.getCurrentPosition(
          position => {
              alert(position.coords.latitude);
              const location = {
                  longitude: position.coords.longitude,
                  latitude: position.coords.latitude
              }
              this.setState({ location });
          },
          error => alert(error.message),
          { enableHighAccuracy: false, timeout: 50000}
      );
  }
  writePost = () => {
      var {post_title, post_content, errorMessage, user,location, isText} = this.state;

      this.ref.add({
          body: {
              content: post_content,
              title : post_title,
          },
          isText : isText,
          user: user,
          vote : {
              upvote: 1,
              downvote: 0
          },
          location: new firebase.firestore.GeoPoint(location.latitude, location.longitude),
          time: new Date().getTime()
      }).then((data)=>{
          console.log("Upload successfully")
          //success callback
      }).catch((error)=>{
          //error callback
          console.log(error)
      });
      this.props.navigation.navigate('routeMain');
  }
  clearText = () => {
    //not yet written
  }

  handleTextPost = () =>{
      this.setState({isText: true});
      this.writePost();
  }
  _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('user');
            if (value !== null) {
                // We have data!!
                this.setState({user: value});
            }
        } catch (error) {
            alert(error);
            // Error retrieving data
        }
  };
  render() {
    return (
      <View style={{ width: '100%', flex: 1, flexDirection: 'column' }}>

        <View style={{ flexDirection: 'row', height: 30, backgroundColor: 'whitesmoke' }}>

          <View style={{ flex: 1, height: '100%' }}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeSelector') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='arrow-left'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 8, height: '100%' }}>
            <Text style={styles.header}>Create Text Post</Text>
          </View>

        </View>

        <Text style={styles.header}>What did you hear?</Text>
        <View style={styles.container}>
          <TextInput
            multiline
            style={styles.textbox}
            placeholder=""
            autoCapitalize="none"
            numberOfLines={5}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.1}
            onChangeText={post_content => this.setState({ post_content })}
          />

          <View style={{ flex: 1, flexDirection: 'row', width: "100%", margin: 20}}>
            <View style={{ flex: 1, padding: 10 }}>
              <Button style={ styles.button } title="Post!" color="#4C9A2A" onPress = {this.handleTextPost} />
            </View>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  button : {
    marginLeft: 10,
    marginRight: 10,
  },
  header : {
    fontSize: 18,
    color: '#4C9A2A',
    marginLeft: 20,
    marginTop: 5,
    flex: 1,
  },
  container : {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 15,
  },
  textbox : {
    height: 40,
    fontSize:20,
    width: '90%',
    borderColor: '#9b9b9b',
    borderBottomWidth: 1,
    marginTop: 8,
    marginVertical: 15
  }
});
