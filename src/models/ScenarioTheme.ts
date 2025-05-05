/**
 * Represents a scenario theme with detailed information.
 * This interface is used for displaying information about crisis scenario themes.
 */
export interface ScenarioThemeDto {
  /** Unique identifier for the scenario theme */
  id: number;
  /** Name of the scenario theme */
  name: string;
  /** Detailed description of the scenario theme */
  description?: string;
  /** Instructions for before the crisis */
  before?: string;
  /** Instructions for during the crisis */
  under?: string;
  /** Instructions for after the crisis */
  after?: string;
  /** Status of the scenario theme (active or archived) */
  status: 'active' | 'archived';
  /** User ID of the person who created this scenario theme */
  createdByUserId: number;
  /** ISO string timestamp when the scenario theme was created */
  createdAt: string;
  /** ISO string timestamp when the scenario theme was last updated */
  updatedAt: string;
}

/**
 * Represents detailed information about a scenario theme.
 * This is a simplified version of ScenarioThemeDto used for displaying details.
 */
export interface ScenarioThemeDetailsDto {
  /** Unique identifier for the scenario theme */
  id: number;
  /** Name of the scenario theme */
  name: string;
  /** Detailed description of the scenario theme */
  description?: string;
  /** Instructions for before the crisis */
  before?: string;
  /** Instructions for during the crisis */
  under?: string;
  /** Instructions for after the crisis */
  after?: string;
  /** Legacy field for backward compatibility */
  instructions?: string;
}

/**
 * Data required to create a new scenario theme.
 */
export interface CreateScenarioThemeDto {
  /** Name of the scenario theme */
  name: string;
  /** Detailed description of the scenario theme */
  description?: string;
  /** Instructions for before the crisis */
  before?: string;
  /** Instructions for during the crisis */
  under?: string;
  /** Instructions for after the crisis */
  after?: string;
}

/**
 * Data required to update an existing scenario theme.
 */
export interface UpdateScenarioThemeDto {
  /** Unique identifier for the scenario theme to update */
  id: number;
  /** Updated name of the scenario theme (optional) */
  name?: string;
  /** Updated description of the scenario theme (optional) */
  description?: string;
  /** Updated instructions for before the crisis (optional) */
  before?: string;
  /** Updated instructions for during the crisis (optional) */
  under?: string;
  /** Updated instructions for after the crisis (optional) */
  after?: string;
  /** Updated status of the scenario theme (optional) */
  status?: 'active' | 'archived';
}

export interface ScenarioThemePreview {
  /** Unique identifier for the scenario theme to update */
  id: number;
  /**Name of the scenario theme */
  name: string;
}
