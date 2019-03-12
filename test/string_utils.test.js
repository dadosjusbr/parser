const { stringfy, containsSubstring } = require('../src/string_utils');

describe(('string_utils stringfy'), () => {
  it('should convert any into string', () => {
    expect(typeof stringfy(1)).toBe('string');
    expect(typeof stringfy([])).toBe('string');
    expect(typeof stringfy({})).toBe('string');
  });
});

describe('string_utils containsSubstring', () => {
  it('should return true if the string and the substring are both empty', () => {
    expect(containsSubstring('','')).toBe(true);
  });

  it('should return true when the string contains the substring even when the letter cases didnt match', () => {
    expect(containsSubstring('HELLO THERE', 'hello')).toBe(true);
  });

  it('should return true when a number is passed as the container of the substring', () => {
    expect(containsSubstring(123, '12')).toBe(true);
  });

  it('should return false when the substring is not contained on the string', () => {
    expect(containsSubstring('hey you', 'hello')).toBe(false);
  });
});