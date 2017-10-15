/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 
 * Rio Simatupang
 * 2017
 */

// Import Libraries
import React, { Component } from 'react';
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, TextInput } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';

// Import My Own Libraries
import { hello, getImage, contentSnippet } from '../../helpers/helpers';

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
			currentCount: 3,
			usernameValue: "",
			passwordValue: "",
			errorMessage: ""
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
	timerMine() {
	    var newCount = this.state.currentCount - 1;

	    if (newCount >= 0) {
	      this.setState({
	        currentCount: newCount
	      })

	      if (newCount == 0) {
	        //Actions.home_page(); // go to Login Page
	      }
	    } else {
	      clearInterval(this._interval);
	    }
	}

	loginAction(usernameValue, passwordValue) {
    	if (usernameValue == "") {
    		this.refs.usernameTxt.focus();
    		this.setState({errorMessage: "Your username is empty"})
    	} else if (passwordValue == "") {
    		this.refs.passwordTxt.focus();
    		this.setState({errorMessage: "Your password is empty"})
    	} else {
    		if (usernameValue == 'herdi' && passwordValue == 'herdi') {
    			//alert(usernameValue + " - " + passwordValue);

	    		Actions.home_page(); // go to Login Page

	    		this.refs.usernameTxt.clear();
		    	this.state.usernameValue = ""

		    	this.refs.passwordTxt.clear();
		    	this.state.passwordValue = ""
    		} else {
    			this.setState({errorMessage: "Your username and password are wrong"})
    		}
    	}
    }

	handleKeyDownUsername(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.usernameValue);
	        this.refs.usernameTxt.clear();
	    }
	}

	handleKeyDownPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.passwordValue);
	        this.refs.passwordTxt.clear();
	    }
	}

	myKeyboardSpacer() {
		if (Platform.OS === 'ios') {
		    return <KeyboardSpacer />;
		} else {
			return null;
		}
	}

	// Get the data
	render() {

	    return (

			// Display
		      <StyleProvider style={getTheme(apbiTheme)}>
		        <Container>
		        	<Content contentContainerStyle={{flex: 1, backgroundColor: '#233F4A', justifyContent: 'center', alignItems: 'center'}}>
		        		<Image source={require('../../logo/apbi.png')} />

		        		<TextInput
	                    	style={{height: 30, width:250, borderColor: '#FFF070', borderWidth: 1, color: '#FFF070', fontSize: 12, padding: 5, marginTop: 10}}
	                    	onChangeText={(text) => this.setState({usernameValue: text})}
	                    	value={this.state.usernameValue}
	                    	keyboardType={'email-address'}
	                    	secureTextEntry={false}
	                    	maxLength={10}
	                    	returnKeyType={'done'}
	                    	placeholder={'Username'}
	                    	enablesReturnKeyAutomatically={true}
	                    	selectionColor={'#FFF070'}
	                    	placeholderTextColor={'#FFF070'}
	                    	underlineColorAndroid={'transparent'}
	                    	ref="usernameTxt"
	                    	onKeyPress={this.handleKeyDownUsername.bind(this)}
	                    />

	                    <TextInput
	                    	style={{height: 30, width:250, borderColor: '#FFF070', borderWidth: 1, color: '#FFF070', fontSize: 12, padding: 5, marginTop: 10}}
	                    	onChangeText={(text) => this.setState({passwordValue: text})}
	                    	value={this.state.passwordValue}
	                    	keyboardType={'email-address'}
	                    	secureTextEntry={true}
	                    	maxLength={10}
	                    	returnKeyType={'done'}
	                    	placeholder={'Password'}
	                    	enablesReturnKeyAutomatically={true}
	                    	selectionColor={'#FFF070'}
	                    	placeholderTextColor={'#FFF070'}
	                    	underlineColorAndroid={'transparent'}
	                    	ref="passwordTxt"
	                    	onKeyPress={this.handleKeyDownPassword.bind(this)}
	                    />

		                <CardItem key={1} style={{backgroundColor: '#233F4A'}}>
		                <Button block light style={{width: 250, marginTop: 10}} onPress={() => {this.loginAction(this.state.usernameValue, this.state.passwordValue)}}>
				            <Text>Login</Text>
				        </Button>
				        </CardItem>

				        <Text style={{color: '#fff'}}>{this.state.errorMessage}</Text>

						{this.myKeyboardSpacer()}
		        	</Content>
		        </Container>
		      </StyleProvider>
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = IndexPage;