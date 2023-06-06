require('dotenv').config();
const csv = require('csv-parser');
const { log, errorLog } = require('./logging');
const RepositoryInfo = require('./RepositoryInfo');
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');
const { config } = require('dotenv');
const { createTempDirectory } = require('./createTempDirectory');
const { spawn } = require('child_process');

let bashProcess; // Global variable to store the reference to the bash.exe process
const gitBashPath = "XXXXXXXXXXX";

const org = process.env.org;
const svnURL = process.env.SVN_URL;

function mapBuilder() {
    const map = new Map();
    const filePath = path.join(__dirname, 'resources', 'password-projects-names.csv');
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
            log.warn('Skipping ' + line);
            console.log(' WARNING!!!! Skipping ' + line);
        }
    });
    console.log('My map is: ', map);
    return map;
}

async function migrateProjects() {
    try {
        const map = mapBuilder();
        const tempDirectoryPath = createTempDirectory();

        for (const [svnRepoName, repositoryInfo] of map) {
            log.info(`Processing ${svnRepoName}`);
            try {
                const gitHubName = repositoryInfo.gitHubName;
                const authorFile = 'authors.txt';
                const svnUrl = `${svnURL}${svnRepoName}`;
                const targetDirectory = path.join(tempDirectoryPath, gitHubName.replace(/\\/g, '/'));

                await gitSvnClone(gitHubName, svnUrl, targetDirectory);

                console.log(`Migration of ${gitHubName} completed.`);
                log.info(`Migration of ${gitHubName} completed.`);
            } catch (error) {
                console.error(`Error processing ${repositoryInfo.gitHubName}: ${error}`);
                errorLog.error(`Error processing ${repositoryInfo.gitHubName}. Error message: ${error}`);
            }
        }
    } catch (error) {
        console.error(`Error processing files: ${error}`);
        errorLog.error(`Error processing files: ${error}`);
    }

    console.log('Done processing files.');
    log.info('Done processing files.');
}


async function gitSvnClone(gitHubName, authorFile, svnUrl, targetDirectory) {
    log.info(`Cloning ${svnUrl} from SVN to GitHub repo ${gitHubName}`);
    console.log(`Cloning ${svnUrl} from SVN to GitHub repo ${gitHubName}`);
    const gitCommand = `git svn clone -s -t tags -b branches -T trunk --log-window-size=5000 --authors-file="./resources/authors.txt" ${svnUrl} ${targetDirectory}`;

    // Spawn the bash.exe process if it's not already created
    if (!bashProcess) {
        bashProcess = spawn('bash.exe', ['-c', gitCommand], { shell: true });
    } else {
        // If the bash.exe process already exists, send the git command to it
        bashProcess.stdin.write(gitCommand + '\n');
    }

    return new Promise((resolve, reject) => {
        bashProcess.on('exit', (code) => {
            if (code === 0) {
                console.log(`Cloning complete for ${svnUrl}`);
                log.info(`Cloning complete for ${svnUrl}`);
                resolve();
            } else {
                console.error(`Error cloning ${svnUrl}`);
                errorLog.error(`Error cloning ${svnUrl}`);
                reject(new Error(`Error cloning ${svnUrl}`));
            }
        });
    });
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
            console.log(`Successfully created repository: ${repoName}`);
            log.info(`Successfully created repository: ${repoName}`);
        } else {
            console.log(`Failed to create repository: ${repoName}`);
            log.info(`Failed to create repository: ${repoName}`);
        }
    } catch (error) {
        console.error(`Error creating repository: ${repoName}`, error);
        errorLog.error(`Error creating repository: ${repoName}`, error);
    }
}

migrateProjects();
