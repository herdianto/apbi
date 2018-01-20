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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, View, TextInput, Alert, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Item, Input, Footer, FooterTab, List, ListItem } from 'native-base';
import HTMLView from 'react-native-htmlview';
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

export default class AddCommentForumPage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			isFocused: false,
			commentForumValue: '',
			//commentForumValueAdd: [],
         	//indexCommentForumValueAdd: 1,
         	newTotalComment: this.props.totalComment,
         	currentCount: 3,
         	forumContentCommentData: [],
         	searchPageForumCommentValue: '',
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

	componentDidMount() {
		// Modify Left and Right Button
        Actions.refresh({
        	//title: this.props.product_name,
        	renderBackButton: this.renderLeftButton,
        	//renderRightButton: this.renderRightButton
        });

        this.getForumContentComment(this.state.pageID); // Get Forum Content Comment
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

	// Render Left Button
	renderLeftButton = () => {
	    return (
	    	<Icon name="arrow-back" onPress={() => {this.backButton()}} style={{color: '#fff'}} />
	    )
	}

	// Back Button
	backButton() {
		Actions.forum_page({type:ActionConst.RESET});
	}

	// Get Forum Content Comment
    getForumContentComment(pageID) {
    	// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let tokenSession = resultParsed.tokenSession;
              	
              	return fetch(ipPortAddress() + '/api/forum/get_comment?thread_id=' + this.props.forumID + '&page=' + pageID, {
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
		    			forumContentCommentData: responseJson
		    		}); // Get the data from API
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
          	}
	    });
	}

	// Delete Post Forum Comment Button
	deletePostForumCommentButton(forum_comment_id, forum_comment_content) {
    	//alert("Delete");

    	// Works on both iOS and Android
		Alert.alert(
		  'Delete Comment ' + forum_comment_content,
		  'Are you sure you want to delete this comment ' + forum_comment_content,
		  [
		    /*{text: 'Ask me later', onPress: () => alert('Ask me later pressed')},
		    {text: 'Cancel', onPress: () => alert('Cancel Pressed'), style: 'cancel'},
		    {text: 'OK', onPress: () => alert('OK Pressed')},*/

		    {text: 'Cancel', onPress: () => {}, style: 'cancel'},
		    {text: 'OK', onPress: () => this.deletePostForumCommentAction(forum_comment_id)},
		  ],
		  { cancelable: false }
		)
    }

    // Delete Post Forum Comment Action
	deletePostForumCommentAction(forum_comment_id) {
		// AsyncStorage - Save Data to Session Storage
		AsyncStorage.getItem('usernameTokenSession', (error, result) => {
          	if (result) {
              	let resultParsed = JSON.parse(result);
              	let tokenSession = resultParsed.tokenSession;
              	
              	return fetch(ipPortAddress() + '/api/forum/delete_comment', {
				  method: 'POST',
				  headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',
				  },
				  body: JSON.stringify({
				    id: forum_comment_id,
				    token: tokenSession,
				  })
				})
				.then((response) => response.json())
		    	.then((responseJson) => {
		    		//alert(JSON.stringify(responseJson));

		    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

		    		if (responseJson.message == "Successfully Deleted") {

		    			alert(responseJson.message);
		    			this.getForumContentComment(this.state.pageID); // Reload Page

		    			this.setState({
					        newTotalComment: this.state.newTotalComment - 1
					    })
		    			
		    		}
		    	})
		    	.catch((error) => {
		    		//console.error(error);
		    		
		    		alert(error);
		    	});
          	}
	    });  	
    }

	// Add Comment Forum Action
	addCommentForumAction(comment_forum) {
		if (comment_forum == "") {
			this.commentForumTxt._root.focus();
			alert("Comment can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let tokenSession = resultParsed.tokenSession;
	              	
	              	return fetch(ipPortAddress() + '/api/forum/add_comment', {
					  method: 'POST',
					  headers: {
					    'Accept': 'application/json',
					    'Content-Type': 'application/json',
					  },
					  body: JSON.stringify({
					    forum_id: this.props.forumID,
					    content: comment_forum,
					    token: tokenSession,
					  })
					})
					.then((response) => response.json())
			    	.then((responseJson) => {
			    		//alert(JSON.stringify(responseJson));

			    		//this.setState({loginMessage: responseJson.message}); // Get the data from API

			    		if (responseJson.message == "Successfully Inserted") {

			    			//alert(responseJson.message);

			    			/*this.state.commentForumValueAdd.push(
						    	<ListItem key={this.state.indexCommentForumValueAdd} style={{justifyContent: 'space-between'}}>
					              <View>
						              <Text>{usernameValueContents}</Text>
						              <Text style={{fontSize: 8, color: '#999'}}>a few seconds ago</Text>
					              </View>
					              
					              <Text>{comment_forum}</Text>
					            </ListItem>
						    )
						    this.setState({
						        indexCommentForumValueAdd: this.state.indexCommentForumValueAdd + 1,
						      	commentForumValueAdd: this.state.commentForumValueAdd,
						      	newTotalComment: this.state.newTotalComment + 1
						    })*/

						    this.getForumContentComment(this.state.pageID); // Reload Page

						    this.setState({
						        newTotalComment: this.state.newTotalComment + 1
						    })

			    			this.commentForumTxt._root.clear();
			    			this.state.commentForumValue = "";

			    			this.commentForumTxt._root.focus();
			    			
			    		}
			    	})
			    	.catch((error) => {
			    		//console.error(error);
			    		
			    		alert(error);
			    	});
	          	}
		    });
		}    	
    }

    // Search Page Forum Comment Action
	searchPageForumCommentAction(pageID) {
		if (pageID == "" || pageID == 0) {
			this.refs.searchPageForumCommentTxt.focus();
			alert("Search can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let tokenSession = resultParsed.tokenSession;
	              	
	              	return fetch(ipPortAddress() + '/api/forum/get_comment?thread_id=' + this.props.forumID + '&page=' + pageID, {
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
				    			forumContentCommentData: responseJson,
				    			pageID: pageID,
				    			//indexCommentForumValueAdd: 0,
							    //commentForumValueAdd: [],
				    		}); // Get the data from API
			    		}

			    		this.refs.searchPageForumCommentTxt.clear();
		    			this.state.searchPageForumCommentValue = ""
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
	              	
	              	return fetch(ipPortAddress() + '/api/forum/get_comment?thread_id=' + this.props.forumID + '&page=' + prevPageID, {
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
			    			forumContentCommentData: responseJson,
			    			pageID: prevPageID,
			    			//indexCommentForumValueAdd: 0,
						    //commentForumValueAdd: [],
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
              	
              	return fetch(ipPortAddress() + '/api/forum/get_comment?thread_id=' + this.props.forumID + '&page=' + nextPageID, {
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
			    			forumContentCommentData: responseJson,
			    			pageID: nextPageID,
			    			//indexCommentForumValueAdd: 0,
						    //commentForumValueAdd: [],
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

    // Read Enter Key Search Page Forum Comment
	handleKeyDownSearchPageForumComment(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.searchPageForumCommentAction(this.state.searchPageForumCommentValue);
	        this.searchPageForumCommentTxt._root.clear();
	    }
	}

	// Read Enter Key Comment Forum
	handleKeyDownCommentForum(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.addCommentForumAction(this.state.commentForumValue);
	        this.commentForumTxt._root.clear();
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

    	// Define Passing Variable
    	var forum_id = this.props.forumID;
    	var forum_title = this.props.forumTitle;
    	var forum_content = this.props.forumContent;
    	var forum_posted_date = this.props.forumPostedDate;
    	var forum_posted_by = this.props.forumPostedBy;
    	var forum_last_update_date = this.props.forumLastUpdateDate;
    	var forum_last_update_by = this.props.forumLastUpdateBy;
    	var profile_picture = this.props.profilePicture;
    	var total_comment = this.state.newTotalComment;

    	let forumCommentResult = this.state.forumContentCommentData.map((forumCommentDetail, index) => {
	    	var forum_comment_id = forumCommentDetail.id;
	    	var forum_comment_content = forumCommentDetail.content;
	    	var forum_comment_posted_date = forumCommentDetail.posted_data;
	    	var forum_comment_user_id = forumCommentDetail.posted_by;
	    	var profile_picture = 'https://i.pinimg.com/564x/d7/a6/bd/d7a6bd392433310ff6088dda403c4f85.jpg';

	    	// Delete Comment Button
	    	if (forum_comment_user_id == this.state.usernameSession) {
	    		var deletePostCommentButton = () => {
	    			return (
	    				<Icon name='trash'
	                    	style={{fontSize: 8}}
	                    	onPress={() => {this.deletePostForumCommentButton(forum_comment_id, forum_comment_content)}}
  						/>
	    			)
	    		}
	    	} else {
	    		var deletePostCommentButton = () => {}
	    	}
	    	
			return (
			    <ListItem key={forum_comment_id} style={{justifyContent: 'space-between'}}>
	              <View>
		              <Text>{forum_comment_user_id}</Text>
		              <TimeAgo time = {forum_comment_posted_date} style={{fontSize: 8, color: '#999'}} />
		              {deletePostCommentButton()}
	              </View>
	              
	              <Text>{forum_comment_content}</Text>
	            </ListItem>
			)
		});

		let myAddComment = (newCommentValue) => {
	      return(
	        <List>
	          {newCommentValue}
	        </List>
	      )           
	    }

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

			        		<Card key={forum_id}>
					        	<CardItem>
					        		<Left>
					        			<Thumbnail source={{uri: profile_picture}} />
					        			<Body>
					        				<Text onPress={() => Linking.openURL(link_post)}>{forum_title}</Text>
					        			</Body>
					        		</Left>
					        	</CardItem>

					        	<CardItem>
					        		<FitImage source = {{uri: profile_picture}} />
					        	</CardItem>

					        	<CardItem content>
					        		<HTMLView value = {forum_content} />
					        	</CardItem>

					        	<CardItem>
						        		<Icon active name = "time" />
						        		<Text style={{marginLeft: -5}}><TimeAgo time = {forum_posted_date} /></Text>
						        	
						        		<Icon active name = "text" style={{marginLeft: 10}} />
						        		<Text style={{marginLeft: -10}}>{total_comment} Comments</Text>
						        	
					        	</CardItem>

					        	<Item floatingLabel>
									<Input
				                    	style={{color: '#000', backgroundColor: '#eee'}}
				                    	onChangeText={(text) => this.setState({commentForumValue: text})}
				                    	value={this.state.commentForumValue}
				                    	keyboardType={'web-search'}
				                    	secureTextEntry={false}
				                    	maxLength={20}
				                    	returnKeyType={'go'}
				                    	placeholder={'Add Comment...'}
				                    	enablesReturnKeyAutomatically={true}
				                    	selectionColor={'#000'}
				                    	placeholderTextColor={'#000'}
				                    	underlineColorAndroid={'transparent'}
				                    	/*ref="commentForumTxt"*/
				                    	getRef={(input) => { this.commentForumTxt = input; }}
				                    	onSubmitEditing={() => {this.addCommentForumAction(this.state.commentForumValue)}}
				                    	onKeyPress={this.handleKeyDownCommentForum.bind(this)}
				                    />
			                    </Item>
					        </Card>

					        {/*myAddComment(this.state.commentForumValueAdd)*/}

					        <List>
					        	{forumCommentResult}
					        </List>

					        

					        <Text>{this.state.currentCount}</Text>

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
		                    	onChangeText={(text) => this.setState({searchPageForumCommentValue: text})}
		                    	value={this.state.searchPageForumCommentValue}
		                    	keyboardType={'numeric'}
		                    	secureTextEntry={false}
		                    	maxLength={20}
		                    	returnKeyType={'search'}
		                    	placeholder={'Jump to page...'}
		                    	enablesReturnKeyAutomatically={true}
		                    	selectionColor={'#233F4A'}
		                    	placeholderTextColor={'#233F4A'}
		                    	underlineColorAndroid={'transparent'}
		                    	ref="searchPageForumCommentTxt"
		                    	/*getRef={(input) => { this.searchPageForumCommentTxt = input; }}*/
		                    	onSubmitEditing={() => {this.searchPageForumCommentAction(this.state.searchPageForumCommentValue)}}
		                    	onKeyPress={this.handleKeyDownSearchPageForumComment.bind(this)}
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

	    			{/*this.myKeyboardSpacer()*/}

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = AddCommentForumPage;