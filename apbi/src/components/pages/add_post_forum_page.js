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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, Item, Input, Footer, FooterTab } from 'native-base';
import HTMLView from 'react-native-htmlview';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FileSystem from 'react-native-filesystem';
import ImagePicker from 'react-native-image-picker';

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

export default class AddPostForumPage extends Component {

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
			titleForumValue: '',
			contentForumValue: '',
			contentBoxHeight: 0,
			forumPictureSource: '',
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

        // Get Content Box Height to Make it Fixed
		const dim = Dimensions.get('screen');
		const fixedContentBoxHeight = dim.height - 367;

		this.setState({
			contentBoxHeight: fixedContentBoxHeight // Set Screen Width
		});
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

	// Add Post Forum Action
	addPostForumAction(title_forum, content_forum) {
		if (title_forum == "") {
			this.titleForumTxt._root.focus();
			alert("Title can not be empty");
		} else if (content_forum == "") {
			this.contentForumTxt._root.focus();
			alert("Content can not be empty");
		} else {
			// AsyncStorage - Save Data to Session Storage
			AsyncStorage.getItem('usernameTokenSession', (error, result) => {
	          	if (result) {
	              	let resultParsed = JSON.parse(result);
	              	let usernameSession = resultParsed.usernameSession;
	              	let tokenSession = resultParsed.tokenSession;
	              	
	              	var data = new FormData();
					data.append('user_id', usernameSession);
					data.append('title', title_forum);
					data.append('content', content_forum);

					if (this.state.forumPictureSource != '') {
						data.append('forum_pic', {
						  uri: this.state.forumPictureSource.uri,
						  type: 'image/jpeg', // avatarSource.type
						  name: this.state.forumPictureSource.fileName
						});	
					}
					

	              	return fetch(ipPortAddress() + '/api/forum/add_thread', {
						method: 'POST',
						headers: {
							'x-token': tokenSession
						},
						body: data
					})
					.then((response) => response.json())
			    	.then((responseJson) => {
			    		if (responseJson.message == "Successfully Inserted") {

			    			alert(responseJson.message);

			    			this.titleForumTxt._root.clear();
			    			this.state.titleForumValue = ""

			    			this.contentForumTxt._root.clear();
				    		this.state.contentForumValue = ""

				    		this.titleForumTxt._root.focus();
			    			
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

    // Upload Forum Picture
    uploadForumPictureButton() {
    	/**
		 * The first arg is the options object for customization (it can also be null or omitted for default options),
		 * The second arg is the callback which sends object: response (more info below in README)
		 */

		// More info on all the options is below in the README...just some common use cases shown here
		var options = {
		  /*title: 'Select Avatar',
		  customButtons: [
		    {name: 'fb', title: 'Choose Photo from Facebook'},
		  ],*/
		  	quality: 1.0,
      		maxWidth: 500,
      		maxHeight: 500,
			storageOptions: {
		    	skipBackup: true,
		    	path: 'images'
		  	}
		};

		ImagePicker.showImagePicker(options, (response) => {
		  //alert('Response = ', response);

		  if (response.didCancel) {
		    //alert('User cancelled image picker');
		  }
		  else if (response.error) {
		    //alert('ImagePicker Error: ', response.error);
		  }
		  else if (response.customButton) {
		    //alert('User tapped custom button: ', response.customButton);
		  }
		  else {
		    let source = { uri: response.uri, fileName: response.fileName, type: response.type };

		    // You can also display the image using data:
		    // let source = { uri: 'data:image/jpeg;base64,' + response.data };

		    //alert(source.uri);

		    this.setState({
		      forumPictureSource: source
		    });
		  }
		});
    }

	// Read Enter Key Post Forum
	handleKeyDownPostForum(e) {
	    if(e.nativeEvent.key == "Enter"){
	        this.addPostForumAction(this.state.titleForumValue, this.state.contentForumValue);
	        this.titleForumTxt._root.clear();
	        this.contentForumTxt._root.clear();
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

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

			        		<Item floatingLabel>
				            	<Input
			                    	style={{color: '#000'}}
			                    	onChangeText={(text) => this.setState({titleForumValue: text})}
			                    	value={this.state.titleForumValue}
			                    	keyboardType={'default'}
			                    	secureTextEntry={false}
			                    	maxLength={60}
			                    	returnKeyType={'next'}
			                    	placeholder={'Title'}
			                    	enablesReturnKeyAutomatically={true}
			                    	selectionColor={'#000'}
			                    	placeholderTextColor={'#000'}
			                    	underlineColorAndroid={'transparent'}
			                    	/*ref="postForumTxt"*/
			                    	getRef={(input) => { this.titleForumTxt = input; }}
			                    	/*onSubmitEditing={() => {this.addPostForumAction(this.state.titleForumValue)}}
			                    	onKeyPress={this.handleKeyDownPostForum.bind(this)}*/
			                    	onFocus={this.handleInputFocus}
			                    />
		                    </Item>

		            		<Item floatingLabel>
				            	<Input
			                    	style={{color: '#000', minHeight: this.state.contentBoxHeight, textAlignVertical: "top"}}
			                    	onChangeText={(text) => this.setState({contentForumValue: text})}
			                    	value={this.state.contentForumValue}
			                    	keyboardType={'default'}
			                    	secureTextEntry={false}
			                    	/*maxLength={20}*/
			                    	returnKeyType={'go'}
			                    	placeholder={'Content...'}
			                    	enablesReturnKeyAutomatically={true}
			                    	selectionColor={'#000'}
			                    	placeholderTextColor={'#000'}
			                    	underlineColorAndroid={'transparent'}
			                    	/*ref="postForumTxt"*/
			                    	getRef={(input) => { this.contentForumTxt = input; }}
			                    	/*onSubmitEditing={() => {this.addPostForumAction(this.state.titleForumValue, this.state.contentForumValue)}}
			                    	onKeyPress={this.handleKeyDownPostForum.bind(this)}*/
			                    	multiline={true}
			                    	onFocus={this.handleInputFocus}
			                    />
		                    </Item>

		                    <TouchableOpacity onPress={() => {this.uploadForumPictureButton()}} style={{alignItems: 'center'}}>
			            		<Image source = {{uri: this.state.forumPictureSource ? this.state.forumPictureSource.uri : 'https://www.sparklabs.com/forum/styles/comboot/theme/images/default_avatar.jpg'}} style={{width: 150, height: 150}} />
			            	</TouchableOpacity>

		                    {/*<Text>{this.state.tokenSession}</Text>*/}
						
						</Content>

		            </ScrollView>

					<Footer style={{backgroundColor: '#eee'}}>
						<FooterTab>
		    				<Button onPress={() => {this.addPostForumAction(this.state.titleForumValue, this.state.contentForumValue)}}>
					            <Text>Post</Text>
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
module.export = AddPostForumPage;