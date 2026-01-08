import { describe, it, expect } from "vitest";
import { 
  parsePriceRange, 
  formatPriceValue, 
  getFormattedPrice, 
  getAllFormattedPrices, 
  hasCurrency, 
  getAvailableCurrencies,
  Currency,
  CURRENCY_LABELS 
} from "@/lib/priceUtils";

describe("Price Utilities Integration", () => {
  describe("parsePriceRange", () => {
    it("parses valid JSON price range", () => {
      const priceRange = '{"usd": "$50,000", "clp": "$45,000,000", "uf": "1,200 UF"}';
      const result = parsePriceRange(priceRange);
      
      expect(result.usd).toBe("$50,000");
      expect(result.clp).toBe("$45,000,000");
      expect(result.uf).toBe("1,200 UF");
    });

    it("returns empty object for null input", () => {
      const result = parsePriceRange(null);
      expect(result).toEqual({});
    });

    it("returns empty object for invalid JSON", () => {
      const result = parsePriceRange("invalid json");
      expect(result).toEqual({});
    });

    it("handles empty string", () => {
      const result = parsePriceRange("");
      expect(result).toEqual({});
    });
  });

  describe("formatPriceValue", () => {
    it("formats USD prices", () => {
      const result = formatPriceValue("$50,000", "usd");
      expect(result).toContain("USD");
    });

    it("formats CLP prices", () => {
      const result = formatPriceValue("$45,000,000", "clp");
      expect(result).toContain("CLP");
    });

    it("formats UF prices", () => {
      const result = formatPriceValue("1,200 UF", "uf");
      expect(result).toContain("UF");
    });

    it("returns empty string for empty value", () => {
      const result = formatPriceValue("", "usd");
      expect(result).toBe("");
    });
  });

  describe("getFormattedPrice", () => {
    const priceRange = '{"usd": "$50,000", "clp": "$45,000,000", "uf": "1,200 UF"}';

    it("gets USD price", () => {
      const result = getFormattedPrice(priceRange, "usd");
      expect(result).toContain("50,000");
    });

    it("gets CLP price", () => {
      const result = getFormattedPrice(priceRange, "clp");
      expect(result).toContain("45,000,000");
    });

    it("gets UF price", () => {
      const result = getFormattedPrice(priceRange, "uf");
      expect(result).toContain("1,200");
    });

    it("returns fallback for missing currency", () => {
      const partialRange = '{"usd": "$50,000"}';
      const result = getFormattedPrice(partialRange, "clp");
      // Should return something (fallback behavior)
      expect(typeof result).toBe("string");
    });

    it("handles null price range", () => {
      const result = getFormattedPrice(null, "usd");
      expect(result).toBe("Consultar");
    });
  });

  describe("getAllFormattedPrices", () => {
    it("returns all available prices", () => {
      const priceRange = '{"usd": "$50,000", "clp": "$45,000,000", "uf": "1,200 UF"}';
      const result = getAllFormattedPrices(priceRange);
      
      expect(result.usd).toBeDefined();
      expect(result.clp).toBeDefined();
      expect(result.uf).toBeDefined();
    });

    it("handles partial price data", () => {
      const priceRange = '{"usd": "$50,000"}';
      const result = getAllFormattedPrices(priceRange);
      
      expect(result.usd).toBeDefined();
      expect(result.clp).toBe("");
      expect(result.uf).toBe("");
    });
  });

  describe("hasCurrency", () => {
    const priceRange = '{"usd": "$50,000", "clp": "$45,000,000"}';

    it("returns true for available currency", () => {
      expect(hasCurrency(priceRange, "usd")).toBe(true);
      expect(hasCurrency(priceRange, "clp")).toBe(true);
    });

    it("returns false for unavailable currency", () => {
      expect(hasCurrency(priceRange, "uf")).toBe(false);
    });

    it("returns false for null price range", () => {
      expect(hasCurrency(null, "usd")).toBe(false);
    });
  });

  describe("getAvailableCurrencies", () => {
    it("returns all available currencies", () => {
      const priceRange = '{"usd": "$50,000", "clp": "$45,000,000", "uf": "1,200 UF"}';
      const result = getAvailableCurrencies(priceRange);
      
      expect(result).toContain("usd");
      expect(result).toContain("clp");
      expect(result).toContain("uf");
    });

    it("returns only available currencies", () => {
      const priceRange = '{"usd": "$50,000"}';
      const result = getAvailableCurrencies(priceRange);
      
      expect(result).toContain("usd");
      expect(result).not.toContain("clp");
      expect(result).not.toContain("uf");
    });

    it("returns empty array for null", () => {
      const result = getAvailableCurrencies(null);
      expect(result).toEqual([]);
    });
  });

  describe("CURRENCY_LABELS", () => {
    it("has labels for all currencies", () => {
      expect(CURRENCY_LABELS.usd).toBeDefined();
      expect(CURRENCY_LABELS.clp).toBeDefined();
      expect(CURRENCY_LABELS.uf).toBeDefined();
    });
  });

  describe("Currency Flow Integration", () => {
    it("complete price display flow", () => {
      const priceRange = '{"usd": "$50,000", "clp": "$45,000,000", "uf": "1,200 UF"}';
      
      // 1. Check available currencies
      const available = getAvailableCurrencies(priceRange);
      expect(available.length).toBe(3);
      
      // 2. Get formatted price for each
      available.forEach((currency) => {
        const price = getFormattedPrice(priceRange, currency);
        expect(price.length).toBeGreaterThan(0);
      });
      
      // 3. All prices at once
      const allPrices = getAllFormattedPrices(priceRange);
      expect(Object.keys(allPrices).length).toBe(3);
    });
  });
});
