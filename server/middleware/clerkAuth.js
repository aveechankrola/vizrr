const { verifyToken } = require('@clerk/backend');

const clerkMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token' });
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      emailVerified: decoded.email_verified,
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      imageUrl: decoded.image_url,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional middleware for routes that may or may not have auth
const optionalClerkMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        firstName: decoded.first_name,
        lastName: decoded.last_name,
        imageUrl: decoded.image_url,
      };
    } catch (error) {
      console.error('Optional auth token verification failed:', error.message);
    }
  }

  next();
};

module.exports = {
  clerkMiddleware,
  optionalClerkMiddleware,
};
