import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import TerrainsTab from "../TerrainsTab";
import { ProjectTerrain } from "@/hooks/useProjectCustomizations";

const mockTerrains: ProjectTerrain[] = [
  {
    id: "terrain-1",
    project_id: "project-1",
    name: "Flat Ground",
    description: "Level terrain",
    storage_path: "https://example.com/flat.jpg",
    price_modifier: 0,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "terrain-2",
    project_id: "project-1",
    name: "Hillside",
    description: null,
    storage_path: null,
    price_modifier: 3000,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("TerrainsTab", () => {
  it("shows loading spinner when isLoading is true", () => {
    render(<TerrainsTab terrains={[]} isLoading={true} />);
    
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows empty state when no terrains are available", () => {
    render(<TerrainsTab terrains={[]} isLoading={false} />);
    
    expect(screen.getByText("Sin tipos de terreno disponibles")).toBeInTheDocument();
  });

  it("renders all terrains", () => {
    render(<TerrainsTab terrains={mockTerrains} isLoading={false} />);
    
    expect(screen.getByText("Flat Ground")).toBeInTheDocument();
    expect(screen.getByText("Hillside")).toBeInTheDocument();
  });

  it("shows price modifier for terrains with cost", () => {
    render(<TerrainsTab terrains={mockTerrains} isLoading={false} />);
    
    expect(screen.getByText("+$3,000")).toBeInTheDocument();
  });

  it("calls onSelect when a terrain is clicked", () => {
    const mockOnSelect = vi.fn();
    
    render(
      <TerrainsTab 
        terrains={mockTerrains} 
        isLoading={false}
        onSelect={mockOnSelect}
      />
    );
    
    fireEvent.click(screen.getByText("Hillside"));
    expect(mockOnSelect).toHaveBeenCalledWith("terrain-2");
  });

  it("toggles selection when clicking same terrain twice", () => {
    const mockOnSelect = vi.fn();
    
    render(
      <TerrainsTab 
        terrains={mockTerrains} 
        isLoading={false}
        selectedId="terrain-2"
        onSelect={mockOnSelect}
      />
    );
    
    fireEvent.click(screen.getByText("Hillside"));
    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
  });

  it("highlights the selected terrain", () => {
    render(
      <TerrainsTab 
        terrains={mockTerrains} 
        isLoading={false}
        selectedId="terrain-1"
      />
    );
    
    const buttons = screen.getAllByRole("button");
    const selectedButton = buttons.find(btn => 
      btn.textContent?.includes("Flat Ground")
    );
    expect(selectedButton).toHaveClass("ring-2");
  });
});
