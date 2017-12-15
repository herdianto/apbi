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
import { AppRegistry, Text } from 'react-native';
import { Footer, FooterTab, Button, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

export default class AppFooter extends Component {

    // Constructor
    constructor() {
        super();
        this.state = {
            activeTabName: 'home_page'
        }
    }

    // Tab Action
    tabAction(tab) {
        this.setState({activeTabName: tab});
        if (tab === 'home_page') {
            Actions.home_page();
        } else if (tab === 'about_page') {
            Actions.about_page();
        }  else if (tab === 'forum_page') {
            Actions.forum_page();
        } else if (tab === 'product_page') {
            Actions.product_page();
        }
    }

  render() {
    return (
      
        <Footer>
        	<FooterTab>
        		<Button active={(this.state.activeTabName === 'home_page')?true:false} onPress={() => {this.tabAction('home_page')}}>
        			<Icon active name="home" />
        		</Button>

                <Button active={(this.state.activeTabName === 'about_page')?true:false} onPress={() => {this.tabAction('about_page')}}>
                    <Icon active name="people" />
                </Button>

                <Button active={(this.state.activeTabName === 'forum_page')?true:false} onPress={() => {this.tabAction('forum_page')}}>
                    <Icon active name="chatbubbles" />
                </Button>

        		<Button active={(this.state.activeTabName === 'product_page')?true:false} onPress={() => {this.tabAction('product_page')}}>
        			<Icon name="cart" />
        		</Button>
        	</FooterTab>
        </Footer>
        
      
    );
  }
}

// Export this module because we want to import it in the main file
module.export = AppFooter;