/**
 * Generates HTML markup for the presale image.
 * @param {object} data - The data for the image.
 * @param {string} data.creatorUsername - Farcaster username of the presale creator.
 * @param {string|null} data.creatorPfpUrl - PFP URL of the presale creator.
 * @param {string} data.tokenSymbol - Symbol of the token being sold.
 * @param {number} data.progressPercent - Sale progress (0-100).
 * @param {string} data.totalRaisedFormatted - Formatted string of total currency raised.
 * @param {string} data.hardCapFormatted - Formatted string of the hard cap.
 * @param {string} data.currencySymbol - Symbol of the currency.
 * @param {Array<{username: string|null, pfpUrl: string|null}>} data.contributors - Array of contributor profiles.
 * @returns {string} HTML string.
 */
function getPresaleImageHtml(data) {
  const {
    creatorUsername,
    creatorPfpUrl,
    tokenSymbol,
    progressPercent,
    totalRaisedFormatted,
    hardCapFormatted,
    currencySymbol,
    contributors = [],
  } = data;

  const creatorPfp = creatorPfpUrl || "https://raize-taupe.vercel.app/logo.png"; // Fallback PFP
  const displayCreator = creatorUsername || "Anonymous Creator";

  // Tailwind-like classes will be processed by Satori's Yoga layout engine.
  // Ensure fonts are loaded in the Satori options.
  return `
    <div style="display: flex; align-items: center; justify-content: center; width: 1080px; height: 630px; background-color: #134942; color: white; padding: 40px; font-family: 'Inter', sans-serif; border: 2px solid #1A5A52; border-radius: 10px;">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%;">
        <!-- Header: Creator Info & Token -->
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
          <img src="${creatorPfp}" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; border: 2px solid #F7FAF9;" />
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 36px; font-weight: bold; color: #E2E8F0;">${displayCreator}</span>
            <span style="font-size: 48px; font-weight: bold; color: #F7FAF9;">${tokenSymbol} Presale</span>
          </div>
          <img src="https://raize-taupe.vercel.app/logo.png" style="width: 100px; height: 100px; margin-left: auto;"/>
        </div>

        <!-- Progress Bar -->
        <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
          <span style="font-size: 28px; color: #CBD5E1;">Progress:</span>
          <div style="display: flex; width: 100%; background-color: #0F3732; border-radius: 10px; height: 40px; margin-top: 10px; overflow: hidden; border: 1px solid #1A5A52;">
            <div style="width: ${progressPercent}%; background-color: #4FD1C5; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; color: #134942;">
              ${progressPercent.toFixed(1)}%
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <span style="font-size: 24px; color: #E2E8F0;">Raised: ${totalRaisedFormatted} ${currencySymbol}</span>
            <span style="font-size: 24px; color: #E2E8F0;">Hard Cap: ${hardCapFormatted} ${currencySymbol}</span>
          </div>
        </div>

        <!-- Contributors Section -->
        <div style="display: flex; flex-direction: column; margin-top: 30px; border-top: 1px solid #1A5A52; padding-top: 20px;">
          <span style="font-size: 28px; font-weight: bold; color: #CBD5E1; margin-bottom: 15px; display: block;">Recent Contributors:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            ${
              contributors.length > 0
                ? contributors
                    .slice(0, 7) // Show max 7 contributors
                    .map(
                      (c) => `
              <div style="display: flex; align-items: center; background-color: #1A5A52; padding: 8px 12px; border-radius: 20px;">
                <img src="${
                  c.pfpUrl || "https://raize-taupe.vercel.app/logo.png"
                }" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px;" />
                <span style="font-size: 20px; color: #E2E8F0;">${
                  c.username || "anon"
                }</span>
              </div>
            `
                    )
                    .join("")
                : '<span style="font-size: 20px; color: #CBD5E1;">Be the first to contribute!</span>'
            }
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: auto; text-align: center; font-size: 20px; color: #CBD5E1;">
          Powered by Raize
        </div>
      </div>
    </div>
  `;
}

module.exports = { getPresaleImageHtml };
