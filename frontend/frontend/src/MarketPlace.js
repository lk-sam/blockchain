import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Marketplace() {
    const [privateKey, setPrivateKey] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [setPriceInput, setSetPriceInput] = useState('');
    const [setPaymentPriceInput, setSetPaymentPriceInput] = useState('');
    const [setNameInput, setSetNameInput] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [storedValue, setStoredValue] = useState(null);
    const [storedValueList, setStoredValueList] = useState(null);
    const [itemId, setItemId] = useState('');
    const deployContract = async () => {
        try {
            if (privateKey) {
                console.log(privateKey)
                const response = await fetch('http://localhost:4000/deploy-contract', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ privateKey }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setContractAddress(data.address);
                } else {
                    console.error('Deployment failed');
                }
            } else {
                console.error('Private key is required for deployment.');
            }
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };
    const setNewValue = async () => {
        try {
            if (setPriceInput && setNameInput) {
                const response = await fetch('http://localhost:4000/list-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privateKey: privateKey,
                        contractAddress: contractAddress,
                        name: setNameInput,
                        price: setPriceInput
                    }),
                });
                if (response.ok) {
                    const {itemId, transactionHash} = await response.json();
                    console.log(itemId)
                    setTransactionHash(transactionHash);
                    setItemId(itemId);
                } else {
                    console.error('Deployment failed');
                }
            }
            else {
                console.error('Name and price are required for deployment.');
            }
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };

    const makePayment = async () => {
        try {
            if (setPaymentPriceInput) {
                if(setPaymentPriceInput==setPriceInput){
                    
                const response = await fetch('http://localhost:4000/buy-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privateKey: privateKey,
                        contractAddress: contractAddress,
                        value: setPaymentPriceInput,
                        itemId: itemId
                    }),
                });
                if (response.ok) {
                    const {transactionHash} = await response.json();
                    setTransactionHash(transactionHash);
                } else {
                    console.error('Deployment failed');
                }}else{
                    console.error('Payment price is not the same as item price !');
                }
            }
            else {
                console.error('Payment price is required for deployment.');
            }
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };
    const updateItem = async () => {
        console.log('update')
        try {
                const response = await fetch('http://localhost:4000/update-item', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privateKey: privateKey,
                        contractAddress: contractAddress,
                        price: setPriceInput,
                        name: setNameInput,
                        itemId: itemId
                    }),
                });
                if (response.ok) {
                    const {transactionHash} = await response.json();
                    setTransactionHash(transactionHash);
                } else {
                    console.error('Deployment failed');
                }
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };
    const deleteItem = async () => {
        console.log('delete')
        try {
                const response = await fetch(`http://localhost:4000/delete-item?itemId=${itemId}&privateKey=${privateKey}&contractAddress=${contractAddress}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const {transactionHash} = await response.json();
                    setTransactionHash(transactionHash);
                } else {
                    console.error('Deployment failed');
                }
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };
    const getValue = async () => {
        try {
                const response = await fetch(`http://localhost:4000/read-item?itemId=${itemId}&contractAddress=${contractAddress}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    const result = data;
                    setStoredValue(result);
                } else {
                    console.error('Getting value failed');
                }
        } catch (error) {
            console.error('Error while getting value:', error);
        }
    };
    const getValueList = async () => {
        try {
            const response = await fetch(`http://localhost:4000/get-list`);

            if (response.ok) {
                const data = await response.json();
                const result = data.result;
                setStoredValueList(result);
            } else {
                console.error('item id is required to get the value.');
            }
        } catch (error) {
            console.error('Error while getting value:', error);
        }
    };
    const getBalance = async () => {
        try {

            const response = await fetch(`http://localhost:4000/get-balance`);

            if (response.ok) {
                const data = await response.json();
                const result = data.result;
                setStoredValue(result);
            } else {
                console.error('Getting value failed');
            }

        } catch (error) {
            console.error('Error while getting value:', error);
        }
    };

    return (
        <div className="connectwallettt">
            <div className="connectwallett">
                <h1>Simple Storage DApp</h1>

                <h2>Contract Address</h2>
                <div>
                    <div className="outercontainer">
                        <div className="labell"><label htmlFor="privateKey">Contract Address:</label></div>
                        <input 
                        type="text"
                        className="answer"
                        id="contractAddress"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        />
                    </div>
                    </div>

                <h2>Deploy Contract</h2>
                <div>
                    <div className="outercontainer">
                        <div className="labell"> <label htmlFor="privateKey">Private Key:</label></div>
                        <input
                            type="text"
                            className="answer"
                            id="privateKey"
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                        />
                    </div>
                    <div className="outercontainer">
                        <div className="labell">Contract Address:</div>
                        <div className="answer">{contractAddress}</div>
                    </div>
                    <div className="buttoncontainer">
                        <button onClick={deployContract} className="button-29">Deploy Contract</button>
                    </div>
                </div>


                <h2>CRUD Item Value</h2>
                <div className="outercontainer">
                    <div className="labell"> <label htmlFor="privateKey">Private Key:</label></div>
                    <input
                        type="text"
                        className="answer"
                        id="privateKey"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                    />
                </div>
                <div>
                    <div className="outercontainer">
                        <div className="labell"><label htmlFor="itemName">Name:</label></div>
                        <input
                            type="text"
                            id="itemName"
                            className="answer"
                            value={setNameInput}
                            onChange={(e) => setSetNameInput(e.target.value)}
                        />
                    </div>
                    <div className="outercontainer">
                        <div className="labell"><label htmlFor="setValue">Price:</label></div>
                        <input
                            type="text"
                            id="setValue"
                            className="answer"
                            value={setPriceInput}
                            onChange={(e) => setSetPriceInput(e.target.value)}
                        />
                    </div>
                    <div className="outercontainer">
                        <div className="labell">Transaction Hash:</div>
                        <div className="answer">{transactionHash}</div>
                    </div>
                    <div className="buttoncontainer">
                        <button className="button-29" onClick={setNewValue}>Set Value</button>
                        <div>  </div>
                        <button className={(itemId=='')?"disabledButton":"button-29"} onClick={updateItem} disabled={itemId==''} >Update Item</button>
                        <button className={(itemId=='')?"disabledButton":"button-29"} onClick={deleteItem} disabled={itemId==''} >Delete Item</button>
                    </div>
                </div>
                <h2>Item Detail</h2>
                <div>
                <div className="outercontainer">
                        <div className="labell"><label htmlFor="itemId">Item Id:</label></div>
                        <input
                            type="text"
                            id="itemId"
                            className="answer"
                            value={itemId}
                            onChange={(e) => setItemId(e.target.value)}
                        />
                    </div>
                    <div className="outercontainer">
                        <div className="labell">Item Name :</div> <div className="answer">{(storedValue!=null)?storedValue.name:''}</div>
                    </div>
                    <div className="outercontainer">
                        <div className="labell">Item Price :</div> <div className="answer">{(storedValue!=null)?storedValue.price:''}</div>
                    </div>
                    <div className="outercontainer">
                        <div className="labell">Is Sold :</div> <div className="answer">{(storedValue!=null)?(storedValue.sold)?"Yes":"No":''}</div>
                    </div>
                    <div className="buttoncontainer">
                        <button className={"button-29"} onClick={getValue}>Get Value</button>
                    </div>
                </div>
                <h2>Pay for item</h2>
                <div>
                    <div className="outercontainer">
                        <div className="labell"><label htmlFor="setValue">Pay:</label></div>
                        <input
                            type="number"
                            id="setValue"
                            className="answer"
                            value={setPaymentPriceInput}
                            onChange={(e) => setSetPaymentPriceInput(e.target.value)}
                        />
                    </div>
                    <div className="buttoncontainer">
                        <button className={(storedValue==null)?"disabledButton":"button-29"} onClick={makePayment}>Pay</button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Marketplace;
