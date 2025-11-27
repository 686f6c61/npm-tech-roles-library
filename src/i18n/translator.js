/**
 * Translator - Bilingual translation system (EN/ES)
 *
 * Provides lazy-loading translation for role names and competencies.
 * Caches loaded translations for performance.
 *
 * @module i18n/translator
 * @author 686f6c61
 */

const fs = require('fs');
const path = require('path');

/**
 * Translator class for bilingual support.
 *
 * @class Translator
 */
class Translator {
  /**
   * Creates a new translator instance.
   *
   * @param {string} [language='es'] - Target language ('en' or 'es')
   */
  constructor(language = 'es') {
    this.language = language;
    this.roleNamesMap = this.loadRoleNamesMap();
    this.translationCache = new Map();
  }

  /**
   * Get current language.
   *
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.language;
  }

  /**
   * Load role names mapping (originalRole -> translatedName).
   *
   * @returns {Map} Role names map
   * @private
   */
  loadRoleNamesMap() {
    try {
      const roleNamesPath = path.join(__dirname, 'role-names.json');
      const roleNamesData = JSON.parse(fs.readFileSync(roleNamesPath, 'utf-8'));
      const map = new Map();

      Object.entries(roleNamesData).forEach(([originalRole, translations]) => {
        map.set(originalRole, {
          es: translations.es,
          en: translations.en
        });
      });

      return map;
    } catch (error) {
      return new Map();
    }
  }

  /**
   * Translate role name.
   *
   * @param {string} originalRole - Original role name
   * @returns {string} Translated role name
   */
  translateRoleName(originalRole) {
    const translations = this.roleNamesMap.get(originalRole);
    if (!translations) {
      return originalRole;
    }
    return translations[this.language] || originalRole;
  }

  /**
   * Translate a complete entry (role name + competencies).
   *
   * @param {Object} entry - Entry to translate
   * @returns {Object} Translated entry
   */
  translate(entry) {
    if (!entry) {
      return entry;
    }

    // Clone entry
    const translated = { ...entry };

    // Translate role name
    if (entry.role) {
      translated.role = this.translateRoleName(entry.role);
    }

    // If language is Spanish, return as-is (data is already in Spanish)
    if (this.language === 'es') {
      return translated;
    }

    // For English, translate competencies and indicators
    if (this.language === 'en' && entry.role && entry.code) {
      const translationData = this.loadTranslationForRole(entry.role);

      if (translationData && translationData.levels && translationData.levels[entry.code]) {
        const levelTranslation = translationData.levels[entry.code];

        // Translate competencies
        if (levelTranslation.coreCompetencies && Array.isArray(entry.coreCompetencies)) {
          translated.coreCompetencies = levelTranslation.coreCompetencies;
        }

        if (levelTranslation.complementaryCompetencies && Array.isArray(entry.complementaryCompetencies)) {
          translated.complementaryCompetencies = levelTranslation.complementaryCompetencies;
        }

        if (levelTranslation.indicators && Array.isArray(entry.indicators)) {
          translated.indicators = levelTranslation.indicators;
        }
      }
    }

    return translated;
  }

  /**
   * Load translation file for a specific role.
   *
   * @param {string} roleName - Role name
   * @returns {Object|null} Translation data or null
   * @private
   */
  loadTranslationForRole(roleName) {
    if (!roleName) {
      return null;
    }

    // Check cache first
    if (this.translationCache.has(roleName)) {
      return this.translationCache.get(roleName);
    }

    try {
      // Sanitize role name for filename (convert to lowercase and replace spaces with hyphens)
      const filename = `${roleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')}.json`;
      const translationPath = path.join(__dirname, 'translations', this.language, filename);

      if (fs.existsSync(translationPath)) {
        const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
        this.translationCache.set(roleName, translationData);
        return translationData;
      }
    } catch (error) {
      // Silent fail - return original if translation not found
      console.warn(`Translation file not found for role: ${roleName}`);
    }

    return null;
  }

  /**
   * Clear translation cache.
   */
  clearCache() {
    this.translationCache.clear();
  }
}

module.exports = Translator;
