import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import abi from "./utils/MFKFM.json";
import './App.css';
import YoutubeVideo from "./YoutubeVideo";
import {toast, Toaster} from "react-hot-toast";

function App() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [allVideos, setAllVideos] = useState([]);
    const [message, setMessage] = useState("");
    const contractAddress = "0xc0705c41ce746427aD7C42d8Ddf21Ced1917EA5E";
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
                await getAllVideos();
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
            toast.success("Wallet Connected!");
            setCurrentAccount(accounts[0]);
            await getAllVideos();
        } catch (error) {
            console.log(error);
        }
    }

    const matchYoutubeUrl = url => {
        const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (url.match(p)) {
            return url.match(p)[1];
        }
        return false;
    }

    const sendVideo = async (e) => {
        e.preventDefault();

        if (!matchYoutubeUrl(message)) {
            toast.error("You need to send valid Youtube url!");
            return;
        }

        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const mfkFMContract = new ethers.Contract(contractAddress, contractABI, signer);

                const sendVideoTxn = await mfkFMContract.AddVideo(message, {gasLimit: 300000});
                console.log("Mining...", sendVideoTxn.hash);
                toast("🦄 Mining...!");

                await sendVideoTxn.wait();
                console.log("Mined --", sendVideoTxn.hash);
                toast.success("🦄 Mined --!");

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
            toast.error("Transaction failed")
        }
    }

    const getAllVideos = async () => {
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const mfkFMContract = new ethers.Contract(contractAddress, contractABI, signer);
                const videos = await mfkFMContract.getAllVideos();

                const videosCleaned = videos.map(video => {
                    return {
                        address: video.videoSender,
                        timestamp: new Date(video.timestamp * 1000),
                        message: video.message,
                    };
                });

                setAllVideos(videosCleaned);
            } else {
                console.log("Ethereum object doesn't exist");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();

        let mfkMFContract;

        const onNewVideo = (from, timestamp, message) => {
            console.log("NewVideo", from, timestamp, message);
            setAllVideos(prevState => [
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

            mfkMFContract = new ethers.Contract(contractAddress, contractABI, signer);
            mfkMFContract.on("NewVideo", onNewVideo);
        }

        return () => {
            if (mfkMFContract) {
                mfkMFContract.off("NewVideo", onNewVideo);
            }
        };
    }, []);

    const getYoutubeIdFromURL = url => {
        url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    }

    return (
        <div className="mainContainer">

            <div className="dataContainer">
                <div className="header">
                    👋 Hey there, Welcome to the MFK FM Radio!
                </div>

                <div className="bio">
                    I am Mehmet Fırat and I'm a software engineer. If you want to send me some great songs from youtube,
                    why are you waiting then? Paste the url! You can send me song and see other songs if you connect
                    your wallet to Rinkeby Test Network.
                </div>

                <form onSubmit={sendVideo}>

                    <div className="message-container">
                        <textarea className="message-textarea" required value={message}
                                  onChange={(e => setMessage(e.target.value))}
                                  placeholder="Write your song urls here!"/>
                    </div>

                    <button className="send-video-button">
                        Send Video 🔥
                    </button>

                </form>

                {!currentAccount && (
                    <button className="send-video-button" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}

                {allVideos.map((video, index) => {
                    return (
                        <div key={index} className="all-videos-container">
                            <div>Address: {video.address}</div>
                            <div>Time: {new Date(video.timestamp).toLocaleString()}</div>
                            <YoutubeVideo videoId={getYoutubeIdFromURL(video.message)}/>
                        </div>)
                })}

                <Toaster/>
            </div>
        </div>
    );
}

export default App;
