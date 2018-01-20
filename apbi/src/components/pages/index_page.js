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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress, ipPortAddress } from '../../helpers/helpers';

// Import Themes
import getTheme from '../../themes/components';
import apbiTheme from '../../themes/variables/apbiTheme';

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

export default class IndexPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			currentCount: 1,
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

	// Load Data after Rendering
	componentDidMount() {
		// Set timer before going to Login Page
	    this._interval = setInterval(() => {
	        this.timerMine();
	    }, 1000);
	}

	// Unmount the variable
	componentWillUnmount() {
		// When a component unmounts, these timers have to be cleared and
	    // so that you are not left with zombie timers doing things when you did not expect them to be there.
	    clearInterval(this._interval);
	}

	// Set time count from 3 2 1
	timerMine() {
	    var newCount = this.state.currentCount - 1;

	    if (newCount >= 0) {
	      this.setState({
	        currentCount: newCount
	      })

	      if (newCount == 0) {
	      	this.checkToken(); // Check Token
	      }
	    } else {
	      clearInterval(this._interval);
	    }
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
	}

	// Check Token
    checkToken() {
    	return fetch(ipPortAddress() + '/api/refresh_token', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		    token: this.state.tokenSession,
		  })
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		if (responseJson.message == "Successful") {
    			alert("Successful");

    			this.saveDataSession(responseJson.profile.user_id, responseJson.token); // Save Data to Session Storage

    			Actions.tabbar({usernameLogin: this.state.tokenSession});
    			Actions.home_page({usernameLogin: this.state.tokenSession}); // go to Home Page directly without Login
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

	// Get the data
	render() {

	    return (

			// Display
		      <StyleProvider style={getTheme(apbiTheme)}>
		        <Container>
		        	<Content contentContainerStyle={{flex: 1, backgroundColor: '#233F4A', justifyContent: 'center', alignItems: 'center'}}>
		        		<Image source={require('../../logo/apbi_logo.png')} style={{width: 150, height: 150}} />
		        		
		        	</Content>
		        </Container>
		      </StyleProvider>
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = IndexPage;