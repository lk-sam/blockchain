import React, { useState } from 'react';
import axios from 'axios';

function CreateAccount() {
    const [newAccount, setNewAccount] = useState(null);

    const handleCreateAccount = async () => {
        try {
            const response = await axios.post('http://localhost:4000/create-account');
            setNewAccount(response.data);
            localStorage.setItem('address', response.data.address);
        } catch (error) {
            console.error('Error creating account:', error);
        }
    };

    return (

    
        <div className="connectwallet">
            <div className="connectwallett">
            <h2>Create Account</h2>
            {!newAccount &&
                <div className="createacc"><p className="createaccp">Press Create button to create account</p></div>
            }
            {newAccount && (
                <div>
                    <div className="outercontainer"><div className="label">Address</div><div className="answer">{newAccount.address}</div></div>
                    <div className="outercontainer"><div className="label">Private Key</div><div className="answer">{newAccount.privateKey}</div></div>
                </div>
            )}
            <div className="buttoncontainer">
                <button onClick={handleCreateAccount} className="button-29" >Create</button>
            </div>
        </div>
        </div>
    );
}

export default CreateAccount;