import { BaseTool } from './base-tool.js';

/**
 * Tool for searching medical literature in PubMed database
 */
export class PubMedTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.apiKey = process.env.PUBMED_API_KEY || '';
    this.baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  }

  processArticleData(idList, summaryData) {
    const articles = [];
    const resultData = summaryData.result || {};
    for (const articleId of idList) {
      if (articleId in resultData) {
        const articleData = resultData[articleId];
        const authors = [];
        if (articleData.authors) {
          for (const author of articleData.authors) {
            if (author.name) authors.push(author.name);
          }
        }
        const article = {
          id: articleId,
          title: articleData.title || '',
          authors: authors,
          journal: articleData.fulljournalname || '',
          publication_date: articleData.pubdate || '',
          abstract_url: `https://pubmed.ncbi.nlm.nih.gov/${articleId}/`
        };
        if (articleData.articleids) {
          for (const idObj of articleData.articleids) {
            if (idObj.idtype === 'doi') article.doi = idObj.value || '';
          }
        }
        articles.push(article);
      }
    }
    return articles;
  }

  async searchLiterature(query, maxResults = 5, dateRange = '', openAccess = false) {
    if (!query) return this.formatErrorResponse('Search query is required');

    let validMaxResults = parseInt(maxResults) || 5;
    if (validMaxResults < 1) validMaxResults = 5;
    if (validMaxResults > 100) validMaxResults = 100;

    const cacheKey = this.getCacheKey('pubmed_search', query, validMaxResults, dateRange, openAccess);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      let processedQuery = query;
      if (openAccess) processedQuery += ' AND open access[filter]';
      if (dateRange) {
        const yearsBack = parseInt(dateRange);
        if (!isNaN(yearsBack)) {
          const currentYear = new Date().getFullYear();
          const minYear = currentYear - yearsBack;
          processedQuery += ` AND ${minYear}:${currentYear}[pdat]`;
        }
      }

      const searchParams = { db: 'pubmed', term: processedQuery, retmax: validMaxResults, format: 'json' };
      if (this.apiKey) searchParams.api_key = this.apiKey;

      const searchUrl = this.buildUrl(`${this.baseUrl}esearch.fcgi`, searchParams);
      const searchData = await this.makeRequest(searchUrl);
      const idList = searchData.esearchresult?.idlist || [];
      const totalResults = parseInt(searchData.esearchresult?.count || 0);

      let articles = [];
      if (idList.length > 0) {
        const summaryParams = { db: 'pubmed', id: idList.join(','), retmode: 'json' };
        if (this.apiKey) summaryParams.api_key = this.apiKey;
        const summaryUrl = this.buildUrl(`${this.baseUrl}esummary.fcgi`, summaryParams);
        const summaryData = await this.makeRequest(summaryUrl);
        articles = this.processArticleData(idList, summaryData);
      }

      const result = this.formatSuccessResponse({
        query, total_results: totalResults, date_range: dateRange, open_access: openAccess, articles
      });
      this.cache.set(cacheKey, result, 43200);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error searching PubMed: ${error.message}`);
    }
  }
}

export default PubMedTool;
