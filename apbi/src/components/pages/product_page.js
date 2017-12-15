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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label, Grid, Col, Row } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';

// Import My Own Libraries
import { hello, getImage, contentSnippet, ipAddress, portAddress } from '../../helpers/helpers';

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

export default class ProductPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			cartList: [],
			searchProductData: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: "",
			searchProductValue: "",
			errorMessage: ""
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

	// Load Data after Rendering
	async componentDidMount() {
		//this.getData();
		//this.readTokenFile();

		const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
		const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');

		// Check token if file exists
		if (fileTokenExists == true && fileUsernameExists == true) {
			this.checkToken();
		}

		//alert(JSON.stringify(this.props.cartList));

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

	// Search Product Action
	searchProductAction(searchProductValue) {
    	if (searchProductValue == "") {
    		alert("Your search product is empty");
    		
    		this.searchProductTxt._root.focus();
    		this.setState({errorMessage: "Your search product is empty"})
    	} else {
    		this.getSearchProductResponse(searchProductValue); // Get Search Product Response

    		this.searchProductTxt._root.clear();
		    this.state.searchProductValue = ""
    	}
    }

    // Get Search Product Response
    async getSearchProductResponse(searchProductValue) {
    	const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
    	const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

    	//alert(searchProductValue);

		return fetch('http://' + ipAddress() + ':' + portAddress() + '/api/product/search?keyword=' + searchProductValue, {
        	method: 'GET',
        	headers: {
            	'Accept': 'application/json',
            	'Content-Type': 'application/json',
            	'x-token': tokenValueContents
          }
      	})
    	.then((response) => response.json())
    	.then((responseJson) => {
    		//alert(JSON.stringify(responseJson));

    		this.setState({searchProductData: responseJson}); // Get the data from API
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Detail Product Action
	detailProductAction(product_id, product_name, product_description, product_member_price, product_non_member_price) {
    	Actions.product_detail_page({product_id: product_id, product_name: product_name, product_description: product_description, product_member_price: product_member_price, product_non_member_price: product_non_member_price, cartList: this.state.cartList}); // go to Detail Product Page
    }

	// Read Enter Key Search Product
	handleKeyDownSearchProduct(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchProductAction(this.state.searchProductValue);
	        this.searchProductTxt._root.clear();
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

		//let searchProductDataResult = this.state.searchProductData.map(function(productData, index) {

		// This is binding issue. Function in JavaScript have their own "this" context,
		// So "this" is not pointing to your class, but to the function itself
		// So dont use function(productData, index) but (productData, index) =>
		let searchProductDataResult = this.state.searchProductData.map((productData, index) => {

			//alert(JSON.stringify(this.state.searchProductData[0]));

			var product_id = productData.product_id;
			var product_name = productData.name;
			var product_description = productData.description;
			var product_member_price = productData.member_price;
			var product_non_member_price = productData.non_member_price;
			var product_posted_date = productData.posted_date;
			var product_posted_by = productData.posted_by;
			var product_last_update_date = productData.last_update_date;
			var product_last_update_by = productData.last_update_by;

			return(
				/*<CardItem button onPress={() => {this.editProfileAction(product_name)}} key={product_id} style={{borderRadius: 2, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff', margin: 0.5}}>
	        		<Image source={require('../../logo/profile_picture.png')} style={{width: 90, height: 90}} />
	        		<Text style={{marginTop: 120, marginLeft: -80, width: 80, fontSize: 10}}>{product_name}</Text>
	        	</CardItem>*/

	        	<TouchableOpacity onPress={() => {this.detailProductAction(product_id, product_name, product_description, product_member_price, product_non_member_price)}} key={product_id} style={{borderRadius: 2, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff', margin: 0.5, padding: 5, width: 105}}>
					<Image source={require('../../logo/profile_picture.png')} style={{width: 90, height: 90}} />
					<Text>{product_name}</Text>
				</TouchableOpacity>
			)
			
		});

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        		<ScrollView >

		        			<Content>

		        				<Grid>
						            <Col style={{ backgroundColor: '#233F4A', height: 100, justifyContent: 'center', alignItems: 'center' }}>
						            	<Item floatingLabel>
							            	<Input
						                    	style={{color: '#fff'}}
						                    	onChangeText={(text) => this.setState({searchProductValue: text})}
						                    	value={this.state.searchProductValue}
						                    	keyboardType={'web-search'}
						                    	secureTextEntry={false}
						                    	maxLength={20}
						                    	returnKeyType={'search'}
						                    	placeholder={'Search Product'}
						                    	enablesReturnKeyAutomatically={true}
						                    	selectionColor={'#fff'}
						                    	placeholderTextColor={'#fff'}
						                    	underlineColorAndroid={'transparent'}
						                    	/*ref="searchProductTxt"*/
						                    	getRef={(input) => { this.searchProductTxt = input; }}
						                    	onSubmitEditing={() => {this.searchProductAction(this.state.searchProductValue)}}
						                    	onKeyPress={this.handleKeyDownSearchProduct.bind(this)}
						                    />
					                    </Item>

						                {/*<Icon name='search'
					                    	style={{marginLeft: 280, marginTop: -28, color: '#fff'}}
				  							onPress={() => {this.searchProductAction(this.state.searchProductValue)}}
				  						/>*/}
						            </Col>
						        </Grid>

						        <Grid>
						        	<Col style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center'}}>
						        		{searchProductDataResult}
						        	</Col>
						        </Grid>

						        {this.myKeyboardSpacer()}
		        				
		        			</Content>

		        </ScrollView>

		    </Container>
		      
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = ProductPage;