#!/usr/bin/env node
const {
  getAddress,
  isAddress,
  createPublicClient,
  http,
  formatUnits,
} = require("viem");
const { base } = require("viem/chains");
const fs = require("fs");
const path = require("path");
const satori = require("satori").default;
const sharp = require("sharp");
const { put: vercelBlobPut } = require("@vercel/blob");

const {
  fetchFarcasterProfilesByAddresses,
} = require("./utils/farcaster-profiles.cjs");
const { getPresaleImageHtml } = require("./utils/satori-templates.cjs");
const { base58 } = require("ethers/lib/utils");

// --- Environment Variables ---
const CHAIN_RPC_URL = process.env.VITE_BASE_MAINNET_RPC_URL;
const PRESALE_FACTORY_ADDRESS = process.env.VITE_PRESALE_FACTORY_ADDRESS;
const APP_URL = process.env.APP_URL || "https://raize-taupe.vercel.app";
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const DEFAULT_FALLBACK_IMAGE_URL = `${APP_URL}/logo.png`;

// --- ABI Imports (ensure paths are correct) ---
let PRESALE_ABI_MODULE;
let ERC20_ABI_MODULE;
let PRESALE_FACTORY_ABI_MODULE;
let satoriHtmlModuleInstance;

async function ensureModulesLoaded() {
  if (!PRESALE_ABI_MODULE)
    PRESALE_ABI_MODULE = await import("../src/abis/cjs/PresaleABI.cjs");
  if (!ERC20_ABI_MODULE)
    ERC20_ABI_MODULE = await import("../src/abis/cjs/Erc20ABI.cjs");
  if (!PRESALE_FACTORY_ABI_MODULE)
    PRESALE_FACTORY_ABI_MODULE = await import(
      "../src/abis/cjs/PresaleFactoryABI.cjs"
    );
  if (!satoriHtmlModuleInstance) {
    satoriHtmlModuleInstance = await import("satori-html");
  }
}

let publicClient;
function getServerConfig() {
  if (!CHAIN_RPC_URL || !PRESALE_FACTORY_ADDRESS || !BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Missing required environment variables for image generation."
    );
  }
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: base,
      transport: http(CHAIN_RPC_URL),
    });
  }
  return { publicClient };
}

