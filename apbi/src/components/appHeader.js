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
import { Header, Left, Button, Icon, Body, Title, Right } from 'native-base';

export default class AppHeader extends Component {
	
  render() {
    return (
      
        <Header>
          <Body style={{alignItems: 'center'}}>
            <Image source={require('../logo/apbi_logo_landscape.png')} style={{width: 150, height: 30}} />
          </Body>
        </Header>
        
      
    );
  }
}

// Export this module because we want to import it in the main file
module.export = AppHeader;