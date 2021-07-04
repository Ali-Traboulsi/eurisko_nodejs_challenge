module.exports = errorHandler;

const errorHanndler = (err, req, res, next) => {
    // err: any string error
    if (typeof (err) === 'string') {
        return res.status(400).json({message: err});
    }

    // err: unauthorized user
    if (err === 'UnauthorizedError') {
        return res.status(401).json({message: 'Invalid Token'});
    }

    // default: server error
    return res.status(500).json({message: err.message});
}