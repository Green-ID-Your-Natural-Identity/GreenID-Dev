export const requireAdminAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Admin login required' });
  }
};
