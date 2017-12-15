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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, TextInput } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';

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

export default class RegisterPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameValue: "",
			passwordValue: "",
			emailValue: "",
			nameValue: "",
			errorMessage: "",
			registerMessage: ""
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
	async componentDidMount() {
		//this.getData();
		//this.readTokenFile();

		/*const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
		const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');

		// Check token if file exists
		if (fileTokenExists == true && fileUsernameExists == true) {
			this.checkToken();
		}*/
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
    /*async checkToken() {
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
    			alert("Successful");

    			Actions.home_page({usernameLogin: usernameValueContents}); // go to Home Page directly without Login
    		} else {
    			alert("Token Expired");
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}*/

	// Register Action
	registerAction(usernameValue, passwordValue, emailValue, nameValue) {
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
    	} else {
    		this.getRegisterResponse(usernameValue, passwordValue, emailValue, nameValue); // Get Register Response
    	}
    }

    // Get Register Response
    getRegisterResponse(usernameValue, passwordValue, emailValue, nameValue) {
		return fetch('http://' + ipAddress() + ':' + portAddress() + '/register', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		    user_id: usernameValue,
		    password: passwordValue,
		    email: emailValue,
		    name: nameValue,
		    address: ''
		  })
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		//alert(JSON.stringify(responseJson));

    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

    		if (responseJson.message == "Successfully Registered") {
    			alert(responseJson.message + "! Please Login!");

    			//tokenValue = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiaGVyZGkiLCJyb2xlIjoic3VwZXJfdXNlciIsImV4cCI6MTUwODgzMTIxNzIzN30.EJ_MKjAbPRJhNkcmkWooClQMi2xQ63JLoTVH0mleoYg";

    			//this.writeTokenFile(responseJson.token, usernameValue); // write token to file
    			
	    		//Actions.tabbar({usernameLogin: usernameValue});
    			//Actions.home({usernameLogin: usernameValue});
	    		Actions.login_page(); // go to Login Page

	    		this.usernameTxt._root.clear();
		    	this.state.usernameValue = ""

		    	this.passwordTxt._root.clear();
		    	this.state.passwordValue = ""

		    	this.emailTxt._root.clear();
		    	this.state.emailValue = ""

		    	this.nameTxt._root.clear();
		    	this.state.nameValue = ""
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

	// Keyboard Spacer
	myKeyboardSpacer() {
		if (Platform.OS === 'ios') {
		    return <KeyboardSpacer />;
		} else {
			return null;
		}
	}

	// Login Action
	loginAction() {
    	Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    }

	// Get the data
	render() {

	    return (

			// Display
		    <StyleProvider style={getTheme(apbiTheme)}>

		        <Container>

		        	<Content contentContainerStyle={{flex: 1, backgroundColor: '#233F4A'}}>
		        		<View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20, top: 20}}>
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

				            <Item floatingLabel last>
				              <Label style={{color: '#fff'}}>Email</Label>
				              <Input
				              	style={{color: '#fff'}}
				              	onChangeText={(text) => this.setState({emailValue: text})}
		                    	value={this.state.emailValue}
		                    	keyboardType={'twitter'}
		                    	secureTextEntry={false}
		                    	maxLength={50}
		                    	returnKeyType={'next'}
		                    	/*placeholder={'Email'}*/
		                    	enablesReturnKeyAutomatically={true}
		                    	selectionColor={'#fff'}
		                    	placeholderTextColor={'#fff'}
		                    	underlineColorAndroid={'transparent'}
		                    	/*ref="emailTxt"*/
		                    	getRef={(input) => { this.emailTxt = input; }}
		                    	onKeyPress={this.handleKeyDownEmail.bind(this)}
				              />
				            </Item>

				            <Item floatingLabel last>
				              <Label style={{color: '#fff'}}>Name</Label>
				              <Input
				              	style={{color: '#fff'}}
				              	onChangeText={(text) => this.setState({nameValue: text})}
		                    	value={this.state.nameValue}
		                    	keyboardType={'twitter'}
		                    	secureTextEntry={false}
		                    	maxLength={50}
		                    	returnKeyType={'next'}
		                    	/*placeholder={'Name'}*/
		                    	enablesReturnKeyAutomatically={true}
		                    	selectionColor={'#fff'}
		                    	placeholderTextColor={'#fff'}
		                    	underlineColorAndroid={'transparent'}
		                    	/*ref="nameTxt"*/
		                    	getRef={(input) => { this.nameTxt = input; }}
		                    	onKeyPress={this.handleKeyDownName.bind(this)}
				              />
				            </Item>
				        </Form>

				        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
			                <CardItem key={1} style={{backgroundColor: '#233F4A'}}>
				                <Button block light style={{width: 250, marginTop: 10}} onPress={() => {this.registerAction(this.state.usernameValue, this.state.passwordValue, this.state.emailValue, this.state.nameValue)}}>
						            <Text>Register</Text>
						        </Button>
					        </CardItem>

					        <Text style={{color: '#fff', marginBottom: 10}} onPress={() => {this.loginAction()}}>Login</Text>

					        <Text style={{color: '#fff'}}>{this.state.errorMessage}</Text>
				        </View>

						{this.myKeyboardSpacer()}
		        	</Content>

		        </Container>

		    </StyleProvider>
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = RegisterPage;