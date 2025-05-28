import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type BadgeProps } from "@/components/ui/badge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface PresaleStatusReturn {
  text: string;
  variant: BadgeProps["variant"];
}

export const getPresaleStatus = (state: number | undefined, options: any): PresaleStatusReturn => {
  if (state === undefined || !options) return { text: "Loading...", variant: "secondary" };

  const now = BigInt(Math.floor(Date.now() / 1000));
  const startTime = options?.[9] as bigint | undefined;
  const endTime = options?.[10] as bigint | undefined;

  switch (state) {
    case 0: // Pending
      return { text: "Pending", variant: "secondary" };
    case 1: // Active
      if (startTime && now < startTime) return { text: "Upcoming", variant: "default" };
      if (endTime && now > endTime) return { text: "Ended (Processing)", variant: "outline" }; 
      return { text: "Active", variant: "default" };
    case 2: // Canceled (Failed) - As per Presale.sol enum
      return { text: "Canceled (Failed)", variant: "destructive" };
    case 3: // Finalized (Success) - As per Presale.sol enum
      return { text: "Ended (Success)", variant: "default" };
    // Case 4 removed as it's not defined in Presale.sol enum
    default:
      return { text: "Unknown", variant: "secondary" };
  }
};

export const getInitials = (name: string | undefined | null): string => {
    if (!name) return "?";
    const words = name.split(/\s+/);
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (name.length >= 2) {
        return name.substring(0, 2).toUpperCase();
    }
    if (name.length === 1) {
        return name.toUpperCase();
    }
    return "?";
};

export const formatTokenAmount = (amount: bigint | undefined, decimals: number | undefined, symbol: string | undefined): string => {
    if (amount === undefined) return "N/A";
    if (decimals === undefined) return `${amount.toString()} raw units`;
    
    try {
        const formatted = formatUnits(amount, decimals);
        // Remove trailing zeros after decimal point
        const cleanFormatted = formatted.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
        return symbol ? `${cleanFormatted} ${symbol}` : cleanFormatted;
    } catch (e) {
        return `${amount.toString()} raw units`;
    }
};

export const formatCurrencyDisplay = (amount: bigint | undefined, decimals: number | undefined, symbol: string | undefined): string => {
    return formatTokenAmount(amount, decimals, symbol);
};

