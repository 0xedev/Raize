export const factoryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_creationFee",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "_feeToken", type: "address", internalType: "address" },
      {
        name: "_housePercentage",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_houseAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "BASIS_POINTS",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "LOCKER_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "VESTER_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateTotalTokensNeededForPresale",
    inputs: [
      {
        name: "_options",
        type: "tuple",
        internalType: "struct Presale.PresaleOptions",
        components: [
          {
            name: "tokenDeposit",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "hardCap", type: "uint256", internalType: "uint256" },
          { name: "softCap", type: "uint256", internalType: "uint256" },
          { name: "min", type: "uint256", internalType: "uint256" },
          { name: "max", type: "uint256", internalType: "uint256" },
          {
            name: "presaleRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "listingRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "slippageBps",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "start", type: "uint256", internalType: "uint256" },
          { name: "end", type: "uint256", internalType: "uint256" },
          {
            name: "lockupDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingPercentage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "leftoverTokenOption",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currency",
            type: "address",
            internalType: "address",
          },
          {
            name: "whitelistType",
            type: "uint8",
            internalType: "enum Presale.WhitelistType",
          },
          {
            name: "merkleRoot",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "nftContractAddress",
            type: "address",
            internalType: "address",
          },
        ],
      },
      { name: "_token", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "totalTokensNeeded",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createPresale",
    inputs: [
      {
        name: "_options",
        type: "tuple",
        internalType: "struct Presale.PresaleOptions",
        components: [
          {
            name: "tokenDeposit",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "hardCap", type: "uint256", internalType: "uint256" },
          { name: "softCap", type: "uint256", internalType: "uint256" },
          { name: "min", type: "uint256", internalType: "uint256" },
          { name: "max", type: "uint256", internalType: "uint256" },
          {
            name: "presaleRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "listingRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "slippageBps",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "start", type: "uint256", internalType: "uint256" },
          { name: "end", type: "uint256", internalType: "uint256" },
          {
            name: "lockupDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingPercentage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "leftoverTokenOption",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currency",
            type: "address",
            internalType: "address",
          },
          {
            name: "whitelistType",
            type: "uint8",
            internalType: "enum Presale.WhitelistType",
          },
          {
            name: "merkleRoot",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "nftContractAddress",
            type: "address",
            internalType: "address",
          },
        ],
      },
      { name: "_token", type: "address", internalType: "address" },
      { name: "_weth", type: "address", internalType: "address" },
      {
        name: "_uniswapV2Router02",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "presaleAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "createdPresales",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creationFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeToken",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllPresales",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreationFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHouseAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHousePercentage",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPresaleAt",
    inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPresaleCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPresaleOptionsByAddress",
    inputs: [
      {
        name: "_presaleAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "options",
        type: "tuple",
        internalType: "struct Presale.PresaleOptions",
        components: [
          {
            name: "tokenDeposit",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "hardCap", type: "uint256", internalType: "uint256" },
          { name: "softCap", type: "uint256", internalType: "uint256" },
          { name: "min", type: "uint256", internalType: "uint256" },
          { name: "max", type: "uint256", internalType: "uint256" },
          {
            name: "presaleRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "listingRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "slippageBps",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "start", type: "uint256", internalType: "uint256" },
          { name: "end", type: "uint256", internalType: "uint256" },
          {
            name: "lockupDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingPercentage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "leftoverTokenOption",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currency",
            type: "address",
            internalType: "address",
          },
          {
            name: "whitelistType",
            type: "uint8",
            internalType: "enum Presale.WhitelistType",
          },
          {
            name: "merkleRoot",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "nftContractAddress",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "houseAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "housePercentage",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "liquidityLocker",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract LiquidityLocker",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "presaleConfigurations",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "tokenDeposit",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "hardCap", type: "uint256", internalType: "uint256" },
      { name: "softCap", type: "uint256", internalType: "uint256" },
      { name: "min", type: "uint256", internalType: "uint256" },
      { name: "max", type: "uint256", internalType: "uint256" },
      { name: "presaleRate", type: "uint256", internalType: "uint256" },
      { name: "listingRate", type: "uint256", internalType: "uint256" },
      {
        name: "liquidityBps",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "slippageBps", type: "uint256", internalType: "uint256" },
      { name: "start", type: "uint256", internalType: "uint256" },
      { name: "end", type: "uint256", internalType: "uint256" },
      {
        name: "lockupDuration",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "vestingPercentage",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "vestingDuration",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "leftoverTokenOption",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "currency", type: "address", internalType: "address" },
      {
        name: "whitelistType",
        type: "uint8",
        internalType: "enum Presale.WhitelistType",
      },
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      {
        name: "nftContractAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeConfiguration",
    inputs: [
      {
        name: "_newCreationFee",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "_newFeeToken", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setHouseConfiguration",
    inputs: [
      {
        name: "_newHousePercentage",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_newHouseAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vestingContract",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract Vesting" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "FeeConfigurationChanged",
    inputs: [
      {
        name: "newCreationFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newFeeToken",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HouseConfigurationChanged",
    inputs: [
      {
        name: "newHousePercentage",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newHouseAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PresaleConfiguration",
    inputs: [
      {
        name: "options",
        type: "tuple",
        indexed: true,
        internalType: "struct Presale.PresaleOptions",
        components: [
          {
            name: "tokenDeposit",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "hardCap", type: "uint256", internalType: "uint256" },
          { name: "softCap", type: "uint256", internalType: "uint256" },
          { name: "min", type: "uint256", internalType: "uint256" },
          { name: "max", type: "uint256", internalType: "uint256" },
          {
            name: "presaleRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "listingRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "liquidityBps",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "slippageBps",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "start", type: "uint256", internalType: "uint256" },
          { name: "end", type: "uint256", internalType: "uint256" },
          {
            name: "lockupDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingPercentage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vestingDuration",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "leftoverTokenOption",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "currency",
            type: "address",
            internalType: "address",
          },
          {
            name: "whitelistType",
            type: "uint8",
            internalType: "enum Presale.WhitelistType",
          },
          {
            name: "merkleRoot",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "nftContractAddress",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PresaleCreated",
    inputs: [
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "presaleContract",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "start",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "end",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "FeePaymentFailed", inputs: [] },
  { type: "error", name: "IndexOutOfBounds", inputs: [] },
  { type: "error", name: "InvalidCapSettings", inputs: [] },
  { type: "error", name: "InvalidCurrencyDecimals", inputs: [] },
  { type: "error", name: "InvalidFeeConfiguration", inputs: [] },
  { type: "error", name: "InvalidHouseConfiguration", inputs: [] },
  { type: "error", name: "NotAPresaleContract", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "RoleGrantFailed", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "ZeroAddress", inputs: [] },
  {
    name: "PairAlreadyExists",
    type: "error",
    inputs: [
      { name: "token", type: "address" },
      { name: "currency", type: "address" },
    ],
  },
  {
    name: "InvalidState",
    type: "error",
    inputs: [{ name: "state", type: "uint8" }],
  },
  {
    name: "NotInPurchasePeriod",
    type: "error",
    inputs: [],
  },
  {
    name: "ZeroAmount",
    type: "error",
    inputs: [],
  },
  {
    name: "InsufficientTokenDeposit",
    type: "error",
    inputs: [
      { name: "deposited", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    name: "InvalidInitialization",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidLeftoverTokenOption",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidHouseConfiguration",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidCapSettings",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidContributionLimits",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidRates",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidTimestamps",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidVestingPercentage",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidMerkleRoot",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidNftContractAddress",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidLiquidityBps",
    type: "error",
    inputs: [],
  },
  {
    name: "ERC20InsufficientBalance", //|ERC20InsufficientAllowance
    type: "error",
    inputs: [
      { name: "sender", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    name: "ERC20InsufficientAllowance",
    type: "error",
    inputs: [
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
];
