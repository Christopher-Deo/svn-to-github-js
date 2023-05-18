class RepositoryInfo {
    constructor(svnRepoName, svnUrl, gitHubName, gitHubUrl) {
        this.svnRepoName = svnRepoName;
        this.svnUrl = svnUrl;
        this.gitHubName = gitHubName;
        this.gitHubUrl = gitHubUrl;
    }

    getSvnRepoName() {
        return this.svnRepoName;
    }

    setSvnRepoName(svnRepoName) {
        this.svnRepoName = svnRepoName;
    }

    getSvnUrl() {
        return this.svnUrl;
    }

    setSvnUrl() {
        return "https://archimedes.crlcorp.com/davsvn/SVN/" + this.svnRepoName + "/";
    }

    getGitHubName() {
        return this.gitHubName;
    }

    setGitHubName(gitHubName) {
        this.gitHubName = gitHubName;
    }

    getGitHubUrl() {
        return this.gitHubUrl;
    }

    setGitHubUrl() {
        return "https://github.com/Deo-Test-Org/" + this.gitHubName + ".git";
    }
}

module.exports = RepositoryInfo; 