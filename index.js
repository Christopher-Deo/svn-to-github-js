require('dotenv').config();
const csv = require('csv-parser');
const { log, errorLog } = require('./logging');
const applicationProperties = require('./applicationProperties');
const RepositoryInfo = require('./RepositoryInfo');
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');
const { config } = require('dotenv');
const tempDirectory = require('./createTempDirectory');

let svnRepoName, gitHubName, team;
 const org = `${process.env.org}`;
const svnURL = process.env.SVN_URL + svnRepoName;

function mapBuilder() {
    const map = new Map();
    const filePath = "/Users/christopherdeo/Coding Projects/svn-to-github-js/resources/password-projects-names.csv";
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n').slice(1);

    fileLines.forEach((line) => {
        if (line.includes(',')) {
            const keyValuePair = line.split(',');
            if (keyValuePair.length >= 3) {
                const svnRepoName = keyValuePair[0].trim();
                const gitHubName = keyValuePair[1].trim();
                const team = keyValuePair[2].trim();
                                              
                const repositoryInfo = new RepositoryInfo(gitHubName, team);
                map.set(svnRepoName, repositoryInfo);
                console.log(`${svnRepoName} = ${JSON.stringify(repositoryInfo)}`);
            }
        } else {
            log.warn("Skipping " + line);
            console.log(" WARNING!!!! Skipping " + line);
        }
    });
    console.log("My map is: ", map);
    return map;
}

function migrateProjects() {
    try {
        const map = mapBuilder();
        
        map.forEach((repositoryInfo, svnRepoName) => {
            log.info(`Processing ${svnRepoName}`);
            try {
                // gitSvnClone(repositoryInfo.gitHubName, authorFile, svnUrl, targetDirectory);
                console.log(`Migration of ${repositoryInfo.gitHubName} completed.`);
                log.info(`Migration of ${repositoryInfo.gitHubName} completed.`);
            } catch (error) {
                console.error(`Error processing ${repositoryInfo.gitHubName}: ${error}.`);
                errorLog.error(`Error processing ${repositoryInfo.gitHubName}. Error message: ${error}`);
            }
        });
    } catch (error) {
        console.error(`Error processing files: ${error}.`);
        errorLog.error(`Error processing files: ${error}`);
    }

    console.log("Done processing files.");
    log.info("Done processing files.");
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
                'Authorization': `Bearer ${process.env.USER_CREDENTIALS}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (response.status === 201) {
            let response;
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

function gitSvnClone(gitHubName, authorFile, svnUrl, targetDirectory) {
    log.info("Cloning " + `${svnRepoName}` + " from SVN to GitHub repo" + ` ${gitHubName}`);
    console.log("Cloning " + `${svnRepoName}` + " from SVN to GitHub repo " + `${gitHubName}`);
    const gitCommand = `git svn clone -s -t tags -b branches -T trunk --log-window-size=5000 --authors-file=${authorFile} ${svnUrl} ${targetDirectory}`;
    const command = `${GIT_BASH} -c "${gitCommand}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`Cloning complete for ${gitHubName}`);
            log.info(`Cloning complete for ${gitHubName}`);
        }

    }
    );
}

migrateProjects(svnRepoName, gitHubName);






