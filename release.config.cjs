module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        ['@semantic-release/github', {
            assets: ['dist/**/*']
        }],
        ['@semantic-release/git', {
            assets: ['dist/**/*', 'CHANGELOG.md'],
            message: 'chore(release): ${nextRelease.version} [skip ci]'
        }]
    ]
};