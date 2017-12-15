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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, Row, List, ListItem, Item, Input, Label } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress } from '../../helpers/helpers';

// Import Components
import AppHeader from '../appHeader';
import AppFooter from '../appFooter';

/*const buttonPlayList = [
  {
    buttonPlayID: 1,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 2,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 3,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  },
  {
    buttonPlayID: 4,
    buttonPlayTitle: '',
    buttonPlayURL: () => {}
  }
]*/

//const cartList = [{}]; // Define List Cart - Object in Object

//const cartList = []; // Define List Cart - Use this

/*const medicine = {
    product_id: 'prd_1',
    quantity: 10
}*/

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
			quantityProductValue: ''
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

	async componentDidMount() {
		//this.getData();

		const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
        const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');

        // Check token if file exists
        if (fileTokenExists == true && fileUsernameExists == true) {
            this.checkToken();
        }

        Actions.refresh({
        	title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	renderRightButton: this.renderRightButton
        });

        this.setState({cartList: this.props.cartList ? this.props.cartList : []});

		//alert(JSON.stringify(this.state.cartList));
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

	// Check Token
    async checkToken() {
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
    			//alert("Successful");

    			this.writeTokenFile(responseJson.token, responseJson.profile.user_id); // write token to file

    			//Actions.tabbar({type:ActionConst.RESET});

    			//Actions.tabbar({usernameLogin: usernameValueContents});
    			//Actions.home({usernameLogin: usernameValueContents});
    			//Actions.home_page({usernameLogin: usernameValueContents}); // go to Home Page directly without Login

    			this.setState({
		            //usernameLogin: usernameValueContents
		            usernameLogin: responseJson.profile.user_id
		        });
    		} else if (responseJson.message == "Token is no longer valid") {
    			alert(responseJson.message);

    			Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    		} else {
    			alert("Please Login");

    			Actions.login_page({type:ActionConst.RESET}); // go to Login Page
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
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
		Actions.product_page({cartList: this.state.cartList});
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

	// Get the data
	render() {

		// Display Array
		/*let buttonPlayButtons = buttonPlayList.map(buttonPlayInfo => {
	      return (
	              <CardItem key={buttonPlayInfo.buttonPlayID}>
	                <Button transparent style={{width: 340}}>
			            <Text onPress={buttonPlayInfo.buttonPlayURL}>{buttonPlayInfo.buttonPlayTitle}</Text>
			        </Button>
	              </CardItem>
	      )
	    });*/

	    // Display Single Value
	    /*let buttonPlayButton = () => {
	    	if (Platform.OS === 'ios') {
		    	if (this.state.orientation == 'portrait') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	}
	    	} else {
	    		if (this.state.orientation == 'portrait') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>About Page</Text>
			            </CardItem>
			    	)
		    	}
	    	}
	    	
	    }*/

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		{/*buttonPlayButton()*/}

		            		<Grid>
		            			<Col style={{ backgroundColor: '#233F4A', height: 200, justifyContent: 'center', alignItems: 'center' }}>
						            	<Image source={require('../../logo/profile_picture.png')} style={{width: 150, height: 150}} />
						        </Col>
					        </Grid>

					        <List>
					            <ListItem style={{justifyContent: 'space-between'}}>
					              <Text>Product Name</Text>
					              <Text>{this.props.product_name}</Text>
					            </ListItem>

					            <ListItem style={{justifyContent: 'space-between'}}>
					              <Text>Price</Text>
					              <Text>{this.props.product_member_price}</Text>
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
					                    />
				                    </Item>
					            </ListItem>
					            
					            <ListItem style={{justifyContent: 'center'}}>
					              	<Button block light style={{width: 250}} onPress={() => {this.orderProductAction(this.props.product_id, this.props.product_name, this.props.product_member_price, this.state.quantityProductValue)}}>
							            <Text>Order</Text>
							        </Button>
					            </ListItem>
					        </List>
						
						</Content>

		            </ScrollView>

		        

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = ProductDetailPage;