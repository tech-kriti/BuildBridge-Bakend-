import jwt from "jsonwebtoken";
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    // Token should be sent as: "Bearer <token>"
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // adds decoded user info to req
      console.log(req.user)
      next(); // proceed to next middleware or route handler
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };
  export default authenticateToken;