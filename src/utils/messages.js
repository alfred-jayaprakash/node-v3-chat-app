const generateMessage = (user, text) => {
    return {
        user,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (user, location) => {
    return {
        user,
        url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}