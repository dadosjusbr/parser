module.exports = {
  HEADER_SIZE_ERROR: (expectedSize, foundSize, sheetName) => ({
    message: `The ${sheetName} sheet header should have the size (${expectedSize}) but found (${foundSize})`,
    code: 1
  })
}