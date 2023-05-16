

export default class RepositoryInfo {
    constructor(svnRepoName, svnUrl, gitHubName, gitHubUrl) {
        this.svnRepoName = this.svnRepoName;
        this.svnUrl = this.svnUrl;
        this.gitHubName = this.gitHubName;
        this.gitHubUrl = this.gitHubUrl;
    }
 
    getSvnRepoName() {
        return this.svnProjectName;
    }


    getSvnUrl() {
        return this.svnUrl;
    }

    getGitHubName() {
        return this.gitHubName;
    }

    getGitHubUrl() {    
        return this.gitHubUrl;
    }
    

}