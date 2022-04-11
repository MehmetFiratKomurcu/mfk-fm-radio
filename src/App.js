import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';
import YoutubeVideo from "./YoutubeVideo";

function App() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [totalWaves, setTotalWaves] = useState(null);
    const [allWaves, setAllWaves] = useState([]);
    const [message, setMessage] = useState("");
    const contractAddress = "0xc29Af59Cd6A0fa5e0d5808E384C9a139d3c01e71";
    const contractABI = abi.abi;

    const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({method: "eth_accounts"});

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                await getAllWaves();
            } else {
                console.log("No authorized account found.");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                alert("Get Metamask");
                return;
            }

            const accounts = await ethereum.request({method: "eth_requestAccounts"});

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            await getAllWaves();
        } catch (error) {
            console.log(error);
        }
    }

    const wave = async (e) => {
        e.preventDefault();
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined --", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                setTotalWaves(count.toNumber());

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getAllWaves = async () => {
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                const waves = await wavePortalContract.getAllWaves();

                const wavesCleaned = waves.map(wave => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                    };
                });

                setAllWaves(wavesCleaned);
            } else {
                console.log("Ethereum object doesn't exist");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();

        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);
            setAllWaves(prevState => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, []);

    return (
        <div className="mainContainer">

            <div className="dataContainer">
                <div className="header">
                    👋 Hey there, Welcome to the MFK FM Radio!
                </div>

                <div className="bio">
                    I am Mehmet Fırat and I'm a software engineer. If you want to send me some great songs from youtube
                    or spotify, why are you waiting then? Paste the url! You can see other songs if you connect your wallet.
                </div>

                <form onSubmit={wave}>

                    <div className="message-container">
                        <textarea className="message-textarea" required value={message}
                                  onChange={(e => setMessage(e.target.value))}
                                  placeholder="Write your song urls here!"/>
                    </div>

                    <button className="waveButton">
                        Submit
                    </button>

                </form>

                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}

                {totalWaves && (
                    <div className="totalWaves">Total Waves: {totalWaves}</div>
                )}

                {allWaves.map((wave, index) => {
                    return (
                        <div key={index} style={{backgroundColor: "#f8f8f8", marginTop: "16px", padding: "8px"}}>
                            <div>Address: {wave.address}</div>
                            <div>Time: {wave.timestamp.toString()}</div>
                            <div>Message: {wave.message}</div>
                        </div>)
                })}

            </div>
        </div>
    );
}

export default App;
