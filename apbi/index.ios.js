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
import { AppRegistry, Text, View, BackHandler, ToastAndroid, NetInfo, Platform } from 'react-native';
import { Container, StyleProvider } from 'native-base';
import { Router, Scene } from 'react-native-router-flux';
import { Icon } from 'native-base';
import { Actions, ActionConst } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';

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
import RegisterPage from './src/components/pages/register_page';
import ForgotPasswordPage from './src/components/pages/forgot_password_page';

import HomePage from './src/components/pages/home_page';
import AboutPage from './src/components/pages/about_page';
import ForumPage from './src/components/pages/forum_page';
import AddPostForumPage from './src/components/pages/add_post_forum_page';
import AddCommentForumPage from './src/components/pages/add_comment_forum_page';
import ProductPage from './src/components/pages/product_page';
import ProductDetailPage from './src/components/pages/product_detail_page';
import CartPage from './src/components/pages/cart_page';
import ProfilePage from './src/components/pages/profile_page';
import ChangePasswordPage from './src/components/pages/change_password_page';
import EditProfilePage from './src/components/pages/edit_profile_page';
import UpgradeMemberPage from './src/components/pages/upgrade_member_page';
import TransactionPage from './src/components/pages/transaction_page';
import TransactionDetailPage from './src/components/pages/transaction_detail_page';
import PaymentConfirmationPage from './src/components/pages/payment_confirmation_page';
import ContactUsPage from './src/components/pages/contact_us_page';

// Simple component to render something in place of icon
/*const TabIcon = ({ selected, title }) => {
  return (
    <Text style={{color: selected ? 'red' :'black'}}>{title}</Text>
  );
}*/

//Create a dedicated class that will manage the tabBar icon
class TabIcon extends Component {
  render() {
    var color = this.props.selected ? '#5DBCD2' : '#FFF';
    var active = this.props.selected ? true : false;

    if (this.props.title == "Home") {
      var name = "paper";
    } else if (this.props.title == "About") {
      var name = "people";
    } else if (this.props.title == "Forum") {
      var name = "chatbubbles";
    } else if (this.props.title == "Product") {
      var name = "cart";
    } else if (this.props.title == "Profile") {
      var name = "person";
    }

    return (
      <View >
        <Icon active={active} name={name} style={{color: color}}/>
        {/*<Text style={{color: color, fontSize: 12}}>{this.props.title}</Text>*/}
      </View>
    );
  }
}

export default class apbi extends Component {

  // Load Data after Rendering
  componentDidMount() {
    // Disable Back Button
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    // Get Connection Type
    NetInfo.addEventListener('connectionChange', this.handleFirstConnectivityType);

    // Get Connection Status
    NetInfo.isConnected.addEventListener('connectionChange', this.handleFirstConnectivityStatus);
  }

