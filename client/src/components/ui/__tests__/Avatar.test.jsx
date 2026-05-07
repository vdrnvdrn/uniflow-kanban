import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "../Avatar";

// Mock API_URL to avoid import.meta.env issues in tests
vi.mock("../../../api", () => ({
  API_URL: "http://localhost:3000",
}));

describe("Avatar component", () => {
  it("renders image with correct src and alt", () => {
    render(<Avatar photo="images/users/test.jpg" alt="Test User" size={40} />);

    const img = screen.getByAltText("Test User");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("images/users/test.jpg");
  });

  it("renders status dot when status is provided", () => {
    render(<Avatar photo="images/users/test.jpg" status="available" size={40} />);

    const statusDot = screen.getByTitle("available");
    expect(statusDot).toBeInTheDocument();
  });

  it("does not render status dot when showStatus is false", () => {
    render(<Avatar photo="images/users/test.jpg" status="available" size={40} showStatus={false} />);

    const statusDot = screen.queryByTitle("available");
    expect(statusDot).not.toBeInTheDocument();
  });
});
