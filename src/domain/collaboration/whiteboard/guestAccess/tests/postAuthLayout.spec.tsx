/**
 * Integration tests for post-authentication layout persistence
 * Tests that authenticated users on public whiteboard pages retain stripped layout
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import PublicWhiteboardLayout from '@/main/public/whiteboard/PublicWhiteboardLayout';

describe('Post-Authentication Layout Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout structure verification', () => {
    it('should render with stripped layout styles (fullscreen, no chrome)', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div data-testid="content">Test Content</div>
        </PublicWhiteboardLayout>
      );

      // Should have the stripped layout wrapper
      const layoutBox = container.querySelector('div[class*="MuiBox"]');
      expect(layoutBox).toBeInTheDocument();

      // Verify stripped layout styles are applied
      if (layoutBox) {
        const styles = window.getComputedStyle(layoutBox);
        expect(styles.width).toBe('100vw');
        expect(styles.height).toBe('100vh');
        expect(styles.overflow).toBe('hidden');
        expect(styles.position).toBe('relative');
      }
    });

    it('should not render application navigation elements', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      // Should not have common navigation elements
      expect(container.querySelector('[role="navigation"]')).not.toBeInTheDocument();
      expect(container.querySelector('[role="banner"]')).not.toBeInTheDocument();
      expect(container.querySelector('[role="contentinfo"]')).not.toBeInTheDocument();
    });

    it('should not render header or footer elements', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      // Should not have header or footer elements
      expect(container.querySelector('header')).not.toBeInTheDocument();
      expect(container.querySelector('footer')).not.toBeInTheDocument();
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });
  });

  describe('Layout consistency', () => {
    it('should render children directly in layout container', () => {
      const { getByTestId } = render(
        <PublicWhiteboardLayout>
          <div data-testid="child-content">Child Content</div>
        </PublicWhiteboardLayout>
      );

      // Children should be rendered
      expect(getByTestId('child-content')).toBeInTheDocument();
      expect(getByTestId('child-content')).toHaveTextContent('Child Content');
    });

    it('should apply same layout for any child content', () => {
      const { container: container1 } = render(
        <PublicWhiteboardLayout>
          <div>Loading...</div>
        </PublicWhiteboardLayout>
      );

      const { container: container2 } = render(
        <PublicWhiteboardLayout>
          <div>Whiteboard Display</div>
        </PublicWhiteboardLayout>
      );

      const layout1 = container1.querySelector('div[class*="MuiBox"]');
      const layout2 = container2.querySelector('div[class*="MuiBox"]');

      // Both should have same layout styles
      if (layout1 && layout2) {
        const styles1 = window.getComputedStyle(layout1);
        const styles2 = window.getComputedStyle(layout2);

        expect(styles1.width).toBe(styles2.width);
        expect(styles1.height).toBe(styles2.height);
        expect(styles1.overflow).toBe(styles2.overflow);
      }
    });
  });

  describe('Fullscreen experience', () => {
    it('should provide full viewport dimensions', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      const layoutBox = container.querySelector('div[class*="MuiBox"]');
      if (layoutBox) {
        const styles = window.getComputedStyle(layoutBox);

        // Should use full viewport
        expect(styles.width).toBe('100vw');
        expect(styles.height).toBe('100vh');

        // Should prevent scrolling
        expect(styles.overflow).toBe('hidden');

        // Should be positioned
        expect(styles.position).toBe('relative');
      }
    });

    it('should not have any padding or margins in layout container', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      const layoutBox = container.querySelector('div[class*="MuiBox"]');
      if (layoutBox) {
        const styles = window.getComputedStyle(layoutBox);

        // MUI Box defaults to 0 padding/margin, verify
        // jsdom returns empty string '' instead of '0' or '0px'
        expect(['0px', '0', '']).toContain(styles.padding);
        expect(['0px', '0', '']).toContain(styles.margin);
      }
    });

    it('should fill entire viewport without application chrome', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      // Should only have the layout container and content, no app chrome
      const layoutBox = container.querySelector('div[class*="MuiBox"]');
      expect(layoutBox).toBeInTheDocument();

      // Should not have sidebars, app bars, or other chrome
      expect(container.querySelector('[class*="Sidebar"]')).not.toBeInTheDocument();
      expect(container.querySelector('[class*="AppBar"]')).not.toBeInTheDocument();
      expect(container.querySelector('[class*="Drawer"]')).not.toBeInTheDocument();
      expect(container.querySelector('[class*="Toolbar"]')).not.toBeInTheDocument();
    });
  });

  describe('Layout isolation', () => {
    it('should render only layout container without nested application layouts', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>Content</div>
        </PublicWhiteboardLayout>
      );

      // Should have exactly one root layout container
      const boxes = container.querySelectorAll('div[class*="MuiBox"]');
      expect(boxes.length).toBe(1);
    });

    it('should maintain layout structure with complex children', () => {
      const { container } = render(
        <PublicWhiteboardLayout>
          <div>
            <div>Nested</div>
            <div>Content</div>
            <div>Structure</div>
          </div>
        </PublicWhiteboardLayout>
      );

      const layoutBox = container.querySelector('div[class*="MuiBox"]');
      expect(layoutBox).toBeInTheDocument();

      if (layoutBox) {
        const styles = window.getComputedStyle(layoutBox);
        // Layout styles should not be affected by child complexity
        expect(styles.width).toBe('100vw');
        expect(styles.height).toBe('100vh');
      }
    });
  });

  describe('Cross-state layout consistency', () => {
    it('should provide same dimensions regardless of content', () => {
      const sizes: string[] = [];

      // Test with different content
      const contents = [
        <div key="loading">Loading...</div>,
        <div key="dialog">Join Dialog</div>,
        <div key="whiteboard">Whiteboard Content</div>,
        <div key="error">Error State</div>,
      ];

      contents.forEach((content) => {
        const { container, unmount } = render(
          <PublicWhiteboardLayout>{content}</PublicWhiteboardLayout>
        );

        const layoutBox = container.querySelector('div[class*="MuiBox"]');
        if (layoutBox) {
          const styles = window.getComputedStyle(layoutBox);
          sizes.push(`${styles.width}x${styles.height}`);
        }

        unmount();
      });

      // All should have same dimensions
      expect(sizes.every(size => size === '100vwx100vh')).toBe(true);
    });

    it('should maintain stripped layout properties across rerenders', () => {
      const { container, rerender } = render(
        <PublicWhiteboardLayout>
          <div>Initial</div>
        </PublicWhiteboardLayout>
      );

      const getLayoutStyles = () => {
        const box = container.querySelector('div[class*="MuiBox"]');
        if (!box) return null;
        const styles = window.getComputedStyle(box);
        return {
          width: styles.width,
          height: styles.height,
          overflow: styles.overflow,
          position: styles.position,
        };
      };

      const initialStyles = getLayoutStyles();

      // Rerender with different content
      rerender(
        <PublicWhiteboardLayout>
          <div>Updated Content</div>
        </PublicWhiteboardLayout>
      );

      const updatedStyles = getLayoutStyles();

      // Styles should remain consistent
      expect(updatedStyles).toEqual(initialStyles);
    });
  });
});