async function getFontData(fontPath) {
  const resolvedFontPath = path.resolve(
    process.cwd(),
    fontPath.startsWith("/") ? fontPath.substring(1) : fontPath
  );
  if (fs.existsSync(resolvedFontPath)) {
    return fs.readFileSync(resolvedFontPath);
  }
  // Fallback for trying to fetch if it's a URL (less ideal for serverless cold starts)
  try {
    const response = await fetch(
      fontPath.startsWith("http") ? fontPath : `${APP_URL}/${fontPath}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (e) {
    console.error(`Failed to load font ${fontPath}: ${e.message}`);
    // Fallback to a system font or handle error
    return null; // Satori might use a default system font if data is null/undefined
  }
}

module.exports = async (req, res) => {
  try {
    await ensureModulesLoaded();
    const { html: satoriHtml } = satoriHtmlModuleInstance;
    const { publicClient: client } = getServerConfig();

    // Robustly access ABI arrays, accounting for potential 'default' export
    const presaleAbiModuleResolved =
      PRESALE_ABI_MODULE.default || PRESALE_ABI_MODULE;
    const erc20AbiModuleResolved = ERC20_ABI_MODULE.default || ERC20_ABI_MODULE;
    const presaleFactoryAbiModuleResolved =
      PRESALE_FACTORY_ABI_MODULE.default || PRESALE_FACTORY_ABI_MODULE;

    const { PRESALE_ABI } = presaleAbiModuleResolved;
    const { ERC20_MINIMAL_ABI } = erc20AbiModuleResolved;
    const { PRESALE_FACTORY_ABI } = presaleFactoryAbiModuleResolved;

    if (!PRESALE_ABI || !ERC20_MINIMAL_ABI || !PRESALE_FACTORY_ABI) {
      console.error(
        "[GenerateImage] Critical: One or more ABIs failed to load correctly.",
        { PRESALE_ABI_MODULE, ERC20_ABI_MODULE, PRESALE_FACTORY_ABI_MODULE }
      );
      throw new Error(
        "ABI loading failed for image generation. Check module exports and paths."
      );
    }

    const presaleAddress = req.query.address;
    if (!presaleAddress || !isAddress(presaleAddress)) {
      return res.status(400).json({
        error: "Invalid or missing presale address",
        imageUrl: DEFAULT_FALLBACK_IMAGE_URL,
      });
    }

    // --- Fetch Presale Data (Simplified from frame-handler, adapt as needed) ---
    const presaleOptions = await client.readContract({
      address: getAddress(PRESALE_FACTORY_ADDRESS),
      abi: PRESALE_FACTORY_ABI,
      functionName: "getPresaleOptionsByAddress",
      args: [getAddress(presaleAddress)],
    });

    const creatorAddress = await client.readContract({
      address: getAddress(presaleAddress),
      abi: PRESALE_ABI,
      functionName: "owner",
    });
    const tokenAddress = await client.readContract({
      address: getAddress(presaleAddress),
      abi: PRESALE_ABI,
      functionName: "token",
    });
    const totalRaised = await client.readContract({
      address: getAddress(presaleAddress),
      abi: PRESALE_ABI,
      functionName: "totalRaised",
    });

    const {
      currency: currencyAddress,
      hardCap,
      presaleRate: rate,
    } = presaleOptions;

    const tokenSymbol = await client.readContract({
      address: tokenAddress,
      abi: ERC20_MINIMAL_ABI,
      functionName: "symbol",
    });
    const tokenDecimals = await client.readContract({
      address: tokenAddress,
      abi: ERC20_MINIMAL_ABI,
      functionName: "decimals",
    });

    let currencySymbol = "ETH";
    let currencyDecimals = 18;
    if (currencyAddress !== "0x0000000000000000000000000000000000000000") {
      currencySymbol = await client.readContract({
        address: currencyAddress,
        abi: ERC20_MINIMAL_ABI,
        functionName: "symbol",
      });
      currencyDecimals = await client.readContract({
        address: currencyAddress,
        abi: ERC20_MINIMAL_ABI,
        functionName: "decimals",
      });
    }

    const progressPercent =
      (Number(formatUnits(totalRaised, currencyDecimals)) /
        Number(formatUnits(hardCap, currencyDecimals))) *
      100;

    // --- Fetch Farcaster Profiles ---
    const creatorProfileData = await fetchFarcasterProfilesByAddresses([
      creatorAddress,
    ]);
    const creatorProfile = creatorProfileData[getAddress(creatorAddress)] || {
      username: null,
      pfpUrl: null,
    };

    const contributorAddresses = await client.readContract({
      address: getAddress(presaleAddress),
      abi: PRESALE_ABI,
      functionName: "getContributors",
    });
    const selectedContributorAddresses = contributorAddresses.slice(0, 30); // First 30 for now
    const contributorProfilesData = await fetchFarcasterProfilesByAddresses(
      selectedContributorAddresses
    );
    const contributorsForImage = selectedContributorAddresses.map(
      (addr) =>
        contributorProfilesData[getAddress(addr)] || {
          username: "anon",
          pfpUrl: null,
          custodyAddress: addr,
        }
    );

    // --- Prepare Data for Satori ---
    const imageData = {
      creatorUsername: creatorProfile.username,
      creatorPfpUrl: creatorProfile.pfpUrl,
      tokenSymbol,
      progressPercent: Math.min(100, progressPercent),
      totalRaisedFormatted: parseFloat(
        formatUnits(totalRaised, currencyDecimals)
      ).toFixed(2),
      hardCapFormatted: parseFloat(
        formatUnits(hardCap, currencyDecimals)
      ).toFixed(2),
      currencySymbol,
      contributors: contributorsForImage,
    };

    const html = getPresaleImageHtml(imageData);

    // Load fonts
    const interRegularFont = await getFontData("fonts/Inter-Regular.ttf");
    const interBoldFont = await getFontData("fonts/Inter-Bold.ttf");

    if (!interRegularFont || !interBoldFont) {
      console.error("Required fonts could not be loaded.");
      return res.redirect(DEFAULT_FALLBACK_IMAGE_URL);
    }

    // Generate SVG with Satori
    const satoriElementTree = satoriHtml(html);
    const svg = await satori(satoriElementTree, {
      width: 1080,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interRegularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBoldFont,
          weight: 700,
          style: "normal",
        },
      ],
    });

    // Convert SVG to PNG buffer
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    // Set headers for image response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    return res.send(pngBuffer);
  } catch (error) {
    console.error("[GenerateImage] Error:", error);
    return res.redirect(DEFAULT_FALLBACK_IMAGE_URL);
  }
};
