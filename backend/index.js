const express = require('express');
const { Web3 } = require('web3');
const cors = require('cors');
const app = express();
const port = 4000;
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const web3 = new Web3("http://34.87.29.113:8545"); // Replace with your Ethereum node URL
const { abi, bytecode } = require('./contracts/simpleStorage.json');

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
// Define a route
app.get('/test', async (req, res) => {
    console.log('Test route accessed');
    const gasPrice = await web3.eth.getGasPrice();
    res.send('Test route accessed');
});
app.post('/create-account', (req, res) => {
    const newAccount = web3.eth.accounts.create();

    // NEVER expose the private key like this in production!
    // For demonstration purposes only.
    res.json({
        address: newAccount.address,
        privateKey: newAccount.privateKey
    });
});

app.post('/transfer-eth', async (req, res) => {
    const { from, to, value, privateKey } = req.body;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(account);
    
    const transaction = {
        from: account.address,
        to: to,
        value: web3.utils.toWei(value, 'ether'),
        gas: 21000,
        gasPrice: '0x0'
    };

    try {
        // Sign the transaction
        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);

        // Send the signed transaction
        const txReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        res.json({
            message: 'Ether transferred successfully',
            transactionHash: txReceipt.transactionHash
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/check-balance/:address', async (req, res) => {
  console.log(req.params.address);
    const balance = await web3.eth.getBalance(req.params.address);
    console.log(balance);
    res.json({ balance: web3.utils.fromWei(balance, 'ether') });
});

app.post('/deploy-contract', async (req, res) => {
    try {
    const { privateKey } = req.body; //request private key
    console.log(privateKey)
    const filePath = path.join(__dirname, 'contracts', 'simpleStorage.sol'); //path to contract file
  const source = fs.readFileSync(filePath, 'utf8'); //read contract file
 
  // Compile the contract
  const input = {
    language: 'Solidity',
    sources: {
      'simpleStorage.sol': {
        content: source
      }
    },
    settings: {
      evmVersion: 'paris',
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
  /* Get copmiled contract data 
  * Note: The contract name is the file name followed by the contract name
  * in the contract file
  * e.g. simpleStorage.sol:NotesContract
  */
 console.log('step1')
  const contractData = compiled.contracts['simpleStorage.sol']['Marketplace'];
  const bytecode = contractData.evm.bytecode.object;
  const abi = contractData.abi;

  console.log('step2')
  const senderAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(senderAccount);

  const nonce = await web3.eth.getTransactionCount(senderAccount.address, 'latest');
console.log(`Nonce for account ${senderAccount.address} is: ${nonce}`);
  console.log('step3')
  // Deploy the contract
    const contract = new web3.eth.Contract(abi);
    console.log('step3.1')
    console.log(bytecode)
    console.log(contract)
    // const estimatedGas = await contract.deploy({ data: bytecode }).estimateGas({ from: senderAccount.address });
    console.log('step4')
        const deployedContract = await contract.deploy({
            data: bytecode
        }).send({
            from: senderAccount.address,
            gas: 30000000,
            gasPrice: web3.utils.toWei(0, 'gwei'),
            nonce: nonce
        }).on('receipt', receipt => {
            console.log(receipt);
            saveFrontendFiles(receipt.contractAddress, abi, bytecode);
        });
    
        console.log('Contract deployed at:', deployedContract.options.address);
        res.json({address: deployedContract.options.address} );

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.toString() });
    }
}
)

app.post('/list-item', async (req, res) => {
  const { contractAddress, privateKey, name, price } = req.body;
  console.log(contractAddress, privateKey, name, price);
  const contractABI = require('./contracts/simpleStorage.json').abi; // Update with your Marketplace contract ABI

  // Set up the web3 instance and the account from the provided private key
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account); // Add the account to web3 wallet

  // Create a new contract instance with the ABI and address
  const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
  console.log(contractInstance);
  // Encode the ABI for the listItem function call
  const data = contractInstance.methods.listItem(name, web3.utils.toWei(price.toString(), 'gwei')).encodeABI();
  console.log(await contractInstance.methods.listItem(name, web3.utils.toWei(price.toString(), 'gwei')).estimateGas({ from: account.address }));
  // Prepare the transaction data
  const txData = {
      from: account.address,
      to: contractAddress,
      data: data,
      gas: await contractInstance.methods.listItem(name, web3.utils.toWei(price.toString(), 'gwei')).estimateGas({ from: account.address }),
      gasPrice: 0
  };

  try {
      // Sign the transaction with the private key
      const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);

      // Send the signed transaction to the Ethereum network
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      const eventSignature = web3.utils.sha3('ItemListed(uint256,address,uint256,string)');
      const log = receipt.logs.find(log => log.topics[0] === eventSignature);
      if (!log) throw new Error("Log not found");
  
      // Decode the log using the correct ABI for the ItemListed event
      const decodedLog = web3.eth.abi.decodeLog([
          {
              indexed: false,
              internalType: "uint256",
              name: "id",
              type: "uint256"
          },
          // ... other parameters based on whether they are indexed or not
      ], log.data, log.topics.slice(1)); 

       res.json({ itemId: decodedLog.id.toString(), transactionHash: receipt.transactionHash });

  } catch (error) {
    if (error.innerError) {
      console.error("Revert Reason:", error.innerError.message);
      res.status(500).json({ error: error.innerError.message });
  } else {
      // If it's not a revert error, log and send the error as is
      console.error("Error in list-item:", error);
      res.status(500).json({ error: error.message });
  }
  }
});


