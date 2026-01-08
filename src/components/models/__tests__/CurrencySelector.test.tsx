import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import CurrencySelector from "../CurrencySelector";

describe("CurrencySelector", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders all currency options", () => {
    render(
      <CurrencySelector 
        value="usd" 
        onChange={mockOnChange} 
        priceRange={null} 
      />
    );
    
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("CLP")).toBeInTheDocument();
    expect(screen.getByText("UF")).toBeInTheDocument();
  });

  it("highlights the selected currency", () => {
    render(
      <CurrencySelector 
        value="clp" 
        onChange={mockOnChange} 
        priceRange={null} 
      />
    );
    
    const clpButton = screen.getByText("CLP");
    expect(clpButton).toHaveClass("bg-primary");
  });

  it("calls onChange when a currency is clicked", () => {
    render(
      <CurrencySelector 
        value="usd" 
        onChange={mockOnChange} 
        priceRange={null} 
      />
    );
    
    fireEvent.click(screen.getByText("CLP"));
    expect(mockOnChange).toHaveBeenCalledWith("clp");
  });

  it("disables unavailable currencies based on priceRange", () => {
    const priceRange = JSON.stringify({ usd: "$50,000" });
    
    render(
      <CurrencySelector 
        value="usd" 
        onChange={mockOnChange} 
        priceRange={priceRange} 
      />
    );
    
    const clpButton = screen.getByText("CLP");
    expect(clpButton).toBeDisabled();
  });
});
