const axios = require('axios');
const fs = require('fs');

async function downloadUnicode(version) {
  console.log('Resource Files from www.unicode.org ...');
  uribase = 'http://www.unicode.org/Public/';
  idna_tables = uribase + 'idna/' + version;
  console.log('... ' + idna_tables + '/IdnaTestV2.txt');
  await axios(idna_tables + '/IdnaTestV2.txt')
    .then((res) => res.data)
    .then((data) => fs.writeFileSync('test/IdnaTest.txt', data));
}

async function main() {
  const version = process.argv[2];
  if (!version) {
    throw new Error(
      'Expected unicode version but found none. Provide a version from https://www.unicode.org/Public/idna/',
    );
  }
  await downloadUnicode(version);
}

main();
