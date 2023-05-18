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

// Usage
logger.info('Logging directory created:', logDirectory);
errorLogger.error('This is an error message.');

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
                console.log(`${repositoryInfo.getSvnRepoName()} = ${repositoryInfo.getGitHubName()}`);
            }
        } else {
            console.warn("Skipping " + line);
            logger.info("Skipping " + line);
        }
    });
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
                console.log("Processing " + repositoryInfo.getSvnRepoName());
                const tempDirsLocation = fs.realpathSync(os.tmpdir());
                repoDirName = path.join(tempDirsLocation, "Github", repositoryInfo.getGitHubName());

                fs.mkdirSync(repoDirName, { recursive: true });
                const targetDirectory = repoDirName.replace(/\\/g, "/");

                // Calling methods for the migrations
                // gitSvnClone(repositoryInfo, targetDirectory);
                // createGitHubTagsFromSvn(repositoryInfo, repoDirName);
                // listGitHubTags(repositoryInfo, repoDirName);
                // createGitIgnoreFile(repositoryInfo, repoDirName);
                createRepository(repositoryInfo);
                // addRemoteOrigin(repositoryInfo, path.of(targetDirectory));
                // updatePomFile(repositoryInfo, targetDirectory, repoDirName);
                // pushToGitHub(repoDirName);
                // createStartOfGitHubTag(repositoryInfo, repoDirName);
                // pushTags(repositoryInfo, repoDirName);
                // gitStatus(repositoryInfo, repoDirName);
                console.log("Migration of " + repositoryInfo.getSvnRepoName() + " completed.");
                logger.info("Migration of " + repositoryInfo.getSvnRepoName() + " completed.");
            }
        }
    } catch (error) {
        console.error("Error processing file " + error + ".");
        logger.error("Error processing " + repositoryInfo.getGitHubName() + " . Error message: " + error);
    }
    console.log("done");
    logger.info("done");
}

//##############################

// GitHub organization and access token
const orgName = 'cd-test-org';
const userCredentials = process.env.USER_CREDENTIALS;

// Function to check if a repository has a specific tag
async function hasTag(repository) {
    const url = `https://api.github.com/repos/${orgName}/${repository}/git/refs/tags/Start-of-Github-VCS`;

    try {
        await axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${userCredentials}`).toString('base64')}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return true; // Tag exists
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false; // Tag doesn't exist
        } else {
            logger.error(`Error checking tag for repository: ${repository}`, error);
            return null;
        }
    }
}

// Function to check for "Start-of-Github-VCS" tag and perform git-svn clone if not present
async function checkForStartOfGitHubTag() {
    try {
        const map = mapBuilder();
        for (const repositoryInfo of map.values()) {
            const hasStartTag = await hasTag(repositoryInfo.getGitHubName());
            console.log(`Repository: ${repositoryInfo.getGitHubName()}, Start tag exists: ${hasStartTag}`);

            if (hasStartTag === null) {
                continue; // Skip to the next repository if there was an error checking the tag
            }

            if (!hasStartTag) {
                try {
                    await gitSvnClone(repositoryInfo);
                } catch (error) {
                    logger.error(`Error running git-svn clone for repository: ${repositoryInfo.getGitHubName()}`, error);
                }
            }
        }
    } catch (error) {
        logger.error('Error occurred while fetching repositories', error);
    }
}

function migrateProjects() {
    try {
        const map = mapBuilder();
        for (const repositoryInfo of map.values()) {
            if (!hasTag(repositoryInfo.getGitHubName())) {
                console.log("Processing " + repositoryInfo.getSvnRepoName());
                // Call other functions as needed
                // gitSvnClone(repositoryInfo);
                // createGitHubTagsFromSvn(repositoryInfo);
                // createGitIgnoreFile(repositoryInfo);
                // createRepository(repositoryInfo);
                // addRemoteOrigin(repositoryInfo);
                // updatePomFile(repositoryInfo);
                // pushToGitHub(repositoryInfo);
                // createStartOfGitHubTag(repositoryInfo);
                // pushTags(repositoryInfo);
                // gitStatus(repositoryInfo);
                console.log("Migration of " + repositoryInfo.getSvnRepoName() + " completed.");
                logger.info("Migration of " + repositoryInfo.getSvnRepoName() + " completed.");
            }
        }
    } catch (error) {
        console.error("Error processing file " + error + ".");
        logger.error("Error processing " + repositoryInfo.getGitHubName() + " . Error message: " + error);
    }
    console.log("done");
    logger.info("done");
}


function gitSvnClone(repositoryInfo, targetDirectory) {
    logger.info("Cloning " + `${repositoryInfo.getSvnRepoName()}` + " from SVN to GitHub repo" + ` ${repositoryInfo.getGitHubName()}`);
    console.log("Cloning " + `${repositoryInfo.getSvnRepoName()}` + " from SVN to GitHub repo " + `${repositoryInfo.getGitHubName()}`);

    const gitCommand = `git svn clone -s - t tags - b branches - T trunk--log - window - size=5000 --authors - file=./src/main / resources / authors.txt 
        ${repositoryInfo.getSvnUrl()} ${targetDirectory}`;
    const command = `${GIT_BASH} -c "${gitCommand}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Cloning repository stderr: " + stderr);
            return;
        }
        if (stderr) {
            console.error("Cloning repository stderr: " + stderr);
            return;
        }
        console.log("Cloning complete for " + repositoryInfo.getGithubName());
        logger.info("Cloning complete for " + repositoryInfo.getGithubName());
    });
}

function createGitIgnoreFile(repositoryInfo, repoDirName) {
    console.log("Creating .gitignore file for: " + repositoryInfo.getGitHubName());

    const ignoreFilePath = path.join(repoDirName, ".gitignore");


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
checkForStartOfGitHubTag();
migrateProjects();
