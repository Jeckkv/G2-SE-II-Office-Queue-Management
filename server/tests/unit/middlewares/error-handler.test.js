import { describe, it, expect, vi } from "vitest";
import errorHandler from "#src/middlewares/errorHandler.js";

describe("errorHandler middleware", () => {
  it("formats error with provided name, message, and statusCode", () => {
    const err = {
      name: "CustomError",
      message: "Something went wrong",
      statusCode: 400,
    };
    const req = {};
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    errorHandler(err, req, res, () => {});

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "CustomError",
      message: "Something went wrong",
    });
  });

  it("falls back to default UnknownError, empty message, and 500 status", () => {
    const err = {};
    const req = {};
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    errorHandler(err, req, res, () => {});

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "UnknownError",
      message: "",
    });
  });

  it("handles null / undefined error object gracefully", () => {
    const req = {};
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };

    errorHandler(null, req, res, () => {});

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "UnknownError",
      message: "",
    });
  });
});