  // This method is called when a component is being removed from the DOM
  componentWillUnmount() {
    // Disable Back Button
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

    // Get Connection Type
    NetInfo.removeEventListener('connectionChange', this.handleFirstConnectivityType);

    // Get Connection Status
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleFirstConnectivityStatus);
  }

  // Disable Back Button
  handleBackButton() {
    ToastAndroid.show('Please use navigation in Application', ToastAndroid.SHORT);

    //BackHandler.exitApp()
    return true;
  }

  // Get Connection Type
  handleFirstConnectivityType(connectionInfo) {
    //alert('Connection Type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
  }

  // Get Connection Status
  handleFirstConnectivityStatus(isConnected) {
    //alert('You are ' + (isConnected ? 'online' : 'offline'));

    if ((isConnected ? 'online' : 'offline') == 'offline') {
      alert('Please check your network and try again');
    }
  }

  // Render Right Button
  renderRightButton = () => {
      return (
        <Icon name="add" onPress={() => {this.goToAddPostForumAction()}} style={{color: '#fff'}} />
      )
  }

  // Go to Add Post Forum
  goToAddPostForumAction() {
    Actions.add_post_forum_page({}); // go to Add Post Forum Page
  }

  // Keyboard Spacer
  myKeyboardSpacer() {
    if (Platform.OS === 'ios') {
        return <KeyboardSpacer />;
    } else {
      return null;
    }
  }

  render() {
    return (

      // Display
      <StyleProvider style={getTheme(apbiTheme)}>
        <Container>

          <Router>
            <Scene key="root">

              <Scene key="index_page" component={IndexPage} title="Index Page" hideNavBar={true} renderBackButton={() => {}} />
              <Scene key="login_page" component={LoginPage} title="Login Page" hideNavBar={true} renderBackButton={() => {}} direction="vertical" />
              
              {/*Tabs after Login*/}
              <Scene key="tabbar" tabs={true} tabBarStyle={{ backgroundColor: '#233F4A' }}>

                {/*Home*/}
                <Scene key="home" title="Home" icon={TabIcon}>
                  <Scene
                    key="home_page"
                    component={HomePage}
                    title="Home Page"
                    hideNavBar={true}
                    initial />
                  
                </Scene>

                {/*About*/}
                <Scene key="about" title="About" icon={TabIcon}>
                  <Scene
                    key="about_page"
                    component={AboutPage}
                    title="About Page"
                    hideNavBar={true}
                    initial />
                  
                </Scene>

                {/*Forum*/}
                <Scene key="forum" title="Forum" icon={TabIcon}>
                  <Scene
                    key="forum_page"
                    component={ForumPage}
                    title="Forum Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}}
                    /*renderRightButton={() => this.renderRightButton()}*/
                    initial />

                    <Scene
                    key="add_post_forum_page"
                    component={AddPostForumPage}
                    title="Add Post"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                    <Scene
                    key="add_comment_forum_page"
                    component={AddCommentForumPage}
                    title="Add Comment"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />
                  
                </Scene>

                {/*Product*/}
                <Scene key="product" title="Product" icon={TabIcon}>
                  <Scene
                    key="product_page"
                    component={ProductPage}
                    title="Product Page"
                    hideNavBar={true}
                    initial />

                  <Scene
                    key="product_detail_page"
                    component={ProductDetailPage}
                    title="Product Detail Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                    <Scene
                    key="cart_page"
                    component={CartPage}
                    title="Cart Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />
                  
                </Scene>

                {/*Profile*/}
                <Scene key="profile" title="Profile" icon={TabIcon}>
                  <Scene
                    key="profile_page"
                    component={ProfilePage}
                    title="Profile Page"
                    hideNavBar={true}
                    initial />

                  <Scene
                    key="upgrade_member_page"
                    component={UpgradeMemberPage}
                    title="Upgrade Member Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="transaction_page"
                    component={TransactionPage}
                    title="My Transaction Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="transaction_detail_page"
                    component={TransactionDetailPage}
                    title="My Transaction Detail Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="payment_confirmation_page"
                    component={PaymentConfirmationPage}
                    title="Payment Confirmation Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="change_password_page"
                    component={ChangePasswordPage}
                    title="Change Password Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="edit_profile_page"
                    component={EditProfilePage}
                    title="Edit Profile Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />

                  <Scene
                    key="contact_us_page"
                    component={ContactUsPage}
                    title="Contact Us Page"
                    hideNavBar={false}
                    navigationBarStyle={{backgroundColor: '#233F4A'}}
                    titleStyle={{color: '#fff'}}
                    leftButtonIconStyle={{tintColor: '#fff'}}
                    barButtonTextStyle={{color: '#fff'}}
                    barButtonIconStyle={{tintColor: '#fff'}} />
                  
                </Scene>
              </Scene>

              <Scene key="forgot_password_page" component={ForgotPasswordPage} title="Forgot Password Page" hideNavBar={true} renderBackButton={() => {}} direction="vertical" />
              <Scene key="register_page" component={RegisterPage} title="Register Page" hideNavBar={true} renderBackButton={() => {}} direction="vertical" />  
          
            </Scene>
          </Router>

          {this.myKeyboardSpacer()}

        </Container>
      </StyleProvider>

      

    );
  }
}

// If you want to change component name, you can change it here
AppRegistry.registerComponent('apbi', () => apbi);
