import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem, Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  content_container: {
    backgroundColor: '#68bb59',
    padding: 20,
  },
  content_item: {
    backgroundColor: 'whitesmoke',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  }
});



export default class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.storage = firebase.storage();
        this.state = {items: [], images: [], query: null, location: 'unknown'};

    }
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                }
                console.log(location);
                this.setState({ location });
                var query = this.getDocumentNearBy(1.0);
                this.setState({ query });
                console.log(query);
                this.unsubscribe = query.onSnapshot(this.onCollectionUpdate);
            },
            error => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
        if (this.state.query == null){
            this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        }

        // this.loadImage("images/image.png");
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    loadImage(path) {
        setTimeout(() => {
        this.storage.ref(path).getDownloadURL()
          .then((url) => {
            this.setState({imgURL: {uri: url}});
          });
      }, 2000);
    }
    getDocumentNearBy = (distance) => {
        const lat = 0.0144927536231884;
        const lon = 0.0181818181818182;
        const {longitude, latitude} = this.state.location;
        const lowerLat = latitude - (lat * distance);
        const lowerLon = longitude - (lon * distance);

        const greaterLat = latitude + (lat * distance)
        const greaterLon = longitude + (lon * distance)

        let lesserGeopoint = new firebase.firestore.GeoPoint(lowerLat,lowerLon)
        let greaterGeopoint = new firebase.firestore.GeoPoint(greaterLat, greaterLon)

        let docRef = firebase.firestore().collection("posts")
        let query = docRef.where("location", '>', lesserGeopoint).where("location", '<', greaterGeopoint)
        return query;
    }

    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {body, isText, location, time, user, vote} = doc.data();
            items.push({
                user: user,
                post: body.content,
                up: vote.upvote,
                isText: isText,
                location: location,
                down: vote.downvote
            });
        });
        this.setState({
        items:items
        });
    }

  render() {
    return (
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.items.map((u, i) => {
                  if (u.isText == true){
                      return (
                          <Card>
                          <Text>{u.post}</Text>
                          </Card>
                      );
                  }else{
                      return (
                          <Card>
                          <Image
                            style={{width: 300, height: 200}}
                            source={{uri: u.post}}
                          />
                          </Card>
                      )
                  }

              })
          }
          </View>

        </ScrollView>
    );
  }
}
