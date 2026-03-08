import { BaseTool } from './base-tool.js';

/**
 * Tool for searching the NCBI Bookshelf
 */
export class NcbiBookshelfTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    this.apiKey = process.env.NCBI_API_KEY || '';
  }

  async search(query, maxResults = 10) {
    if (!query) return this.formatErrorResponse('Search query is required');

    let validMaxResults = parseInt(maxResults) || 10;
    if (validMaxResults < 1) validMaxResults = 10;
    if (validMaxResults > 100) validMaxResults = 100;

    const cacheKey = this.getCacheKey('ncbi_bookshelf_search', query, validMaxResults);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const searchParams = {
        db: 'books', term: query, retmax: validMaxResults, format: 'json',
        ...(this.apiKey && { api_key: this.apiKey }),
      };
      const searchUrl = this.buildUrl(`${this.baseUrl}esearch.fcgi`, searchParams);
      const searchData = await this.makeRequest(searchUrl);

      const idList = searchData.esearchresult?.idlist || [];
      const totalResults = parseInt(searchData.esearchresult?.count || 0);

      let books = [];
      if (idList.length > 0) {
        const summaryParams = {
          db: 'books', id: idList.join(','), retmode: 'json',
          ...(this.apiKey && { api_key: this.apiKey }),
        };
        const summaryUrl = this.buildUrl(`${this.baseUrl}esummary.fcgi`, summaryParams);
        const summaryData = await this.makeRequest(summaryUrl);

        books = idList.map(id => {
          const bookData = summaryData.result[id];
          return {
            id, title: bookData.title,
            authors: bookData.authors ? bookData.authors.map(a => a.name) : [],
            publication_date: bookData.pubdate,
            url: `https://www.ncbi.nlm.nih.gov/books/${id}/`,
          };
        });
      }

      const result = this.formatSuccessResponse({ query, total_results: totalResults, books });
      this.cache.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error searching NCBI Bookshelf: ${error.message}`);
    }
  }
}

export default NcbiBookshelfTool;
