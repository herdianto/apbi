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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label, Footer, FooterTab, Toast } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress, ipPortAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

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

export default class EditProfilePage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: "",
			usernameValue: "",
			passwordValue: "",
			emailValue: "",
			nameValue: "",
			addressValue: "",
			errorMessage: "",
			editProfileMessage: "",
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
		
	}

	// Edit Profile Action
	editProfileAction(usernameValue, passwordValue, emailValue, nameValue, addressValue) {
    	if (usernameValue == "") {
    		this.usernameTxt._root.focus();
    		this.setState({errorMessage: "Your username is empty"})
    	} else if (passwordValue == "") {
    		this.passwordTxt._root.focus();
    		this.setState({errorMessage: "Your password is empty"})
    	} else if (emailValue == "") {
    		this.emailTxt._root.focus();
    		this.setState({errorMessage: "Your email is empty"})
    	} else if (nameValue == "") {
    		this.nameTxt._root.focus();
    		this.setState({errorMessage: "Your name is empty"})
    	} else if (addressValue == "") {
    		this.addressTxt._root.focus();
    		this.setState({errorMessage: "Your address is empty"})
    	} else {
    		this.getEditProfileResponse(usernameValue, passwordValue, emailValue, nameValue, addressValue); // Get Register Response
    	}
    }

    // Get Edit Profile Response
    getEditProfileResponse(usernameValue, passwordValue, emailValue, nameValue, addressValue) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let tokenSession = resultParsed.tokenSession;
		        
		        return fetch(ipPortAddress() + '/api/update_profile', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				    'x-token': tokenSession
				  },
				  body: JSON.stringify({
				    user_id: usernameValue,
				    password: passwordValue,
				    email: emailValue,
				    name: nameValue,
				    address: addressValue,
				    deliv_addr: 'aaa',
				    account_no: 'aaa',
				    bank_name: 'aaa'
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		//alert(JSON.stringify(responseJson));

		    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

		    		if (responseJson.message == "Successfully Updated") {
		    			//alert(responseJson.message);

		    			//tokenValue = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiaGVyZGkiLCJyb2xlIjoic3VwZXJfdXNlciIsImV4cCI6MTUwODgzMTIxNzIzN30.EJ_MKjAbPRJhNkcmkWooClQMi2xQ63JLoTVH0mleoYg";

		    			//this.writeTokenFile(responseJson.token, usernameValue); // write token to file
		    			
			    		//Actions.tabbar({usernameLogin: usernameValue});
		    			//Actions.home({usernameLogin: usernameValue});
			    		//Actions.login_page({type:ActionConst.RESET}); // go to Login Page

			    		this.usernameTxt._root.clear();
				    	this.state.usernameValue = ""

				    	this.passwordTxt._root.clear();
				    	this.state.passwordValue = ""

				    	this.emailTxt._root.clear();
				    	this.state.emailValue = ""

				    	this.nameTxt._root.clear();
				    	this.state.nameValue = ""

				    	this.addressTxt._root.clear();
				    	this.state.addressValue = ""

				    	this.setState({errorMessage: responseJson.message})
		    		} else {
		    			this.usernameTxt._root.focus();
		    			this.setState({errorMessage: responseJson.message})
		    		}
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
		    }
		});

    	
	}

	// Read Enter Key Username
	handleKeyDownUsername(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.usernameValue);
	        this.usernameTxt._root.clear();
	    }
	}

	// Read Enter Key Password
	handleKeyDownPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.passwordValue);
	        this.passwordTxt._root.clear();
	    }
	}

	// Read Enter Key Email
	handleKeyDownEmail(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.emailValue);
	        this.emailTxt._root.clear();
	    }
	}

	// Read Enter Key Name
	handleKeyDownName(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.nameValue);
	        this.nameTxt._root.clear();
	    }
	}

	// Read Enter Key Address
	handleKeyDownAddress(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.addressValue);
	        this.addressTxt._root.clear();
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

	// Get the data
	render() {

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        		<ScrollView >

		        			<Content>
				        		
		        				<Form>
						            <Item floatingLabel>
						              <Label>Username</Label>
						              <Input
						              	onChangeText={(text) => this.setState({usernameValue: text})}
						            	value={this.state.usernameValue}
						            	keyboardType={'twitter'}
						            	secureTextEntry={false}
						            	maxLength={20}
						            	returnKeyType={'next'}
						            	/*placeholder={'Username'}*/
						            	enablesReturnKeyAutomatically={true}
						            	selectionColor={'#233F4A'}
						            	placeholderTextColor={'#233F4A'}
						            	underlineColorAndroid={'transparent'}
						            	/*ref="usernameTxt"*/
						            	getRef={(input) => { this.usernameTxt = input; }}
						            	onKeyPress={this.handleKeyDownUsername.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Password</Label>
						              <Input
						              	onChangeText={(text) => this.setState({passwordValue: text})}
				                    	value={this.state.passwordValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={true}
				                    	maxLength={20}
				                    	returnKeyType={'go'}
				                    	/*placeholder={'Password'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="passwordTxt"*/
				                    	getRef={(input) => { this.passwordTxt = input; }}
				                    	onKeyPress={this.handleKeyDownPassword.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Email</Label>
						              <Input
						              	onChangeText={(text) => this.setState({emailValue: text})}
				                    	value={this.state.emailValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Email'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="emailTxt"*/
				                    	getRef={(input) => { this.emailTxt = input; }}
				                    	onKeyPress={this.handleKeyDownEmail.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Name</Label>
						              <Input
						              	onChangeText={(text) => this.setState({nameValue: text})}
				                    	value={this.state.nameValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Name'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="nameTxt"*/
				                    	getRef={(input) => { this.nameTxt = input; }}
				                    	onKeyPress={this.handleKeyDownName.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Address</Label>
						              <Input
						              	onChangeText={(text) => this.setState({addressValue: text})}
				                    	value={this.state.addressValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Address'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="addressTxt"*/
				                    	getRef={(input) => { this.addressTxt = input; }}
				                    	onKeyPress={this.handleKeyDownAddress.bind(this)}
						              />
						            </Item>
						        </Form>

						        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
						        	<Text>{this.state.errorMessage}</Text>
						        </View>

						        <Text>{this.state.tokenSession}</Text>

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		<Footer style={{backgroundColor: '#eee'}}>
		    				<FooterTab>
			    				<Button onPress={() => {this.editProfileAction(this.state.usernameValue, this.state.passwordValue, this.state.emailValue, this.state.nameValue, this.state.addressValue)}}>
						            <Text>Edit Profile</Text>
						        </Button>
			    			</FooterTab>
		    			</Footer>

		    			<Footer>
		    				<FooterTab>
			    				
			    			</FooterTab>
		    			</Footer>

		    </Container>
		      
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = EditProfilePage;