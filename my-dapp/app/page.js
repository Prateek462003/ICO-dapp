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
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner ] = useState(false);
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
    try{
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
    }catch(err){
      console.error(err);
    }
    await getTokenstoBeClaimed();
    await getTotalTokensMinted();
    await getbalanceOfCryptoDevToken();
  }
  const getTotalTokensMinted = async()=>{
    try{
      const provider = await getSignerOrProvider();
      const tokenContract = await Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
  
      const _totalTokensMinted = await tokenContract.totalSupply();
      setTokensMinted(BigNumber.from(_totalTokensMinted));
    }catch(err){
      console.error(err);
    }
  }
  const getbalanceOfCryptoDevToken = async()=>{
    try{
      const provider = await getSignerOrProvider();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getSignerOrProvider(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevToken(BigNumber.from(balance));
    }catch(err){
      console.error(err);
  }
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
      
      for(var i=0;i<balance; i++){
        const tokenId = nftContract.tokenOfOwnerByIndex(address, i);
        const claimed = tokenContract.tokenIdsClaimed();
        if(!claimed){
          amount++;
        }
      }

      setTokensToBeClaimed(BigNumber.from(amount));
      
    }
    catch(err){
      console.error(err);
    }
  }

  const getOwner = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      const _owner = await tokenContract.onwer();
      if(_owner === address){
        setIsOwner(true);
      }
    }catch(err){
      console.error(err);
    }
  }
  const withdraw = async()=>{
    try{
      const signer = await getSignerOrProvider(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.withraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getOwner();
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
      await getTokenstoBeClaimed();
      await getTotalTokensMinted();
      await getbalanceOfCryptoDevToken();
    }catch(err){
      console.error(err);
    }
  }

  function renderButtons(){
    if(loading){
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
      <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnect? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevToken)} Crypto
                Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButtons()}
              {/* Display additional withdraw button if connected wallet is owner */}
                {isOwner ? (
                  <div>
                  {loading ? <button className={styles.button}>Loading...</button>
                           : <button className={styles.button} onClick={withdraw}>
                               Withdraw Coins
                             </button>
                  }
                  </div>
                  ) : ("")
                }
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
    </>
  )
}
