const resModule = {
    successTrue: (code, message, data) => {
        return {
            isSuccess: true,
            code : code,
            message: message,
            result: data
        }
    },
    successFalse: (code, message) => {
        return {
            isSuccess: false,
            code : code,
            message: message
        }
    },
};

module.exports = resModule;