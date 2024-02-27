/**
 * @typedef {object} CueVariable
 * @property {string} id - the id of the variable
 * @property {string} label - the label of the variable
 * @property {string} contents - the value of the variable
 */

/**
 * @typedef {object} Cue
 * @property {string} id - the unique ID
 * @property {string} type - the type of cue
 */

/**
 * @typedef {object} CueTypes
 * @property {string} png - text representation of the png
 * @property {string} bgColor - background color in integer format
 * @property {Function} label - label of the cue
 * @property {Function} contents - contents of the cue
 * @property {Function} extraVariables - extra variables for the cue
 * @property {Function} time - the time to use for the cue
 */

/**
 * @typedef {object} H2RGraphicsInstance
 * @property {Function} log - log a message
 */
