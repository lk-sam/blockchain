import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class MetamaskConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
    };
  }

  handleConnect = async () => {
    try {
      // Request Metamask connection
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        // User is connected to Metamask
        this.setState({ isConnected: true });
      } else {
        // User denied or there was an issue connecting
        console.error('Metamask connection denied or failed.');
      }
    } catch (error) {
      console.error('Metamask connection error:', error);
    }
  };

  render() {
    return (
      <div>
        <div className="connectwallet">
          <div className="connectwallett">

            {this.state.isConnected ? (
              <div>
                <p>You are connected to Metamask.</p>
                <Link to="/account">
                  <button className="button-29">Create Account</button>
                </Link>
              </div>
          ) : (
          <div>
            <h2 id="connentwalleth2">Please connect to your wallet.</h2>
            <button className="button-29"
              type="button" onClick={this.handleConnect}>Connect</button>
          </div>
            )}
        </div>
      </div>
      </div >
    );
  }
}

export default MetamaskConnect;