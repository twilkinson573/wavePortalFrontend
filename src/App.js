import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
// import abi from "./utils/WavePortal.json"; // Deploys
import abi from "./utils/WavePortalDev.json"; // Local Dev (create symlink to WavePortal.json artifact in your Hardhat project)

export default function App() {

  // const contractAddress = "0x4c2Df2C4e7B6a391A269509293cfe06ae53342A3";    // Rinkeby
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";  // Localhost
  const contractAbi = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      getAllWaves();

    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);

        // Call the getAllWaves method from your Smart Contract
        const waves = await wavePortalContract.getAllWaves();

        //We only need address, timestamp, and message in our UI so let's pick those out
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // Store our data in React State
        setAllWaves(wavesCleaned);

      } else {
        console.log("Ethereum object doesn't exist!")

      }
    } catch (error) {
      console.log(error);

    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        // Execute the actual wave from your smart contract, add gas limit of 300,000 
        const waveTxn = await wavePortalContract.wave(messageInput, { gasLimit: 300_000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setMessageInput("");

      } else {
        console.log("Ethereum object doesn't exist!");

      }
    } catch (error) {
      console.log(error)
      
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      
      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  // This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, message, timestamp) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am drillzy and I build things. Big Chungus. Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount ? (
          <div>
            <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} />
            <button className="waveButton" onClick={wave} disabled={messageInput == ""} >
              Wave at Me
            </button>
          </div>
        ) : (
          <button className="waveButton" onClick={connectWallet} >
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
