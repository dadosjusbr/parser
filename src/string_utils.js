/**
 * Cast any type to String.  
 */
const stringfy = value => '' + value;

/**
 * Checks if a value that can be of any type contains a substring.
 * 
 * IMPORTANT: the check is not case sensitive.
 * 
 * @param {*} value       value that may contain in the String.
 * @param {String} sub    substring that may be contained in the value.
 * 
 * @returns {Boolean} true if the value contains the substring, false c.c. 
 */
const containsSubstring = (value, sub) => stringfy(value).toLowerCase().includes(sub.toLowerCase());

module.exports = { stringfy, containsSubstring };