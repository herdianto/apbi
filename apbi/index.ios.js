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
import { AppRegistry, BackHandler, ToastAndroid } from 'react-native';
import { Container, StyleProvider } from 'native-base';
import { Router, Scene } from 'react-native-router-flux';

// Import My Own Libraries
import { hello, getImage, contentSnippet } from './src/helpers/helpers';

// Import Components
import AppBody from './src/components/appBody';

// Import Themes
import getTheme from './src/themes/components';
import apbiTheme from './src/themes/variables/apbiTheme';

// Import Pages
import IndexPage from './src/components/pages/index_page';
import LoginPage from './src/components/pages/login_page';
import HomePage from './src/components/pages/home_page';

export default class apbi extends Component {

  // Load Data after Rendering
  componentDidMount() {
    // Disable Back Button
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  // This method is called when a component is being removed from the DOM
  componentWillUnmount() {
    // Disable Back Button
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  // Disable Back Button
  handleBackButton() {
    //ToastAndroid.show('Back button is pressed', ToastAndroid.SHORT);

    BackHandler.exitApp()
    return true;
  }

  render() {
    return (

      // Display
      <StyleProvider style={getTheme(apbiTheme)}>
        <Container>

          <Router>
            <Scene key="index_page" component={IndexPage} title="Index Page" hideNavBar={true} renderBackButton={() => {}} />
            <Scene key="login_page" component={LoginPage} title="Login Page" hideNavBar={true} renderBackButton={() => {}} />
            <Scene key="home_page" component={AppBody} title="Home Page" hideNavBar={true} renderBackButton={() => {}} />
          </Router>

        </Container>
      </StyleProvider>

    );
  }
}

// If you want to change component name, you can change it here
AppRegistry.registerComponent('apbi', () => apbi);
