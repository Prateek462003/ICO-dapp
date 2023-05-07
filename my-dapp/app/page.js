"use client"
// import Image from 'next/image'
import styles from './page.module.css'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import Web3Modal from "web3modal";
import {BigNumber, Contract, ethers, providers, utils} from "ethers";
import {TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const web3ModalRef = useRef(); 
  const [walletConnect, setWalletConnect] = useState(false);
  const [tokensMinted ,setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevToken, setBalanceOfCryptoDevToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
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
      const signer = web3Provider.getSigner();
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
  
  
  const mintCryptoDevToken = async(amount)=>{
    const signer = await getSignerOrProvider(true);
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    )
    const value = amount * 0.001;
    const tx = await tokenContract.mint(amount, {
      value: utils.parseEther(value.toString())
    });
    setLoading(true);
    await tx.wait();
    setLoading(false);
    window.alert("You have sucessfully minted a CryptoDev Token");

  }

  const getTokenstoBeClaimed = async()=>{
    try{
      const provider = await getSignerOrProvider(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
  
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const signer = await getSignerOrProvider(true);
      const address = await signer.getAddress();
      
      const balance = await nftContract.balanceOf(address);
      if(balance === zero){
        setTokensToBeClaimed(zero);
      }
      
      
    }catch(err){
      console.error(err);
    }
  }

  const claimTokens = async()=>{
    try{
      const provider = await getSignerOrProvider();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
    }catch(err){
      console.error(err);
    }
  }

  function renderButtons(){
    if(setLoading){
      return(
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }

    if(tokensToBeClaimed>0){
      return(
      <div>
        <div className={styles.description}>
          {tokensToBeClaimed} Tokens can be Claimed!
        </div>
        <button className={styles.button} onClick={claimTokens}>
          Claim
        </button>
      </div>
      );
    }
    return(
      <div style={{display:"flex-col"}}>
        <div>
          <input 
          type="number" 
          placeholder='Enter Amount Of tokens Here' 
          onChange={(e)=>{setTokenAmount(BigNumber.from(e.target.value))}} 
          className={styles.input}/>
        </div>
        <button className={styles.button} onClick={mintCryptoDevToken(tokenAmount)}>
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
