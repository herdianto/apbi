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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, Alert, TextInput, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Footer, FooterTab, Input, Item } from 'native-base';
import HTMLView from 'react-native-htmlview';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import FileSystem from 'react-native-filesystem';
//import HideableView from 'react-native-hideable-view';

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

export default class ForumPage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			forumContentData: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			currentCount: 3,
			newTotalPostForum: 0,
			searchPageForumValue: '',
			pageID: 1,
			maxPageID: 0,
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
		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;

              	if (tokenSession == 'tokenLogout') {
		      		//alert("Please Login");

    				Actions.login_page({pageSession: 'forum_page', type:ActionConst.RESET}); // go to Login Page
		      	} else {
		      		this.getForumContent(this.state.pageID); // Get Forum Content
		      	}
            }
        })
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

	// Render Right Button
	renderRightButton = () => {
	    return (
	    	<Icon name="add" onPress={() => {this.goToAddPostForumAction()}} style={{color: '#fff'}} />
	    )
	}

	// Go to Add Post Forum
	goToAddPostForumAction() {
    	Actions.add_post_forum_page({}); // go to Add Post Forum Page
    }

    // Go to Add Comment Forum
	goToAddCommentForumAction(forum_id, forum_title, forum_content, forum_posted_date, forum_posted_by, forum_last_update_date, forum_last_update_by, forum_picture, forum_profile_picture, total_comment) {
    	Actions.add_comment_forum_page({forumID: forum_id, forumTitle: forum_title, forumContent: forum_content, forumPostedDate: forum_posted_date, forumPostedBy: forum_posted_by, forumLastUpdateDate: forum_last_update_date, forumLastUpdateBy: forum_last_update_by, forum_picture: forum_picture, forum_profile_picture: forum_profile_picture, totalComment: total_comment}); // go to Add Comment Forum Page
    }

	// Get Forum Content
    getForumContent(pageID) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
              	
              	return fetch(ipPortAddress() + '/api/forum/view_thread?posted_date_from=2016-10-22&posted_date_to=2018-10-22&posted_by=&page=' + pageID, {
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
		    			forumContentData: responseJson,
		    			newTotalPostForum: responseJson.length // total post
		    		}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
          	}
	    });
	}

	// Delete Post Forum Button
	deletePostForumButton(forum_id, forum_title, forum_content) {
    	//alert("Delete");

    	// Works on both iOS and Android
		Alert.alert(
		  'Delete Thread ' + forum_title,
		  'Are you sure you want to delete this thread ' + forum_title,
		  [
		    /*{text: 'Ask me later', onPress: () => alert('Ask me later pressed')},
		    {text: 'Cancel', onPress: () => alert('Cancel Pressed'), style: 'cancel'},
		    {text: 'OK', onPress: () => alert('OK Pressed')},*/

		    {text: 'Cancel', onPress: () => {}, style: 'cancel'},
		    {text: 'OK', onPress: () => this.deletePostForumAction(forum_id, forum_title, forum_content)},
		  ],
		  { cancelable: false }
		)
    }

    // Delete Post Forum Action
	deletePostForumAction(forum_id, forum_title, forum_content) {
		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let usernameSession = resultParsed.usernameSession;
              	let tokenSession = resultParsed.tokenSession;
              	let pageSession = resultParsed.pageSession;
              	
              	return fetch(ipPortAddress() + '/api/forum/update_thread', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({
				    id: forum_id,
				    title: forum_title,
				    content: forum_content,
				    status: 'not_active',
				    token: tokenSession,
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		if (responseJson.message == "Successfully Updated") {

		    			alert(responseJson.message);
		    			this.getForumContent(this.state.pageID); // Reload Page
		    			
		    		}
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	}); 
          	}
	    }); 	
    }

    // Search Page Forum Action
	searchPageForumAction(pageID) {
		if (pageID == "" || pageID == 0) {
			this.refs.searchPageForumTxt.focus();
			alert("Search can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	let pageSession = resultParsed.pageSession;
	              	
	              	return fetch(ipPortAddress() + '/api/forum/view_thread?posted_date_from=2016-10-22&posted_date_to=2018-10-22&posted_by=&page=' + pageID, {
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
				    			forumContentData: responseJson,
				    			pageID: pageID
				    		}); // Get the data from API
			    		}

			    		this.refs.searchPageForumTxt.clear();
		    			this.state.searchPageForumValue = ""
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
	              	
	              	return fetch(ipPortAddress() + '/api/forum/view_thread?posted_date_from=2016-10-22&posted_date_to=2018-10-22&posted_by=&page=' + prevPageID, {
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
			    			forumContentData: responseJson,
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
              	
              	return fetch(ipPortAddress() + '/api/forum/view_thread?posted_date_from=2016-10-22&posted_date_to=2018-10-22&posted_by=&page=' + nextPageID, {
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
			    			forumContentData: responseJson,
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

    // Read Enter Key Search Page Forum
	handleKeyDownSearchPageForum(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchPageForumAction(this.state.searchPageForumValue);
	        this.searchPageForumTxt._root.clear();
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

	    let forumContentResult = this.state.forumContentData.map((forumContentDataDetail, index) => {
	    	var forum_id = forumContentDataDetail.id;
	    	var forum_title = forumContentDataDetail.title;
	    	var forum_content = forumContentDataDetail.content;
	    	var forum_posted_date = forumContentDataDetail.posted_date;
	    	var forum_posted_by = forumContentDataDetail.posted_by;
	    	var forum_last_update_date = forumContentDataDetail.last_update_date;
	    	var forum_last_update_by = forumContentDataDetail.last_update_by;
	    	var forum_profile_picture = forumContentDataDetail.user_image;
	    	var forum_profile_picture_full = forum_profile_picture != null ? ipPortAddress() + forum_profile_picture + '?token=' + this.state.tokenSession + '&time=' + new Date().getTime() : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg';
	    	var forum_picture = forumContentDataDetail.picture;
	    	var forum_picture_full = ipPortAddress() + forum_picture + '?token=' + this.state.tokenSession;

	    	//var forum_comment = forumContentDataDetail.comment;
	    	var total_comment = forumContentDataDetail.comment.length;

	    	// Display Forum Image
	    	if (forum_picture != null) {
	    		var displayForumImage = () => {
	    			return (
	    				<CardItem>
			        		<FitImage source = {{uri: forum_picture_full}} style={{}} />
			        	</CardItem>
	    			)
	    		}
	    	} else {
	    		var displayForumImage = () => {}
	    	}

	    	// Delete Post Button
	    	if (forum_posted_by == this.state.usernameSession) {
	    		var deletePostButton = () => {
	    			return (
	    				<Icon name='trash'
	                    	style={{marginLeft: 10}}
	                    	onPress={() => {this.deletePostForumButton(forum_id, forum_title, forum_content)}}
  						/>
	    			)
	    		}
	    	} else {
	    		var deletePostButton = () => {}
	    	}
	    	
			return (
				<Card key={forum_id}>
		        	<CardItem>
		        		<Left>
		        			<Thumbnail source={{uri: forum_profile_picture_full}} />
		        			<Body>
		        				<Text>{forum_posted_by}</Text>
		        			</Body>
		        		</Left>
		        	</CardItem>

		        	<CardItem>
		        		<Text style={{fontWeight: 'bold', fontSize: 20}}>{forum_title}</Text>
		        	</CardItem>

		        	{displayForumImage()}

		        	<CardItem content>
		        		<HTMLView value = {forum_content} />
		        	</CardItem>

		        	<CardItem>
			        		<Icon active name = "time" />
			        		<Text style={{marginLeft: -5}}><TimeAgo time = {forum_posted_date} /></Text>
			        	
			        		<Icon active name = "text" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -10}} onPress={() => {this.goToAddCommentForumAction(forum_id, forum_title, forum_content, forum_posted_date, forum_posted_by, forum_last_update_date, forum_last_update_by, forum_picture, forum_profile_picture, total_comment)}}>{total_comment} Comments</Text>
			        	
			        		{deletePostButton()}
		        	</CardItem>
		        </Card>
			)
		});

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		{/*<Text>Forum Page {this.state.tokenSession}</Text>*/}

		            		{forumContentResult}

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
	                    	onChangeText={(text) => this.setState({searchPageForumValue: text})}
	                    	value={this.state.searchPageForumValue}
	                    	keyboardType={'numeric'}
	                    	secureTextEntry={false}
	                    	maxLength={20}
	                    	returnKeyType={'search'}
	                    	placeholder={'Jump to page...'}
	                    	enablesReturnKeyAutomatically={true}
	                    	selectionColor={'#233F4A'}
	                    	placeholderTextColor={'#233F4A'}
	                    	underlineColorAndroid={'transparent'}
	                    	ref="searchPageForumTxt"
	                    	/*getRef={(input) => { this.searchPageForumTxt = input; }}*/
	                    	onSubmitEditing={() => {this.searchPageForumAction(this.state.searchPageForumValue)}}
	                    	onKeyPress={this.handleKeyDownSearchPageForum.bind(this)}
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
module.export = ForumPage;