export const factoryAbi = [
  {
    inputs: [
      {
        components: [
          { name: "tokenDeposit", type: "uint256" },
          { name: "hardCap", type: "uint256" },
          { name: "softCap", type: "uint256" },
          { name: "min", type: "uint256" },
          { name: "max", type: "uint256" },
          { name: "presaleRate", type: "uint256" },
          { name: "listingRate", type: "uint256" },
          { name: "liquidityBps", type: "uint256" },
          { name: "slippageBps", type: "uint256" },
          { name: "start", type: "uint256" },
          { name: "end", type: "uint256" },
          { name: "lockupDuration", type: "uint256" },
          { name: "vestingPercentage", type: "uint256" },
          { name: "vestingDuration", type: "uint256" },
          { name: "leftoverTokenOption", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "whitelistType", type: "uint8" },
          { name: "merkleRoot", type: "bytes32" },
          { name: "nftContractAddress", type: "address" },
        ],
        name: "options",
        type: "tuple",
      },
      { name: "_token", type: "address" },
      { name: "_weth", type: "address" },
      { name: "_uniswapV2Router02", type: "address" },
    ],
    name: "createPresale",
    outputs: [{ name: "presaleContract", type: "address" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeToken",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { name: "tokenDeposit", type: "uint256" },
          { name: "hardCap", type: "uint256" },
          { name: "softCap", type: "uint256" },
          { name: "min", type: "uint256" },
          { name: "max", type: "uint256" },
          { name: "presaleRate", type: "uint256" },
          { name: "listingRate", type: "uint256" },
          { name: "liquidityBps", type: "uint256" },
          { name: "slippageBps", type: "uint256" },
          { name: "start", type: "uint256" },
          { name: "end", type: "uint256" },
          { name: "lockupDuration", type: "uint256" },
          { name: "vestingPercentage", type: "uint256" },
          { name: "vestingDuration", type: "uint256" },
          { name: "leftoverTokenOption", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "whitelistType", type: "uint8" },
          { name: "merkleRoot", type: "bytes32" },
          { name: "nftContractAddress", type: "address" },
        ],
        name: "options",
        type: "tuple",
      },
      { name: "_token", type: "address" },
    ],
    name: "calculateTotalTokensNeededForPresale",
    outputs: [{ name: "totalTokens", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];