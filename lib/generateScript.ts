import type { MarketingScript, ProductInput } from "./types";
import { generateLocalMarketingScript } from "./localGenerator";

export async function generateMarketingScript(input: ProductInput): Promise<MarketingScript> {
  return generateLocalMarketingScript(input);
}
