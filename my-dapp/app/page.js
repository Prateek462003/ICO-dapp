"use client"
// import Image from 'next/image'
import styles from './page.module.css'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import Web3Modal from "web3modal";
import {BigNumber, ethers, providers, utils} from "ethers";

export default function Home() {
  const zero = BigNumber.from(0);
  const web3ModalRef = useRef(); 
  const [walletConnect, setWalletConnect] = useState(false);
  const [tokensMinted ,setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevToken, setBalanceOfCryptoDevToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const connectWallet = async() =>{
    try{
      await getSignerOrProvider();
      setWalletConnect(true)
    }catch(err){
      console.error(err);
    }
  }

  const getSignerOrProvider = async(needSigner = false)=>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    // console.log(chainId);
    if(chainId!=11155111){
      window.alert("Channge the network to Sepolia");
      throw new Error("Change the network to Sepolia");
    }
    if(needSigner){
      const signer = await web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }
  useEffect(()=>{
    if(!walletConnect){
      web3ModalRef.current = new Web3Modal({
        network:"sepolia",
        providerOptions:{},
        disableInjectedProvider:false
      }) 
      connectWallet();
    }
  }, [walletConnect]);
  const mintCryptoDevToken = async()=>{
    const signer = await getSignerOrProvider(true);

  }
  function renderButtons(){
    return(
      <div style={{display:"flex-col"}}>
        <div>
          <input 
          type="number" 
          placeholder='Enter Amount Of tokens Here' 
          onChange={(e)=>{setTokenAmount(BigNumber.from(e.target.value))}} 
          className={styles.input}/>
        </div>
        <button className={styles.button} onClick={mintCryptoDevToken}>
          Mint Tokens
        </button>
      </div>


    );
  }
  return (
    <>
      <Head>
        <title>CryptoDevs-ICO</title>
      </Head>
      <div className={styles.main}>
        <div> 
          <h1 className={styles.tittle}>Welcome to Crypto Devs Token ICO</h1>
          <div className={styles.description}>
            You can Mint Crypto Devs Token here!!
          </div>
          {walletConnect?
            (
              <div>
                <div className={styles.description}>
                  Overall {utils.formatEther(balanceOfCryptoDevToken)}/10000 tokens have been minted till now!
                </div>
              </div>
            ):
            (
              <div>
                <div className={styles.description}>
                  You have minted {utils.formatEther(tokensMinted)} tokens till now!
                </div>
              </div>
            )
          }
          {renderButtons()}
        </div>
      </div>
    </>
  )
}
