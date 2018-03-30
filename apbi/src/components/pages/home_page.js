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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, TextInput, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Item, Input, Header, Footer, FooterTab } from 'native-base';
import HTMLView from 'react-native-htmlview';
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

export default class HomePage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			newsContentData: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			currentCount: 3,
			pageID: 1,
			maxPageID: 0,
			searchNewsValue: "",
			searchPageNewsValue: '',
			errorMessage: "",
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
		this.getNewsContent(this.state.pageID); // Get News Content
	}

	// Unmount the variable
	componentWillUnmount() {
		// When a component unmounts, these timers have to be cleared and
	    // so that you are not left with zombie timers doing things when you did not expect them to be there.
	    clearInterval(this._interval);
	}

	// Set time count from 3 2 1
	timerMine() {
	    var newCount = this.state.currentCount - 1;

	    if (newCount >= 0) {
	      this.setState({
	        currentCount: newCount
	      })

	      if (newCount == 0) {
	      	this.checkToken(); // Check Token
	      }
	    } else {
	      clearInterval(this._interval);
	    }
	}

	// Get News Content
    getNewsContent(pageID) {
    	return fetch(ipPortAddress() + '/news/get_news?page=' + pageID, {
        	method: 'GET',
        	headers: {
            	'Accept': 'application/json',
            	'Content-Type': 'application/json'
          }
      	})
    	.then((response) => response.json())
    	.then((responseJson) => {
    		this.setState({newsContentData: responseJson}); // Get the data from API
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Search News Action
	searchNewsAction(searchNewsValue) {
    	if (searchNewsValue == "") {
    		alert("Your search news is empty");
    		
    		this.searchNewsTxt._root.focus();
    		this.setState({errorMessage: "Your search news is empty"})
    	} else {
    		this.getSearchNewsResponse(searchNewsValue); // Get Search News Response

    		this.searchNewsTxt._root.clear();
		    this.state.searchNewsValue = ""
    	}
    }

    // Get Search News Response
    getSearchNewsResponse(searchNewsValue) {
        return fetch(ipPortAddress() + '/news/search?keyword=' + searchNewsValue, {
        	method: 'GET',
        	headers: {
            	'Accept': 'application/json',
            	'Content-Type': 'application/json'
          }
      	})
    	.then((response) => response.json())
    	.then((responseJson) => {
    		//alert(JSON.stringify(responseJson));

    		this.setState({newsContentData: responseJson}); // Get the data from API
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Search Page News Action
	searchPageNewsAction(pageID) {
		if (pageID == "" || pageID == 0) {
			this.refs.searchPageNewsTxt.focus();
			alert("Search can not be empty");
		} else {
		  	return fetch(ipPortAddress() + '/news/get_news?page=' + pageID, {
	        	method: 'GET',
	        	headers: {
	            	'Accept': 'application/json',
	            	'Content-Type': 'application/json'
	          }
	      	})
	    	.then((response) => response.json())
	    	.then((responseJson) => {
	    		if (responseJson.length == 0) {
	    			alert("Page No "+pageID+" not found");
	    		} else {
	    			this.setState({
		    			newsContentData: responseJson,
		    			pageID: pageID
		    		}); // Get the data from API
	    		}

	    		this.refs.searchPageNewsTxt.clear();
    			this.state.searchPageNewsValue = ""
	    	})
	    	.catch((error) => {
	    		//console.error(error);
	    		
	    		alert(error);
	    	});
		}
    }

    // Prev Action
    prevAction(pageID) {
    	var prevPageID = parseInt(pageID) - 1;
        
        if (prevPageID == 0) {
			alert("This is the first page");
		} else {
			return fetch(ipPortAddress() + '/news/get_news?page=' + prevPageID, {
	        	method: 'GET',
	        	headers: {
	            	'Accept': 'application/json',
	            	'Content-Type': 'application/json'
	          }
	      	})
	    	.then((response) => response.json())
	    	.then((responseJson) => {
	    		this.setState({
	    			newsContentData: responseJson,
	    			pageID: prevPageID
	    		}); // Get the data from API
	    	})
	    	.catch((error) => {
	    		//console.error(error);
	    		
	    		alert(error);
	    	});
		}
    }

	// Next Action
	nextAction(pageID) {
		var nextPageID = parseInt(pageID) + 1;

      	return fetch(ipPortAddress() + '/news/get_news?page=' + nextPageID, {
        	method: 'GET',
        	headers: {
            	'Accept': 'application/json',
            	'Content-Type': 'application/json'
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
	    			newsContentData: responseJson,
	    			pageID: nextPageID
	    		}); // Get the data from API
    		}
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
    }

    // Read Enter Key Search Page News
	handleKeyDownSearchPageNews(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchPageNewsAction(this.state.searchPageNewsValue);
	        this.searchPageNewsTxt._root.clear();
	    }
	}

	// Read Enter Key Search News
	handleKeyDownSearchNews(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchNewsAction(this.state.searchNewsValue);
	        this.searchNewsTxt._root.clear();
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

		let newsContentResult = this.state.newsContentData.map((newsContentDataDetail, index) => {
	    	var news_id = newsContentDataDetail.id;
	    	var news_title = newsContentDataDetail.title;
	    	var news_content = newsContentDataDetail.content;
	    	var news_posted_date = newsContentDataDetail.posted_date;
	    	var news_posted_by = newsContentDataDetail.posted_by;
	    	var news_status = newsContentDataDetail.status;
	    	var news_last_update_date = newsContentDataDetail.last_update_date;
	    	var news_last_update_by = newsContentDataDetail.last_update_by;
	    	var news_user_picture = newsContentDataDetail.user_picture;
	    	var news_user_picture_full = news_user_picture ? ipPortAddress() + news_user_picture : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg';
	    	var news_picture = newsContentDataDetail.picture;
	    	var news_picture_full = ipPortAddress() + news_picture;
	    	
			// Display News Image
	    	if (news_picture != null) {
	    		var displayNewsImage = () => {
	    			return (
	    				<CardItem>
			        		<FitImage source = {{uri: news_picture_full}} style={{}} />
			        	</CardItem>
	    			)
	    		}
	    	} else {
	    		var displayNewsImage = () => {}
	    	}

			return (
				<Card key={index}>
		        	<CardItem>
		        		<Left>
		        			<Thumbnail source={{uri: news_user_picture_full}} />
		        			<Body>
		        				<Text>{news_posted_by}</Text>
		        			</Body>
		        		</Left>
		        	</CardItem>

		        	<CardItem>
		        		<Text style={{fontWeight: 'bold', fontSize: 20}}>{news_title}</Text>
		        	</CardItem>

		        	{displayNewsImage()}

		        	<CardItem content>
		        		<HTMLView value = {news_content} />
		        	</CardItem>

		        	<CardItem>
			        		<Icon active name = "time" />
			        		<Text style={{marginLeft: -5}}><TimeAgo time = {news_posted_date} /></Text>
			        	
			        		{/*<Icon active name = "share" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -10}}>{news_posted_by} Shares</Text>
			        	
			        		<Icon active name = "happy" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -5}}>{news_posted_by} Likes</Text>*/}
			        	
		        	</CardItem>
		        </Card>
			)
		});

	    return (

			<Container>

				<AppHeader />
		        
					<Header>
			          <Body style={{alignItems: 'center'}}>
			            <Item floatingLabel>
			            	<Input
		                    	style={{color: '#fff'}}
		                    	onChangeText={(text) => this.setState({searchNewsValue: text})}
		                    	value={this.state.searchNewsValue}
		                    	keyboardType={'web-search'}
		                    	secureTextEntry={false}
		                    	maxLength={20}
		                    	returnKeyType={'search'}
		                    	placeholder={'Search News'}
		                    	enablesReturnKeyAutomatically={true}
		                    	selectionColor={'#fff'}
		                    	placeholderTextColor={'#fff'}
		                    	underlineColorAndroid={'transparent'}
		                    	/*ref="searchNewsTxt"*/
		                    	getRef={(input) => { this.searchNewsTxt = input; }}
		                    	onSubmitEditing={() => {this.searchNewsAction(this.state.searchNewsValue)}}
		                    	onKeyPress={this.handleKeyDownSearchNews.bind(this)}
		                    />
	                    </Item>

	                    {/*<Icon name='search'
	                    	style={{marginLeft: 280, marginTop: -28, color: '#fff'}}
  							onPress={() => {this.searchNewsAction(this.state.searchNewsValue)}}
  						/>*/}
			          </Body>
			        </Header>

					<ScrollView >
		      
			        	<Content>

		            		{/*<Text>Welcome {this.state.tokenSession}</Text>*/}

		            		{newsContentResult}

		            		{/*<Text>{this.state.currentCount}</Text>*/}
						
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
	                    	onChangeText={(text) => this.setState({searchPageNewsValue: text})}
	                    	value={this.state.searchPageNewsValue}
	                    	keyboardType={'numeric'}
	                    	secureTextEntry={false}
	                    	maxLength={20}
	                    	returnKeyType={'search'}
	                    	placeholder={'Jump to page...'}
	                    	enablesReturnKeyAutomatically={true}
	                    	selectionColor={'#233F4A'}
	                    	placeholderTextColor={'#233F4A'}
	                    	underlineColorAndroid={'transparent'}
	                    	ref="searchPageNewsTxt"
	                    	/*getRef={(input) => { this.searchPageNewsTxt = input; }}*/
	                    	onSubmitEditing={() => {this.searchPageNewsAction(this.state.searchPageNewsValue)}}
	                    	onKeyPress={this.handleKeyDownSearchPageNews.bind(this)}
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
module.export = HomePage;