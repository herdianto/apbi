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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider, Form, Item, Input, Label, Grid, Col, Row, Header, Footer, FooterTab } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';

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
			errorMessage: "",
			screenWidth: 0,
			searchPageProductValue: '',
			pageID: 1,
			maxPageID: 0,
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
		// Get Screen Width to Make it Fixed
		const dim = Dimensions.get('screen');
		const fixedWidth = (dim.width / 3) - 1;

		this.setState({
			cartList: this.props.cartList ? this.props.cartList : [], // Get Previous CartList
			screenWidth: fixedWidth // Set Screen Width
		});

		//alert(JSON.stringify(this.state.cartList));	

		this.getProductContent(this.state.pageID); // Get Product Content	
	}

	// Get Product Content
    getProductContent(pageID) {
    	// AsyncStorage - Save Data to Session Storage
	    AsyncStorage.getItem('usernameTokenSession', (error, result) => {
            if (result) {
                let resultParsed = JSON.parse(result);
                let tokenSession = resultParsed.tokenSession;
                
                return fetch(ipPortAddress() + '/api/product/get_product_list/' + pageID, {
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
		    			searchProductData: responseJson,
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
    getSearchProductResponse(searchProductValue) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
		    if (result) {
		        let resultParsed = JSON.parse(result);
		        let tokenSession = resultParsed.tokenSession;
		        
		        return fetch(ipPortAddress() + '/api/product/search?keyword=' + searchProductValue, {
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

		    		this.setState({searchProductData: responseJson}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
		    }
		});
	}

	// Detail Product Action
	detailProductAction(product_id) {
    	Actions.product_detail_page({productID: product_id, cartList: this.state.cartList}); // go to Detail Product Page
    }

    // Search Page Product Action
	searchPageProductAction(pageID) {
		if (pageID == "" || pageID == 0) {
			this.refs.searchPageProductTxt.focus();
			alert("Search can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
			    if (result) {
			        let resultParsed = JSON.parse(result);
			        let tokenSession = resultParsed.tokenSession;
			        
			        return fetch(ipPortAddress() + '/api/product/get_product_list/' + pageID, {
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

			    		if (responseJson.length == 0) {
			    			alert("Page No "+pageID+" not found");
			    		} else {
			    			this.setState({
				    			searchProductData: responseJson,
				    			pageID: pageID
				    		}); // Get the data from API
			    		}

			    		this.refs.searchPageProductTxt.clear();
		    			this.state.searchPageProductValue = ""
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
    			alert("Page No "+prevPageID+" not found");
    	} else {
    		// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
			    if (result) {
			        let resultParsed = JSON.parse(result);
			        let tokenSession = resultParsed.tokenSession;
			        
			        return fetch(ipPortAddress() + '/api/product/get_product_list/' + prevPageID, {
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
			    			searchProductData: responseJson,
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
		        let tokenSession = resultParsed.tokenSession;
		        
		        return fetch(ipPortAddress() + '/api/product/get_product_list/' + nextPageID, {
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

		    		if (responseJson.length == 0) {
		    			alert("Page No "+nextPageID+" not found");

		    			this.setState({
			    			maxPageID: pageID
			    		}); // Get the data from API
		    		} else {
		    			this.setState({
			    			searchProductData: responseJson,
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

    // Read Enter Key Search Page Product
	handleKeyDownSearchPageProduct(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchPageProductAction(this.state.searchPageProductValue);
	        this.searchPageProductTxt._root.clear();
	    }
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

	        	<TouchableOpacity onPress={() => {this.detailProductAction(product_id)}} key={product_id} style={{borderRadius: 2, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff', margin: 0.5, padding: 5, width: this.state.screenWidth}}>
					<Image source={require('../../logo/profile_picture.png')} style={{width: 90, height: 90}} />
					<Text>{product_name}</Text>
				</TouchableOpacity>
			)
			
		});

	    return (

			// Display
		      
		        <Container>

		        	<AppHeader />

		        	<Header>
			          <Body style={{alignItems: 'center'}}>
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
			          </Body>
			        </Header>

	        		<ScrollView >

	        			<Content contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>

							{searchProductDataResult}

					        {/*this.myKeyboardSpacer()*/}

					        <Text>{this.state.tokenSession}</Text>
	        				
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
		                    	onChangeText={(text) => this.setState({searchPageProductValue: text})}
		                    	value={this.state.searchPageProductValue}
		                    	keyboardType={'web-search'}
		                    	secureTextEntry={false}
		                    	maxLength={20}
		                    	returnKeyType={'search'}
		                    	placeholder={'Jump to page...'}
		                    	enablesReturnKeyAutomatically={true}
		                    	selectionColor={'#233F4A'}
		                    	placeholderTextColor={'#233F4A'}
		                    	underlineColorAndroid={'transparent'}
		                    	ref="searchPageProductTxt"
		                    	/*getRef={(input) => { this.searchPageProductTxt = input; }}*/
		                    	onSubmitEditing={() => {this.searchPageProductAction(this.state.searchPageProductValue)}}
		                    	onKeyPress={this.handleKeyDownSearchPageProduct.bind(this)}
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
module.export = ProductPage;