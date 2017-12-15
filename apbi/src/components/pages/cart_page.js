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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Grid, Col, Row } from 'native-base';
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
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: ''
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

        this.setState({cartList: this.props.cartList});

        for(var i = 0; i < this.props.cartList.length; i++) {
			this.state.newCartList.push({product_id: this.props.cartList[i].product_id, quantity: this.props.cartList[i].quantity}); // Insert product
		}
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

	// Pay Order Product Action
	async payOrderProductAction(product) {
		//alert(JSON.stringify(product));

		const tokenValueContents = await FileSystem.readFile('tokenFile.txt');

    	return fetch('http://' + ipAddress() + ':' + portAddress() + '/api/product/buy', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		    product: product,
		    token: tokenValueContents,
		  })
		})
		.then((response) => response.json())
    	.then((responseJson) => {
    		//alert(JSON.stringify(responseJson));

    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

    		if (responseJson.message == "Successfully Bought") {

    			alert(responseJson.message);

    			this.setState({cartList: [], newCartList: []});
    			
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
    }

	// Get the data
	render() {

		let cartListResult = this.state.cartList.map((cartListData, index) => {
    		var product_id = cartListData.product_id;
    		var product_name = cartListData.product_name;
    		var product_price = cartListData.product_member_price;
			var quantity = cartListData.quantity;

			var total_price = product_price * quantity;

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

    	let cartListPayButton = () => {
    		if (this.state.cartList == "") {
    			return (
    				<Content>
    					<Text>Tidak ada transaksi</Text>
    				</Content>
    			)
    		} else {
    			return (
    				<Content>
	    				{cartListResult}

	    				<Grid style={{justifyContent: 'center', marginTop: 10}}>
				        	<Col>
				        		<Button block light style={{width: 250}} onPress={() => {this.payOrderProductAction(this.state.newCartList)}}>
						            <Text>Pay Now</Text>
						        </Button>
				        	</Col>
				        </Grid>
			        </Content>
    			)
    		}
    	}

	    return (

	    	<Container>
		        
		        <AppHeader />
		
					<ScrollView >

			        	{cartListPayButton()}
		            
		            </ScrollView>

		        

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = CartPage;