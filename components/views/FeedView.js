import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity,  AsyncStorage, Dimensions } from 'react-native';
import { Card } from './Card';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

const win = Dimensions.get('window');
const image_width = win.width - 20;
const image_height = win.width * 0.922 * 0.75;
//these are the calculated values for the width and height of an image post reletive to the screen.

const styles = StyleSheet.create({
  content_container: {
    backgroundColor: '#68bb59',
  },
  content_item: {
    backgroundColor: 'whitesmoke',
    borderRadius: 10,
  },
  content: {
      fontSize: 12,
      paddingBottom: 20,
      marginRight: 20,
      marginTop: 20
  },
  control_button :{
    flex: 1,
    elevation: 10
  },
  title: {
        fontSize: 18,
        borderColor: '#9b9b9b',
        borderBottomWidth: 1,
        marginTop: 20,
        marginRight: 20
  },
  title_image: {
        marginTop: image_height,
        fontSize: 18,
        borderColor: '#9b9b9b',
        borderBottomWidth: 1,
  }
});

export default class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.user_post = firebase.firestore().collection('user_post');
        this.storage = firebase.storage();
        //orderBy: 0 - new, 1: popular, 2: controversial
        //byDate: 0 - today, 1: this week, 2: this month, 3: this year, 4: all time
        this.state = {items: [], images: [], query: null, location: 'unknown', email: "", orderBy : 0, byDate: 0};
        this._retrieveData();
    }

    reload = () =>{
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
                this.unsubscribe = query.limit(20).onSnapshot(this.onCollectionUpdate);
            },
            error => alert(error.message),
            { enableHighAccuracy: false, timeout: 50000}
        );
    }
    componentDidMount() {
        return AsyncStorage.getItem('feed').then(items=>{
            if (items){
                const allposts = JSON.parse(items);
                this.setState({items: allposts});
                console.log("GOT THEM")
            }else{
                this.reload();
            }
        })
    }
    _retrieveData = () =>{
          AsyncStorage.getItem('user').then(val=>{
              this.setState({email:val})
          }).then(res=>{
              console.log("GOT IT")
          }).catch(err=>{
              console.log(err);
          });
    };


    // componentWillUnmount() {
    //     this.unsubscribe();
    // }

    loadImage(path) {
        setTimeout(() => {
        this.storage.ref(path).getDownloadURL()
          .then((url) => {
            this.setState({imgURL: {uri: url}});
          });
      }, 2000);
    }

    upvote = (pid) =>{
        // this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
        //     const items = [];
        //     querySnapshot.forEach(doc=>{
        //         const {isUpvote, post, user} = doc.data();
        //         items.push({
        //             id: doc.id,
        //             isUpvote: isUpvote,
        //             post: post,
        //             user: user
        //         })
        //     })
        //     if (items.length > 0){
        //         const {id,isUpvote, post, user} = items[0];
        //         console.log(user,id,isUpvote, post);
        //         this.user_post.doc(id).update("isUpvote",true);
        //         if (isUpvote == false){
        //             this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(2))
        //         }else{
        //             this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(-1));
        //             this.user_post.doc(id).delete();
        //         }
        //     }else{
        //         console.log(pid,this.state.email)
        //         this.user_post.add({
        //             user: this.state.email,
        //             post: pid,
        //             isUpvote: true
        //         });
        //         this.ref.doc(pid).update("upvote", firebase.firestore.FieldValue.increment(1))
        //     }
        // }).catch(err=>{
        //     console.log(err)
        // });
        // this.state.items.forEach(elem=>{
        //     if (elem.id == pid){
        //         elem.up += 1
        //     }
        // })
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == pid){
                AsyncStorage.getItem(elem.id+"voted").then(val=>{
                    if (val){
                        const value = JSON.parse(val);
                        if (value == true){
                            elem.up -= 1
                            AsyncStorage.removeItem(elem.id + "voted").then(val=>console.log())
                        }else{
                            elem.up += 2
                            AsyncStorage.setItem(elem.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
                        }
                    }else{
                        elem.up += 1
                        AsyncStorage.setItem(elem.id+"voted", JSON.stringify(true)).then(val=>{console.log()})
                    }
                })
            }
        });

        this.setState({items: superitems})
        AsyncStorage.setItem('feed', JSON.stringify(superitems)).then(val=>{
            console.log("SAVE THE FEED")
        })
    }

    downvote= (pid) =>{
        // this.user_post.where('user','==',this.state.email).where('post','==', pid).get().then((querySnapshot)=>{
        //     const items = [];
        //     querySnapshot.forEach(doc=>{
        //         const {isUpvote, post, user} = doc.data();
        //         items.push({
        //             id: doc.id,
        //             isUpvote: isUpvote,
        //             post: post,
        //             user: user
        //         })
        //     })
        //     if (items.length > 0){
        //         const {id,isUpvote, post, user} = items[0];
        //         this.user_post.doc(id).update("isUpvote",false);
        //         if (isUpvote == true){
        //             this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(2))
        //         }else{
        //             this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(-1));
        //             this.user_post.doc(id).delete();
        //         }
        //     }else{
        //         console.log(pid,this.state.email)
        //         this.user_post.add({
        //             user: this.state.email,
        //             post: pid,
        //             isUpvote: false
        //         });
        //         this.ref.doc(pid).update("downvote", firebase.firestore.FieldValue.increment(1))
        //     }
        // }).catch(err=>{
        //     console.log(err)
        // })
        var superitems = this.state.items;
        superitems.forEach(elem=>{
            if (elem.id == pid){
                AsyncStorage.getItem(elem.id+"voted").then(val=>{
                    if (val){
                        const value = JSON.parse(val);
                        console.log(value)
                        if (value == false){
                            elem.down -= 1
                            AsyncStorage.removeItem(elem.id+"voted").then(val=>console.log())
                        }else{
                            elem.down += 2
                            AsyncStorage.setItem(pid+"voted", JSON.stringify(false)).then(val=>{console.log()})
                        }
                    }
                    else{
                        elem.down += 1
                        AsyncStorage.setItem(pid+"voted", JSON.stringify(false)).then(val=>{console.log()})
                    }
                })
            }
        });

        this.setState({items: superitems})
        AsyncStorage.setItem('feed', JSON.stringify(superitems)).then(val=>{
            console.log("SAVE THE FEED")
        })

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

        let docRef = firebase.firestore().collection("posts");

        let query = docRef.where("location", '>', lesserGeopoint).where("location", '<', greaterGeopoint)
        // if (this.state.orderBy == 0){
        //     query = query.orderBy("date","desc").limit(10);
        // }else if (this.state.orderBy == 1){
        //     query = query.orderBy("upvote", "desc")
        // }else if (this.state.orderBy == 2){
        //     query = query.orderBy("downvote","desc")
        // }
        return query;
    }

    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {body, downvote, height, isText, location, time, upvote, user,width} = doc.data();
            items.push({
                user: user,
                post: body.content,
                title: body.title,
                up: upvote,
                isText: isText,
                location: location,
                down: downvote,
                id: doc.id,
                width: image_width,
                time: time,
                height: (height / width) * image_width,
            });

        });
        AsyncStorage.setItem('feed', JSON.stringify(items)).then(val=>{
            console.log("save the feed successfully");
        })
        this.setState({
        items:items
        });

    }

    navigateToComment(post){
        const item = {
            post_id: post.id,
            content: post.title,
        }
        AsyncStorage.setItem('comment', JSON.stringify(item))
        .then(val=> console.log("set successfully")).then(res=> this.props.navigation.navigate('routeComment'))
    }
    navigateToPost(post){
        const items = {
            post_id: post.id,
            title: post.title,
            content: post.post,
            isText: post.isText,
            location: post.location,
            upvote: post.up,
            downvote: post.down,
            user: post.user,
            width: post.width,
            height: post.height,
            time: post.time,
        }
        AsyncStorage.setItem('post', JSON.stringify(items))
        .then((val)=>console.log("set successfully!")).then(res=>this.props.navigation.navigate('routeFocus'))
    }
    render() {
        return (

            <ScrollView contentContainerStyle={{ padding: 0, margin: 0 }}>
            <Button onPress={this.reload} title="RELOAD"/>
                <View containerStyle={{margin: 0, padding: 0, zIndex: 0}} >
                {
                    this.state.items.map((u, i) => {
                        if (u.isText == true){
                            return (
                                <Card>
                                    <View style={{padding: 20}}>
                                        <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                            <Text style={{ fontSize: 24 }}>{u.title}</Text>
                                            <Text style={{ fontSize: 16 }}>{u.post}</Text>
                                            <Text style={{fontSize: 10, color: '#333', paddingBottom: 20}}>Posted at {u.time}, {u.location.latitude}, {u.location.longitude}.</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'row' }}>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10,}} onPress = {() => this.upvote(u.id)}>
                                                <Icon
                                                style={{textAlign: "center"}}
                                                size={25}
                                                name='arrow-circle-up'
                                                color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View>
                                            <Text style={{fontSize: 20, textAlign: 'center', flex: 1, marginTop: 10}}>{u.up - u.down}</Text>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={() => this.downvote(u.id)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='flag'
                                                    color='#c45e5e'
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 3}}></View>
                                    </View>
                                </Card>
                            );
                        }else{
                            return (
                                <Card>
                                    
                                    <TouchableOpacity onPress={()=>this.navigateToPost(u)}>
                                        <View>
                                            <Image
                                                style= {{
                                                    width: u.width,
                                                    height: u.height,
                                                    position: 'absolute',
                                                    borderTopLeftRadius: 7,
                                                    borderTopRightRadius: 7,
                                                }}
                                                source={{uri: u.post}}
                                                resizeMode={"stretch"}
                                            />
                                        </View>
                                        <View style={{ padding: 20, marginTop: u.height }}>
                                            <Text style={{fontSize: 24}}>{u.title}</Text>
                                            <Text style={{fontSize: 10, color: '#333', paddingBottom: 20}}>Posted at {u.time}, {u.location.latitude}, {u.location.longitude}.</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: 'row'}}>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this.upvote(u.id)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-up'
                                                    color='#4C9A2A'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 10}}>{u.up - u.down}</Text>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress = {() => this.downvote(u.id)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='arrow-circle-down'
                                                    color='#4C9A2A'
                                                />

                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='flag'
                                                    color='#c45e5e'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.control_button}>
                                            <TouchableOpacity style={{padding:10}} onPress={()=>this.navigateToComment(u)}>
                                                <Icon
                                                    style={{textAlign: "center"}}
                                                    size={25}
                                                    name='comments'
                                                    color='#333'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{flex: 3}}></View>
                                    </View>
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
