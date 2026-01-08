import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all external dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockFinishes, error: null })),
        })),
      })),
    })),
  },
}));

const mockFinishes = [
  {
    id: "finish-1",
    project_id: "project-1",
    name: "Premium Oak",
    description: null,
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

const mockTerrains = [
  {
    id: "terrain-1",
    project_id: "project-1",
    name: "Flat Ground",
    description: null,
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

// Import components after mocking
import FinishesTab from "@/components/models/FinishesTab";
import TerrainsTab from "@/components/models/TerrainsTab";
import SelectionBadges from "@/components/models/SelectionBadges";

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Customization Selection Integration", () => {
  describe("Finish Selection", () => {
    it("renders all available finishes", () => {
      render(
        <TestWrapper>
          <FinishesTab 
            finishes={mockFinishes} 
            isLoading={false} 
          />
        </TestWrapper>
      );

      expect(screen.getByText("Premium Oak")).toBeInTheDocument();
      expect(screen.getByText("Standard Pine")).toBeInTheDocument();
    });

    it("shows price modifier for premium options", () => {
      render(
        <TestWrapper>
          <FinishesTab 
            finishes={mockFinishes} 
            isLoading={false} 
          />
        </TestWrapper>
      );

      expect(screen.getByText("+$5,000")).toBeInTheDocument();
    });

    it("allows selecting a finish", () => {
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FinishesTab 
            finishes={mockFinishes} 
            isLoading={false}
            onSelect={onSelect}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Premium Oak"));
      expect(onSelect).toHaveBeenCalledWith("finish-1");
    });

    it("allows deselecting a finish", () => {
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FinishesTab 
            finishes={mockFinishes} 
            isLoading={false}
            selectedId="finish-1"
            onSelect={onSelect}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Premium Oak"));
      expect(onSelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Terrain Selection", () => {
    it("renders all available terrains", () => {
      render(
        <TestWrapper>
          <TerrainsTab 
            terrains={mockTerrains} 
            isLoading={false} 
          />
        </TestWrapper>
      );

      expect(screen.getByText("Flat Ground")).toBeInTheDocument();
      expect(screen.getByText("Hillside")).toBeInTheDocument();
    });

    it("shows price modifier for complex terrains", () => {
      render(
        <TestWrapper>
          <TerrainsTab 
            terrains={mockTerrains} 
            isLoading={false} 
          />
        </TestWrapper>
      );

      expect(screen.getByText("+$3,000")).toBeInTheDocument();
    });

    it("allows selecting a terrain", () => {
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <TerrainsTab 
            terrains={mockTerrains} 
            isLoading={false}
            onSelect={onSelect}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Hillside"));
      expect(onSelect).toHaveBeenCalledWith("terrain-2");
    });
  });

  describe("Selection Badges", () => {
    it("shows badge when finish is selected", () => {
      render(
        <TestWrapper>
          <SelectionBadges
            selectedFinishId="finish-1"
            selectedTerrainId={undefined}
            finishes={mockFinishes}
            terrains={mockTerrains}
            onClearFinish={vi.fn()}
            onClearTerrain={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Premium Oak")).toBeInTheDocument();
    });

    it("shows badge when terrain is selected", () => {
      render(
        <TestWrapper>
          <SelectionBadges
            selectedFinishId={undefined}
            selectedTerrainId="terrain-2"
            finishes={mockFinishes}
            terrains={mockTerrains}
            onClearFinish={vi.fn()}
            onClearTerrain={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Hillside")).toBeInTheDocument();
    });

    it("shows both badges when both are selected", () => {
      render(
        <TestWrapper>
          <SelectionBadges
            selectedFinishId="finish-1"
            selectedTerrainId="terrain-2"
            finishes={mockFinishes}
            terrains={mockTerrains}
            onClearFinish={vi.fn()}
            onClearTerrain={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Premium Oak")).toBeInTheDocument();
      expect(screen.getByText("Hillside")).toBeInTheDocument();
    });

    it("clears finish when clicking X", () => {
      const onClearFinish = vi.fn();
      
      render(
        <TestWrapper>
          <SelectionBadges
            selectedFinishId="finish-1"
            selectedTerrainId={undefined}
            finishes={mockFinishes}
            terrains={mockTerrains}
            onClearFinish={onClearFinish}
            onClearTerrain={vi.fn()}
          />
        </TestWrapper>
      );

      const clearButtons = screen.getAllByRole("button");
      fireEvent.click(clearButtons[0]);
      expect(onClearFinish).toHaveBeenCalled();
    });

    it("clears terrain when clicking X", () => {
      const onClearTerrain = vi.fn();
      
      render(
        <TestWrapper>
          <SelectionBadges
            selectedFinishId={undefined}
            selectedTerrainId="terrain-2"
            finishes={mockFinishes}
            terrains={mockTerrains}
            onClearFinish={vi.fn()}
            onClearTerrain={onClearTerrain}
          />
        </TestWrapper>
      );

      const clearButtons = screen.getAllByRole("button");
      fireEvent.click(clearButtons[0]);
      expect(onClearTerrain).toHaveBeenCalled();
    });
  });

  describe("Combined Selection Flow", () => {
    it("maintains selections independently", () => {
      const finishSelect = vi.fn();
      const terrainSelect = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          <div>
            <FinishesTab 
              finishes={mockFinishes} 
              isLoading={false}
              selectedId="finish-1"
              onSelect={finishSelect}
            />
            <TerrainsTab 
              terrains={mockTerrains} 
              isLoading={false}
              selectedId="terrain-2"
              onSelect={terrainSelect}
            />
          </div>
        </TestWrapper>
      );

      // Both should be selectable independently
      expect(screen.getByText("Premium Oak")).toBeInTheDocument();
      expect(screen.getByText("Hillside")).toBeInTheDocument();

      // Click on a different finish
      fireEvent.click(screen.getByText("Standard Pine"));
      expect(finishSelect).toHaveBeenCalledWith("finish-2");

      // Terrain selection should not be affected
      expect(terrainSelect).not.toHaveBeenCalled();
    });
  });
});
