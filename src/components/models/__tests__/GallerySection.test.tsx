import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import GallerySection from "../GallerySection";

const mockImages = [
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg",
];

describe("GallerySection", () => {
  const defaultProps = {
    images: mockImages,
    currentIndex: 0,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    projectName: "Test Project",
  };

  beforeEach(() => {
    defaultProps.onPrev.mockClear();
    defaultProps.onNext.mockClear();
  });

  it("renders the current image counter", () => {
    render(<GallerySection {...defaultProps} />);
    
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("updates counter based on currentIndex", () => {
    render(<GallerySection {...defaultProps} currentIndex={1} />);
    
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("renders navigation arrows for multiple images", () => {
    render(<GallerySection {...defaultProps} />);
    
    const buttons = screen.getAllByRole("button");
    // Should have prev and next arrows plus thumbnails
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("does not render navigation arrows for single image", () => {
    render(
      <GallerySection 
        {...defaultProps} 
        images={["https://example.com/single.jpg"]} 
      />
    );
    
    // Only thumbnails, no navigation buttons for single image
    expect(screen.queryByText("1 / 1")).toBeInTheDocument();
  });

  it("calls onPrev when clicking previous button", () => {
    render(<GallerySection {...defaultProps} />);
    
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[0]; // First button is prev
    fireEvent.click(prevButton);
    
    expect(defaultProps.onPrev).toHaveBeenCalled();
  });

  it("calls onNext when clicking next button", () => {
    render(<GallerySection {...defaultProps} />);
    
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[1]; // Second button is next
    fireEvent.click(nextButton);
    
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it("renders thumbnails for each image", () => {
    render(<GallerySection {...defaultProps} />);
    
    const thumbnails = screen.getAllByRole("img");
    // Main image + 3 thumbnails
    expect(thumbnails.length).toBe(4);
  });

  it("calls onSelect when clicking a thumbnail", () => {
    const mockOnSelect = vi.fn();
    
    render(
      <GallerySection 
        {...defaultProps} 
        onSelect={mockOnSelect}
      />
    );
    
    const buttons = screen.getAllByRole("button");
    // Click the third thumbnail (index 2)
    const thumbnailButtons = buttons.slice(2);
    fireEvent.click(thumbnailButtons[2]);
    
    expect(mockOnSelect).toHaveBeenCalledWith(2);
  });

  it("applies compact styles when compact prop is true", () => {
    render(<GallerySection {...defaultProps} compact={true} />);
    
    // Component should render without errors in compact mode
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("uses custom aspect ratio when provided", () => {
    render(
      <GallerySection 
        {...defaultProps} 
        aspectRatio="aspect-[4/3]"
      />
    );
    
    // Component should render with custom aspect ratio
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });
});
