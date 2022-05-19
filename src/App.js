import React, { useEffect, useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './utils/WavePortal.json'

export default function App() {
    const [currentAccount, setCurrentAccount] = useState('')

    const [loading, setLoading] = useState(false)

    const [allWaves, setAllWaves] = useState([])

    const [message, setMessage] = useState('')

    const contractAddress = '0xd4E0708D986aA5eb1DFd42b4AaE7960CF273E797'

    const contractABI = abi.abi

    const wave = async () => {
        try {
            const { ethereum } = window

            if (ethereum) {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

                let count = await wavePortalContract.getTotalWaves()
                console.log('Retrieved total wave count...', count.toNumber())

                /*
                 * Execute the actual wave from your smart contract
                 */
                const waveTxn = await wavePortalContract.wave(message)
                console.log('Mining...', waveTxn.hash)

                await waveTxn.wait()
                console.log('Mined -- ', waveTxn.hash)

                count = await wavePortalContract.getTotalWaves()
                console.log('Retrieved total wave count...', count.toNumber())
                getAllWaves()
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                alert('Get MetaMask!')
                return
            }

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })

            console.log('Connected', accounts[0])
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
        }
    }

    const getAllWaves = async () => {
        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

                const waves = await wavePortalContract.getAllWaves()

                let wavesCleaned = []
                waves.forEach(wave => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message
                    })
                })

                setAllWaves(wavesCleaned)
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleMessageChange = event => {
        setMessage(event.target.value)
    }

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                console.log('Make sure you have metamask!')
                return
            } else {
                console.log('We have the ethereum object', ethereum)
            }

            /*
             * Check if we're authorized to access the user's wallet
             */
            const accounts = await ethereum.request({ method: 'eth_accounts' })

            if (accounts.length !== 0) {
                const account = accounts[0]
                console.log('Found an authorized account:', account)
                setCurrentAccount(account)
                getAllWaves()
            } else {
                console.log('No authorized account found')
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    return (
        <div className="mainContainer text-center">
            <div className="dataContainer">
                <div className="header text-[32px] my-5">
                    <span role="img" aria-label="hi emoji">
                        👋
                    </span>{' '}
                    Hey there!
                </div>

                <div className="bio opacity-75 font-light mb-5">
                    I am lazehang.
                    <br />
                    Connect your Ethereum wallet and wave at me!
                </div>

                <div className="mb-4">
                    {allWaves.map((wave, index) => {
                        return (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'OldLace',
                                    padding: '8px'
                                }}
                                className="w-full mb-2 p-4 text-left text-sm"
                            >
                                <div>Address: {wave.address}</div>
                                <div>Time: {wave.timestamp.toString()}</div>
                                <div>Message: {wave.message}</div>
                            </div>
                        )
                    })}
                </div>

                {loading && (
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 text-white flex justify-center items-center">
                        <div className="animate-pulse">...Loading</div>
                    </div>
                )}

                <div className="w-full">
                    <div className="w-full mb-2">
                        <textarea
                            name="textarea"
                            className="w-full border-[#ccc] border rounded-md outline-none p-2"
                            value={message}
                            rows="4"
                            onChange={handleMessageChange}
                        ></textarea>
                    </div>

                    {/*
                     * If there is no currentAccount render this button
                     */}
                    {!currentAccount ? (
                        <button
                            className="w-full max-w-[300px] hover:bg-white hover:text-black border border-black bg-black text-white py-2 px-6 block mx-auto uppercase font-bold"
                            onClick={connectWallet}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <button
                            className="w-full max-w-[300px] hover:bg-white hover:text-black border border-black bg-black text-white py-2 px-6 block mx-auto uppercase font-bold"
                            onClick={wave}
                            disabled={loading}
                        >
                            Wave at Me
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
