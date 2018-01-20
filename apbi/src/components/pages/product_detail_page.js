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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, Row, List, ListItem, Item, Input, Label, Footer, FooterTab } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
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

export default class ProductDetailPage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			cartList: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			quantityProductValue: '',
			isFocused: false,
			productDetailData: [],
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

	componentDidMount() {
		// Modify Left and Right Button
        Actions.refresh({
        	title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	renderRightButton: this.renderRightButton
        });

        this.setState({cartList: this.props.cartList ? this.props.cartList : []});

		//alert(JSON.stringify(this.state.cartList));

		this.getProductDetail(this.props.productID); // Get Product Detail Content
	}

	// Get Product Detail
    getProductDetail(productID) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let tokenSession = resultParsed.tokenSession;
		        
		        return fetch(ipPortAddress() + '/api/product/detail/' + productID, {
		        	method: 'GET',
		        	headers: {
		            	'Accept': 'application/json',
		            	'Content-Type': 'application/json',
		            	'x-token': tokenSession
		          }
		      	})
		    	.then((response) => response.json())
		    	.then((responseJson) => {
		    		//alert(JSON.stringify(responseJson));

		    		this.setState({
		    			productDetailData: [responseJson],
		    			//newTotalPostForum: responseJson.length // total post
		    		}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
		    }
		});
	}

	// Render Left Button
	renderLeftButton = () => {
	    return (
	    	<Icon name="arrow-back" onPress={() => {this.backButton()}} style={{color: '#fff'}} />
	    )
	}

	// Render Right Button
	renderRightButton = () => {
	    return (
	    	<Icon name="cart" onPress={() => {this.goToCartAction()}} style={{color: '#fff'}} />
	    )
	}

	// Back Button
	backButton() {
		Actions.product_page({cartList: this.state.cartList, type:ActionConst.RESET});
	}

	// Go to Cart
	goToCartAction() {
    	Actions.cart_page({cartList: this.state.cartList}); // go to Detail Product Page
    }

    // Order Product Action
	orderProductAction(product_id, product_name, product_member_price, quantity) {
		if (quantity == "") {
			this.quantityProductTxt._root.focus();
			alert("Quantity can not be empty");
		} else if (quantity > 100) {
			this.quantityProductTxt._root.focus();
			alert("Max quantity = 100");
		} else {
			let markers_cartList = [ ...this.state.cartList ];

			for(let i in markers_cartList){
				if(markers_cartList[i].product_id == product_id) {
			    	var checkProductExist = "yes";
			    	markers_cartList[i].quantity = quantity; //new value
			    }
			}

			// Insert Product
		  	if (checkProductExist != 'yes') {
		  		this.state.cartList.push({product_id: product_id, product_name: product_name, product_member_price: product_member_price, quantity: quantity}); // Insert product
		  	}

		  	// Delete initial and Insert Product
		  	//cartList.pop(); // Delete the initial content of cartList

		  	//alert(JSON.stringify(this.state.cartList));

		  	alert("Successfully Added to Cart");

		  	this.quantityProductTxt._root.clear();
		    this.state.quantityProductValue = ""
		}
    }

	// Read Enter Key Quantity Product
	handleKeyDownQuantityProduct(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.quantityProductAction(this.state.quantityProductValue);
	        this.quantityProductTxt._root.clear();
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

    	let productDetailDataResult = this.state.productDetailData.map((productDetailData, index) => {

			//alert(JSON.stringify(this.state.searchProductData[0]));

			var product_id = productDetailData.id;
			var product_name = productDetailData.name;
			var product_description = productDetailData.description;
			var product_member_price = productDetailData.member_price;
			var product_non_member_price = productDetailData.non_member_price;
			var product_posted_date = productDetailData.posted_date;
			var product_posted_by = productDetailData.posted_by;
			var product_last_update_date = productDetailData.last_update_date;
			var product_last_update_by = productDetailData.last_update_by;
			var product_images = productDetailData.images;

			return(
				<View key={product_id}>
					<Grid>
	        			<Col style={{ backgroundColor: '#233F4A', height: 200, justifyContent: 'center', alignItems: 'center' }}>
				            	<Image source={require('../../logo/profile_picture.png')} style={{width: 150, height: 150}} />
				        </Col>
			        </Grid>

			        <List>
			            <ListItem style={{justifyContent: 'space-between'}}>
			              <Text>Product Name</Text>
			              <Text>{product_name}</Text>
			            </ListItem>

			            <ListItem style={{justifyContent: 'space-between'}}>
			              <Text>Price</Text>
			              <Text>{product_member_price}</Text>
			            </ListItem>

			            <ListItem>
			              <Item floatingLabel>
			              	<Label style={{color: '#000', fontSize: 14}}>Quantity</Label>
				            	<Input
			                    	style={{color: '#000', textAlign: 'right'}}
			                    	onChangeText={(text) => this.setState({quantityProductValue: text})}
			                    	value={this.state.quantityProductValue}
			                    	keyboardType={'numeric'}
			                    	secureTextEntry={false}
			                    	maxLength={20}
			                    	returnKeyType={'search'}
			                    	placeholder={'0'}
			                    	enablesReturnKeyAutomatically={true}
			                    	selectionColor={'#000'}
			                    	placeholderTextColor={'#000'}
			                    	underlineColorAndroid={'transparent'}
			                    	/*ref="quantityProductTxt"*/
			                    	getRef={(input) => { this.quantityProductTxt = input; }}
			                    	onKeyPress={this.handleKeyDownQuantityProduct.bind(this)}
			                    	onFocus={this.handleInputFocus}
			                    />
		                    </Item>
			            </ListItem>
			        </List>
		        </View>
			)
			
		});

		var product_id = this.state.productDetailData[0] ? this.state.productDetailData[0].id : '';
		var product_name = this.state.productDetailData[0] ? this.state.productDetailData[0].name : '';
		var product_member_price = this.state.productDetailData[0] ? this.state.productDetailData[0].member_price : ''

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		{/*buttonPlayButton()*/}

		            		{productDetailDataResult}

		            		<Text>{this.state.tokenSession}</Text>
						
						</Content>

		            </ScrollView>

			        <Footer style={{backgroundColor: '#eee'}}>
						<FooterTab>
		    				<Button onPress={() => {this.orderProductAction(product_id, product_name, product_member_price, this.state.quantityProductValue)}}>
					            <Text>Order</Text>
					        </Button>
		    			</FooterTab>
	    			</Footer>

	    			<Footer>
						<FooterTab>
		    				
		    			</FooterTab>
	    			</Footer>

	    			{/*this.myKeyboardSpacer()*/}

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = ProductDetailPage;