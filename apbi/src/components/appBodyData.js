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
import { AppRegistry, Text, Image } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';

import AppHeader from './appHeader';
//import AppFooter from './appFooter';
import HomePage from './pages/home_page';

// Import Files
import { hello, getImage, contentSnippet } from '../helpers/helpers';

export default class AppBodyData extends Component {

	// Send the data from API to the HomePage
	// Use Constructor to check if the data is empty
	render() {
		return (
	        
		        <HomePage />
	        
	    );
	}
}

// Export this module because we want to import it in the main file
module.export = AppBodyData;