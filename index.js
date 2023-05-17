import RepositoryInfo from './RepositoryInfo';

const { execSync } = require('child_process');
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
const GIT_BASH = "\"c:/Program Files/Git/git-bash.exe\"";
const BIN_BASH = "\"c:/Program Files/Git/bin/bash.exe\"";
const GIT = "c:/Program Files/Git/bin/git.exe";


//Get the system defined temp directory
const tempDir = os.tmpdir();
//Generate a unique directory name
const tempDirName = "Github-JS";

//Create  the temp directory
const tempDirPath = path.join(tempDir, tempDirName);
fs.mkdirSync(tempDirPath);

const targetDirectory = path.join(tempDirPath, RepositoryInfo.svnRepoName);
fs.mkdirSync(targetDirectory);

console.log('Temporary directory created at: ' + tempDirPath);
console.log("Target Directory is " + targetDirectory);
logger.info('Temporary directory created at: ' + tempDirPath);



//Building the Map of the files to be copied
function byStream() {
   const map = new Map();
   const filePath = "./svn-to-github-js\resources\passwords-projects-names.csv";
const fileLines = fs.readFileSync(filePath, 'UTF-8'.split('\n').slice(1));

fileLines.forEach((line) =>{
    if(line.includes(',')){
        const keyValuePair = line.split(',');
        if(keyValuePair.length >=2) {
            const svnRepoName = keyValuePair[0];
            const gitHubName = keyValuePair[1];
            const RepositoryInfo = new RepositoryInfo();
            RepositoryInfo.setSvnRepoName(svnRepoName);
            RepositoryInfo.setGitHubName(gitHubName);
        };
        map.set(svnRepoName, gitHubName);
        console.log(`snvRepoName = ${svnRepoName} and gitHubName = ${gitHubName}` );
    }else{
        console.warn("Skipping " + line);
        logger.info("Skipping " + line);
    }
});
    return map;
}

function migrateProjects (){
    try{
        const map = byStream();
        for(const repositoryInfo of map.values){
            checkForStartOfGitHubTag(RepositoryInfo);
            if(checkForStartOfGitHubTag(RepositoryInfo)){
                continue;
            }else{
                console.log("Processing " + RepositoryInfo.getSvnRepoName());
                const tempDirsLocation = fs.realpathSync(os.tmpdir());
                const repoDirName = path.join(tempDirsLocation, "Github", RepositoryInfo.getGithubName());
                fs.mkdirSync(repoDirName, {recursive: true});
                const targetDirectory = repoDirName.replace(/\\/g, "/");
            
            //calling methods for the migrations
            gitSvnClone(RepositoryInfo, targetDirectory);
            createGitHubTagsFromSvn(RepositoryInfo, repoDirName);
            listGitHubTags(RepositoryInfo, repoDirName);
            createGitIgnoreFile(RepositoryInfo, repoDirName);
            createRepository(RepositoryInfo);
            addRemoteOrigin(RepositoryInfo, path.of(targetDirectory));
            updatePomFile(RepositoryInfo, targetDirectory, repoDirName);
            pushToGitHub(repoDirName);
            createStartOfGitHubTag(RepositoryInfo, repoDirName);
            pushTags(RepositoryInfo, repoDirName);
            gitStatus(RepositoryInfo, repoDirName);
            console.log("Migration of " + RepositoryInfo.getSvnRepoName() + " completed.");
            logger.info("Migration of " + RepositoryInfo.getSvnRepoName() + " completed.");         
            }
                }
            }catch(error){
                console.error("Error processing file " + error + ".");
                logger.error("Error processing " + RepositoryInfo.getGithubName() + " . Error message: "+ error);
                }
                console.log("done");
                logger.info("done");
            }

function gitSvnClone(RepositoryInfo, targetDirectory){
    logger.info(`Cloning ${RepositoryInfo.getSvnRepoName()} from AVN to GitHub repo ${RepositoryInfo.getGithubName()}`);
    console.log(`Cloning ${RepositoryInfo.getSvnRepoName()} from AVN to GitHub repo ${RepositoryInfo.getGithubName()}`);

    const gitCommand = `git svn clone -s -t tags -b branches -T trunk --log-window-size=5000 --authors-file=./src/main/resources/authors.txt ` +
    `${RepositoryInfo.getSvnUrl()}` + " " + `${targetDirectory}`;

    const processBuilder = exec(`$GIT_BASH} -c "${gitCommand}"` , (error, stdout, stderr) =>{
        if(error){
            console.error("Cloning repository stderr: " = `${stderr}`);
            return;
        }
        if(stderr){
            console.error("Cloning repository stderr: " +` ${stderr}`);
            return;
        }
        console.log("Cloning complete for " + RepositoryInfo.getGithubName());
        logger.info("Cloning complete for " + RepositoryInfo.getGithubName());
            })
        }


 
function createGitIgnoreFile(RepositoryInfo, repoDirName){
    console.log("Creating .gitignore file for: " + RepositoryInfo.getGithubName());

    const ignoreFilePath = path.join(targetDirectory, "/gitignore");
}





//====================== Helper Functions ============================
