import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OptimizedImage from '../ui/OptimizedImage';

describe('OptimizedImage', () => {
  it('renders image with src', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
  });

  it('uses picture element when webpSrc is provided', () => {
    const { container } = render(
      <OptimizedImage
        src="/test.jpg"
        webpSrc="/test.webp"
        alt="Test image"
      />
    );

    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();
    
    const webpSource = container.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
    expect(webpSource).toHaveAttribute('srcSet', '/test.webp');
  });

  it('uses picture element when avifSrc is provided', () => {
    const { container } = render(
      <OptimizedImage
        src="/test.jpg"
        avifSrc="/test.avif"
        alt="Test image"
      />
    );

    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();
    
    const avifSource = container.querySelector('source[type="image/avif"]');
    expect(avifSource).toBeInTheDocument();
  });

  it('applies className correctly', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
  });

  it('sets loading attribute', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});
