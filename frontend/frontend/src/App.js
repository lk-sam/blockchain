import React from 'react';
import CreateAccount from './CreateAccount';
import TransferEth from './TransferEth';
import CheckBalance from './CheckBalance';
import MarketPlace from './MarketPlace';
import Headerr from './Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MetamaskConnect from './MetamaskConnect';

function App() {
    return (

        <Router>
            <Headerr/>
            <Routes>
                
                <Route exact path="/" element={<MetamaskConnect />} />
                <Route path="/account" element={<CreateAccount />} />
                <Route path="/transfer" element={<TransferEth />} />
                <Route path="/checkbalance" element={<CheckBalance />} />
                <Route path="/storageapp" element={<MarketPlace />} />
                <Route path="/marketplace" element={<MarketPlace />} />

            </Routes>
        </Router>
    );
}

export default App;