import React from 'react';
import PropTypes from 'prop-types';

class Websocket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ws: new WebSocket(this.props.url, this.props.protocol)
    };
  }

  logging(logline) {
    console.log(logline);
  }

  setupWebsocket() {
    let websocket = this.state.ws;
    
    websocket.onopen = () => {
      this.logging('Websocket connected');
    };

    websocket.onmessage = (evt) => {
      this.props.onMessage(evt);
    };

    websocket.onclose = () => {
      this.logging('Websocket disconnected');
    }
  }

  componentDidMount() {
    this.setupWebsocket();
  }

  componentWillUnmount() {
    let websocket = this.state.ws;
    websocket.close();
  }

  render() {
    return (
      <div></div>
    );
  }
}

Websocket.propTypes = {
  url: PropTypes.string.isRequired,
  onMessage: PropTypes.func.isRequired,
  protocol: PropTypes.string
};

export default Websocket;
