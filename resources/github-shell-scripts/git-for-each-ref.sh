 #!bin/bash
  git for-each-ref --format="%(refname:short) %(objectname)" refs/remotes/origin/tags \
                      | while read BRANCH REF
                      do
                            TAG_NAME=${BRANCH#*/*/}
                            BODY="$(git log -1 --format=format:%B $REF)"

                            echo "ref=$REF parent=$(git rev-parse $REF^) tagname=$TAG_NAME body=$BODY" >&2

                            git tag -a -m "$BODY" $TAG_NAME $REF^  &&\
                            git branch -r -d $BRANCH
                      done