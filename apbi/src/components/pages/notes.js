// Back Button
/*backButton() {
	//Actions.product_page({cartList: this.state.cartList});
	alert("Back");
}*/

// Render Left Button
/*renderLeftButton = () => {
    return (
    	<Icon name="arrow-back" onPress={() => {this.backButton()}} style={{color: '#fff'}} />
    )
}*/

//alert(JSON.stringify(responseJson));

// Write Token File
/*async writeTokenFile(tokenValue, usernameValue) {
    const tokenValueContents = tokenValue;
    const usernameValueContents = usernameValue;

    await FileSystem.writeToFile('tokenFile.txt', tokenValueContents.toString());
    await FileSystem.writeToFile('usernameFile.txt', usernameValueContents.toString());
    
    //await FileSystem.writeToFile('tokenFile.txt', fileContents.toString(), FileSystem.storage.important); //exclude file from the backup
    //alert('file is written');
}*/

// Read Token File
/*async readTokenFile() {
    const tokenValueContents = await FileSystem.readFile('tokenFile.txt');
    const usernameValueContents = await FileSystem.readFile('usernameFile.txt');

    this.setState({
      checkPlayingStatus: fileContents
    })

    const checkPath = await FileSystem.absolutePath('tokenFile.txt');
    
    alert(checkPath);
}*/

/*async checkIfFileExists() {
	const fileTokenExists = await FileSystem.fileExists('tokenFile.txt');
	const fileUsernameExists = await FileSystem.fileExists('usernameFile.txt');
	const directoryExists = await FileSystem.directoryExists('my-directory/my-file.txt');
	
	console.log(`file exists: ${fileExists}`);
	console.log(`directory exists: ${directoryExists}`);

	alert(`file exists: ${fileTokenExists}`);
}*/

==============================================

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

==============================

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


flow mobile
===========
index.android.js => because index_page.js is defined first, it will direct to index_page.js first => Home | About | Forum | Product | Profile

You can define renderbackbutton and renderrightbutton in index.android.js or in forum_page.js but use it in componentdidmount
Actions.refresh({
  //title: this.props.product_name,
  renderRightButton: this.renderRightButton,
  //renderRightButton: this.renderRightButton
});

appBody, appBodyData, appBodyDataSecond are not used
appFooter and appHeader are still used
appFooter is used to make navigation displayed on top of router navigation

refresh automatically
======================
- use interval
--------------
// Set Timer to change the question
this._interval = setInterval(() => {
    this.getForumContent(this.state.pageID); // Get Forum Content
}, 1000);

- use timermine
---------------
// Set time count from 3 2 1
timerMine() {
var newCount = this.state.currentCount - 1;

if (newCount >= 0) {
  this.setState({
    currentCount: newCount
  })

  if (newCount == 0) {
    // Set Timer to 3 again
    this.setState({
      currentCount: 3
    })
  }
} else {
  clearInterval(this._interval);
}