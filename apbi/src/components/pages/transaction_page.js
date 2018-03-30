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

export default class TransactionPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			transactionContentData: [],
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			searchTransactionValue: '',
			pageID: 1,
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
		this.getTransaction(this.state.pageID); // Get Transaction
	}

	// Display Transaction Action
	displayTransactionDetailAction(transaction_id, transaction_product) {
    	Actions.transaction_detail_page({transaction_id: transaction_id, transaction_product: transaction_product}); // go to Display Transaction Page
    }

    // Payment Confirmation Action
	paymentConfirmationAction(transaction_id) {
    	Actions.payment_confirmation_page({transaction_id: transaction_id}); // go to Payment Confirmation Page
    }

	// Get Transaction
    getTransaction(pageID) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
              	
              	return fetch(ipPortAddress() + '/api/product/get_transaction/' + pageID, {
		        	method: 'GET',
		        	headers: {
		            	'Accept': 'application/json',
		            	'Content-Type': 'application/json',
		            	'x-token': tokenSession
		          }
		      	})
		    	.then((response) => response.json())
		    	.then((responseJson) => {
		    		this.setState({
		    			transactionContentData: responseJson
		    		}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
          	}
	    });
	}

	// Search Page Forum Action
	searchTransactionAction(pageID) {
		if (pageID == "" || pageID == 0) {
			this.refs.searchTransactionTxt.focus();
			alert("Search can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	let pageSession = resultParsed.pageSession;
	              	
	              	return fetch(ipPortAddress() + '/api/product/get_transaction/' + pageID, {
			        	method: 'GET',
			        	headers: {
			            	'Accept': 'application/json',
			            	'Content-Type': 'application/json',
			            	'x-token': tokenSession
			          }
			      	})
			    	.then((response) => response.json())
			    	.then((responseJson) => {
			    		if (responseJson.length == 0) {
			    			alert("Page No "+pageID+" not found");
			    		} else {
			    			this.setState({
				    			transactionContentData: responseJson,
				    			pageID: pageID
				    		}); // Get the data from API
			    		}

			    		this.refs.searchTransactionTxt.clear();
		    			this.state.searchTransactionValue = ""
			    	})
			    	.catch((error) => {
			    		//console.error(error);
			    		
			    		alert(error);
			    	});
	          	}
		    });
		}    	
    }

	// Prev Action
    prevAction(pageID) {
    	var prevPageID = parseInt(pageID) - 1;
        
        if (prevPageID == 0) {
			alert("This is the first page");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	let pageSession = resultParsed.pageSession;
	              	
	              	return fetch(ipPortAddress() + '/api/product/get_transaction/' + prevPageID, {
			        	method: 'GET',
			        	headers: {
			            	'Accept': 'application/json',
			            	'Content-Type': 'application/json',
			            	'x-token': tokenSession
			          }
			      	})
			    	.then((response) => response.json())
			    	.then((responseJson) => {
			    		this.setState({
			    			transactionContentData: responseJson,
			    			pageID: prevPageID
			    		}); // Get the data from API
			    	})
			    	.catch((error) => {
			    		//console.error(error);
			    		
			    		alert(error);
			    	});
	          	}
		    });
		}
    }

    // Next Action
	nextAction(pageID) {
		var nextPageID = parseInt(pageID) + 1;

		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
              	
              	return fetch(ipPortAddress() + '/api/product/get_transaction/' + nextPageID, {
		        	method: 'GET',
		        	headers: {
		            	'Accept': 'application/json',
		            	'Content-Type': 'application/json',
		            	'x-token': tokenSession
		          }
		      	})
		    	.then((response) => response.json())
		    	.then((responseJson) => {
		    		if (responseJson.length == 0) {
		    			alert("This is the last page");

		    			this.setState({
			    			maxPageID: pageID
			    		}); // Get the data from API
		    		} else {
		    			this.setState({
			    			transactionContentData: responseJson,
			    			pageID: nextPageID
			    		}); // Get the data from API
		    		}
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
          	}
	    });        
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

		let transactionContentResult = this.state.transactionContentData.map((transactionContentDataDetail, index) => {
	    	var transaction_id = transactionContentDataDetail.id;
	    	var transaction_order_date = transactionContentDataDetail.order_date;
	    	var transaction_payment_proof_date = transactionContentDataDetail.payment_proof_date;
	    	var transaction_order_confirmed_date = transactionContentDataDetail.order_confirmed_date;
	    	var transaction_delivery_date = transactionContentDataDetail.delivery_date;
	    	var transaction_done_date = transactionContentDataDetail.done_date;
	    	var transaction_status = transactionContentDataDetail.status;
	    	var transaction_product = transactionContentDataDetail.product;
	    	var transaction_product_total = transaction_product.length;

	    	var transaction_price = 0;
	    	for(var i = 0; i < transaction_product_total; i++) {
				transaction_price += transaction_product[i].price * transaction_product[i].quantity;
			}

			// Payment Confirmation
	    	if (transaction_status == "Order Created") {
	    		var paymentConfirmationButton = () => {
	    			return (
	    				<Row>
	            			<Col>
					            	<Text>Payment Confirmation</Text>
					        </Col>
					        <Col style={{alignItems: 'flex-end'}}>
					        	<Icon name='cloud-upload'
			                    	style={{marginLeft: 10}}
			                    	onPress={() => {this.paymentConfirmationAction(transaction_id)}}
		  						/>
					        </Col>
					    </Row>
	    			)
	    		}
	    	} else {
	    		var paymentConfirmationButton = () => {}
	    	}
	    	
			return (
				<Grid key={index} style={{borderBottomWidth: 1, borderColor: '#eee', padding: 5}} onPress={() => {this.displayTransactionDetailAction(transaction_id, transaction_product)}}>
        			<Row>
            			<Col>
				            	<Text>Transaction ID</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_id}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Transaction Order Date</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text><TimeAgo time = {transaction_order_date} /></Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Transaction Status</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_status}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Transaction Total</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_product_total}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Transaction Price</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_price}</Text>
				        </Col>
				    </Row>

				    {paymentConfirmationButton()}
		        </Grid>
			)
		});

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        		<ScrollView >

		        			<Content>
				        		
				        		{transactionContentResult}

				        		{/*<Text>{this.state.tokenSession}</Text>*/}

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		<Footer style={{backgroundColor: '#eee'}}>
							<FooterTab>
			    				<Button iconLeft  onPress={() => {this.prevAction(this.state.pageID)}}>
				                    <Icon name='arrow-back' style={{color: '#233F4A'}} />
				                    <Text style={{color: '#233F4A'}}>Back</Text>
				                </Button>

			                	<TextInput
			                    	style={{height: 30, width:150, borderColor: '#233F4A', borderWidth: 1, color: '#233F4A', fontSize: 12, marginTop: 12, marginRight: 7, padding: 5}}
			                    	onChangeText={(text) => this.setState({searchTransactionValue: text})}
			                    	value={this.state.searchTransactionValue}
			                    	keyboardType={'numeric'}
			                    	secureTextEntry={false}
			                    	maxLength={20}
			                    	returnKeyType={'search'}
			                    	placeholder={'Jump to page...'}
			                    	enablesReturnKeyAutomatically={true}
			                    	selectionColor={'#233F4A'}
			                    	placeholderTextColor={'#233F4A'}
			                    	underlineColorAndroid={'transparent'}
			                    	ref="searchTransactionTxt"
			                    	/*getRef={(input) => { this.searchTransactionTxt = input; }}*/
			                    	onSubmitEditing={() => {this.searchTransactionAction(this.state.searchTransactionValue)}}
			                    	onKeyPress={this.handleKeyDownSearchTransaction.bind(this)}
			                    />
			                    
		  						<Button iconRight onPress={() => {this.nextAction(this.state.pageID)}}>
				                    <Icon name='arrow-forward' style={{color: '#233F4A'}} />
				                    <Text style={{color: '#233F4A'}}>Next</Text>
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
module.export = TransactionPage;