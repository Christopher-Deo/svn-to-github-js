require('dotenv').config();

class ApplicationProperties {
    constructor() {
        this.gitBash = "c:/Program Files/Git/git-bash.exe";
        this.binBash = "c:/Program Files/Git/bin/bash.exe";
        this.git = "c:/Program Files/Git/bin/git.exe";
        this.scriptPath = "./resources/github-shell-scripts";
        this.authorFile = "C:\\Users\\deoc\\Coding Projects\\svn-to-github-js-main\\svn-to-github-js-main\\resources\\authors.txt";
        this.githubUserCredentials = process.env.GITHUB_USER_CREDENTIALS;
        this.githubUsername = process.env.GITHUB_USERNAME;
        this.githubToken = process.env.GITHUB_TOKEN;
        this.apiBaseUrl = "https://api.";
        this.githubHost = "github.com";
        this.svnBaseUrl = process.env.SVN_BASE_URL;
        this.svnUsername = process.env.SVN_USERNAME;
        this.svnPassword = process.env.SVN_PASSWORD;
    }

    
}

const applicationProperties = new ApplicationProperties();
module.exports = applicationProperties;

/*
using this file:
import applicationProperties from './applicationProperties.js';

// Access configuration values
console.log(applicationProperties.gitBash);
console.log(applicationProperties.githubToken);
console.log(applicationProperties.getSvnUrl('my-repo'));

// Update configuration values
applicationProperties.githubToken = 'your-token';
applicationProperties.svnUsername = 'your-username';
*/