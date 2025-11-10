import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ZoneEditor } from '@/components/ZoneEditor';

describe('ZoneEditor', () => {
  it('should render zone editor with polygon mode', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        mode="polygon"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Draw Area of Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to add points/i)).toBeInTheDocument();
  });

  it('should render zone editor with line mode', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        mode="line"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Draw Intrusion Line/i)).toBeInTheDocument();
    expect(screen.getByText(/Click start and end points/i)).toBeInTheDocument();
  });

  it('should show save and cancel buttons', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        mode="polygon"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Save Zone')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should initialize with provided zone points', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    const initialZone = [
      { x: 0.1, y: 0.1 },
      { x: 0.5, y: 0.1 },
      { x: 0.5, y: 0.5 },
    ];

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        initialZone={initialZone}
        mode="polygon"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Component should render without errors when initial zone is provided
    expect(screen.getByText(/Camera Preview/i)).toBeInTheDocument();
  });

  it('should show drawing tools in toolbar', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        mode="polygon"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Drawing Tools')).toBeInTheDocument();
    expect(screen.getByText('Draw Polygon')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should display upload button when no media is loaded', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ZoneEditor
        imageUrl="/placeholder.svg"
        mode="polygon"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Upload Image/Video')).toBeInTheDocument();
  });
});
