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

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress, ipPortAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

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
			tokenSession: '',
			pageSession: ''
		}

		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result)
              	this.setState({
                	usernameSession: resultParsed.usernameSession,
                  	tokenSession: resultParsed.tokenSession,
                  	pageSession: resultParsed.pageSession
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

		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;

              	if (tokenSession == 'tokenLogout') {
		      		//alert("Please Login");

    				Actions.login_page({pageSession: 'profile_page', type:ActionConst.RESET}); // go to Login Page
		      	} else {
		      		this.getDisplayProfile();
		      	}
            }
        })
	}

	// Save Data to Session Storage
	saveDataSession(usernameValue, tokenValue, pageValue) {
	    let usernameSession = usernameValue;
	    let tokenSession = tokenValue;
	    let pageSession = pageValue;
	    let dataSession = {
	        usernameSession: usernameSession,
	        tokenSession: tokenSession,
	        pageSession: pageSession
	    }

	    AsyncStorage.setItem('usernameTokenSession', JSON.stringify(dataSession));

	    this.setState({
	        usernameSession: usernameSession,
	        tokenSession: tokenSession,
	        pageSession: pageSession
	    });
	}

	// Display Transaction Action
	displayTransactionAction() {
    	Actions.transaction_page({}); // go to Display Transaction Page
    }

    // Change Password Action
	changePasswordAction() {
    	Actions.change_password_page({}); // go to Change Password Page
    }

	// Edit Profile Action
	editProfileAction() {
    	Actions.edit_profile_page({}); // go to Edit Profile Page
    }

    // Contact Us Action
	contactUsAction() {
    	Actions.contact_us_page({}); // go to Contact Us Page
    }

	// Logout Action
	logoutAction() {
    	this.saveDataSession("usernameLogout", "tokenLogout", "profile_page");

    	Actions.login_page({pageSession: 'logout_profile_page', type:ActionConst.RESET}); // go to Login Page
    }

    // Get Display Profile
    getDisplayProfile() {
    	// AsyncStorage - Save Data to Session Storage
	    AsyncStorage.getItem('usernameTokenSession', (error, result) => {
            if (result) {
                let resultParsed = JSON.parse(result);
                let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
                
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

	// Get Profile Picture
    getProfilePicture() {
    	// AsyncStorage - Save Data to Session Storage
	    AsyncStorage.getItem('usernameTokenSession', (error, result) => {
            if (result) {
                let resultParsed = JSON.parse(result);
                let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
                
                return fetch(ipPortAddress() + '/api/images/user/riosimatupang.jpg', {
				  method: 'GET',
				  headers: {
				    'x-token': tokenSession
				  }
				})
				.then((response) => response.text())
		    	.then((responseJson) => {
		    		alert(responseJson);
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

		var profile_picture = this.state.profileContentData.picture ? ipPortAddress() + this.state.profileContentData.picture + '?token=' + this.state.tokenSession : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg';

		return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content style={{minHeight: this.state.screenHeight}}>

		            		<Grid>
					            <Col style={{ backgroundColor: '#233F4A', height: 200, justifyContent: 'center', alignItems: 'center' }}>
					            	<Image source = {{uri: profile_picture}} style={{width: 150, height: 150}} />
					            	<Text style={{marginTop: 10, color: '#fff'}}>{this.state.profileContentData.name}</Text>
					            </Col>
					        </Grid>

					        <List>
					            <ListItem onPress={() => {this.displayTransactionAction()}}>
					              <Text>List Transactions</Text>
					            </ListItem>

					            <ListItem onPress={() => {this.changePasswordAction()}}>
					              <Text>Change Password</Text>
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

					            <ListItem onPress={() => {this.contactUsAction()}}>
					              <Text>Contact Us</Text>
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