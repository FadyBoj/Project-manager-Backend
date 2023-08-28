class CustomAPIError extends Error{
    constructor(message,statusCode)
    {
        super(message);
        this.statusCode = statusCode
    }
}

const createCustomError = (msg,err) =>{
    return new CustomAPIError(msg,err);
}

module.exports = {
    CustomAPIError,
    createCustomError
}