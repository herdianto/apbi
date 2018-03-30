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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label, Footer, FooterTab, Toast } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';
import ImagePicker from 'react-native-image-picker';

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

export default class ChangePasswordPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			profileContentData: [],
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: "",
			usernameValue: "",
			oldPasswordValue: "",
			newPasswordValue: "",
			retypeNewPasswordValue: "",
			errorMessage: "",
			editProfileMessage: "",
			profilePictureSource: '',
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
                  	pageSession: resultParsed.pageSession,
                  	usernameValue: resultParsed.usernameSession
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
		// Modify Left and Right Button
        Actions.refresh({
        	//title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
        });
	}

	// Render Left Button
	renderLeftButton = () => {
	    return (
	    	<Icon name="arrow-back" onPress={() => {this.backButton()}} style={{color: '#fff'}} />
	    )
	}

	// Back Button
	backButton() {
		Actions.profile_page({type:ActionConst.RESET});
	}

	// Change Password Action
	changePasswordAction(usernameValue, oldPasswordValue, newPasswordValue, retypeNewPasswordValue) {
    	if (oldPasswordValue == "") {
    		this.oldPasswordTxt._root.focus();
    		this.setState({errorMessage: "Your old password is empty"})
    	} else if (newPasswordValue == "") {
    		this.newPasswordTxt._root.focus();
    		this.setState({errorMessage: "Your new password is empty"})
    	} else if (retypeNewPasswordValue == "") {
    		this.retypeNewPasswordTxt._root.focus();
    		this.setState({errorMessage: "Your retype new password is empty"})
    	} else {
    		this.getChangePasswordResponse(usernameValue, oldPasswordValue, newPasswordValue, retypeNewPasswordValue); // Get Register Response
    	}
    }

    // Get Change Password Response
    getChangePasswordResponse(usernameValue, oldPasswordValue, newPasswordValue, retypeNewPasswordValue) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
		        
		        return fetch(ipPortAddress() + '/api/update_password', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				    'x-token': tokenSession
				  },
				  body: JSON.stringify({
				    user_id: usernameSession,
				    old_password: oldPasswordValue,
				    new_password: newPasswordValue,
				    retype_new_password: retypeNewPasswordValue
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		//alert(JSON.stringify(responseJson));

		    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

		    		if (responseJson.message == "Successfully Updated") {

		    			//alert(responseJson.message);

		    			this.setState({
				    		errorMessage: responseJson.message,
				    		//profilePictureSource: ''
				    	})
		    			
		    		} else {
		    			this.oldPasswordTxt._root.focus();
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

	// Read Enter Key Old Password
	handleKeyDownOldPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.oldPasswordValue);
	        this.oldPasswordTxt._root.clear();
	    }
	}

	// Read Enter Key New Password
	handleKeyDownNewPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.newPasswordValue);
	        this.newPasswordTxt._root.clear();
	    }
	}

	// Read Enter Key Retype New Password
	handleKeyDownRetypeNewPassword(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.retypeNewPasswordValue);
	        this.retypeNewPasswordTxt._root.clear();
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
						            <Item stackedLabel>
						              <Label>Username</Label>
						              <Input
						              	onChangeText={(text) => this.setState({usernameValue: text})}
						            	value={this.state.usernameValue}
						            	keyboardType={'twitter'}
						            	secureTextEntry={false}
						            	maxLength={20}
						            	returnKeyType={'next'}
						            	/*placeholder={'Username'}*/
						            	editable={false}
						            	enablesReturnKeyAutomatically={true}
						            	selectionColor={'#233F4A'}
						            	placeholderTextColor={'#233F4A'}
						            	underlineColorAndroid={'transparent'}
						            	ref={(input) => { this.usernameTxt = input; }}
						            	/*getRef={(input) => { this.usernameTxt = input; }}*/
						            	onKeyPress={this.handleKeyDownUsername.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Old Password</Label>
						              <Input
						              	onChangeText={(text) => this.setState({oldPasswordValue: text})}
				                    	value={this.state.oldPasswordValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={true}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Old Password'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="oldPasswordTxt"*/
				                    	getRef={(input) => { this.oldPasswordTxt = input; }}
				                    	onKeyPress={this.handleKeyDownOldPassword.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>New Password</Label>
						              <Input
						              	onChangeText={(text) => this.setState({newPasswordValue: text})}
				                    	value={this.state.newPasswordValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={true}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'New Password'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="newPasswordTxt"*/
				                    	getRef={(input) => { this.newPasswordTxt = input; }}
				                    	onKeyPress={this.handleKeyDownNewPassword.bind(this)}
						              />
						            </Item>

						            <Item floatingLabel last>
						              <Label>Retype New Password</Label>
						              <Input
						              	onChangeText={(text) => this.setState({retypeNewPasswordValue: text})}
				                    	value={this.state.retypeNewPasswordValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={true}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Retype New Password'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="retypeNewPasswordTxt"*/
				                    	getRef={(input) => { this.retypeNewPasswordTxt = input; }}
				                    	onKeyPress={this.handleKeyDownRetypeNewPassword.bind(this)}
						              />
						            </Item>
						        </Form>

						        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
						        	<Text>{this.state.errorMessage}</Text>
						        </View>

						        {/*<Text>{this.state.tokenSession}</Text>*/}

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		<Footer style={{backgroundColor: '#eee'}}>
		    				<FooterTab>
			    				<Button onPress={() => {this.changePasswordAction(this.state.usernameValue, this.state.oldPasswordValue, this.state.newPasswordValue, this.state.retypeNewPasswordValue)}}>
						            <Text>Change Password</Text>
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
module.export = ChangePasswordPage;