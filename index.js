require('dotenv').config();

const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');
const { createDiffieHellmanGroup } = require('crypto');

// Define the paths to the executables
const GIT_BASH = "\"c:/Program Files/Git/git-bash.exe\"";
const BIN_BASH = "\"c:/Program Files/Git/bin/bash.exe\"";
const GIT = "c:/Program Files/Git/bin/git.exe";

// Define the path to the shell script
const scriptPath = "./resources/github-shell-scripts";

//Github specific global variables
const org = "cd-test-org/";
const userCredentials = process.env.USER_CREDENTIALS;
const apiBaseUrl = "https://api.github.com/";



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

const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const log = log4js.getLogger();
const errorLog = log4js.getLogger('error');
log.info('Logging directory created:', logDirectory);
errorLog.error('Logging file for error logging created.');


//Setting up the OS defined temp directory for housing cloned project directories
     //Directory specific variables
     const repoDirName = `${tempDirsLocation}/${tempDirName}/${gitHubName}`;
     const tempDirName = "/GithubTemp/";
     const tempDirPath = path.join(os.tmpdir(), tempDirName); //gets the system defined temp directory
     const tempDirsLocation = fs.realpathSync(os.tmpdir()).toString();
     
// Create the temp directory if it doesn't exist
if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
}

log.info('tempDirsLocation:', tempDirsLocation);
log.info('repositoryName:', gitHubName);

fs.mkdirSync(repoDirName, { recursive: true });
const targetDirectory = repoDirName.replace(/\\/g, "/");

function mapBuilder() {
    const map = new Map();
    const filePath = "svn-to-github-js-main\resources\password-projects-names.csv";
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n').slice(1);
    fileLines.forEach((line) => {
        if (line.includes(',')) {
            const keyValuePair = line.split(',');
            if (keyValuePair.length >= 2) {
                const svnRepoName = keyValuePair[0];
                const gitHubName = keyValuePair[1];
                map.set(svnRepoName, gitHubName);
                log.info(`${svnRepoName} = ${gitHubName}`);
            }
        } else {
            console.warn("Skipping " + line);
            log.info(" WARNING!!!! Skipping " + line);
        }
    });
    console.log(map);
    log.info(map);
    return map;
}

function migrateProjects() {
    try {
        const map = mapBuilder();
        for (const [svnRepoName,gitHubName] of map.entries()) {
            if (checkForStartOfGitHubTag(gitHubName)) {
                continue;
            } else {
                logger.info("Processing " + svnRepoName);
                // Calling methods for the migrations
                
                // gitSvnClone(repositoryInfo
                // gitSvnClone(repositoryInfo, targetDirectory);
                // createGitHubTagsFromSvn(repositoryInfo, repoDirName);
                // listGitHubTags(repositoryInfo, repoDirName);
                // createGitIgnoreFile(repositoryInfo, repoDirName);
                createGitHubRepository(svnRepoName, gitHubName);
                // addRemoteOrigin(repositoryInfo, path.of(targetDirectory));
                // updatePomFile(repositoryInfo, targetDirectory, repoDirName);
                // pushToGitHub(repoDirName);
                // createStartOfGitHubTag(repositoryInfo, repoDirName);
                // pushTags(repositoryInfo, repoDirName);
                // gitStatus(repositoryInfo, repoDirName);
                console.log("Migration of " + gitHubName + " completed.");
                log.info("Migration of " + gitHubName + " completed.");
            }
        }
    } catch (error) {
        console.error("Error processing file " + error + ".");
        errorLog.error("Error processing " + gitHubName + " . Error message: " + error);
    }
    console.log("done");
    log.info("done");
}

// Function to check if a repository has a specific tag
function hasTag(gitHubName) {
    const url = `${apiBaseUrl}/repos/${org}${gitHubName}/tags/Start-of-Github-VCS`;
    try {
        axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${userCredentials}`).toString('base64')}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        log.info('Start of Github VCS tag exists');
        return true; // Tag exists
    } catch (error) {
        if (error.response && error.response.status != 200 ) {
            log.info(`Start of github tag does not exist. Proceeding with migration of ${gitHubName}`);
            console.log(`Start of github tag does not exist. Proceeding with migration of ${gitHubName}`);
            return false; // Specified tag doesn't exist
        } else {
            errorLog.error(`Error checking tag for repository: ${git}`, error);
          }
    }
}

// Function to check for "Start-of-Github-VCS" tag and perform git-svn clone if not present
function checkForStartOfGitHubTag(gitHubName) {
    const hasStartTag = hasTag(gitHubName);
    log.info(`Repository: ${gitHubName}, Start tag exists: ${hasStartTag}`);
    if (hasStartTag) {
        return true; 
    }
    if (!hasStartTag) {
        try {
            migrateProjects(svnRepoName, gitHubName, targetDirectory)
        } catch (error) {
            errorLog.error(`Error running git-svn clone for repository: ${gitHubName}`, error);
        }
    }
    return false;
}

function gitSvnClone(svnRepoName, gitHubName, targetDirectory) {
    log.info("Cloning " + `${svnRepoName}` + " from SVN to GitHub repo" + ` ${gitHubName}`);
    console.log("Cloning " + `${svnRepoName}` + " from SVN to GitHub repo " + `${gitHubName}`);

    const gitCommand = `git svn clone -s -t tags -b branches -T trunk --log-window-size=5000 --authors-file=./src/main/resources/authors.txt ${repositoryInfo.getSvnUrl()} ${targetDirectory}`;
    const command = `${GIT_BASH} -c "${gitCommand}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Cloning repository stderr: " + stderr);
            errorLog.error("Cloning repository stderr: " + stderr);
            return;
        }
        if (stderr) {
            console.error("Cloning repository stderr: " + stderr);
            errorLog.error("Cloning repository stderr: " + stderr);
            return;
        }
        console.log(`Cloning complete for ${githubName}`);
        log.info(`Cloning complete for ${githubName}`);
    });
}

function createGitIgnoreFile(repoDirName) {
    console.log(`Creating .gitignore file for: ${gitHubName}`)
    log.info(`Creating .gitignore file for: ${gitHubName}`);
    const ignoreFilePath = path.join(targetDirectory, ".gitignore");
    if(ignoreFilePath){
        return
    } else{
    //logic to create gitignore file
    }
}

function createGitHubRepository(repoName) {
    const url = `${apiUrl}${org}${repoName}`;
    try {
        const response = axios.post(apiUrl, {
            name: repoName,
            private: true
        }, {
            headers: {
                'Authorization': `Basic ${Buffer.from(userCredentials).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
    if (response.status === 201) {
        console.log(`Repository '${repoName}' created successfully!`);
        } else {
            console.error(`Failed to create repository for ${repositoryInfo.githubName}.`);
        }
    } catch (error) {
        console.error('An error occurred while creating the repository:', error.message);
        errorLog('An error occurred while creating the repository:', error.message);
}
}

//====================== helper functions ======================

function runGitBash() {
    // Run the shell script using Git Bash
    const command = `${gitBashPath} "${scriptPath}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', error.message);
            return;
        }
        if (stderr) {
            console.error('Script execution error:', stderr);
            return;
        }
        console.log('Script executed successfully');
    });
}
