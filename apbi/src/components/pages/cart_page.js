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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, View, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, Row, Footer, FooterTab } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress, ipPortAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

// Button Action
function buttonAction(button) {
	if (button === 'guess_fruit') {
		Actions.loading_page();
	}
}

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

export default class CartPage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			cartList: [],
			newCartList: [],
			productID: this.props.productID,
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
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

	componentDidMount() {
		// Modify Left and Right Button
        Actions.refresh({
        	//title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
        });

		this.setState({cartList: this.props.cartList ? this.props.cartList : []});

        for(var i = 0; i < this.props.cartList.length; i++) {
			this.state.newCartList.push({product_id: this.props.cartList[i].product_id, quantity: this.props.cartList[i].quantity}); // Insert product
		}
	}

	// Render Left Button
	renderLeftButton = () => {
	    return (
	    	<Icon name="arrow-back" onPress={() => {this.backButton()}} style={{color: '#fff'}} />
	    )
	}

	// Back Button
	backButton() {
		Actions.product_detail_page({cartList: this.state.cartList, productID: this.state.productID});
	}

	// Pay Order Product Action
	payOrderProductAction(product) {
		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
		        
		        return fetch(ipPortAddress() + '/api/product/buy', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({
				    product: product,
				    token: tokenSession,
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		//alert(JSON.stringify(responseJson));

		    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

		    		if (responseJson.message == "Successfully Bought") {

		    			alert(responseJson.message);

		    			this.setState({
		    				cartList: [],
		    				newCartList: []
		    			});

		    			// Remove Cart
		    			/*for(var i = 0; i < this.props.cartList.length; i++) {
							this.props.cartList.pop();
						}*/
		    		}
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
		    }
		});
    }

	// Get the data
	render() {

		var total_transaction_price = 0;
		let cartListResult = this.state.cartList.map((cartListData, index) => {
    		var product_id = cartListData.product_id;
    		var product_name = cartListData.product_name;
    		var product_price = cartListData.product_member_price;
			var quantity = cartListData.quantity;

			var total_price = product_price * quantity;

			total_transaction_price += total_price;

			return (
				<Grid key={index} style={{borderBottomWidth: 1, borderColor: '#eee', padding: 5}}>
        			<Row>
            			<Col>
				            	<Text>Product ID</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{product_id}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Product Name</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{product_name}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Product Price</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{product_price}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Quantity</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{quantity}</Text>
				        </Col>
				    </Row>

				    <Row>
            			<Col>
				            	<Text>Total</Text>
				        </Col>
				        <Col style={{alignItems: 'flex-end'}}>
				            	<Text>{total_price}</Text>
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

    	// Display Cart List Play Button
    	let cartListPayButton = () => {
    		if (this.state.cartList == "") {
    			return (
    				<View style={{alignItems: 'center'}}>
    					<Text>Tidak ada transaksi</Text>
    				</View>
    			)
    		} else {
    			return (
    				<View>
	    				{cartListResult}

	    				{displayTotalTransactionPrice()}
			        </View>
    			)
    		}
    	}

    	let payNowButton = () => {
    		if (this.state.cartList != "") {
    			return (
    				<View>
	    				<Footer style={{backgroundColor: '#eee'}}>
		    				<FooterTab>
			    				<Button onPress={() => {this.payOrderProductAction(this.state.newCartList)}}>
						            <Text>Pay Now</Text>
						        </Button>
			    			</FooterTab>
		    			</Footer>

		    			<Footer>
		    				<FooterTab>
			    				
			    			</FooterTab>
		    			</Footer>
			        </View>
    			)
    		}
    	}

	    return (

	    	<Container>
		        
		        <AppHeader />
		
					<ScrollView >

						<Content>

			        		{cartListPayButton()}

			        		{/*<Text>{this.state.tokenSession}</Text>*/}

			        	</Content>
		            
		            </ScrollView>

		        {payNowButton()}

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = CartPage;