import { BaseTool } from './base-tool.js';

/**
 * Tool for looking up ICD-10 codes and medical terminology
 */
export class MedicalTerminologyTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.baseUrl = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search';
  }

  async lookupICDCode(code = '', description = '', maxResults = 10) {
    if (!code && !description) return this.formatErrorResponse('Either code or description is required');

    let validMaxResults = parseInt(maxResults) || 10;
    if (validMaxResults < 1) validMaxResults = 10;
    if (validMaxResults > 50) validMaxResults = 50;

    const cacheKey = this.getCacheKey('icd_code', code, description, validMaxResults);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const params = { sf: 'code,name', terms: code || description, maxList: validMaxResults };
      const url = this.buildUrl(this.baseUrl, params);
      const data = await this.makeRequest(url);

      let codes = [];
      if (data && Array.isArray(data[3])) {
        codes = data[3].map(item => ({ code: item[0] || '', description: item[1] || '', category: item[2] || '' }));
      }

      const result = this.formatSuccessResponse({
        search_type: code ? 'code' : 'description',
        search_term: code || description,
        total_results: codes.length,
        codes
      });
      this.cache.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error looking up ICD-10 code: ${error.message}`);
    }
  }
}

export default MedicalTerminologyTool;
