import { BaseTool } from './base-tool.js';

/**
 * Tool for accessing FDA drug information
 */
export class FDATool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.apiKey = process.env.FDA_API_KEY || '';
    this.baseUrl = 'https://api.fda.gov/drug';
  }

  extractKeyInfo(data, searchType) {
    const extracted = {};
    if (!data || typeof data !== 'object' || !data.results) return extracted;
    const result = data.results && data.results.length > 0 ? data.results[0] : {};

    if (searchType === 'label') {
      if (result.openfda) {
        const openfda = result.openfda;
        extracted.brand_names = (openfda.brand_name || []).slice(0, 3);
        extracted.generic_names = (openfda.generic_name || []).slice(0, 3);
        extracted.manufacturer = (openfda.manufacturer_name || []).slice(0, 1);
      }
      extracted.indications = this.sanitizeText(result.indications_and_usage || []);
      extracted.dosage = this.sanitizeText(result.dosage_and_administration || []);
      extracted.warnings = this.sanitizeText(result.warnings_and_cautions || []);
      extracted.contraindications = this.sanitizeText(result.contraindications || []);
      extracted.adverse_reactions = this.sanitizeText(result.adverse_reactions || []);
      extracted.drug_interactions = this.sanitizeText(result.drug_interactions || []);
      extracted.pregnancy = this.sanitizeText(result.pregnancy || []);
    } else if (searchType === 'adverse_events') {
      if (result.openfda) {
        const openfda = result.openfda;
        extracted.brand_names = (openfda.brand_name || []).slice(0, 3);
        extracted.generic_names = (openfda.generic_name || []).slice(0, 3);
      }
      extracted.adverse_reactions = this.sanitizeText(result.adverse_reactions || []);
      extracted.warnings = this.sanitizeText(result.warnings_and_cautions || []);
      extracted.boxed_warning = this.sanitizeText(result.boxed_warning || []);
    } else {
      extracted.generic_name = result.generic_name || '';
      extracted.brand_name = result.brand_name || '';
      extracted.manufacturer = result.labeler_name || '';
      extracted.product_type = result.product_type || '';
      extracted.route = result.route || [];
      extracted.marketing_status = result.marketing_status || '';
    }
    return extracted;
  }

  async lookupDrug(drugName, searchType = 'general') {
    if (!drugName) return this.formatErrorResponse('Drug name is required');
    searchType = searchType.toLowerCase();
    if (!['label', 'adverse_events', 'general'].includes(searchType)) searchType = 'general';

    const cacheKey = this.getCacheKey('fda_drug', searchType, drugName);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      let endpoint, query;
      if (searchType === 'adverse_events' || searchType === 'label') {
        endpoint = `${this.baseUrl}/label.json`;
        query = `openfda.generic_name:${drugName} OR openfda.brand_name:${drugName}`;
      } else {
        endpoint = `${this.baseUrl}/ndc.json`;
        query = `generic_name:${drugName} OR brand_name:${drugName}`;
      }

      const params = { search: query, limit: 1 };
      if (this.apiKey) params.api_key = this.apiKey;
      const url = this.buildUrl(endpoint, params);
      const data = await this.makeRequest(url);
      const extractedData = this.extractKeyInfo(data, searchType);

      const drugs = data.results ? data.results.map(drug => ({
        product_number: drug.product_ndc || drug.ndc_product_code || '',
        generic_name: drug.generic_name || extractedData.generic_name || '',
        brand_name: drug.brand_name || extractedData.brand_name || '',
        labeler_name: drug.labeler_name || extractedData.manufacturer || '',
        product_type: drug.product_type || extractedData.product_type || '',
        ...extractedData
      })) : [extractedData];

      const result = this.formatSuccessResponse({
        drug_name: drugName,
        search_type: searchType,
        drugs: drugs,
        total_results: data.meta?.results?.total || 0
      });

      this.cache.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error fetching drug information: ${error.message}`);
    }
  }
}

export default FDATool;
