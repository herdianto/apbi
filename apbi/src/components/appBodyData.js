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
import { AppRegistry, Text, Image } from 'react-native';
import { Content, Card, CardItem, Body, Left, Thumbnail, Button, Icon, Container } from 'native-base';
import TimeAgo from 'react-native-timeago';
import FitImage from 'react-native-fit-image';

// Import My Own Libraries
import { hello, getImage, contentSnippet } from '../helpers/helpers';

// Import Components
import HomePage from './pages/home_page';

export default class AppBodyData extends Component {

	render() {
		return (
	        
		        <HomePage usernameLogin={this.props.usernameLogin} />
	        
	    );
	}
}

// Export this module because we want to import it in the main file
module.export = AppBodyData;