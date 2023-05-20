require('dotenv').config();

const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');

// Define the paths to the executables
const GIT_BASH = "\"c:/Program Files/Git/git-bash.exe\"";
const BIN_BASH = "\"c:/Program Files/Git/bin/bash.exe\"";
const GIT = "c:/Program Files/Git/bin/git.exe";

// Define the path to the shell script
const scriptPath = "./resources/github-shell-scripts";

// Github specific global variables
const org = "cd-test-org/";
const userCredentials = process.env.USER_CREDENTIALS;
const baseUrl = "https://api.github.com/";

// Variables for repository names
let svnRepoName;
let gitHubName;

// Setup and enable logging to file
const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
const log = log4js.getLogger();
const errorLog = log4js.getLogger('error');
log.info('Logging directory created:', logDirectory);
errorLog.error('Logging file for error logging created.');

log4js.configure({
    appenders: {
        general: { type: 'file', filename: `${logDirectory}/log.txt` },
        error: { type: 'file', filename: `${logDirectory}/error.log` }
    },
    categories: {
        default: { appenders: ['general'], level: 'info' },
        error: { appenders: ['error'], level: 'error' }
    }
});

// Setting up the OS defined temp directory for housing cloned project directories
// Directory specific variables
const tempDirName = "/GithubTemp/";
const tempDirPath = path.join(os.tmpdir(), tempDirName); // gets the system defined temp directory
const tempDirsLocation = fs.realpathSync(os.tmpdir()).toString();
let repoDirName; // Variable for storing the repository directory path

// Create the temp directory if it doesn't exist
if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
}

log.info('Temp Directory location (tempDirsLocation):', tempDirsLocation);

function mapBuilder() {
    const map = new Map();
    const filePath = "/Users/christopherdeo/Coding Projects/svn-to-github-js/resources/password-projects-names.csv";
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n').slice(1);
    fileLines.forEach((line) => {
        if (line.includes(',')) {
            const keyValuePair = line.split(',');
            if (keyValuePair.length >= 2) {
                svnRepoName = keyValuePair[0];
                gitHubName = keyValuePair[1];
                map.set(svnRepoName, gitHubName);
                // log.info(`${svnRepoName} = ${gitHubName}`);
            } else {
                console.warn("Skipping " + line);
                log.info("WARNING!!!! Skipping " + line);
            }
        }
    });
    console.log(map);
    log.info(map);
    return map;
}

async function migrateProjects() {
    try {
        const map = mapBuilder();
        for (const [svnRepoName, gitHubName] of map.entries()) {
            if (!await checkForStartOfGitHubTag(gitHubName)) {
                log.info("Processing " + svnRepoName);
                console.log("Processing " + svnRepoName);
                const targetDirectory = getRepoDirectoryPath(gitHubName);
                await gitSvnClone(svnRepoName, gitHubName, targetDirectory);
                createGitHubRepository(gitHubName);
                console.log("Migration of " + gitHubName + " completed.");
                log.info("Migration of " + gitHubName + " completed.");
            } else {
                continue;
            }
        }
    } catch (error) {
        console.error("Error processing file " + error + ".");
        errorLog.error("Error processing " + gitHubName + " . Error message: " + error);
    }
    console.log("done");
    log.info("done");
}

// Function to check for "Start-of-Github-VCS" tag and perform git-svn clone if not present
async function checkForStartOfGitHubTag(gitHubName) {
    const url = `${baseUrl}/repos/${org}${gitHubName}/tags/Start-of-Github-VCS`;
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${userCredentials}`).toString('base64')}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        log.info(`Repository: ${gitHubName}, Start tag exists: ${response.status === 200}`);
        console.log(`Repository: ${gitHubName}, Start tag exists: ${response.status === 200}`);
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status !== 200) {
            log.info(`Start of GitHub tag does not exist. Proceeding with migration of ${gitHubName}`);
            console.log(`Start of GitHub tag does not exist. Proceeding with migration of ${gitHubName}`);
            return false; // Specified tag doesn't exist
        } else {
            errorLog.error(`Error checking tag for repository: ${gitHubName}`, error);
        }
    }
    return false;
}

async function gitSvnClone(svnRepoName, gitHubName, targetDirectory) {
    log.info(`Cloning ${svnRepoName} from SVN to GitHub repo ${gitHubName}`);
    console.log(`Cloning ${svnRepoName} from SVN to GitHub repo ${gitHubName}`);

    return new Promise((resolve, reject) => {
        const gitCommand = `git svn clone -s -t tags -b branches -T trunk --log-window-size=5000 --authors-file=./src/main/resources/authors.txt ${repositoryInfo.getSvnUrl()} ${targetDirectory}`;
        const command = `${GIT_BASH} -c "${gitCommand}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Cloning repository stderr: " + stderr);
                errorLog.error("Cloning repository stderr: " + stderr);
                reject(error);
                return;
            }
            if (stderr) {
                console.error("Cloning repository stderr: " + stderr);
                errorLog.error("Cloning repository stderr: " + stderr);
                reject(stderr);
                return;
            }
            console.log(`Cloning complete for ${githubName}`);
            log.info(`Cloning complete for ${githubName}`);
            resolve();
        });
    });
}

async function createGitHubRepository(gitHubName) {
    const url = `${baseUrl}${org}${gitHubName}`;
    try {
        const response = await axios.post(url, {
            name: gitHubName,
            private: true
        }, {
            headers: {
                'Authorization': `Basic ${Buffer.from(userCredentials).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 201) {
            console.log(`Repository '${gitHubName}' created successfully!`);
        } else {
            console.error(`Failed to create repository '${gitHubName}'`);
        }
    } catch (error) {
        console.error(`Error creating repository '${gitHubName}': ${error}`);
        errorLog.error(`Error creating repository '${gitHubName}': ${error}`);
    }
}

migrateProjects();
