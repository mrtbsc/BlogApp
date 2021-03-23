module.exports =  ( author, req ) => {
    return req.user && author.equals(req.user._id);
} 
