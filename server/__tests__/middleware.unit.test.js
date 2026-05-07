const jwt = require("jsonwebtoken");
const verifyToken = require("../middelwares/verifyToken");

describe("verifyToken middleware (unit)", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  it("should call next() for valid Bearer token", () => {
    const secret = process.env.JWT_SECRET || "ourSecret";
    const token = jwt.sign({ id: 1, role: "user" }, secret, { expiresIn: "1h" });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = mockResponse();

    verifyToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.userId).toBe(1);
    expect(req.userRole).toBe("user");
  });

  it("should return 403 when no token provided", () => {
    const req = { headers: {} };
    const res = mockResponse();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: "No token provided!" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token", () => {
    const req = {
      headers: { authorization: "Bearer invalidtoken" },
    };
    const res = mockResponse();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized!" });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
