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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, Row, StyleProvider, Form, Item, Input, Label, Footer, FooterTab, Toast } from 'native-base';
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

export default class ContactUsPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			profileContentData: [],
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: "",
			isFocused: false,
			phoneNumberValue: '',
			contentComplaintValue: '',
			contentBoxHeight: 0,
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

	// Load Data after Rendering
	componentDidMount() {
		this.getDisplayProfile(); // Get Display Profile

		// Modify Left and Right Button
        Actions.refresh({
        	//title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
        });

        // Get Content Box Height to Make it Fixed
		const dim = Dimensions.get('screen');
		const fixedContentBoxHeight = dim.height - 367;

		this.setState({
			contentBoxHeight: fixedContentBoxHeight // Set Screen Width
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
		    			profileContentData: responseJson
		    		}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
            }
	    });
	}

	// Add Complaint Action
	addComplaintAction(phone_number, content_complaint) {
		if (phone_number == "") {
			this.phoneNumberTxt._root.focus();
			alert("Phone number can not be empty");
		} else if (content_complaint == "") {
			this.contentComplaintTxt._root.focus();
			alert("Content complaint can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	let pageSession = resultParsed.pageSession;
	              	
	              	return fetch(ipPortAddress() + '/contact_us/post_complaint', {
					  method: 'POST',
					  headers: {
					    'Accept': 'application/json',
					    'Content-Type': 'application/json',
					  },
					  body: JSON.stringify({
					    name: usernameSession,
					    email: this.state.profileContentData.email,
					    phone: phone_number,
					    content: content_complaint
					  })
					})
					.then((response) => response.json())
			    	.then((responseJson) => {
			    		//alert(JSON.stringify(responseJson));

			    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

			    		if (responseJson.message == "Successfully Sent") {

			    			alert(responseJson.message);

			    			this.phoneNumberTxt._root.clear();
			    			this.state.phoneNumberValue = ""

			    			this.contentComplaintTxt._root.clear();
				    		this.state.contentComplaintValue = ""

				    		this.phoneNumberTxt._root.focus();

			    		}
			    	})
			    	.catch((error) => {
			    		//console.error(error);
			    		
			    		alert(error);
			    	});
	          	}
		    });
		}    	
    }

	// Read Enter Key Phone Number
	handleKeyDownPhoneNumber(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.phoneNumberAction(this.state.phoneNumberValue);
	        this.phoneNumberTxt._root.clear();
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

	// Handle Input Focus To Check If Input Is Focused
	handleInputFocus = () => {
		this.setState({ isFocused: true })
	}

	// Get the data
	render() {

		let contactUsContentResult = () => {
			return (
				<Grid style={{padding: 5}}>
        			<Row>
            			<Col>
				            	<Text>Username</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{this.state.usernameSession}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Email</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{this.state.profileContentData.email}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Item floatingLabel>
					            	<Input
				                    	style={{color: '#000'}}
				                    	onChangeText={(text) => this.setState({phoneNumberValue: text})}
				                    	value={this.state.phoneNumberValue}
				                    	keyboardType={'numeric'}
				                    	secureTextEntry={false}
				                    	maxLength={14}
				                    	returnKeyType={'next'}
				                    	placeholder={'Phone Number'}
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#000'}
				                    	placeholderTextColor={'#000'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="phoneNumberTxt"*/
				                    	getRef={(input) => { this.phoneNumberTxt = input; }}
				                    	/*onSubmitEditing={() => {this.addComplaintAction(this.state.phoneNumberValue)}}
				                    	onKeyPress={this.handleKeyDownPhoneNumber.bind(this)}*/
				                    	onFocus={this.handleInputFocus}
				                    />
			                    </Item>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Item floatingLabel>
					            	<Input
				                    	style={{color: '#000', minHeight: this.state.contentBoxHeight, textAlignVertical: "top"}}
				                    	onChangeText={(text) => this.setState({contentComplaintValue: text})}
				                    	value={this.state.contentComplaintValue}
				                    	keyboardType={'default'}
				                    	secureTextEntry={false}
				                    	/*maxLength={20}*/
				                    	returnKeyType={'go'}
				                    	placeholder={'Complaint...'}
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#000'}
				                    	placeholderTextColor={'#000'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="contentComplaintTxt"*/
				                    	getRef={(input) => { this.contentComplaintTxt = input; }}
				                    	multiline={true}
				                    	onFocus={this.handleInputFocus}
				                    />
			                    </Item>
				        </Col>
				    </Row>
		        </Grid>
			)
		}

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        		<ScrollView >

		        			<Content>
				        		
				        		{contactUsContentResult()}
				        		
				        		{/*<Text>{this.state.tokenSession}</Text>*/}

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		<Footer style={{backgroundColor: '#eee'}}>
							<FooterTab>
			    				<Button onPress={() => {this.addComplaintAction(this.state.phoneNumberValue, this.state.contentComplaintValue)}}>
						            <Text>Contact Us</Text>
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
module.export = ContactUsPage;