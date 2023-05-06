// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";
    
contract CryptoDevsToken is ERC20, Ownable{
    ICryptoDevs cryptoDevsContract ;
    
    // To map which token has been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    uint256 public tokensPerNFT = 10 * (10**18);
    uint256 public pricePerToken = 0.001 ether;
    uint256 public maxTokenSupply = 100000 * 10**18;    
    
    constructor(address _cryptoDevsContract) ERC20("Crypto Devs Token", "CD"){
        cryptoDevsContract = ICryptoDevs(_cryptoDevsContract);
    }

    function claim() public{
        address sender = msg.sender;
        uint256 balance = cryptoDevsContract.balanceOf(sender);
        uint256 amount ;
        require(balance > 0, "You don't own any Crypto Dev NFT");    
        for (uint256 i=0;i<balance;i++){
            uint256 tokenId = cryptoDevsContract.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount +=1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount>0, "You have already claimed all the tokens");
        _mint(sender, amount * tokensPerNFT);
    } 
    function mint(uint256 _amount) payable public{
        uint256 requiredAmount = _amount * pricePerToken;
        require(msg.value >= requiredAmount, "Insufficient Amount sent");
        // total supply gives how many tokens have been minted till now
        uint256 amountBig = _amount*10**18;
        require((totalSupply() + amountBig) > maxTokenSupply, "Exceeded the maximum token limit" );
        _mint(msg.sender, amountBig);
    }
    
    function withraw() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount>0, "Nothing to Withdraw , Currently empty");
        address _owner = owner();
        (bool sent, ) = _owner.call{value:amount}("");
        require(sent, "Transaction Failed");
    }


    receive() external payable{}

    fallback() external payable{}


}