const crypto = require('crypto');

class MemoryRateLimiter {
    constructor() {
        this.store = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
    
    // Cleanup expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.store.entries()) {
            if (now > data.resetTime) {
                this.store.delete(key);
            }
        }
    }
    
    // Check and increment rate limit
    checkLimit(identifier, maxRequests = 10, windowMs = 3600000) { // Default: 10 requests per hour
        const now = Date.now();
        const key = this.hashIdentifier(identifier);
        
        let record = this.store.get(key);
        
        // Initialize or reset if window expired
        if (!record || now > record.resetTime) {
            record = {
                count: 0,
                resetTime: now + windowMs,
                firstRequest: now
            };
        }
        
        // Check if limit exceeded
        if (record.count >= maxRequests) {
            const timeLeft = Math.ceil((record.resetTime - now) / 1000);
            return {
                allowed: false,
                limit: maxRequests,
                remaining: 0,
                resetTime: record.resetTime,
                retryAfter: timeLeft
            };
        }
        
        // Increment counter
        record.count++;
        this.store.set(key, record);
        
        return {
            allowed: true,
            limit: maxRequests,
            remaining: maxRequests - record.count,
            resetTime: record.resetTime,
            retryAfter: 0
        };
    }
    
    // Hash identifier for privacy
    hashIdentifier(identifier) {
        return crypto
            .createHmac('sha256', process.env.RATE_LIMIT_SECRET)
            .update(identifier)
            .digest('hex');
    }
    
    // Get current status without incrementing
    getStatus(identifier, maxRequests = 10, windowMs = 3600000) {
        const now = Date.now();
        const key = this.hashIdentifier(identifier);
        const record = this.store.get(key);
        
        if (!record || now > record.resetTime) {
            return {
                allowed: true,
                limit: maxRequests,
                remaining: maxRequests,
                resetTime: now + windowMs,
                retryAfter: 0
            };
        }
        
        const remaining = Math.max(0, maxRequests - record.count);
        const timeLeft = Math.ceil((record.resetTime - now) / 1000);
        
        return {
            allowed: remaining > 0,
            limit: maxRequests,
            remaining,
            resetTime: record.resetTime,
            retryAfter: remaining > 0 ? 0 : timeLeft
        };
    }
    
    // Reset limit for a specific identifier (for testing/admin)
    reset(identifier) {
        const key = this.hashIdentifier(identifier);
        this.store.delete(key);
    }
    
    // Get stats (for monitoring)
    getStats() {
        return {
            totalUsers: this.store.size,
            memoryUsage: process.memoryUsage().heapUsed,
            uptime: process.uptime()
        };
    }
}

// Singleton instance
const rateLimiter = new MemoryRateLimiter();

// Graceful cleanup on process exit
process.on('SIGTERM', () => {
    if (rateLimiter.cleanupInterval) {
        clearInterval(rateLimiter.cleanupInterval);
    }
});

module.exports = { rateLimiter };