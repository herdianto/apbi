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
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, AsyncStorage } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container } from 'native-base';
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

export default class AboutPage extends Component {

	// Create Constructor because the "data" (this.state.data) will be empty
	// this.state.data gets from data: responseJson.feed.entry
	// And the "data" will go to the appBodyData.js
	constructor(props) {
		super(props);
		this.state = {
			aboutContentData: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			usernameLogin: '',
			currentCount: 3,
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
		this.getAboutContent(); // Get About Content
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

	// Get About Content
    getAboutContent() {
    	return fetch(ipPortAddress() + '/about/get_about', {
        	method: 'GET',
        	headers: {
            	'Accept': 'application/json',
            	'Content-Type': 'application/json'
          }
      	})
    	.then((response) => response.json())
    	.then((responseJson) => {
    		this.setState({aboutContentData: [responseJson]}); // Get the data from API
    	})
    	.catch((error) => {
    		//console.error(error);
    		
    		alert(error);
    	});
	}

	// Get the data
	render() {

		let aboutContentResult = this.state.aboutContentData.map((aboutContentDataDetail, index) => {
	    	var about_id = aboutContentDataDetail.id;
	    	var about_title = aboutContentDataDetail.title;
	    	var about_content = aboutContentDataDetail.content;
	    	var about_posted_date = aboutContentDataDetail.posted_date;
	    	var about_posted_by = aboutContentDataDetail.posted_by;
	    	var about_last_update_date = aboutContentDataDetail.last_update_date;
	    	var about_last_update_by = aboutContentDataDetail.last_update_by;
	    	var profile_picture = 'https://i.pinimg.com/564x/d7/a6/bd/d7a6bd392433310ff6088dda403c4f85.jpg';
	    	
			return (
				<Card key={about_id}>
		        	<CardItem>
		        		<Left>
		        			<Thumbnail source={{uri: profile_picture}} />
		        			<Body>
		        				<Text onPress={() => Linking.openURL(link_post)}>{about_title}</Text>
		        			</Body>
		        		</Left>
		        	</CardItem>

		        	<CardItem>
		        		<FitImage source = {{uri: profile_picture}} />
		        	</CardItem>

		        	<CardItem content>
		        		<HTMLView value = {about_content} />
		        	</CardItem>

		        	<CardItem>
			        		<Icon active name = "time" />
			        		<Text style={{marginLeft: -5}}><TimeAgo time = {about_posted_date} /></Text>
			        	
			        		{/*<Icon active name = "share" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -10}}>{about_posted_by} Shares</Text>
			        	
			        		<Icon active name = "happy" style={{marginLeft: 10}} />
			        		<Text style={{marginLeft: -5}}>{about_posted_by} Likes</Text>*/}
			        	
		        	</CardItem>
		        </Card>
			)
		});

	    return (

			<Container>
		        
		        <AppHeader />
		
					<ScrollView >
		      
			        	<Content>

		            		<Text>About Page {this.state.tokenSession}</Text>

		            		{aboutContentResult}

		            		{/*<Text>{this.state.currentCount}</Text>*/}
						
						</Content>

		            </ScrollView>

		        

            </Container>
	        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = AboutPage;