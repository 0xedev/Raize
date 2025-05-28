import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  useAccount,
  useConnect,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, parseUnits, isAddress, zeroAddress, zeroHash } from "viem";
import { createClient } from "@supabase/supabase-js";
import { sepolia } from "viem/chains";
import { createConfig, http } from "@wagmi/core";
import { getPublicClient } from "@wagmi/core";

// Supabase client setup (replace with your Supabase URL and anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wagmi configuration
const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

// ABIs
const factoryAbi = [
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

const erc20Abi = [
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

// Configuration
const FACTORY_ADDRESS = "0x7b676709cBF74bD668F380c2434aF18c4F75934f";
const WETH_ADDRESS = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14";
const UNISWAP_V2_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

// Helper Functions
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isValidAddress = (address: string): boolean => {
  return address === "" || isAddress(address);
};

interface FormDataState {
  tokenAddress: string;
  currencyAddress: string;
  presaleImage: File | null;
  presaleRate: string;
  listingRate: string;
  hardCap: string;
  softCap: string;
  minContribution: string;
  maxContribution: string;
  liquidityBps: string;
  lockupDuration: string;
  start: string;
  end: string;
  claimDelayMinutes: string;
  useVesting: boolean;
  vestingTgePercent: string;
  vestingCycleDays: string;
  leftoverTokenOption: string;
  slippageBps: string;
  whitelistType: string;
  merkleRoot: string;
  nftContractAddress: string;
}

const CreatePresalePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const [formData, setFormData] = useState<FormDataState>({
    tokenAddress: "",
    currencyAddress: "",
    presaleImage: null,
    presaleRate: "100",
    listingRate: "80",
    hardCap: "",
    softCap: "",
    minContribution: "0.1",
    maxContribution: "1",
    liquidityBps: "7000",
    lockupDuration: (30 * 24 * 60 * 60).toString(),
    start: formatDateForInput(new Date(Date.now() + 5 * 60 * 1000)),
    end: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    claimDelayMinutes: "10",
    useVesting: false,
    vestingTgePercent: "10",
    vestingCycleDays: "30",
    leftoverTokenOption: "0",
    slippageBps: "500",
    whitelistType: "0",
    merkleRoot: "",
    nftContractAddress: "",
  });
  const [tokenDeposit, setTokenDeposit] = useState<string>("0");
  const [creationFee, setCreationFee] = useState<string>("0");
  const [creationFeeTokenAddress, setCreationFeeTokenAddress] = useState<
    string | null
  >(null);
  const [creationFeeTokenSymbol, setCreationFeeTokenSymbol] =
    useState<string>("ETH");
  const [status, setStatus] = useState<string>("Please connect your wallet.");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: receipt, isLoading: isTxPending } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Fetch factory fee and fee token
  const { data: creationFeeData } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "creationFee",
  });
  const { data: feeTokenAddress } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "feeToken",
  });

  // Fetch token details
  const { data: tokenDecimalsData } = useReadContract({
    address: formData.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: isValidAddress(formData.tokenAddress) },
  });
  const { data: tokenSymbolData } = useReadContract({
    address: formData.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: isValidAddress(formData.tokenAddress) },
  });
  const { data: tokenBalanceData } = useReadContract({
    address: formData.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: isConnected && isValidAddress(formData.tokenAddress) },
  });

  // Initialize provider and fetch fee details
  useEffect(() => {
    const init = async () => {
      if (!FACTORY_ADDRESS || !isValidAddress(FACTORY_ADDRESS)) {
        setStatus("Configuration Error: Invalid Factory Address.");
        return;
      }
      try {
        if (creationFeeData && feeTokenAddress) {
          setCreationFeeTokenAddress(feeTokenAddress as `0x${string}`);
          if (feeTokenAddress !== zeroAddress) {
            const publicClient = getPublicClient(config);
            const feeTokenSymbol = (await publicClient.readContract({
              address: feeTokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "symbol",
            })) as string;
            const feeTokenDecimals = (await publicClient.readContract({
              address: feeTokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "decimals",
            })) as number;
            setCreationFee(
              (Number(creationFeeData) / 10 ** feeTokenDecimals).toString()
            );
            setCreationFeeTokenSymbol(feeTokenSymbol);
          } else {
            setCreationFee((Number(creationFeeData) / 10 ** 18).toString());
            setCreationFeeTokenSymbol("ETH");
          }
          setStatus("Factory fee loaded. Ready to connect.");
        }
      } catch (error: any) {
        console.error("Error fetching fee details:", error);
        setStatus(
          `Error fetching fee details: ${
            error.message || "Unknown error"
          }. Check console.`
        );
      }
    };
    init();
  }, [creationFeeData, feeTokenAddress]);

  // Update token details
  useEffect(() => {
    if (tokenDecimalsData) setTokenDecimals(Number(tokenDecimalsData));
    if (tokenSymbolData) setTokenSymbol(tokenSymbolData as string);
    if (tokenBalanceData && tokenDecimalsData) {
      setTokenBalance(
        (Number(tokenBalanceData) / 10 ** Number(tokenDecimalsData)).toFixed(0)
      );
    }
  }, [tokenDecimalsData, tokenSymbolData, tokenBalanceData]);

  // Handle transaction receipt
  useEffect(() => {
    if (receipt && receipt.status === "success") {
      setStatus(`Presale created successfully! Tx: ${receipt.transactionHash}`);
      // Save presale data to Supabase
      const savePresale = async () => {
        try {
          const { error } = await supabase.from("presales").insert([
            {
              creator: address,
              token_address: formData.tokenAddress,
              currency_address: formData.currencyAddress || zeroAddress,
              presale_rate: formData.presaleRate,
              listing_rate: formData.listingRate,
              hard_cap: formData.hardCap,
              soft_cap: formData.softCap,
              min_contribution: formData.minContribution,
              max_contribution: formData.maxContribution,
              liquidity_bps: formData.liquidityBps,
              lockup_duration: formData.lockupDuration,
              start_time: formData.start,
              end_time: formData.end,
              claim_delay_minutes: formData.claimDelayMinutes,
              use_vesting: formData.useVesting,
              vesting_tge_percent: formData.vestingTgePercent,
              vesting_cycle_days: formData.vestingCycleDays,
              leftover_token_option: formData.leftoverTokenOption,
              slippage_bps: formData.slippageBps,
              whitelist_type: formData.whitelistType,
              merkle_root: formData.merkleRoot || zeroHash,
              nft_contract_address: formData.nftContractAddress || zeroAddress,
              transaction_hash: receipt.transactionHash,
              created_at: new Date().toISOString(),
            },
          ]);
          if (error) throw error;
          setStatus(
            `Presale created and saved successfully! Tx: ${receipt.transactionHash}`
          );
        } catch (error: any) {
          console.error("Error saving presale to Supabase:", error);
          setStatus(
            `Presale created but failed to save to Supabase: ${error.message}`
          );
        }
      };
      savePresale();
    } else if (receipt && receipt.status === "reverted") {
      setStatus("Transaction failed: Reverted. Check console.");
    }
  }, [receipt, address, formData]);

  const connectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    } else {
      setStatus("No wallet connectors available. Please install MetaMask.");
    }
  };

  const validateAndParseAddress = (
    addr: string,
    fieldName: string
  ): `0x${string}` => {
    if (addr && !isValidAddress(addr)) {
      setStatus(`Invalid ${fieldName} address.`);
      return zeroAddress as `0x${string}`;
    }
    return (addr || zeroAddress) as `0x${string}`;
  };

  const fetchTokenDetails = async (tokenAddress: string) => {
    if (!isValidAddress(tokenAddress)) {
      setTokenDecimals(18);
      setTokenSymbol("");
      setTokenBalance("0");
      if (tokenAddress)
        setStatus("Invalid token address for fetching details.");
      return false;
    }
    return true;
  };

  const calculateAndSetTokenDeposit = useCallback(async () => {
    if (!formData.tokenAddress || !isValidAddress(formData.tokenAddress)) {
      setTokenDeposit("0");
      return;
    }

    const allInputsValidForCalc =
      formData.hardCap &&
      parseFloat(formData.hardCap) > 0 &&
      formData.presaleRate &&
      parseFloat(formData.presaleRate) > 0 &&
      formData.listingRate &&
      parseFloat(formData.listingRate) > 0 &&
      formData.liquidityBps &&
      parseInt(formData.liquidityBps) > 0;

    if (!allInputsValidForCalc) {
      setTokenDeposit("0");
      return;
    }

    try {
      const publicClient = getPublicClient(config);
      const options = {
        tokenDeposit: BigInt(0),
        hardCap: parseEther(formData.hardCap || "0"),
        softCap: parseEther(formData.softCap || "0"),
        min: parseEther(formData.minContribution || "0"),
        max: parseEther(formData.maxContribution || "0"),
        presaleRate: BigInt(
          Math.floor(parseFloat(formData.presaleRate || "0"))
        ),
        listingRate: BigInt(
          Math.floor(parseFloat(formData.listingRate || "0"))
        ),
        liquidityBps: BigInt(parseInt(formData.liquidityBps || "0")),
        slippageBps: BigInt(parseInt(formData.slippageBps || "0")),
        start: formData.start
          ? BigInt(Math.floor(new Date(formData.start).getTime() / 1000))
          : BigInt(0),
        end: formData.end
          ? BigInt(Math.floor(new Date(formData.end).getTime() / 1000))
          : BigInt(0),
        lockupDuration: BigInt(parseInt(formData.lockupDuration || "0")),
        vestingPercentage: formData.useVesting
          ? BigInt(parseInt(formData.vestingTgePercent || "0") * 100)
          : BigInt(0),
        vestingDuration: formData.useVesting
          ? BigInt(parseInt(formData.vestingCycleDays || "0") * 24 * 60 * 60)
          : BigInt(0),
        leftoverTokenOption: BigInt(
          parseInt(formData.leftoverTokenOption || "0")
        ),
        currency: validateAndParseAddress(formData.currencyAddress, "Currency"),
        whitelistType: BigInt(parseInt(formData.whitelistType || "0")),
        merkleRoot: (formData.whitelistType === "1" && formData.merkleRoot
          ? formData.merkleRoot
          : zeroHash) as `0x${string}`,
        nftContractAddress: (formData.whitelistType === "2" &&
        formData.nftContractAddress
          ? validateAndParseAddress(formData.nftContractAddress, "NFT Contract")
          : zeroAddress) as `0x${string}`,
      };

      const totalTokensNeeded = (await publicClient.readContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: factoryAbi,
        functionName: "calculateTotalTokensNeededForPresale",
        args: [options, formData.tokenAddress as `0x${string}`],
      })) as bigint;

      const formattedTokens = (
        Number(totalTokensNeeded) /
        10 ** tokenDecimals
      ).toFixed(0);
      setTokenDeposit(formattedTokens);
      setStatus(
        `Required token deposit: ${formattedTokens} ${tokenSymbol || "tokens"}.`
      );
    } catch (error: any) {
      console.error("Error calculating token deposit:", error);
      setTokenDeposit("0");
      setStatus(
        `Error calculating token deposit: ${
          error.message || "Check inputs or console."
        }`
      );
    }
  }, [formData, tokenDecimals, tokenSymbol]);

  useEffect(() => {
    calculateAndSetTokenDeposit();
  }, [calculateAndSetTokenDeposit]);

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newFormData = { ...formData };

    if (type === "checkbox") {
      newFormData = {
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      };
    } else if (type === "file") {
      newFormData = {
        ...formData,
        [name]: (e.target as HTMLInputElement).files
          ? (e.target as HTMLInputElement).files![0]
          : null,
      };
    } else {
      newFormData = { ...formData, [name]: value };
    }
    setFormData(newFormData);
    setStatus("");

    if (name === "tokenAddress") {
      if (isValidAddress(value)) {
        await fetchTokenDetails(value);
      } else if (value !== "") {
        setStatus("Invalid token address format.");
        setTokenDecimals(18);
        setTokenSymbol("");
        setTokenBalance("0");
        setTokenDeposit("0");
      } else {
        setTokenDecimals(18);
        setTokenSymbol("");
        setTokenBalance("0");
        setTokenDeposit("0");
      }
    }
  };

  const checkTokenBalanceAndDetails = async () => {
    if (
      !isConnected ||
      !formData.tokenAddress ||
      !isValidAddress(formData.tokenAddress)
    ) {
      setStatus("Connect wallet and enter a valid token address.");
      return;
    }
    const fetched = await fetchTokenDetails(formData.tokenAddress);
    if (fetched && address && tokenBalanceData && tokenDecimalsData) {
      const formattedBalance = (
        Number(tokenBalanceData) /
        10 ** Number(tokenDecimalsData)
      ).toFixed(0);
      setTokenBalance(formattedBalance);
      setStatus(
        `Token: ${tokenSymbol}, Balance: ${formattedBalance}, Decimals: ${tokenDecimals}`
      );
    }
  };

  const approveToken = async (
    tokenAddr: string,
    amountToApprove: string,
    spenderAddr: string,
    tokenDecimalsToUse: number,
    tokenSymbolToUse: string,
    type: string
  ) => {
    if (
      !isConnected ||
      !tokenAddr ||
      !isValidAddress(tokenAddr) ||
      !spenderAddr ||
      !isValidAddress(spenderAddr)
    ) {
      setStatus(
        `Cannot approve: Invalid parameters or wallet not connected for ${type} approval.`
      );
      return false;
    }
    if (parseFloat(amountToApprove) <= 0 && type !== "Max") {
      setStatus(`Approval amount for ${type} must be positive.`);
      return false;
    }

    try {
      const amountInWei =
        type === "Max"
          ? BigInt(2 ** 256 - 1)
          : parseUnits(amountToApprove, tokenDecimalsToUse);
      setStatus(
        `Approving ${tokenSymbolToUse || type} (${amountToApprove})...`
      );
      const hash = await writeContractAsync({
        address: tokenAddr as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddr as `0x${string}`, amountInWei],
      });
      setTxHash(hash);
      return true;
    } catch (error: any) {
      console.error(`Error approving ${type}:`, error);
      setStatus(
        `Error approving ${type}: ${
          error.message || "Unknown error"
        }. Check console.`
      );
      return false;
    }
  };

  const handleApprovePresaleToken = () => {
    if (tokenDeposit === "0" || !formData.tokenAddress) {
      setStatus(
        "Calculate or enter valid token deposit and token address first."
      );
      return;
    }
    approveToken(
      formData.tokenAddress,
      tokenDeposit,
      FACTORY_ADDRESS,
      tokenDecimals,
      tokenSymbol,
      "Presale Token"
    );
  };

  const handleApproveFeeToken = async () => {
    if (!creationFeeTokenAddress || creationFeeTokenAddress === zeroAddress) {
      setStatus("Fee is in ETH, no token approval needed.");
      return;
    }
    if (parseFloat(creationFee) <= 0) {
      setStatus("Creation fee is zero, no approval needed.");
      return;
    }
    try {
      const publicClient = getPublicClient(config);
      const feeDecimals = (await publicClient.readContract({
        address: creationFeeTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      })) as number;
      await approveToken(
        creationFeeTokenAddress,
        creationFee,
        FACTORY_ADDRESS,
        feeDecimals,
        creationFeeTokenSymbol,
        "Fee Token"
      );
    } catch (err: any) {
      setStatus("Could not get fee token decimals for approval.");
      console.error("Fee token decimals error:", err);
    }
  };

  const createPresale = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet.");
      return;
    }
    setStatus("Validating parameters...");

    if (
      !isValidAddress(formData.tokenAddress) ||
      formData.tokenAddress === zeroAddress
    ) {
      setStatus("Invalid or missing Token Address.");
      return;
    }
    if (tokenDeposit === "0" || parseFloat(tokenDeposit) <= 0) {
      setStatus(
        "Calculated token deposit is zero or invalid. Check parameters and recalculate."
      );
      return;
    }

    // Check presale token allowance
    const publicClient = getPublicClient(config);
    const requiredTokenAmountWei = parseUnits(tokenDeposit, tokenDecimals);
    const allowance = (await publicClient.readContract({
      address: formData.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address!, FACTORY_ADDRESS as `0x${string}`],
    })) as bigint;
    if (allowance < requiredTokenAmountWei) {
      setStatus(
        `Insufficient presale token allowance. Need ${tokenDeposit}, approved ${(
          Number(allowance) /
          10 ** tokenDecimals
        ).toFixed(0)}. Please approve.`
      );
      return;
    }

    // Check fee token allowance
    if (
      creationFeeTokenAddress &&
      creationFeeTokenAddress !== zeroAddress &&
      parseFloat(creationFee) > 0
    ) {
      const feeTokenDecimals = (await publicClient.readContract({
        address: creationFeeTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      })) as number;
      const requiredFeeAmountWei = parseUnits(creationFee, feeTokenDecimals);
      const feeAllowance = (await publicClient.readContract({
        address: creationFeeTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, FACTORY_ADDRESS as `0x${string}`],
      })) as bigint;
      if (feeAllowance < requiredFeeAmountWei) {
        setStatus(
          `Insufficient fee token allowance. Need ${creationFee} ${creationFeeTokenSymbol}. Please approve.`
        );
        return;
      }
    }

    setStatus("All checks passed. Preparing transaction...");

    try {
      const presaleOptions = {
        tokenDeposit: parseUnits(tokenDeposit, tokenDecimals),
        hardCap: parseEther(formData.hardCap),
        softCap: parseEther(formData.softCap),
        min: parseEther(formData.minContribution),
        max: parseEther(formData.maxContribution),
        presaleRate: BigInt(Math.floor(parseFloat(formData.presaleRate))),
        listingRate: BigInt(Math.floor(parseFloat(formData.listingRate))),
        liquidityBps: BigInt(parseInt(formData.liquidityBps)),
        slippageBps: BigInt(parseInt(formData.slippageBps)),
        start: BigInt(Math.floor(new Date(formData.start).getTime() / 1000)),
        end: BigInt(Math.floor(new Date(formData.end).getTime() / 1000)),
        lockupDuration: BigInt(parseInt(formData.lockupDuration)),
        vestingPercentage: formData.useVesting
          ? BigInt(parseInt(formData.vestingTgePercent) * 100)
          : BigInt(0),
        vestingDuration: formData.useVesting
          ? BigInt(parseInt(formData.vestingCycleDays) * 24 * 60 * 60)
          : BigInt(0),
        leftoverTokenOption: BigInt(parseInt(formData.leftoverTokenOption)),
        currency: validateAndParseAddress(formData.currencyAddress, "Currency"),
        whitelistType: BigInt(parseInt(formData.whitelistType)),
        merkleRoot: (formData.whitelistType === "1" && formData.merkleRoot
          ? formData.merkleRoot
          : zeroHash) as `0x${string}`,
        nftContractAddress: (formData.whitelistType === "2" &&
        formData.nftContractAddress
          ? validateAndParseAddress(formData.nftContractAddress, "NFT Contract")
          : zeroAddress) as `0x${string}`,
      };

      let txOptions: { gas: bigint; value?: bigint } = { gas: BigInt(5000000) };
      if (!creationFeeTokenAddress || creationFeeTokenAddress === zeroAddress) {
        if (parseFloat(creationFee) > 0) {
          txOptions.value = parseEther(creationFee);
        }
      }

      setStatus("Sending transaction to create presale...");
      try {
        // const walletClient = await getWalletClient(config);
        const gasEstimate = await publicClient.estimateContractGas({
          address: FACTORY_ADDRESS as `0x${string}`,
          abi: factoryAbi,
          functionName: "createPresale",
          args: [
            presaleOptions,
            formData.tokenAddress as `0x${string}`,
            WETH_ADDRESS as `0x${string}`,
            UNISWAP_V2_ROUTER as `0x${string}`,
          ],
          account: address!,
          value: txOptions.value,
        });
        txOptions.gas = (gasEstimate * BigInt(120)) / BigInt(100);
        setStatus(
          `Gas estimated: ${txOptions.gas.toString()}. Creating presale...`
        );
      } catch (gasError: any) {
        console.warn("Gas estimation failed, using manual limit:", gasError);
        setStatus(
          `Gas estimation failed (${
            gasError.message || "Unknown reason"
          }), trying with manual gas limit.`
        );
      }

      const hash = await writeContractAsync({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: factoryAbi,
        functionName: "createPresale",
        args: [
          presaleOptions,
          formData.tokenAddress as `0x${string}`,
          WETH_ADDRESS as `0x${string}`,
          UNISWAP_V2_ROUTER as `0x${string}`,
        ],
        gas: txOptions.gas,
        value: txOptions.value,
      });
      setTxHash(hash);
      setStatus(`Transaction sent: ${hash}. Waiting for confirmation...`);
    } catch (error: any) {
      console.error("Error creating presale:", error);
      setStatus(`Error creating presale: ${error.message || "Check console."}`);
    }
  };

  interface FormInputProps {
    label: string;
    name: keyof FormDataState | string;
    type?: string;
    placeholder?: string;
    value?: string | number | boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    children?: React.ReactNode;
    info?: string;
    error?: string;
    required?: boolean;
    checked?: boolean;
    [key: string]: any;
  }

  const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    children,
    info,
    error,
    required,
    checked,
    ...props
  }) => (
    <div className="mb-4">
      <label
        htmlFor={name as string}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
        {info && <span className="text-xs text-gray-500 ml-1">({info})</span>}
      </label>
      {type === "checkbox" ? (
        <input
          type={type}
          id={name as string}
          name={name as string}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          {...props}
        />
      ) : type === "select" ? (
        <select
          id={name as string}
          name={name as string}
          value={value as string | number}
          onChange={onChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          id={name as string}
          name={name as string}
          value={value as string | number}
          placeholder={placeholder}
          onChange={onChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          {...props}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl font-semibold mt-6 mb-3 pt-4 border-t border-gray-200">
      {title}
    </h2>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Your Token Presale
        </h1>

        {!isConnected ? (
          <button
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 font-medium mb-4"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : null}

        {status && (
          <div
            className={`p-3 mb-4 rounded-md text-sm ${
              status.toLowerCase().includes("error")
                ? "bg-red-100 text-red-700"
                : status.toLowerCase().includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {status}
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <SectionTitle title="Token & Currency Information" />
            <FormInput
              label="Token Address"
              name="tokenAddress"
              value={formData.tokenAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              required
            />
            <FormInput
              label="Currency Address"
              name="currencyAddress"
              value={formData.currencyAddress}
              onChange={handleInputChange}
              placeholder="Leave empty for ETH (Native Currency)"
              info="e.g., USDC, USDT contract address"
            />
            <FormInput
              label="Presale Image (Optional)"
              name="presaleImage"
              type="file"
              onChange={handleInputChange}
              info="Select an image file"
            />

            <SectionTitle title="Sale Parameters" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Presale Rate"
                name="presaleRate"
                type="number"
                value={formData.presaleRate}
                onChange={handleInputChange}
                placeholder="Tokens per ETH"
                required
                info={`Tokens per ${
                  formData.currencyAddress ? "selected currency" : "ETH"
                }`}
              />
              <FormInput
                label="Listing Rate"
                name="listingRate"
                type="number"
                value={formData.listingRate}
                onChange={handleInputChange}
                placeholder="Tokens per ETH for LP"
                required
                info="For initial DEX liquidity"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Hard Cap"
                name="hardCap"
                type="number"
                value={formData.hardCap}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                required
                info={`In ${
                  formData.currencyAddress ? "selected currency" : "ETH"
                }`}
              />
              <FormInput
                label="Soft Cap"
                name="softCap"
                type="number"
                value={formData.softCap}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                required
                info={`In ${
                  formData.currencyAddress ? "selected currency" : "ETH"
                }`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Minimum Contribution"
                name="minContribution"
                type="number"
                value={formData.minContribution}
                onChange={handleInputChange}
                placeholder="e.g., 0.1"
                required
                info={`Per user, in ${
                  formData.currencyAddress ? "selected currency" : "ETH"
                }`}
              />
              <FormInput
                label="Maximum Contribution"
                name="maxContribution"
                type="number"
                value={formData.maxContribution}
                onChange={handleInputChange}
                placeholder="e.g., 1"
                required
                info={`Per user, in ${
                  formData.currencyAddress ? "selected currency" : "ETH"
                }`}
              />
            </div>

            <SectionTitle title="Liquidity & Schedule" />
            <FormInput
              label="Liquidity BPS"
              name="liquidityBps"
              type="select"
              value={formData.liquidityBps}
              onChange={handleInputChange}
              required
              info="Percent of raised funds for LP"
            >
              <option value="">Select Liquidity %</option>
              <option value="5000">50%</option>
              <option value="6000">60%</option>
              <option value="7000">70%</option>
              <option value="8000">80%</option>
              <option value="9000">90%</option>
              <option value="10000">100%</option>
            </FormInput>
            <FormInput
              label="LP Lockup Duration (seconds)"
              name="lockupDuration"
              type="number"
              value={formData.lockupDuration}
              onChange={handleInputChange}
              placeholder="e.g., 2592000 for 30 days"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Presale Start Time"
                name="start"
                type="datetime-local"
                value={formData.start}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Presale End Time"
                name="end"
                type="datetime-local"
                value={formData.end}
                onChange={handleInputChange}
                required
              />
            </div>
            <FormInput
              label="Claim Delay (minutes after presale ends)"
              name="claimDelayMinutes"
              type="number"
              value={formData.claimDelayMinutes}
              onChange={handleInputChange}
              info="Informational, not enforced by this base contract"
            />
            <FormInput
              label="Router Slippage BPS"
              name="slippageBps"
              type="number"
              value={formData.slippageBps}
              onChange={handleInputChange}
              placeholder="0-10000 (e.g., 500 for 5%)"
              required
            />

            <SectionTitle title="Vesting (Optional)" />
            <div className="flex items-center">
              <FormInput
                label=""
                name="useVesting"
                type="checkbox"
                checked={formData.useVesting}
                onChange={handleInputChange}
              />
              <label
                htmlFor="useVesting"
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Enable Vesting for Participants
              </label>
            </div>

            {formData.useVesting && (
              <div className="pl-6 mt-2 space-y-4 border-l-2 border-gray-200">
                <FormInput
                  label="TGE Percent"
                  name="vestingTgePercent"
                  type="number"
                  value={formData.vestingTgePercent}
                  onChange={handleInputChange}
                  placeholder="0-100 (e.g., 10 for 10%)"
                  info="Percentage of tokens released at TGE"
                />
                <FormInput
                  label="Vesting Cycle Days"
                  name="vestingCycleDays"
                  type="number"
                  value={formData.vestingCycleDays}
                  onChange={handleInputChange}
                  placeholder="e.g., 30"
                  info="Duration of each vesting period after TGE"
                />
              </div>
            )}

            <SectionTitle title="Additional Options" />
            <FormInput
              label="Leftover Token Option"
              name="leftoverTokenOption"
              type="select"
              value={formData.leftoverTokenOption}
              onChange={handleInputChange}
              required
            >
              <option value="0">Return to Owner</option>
              <option value="1">Burn</option>
              <option value="2">
                Vest with Liquidity (if contract supports)
              </option>
            </FormInput>

            <SectionTitle title="Whitelist Configuration" />
            <FormInput
              label="Whitelist Type"
              name="whitelistType"
              type="select"
              value={formData.whitelistType}
              onChange={handleInputChange}
            >
              <option value="0">None (Public Sale)</option>
              <option value="1">Merkle Tree</option>
              <option value="2">NFT Holders</option>
            </FormInput>
            {formData.whitelistType === "1" && (
              <FormInput
                label="Merkle Root"
                name="merkleRoot"
                value={formData.merkleRoot}
                onChange={handleInputChange}
                placeholder="0x... (32-byte hex)"
              />
            )}
            {formData.whitelistType === "2" && (
              <FormInput
                label="NFT Contract Address"
                name="nftContractAddress"
                value={formData.nftContractAddress}
                onChange={handleInputChange}
                placeholder="0x..."
              />
            )}

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-700">
                Token to Deposit:{" "}
                <span className="font-semibold">
                  {tokenDeposit} {tokenSymbol}
                </span>{" "}
                (Decimals: {tokenDecimals})
              </p>
              <p className="text-sm text-gray-700">
                Your Token Balance:{" "}
                <span className="font-semibold">
                  {tokenBalance} {tokenSymbol}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Presale Creation Fee:{" "}
                <span className="font-semibold">
                  {creationFee} {creationFeeTokenSymbol}
                </span>
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                onClick={checkTokenBalanceAndDetails}
                disabled={isTxPending}
              >
                Refresh Token Balance & Details
              </button>
              {creationFeeTokenAddress &&
                creationFeeTokenAddress !== zeroAddress &&
                parseFloat(creationFee) > 0 && (
                  <button
                    type="button"
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    onClick={handleApproveFeeToken}
                    disabled={isTxPending}
                  >
                    Approve Fee Token ({creationFeeTokenSymbol})
                  </button>
                )}
              <button
                type="button"
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                onClick={handleApprovePresaleToken}
                disabled={isTxPending}
              >
                Approve Presale Token ({tokenSymbol || "Token"})
              </button>
              <button
                type="button"
                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-semibold text-lg"
                onClick={createPresale}
                disabled={isTxPending}
              >
                Create Presale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePresalePage;
