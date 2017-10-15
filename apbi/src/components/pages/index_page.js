/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 
 * Rio Simatupang
 * 2017
 */

// Import Libraries
import React, { Component } from 'react';
import { AppRegistry, Text, Image, Linking, Dimensions, ScrollView, AppState, Platform, StyleSheet, View } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container, StyleProvider } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';
import { Actions } from 'react-native-router-flux';

// Import My Own Libraries
import { hello, getImage, contentSnippet } from '../../helpers/helpers';

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

export default class IndexPage extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			orientation: isPortrait() ? 'portrait' : 'landscape',
			appState: AppState.currentState,
			currentCount: 3
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
	componentDidMount() {
		// Set timer before going to Login Page
	    this._interval = setInterval(() => {
	        this.timerMine();
	    }, 1000);
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
	        Actions.login_page(); // go to Login Page
	      }
	    } else {
	      clearInterval(this._interval);
	    }
	}

	// Get the data
	render() {

	    return (

			// Display
		      <StyleProvider style={getTheme(apbiTheme)}>
		        <Container>
		        	<Content contentContainerStyle={{flex: 1, backgroundColor: '#233F4A', justifyContent: 'center', alignItems: 'center'}}>
		        		<Image source={require('../../logo/apbi.png')} />
		        	</Content>
		        </Container>
		      </StyleProvider>
							        
	    );
	}

}

// Export this module because we want to import it in the main file
module.export = IndexPage;