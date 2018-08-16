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
import PhotoUpload from 'react-native-photo-upload';

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
			profileContentData: [],
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: "",
			usernameValue: "",
			emailValue: "",
			nameValue: "",
			addressValue: "",
			deliv_addrValue: "",
			account_noValue: "",
			bank_nameValue: "",
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
		this.getDisplayProfile(); // Get Display Profile

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

	// Edit Profile Action
	editProfileAction(usernameValue, emailValue, nameValue, addressValue, deliv_addrValue, account_noValue, bank_nameValue) {
    	if (emailValue == "") {
    		this.emailTxt._root.focus();
    		this.setState({errorMessage: "Your email is empty"})
    	} else if (nameValue == "") {
    		this.nameTxt._root.focus();
    		this.setState({errorMessage: "Your name is empty"})
    	} else if (addressValue == "") {
    		this.addressTxt._root.focus();
    		this.setState({errorMessage: "Your address is empty"})
    	} else if (deliv_addrValue == "") {
    		this.deliv_addrTxt._root.focus();
    		this.setState({errorMessage: "Your delivery address is empty"})
    	} else if (account_noValue == "") {
    		this.account_noTxt._root.focus();
    		this.setState({errorMessage: "Your account no is empty"})
    	} else if (bank_nameValue == "") {
    		this.bank_nameTxt._root.focus();
    		this.setState({errorMessage: "Your bank name is empty"})
    	} else {
    		this.getEditProfileResponse(usernameValue, emailValue, nameValue, addressValue, deliv_addrValue, account_noValue, bank_nameValue); // Get Register Response
    	}
    }

    // Get Edit Profile Response
    getEditProfileResponse(usernameValue, emailValue, nameValue, addressValue, deliv_addrValue, account_noValue, bank_nameValue) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
		        
		        var data = new FormData();
				data.append('user_id', this.state.usernameSession);
				data.append('email', emailValue);
				data.append('name', nameValue);
				data.append('address', addressValue);
				data.append('deliv_addr', deliv_addrValue);
				data.append('account_no', account_noValue);
				data.append('bank_name', bank_nameValue);

				if (this.state.profilePictureSource != '') {
					data.append('prof_pic', {
					  uri: this.state.profilePictureSource.uri,
					  type: 'image/jpeg', // profilePictureSource.type
					  name: this.state.profilePictureSource.fileName
					});
				}

				return fetch(ipPortAddress() + '/api/update_profile', {  
					method: 'POST',
					headers: {
						'x-token': tokenSession
					},
					body: data
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

			    		/*this.usernameTxt._root.clear();
				    	this.state.usernameValue = ""

				    	this.emailTxt._root.clear();
				    	this.state.emailValue = ""

				    	this.nameTxt._root.clear();
				    	this.state.nameValue = ""

				    	this.addressTxt._root.clear();
				    	this.state.addressValue = ""*/

				    	this.setState({
				    		errorMessage: responseJson.message,
				    		//profilePictureSource: ''
				    	})
		    		} else {
		    			this.usernameTxt._root.focus();
		    			this.setState({errorMessage: responseJson.message})
		    		}
				})
				.catch((error) => {
					alert(error);
				});
		    }
		});  	
	}

	// Upload Photo
    uploadPhotoButton() {
    	/**
		 * The first arg is the options object for customization (it can also be null or omitted for default options),
		 * The second arg is the callback which sends object: response (more info below in README)
		 */

		// More info on all the options is below in the README...just some common use cases shown here
		var options = {
		  /*title: 'Select Avatar',
		  customButtons: [
		    {name: 'fb', title: 'Choose Photo from Facebook'},
		  ],*/
		  	quality: 1.0,
      		maxWidth: 500,
      		maxHeight: 500,
			storageOptions: {
		    	skipBackup: true,
		    	path: 'images'
		  	}
		};

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

		    //alert(source.uri);

		    this.setState({
		      profilePictureSource: source
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
		    		this.setState({
		    			profileContentData: responseJson,
		    			emailValue: responseJson.email,
		    			nameValue: responseJson.name,
		    			addressValue: responseJson.address,
		    			deliv_addrValue: responseJson.delivery_addr,
		    			account_noValue: responseJson.account_no,
		    			bank_nameValue: responseJson.bank_name
		    		}); // Get the data from API
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

	// Read Enter Key Delivery Address
	handleKeyDownDelivAddr(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.deliv_addrValue);
	        this.deliv_addrTxt._root.clear();
	    }
	}

	// Read Enter Key Account No
	handleKeyDownAccountNo(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.account_noValue);
	        this.account_noTxt._root.clear();
	    }
	}

	// Read Enter Key Bank Name
	handleKeyDownBankName(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchAction(this.state.bank_nameValue);
	        this.bank_nameTxt._root.clear();
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

		var profile_picture = this.state.profileContentData.picture ? ipPortAddress() + this.state.profileContentData.picture + '?token=' + this.state.tokenSession + '&time=' + new Date().getTime() : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg';

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        		<ScrollView >

		        			<Content>
				        		
		        				<Form>
						            <TouchableOpacity onPress={() => {this.uploadPhotoButton()}} style={{alignItems: 'center'}}>
					            		<Image source = {{uri: this.state.profilePictureSource ? this.state.profilePictureSource.uri : profile_picture}} style={{width: 150, height: 150}} />
					            	</TouchableOpacity>

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
						            	/*getRef={(input) => { this.usernameTxt = input; }}*/ // only work in floatingLabel
						            	onKeyPress={this.handleKeyDownUsername.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
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
				                    	ref={(input) => { this.emailTxt = input; }}
				                    	/*getRef={(input) => { this.emailTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownEmail.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
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
				                    	ref={(input) => { this.nameTxt = input; }}
				                    	/*getRef={(input) => { this.nameTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownName.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
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
				                    	ref={(input) => { this.addressTxt = input; }}
				                    	/*getRef={(input) => { this.addressTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownAddress.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
						              <Label>Delivery Address</Label>
						              <Input
						              	onChangeText={(text) => this.setState({deliv_addrValue: text})}
				                    	value={this.state.deliv_addrValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Delivery Address'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	ref={(input) => { this.deliv_addrTxt = input; }}
				                    	/*getRef={(input) => { this.deliv_addrTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownDelivAddr.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
						              <Label>Account No</Label>
						              <Input
						              	onChangeText={(text) => this.setState({account_noValue: text})}
				                    	value={this.state.account_noValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Account No'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	ref={(input) => { this.account_noTxt = input; }}
				                    	/*getRef={(input) => { this.account_noTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownAccountNo.bind(this)}
						              />
						            </Item>

						            <Item stackedLabel last>
						              <Label>Bank Name</Label>
						              <Input
						              	onChangeText={(text) => this.setState({bank_nameValue: text})}
				                    	value={this.state.bank_nameValue}
				                    	keyboardType={'twitter'}
				                    	secureTextEntry={false}
				                    	maxLength={50}
				                    	returnKeyType={'next'}
				                    	/*placeholder={'Bank Name'}*/
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#233F4A'}
				                    	placeholderTextColor={'#233F4A'}
				                    	underlineColorAndroid={'transparent'}
				                    	ref={(input) => { this.bank_nameTxt = input; }}
				                    	/*getRef={(input) => { this.bank_nameTxt = input; }}*/
				                    	onKeyPress={this.handleKeyDownBankName.bind(this)}
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
			    				<Button onPress={() => {this.editProfileAction(this.state.usernameValue, this.state.emailValue, this.state.nameValue, this.state.addressValue, this.state.deliv_addrValue, this.state.account_noValue, this.state.bank_nameValue)}}>
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