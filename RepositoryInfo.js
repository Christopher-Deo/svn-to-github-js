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

    setSvnRepoName(){
        return this.svnRepoName
    }

    getSvnUrl() {
        return this.svnUrl;
    }

    setSvnUrl(){
        return "https://archimedes.crlcorp.com/davsvn/SVN/" + this.svnRepoName + "/";
    }

    getGitHubName() {
        return this.gitHubName;
    }
    
    setGitHubName(){
        return this.gitHubName;
    }

    getGitHubUrl() {    
        return this.gitHubUrl;
    }
    
    setGitHubUrl(){
        return "https://github.com/Deo-Test-Org" + this.getGitHubName + ".git";
    }

}