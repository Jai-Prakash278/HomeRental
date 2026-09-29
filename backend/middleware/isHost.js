module.exports = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'host') {
        // Not a host, redirect to store or show error
        return res.status(403).json({ error: 'Access denied. You must be a host to perform this action.' });
    }
    next();
};
