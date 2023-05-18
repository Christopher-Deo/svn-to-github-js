require('dotenv').config();

const axios = require('axios');
const RepositoryInfo = require('./RepositoryInfo');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');

const repositoryInfo = new RepositoryInfo();

const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

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

const logger = log4js.getLogger();
const errorLogger = log4js.getLogger('error');
logger.info('Logging directory created:', logDirectory);
errorLogger.error('Logging file for error logging created.');

// Define the paths to the executables
const GIT_BASH = "\"c:/Program Files/Git/git-bash.exe\"";
const BIN_BASH = "\"c:/Program Files/Git/bin/bash.exe\"";
const GIT = "c:/Program Files/Git/bin/git.exe";

// Define the path to the shell script
const scriptPath = "./resources/github-shell-scripts";

// Get the system-defined temp directory
const tempDir = os.tmpdir();
const tempDirName = "Github-JS";
const tempDirPath = path.join(os.tmpdir(), tempDirName);

// Create the temp directory if it doesn't exist
if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
}
const tempDirsLocation = fs.realpathSync(os.tmpdir()).toString();
logger.info('tempDirsLocation:', tempDirsLocation);

const repoDirName = tempDirsLocation + "/Github/" + repositoryInfo.getGitHubName();

const repositoryName = repositoryInfo.getGitHubName();
logger.info('repositoryName:', repositoryName);

fs.mkdirSync(repoDirName, { recursive: true });
const targetDirectory = repoDirName.replace(/\\/g, "/");

function mapBuilder() {
    const map = new Map();
    const filePath = "/Users/christopherdeo/Coding Projects/svn-to-github-js/resources/password-projects-names.csv";
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n').slice(1);

    fileLines.forEach((line) => {
        if (line.includes(',')) {
            const keyValuePair = line.split(',');
            if (keyValuePair.length >= 2) {
                const svnRepoName = keyValuePair[0];
                const gitHubName = keyValuePair[1];
                const repositoryInfo = new RepositoryInfo();
                repositoryInfo.setSvnRepoName(svnRepoName);
                repositoryInfo.setGitHubName(gitHubName);
                map.set(svnRepoName, repositoryInfo);
                logger.info(`${repositoryInfo.svnRepoName} = ${repositoryInfo.gitHubName}`);
            }
        } else {
            console.warn("Skipping " + line);
            logger.info(" WARNING!!!! Skipping " + line);
        }
    });
    console.log(map);
    return map;
}

function migrateProjects() {
    try {
        const map = mapBuilder();
        let repoDirName;
        for (const repositoryInfo of map.values()) {
            if (checkForStartOfGitHubTag(repositoryInfo)) {
                continue;
            } else {
                logger.info("Processing " + repositoryInfo.svnRepoName);
                // Calling methods for the migrations

                // gitSvnClone(repositoryInfo, targetDirectory);
                // createGitHubTagsFromSvn(repositoryInfo, repoDirName);
                // listGitHubTags(repositoryInfo, repoDirName);
                // createGitIgnoreFile(repositoryInfo, repoDirName);
                createGitHubRepository(repositoryInfo);
                // addRemoteOrigin(repositoryInfo, path.of(targetDirectory));
                // updatePomFile(repositoryInfo, targetDirectory, repoDirName);
                // pushToGitHub(repoDirName);
                // createStartOfGitHubTag(repositoryInfo, repoDirName);
                // pushTags(repositoryInfo, repoDirName);
                // gitStatus(repositoryInfo, repoDirName);
                console.log("Migration of " + repositoryInfo.svnRepoName + " completed.");
                logger.info("Migration of " + repositoryInfo.svnRepoName + " completed.");
            }
        }
    } catch (error) {
        console.error("Error processing file " + error + ".");
        errorLogger.error("Error processing " + repositoryInfo.gitHubName + " . Error message: " + error);
    }
    console.log("done");
    logger.info("done");
}

// Function to check if a repository has a specific tag
function hasTag(repository) {
    const url = `https://api.github.com/repos/cd-test-org/${repository}/git/refs/tags/Start-of-Github-VCS`;
    const userCredentials = process.env.USER_CREDENTIALS;
    try {
         axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${userCredentials}`).toString('base64')}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        logger.info('Start of Github VCS tag exists');
        return true; // Tag exists
    } catch (error) {
        if (error.response && error.response.status === 404) {
            logger.info('Start of Github VCS tag does not exist');
            return false; // Tag doesn't exist
        } else {
            errorLogger.error(`Error checking tag for repository: ${repository}`, error);
            return null;
        }
    }
}

// Function to check for "Start-of-Github-VCS" tag and perform git-svn clone if not present
function checkForStartOfGitHubTag() {
    try {
        const map = mapBuilder();
        for (const repositoryInfo of map.values()) {
            const hasStartTag = hasTag(repositoryInfo.gitHubName);
            logger.info(`Repository: ${repositoryInfo.gitHubName}, Start tag exists: ${hasStartTag}`);
            
            if (hasStartTag === null) {
                continue; // Skip to the next repository if there was an error checking the tag
            }
            
            if (!hasStartTag) {
                try {
                    //#########################
                    // gitSvnClone(repositoryInfo);
                    createGitHubRepository(repositoryInfo);
                } catch (error) {
                    errorLogger.error(`Error running git-svn clone for repository: ${repositoryInfo.gitHubName}`, error);
                }
            }
        }
    } catch (error) {
        errorLogger.error('Error occurred while fetching repositories', error);
    }
}

function gitSvnClone(repositoryInfo, targetDirectory) {
    logger.info("Cloning " + `${repositoryInfo.svnRepoName}` + " from SVN to GitHub repo" + ` ${repositoryInfo.gitHubName}`);
    console.log("Cloning " + `${repositoryInfo.svnRepoName}` + " from SVN to GitHub repo " + `${repositoryInfo.gitHubName}`);

    const gitCommand = `git svn clone -s - t tags - b branches - T trunk--log - window - size=5000 --authors - file=./src/main / resources / authors.txt 
        ${repositoryInfo.getSvnUrl()} ${targetDirectory}`;
    const command = `${GIT_BASH} -c "${gitCommand}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            errorLogger.error("Cloning repository stderr: " + stderr);
            return;
        }
        if (stderr) {
            errorLogger.error("Cloning repository stderr: " + stderr);
            return;
        }
        console.log("Cloning complete for " + repositoryInfo.githubName);
        logger.info("Cloning complete for " + repositoryInfo.githubName);
    });
}

function createGitIgnoreFile(repositoryInfo, repoDirName) {
    logger.info("Creating .gitignore file for: " + repositoryInfo.gitHubName);
    const ignoreFilePath = path.join(targetDirectory, ".gitignore");

}

function createGitHubRepository(repoName) {
    const apiUrl = 'https://api.github.com/user/repos';
    const userCredentials = `${process.env.USER_CREDENTIALS}`;

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
hasTag(repositoryInfo.gitHubName)
checkForStartOfGitHubTag(repositoryInfo.gitHubName);
migrateProjects();
