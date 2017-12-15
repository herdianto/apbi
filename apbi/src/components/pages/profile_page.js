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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, List, ListItem } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

/*const buttonPlayList = [
  {
    buttonPlayID: 1,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 2,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 3,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 4,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  }
]*/

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
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: ''
		}

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

	async componentDidMount() {
		//this.getData();

		const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
        const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');

        // Check token if file exists
        if (fileTokenExists == true && fileUsernameExists == true) {
            this.checkToken();
        }
	}

	// Write Token File
	async writeTokenFileLogout() {
	    const tokenValueContents = "tokenLogout";
	    const usernameValueContents = "usernameLogout";

	    await FileSystem.writeToFile('tokenFile.txt', tokenValueContents.toString());
	    await FileSystem.writeToFile('usernameFile.txt', usernameValueContents.toString());
	    
	    //await FileSystem.writeToFile('tokenFile.txt', fileContents.toString(), FileSystem.storage.important); //exclude file from the backup
	    //alert('file is written');
	}

	// Write Token File
	async writeTokenFile(tokenValue, usernameValue) {
	    const tokenValueContents = tokenValue;
	    const usernameValueContents = usernameValue;

	    await FileSystem.writeToFile('tokenFile.txt', tokenValueContents.toString());
	    await FileSystem.writeToFile('usernameFile.txt', usernameValueContents.toString());
	    
	    //await FileSystem.writeToFile('tokenFile.txt', fileContents.toString(), FileSystem.storage.important); //exclude file from the backup
	    //alert('file is written');
	}

	// Check Token
    async checkToken() {
    	const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
    	const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

		return fetch('http://' + ipAddress() + ':' + portAddress() + '/api/refresh_token', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		    token: tokenValueContents,
		  })
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		//alert(JSON.stringify(responseJson));

    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

    		if (responseJson.message == "Successful") {
    			//alert("Successful");

    			this.writeTokenFile(responseJson.token, responseJson.profile.user_id); // write token to file

    			//Actions.tabbar({type:ActionConst.RESET});

    			//Actions.tabbar({usernameLogin: usernameValueContents});
    			//Actions.home({usernameLogin: usernameValueContents});
    			//Actions.home_page({usernameLogin: usernameValueContents}); // go to Home Page directly without Login

    			this.setState({
		            //usernameLogin: usernameValueContents
		            usernameLogin: responseJson.profile.user_id
		        });
    		} else if (responseJson.message == "Token is no longer valid") {
    			alert(responseJson.message);

    			Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    		} else {
    			alert("Please Login");

    			Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Edit Profile Action
	editProfileAction() {
    	Actions.edit_profile_page({}); // go to Edit Profile Page
    }

	// Logout Action
	logoutAction() {
    	this.writeTokenFileLogout();

    	Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    }

	// Get the data
	render() {

		// Display Array
		/*let buttonPlayButtons = buttonPlayList.map(buttonPlayInfo => {
	      return (
	              <CardItem key={buttonPlayInfo.buttonPlayID}>
	                <Button transparent style={{width: 340}}>
			            <Text onPress={buttonPlayInfo.buttonPlayURL}>{buttonPlayInfo.buttonPlayTitle}</Text>
			        </Button>
	              </CardItem>
	      )
	    });*/

	    // Display Single Value
	    /*let buttonPlayButton = () => {
	    	if (Platform.OS === 'ios') {
		    	if (this.state.orientation == 'portrait') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	}
	    	} else {
	    		if (this.state.orientation == 'portrait') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	}
	    	}
	    	
	    }*/

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		<Grid>
					            <Col style={{ backgroundColor: '#233F4A', height: 200, justifyContent: 'center', alignItems: 'center' }}>
					            	<Image source={require('../../logo/profile_picture.png')} style={{width: 150, height: 150}} />
					            	<Text style={{marginTop: 10, color: '#fff'}}>{this.state.usernameLogin}</Text>
					            </Col>
					        </Grid>

					        <List>
					            <ListItem>
					              <Text>Phone Number</Text>
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