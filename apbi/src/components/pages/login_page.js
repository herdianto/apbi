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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, TextInput, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
import DeviceInfo from 'react-native-device-info';

//var DeviceInfo = require('react-native-device-info');
//import HideableView from 'react-native-hideable-view';

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

export default class LoginPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameValue: "",
			passwordValue: "",
			errorMessage: "",
			loginMessage: "",
			tokenValueContentsState: "",
			isTokenExpired: "",
			fixedMarginTop: 0,
			deviceUniqueIDValue: DeviceInfo.getUniqueID(),
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
		// Get Screen Height to Make it Fixed
		const dim = Dimensions.get('screen');
		const fixedHeight = dim.height;

		if (fixedHeight > 0 && fixedHeight <= 534) {
			var fixedMarginTopFinal = 30;
		} else {
			var fixedMarginTopFinal = 100;
		}

		this.setState({
			fixedMarginTop: fixedMarginTopFinal // Set Margin Top
		});

		//alert(fixedHeight);
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

	// Login Action
	loginAction(usernameValue, passwordValue, deviceUnique_idValue) {
    	if (usernameValue == "") {
    		this.usernameTxt._root.focus();
    		this.setState({errorMessage: "Your username is empty"})
    	} else if (passwordValue == "") {
    		this.passwordTxt._root.focus();
    		this.setState({errorMessage: "Your password is empty"})
    	} else {
    		this.getLoginResponse(usernameValue, passwordValue, deviceUnique_idValue); // Get Login Response
    	}
    }

    // Get Login Response
    getLoginResponse(usernameValue, passwordValue, deviceUnique_idValue) {
		return fetch(ipPortAddress() + '/login', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		    username: usernameValue,
		    password: passwordValue,
		    device_id: deviceUnique_idValue
		  })
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		if (responseJson.message == "Successful") {

    			this.saveDataSession(usernameValue, responseJson.token); // Save Data to Session Storage
    			
	    		Actions.tabbar({usernameLogin: this.state.tokenSession});
    			Actions.home_page({usernameLogin: this.state.tokenSession}); // go to Home Page

	    		this.usernameTxt._root.clear();
		    	this.state.usernameValue = ""

		    	this.passwordTxt._root.clear();
		    	this.state.passwordValue = ""
    		} else {
    			this.usernameTxt._root.focus();
    			this.setState({errorMessage: "Your username and password are wrong"})
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Read Enter Key
	handleKeyDownUsername(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.usernameValue);
	        this.usernameTxt._root.clear();
	    }
	}

	// Read Enter Key
	handleKeyDownPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.passwordValue);
	        this.passwordTxt._root.clear();
	    }
	}

	// Keyboard Spacer
	myKeyboardSpacer() {
		if (Platform.OS === 'ios') {
		    return <KeyboardSpacer />;
		} else {
			return null;
		}
	}

	// Register Action
	registerAction() {
    	Actions.register_page({}); // go to Register Page
    }

    // Forgot Password Action
	forgotPasswordAction() {
    	Actions.forgot_password_page({}); // go to Forgot Password Page
    }

	// Get the data
	render() {

		// Display Single Value
	    let loginFormButton = () => {
    		return (
	    		<View style={{flex: 1, backgroundColor: '#233F4A'}}>
	        		<View style={{justifyContent: 'center', alignItems: 'center', marginTop: this.state.fixedMarginTop}}>
	        			<Image source={require('../../logo/apbi_logo.png')} style={{width: 150, height: 150}} />
	        		</View>

	        		<Form>
			            <Item floatingLabel>
			              <Label style={{color: '#fff'}}>Username</Label>
			              <Input
			              	style={{color: '#fff'}}
			              	onChangeText={(text) => this.setState({usernameValue: text})}
			            	value={this.state.usernameValue}
			            	keyboardType={'twitter'}
			            	secureTextEntry={false}
			            	maxLength={20}
			            	returnKeyType={'next'}
			            	/*placeholder={'Username'}*/
			            	enablesReturnKeyAutomatically={true}
			            	selectionColor={'#fff'}
			            	placeholderTextColor={'#fff'}
			            	underlineColorAndroid={'transparent'}
			            	/*ref="usernameTxt"*/
			            	getRef={(input) => { this.usernameTxt = input; }}
			            	onKeyPress={this.handleKeyDownUsername.bind(this)}
			              />
			            </Item>

			            <Item floatingLabel last>
			              <Label style={{color: '#fff'}}>Password</Label>
			              <Input
			              	style={{color: '#fff'}}
			              	onChangeText={(text) => this.setState({passwordValue: text})}
	                    	value={this.state.passwordValue}
	                    	keyboardType={'twitter'}
	                    	secureTextEntry={true}
	                    	maxLength={20}
	                    	returnKeyType={'go'}
	                    	/*placeholder={'Password'}*/
	                    	enablesReturnKeyAutomatically={true}
	                    	selectionColor={'#fff'}
	                    	placeholderTextColor={'#fff'}
	                    	underlineColorAndroid={'transparent'}
	                    	/*ref="passwordTxt"*/
	                    	getRef={(input) => { this.passwordTxt = input; }}
	                    	onKeyPress={this.handleKeyDownPassword.bind(this)}
			              />
			            </Item>
			        </Form>

	                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
		                <CardItem key={1} style={{backgroundColor: '#233F4A'}}>
		                <Button block light style={{width: 250}} onPress={() => {this.loginAction(this.state.usernameValue, this.state.passwordValue, this.state.deviceUniqueIDValue)}}>
				            <Text>Login</Text>
				        </Button>
				        </CardItem>

				        <Text style={{color: '#fff', marginBottom: 10}} onPress={() => {this.forgotPasswordAction()}}>Forgot Password</Text>
				        <Text style={{color: '#fff', marginBottom: 10}} onPress={() => {this.registerAction()}}>Register</Text>

				        <Text style={{color: '#fff'}}>{this.state.errorMessage}</Text>
			        </View>

					{/*this.myKeyboardSpacer()*/}
	        	</View>
	    	)	    	
	    }

	    return (

			// Display
		      <StyleProvider style={getTheme(apbiTheme)}>
		        <Container>
		        	{loginFormButton()}
		        </Container>
		      </StyleProvider>
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = LoginPage;