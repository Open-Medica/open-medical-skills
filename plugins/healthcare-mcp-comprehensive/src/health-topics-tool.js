import { BaseTool } from './base-tool.js';

/**
 * Tool for accessing health information from Health.gov
 */
export class HealthTopicsTool extends BaseTool {
  constructor(cacheService) {
    super(cacheService);
    this.baseUrl = 'https://odphp.health.gov/myhealthfinder/api/v4';
  }

  async getHealthTopics(topic, language = 'en') {
    if (!topic) return this.formatErrorResponse('Topic is required');
    if (!['en', 'es'].includes(language.toLowerCase())) language = 'en';

    const cacheKey = this.getCacheKey('health_topics', topic, language);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const params = { keyword: topic, lang: language };
      const url = this.buildUrl(`${this.baseUrl}/topicsearch.json`, params);
      const data = await this.makeRequest(url);

      let topics = [];
      let totalResults = 0;

      if (data && data.Result && data.Result.Resources) {
        const rawTopics = data.Result.Resources.Resource || [];
        totalResults = rawTopics.length;
        for (const rawTopic of rawTopics) {
          const processedTopic = {
            title: rawTopic.Title || '',
            url: rawTopic.AccessibleVersion || rawTopic.LastUpdate || '',
            last_updated: rawTopic.LastUpdate || '',
            section: rawTopic.Sections?.Section?.[0]?.Title || '',
            description: rawTopic.Sections?.Section?.[0]?.Description || '',
            content: []
          };
          if (rawTopic.Sections && rawTopic.Sections.Section) {
            for (const section of rawTopic.Sections.Section) {
              if (section.Content) {
                let content = section.Content;
                if (typeof content === 'string') {
                  content = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                  if (content.length > 500) content = content.substring(0, 497) + '...';
                  if (content) processedTopic.content.push(content);
                }
              }
            }
          }
          topics.push(processedTopic);
        }
      }

      const result = this.formatSuccessResponse({
        search_term: topic, language, total_results: totalResults, health_topics: topics
      });
      this.cache.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      return this.formatErrorResponse(`Error searching health topics: ${error.message}`);
    }
  }
}

export default HealthTopicsTool;
