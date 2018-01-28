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

export default class TransactionDetailPage extends Component {

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
			usernameLogin: "",
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
		// Modify Left and Right Button
        Actions.refresh({
        	title: this.props.transaction_id,
        	//renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
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

		var total_transaction_price = 0;
		let transactionDetailContentResult = this.props.transaction_product.map((transactionDetailContentDataDetail, index) => {
	    	var transaction_id = transactionDetailContentDataDetail.id;
	    	var transaction_name = transactionDetailContentDataDetail.name;
	    	var transaction_price = transactionDetailContentDataDetail.price;
	    	var transaction_quantity = transactionDetailContentDataDetail.quantity;

	    	var transaction_price_total = transaction_price * transaction_quantity;

	    	total_transaction_price += transaction_price_total;
	    	
	    	return (
				<Grid key={index} style={{borderBottomWidth: 1, borderColor: '#eee', padding: 5}}>
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
				            	<Text>Transaction Name</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_name}</Text>
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

				    <Row>
            			<Col>
				            	<Text>Transaction Quantity</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_quantity}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Transaction Price</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{transaction_price_total}</Text>
				        </Col>
				    </Row>
		        </Grid>
			)
		});

		// Display Total Transaction Price
		var displayTotalTransactionPrice = () => {
			return (
				<Grid style={{borderBottomWidth: 1, borderColor: '#eee', padding: 5}}>
        			<Row>
            			<Col>
				            	<Text>Total Transaction Price</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{total_transaction_price}</Text>
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
				        		
				        		{transactionDetailContentResult}

				        		{displayTotalTransactionPrice()}
				        		
				        		{/*<Text>{this.state.tokenSession}</Text>*/}

						        {/*this.myKeyboardSpacer()*/}

		        			</Content>

		        		</ScrollView>

		        		{/*<Footer style={{backgroundColor: '#eee'}}>
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
		        					                    	/*getRef={(input) => { this.searchPageForumTxt = input; }}
		        					                    	onSubmitEditing={() => {this.searchTransactionAction(this.state.searchTransactionValue)}}
		        					                    	onKeyPress={this.handleKeyDownSearchTransaction.bind(this)}
		        					                    />
		        					                    
		        				  						<Button iconRight onPress={() => {this.nextAction(this.state.pageID)}}>
		        						                    <Icon name='arrow-forward' style={{color: '#233F4A'}} />
		        						                    <Text style={{color: '#233F4A'}}>Next</Text>
		        						                </Button>
		        					    			</FooterTab>
		        				    			</Footer>*/}

		    			<Footer>
		    				<FooterTab>
			    				
			    			</FooterTab>
		    			</Footer>

		    </Container>
		      
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = TransactionDetailPage;