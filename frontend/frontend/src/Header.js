import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <ul className="nav">
        <li>
          <Link to="/account">Create Account</Link>
        </li>
        <li>
          <Link to="/transfer">Transfer ETH</Link>
        </li>
        <li>
          <Link to="/checkbalance">Check Balance</Link>
        </li>
        <li>
          <Link to="/storageapp">Storage Application</Link>
        </li>
        <li>
          <Link to="/marketplace">Marketplace</Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;