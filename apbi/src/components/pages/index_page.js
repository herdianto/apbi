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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress } from '../../helpers/helpers';

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
			currentCount: 1
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
	async timerMine() {
	    var newCount = this.state.currentCount - 1;

	    const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
		const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');

	    if (newCount >= 0) {
	      this.setState({
	        currentCount: newCount
	      })

	      if (newCount == 0) {
	      	// Check token if file exists
			if (fileTokenExists == true && fileUsernameExists == true) {
				this.checkToken();
			} else {
				Actions.login_page({type:ActionConst.RESET}); // go to Login Page
			}

			//Actions.login_page({type:ActionConst.RESET});
	      }
	    } else {
	      clearInterval(this._interval);
	    }
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

	// Read Token File
	/*async readTokenFile() {
	    const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
	    const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

	    this.setState({
	      checkPlayingStatus: fileContents
	    })

	    const checkPath = await FileSystem.absolutePath('tokenFile.txt');
	    
	    alert(checkPath);
	}*/

	/*async checkIfFileExists() {
		const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
		const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');
		const directoryExists = await FileSystem.directoryExists('my-directory/my-file.txt');
		
		console.log(`file exists: ${fileExists}`);
		console.log(`directory exists: ${directoryExists}`);

		alert(`file exists: ${fileTokenExists}`);
	}*/

	// Check Token
    async checkToken() {
    	const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
    	const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

    	if (tokenValueContents == "tokenLogout") {
    		const tokenValueContents = "";
    	}

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
    			alert("Successful");

    			this.writeTokenFile(responseJson.token, responseJson.profile.user_id); // write token to file

    			//Actions.tabbar({type:ActionConst.RESET});

    			Actions.tabbar({usernameLogin: usernameValueContents});
    			//Actions.home({usernameLogin: usernameValueContents});
    			Actions.home_page({usernameLogin: usernameValueContents}); // go to Home Page directly without Login
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