//
// Generate code to pull earthquakes.csv from GitHub.
//
Blockly.JavaScript['data_earthquakes'] = (block) => {
  const URL = 'https://raw.githubusercontent.com/tidyblocks/tidyblocks/master/data/earthquakes.csv'
  return `TidyBlocksPipelineManager.register({}, () => {readCSV('${URL}')`
}
