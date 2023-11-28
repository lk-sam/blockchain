import React, { useState } from 'react';
import axios from 'axios';

function CheckBalance() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');

    const handleCheckBalance = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/check-balance/${address}`);
            setBalance(response.data.balance);
        } catch (error) {
            console.error('Error checking balance:', error);
        }
    };

    return (
        <div>
        <div className="connectwallet">
            <div  className="connectwallett">
                <div className="checkbalance">
                    <h2>Check Balance</h2>
                    <div className="outercontainer">
                        <div className="label">Address</div>

                        <input
                            className="answer"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="outercontainer">
                        <div className="label">Balance</div>
                        <div className="answer"> {balance} ETH</div>
                    </div>
                    <div className="buttoncontainer">
                        <button onClick={handleCheckBalance} className="button-29" >Check</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default CheckBalance;