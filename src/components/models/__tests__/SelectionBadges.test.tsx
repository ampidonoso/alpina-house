import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import SelectionBadges from "../SelectionBadges";
import { ProjectFinish, ProjectTerrain } from "@/hooks/useProjectCustomizations";

const mockFinishes: ProjectFinish[] = [
  {
    id: "finish-1",
    project_id: "project-1",
    name: "Premium Oak",
    description: null,
    storage_path: null,
    price_modifier: 5000,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTerrains: ProjectTerrain[] = [
  {
    id: "terrain-1",
    project_id: "project-1",
    name: "Hillside",
    description: null,
    storage_path: null,
    price_modifier: 3000,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("SelectionBadges", () => {
  const defaultProps = {
    finishes: mockFinishes,
    terrains: mockTerrains,
    onClearFinish: vi.fn(),
    onClearTerrain: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onClearFinish.mockClear();
    defaultProps.onClearTerrain.mockClear();
  });

  it("renders nothing when no selections are made", () => {
    const { container } = render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId={undefined}
        selectedTerrainId={undefined}
      />
    );
    
    // AnimatePresence should hide content when nothing selected
    expect(container.textContent).toBe("");
  });

  it("renders finish badge when finish is selected", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId="finish-1"
        selectedTerrainId={undefined}
      />
    );
    
    expect(screen.getByText("Premium Oak")).toBeInTheDocument();
    expect(screen.getByText("Selecciones incluidas:")).toBeInTheDocument();
  });

  it("renders terrain badge when terrain is selected", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId={undefined}
        selectedTerrainId="terrain-1"
      />
    );
    
    expect(screen.getByText("Hillside")).toBeInTheDocument();
  });

  it("renders both badges when both are selected", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId="finish-1"
        selectedTerrainId="terrain-1"
      />
    );
    
    expect(screen.getByText("Premium Oak")).toBeInTheDocument();
    expect(screen.getByText("Hillside")).toBeInTheDocument();
  });

  it("calls onClearFinish when clicking X on finish badge", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId="finish-1"
        selectedTerrainId={undefined}
      />
    );
    
    const clearButtons = screen.getAllByRole("button");
    fireEvent.click(clearButtons[0]);
    
    expect(defaultProps.onClearFinish).toHaveBeenCalled();
  });

  it("calls onClearTerrain when clicking X on terrain badge", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId={undefined}
        selectedTerrainId="terrain-1"
      />
    );
    
    const clearButtons = screen.getAllByRole("button");
    fireEvent.click(clearButtons[0]);
    
    expect(defaultProps.onClearTerrain).toHaveBeenCalled();
  });

  it("shows fallback text for unknown finish id", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId="unknown-id"
        selectedTerrainId={undefined}
      />
    );
    
    expect(screen.getByText("Terminación")).toBeInTheDocument();
  });

  it("shows fallback text for unknown terrain id", () => {
    render(
      <SelectionBadges 
        {...defaultProps}
        selectedFinishId={undefined}
        selectedTerrainId="unknown-id"
      />
    );
    
    expect(screen.getByText("Terreno")).toBeInTheDocument();
  });
});
