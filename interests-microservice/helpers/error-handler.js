module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string')
        return res.status(400).json({ message: err});

    if (err.namme === 'ValidationError')
        return res.status(400).json({ message: err.message});

    if (err.name === 'UnauthorizedError')
        return res.status(401).json({ message: 'Unauthorized' });
        
    return res.status(500).json({ message: err.message });
}