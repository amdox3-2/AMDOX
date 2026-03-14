const clients = new Map();

/**
 * Handle SSE connection
 */
const streamNotifications = (req, res) => {
    const userId = req.params.userId;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Store the client connection
    clients.set(userId, res);

    console.log(`Client connected: ${userId}. Total clients: ${clients.size}`);

    // Remove client when connection closes
    req.on('close', () => {
        clients.delete(userId);
        console.log(`Client disconnected: ${userId}. Total clients: ${clients.size}`);
    });
};

/**
 * Send notification to a specific user
 */
const sendNotification = (userId, data) => {
    const client = clients.get(String(userId));
    if (client) {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
        return true;
    }
    return false;
};

module.exports = { streamNotifications, sendNotification };
