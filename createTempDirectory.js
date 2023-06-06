const os = require('os');
const fs = require('fs');

function createTempDirectory() {
    const tempDir = os.tmpdir(); // Get the system's default temp directory

    // Generate a unique directory name
    const tempDirectoryName = "Github_Migration";

    // Create the temp directory if it doesn't exist
    const tempDirectoryPath = `${tempDir}/${tempDirectoryName}`;
    if (!fs.existsSync(tempDirectoryPath)) {
        fs.mkdirSync(tempDirectoryPath);
    }

    // Replace backslashes with forward slashes
    const normalizedPath = tempDirectoryPath.replace(/\\/g, '/');

    return normalizedPath;
}

module.exports = {
    createTempDirectory,
};
