import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function TransferEth() {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        setAccounts(accounts);
        setSelectedAccount(accounts[0]); // Set the first account as the default selected account
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }

    loadAccounts();
  }, []);

  async function transferETH() {
    if (!selectedAccount) {
      alert("Please select an Ethereum account from MetaMask.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(selectedAccount);

      const tx = await signer.sendTransaction({
        to: receiverAddress,
        value: ethers.utils.parseEther(amount),
      })


      alert(`Transaction sent: ${tx.hash}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  return (
    <div className="connectwallet">
      <div  className="connectwallett">
      <h2>ETH Transfer DApp</h2>
      <div className="outercontainer">
        <div className="label">Select Account</div>

        
        <select
          className="answer"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
      </div>
      
      <div className="outercontainer">
        <div className="label">Receiver Address</div>
        <input
          className="answer"
          type="text"
          placeholder="Receiver Address"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
</div>
      <div className="outercontainer">
        <div className="label">Amount</div>
        <input
          className="answer"
          type="text"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="buttoncontainer">
        <button className="button-29" onClick={transferETH}>
          Transfer
        </button>
      </div>
    </div>
    </div>
  );
}

export default TransferEth;