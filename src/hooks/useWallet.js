import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from '../utils/WavePortal.json'

export default function () {
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS

    const contractABI = abi.abi

    const [currentAccount, setCurrentAccount] = useState('')

    const [allWaves, setAllWaves] = useState([])

    const [totalWaves, setTotalWaves] = useState(0)

    const wave = async message => {
        const { ethereum } = window

        if (ethereum) {
            await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4' }] })
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

            /*
             * Execute the actual wave from your smart contract
             */
            const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })

            console.log('Mining...', waveTxn.hash)

            await waveTxn.wait()
            console.log('Mined -- ', waveTxn.hash)
        } else {
            console.log("Ethereum object doesn't exist!")
        }
    }

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
            console.log({ accounts })

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

    const getAllWaves = async () => {
        const { ethereum } = window

        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
                const waves = await wavePortalContract.getAllWaves()
                const count = await wavePortalContract.getTotalWaves()

                const wavesCleaned = waves.map(wave => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message
                    }
                })

                setAllWaves(wavesCleaned.reverse())
                setTotalWaves(count.toNumber())
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    /**
     * Listen in for emitter events!
     */
    useEffect(() => {
        let wavePortalContract
        const onNewWave = (from, timestamp, message) => {
            console.log('NewWave', from, timestamp, message)
            setAllWaves(prevState => [
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message
                },
                ...prevState
            ])
            setTotalWaves(prevState => prevState++)
        }

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()

            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
            wavePortalContract.on('NewWave', onNewWave)
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off('NewWave', onNewWave)
            }
        }
    }, [contractABI])

    return {
        wave,
        connectWallet,
        currentAccount,
        getAllWaves,
        allWaves,
        totalWaves
    }
}
