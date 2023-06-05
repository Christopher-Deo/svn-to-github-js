const os = require('os');
const fs = require('fs');

function createTempDirectory(repositoryInfo) {
    const tempDir = os.tmpdir(); // Get the system's default temp directory

    // Generate a unique directory name
    const tempDirectoryName = "Github_Migration";

    // Create the temp directory
    const tempDirectoryPath = `${tempDir}/${tempDirectoryName}`;
    fs.mkdirSync(tempDirectoryPath);

    // Create repository directories
    const githubRepoName = repositoryInfo.getGitHubName(); // Assuming you have a method to get the GitHub repository name
    const repoDirectoryPath = `${tempDirectoryPath}/${githubRepoName}`;
    fs.mkdirSync(repoDirectoryPath);

    return tempDirectoryPath;
}

module.exports = {
    createTempDirectory,
};
