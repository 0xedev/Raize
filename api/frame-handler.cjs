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

// --- Environment Variables ---
// const ALCHEMY_API_KEY = process.env.RAIZE_ALCHEMY_API_KEY;
const CHAIN_RPC_URL = process.env.VITE_BASE_MAINNET_RPC_URL;
const PRESALE_FACTORY_ADDRESS = process.env.VITE_PRESALE_FACTORY_ADDRESS;
const APP_URL = process.env.APP_URL || "https://raize-taupe.vercel.app";

// Variables to hold dynamically imported ABI modules
let PRESALE_ABI_MODULE;
let ERC20_ABI_MODULE;
let PRESALE_FACTORY_ABI_MODULE;

// Helper to load ESM-like CJS modules dynamically
async function ensureModulesLoaded() {
  if (!PRESALE_ABI_MODULE) {
    PRESALE_ABI_MODULE = await import("../src/abis/cjs/PresaleABI.cjs");
  }
  if (!ERC20_ABI_MODULE) {
    ERC20_ABI_MODULE = await import("../src/abis/cjs/Erc20ABI.cjs");
  }
  if (!PRESALE_FACTORY_ABI_MODULE) {
    PRESALE_FACTORY_ABI_MODULE = await import(
      "../src/abis/cjs/PresaleFactoryABI.cjs"
    );
  }
}

let publicClient;

