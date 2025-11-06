import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import Upload from '@/pages/Upload';

describe('Upload Page', () => {
  it('should render upload page', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    expect(screen.getByText(/Upload & Simulate/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
  });

  it('should show supported file types', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    expect(screen.getByText(/Support for JPG, PNG, MP4, WEBM/i)).toBeInTheDocument();
  });

  it('should display upload section', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    const uploadSection = screen.getByText(/Upload files/i);
    expect(uploadSection).toBeInTheDocument();
  });
});
