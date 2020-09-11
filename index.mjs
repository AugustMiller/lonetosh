import fs from 'fs';
import dotenv from 'dotenv';
import hbs from 'handlebars';
import dateformat from 'date-format';

const log = (message) => console.log(`✔ ${message}`);

const envstring = fs.readFileSync('.env');
const ENV = dotenv.parse(envstring);

log(`Found ${Object.keys(ENV).length} environmental variables.`);

const template = hbs.compile(fs.readFileSync('config.plist.hbs').toString());

log(`Compiled Plist template.`);

fs.writeFileSync('OC/config.plist', template({
    date: new Date,
    ENV,
}));

log(`Done!`);