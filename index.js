require('dotenv').config();

const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');

// Define the paths to the executables
const GIT_BASH = `"c:/Program Files/Git/git-bash.exe"`;
const BIN_BASH = `"c:/Program Files/Git/bin/bash.exe"`;
const GIT = `"c:/Program Files/Git/bin/git.exe"`;

// Define the path to the shell script
const scriptPath = "./resources/github-shell-scripts";

const org = "Deo-Test-Org/";
const userCredentials = `${process.env.USER_CREDENTIALS}`;
const accessToken = `${process.env.GITHUB_TOKEN}`
const baseUrl = "https://api.github.com/";
let svnRepoName, gitHubName;

const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Setup and enable logging to file
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

const log = log4js.getLogger();
const errorLog = log4js.getLogger('error');
log.info('Logging directory created:', logDirectory);
errorLog.error('Logging file for error logging created.');

// Get the system-defined temp directory
const tempDirName = "Github-JS";
const tempDirPath = path.join(os.tmpdir(), tempDirName);

// Create the temp directory if it doesn't exist
if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
}
const tempDirsLocation = fs.realpathSync(os.tmpdir()).toString();
log.info('tempDirsLocation:', tempDirsLocation);

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
                log.info(`${svnRepoName} = ${gitHubName}`);
            }
        } else {
            console.warn("Skipping " + line);
            log.info(" WARNING!!!! Skipping " + line);
        }
    });
    console.log(map);
    return map;
}

async function migrateProjects(svnRepoName, gitHubName) {
    try {
        const map = mapBuilder();
        
        for (const [svnRepoName, gitHubName] of map.entries()) {
                log.info(`Processing ${svnRepoName}`);
                createGitHubRepository(gitHubName);
                console.log(`Migration of ${gitHubName} completed.`);
                log.info("Migration of " + gitHubName + " completed.");
            }
        }
     catch (error) {
        console.error("Error processing file " + error + ".");
        errorLog.error(`Error processing ${gitHubName}. Error message: ${error}`);
    }
    console.log("done processing files");
    log.info("done processing files");
}

async function checkForStartOfGitHubTag(gitHubName) {
    const url = `${baseUrl}${org}${gitHubName}/git/refs/tags/Start-of-Github-VCS`;
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${accessToken}`).toString('base64')}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        log.info('Start of Github VCS tag exists');
        return true; // Tag exists
    } catch (error) {
        if (error.response && error.response.status === 404) {
            log.info('Start of Github VCS tag does not exist');
            return false; // Tag doesn't exist
        } else {
            errorLog.error(`Error checking tag for repository: ${gitHubName}`, error);
            return null;
        }
    }
}

// Function to create a GitHub repository
async function createGitHubRepository(repoName) {
    const apiUrl = `${baseUrl}orgs/${org}repos`;

    try {
        const response = await axios.post(apiUrl, {
            name: repoName
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (response.status === 201) {
            console.log(`Successfully created repository: ${gitHubName}`);
            log.info(`Successfully created repository: ${gitHubName}`);
        } else {
            console.log(`Failed to create repository: ${gitHubName}`);
            log.info(`Failed to create repository: ${gitHubName}`);
        }
    } catch (error) {
        console.error(`Error creating repository: ${gitHubName}`, error);
        errorLog.error(`Error creating repository: ${gitHubName}`, error);
    }
}

migrateProjects(svnRepoName, gitHubName);






