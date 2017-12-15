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
import { AppRegistry, Text } from 'react-native';
import { Content, Card, CardItem, Body, Container, StyleProvider } from 'native-base';
import { Router, Scene } from 'react-native-router-flux';

// Import My Own Libraries
import { hello, getImage, contentSnippet } from '../helpers/helpers';

// Import Components
import AppHeader from './appHeader';
import AppBodyData from './appBodyData';
import AppFooter from './appFooter';

// Import Themes
import getTheme from '../themes/components';
import apbiTheme from '../themes/variables/apbiTheme';

// Import Pages
import HomePage from './pages/home_page';
import AboutPage from './pages/about_page';
import ForumPage from './pages/forum_page';
import ProductPage from './pages/product_page';
import LoginPage from './pages/login_page';

export default class AppBody extends Component {

  // Send the data from API to the AppBodyData
  // Use Constructor to check if the data is empty
  render() {
    return (
        // Display
	      <StyleProvider style={getTheme(apbiTheme)}>
	        <Container>

	        <AppHeader />

	          <Router>
	            <Scene key="home_page" component={AppBodyData} title="Home Page" hideNavBar={true} renderBackButton={() => {}} usernameLogin={this.props.usernameLogin} />
	            <Scene key="about_page" component={AboutPage} title="About Page" hideNavBar={true} renderBackButton={() => {}} />
	            <Scene key="forum_page" component={ForumPage} title="Forum Page" hideNavBar={true} renderBackButton={() => {}} />
	            <Scene key="product_page" component={ProductPage} title="Product Page" hideNavBar={true} renderBackButton={() => {}} />
	            <Scene key="login_page" component={LoginPage} title="Login Page" hideNavBar={true} renderBackButton={() => {}} />
	          </Router>

	        <AppFooter />  
	          
	        </Container>
	      </StyleProvider>
    );
  }
}

// Export this module because we want to import it in the main file
module.export = AppBody;