app.get('/read-item', async (req, res) => {
  try {
      const { itemId, contractAddress } = req.query;
      console.log(itemId, contractAddress)
      const contractABI = require('./contracts/simpleStorage.json').abi;

      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Call the readItem function of the contract
      const item = await contract.methods.readItem(itemId).call();

      // Format the item details for the response
      const itemDetails = {
          id: item.id.toString(),
          seller: item.seller.toString(),
          buyer: item.buyer.toString(),
          price: web3.utils.fromWei(item.price, 'gwei').toString(), // Convert price from Wei to Ether
          name: item.name,
          sold: item.sold,
          delivered: item.delivered
      };

      // Respond with the item details
      res.json(itemDetails);
  } catch (error) {
    if (error.innerError) {
      console.error("Revert Reason:", error.innerError.message);
      res.status(500).json({ error: error.innerError.message });
  } else {
      // If it's not a revert error, log and send the error as is
      console.error("Error in read-item:", error);
      res.status(500).json({ error: error.message });
  }
  }
});

app.post('/buy-item', async (req, res) => {
  try {
      const { itemId, value, privateKey, contractAddress } = req.body;
      const contractABI = require('./contracts/simpleStorage.json').abi; // Make sure to use the correct ABI for your contract

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      // Prepare the transaction to buy an item
      const txData = {
          from: account.address,
          to: contractAddress,
          data: contract.methods.buyItem(itemId).encodeABI(),
          value: web3.utils.toWei(value, 'gwei') // Convert the Ether value to Wei
      };

      // Estimate gas for the transaction
      const gas = await web3.eth.estimateGas(txData);

      // Assign the estimated gas and gasPrice to the transaction
      txData.gas = gas;
      txData.gasPrice = 0;

      // Sign the transaction
      const signedTransaction = await web3.eth.accounts.signTransaction(txData, privateKey);

      // Send the transaction
      const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

      // Respond with the transaction hash
      res.json({ transactionHash: transactionReceipt.transactionHash });
  } catch (error) {
       // Catch and handle the error
       if (error.innerError) {
        console.error("Revert Reason:", error.innerError.message);
        res.status(500).json({ error: error.innerError.message });
    } else {
        // If it's not a revert error, log and send the error as is
        console.error("Error in buy-item:", error);
        res.status(500).json({ error: error.message });
    }
  }
});

