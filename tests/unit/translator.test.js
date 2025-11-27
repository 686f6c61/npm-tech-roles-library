const Translator = require('../../src/i18n/translator');

describe('Translator', () => {
  describe('Initialization', () => {
    test('should initialize with default language (es)', () => {
      const translator = new Translator();
      expect(translator.getLanguage()).toBe('es');
    });

    test('should initialize with specified language', () => {
      const translator = new Translator('en');
      expect(translator.getLanguage()).toBe('en');
    });
  });

  describe('Translation for Spanish (default)', () => {
    test('should translate role name to Spanish', () => {
      const translator = new Translator('es');
      const entry = {
        role: 'Backend Developer',
        level: 'L1',
        code: 'BE-L1',
        coreCompetencies: ['Conocimiento básico'],
        complementaryCompetencies: ['Comp complementaria'],
        indicators: ['Indicador']
      };

      const translated = translator.translate(entry);
      expect(translated.role).toBe('Desarrollador Backend'); // Translated
      expect(translated.coreCompetencies).toEqual(entry.coreCompetencies); // Unchanged
      expect(translated.complementaryCompetencies).toEqual(entry.complementaryCompetencies);
      expect(translated.indicators).toEqual(entry.indicators);
    });
  });

  describe('Translation to English', () => {
    test('should translate entry to English', () => {
      const translator = new Translator('en');
      const entry = {
        role: 'Backend Developer',
        level: 'L1',
        code: 'BE-L1',
        coreCompetencies: ['Spanish comp 1', 'Spanish comp 2'],
        complementaryCompetencies: ['Spanish comp'],
        indicators: ['Spanish indicator']
      };

      const translated = translator.translate(entry);

      expect(translated.role).toBe('Backend Developer');
      expect(translated.code).toBe('BE-L1');
      expect(translated.coreCompetencies).toBeDefined();
      expect(Array.isArray(translated.coreCompetencies)).toBe(true);
      expect(translated.coreCompetencies.length).toBeGreaterThan(0);
      // Should be translated (different from original)
      expect(translated.coreCompetencies).not.toEqual(entry.coreCompetencies);
    });

    test('should preserve non-competency fields', () => {
      const translator = new Translator('en');
      const entry = {
        role: 'Backend Developer',
        level: 'L1',
        code: 'BE-L1',
        levelNumber: 1,
        yearsRange: { min: 0, max: 2 },
        coreCompetencies: ['comp'],
        complementaryCompetencies: ['comp'],
        indicators: ['indicator']
      };

      const translated = translator.translate(entry);
      expect(translated.levelNumber).toBe(1);
      expect(translated.yearsRange).toEqual({ min: 0, max: 2 });
      expect(translated.level).toBe('L1');
      expect(translated.role).toBe('Backend Developer');
    });

    test('should return original entry if translation file not found', () => {
      const translator = new Translator('en');
      const entry = {
        role: 'Unknown Role',
        level: 'L1',
        code: 'UNK-L1',
        coreCompetencies: ['comp'],
        complementaryCompetencies: ['comp'],
        indicators: ['indicator']
      };

      const translated = translator.translate(entry);
      // Should return original if no translation
      expect(translated.coreCompetencies).toEqual(entry.coreCompetencies);
    });
  });

  describe('Lazy Loading', () => {
    test('should load translations on first use', () => {
      const translator = new Translator('en');

      // First call should load the translation file
      const entry1 = {
        role: 'Backend Developer',
        level: 'L1',
        code: 'BE-L1',
        coreCompetencies: ['Spanish'],
        complementaryCompetencies: ['Spanish'],
        indicators: ['Spanish']
      };

      const translated1 = translator.translate(entry1);
      expect(translated1.coreCompetencies.length).toBeGreaterThan(0);

      // Second call should use cached translation
      const entry2 = {
        role: 'Backend Developer',
        level: 'L2',
        code: 'BE-L2',
        coreCompetencies: ['Spanish'],
        complementaryCompetencies: ['Spanish'],
        indicators: ['Spanish']
      };

      const translated2 = translator.translate(entry2);
      expect(translated2.coreCompetencies.length).toBeGreaterThan(0);
    });

  });


  describe('Translation Files', () => {
    test('should load correct translation structure', () => {
      const translator = new Translator('en');

      const entry = {
        role: 'Backend Developer',
        code: 'BE-L1',
        coreCompetencies: [],
        complementaryCompetencies: [],
        indicators: []
      };

      const translated = translator.translate(entry);

      expect(Array.isArray(translated.coreCompetencies)).toBe(true);
      expect(Array.isArray(translated.complementaryCompetencies)).toBe(true);
      expect(Array.isArray(translated.indicators)).toBe(true);

      expect(translated.coreCompetencies.length).toBeGreaterThan(0);
      expect(translated.complementaryCompetencies.length).toBeGreaterThan(0);
      expect(translated.indicators.length).toBeGreaterThan(0);
    });

    test('should translate multiple roles correctly', () => {
      const translator = new Translator('en');

      const roles = [
        { role: 'Backend Developer', code: 'BE-L1' },
        { role: 'Frontend Developer', code: 'FE-L1' },
        { role: 'Data Scientist', code: 'DS-L1' }
      ];

      roles.forEach(({ role, code }) => {
        const entry = {
          role,
          code,
          coreCompetencies: [],
          complementaryCompetencies: [],
          indicators: []
        };

        const translated = translator.translate(entry);
        expect(translated.coreCompetencies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle null entry', () => {
      const translator = new Translator('en');
      const result = translator.translate(null);
      expect(result).toBeNull();
    });

    test('should handle undefined entry', () => {
      const translator = new Translator('en');
      const result = translator.translate(undefined);
      expect(result).toBeUndefined();
    });

    test('should handle entry without role name', () => {
      const translator = new Translator('en');
      const entry = {
        code: 'BE-L1',
        coreCompetencies: ['comp'],
        complementaryCompetencies: ['comp'],
        indicators: ['indicator']
      };

      // Should not crash
      const result = translator.translate(entry);
      expect(result).toBeDefined();
    });
  });
});
