import React, { useEffect, useState } from 'react'
import './App.css'
import useWallet from './hooks/useWallet'

export default function App() {
    const [loading, setLoading] = useState(false)

    const [message, setMessage] = useState('')

    const [error, setError] = useState('')

    const { wave, connectWallet, currentAccount, allWaves, totalWaves } = useWallet()

    const validate = () => {
        if (message.length) {
            setError('')
            return true
        }
        setError('Please, enter a valid message.')
    }

    const handleWave = async () => {
        try {
            if (!validate()) return
            setLoading(true)
            await wave(message)
            setMessage('')
        } catch (error) {
            setError('Transaction failed! come back again after 15 minutes')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleMessageChange = event => {
        setMessage(event.target.value)
    }

    return (
        <div className="mainContainer text-center">
            <div className="dataContainer">
                <div className="header text-[32px] my-5 font-bold">
                    <span role="img" aria-label="hi emoji" className="text-[50px]">
                        👋
                    </span>{' '}
                    Hey there!
                </div>

                <div className="bio opacity-75 font-light mb-5">
                    I am lazehang, learning web3.
                    <br />
                    Connect your Ethereum wallet and wave at me!
                </div>

                {totalWaves && (
                    <div className="mb-2">
                        Total{' '}
                        <span role="img" aria-label="hi emoji">
                            👋
                        </span>
                        's {totalWaves}
                    </div>
                )}

                {allWaves.length ? (
                    <div className="wave-messages">
                        <div className="wave-messages-overlay" />
                        <div className="mb-4 max-h-[200px] overflow-y-scroll flex flex-col-reverse">
                            {allWaves.map((wave, index) => {
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            backgroundColor: 'OldLace'
                                        }}
                                        className="w-full mb-2 p-4 text-left text-sm rounded-lg"
                                    >
                                        <div className="break-words">Address: {wave.address}</div>
                                        <div>Time: {wave.timestamp.toString()}</div>
                                        <div>Message: {wave.message}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : null}

                {loading && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 text-white flex justify-center items-center">
                        <div className="animate-pulse">...Loading</div>
                    </div>
                )}

                <div className="w-full">
                    {currentAccount && (
                        <div className="w-full mb-3">
                            <textarea
                                name="textarea"
                                className="w-full border-[#ccc] border rounded-md outline-none p-2"
                                value={message}
                                rows="4"
                                onChange={handleMessageChange}
                                placeholder="Enter your message here, it'll be stored on the blockchain ;)"
                            ></textarea>
                            <div className="text-red-600 text-xs italic">{error}</div>
                        </div>
                    )}

                    {/*
                     * If there is no currentAccount render this button
                     */}
                    {!currentAccount ? (
                        <button
                            type="button"
                            className="w-full max-w-[300px] hover:bg-white hover:text-black border border-black bg-black text-white py-2 px-6 block mx-auto uppercase font-bold"
                            onClick={connectWallet}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <button
                            className="w-full max-w-[300px] hover:bg-white hover:text-black border border-black bg-black text-white py-2 px-6 block mx-auto uppercase font-bold"
                            type="button"
                            onClick={handleWave}
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
