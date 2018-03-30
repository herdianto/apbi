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

export default class PaymentConfirmationPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			transactionContentData: [],
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			searchPageForumValue: '',
			pageID: 1,
			paymentConfirmationPictureSource: '',
			usernameLogin: "",
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
		// Modify Left and Right Button
        Actions.refresh({
        	title: this.props.transaction_id,
        	//renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
        });
	}

	// Upload Forum Picture
    uploadForumPictureButton() {
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
		      paymentConfirmationPictureSource: source
		    });
		  }
		});
    }

    // Upload Payment Proof Action
	uploadPaymentProofAction(transaction_id) {
		if (this.state.paymentConfirmationPictureSource == "") {
			alert("Payment Proof cannot be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	let pageSession = resultParsed.pageSession;
	              	
	              	var data = new FormData();
					data.append('trans_id', transaction_id);
					
					if (this.state.paymentConfirmationPictureSource != '') {
						data.append('payment_proof', {
						  uri: this.state.paymentConfirmationPictureSource.uri,
						  type: 'image/jpeg', // avatarSource.type
						  name: this.state.paymentConfirmationPictureSource.fileName
						});	
					}
					
	              	return fetch(ipPortAddress() + '/api/product/upload_trans_proof', {
						method: 'POST',
						headers: {
							'x-token': tokenSession
						},
						body: data
					})
					.then((response) => response.json())
			    	.then((responseJson) => {
			    		if (responseJson.message == "Upload Success") {
			    			alert(responseJson.message);

			    			this.setState({
				    			paymentConfirmationPictureSource: ''
				    		})
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

	// Read Enter Key Search Transaction
	handleKeyDownSearchTransaction(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchTransactionAction(this.state.searchTransactionValue);
	        this.searchTransactionTxt._root.clear();
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

		let paymentConfirmationContentResult = () => {
			return (
				<Grid style={{borderBottomWidth: 1, borderColor: '#eee', padding: 5}}>
        			<Row>
            			<Col>
				            	<Text>Transaction ID</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{this.props.transaction_id}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Payment Proof</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<TouchableOpacity onPress={() => {this.uploadForumPictureButton()}} style={{alignItems: 'center'}}>
				            		<Image source = {{uri: this.state.paymentConfirmationPictureSource ? this.state.paymentConfirmationPictureSource.uri : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg'}} style={{width: 150, height: 150}} />
				            	</TouchableOpacity>
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
				        		
				        		{paymentConfirmationContentResult()}
				        		
				        		{/*<Text>{this.state.tokenSession}</Text>*/}

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		<Footer style={{backgroundColor: '#eee'}}>
							<FooterTab>
			    				<Button onPress={() => {this.uploadPaymentProofAction(this.props.transaction_id)}}>
						            <Text>Upload Payment Proof</Text>
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
module.export = PaymentConfirmationPage;