import fs from 'fs';
import dotenv from 'dotenv';
import hbs from 'handlebars';

// Cute logger:
const log = (message) => console.log(`✔ ${message}`);

// Read + parse .env file into an object (not populating process.ENV):
const envstring = fs.readFileSync('.env');
const ENV = dotenv.parse(envstring);

// Let the user know what we found:
log(`Found ${Object.keys(ENV).length} environmental variables.`);

// Compile template:
const template = hbs.compile(fs.readFileSync('config.plist.hbs').toString());

log(`Compiled Plist template.`);

// Render + write the template to the destination file:
fs.writeFileSync('OC/config.plist', template({
    date: new Date,
    ENV,
}));

// That's it!
log(`Done!`);
