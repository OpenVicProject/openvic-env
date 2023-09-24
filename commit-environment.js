module.exports = async ({github, context, core}) => {
    const commit_name = 'OPENVIC_COMMIT';
    const tag_name = 'OPENVIC_TAG';
    const release_name = 'OPENVIC_RELEASE';
    var commit_sha = process.env["GITHUB_SHA"];

    if(context.eventName === 'pull_request') {
        commit_sha = context.payload.pull_request.head.sha;
    }

    core.exportVariable(commit_name, commit_sha);

    try {
        const release = await github.rest.repos.getLatestRelease({owner: context.repo.owner, repo: context.repo.repo});
        core.exportVariable(tag_name, release.data["tag_name"]);
        core.exportVariable(release_name, release.data["name"]);
    } catch(error) {
        if (error.response.status != 404) throw error;

        const tagList = await github.rest.repos.listTags({owner: context.repo.owner, repo: context.repo.repo});
        if (tagList.data.length == 0) {
            core.warning("Could not list tags, this repo has no tags on it, setting tag_name and release_name environment variables to '<UserRepo-NoTag>' and '<UserRepo-NoRelease>', you can fetch tags with 'git fetch --tags' <remote-name>' and push tags with 'git push --tags");
            core.exportVariable(tag_name, `<${context.repo.owner}/${context.repo.repo}-NoTag>`);
            core.exportVariable(release_name, `<${context.repo.owner}/${context.repo.repo}-NoRelease>`);
        } else {
            core.exportVariable(tag_name, tagList.data[0].name);
            core.exportVariable(release_name, tagList.data[0].name);
        }
    }
}