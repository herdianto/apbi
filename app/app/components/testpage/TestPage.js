import React from 'react';
import {Jumbotron, Grid, Row, Col, Panel} from 'react-bootstrap';
import './TestPage.scss';

class TestPage extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      data: []
    };

    // This binding is necessary to make `this` work in the callback
    this.hello = this.hello.bind(this);
  }

  hello() {
    this.setState({data: [1,2]});
    var materials = this.state.data.map(function(material) {
      alert(material);
    });
    alert(this.state.data);
  }

  render() {
    return (
      <div className="TestPage">
        <Jumbotron>
          <Grid>
            <h1>Test Page</h1>
          </Grid>
        </Jumbotron>
        <Grid>
          <button onClick={this.hello}>Hello APBI</button>
        </Grid>
      </div>
    );
  }
}

export default TestPage;