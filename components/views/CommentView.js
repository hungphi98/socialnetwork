import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage } from 'react-native';
import {Card, ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
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
  },
  content: {
      fontSize: 12,
      paddingBottom: 20,
  },
  button : {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
});
export default class Focus extends React.Component {
    constructor(){
        super();
        this.post_ref = firebase.firestore().collection('posts');
        this.comment_ref = firebase.firestore().collection('comments');
        this.user_post = firebase.firestore().collection('user_post');
        this.state = {content: "HELLO EVERYONE",post_content: "",post_id : "", user: ""}
        this._retrieveData();
    }
    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({user:val})
          }).then(res=>{
              this.console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });

    };

    componentDidMount(){
        return AsyncStorage.getItem('comment').then(val=>{
            const item = JSON.parse(val);
            this.setState({post_content: item.content, post_id: item.post_id});
        })
    }

    postComment = () => {

        const {content, post_content, post_id, user} = this.state;
        this.comment_ref.add({
            user: user,
            post_id: post_id,
            content: content,
            upvote: 1,
            downvote: 0,
            parent_id: "",
            date: new Date().getTime().toString(),
        }).then(data=>{
            this.user_ref.add({
                post : data.id,
                user: user,
                isUpvote: true
            });

        }).catch(err=> console.log(err));
    }

    render() {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1, padding: 10 }}>
          <Button style={ styles.button } title="Comment!" color="#4C9A2A" onPress = {this.postComment} />
        </View>
        </View>
      );
    }
}
