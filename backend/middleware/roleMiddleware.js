const requireRole = (role) => {
  return (req, res, next) => {
    // Treat missing role, 'user', or anything else as 'student'
    let userRole = req.user && req.user.role ? req.user.role : 'student';
    if (userRole === 'user' || userRole === 'admin') userRole = 'student';

    if (userRole !== role) {
      return res.status(403).json({
        success: false,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} access required`
      });
    }
    next();
  };
};

module.exports = { requireRole };
