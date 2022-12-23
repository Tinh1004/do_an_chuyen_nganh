// SPDX-License-Identifier: MIT
pragma solidity >=0.6.1 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    address public owner;
    uint256 public currentTokenId = 1;

    struct Token {
        uint256 tokenId;
        string name;
        string symbol;
        address tokenAddress;
        uint256 usdPrice;
        uint256 ethPrice;
        uint256 apy;
    }

    struct Position {
        uint256 positionId;
        address walletAddress;
        string name;
        string symbol;
        uint256 createdDate;
        uint256 tokenQuantity;
        uint256 usdValue;
        uint256 ethValue;
        uint256 apy;
        bool open;
    }

    uint256 public ethUsdPrice;

    string[] public tokenSymbols;
    mapping(string => Token) public tokens;

    uint256 public currentPositionId = 1;

    mapping(uint256 => Position) public positions;

    mapping(address => uint256[]) public positionIdsByAddress;

    mapping(string => uint256) public stakedTokens;

    constructor(uint256 currentEthPrice) payable {
        ethUsdPrice = currentEthPrice;
        owner = msg.sender;
    }

    function addToken(
        string calldata name,
        string calldata symbol,
        address tokenAddress,
        uint256 usdPrice,
        uint256 apy
    ) external onlyOwner {
        tokenSymbols.push(symbol);
        tokens[symbol] = Token(
            currentTokenId,
            name,
            symbol,
            tokenAddress,
            usdPrice,
            usdPrice / ethUsdPrice,
            apy
        );

        currentTokenId += 1;
    }

    function getTokenSymbols() public view returns (string[] memory) {
        return tokenSymbols;
    }

    function getToken(string calldata tokenSymbol)
        public
        view
        returns (Token memory)
    {
        return tokens[tokenSymbol];
    }

    function stakeTokens(string calldata symbol, uint256 tokenQuantity)
        external
    {
        require(tokens[symbol].tokenId != 0, "This token cannotbe staked");

        IERC20(tokens[symbol].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            tokenQuantity
        );

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            tokens[symbol].name,
            symbol,
            block.timestamp,
            tokens[symbol].apy,
            tokenQuantity,
            tokens[symbol].usdPrice * tokenQuantity,
            (tokens[symbol].usdPrice * tokenQuantity) / ethUsdPrice,
            true
        );

        positionIdsByAddress[msg.sender].push(currentPositionId);
        currentPositionId += 1;
        stakedTokens[symbol] += tokenQuantity;
    }

    function getPositionIdsForAddress()
        external
        view
        returns (uint256[] memory)
    {
        return positionIdsByAddress[msg.sender];
    }

    function getPositionById(uint256 positionId)
        external
        view
        returns (Position memory)
    {
        return positions[positionId];
    }

    function calculateInterest(
        uint256 apy,
        uint256 value,
        uint256 numberDays
    ) public pure returns (uint256) {
        return (apy * value * numberDays) / 10000 / 365;
    }

    function closePosition(uint256 positionId) external {
        require(
            positions[positionId].walletAddress == msg.sender,
            "Not the owner of this position"
        );
        require(positions[positionId].open == true, "Position already closed");

        positions[positionId].open = false;
        IERC20(tokens[positions[positionId].symbol].tokenAddress).transfer(
            msg.sender,
            positions[positionId].tokenQuantity
        );

        uint256 numberDays = calculateNumberDays(
            positions[positionId].createdDate
        );
        
        uint256 weiAmount = calculateInterest(
            positions[positionId].apy,
            positions[positionId].ethValue,
            numberDays
        );

        payable(msg.sender).call{value: weiAmount}("");
    }

    function calculateNumberDays(uint256 createdDate)
        public
        view
        returns (uint256)
    {
        return (block.timestamp - createdDate) / 60 / 60 / 24;
    }

    function modifyCreatedDate(uint256 positionId, uint256 newCreatedDate)
        external
        onlyOwner
    {
        positions[positionId].createdDate = newCreatedDate;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner may call this function");
        _;
    }
}
