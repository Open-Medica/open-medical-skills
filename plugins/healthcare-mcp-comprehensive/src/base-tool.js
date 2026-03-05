import fetch from 'node-fetch';
import { CacheService } from './cache-service.js';

/**
 * Base class for all healthcare tools with common functionality
 */
export class BaseTool {
  constructor(cacheService, defaultTtl = 3600) {
    this.cache = cacheService || new CacheService(defaultTtl);
    this.baseUrl = null;
  }

  getCacheKey(prefix, ...args) {
    return this.cache.getCacheKey(prefix, ...args);
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'healthcare-mcp/1.0 (Node.js)',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: 30000
    };
    const requestOptions = { ...defaultOptions, ...options };
    try {
      console.error(`Making ${requestOptions.method} request to ${url}`);
      const response = await fetch(url, requestOptions);
      console.error(`API response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`Request error: ${error.message}`);
      throw error;
    }
  }

  formatErrorResponse(errorMessage) {
    return { status: 'error', error_message: errorMessage };
  }

  formatSuccessResponse(data) {
    return { status: 'success', ...data };
  }

  sanitizeText(textArray) {
    if (!Array.isArray(textArray)) return [];
    const sanitized = [];
    for (const text of textArray) {
      if (!text) continue;
      if (text.length > 5000 && (text.toLowerCase().includes('<table') || text.toLowerCase().includes('<td'))) {
        sanitized.push('[Table content removed due to size]');
        continue;
      }
      let cleanText = text.replace(/<[^>]*>/g, ' ');
      cleanText = cleanText.replace(/\s+/g, ' ').trim();
      if (cleanText.length > 1000) {
        cleanText = cleanText.substring(0, 997) + '...';
      }
      sanitized.push(cleanText);
    }
    return sanitized;
  }

  buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    }
    return url.toString();
  }
}

export default BaseTool;
