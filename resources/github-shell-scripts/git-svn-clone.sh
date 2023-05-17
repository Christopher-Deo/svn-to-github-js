!#!bin/bash
git svn clone -s -t tags -b branches -T trunk --prefix=svn/ --log-window-size=1000 --authors-file=./src/main/resources/authors.txt  RepositoryInfo.svnRepoUrl  targetDirectory