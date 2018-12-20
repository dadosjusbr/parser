const getParsedSpreadsheet = (req, res) => {
    // get spreadsheet url from queryparams
    // fetch spreadsheet via http
    // parse spreadsheet into json using xslx lib
    // collect and clean the parsed json data
    // parses clean data into csv
    // responds csv
    res.status(200).send('this will be a csv file');
};

module.exports = {getParsedSpreadsheet};