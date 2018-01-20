/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 
 * Rio Simatupang
 * October 2017
 */

// Import Libraries
import React, { Component } from 'react';
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, TouchableOpacity, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, List, ListItem } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';
//import PhotoUpload from 'react-native-photo-upload'

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress, ipPortAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

// Import Camera
var ImagePicker = require('react-native-image-picker');

// More info on all the options is below in the README...just some common use cases shown here
var options = {
  title: 'Select Avatar',
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

// Button Action
function buttonAction(button) {
	if (button === 'guess_fruit') {
		Actions.loading_page();
	}
}

// isPotrait
const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

// isLandscape
const isLandscape = () => {
    const dim = Dimensions.get('screen');
    return dim.width >= dim.height;
};

export default class ProfilePage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			profileContentData: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			screenHeight: 0,
			avatarSource: '',
			usernameSession: '',
			tokenSession: ''
		}

		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result)
              	this.setState({
                	usernameSession: resultParsed.usernameSession,
                  	tokenSession: resultParsed.tokenSession
              	});
          	}
	    });

		// Event Listener for orientation changes
	    Dimensions.addEventListener('change', () => {
	        this.setState({
	            orientation: isPortrait() ? 'portrait' : 'landscape'
	        });
	    });

	    // Event Listener for appstate changes
	    AppState.addEventListener('change', (nextAppState) => {
	        this.setState({
	            appState: nextAppState
	        });
	    });
	}

	componentDidMount() {
		// Get Screen Height to Make it Fixed
		const dim = Dimensions.get('screen');
		const fixedHeight = dim.height + 100;

		this.setState({
			screenHeight: fixedHeight // Set Screen Height
		});

		//alert(fixedHeight);
		this.getDisplayProfile();
	}

	// Save Data to Session Storage
	saveDataSession(usernameValue, tokenValue) {
	    let usernameSession = usernameValue;
	    let tokenSession = tokenValue;
	    let dataSession = {
	        usernameSession: usernameSession,
	        tokenSession: tokenSession
	    }

	    AsyncStorage.setItem('usernameTokenSession', JSON.stringify(dataSession));

	    this.setState({
	        usernameSession: usernameSession,
	        tokenSession: tokenSession
	    });

	    //alert('Data tersimpan');
	}

	// Edit Profile Action
	editProfileAction() {
    	Actions.edit_profile_page({}); // go to Edit Profile Page
    }

	// Logout Action
	logoutAction() {
    	this.saveDataSession("tokenLogout", "usernameLogout");

    	Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    }

    // Upload Photo
    uploadPhotoButton() {
    	/**
		 * The first arg is the options object for customization (it can also be null or omitted for default options),
		 * The second arg is the callback which sends object: response (more info below in README)
		 */
		ImagePicker.showImagePicker(options, (response) => {
		  //alert('Response = ', response);

		  if (response.didCancel) {
		    //alert('User cancelled image picker');
		  }
		  else if (response.error) {
		    //alert('ImagePicker Error: ', response.error);
		  }
		  else if (response.customButton) {
		    //alert('User tapped custom button: ', response.customButton);
		  }
		  else {
		    let source = { uri: response.uri, fileName: response.fileName, type: response.type };

		    // You can also display the image using data:
		    // let source = { uri: 'data:image/jpeg;base64,' + response.data };

		    this.setState({
		      avatarSource: source
		    });
		  }
		});
    }

    // Get Display Profile
    getDisplayProfile() {
    	// AsyncStorage - Save Data to Session Storage
	    AsyncStorage.getItem('usernameTokenSession', (error, result) => {
            if (result) {
                let resultParsed = JSON.parse(result);
                let usernameSession = resultParsed.usernameSession;
                let tokenSession = resultParsed.tokenSession;
                
                return fetch(ipPortAddress() + '/api/display_profile', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({
				  	user_id: usernameSession,
				    token: tokenSession,
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		this.setState({profileContentData: responseJson}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
            }
	    });
	}

	// Get the data
	render() {

		return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content style={{minHeight: this.state.screenHeight}}>

		            		<Grid>
					            <Col style={{ backgroundColor: '#233F4A', height: 200, justifyContent: 'center', alignItems: 'center' }}>
					            	<TouchableOpacity onPress={() => {this.uploadPhotoButton()}}>
					            		<Image source = {{uri: ipPortAddress() + this.state.profileContentData.picture + '?token=' + this.state.tokenSession}} style={{width: 150, height: 150}} />
					            	</TouchableOpacity>
					            	{/*<PhotoUpload
					            										   onPhotoSelect={avatar => {
					            										     if (avatar) {
					            										       alert('Image base64 string: ', avatar)
					            										     }
					            										   }}
					            										 >
					            										   <Image
					            										     style={{
					            										       paddingVertical: 30,
					            										       width: 150,
					            										       height: 150,
					            										       borderRadius: 75
					            										     }}
					            										     resizeMode='cover'
					            										     source={{
					            										       uri: 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg'
					            										     }}
					            										   />
					            										 </PhotoUpload>*/}
					            	<Text style={{marginTop: 10, color: '#fff'}}>{this.state.profileContentData.name}</Text>
					            </Col>
					        </Grid>

					        <List>
					            <ListItem style={{justifyContent: 'space-between'}}>
					              <Text>Phone Number</Text>
					              <Text>{this.state.tokenSession}</Text>
					            </ListItem>

					            <ListItem onPress={() => {this.editProfileAction()}}>
					              <Text>List Transactions</Text>
					            </ListItem>

					            <ListItem onPress={() => {this.editProfileAction()}}>
					              <Text>Update Profile</Text>
					            </ListItem>

					            <ListItem>
					              <Text>Term and Conditions</Text>
					            </ListItem>

					            <ListItem>
					              <Text>Privacy Policy</Text>
					            </ListItem>

					            <ListItem onPress={() => {this.logoutAction()}}>
					              <Text>Logout</Text>
					            </ListItem>
					        </List>
						
						</Content>

		            </ScrollView>

		        

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = ProfilePage;