app.put('/update-item', async (req, res) => {
  try {
      const { itemId, name, price, privateKey, contractAddress } = req.body;
      const contractABI = require('./contracts/simpleStorage.json').abi; 

      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const updateData = contract.methods.updateItem(itemId, name, web3.utils.toWei(price.toString(), 'gwei')).encodeABI();

      const updateTxData = {
          from: account.address,
          to: contractAddress,
          data: updateData,
          gas: await web3.eth.estimateGas({ from: account.address, to: contractAddress, data: updateData }),
          gasPrice:0
      };

      const signedUpdateTx = await web3.eth.accounts.signTransaction(updateTxData, privateKey);
      const updateReceipt = await web3.eth.sendSignedTransaction(signedUpdateTx.rawTransaction);

      res.json({ transactionHash: updateReceipt.transactionHash });
  } catch (error) {
      // Catch and handle the error
      if (error.innerError) {
        console.error("Revert Reason:", error.innerError.message);
        res.status(500).json({ error: error.innerError.message });
    } else {
        // If it's not a revert error, log and send the error as is
        console.error("Error in update-item:", error);
        res.status(500).json({ error: error.message });
    }
}
  }
);

app.delete('/delete-item', async (req, res) => {
  try {
      const { itemId, privateKey, contractAddress } = req.query;
      const contractABI = require('./contracts/simpleStorage.json').abi;

      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const deleteData = contract.methods.deleteItem(itemId).encodeABI();

      const deleteTxData = {
        from: account.address,
        to: contractAddress,
        data: deleteData,
        gas: await web3.eth.estimateGas({ from: account.address, to: contractAddress, data: deleteData }),
        gasPrice: await web3.eth.getGasPrice()
    };

    const signedDeleteTx = await web3.eth.accounts.signTransaction(deleteTxData, privateKey);
    const deleteReceipt = await web3.eth.sendSignedTransaction(signedDeleteTx.rawTransaction);

    res.json({ transactionHash: deleteReceipt.transactionHash });
} catch (error) {
    // Catch and handle the error
    if (error.innerError) {
      console.error("Revert Reason:", error.innerError.message);
      res.status(500).json({ error: error.innerError.message });
  } else {
      // If it's not a revert error, log and send the error as is
      console.error("Error in delete-item:", error);
      res.status(500).json({ error: error.message });
  }
}
});

app.get('/get-balance', async (req, res) => {
  try {
      const { privateKey, contractAddress } = req.query;
      const contractABI = require('./contracts/simpleStorage.json').abi; // Ensure this is the correct ABI

      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Ensure the requestor is the owner
      const owner = await contract.methods.owner().call();
      if (account.address.toLowerCase() !== owner.toLowerCase()) {
          return res.status(403).json({ error: "Access denied: Only the contract owner can perform this action." });
      }

      // Get the balance
      const balanceWei = await web3.eth.getBalance(contractAddress);
      const balanceEther = web3.utils.fromWei(balanceWei, 'gwei');

      res.json({ balance: balanceEther });
  } catch (error) {
      // Catch and handle the error
    if (error.innerError) {
      console.error("Revert Reason:", error.innerError.message);
      res.status(500).json({ error: error.innerError.message });
  } else {
      // If it's not a revert error, log and send the error as is
      console.error("Error in get-balance:", error);
      res.status(500).json({ error: error.message });
  }
  }
});



function saveFrontendFiles(contractAddress, abi, bytecode) {
    const contractsDir = path.join(__dirname, 'contracts');

    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      path.join(contractsDir, 'contract-address.json'),
      JSON.stringify({ Contract: contractAddress }, undefined, 2)
    );
  
    fs.writeFileSync(
      path.join(contractsDir, 'simpleStorage.json'),
      JSON.stringify({ abi: abi, bytecode: bytecode }, null, 2)
    );
  
  }

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(web3.currentProvider);
});
