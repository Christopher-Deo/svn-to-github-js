import RepositoryInfo from './RepositoryInfo';


const os = require('os');
const fs = require('fs');
const path = require('path');
const { exc, exec } = require('child_process');
const log4js = require('log4js');

//Setting up logging for project
const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
const logger = log4js.configure('log4js.json').getLogger();
// Usage
logger.info('Logging directory created:', logDirectory);


//Define the paths to the executables
const GIT_BASH = "<path to git bash.exe>";
const BIN_BASH = "<path to bin bash.exe>";

//Get the system defined temp directory
const tempDir = os.tmpdir();
//Generate a unique directory name
const tempDirName = "Github-JS";

//Create  the temp directory
const tempDirPath = path.join(tempDir, tempDirName);
fs.mkdirSync(tempDirPath);

console.log('Temporary directory created at: ' + tempDirPath);
logger.info('Temporary directory created at: ' + tempDirPath);


//Building the Map of the files to be copied
function byStream() {
    const map = {};
    const fileLines = fs.readFileSync('./resources/svn-to-github-names.csv', 'utf8').split('\n').slice(1);

    fileLines.forEach(line => {
        fileLines.forEach(line => {
            if (line.includes(',')) {
                const [svnRepoName, gitHubName, team] = line.split(',');
                const repositoryInfo = {
                    svnProjectName: svnRepoName.trim(),
                    gitHubName: gitHubName.trim()
                };
                map[svnRepoName.trim()] = repositoryInfo;
                console.log(`${svnRepoName} = ${gitHubName}`);
            } else {
                console.warn(`Skipping ${line}`);
            }
        });
        return map;
    });
}