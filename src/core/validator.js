/**
 * Validator - Input validation and custom error classes
 *
 * Provides validation methods for role names, levels, and search queries.
 * Includes custom error classes for better error handling.
 *
 * @module core/validator
 * @author 686f6c61
 */

/**
 * Base error class for competency-related errors.
 *
 * @class CompetencyError
 * @extends Error
 */
class CompetencyError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message, code) {
    super(message);
    this.name = 'CompetencyError';
    this.code = code;
  }
}

/**
 * Error thrown when a role is not found.
 *
 * @class RoleNotFoundError
 * @extends CompetencyError
 */
class RoleNotFoundError extends CompetencyError {
  /**
   * @param {string} role - Role name that was not found
   */
  constructor(role) {
    super(`Role "${role}" not found`, 'ROLE_NOT_FOUND');
    this.role = role;
  }
}

/**
 * Error thrown when a level is not found for a role.
 *
 * @class LevelNotFoundError
 * @extends CompetencyError
 */
class LevelNotFoundError extends CompetencyError {
  /**
   * @param {string} role - Role name
   * @param {string} level - Level that was not found
   */
  constructor(role, level) {
    super(`Level "${level}" not found for role "${role}"`, 'LEVEL_NOT_FOUND');
    this.role = role;
    this.level = level;
  }
}

/**
 * Error thrown for invalid queries.
 *
 * @class InvalidQueryError
 * @extends CompetencyError
 */
class InvalidQueryError extends CompetencyError {
  /**
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message, 'INVALID_QUERY');
  }
}

/**
 * Input validation utility class.
 *
 * @class Validator
 */
class Validator {
  /**
   * Validate role name input.
   *
   * @param {string} name - Role name to validate
   * @returns {string} Trimmed role name
   * @throws {InvalidQueryError} If validation fails
   * @static
   */
  static validateRoleName(name) {
    if (typeof name !== 'string') {
      throw new InvalidQueryError('Role name must be a string');
    }
    if (name.length === 0) {
      throw new InvalidQueryError('Role name cannot be empty');
    }
    if (name.length > 100) {
      throw new InvalidQueryError('Role name too long');
    }
    if (/[<>{}]/.test(name)) {
      throw new InvalidQueryError('Invalid characters in role name');
    }
    return name.trim();
  }

  /**
   * Validate level format.
   *
   * @param {string} level - Level to validate (L1-L9 or 1-9)
   * @returns {string} Validated level
   * @throws {InvalidQueryError} If format is invalid
   * @static
   */
  static validateLevel(level) {
    if (typeof level !== 'string') {
      throw new InvalidQueryError('Level must be a string');
    }
    if (!/^L[1-9]/.test(level) && !/^[1-9]$/.test(level)) {
      throw new InvalidQueryError('Invalid level format. Expected L1-L9 or 1-9');
    }
    return level;
  }

  /**
   * Validate search query.
   *
   * @param {string} query - Search query to validate
   * @returns {string} Trimmed query
   * @throws {InvalidQueryError} If validation fails
   * @static
   */
  static validateSearchQuery(query) {
    if (typeof query !== 'string') {
      throw new InvalidQueryError('Query must be a string');
    }
    if (query.length === 0) {
      throw new InvalidQueryError('Query cannot be empty');
    }
    if (query.length > 500) {
      throw new InvalidQueryError('Query too long');
    }
    return query.trim();
  }

  /**
   * Normalize level to L format (3 -> L3).
   *
   * @param {string|number} level - Level to normalize
   * @returns {string} Normalized level (L1-L9)
   * @static
   */
  static normalizeLevel(level) {
    if (/^[1-9]$/.test(level)) {
      return `L${level}`;
    }
    return level;
  }
}

module.exports = {
  Validator,
  CompetencyError,
  RoleNotFoundError,
  LevelNotFoundError,
  InvalidQueryError
};
