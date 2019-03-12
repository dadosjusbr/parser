# Find Sheet Header

Contents:
- [Find Sheet Header](#find-sheet-header)
    - [Issue](#issue)
    - [Decision](#decision)
    - [Status](#status)


### Issue

In the parsing process we end up with a matrix for each sheet on the spreadsheet, now we want to iterate over each line of this matrix and collect its data. But there are some things on the sheet that are not necessarily data, such as: the table header, some instructions for the courts, the sheet title and other stuff.

One thing we can assume is that the data will be located in the lines below the header. So, to find the data we need to find where the header is located.

In order to find the header we have to isolate the things that all of them have in common, and it is the first two fields always contains the strings: `CPF` and `Nome`, respectively. 

### Decision

We decide to implement the search checking in each line of the matrix if the first column contains the string `CPF` and se second one `Nome`.  

### Status

After the implementation, the search was applied for more than 1000 spreadsheets from different courts and months and in all the cases it returned a position for the header.


