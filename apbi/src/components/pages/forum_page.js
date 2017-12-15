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
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container } from 'native-base';
import HTMLView from 'react-native-htmlview';
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

		        this.getForumContent(); // Get Forum Content
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

	// Get Forum Content
    async getForumContent() {
    	const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
    	const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

    	//alert(searchProductValue);

		return fetch('http://' + ipAddress() + ':' + portAddress() + '/api/forum/view_thread?posted_date_from=2016-10-22&posted_date_to=2018-10-22&posted_by=', {
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

    		this.setState({forumContentData: responseJson}); // Get the data from API
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
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
			                <Text>Forum Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>Forum Page</Text>
			            </CardItem>
			    	)
		    	}
	    	} else {
	    		if (this.state.orientation == 'portrait') {
		    		return (
			    		<CardItem key={1}>
			                <Text>Forum Page</Text>
			            </CardItem>
			    	)
		    	} else if (this.state.orientation == 'landscape') {
		    		return (
			    		<CardItem key={1}>
			                <Text>Forum Page</Text>
			            </CardItem>
			    	)
		    	}
	    	}
	    	
	    }*/

	    let forumContentResult = this.state.forumContentData.map((forumContentDataDetail, index) => {
	    	var forum_id = forumContentDataDetail.id;
	    	var forum_title = forumContentDataDetail.title;
	    	var forum_content = forumContentDataDetail.content;
	    	var forum_posted_date = forumContentDataDetail.posted_date;
	    	var forum_posted_by = forumContentDataDetail.posted_by;
	    	var forum_last_update_date = forumContentDataDetail.last_update_date;
	    	var forum_last_update_by = forumContentDataDetail.last_update_by;
	    	var profile_picture = 'https://i.pinimg.com/564x/d7/a6/bd/d7a6bd392433310ff6088dda403c4f85.jpg';
	    	
			return (
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
			        	
			        		<Icon active name = "share" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -10}}>{forum_posted_by} Shares</Text>
			        	
			        		<Icon active name = "happy" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -5}}>{forum_posted_by} Likes</Text>
			        	
		        	</CardItem>
		        </Card>
			)
		});

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		{/*<Text>Forum Page {this.state.usernameLogin}</Text>*/}

		            		{forumContentResult}
						
						</Content>

		            </ScrollView>

		        

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = ForumPage;