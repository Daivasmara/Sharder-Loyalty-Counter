import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const { REACT_APP_API_KEY } = process.env;
const CONTRACT_ADDRESS = '0xbbff862d906e348e9946bfb2132ecb157da3d4b4'
const EVENT_ADDRESS = '0xc3c740790a0CD45573967ccD5e447b1Dc3244912'
const TOKEN_TRX_ENDPOINT = `https://api.etherscan.io/api?module=account&action=tokentx&address=${EVENT_ADDRESS}&startblock=0&endblock=999999999&sort=asc&apikey=${REACT_APP_API_KEY}`
const GET_ABI_ENDPOINT = `https://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${REACT_APP_API_KEY}`;

function App() {
  const [address, setAddress] = useState([]);
  const [totalAddressProcessed, setTotalAddressProcessed] = useState(0);
  const [totalSS, setTotalSS] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSSBalance = (address) => {
    const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/caf44bdf2e4d40af82b12911ccddff5e"));
    fetch(GET_ABI_ENDPOINT)
      .then((res) => res.json())
      .then((res) => {
        const contract = new web3.eth.Contract(JSON.parse(res.result), CONTRACT_ADDRESS);
        address.forEach(async (add) => {
          try {
            const balanceOfTx = await contract.methods.balanceOf(add).call()
            setTotalAddressProcessed((prevState) => prevState + 1);
            console.info(`${add}: ${web3.utils.fromWei(balanceOfTx)}`);
            setTotalSS((prevState) => prevState + Number(web3.utils.fromWei(balanceOfTx)));
          } catch(err) {
            setErrorMessage(err.message);
          }
        })
      })
      .catch((err) => setErrorMessage(err.message));
  }

  useEffect(() => {
    fetch(TOKEN_TRX_ENDPOINT)
      .then((res) => res.json())
      .then((res) => {
        const arr = res.result.map((trx) => trx.from);
        arr.shift();
        const uniqueAddr = {};
        arr.forEach((a) => {
          if (uniqueAddr[a]) {
            return
          } else {
            uniqueAddr[a] = true;
          }
        })
        setAddress(Object.keys(uniqueAddr));
      })
      .catch((err) => setErrorMessage(err.message));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (address.length > 0) {
      fetchSSBalance(address);
    }
  }, [address]);

  return (
    <div className="App">
      <header className="App-header">
        {errorMessage ? (
          <h1>{errorMessage}</h1>
        ) : (
          <>
            <h1>{`Total unique address registered: ${address.length}`}</h1>
            <h1>===</h1>
            <h1>{`Total address processed: ${totalAddressProcessed}`}</h1>
            <h1>{`Total SS tokens registered: ${totalSS}`}</h1>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
