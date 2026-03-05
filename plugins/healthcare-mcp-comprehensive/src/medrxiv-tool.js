import { BaseTool } from './base-tool.js';

/**
 * Tool for searching pre-print articles on medRxiv
 */
export class MedRxivTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.baseUrl = 'https://api.medrxiv.org/';
  }

  async search(query, maxResults = 10) {
    if (!query) return this.formatErrorResponse('Search query is required');

    let validMaxResults = parseInt(maxResults) || 10;
    if (validMaxResults < 1) validMaxResults = 10;
    if (validMaxResults > 100) validMaxResults = 100;

    const cacheKey = this.getCacheKey('medrxiv_search', query, validMaxResults);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const server = 'medrxiv';
      const endpoint = `details/${server}/${query}/0/180/json`;
      const url = `${this.baseUrl}${endpoint}`;
      const data = await this.makeRequest(url);

      const articles = data.collection.slice(0, validMaxResults).map(article => ({
        title: article.rel_title,
        authors: article.rel_authors,
        doi: article.rel_doi,
        abstract_url: `https://www.medrxiv.org/content/${article.rel_doi}`,
        publication_date: article.rel_date,
      }));

      const result = this.formatSuccessResponse({
        query, total_results: data.collection.length, articles
      });
      this.cache.set(cacheKey, result, 43200);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error searching medRxiv: ${error.message}`);
    }
  }
}

export default MedRxivTool;
