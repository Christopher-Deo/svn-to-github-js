const RepositoryInfo = require('./RepositoryInfo');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const log4js = require('log4js');

const repositoryInfo = new RepositoryInfo();

// Setting up logging for the project
const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
const logger = log4js.configure('log4js.json').getLogger();
// Usage
logger.info('Logging directory created:', logDirectory);

// Define the paths to the executables
const GIT_BASH = "\"c:/Program Files/Git/git-bash.exe\"";
const BIN_BASH = "\"c:/Program Files/Git/bin/bash.exe\"";
const GIT = "c:/Program Files/Git/bin/git.exe";
// Define the path to the shell script
const scriptPath = "./resources/github-shell-scripts";

// Get the system-defined temp directory
const tempDir = os.tmpdir();
// Generate a unique directory name
const tempDirName = "Github-JS";

// Create the temp directory
const tempDirPath = path.join(tempDir, tempDirName);
fs.mkdirSync(tempDirPath);

const targetDirectory = path.join(tempDirPath, repositoryInfo.svnRepoName);
fs.mkdirSync(targetDirectory);

console.log('Temporary directory created at: ' + tempDirPath);
console.log("Target Directory is " + targetDirectory);
logger.info('Temporary directory created at: ' + tempDirPath);

// Building the Map of the files to be copied
function byStream() {
    const map = new Map();
    const filePath = "./svn-to-github-js/resources/passwords-projects-names.csv";
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n').slice(1);

    fileLines.forEach((line) => {
        if (line.includes(',')) {
            const keyValuePair = line.split(',');
            if (keyValuePair.length >= 2) {
                const svnRepoName = keyValuePair[0];
                const gitHubName = keyValuePair[1];

                repositoryInfo.setSvnRepoName(svnRepoName);
                repositoryInfo.setGitHubName(gitHubName);

                map.set(svnRepoName, gitHubName);
                console.log(`svnRepoName = ${repositoryInfo.getSvnRepoName()} and gitHubName = ${repositoryInfo.getGitHubName()}`);
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
        const map = byStream();
        for (const repositoryInfo of map.values()) {
            if (checkForStartOfGitHubTag(repositoryInfo)) {
                continue;
            } else {
                console.log("Processing " + repositoryInfo.getSvnRepoName());
                const tempDirsLocation = fs.realpathSync(os.tmpdir());
                const repoDirName = path.join(tempDirsLocation, "Github", repositoryInfo.getGitHubName());
                fs.mkdirSync(repoDirName, { recursive: true });
                const targetDirectory = repoDirName.replace(/\\/g, "/");

                // Calling methods for the migrations
                gitSvnClone(repositoryInfo, targetDirectory);
                createGitHubTagsFromSvn(repositoryInfo, repoDirName);
                listGitHubTags(repositoryInfo, repoDirName);
                createGitIgnoreFile(repositoryInfo, repoDirName);
                createRepository(repositoryInfo);
                addRemoteOrigin(repositoryInfo, path.of(targetDirectory));
                updatePomFile(repositoryInfo, targetDirectory, repoDirName);
                pushToGitHub(repoDirName);
                createStartOfGitHubTag(repositoryInfo, repoDirName);
                pushTags(repositoryInfo, repoDirName);
                gitStatus(repositoryInfo, repoDirName);
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
    logger.info("Cloning " + `${ repositoryInfo.getSvnRepoName()}` + " from SVN to GitHub repo" +` ${repositoryInfo.getGitHubName()}`);
    console.log("Cloning " + `${repositoryInfo.getSvnRepoName()}` + " from SVN to GitHub repo " + `${repositoryInfo.getGitHubName()}`);

    const gitCommand = `git svn clone -s - t tags - b branches - T trunk--log - window - size=5000 --authors - file=./src/main / resources / authors.txt 
        ${repositoryInfo.getSvnUrl()} ${ targetDirectory}`;
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

    const ignoreFilePath = path.join(targetDirectory, ".gitignore");
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