function getServerConfig() {
  if (!CHAIN_RPC_URL) {
    throw new Error("RAIZE_CHAIN_RPC_URL environment variable is not set.");
  }
  if (!PRESALE_FACTORY_ADDRESS) {
    throw new Error(
      "RAIZE_PRESALE_FACTORY_ADDRESS environment variable is not set."
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

// --- Helper Function to Fetch Presale Data ---
async function getPresaleFrameData(presaleAddress) {
  console.log(
    `[Frame Handler] Fetching onchain data for presale: ${presaleAddress}`
  );
  await ensureModulesLoaded();
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
      "[Frame Handler] Critical: One or more ABIs failed to load correctly.",
      { PRESALE_ABI_MODULE, ERC20_ABI_MODULE, PRESALE_FACTORY_ABI_MODULE }
    );
    throw new Error("ABI loading failed. Check module exports and paths.");
  }

  try {
    const individualPresaleContract = {
      address: getAddress(presaleAddress),
      abi: PRESALE_ABI,
    };

    const factoryContract = {
      address: getAddress(PRESALE_FACTORY_ADDRESS),
      abi: PRESALE_FACTORY_ABI,
    };

    // 1. Fetch PresaleOptions from the Factory
    // PresaleFactory.getPresaleOptionsByAddress(address) returns Presale.PresaleOptions
    const presaleOptions = await client.readContract({
      ...factoryContract,
      functionName: "getPresaleOptionsByAddress",
      args: [getAddress(presaleAddress)],
    });

    // Destructure from presaleOptions (names must match your Presale.PresaleOptions struct in Solidity)

    const {
      currency: currencyAddress, // address
      presaleRate: rate, // uint256
      hardCap, // uint256
      start: startTime, // uint256
      end: endTime, // uint256
      // ... other fields from PresaleOptions
    } = presaleOptions;

    // 2. Fetch token address and total raised from the individual Presale contract
    const tokenAddress = await client.readContract({
      ...individualPresaleContract,
      functionName: "token",
    });

    const totalRaised = await client.readContract({
      ...individualPresaleContract,
      functionName: "totalRaised",
    });

    // 3. Fetch presale state from the individual Presale contract
    const presaleStateUint = await client.readContract({
      ...individualPresaleContract,
      functionName: "state",
    });

    let tokenSymbol = "TKN";
    let tokenDecimals = 18;
    try {
      tokenSymbol = await client.readContract({
        address: tokenAddress,
        abi: ERC20_MINIMAL_ABI,
        functionName: "symbol",
      });
      tokenDecimals = await client.readContract({
        address: tokenAddress,
        abi: ERC20_MINIMAL_ABI,
        functionName: "decimals",
      });
    } catch (e) {
      console.warn(
        `[Frame Handler] Could not fetch token details for ${tokenAddress}: ${e.message}`
      );
    }

    let currencySymbol = "ETH"; // Default for native currency
    let currencyDecimals = 18;
    if (currencyAddress !== "0x0000000000000000000000000000000000000000") {
      try {
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
      } catch (e) {
        console.warn(
          `[Frame Handler] Could not fetch currency details for ${currencyAddress}: ${e.message}`
        );
        currencySymbol = "TOK"; // Fallback symbol
      }
    }

    // Determine statusText based on presaleStateUint

    let statusText;
    switch (Number(presaleStateUint)) {
      case 0: // Assuming 0 is Upcoming
        statusText = "Upcoming";
        break;
      case 1: // Assuming 1 is Active
        statusText = "Active";
        if (totalRaised >= hardCap) {
          statusText = "Active (Hard Cap Reached)"; // Or just "Success" if state transitions immediately
        }
        break;
      case 2: // Assuming 2 is Success/Successful
        statusText = "Success";
        break;
      case 3: // Assuming 3 is Failed
        statusText = "Failed";
        break;
      case 4: // Assuming 4 is Canceled
        statusText = "Canceled";
        break;
      default:
        statusText = "Unknown";
    }

    // --- Dynamically generate or fetch image URL ---
    let dynamicImageUrl = `${APP_URL}/default-presale-image.png`; // Fallback
    try {
      // Direct image URL without JSON parsing
      dynamicImageUrl = `${APP_URL}/api/generate-presale-image?address=${presaleAddress}`;

      // Optionally verify the image endpoint is responding
      const imageCheck = await fetch(dynamicImageUrl, { method: "HEAD" });
      if (!imageCheck.ok) {
        console.warn(
          `[Frame Handler] Image endpoint not responding for ${presaleAddress}: ${imageCheck.status}`
        );
        dynamicImageUrl = `${APP_URL}/default-presale-image.png`;
      }
    } catch (imgError) {
      console.warn(
        `[Frame Handler] Failed to verify image endpoint for ${presaleAddress}: ${imgError.message}`
      );
      dynamicImageUrl = `${APP_URL}/default-presale-image.png`;
    }

    return {
      tokenSymbol,
      imageUrl: dynamicImageUrl,
      status: statusText,
      presaleRate: formatUnits(rate, tokenDecimals),
      hardCap: formatUnits(hardCap, currencyDecimals),
      currencySymbol,
    };
  } catch (err) {
    console.error(
      `[Frame Handler] Exception fetching onchain data for presale ${presaleAddress}:`,
      err
    );
    return { error: `Server error fetching presale data: ${err.message}` };
  }
}

async function serveOriginalHtmlWithError(
  res,
  presaleAddress,
  errorMessage,
  htmlContent
) {
  console.warn(
    `[Frame Handler] Data fetch error for ${presaleAddress}: ${errorMessage}. Serving default frame or original HTML.`
  );

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(htmlContent);
}

// --- Vercel Serverless Function Export ---
module.exports = async (req, res) => {
  try {
    await ensureModulesLoaded(); // Ensure ABIs are available for all requests
    getServerConfig(); // Initialize public client if not already

    console.log(`[Frame Handler] Received request: ${req.url}`);

    const presaleAddress = req.query.address;

    if (!presaleAddress || !isAddress(presaleAddress)) {
      return res.status(400).send("Invalid or missing presale address");
    }

    const indexPath = path.resolve(
      process.cwd(),
      ".next/server/pages/index.html"
    ); // Adjust path for Vite/Next.js if needed
    let htmlContent;
    try {
      htmlContent = fs.readFileSync(indexPath, "utf8");
    } catch (fsError) {
      // Fallback path for local dev or different build structures
      const fallbackPath = path.resolve(process.cwd(), "dist/index.html"); // Common path for Vite builds
      try {
        htmlContent = fs.readFileSync(fallbackPath, "utf8");
      } catch (fallbackError) {
        console.error(
          "[Frame Handler] Error reading index.html:",
          fsError,
          fallbackError
        );
        return res.status(500).send("Error reading application template");
      }
    }

    // Fetch dynamic data for the frame
    const frameData = await getPresaleFrameData(presaleAddress);

    if (frameData.error) {
      return serveOriginalHtmlWithError(
        res,
        presaleAddress,
        frameData.error,
        htmlContent
      );
    }

    // Remove existing Farcaster meta tags from the original HTML to avoid conflicts
    // as Farcaster debuggers might pick up the first ones they see.
    htmlContent = htmlContent.replace(/<meta\s+name="fc:frame"[^>]*>/gi, "");
    htmlContent = htmlContent.replace(
      /<meta\s+property="fc:frame"[^>]*>/gi,
      ""
    ); // Also check for property
    htmlContent = htmlContent.replace(
      /<meta\s+name="fc:frame-default-for-spa"[^>]*>/gi,
      ""
    );

    // --- Construct Meta Tags --- //
    const pageUrl = `${APP_URL}/presale/${presaleAddress}`;
    const postUrl = `${APP_URL}/api/frame-action-handler`;

    const frameMeta = {
      version: "next",
      imageUrl: frameData.imageUrl,
      imageAspectRatio: "3:2",
      postUrl: `${postUrl}?address=${presaleAddress}`,
      button: {
        title: "Join this Presale",
        action: {
          type: "launch_frame",
          url: pageUrl,
          name: "Raize",
          splashImageUrl: `${APP_URL}/logo.png`,
          splashBackgroundColor: "#1f2937",
        },
      },
    };

    const escapeForHtml = (json) =>
      JSON.stringify(json).replace(/"/g, "&quot;");

    const metaTags = `
  <meta name="fc:frame" content="${escapeForHtml(frameMeta)}" />
  <meta property="og:title" content="${
    frameData.tokenSymbol
  } Presale on Raize" />
  <meta property="og:description" content="Join the ${
    frameData.tokenSymbol
  } presale! Status: ${frameData.status}. Rate: ${frameData.presaleRate} ${
      frameData.tokenSymbol
    }/${frameData.currencySymbol}. Hard Cap: ${frameData.hardCap} ${
      frameData.currencySymbol
    }." />
  <meta property="og:image" content="${frameData.imageUrl}" />
`;

    // Inject meta tags into the <head> section
    const modifiedHtml = htmlContent.replace("</head>", `${metaTags}</head>`);

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(modifiedHtml);
  } catch (error) {
    console.error("[Frame Handler] General error:", error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
};
