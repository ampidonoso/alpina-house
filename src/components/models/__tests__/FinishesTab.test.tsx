import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import FinishesTab from "../FinishesTab";
import { ProjectFinish } from "@/hooks/useProjectCustomizations";

const mockFinishes: ProjectFinish[] = [
  {
    id: "finish-1",
    project_id: "project-1",
    name: "Premium Oak",
    description: "High quality oak finish",
    storage_path: "https://example.com/oak.jpg",
    price_modifier: 5000,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "finish-2",
    project_id: "project-1",
    name: "Standard Pine",
    description: null,
    storage_path: null,
    price_modifier: 0,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("FinishesTab", () => {
  it("shows loading spinner when isLoading is true", () => {
    render(<FinishesTab finishes={[]} isLoading={true} />);
    
    expect(screen.getByRole("status") || document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows empty state when no finishes are available", () => {
    render(<FinishesTab finishes={[]} isLoading={false} />);
    
    expect(screen.getByText("Sin terminaciones disponibles")).toBeInTheDocument();
  });

  it("renders all finishes", () => {
    render(<FinishesTab finishes={mockFinishes} isLoading={false} />);
    
    expect(screen.getByText("Premium Oak")).toBeInTheDocument();
    expect(screen.getByText("Standard Pine")).toBeInTheDocument();
  });

  it("shows price modifier for finishes with cost", () => {
    render(<FinishesTab finishes={mockFinishes} isLoading={false} />);
    
    expect(screen.getByText("+$5,000")).toBeInTheDocument();
  });

  it("calls onSelect when a finish is clicked", () => {
    const mockOnSelect = vi.fn();
    
    render(
      <FinishesTab 
        finishes={mockFinishes} 
        isLoading={false}
        onSelect={mockOnSelect}
      />
    );
    
    fireEvent.click(screen.getByText("Premium Oak"));
    expect(mockOnSelect).toHaveBeenCalledWith("finish-1");
  });

  it("toggles selection when clicking same finish twice", () => {
    const mockOnSelect = vi.fn();
    
    render(
      <FinishesTab 
        finishes={mockFinishes} 
        isLoading={false}
        selectedId="finish-1"
        onSelect={mockOnSelect}
      />
    );
    
    fireEvent.click(screen.getByText("Premium Oak"));
    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
  });

  it("highlights the selected finish", () => {
    render(
      <FinishesTab 
        finishes={mockFinishes} 
        isLoading={false}
        selectedId="finish-1"
      />
    );
    
    // Check for the checkmark icon indicating selection
    const buttons = screen.getAllByRole("button");
    const selectedButton = buttons.find(btn => 
      btn.textContent?.includes("Premium Oak")
    );
    expect(selectedButton).toHaveClass("ring-2");
  });
});
