

class RepositoryInfo {
    constructor(gitHubName, team, svnUrl, org, gitHubUrl) {
        this._gitHubName = gitHubName;
        // this.gitHubUrl = gitHubUrl;
        this.team = team;
        // this.svnUrl = svnUrl;
        // this.org = org;
    }

    get gitHubName() {
        return this._gitHubName;
    }

    set gitHubName(value) {
        this._gitHubName = value;
    }

    
    getTeam() {
        return this.team;
    }

    setTeam(value) {
        this.team = value;
    }
    /*
    getGitHubUrl() {
        return this.gitHubUrl;
    }

    setGitHubUrl(value) {
        this.gitHubUrl = `https://github.com/ ${applicationProperties.org}` + "/" + ` ${gitHubName}`;
    }

    getOrganization() {
        return this.org;
    }

    setOrganization(value) {
        this.org = process.env.GITHUB_ORG;
    }


    getSvnUrl() {
        return this.svnUrl;
    }

    setSvnUrl(svnRepoName) {
        this.svnUrl = this.svnUrl = process.env.SVN_URL + svnRepoName;;
    }
    */
}

module.exports = RepositoryInfo;
