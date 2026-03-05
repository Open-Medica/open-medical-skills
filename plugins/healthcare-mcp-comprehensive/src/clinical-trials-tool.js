import { BaseTool } from './base-tool.js';

/**
 * Tool for searching clinical trials from ClinicalTrials.gov
 */
export class ClinicalTrialsTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
  }

  async searchTrials(condition, status = 'recruiting', maxResults = 10) {
    if (!condition) return this.formatErrorResponse('Condition is required');

    let validMaxResults = parseInt(maxResults) || 10;
    if (validMaxResults < 1) validMaxResults = 10;
    if (validMaxResults > 100) validMaxResults = 100;

    const validStatuses = ['recruiting', 'completed', 'active', 'not_recruiting', 'all'];
    if (!validStatuses.includes(status.toLowerCase())) status = 'recruiting';

    const cacheKey = this.getCacheKey('clinical_trials', condition, status, validMaxResults);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const params = { 'query.cond': condition, 'pageSize': validMaxResults, 'format': 'json' };
      if (status !== 'all') {
        const statusMap = {
          'recruiting': 'RECRUITING', 'completed': 'COMPLETED',
          'active': 'ACTIVE_NOT_RECRUITING', 'not_recruiting': 'ACTIVE_NOT_RECRUITING'
        };
        params['filter.overallStatus'] = statusMap[status] || 'RECRUITING';
      }

      const url = this.buildUrl(this.baseUrl, params);
      const data = await this.makeRequest(url);
      let trials = [];
      let totalResults = 0;

      if (data && data.studies) {
        totalResults = data.totalCount || data.studies.length;
        for (const study of data.studies) {
          const protocolSection = study.protocolSection || {};
          const identification = protocolSection.identificationModule || {};
          const studyStatus = protocolSection.statusModule || {};
          const design = protocolSection.designModule || {};
          const eligibility = protocolSection.eligibilityModule || {};
          const contacts = protocolSection.contactsLocationsModule || {};

          const processedTrial = {
            nct_id: identification.nctId || '',
            title: identification.briefTitle || '',
            status: studyStatus.overallStatus || '',
            phase: design.phases || [],
            study_type: design.studyType || '',
            conditions: protocolSection.conditionsModule?.conditions || [],
            locations: [],
            sponsor: protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || '',
            url: identification.nctId ? `https://clinicaltrials.gov/study/${identification.nctId}` : '',
            eligibility: {
              gender: eligibility.sex || '',
              min_age: eligibility.minimumAge || '',
              max_age: eligibility.maximumAge || '',
              healthy_volunteers: eligibility.healthyVolunteers ? 'Yes' : 'No'
            }
          };

          if (contacts.locations) {
            for (const location of contacts.locations.slice(0, 3)) {
              const facility = location.facility || {};
              processedTrial.locations.push({
                facility: facility.name || '', city: facility.city || '',
                state: facility.state || '', country: facility.country || ''
              });
            }
          }
          trials.push(processedTrial);
        }
      }

      const result = this.formatSuccessResponse({
        condition, search_status: status, total_results: totalResults, trials
      });
      this.cache.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error searching clinical trials: ${error.message}`);
    }
  }
}

export default ClinicalTrialsTool;
