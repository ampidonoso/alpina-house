import { describe, it, expect } from "vitest";
import { getMainImage, getAllImages } from "@/lib/projectUtils";
import { Project } from "@/hooks/useProjects";

const createMockProject = (images: any[] = []): Project => ({
  id: "project-1",
  name: "Test Project",
  slug: "test-project",
  description: "A test project",
  location: "Test Location",
  area_m2: 100,
  bedrooms: 3,
  bathrooms: 2,
  construction_time_months: 6,
  price_range: { usd: "$50,000" },
  features: ["Feature 1", "Feature 2"],
  is_published: true,
  is_featured: false,
  display_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images,
});

describe("getMainImage", () => {
  const fallback = "fallback-image.jpg";

  it("returns fallback when project has no images", () => {
    const project = createMockProject([]);
    expect(getMainImage(project, fallback)).toBe(fallback);
  });

  it("returns cover image when is_cover is true", () => {
    const project = createMockProject([
      { id: "1", storage_path: "regular.jpg", is_cover: false, image_type: "gallery" },
      { id: "2", storage_path: "cover.jpg", is_cover: true, image_type: "gallery" },
    ]);
    expect(getMainImage(project, fallback)).toBe("cover.jpg");
  });

  it("returns cover image when image_type is cover", () => {
    const project = createMockProject([
      { id: "1", storage_path: "regular.jpg", is_cover: false, image_type: "gallery" },
      { id: "2", storage_path: "cover.jpg", is_cover: false, image_type: "cover" },
    ]);
    expect(getMainImage(project, fallback)).toBe("cover.jpg");
  });

  it("returns first image when no cover is specified", () => {
    const project = createMockProject([
      { id: "1", storage_path: "first.jpg", is_cover: false, image_type: "gallery" },
      { id: "2", storage_path: "second.jpg", is_cover: false, image_type: "gallery" },
    ]);
    expect(getMainImage(project, fallback)).toBe("first.jpg");
  });

  it("prioritizes is_cover over image_type", () => {
    const project = createMockProject([
      { id: "1", storage_path: "type-cover.jpg", is_cover: false, image_type: "cover" },
      { id: "2", storage_path: "is-cover.jpg", is_cover: true, image_type: "gallery" },
    ]);
    expect(getMainImage(project, fallback)).toBe("is-cover.jpg");
  });
});

describe("getAllImages", () => {
  const fallback = "fallback-image.jpg";

  it("returns fallback array when project is null", () => {
    expect(getAllImages(null, fallback)).toEqual([fallback]);
  });

  it("returns fallback array when project has no images", () => {
    const project = createMockProject([]);
    expect(getAllImages(project, fallback)).toEqual([fallback]);
  });

  it("returns all image paths", () => {
    const project = createMockProject([
      { id: "1", storage_path: "image1.jpg" },
      { id: "2", storage_path: "image2.jpg" },
      { id: "3", storage_path: "image3.jpg" },
    ]);
    
    expect(getAllImages(project, fallback)).toEqual([
      "image1.jpg",
      "image2.jpg",
      "image3.jpg",
    ]);
  });

  it("returns single image in array", () => {
    const project = createMockProject([
      { id: "1", storage_path: "single.jpg" },
    ]);
    
    expect(getAllImages(project, fallback)).toEqual(["single.jpg"]);
  });
});
