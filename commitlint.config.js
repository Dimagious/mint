export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'chore', 'docs', 'build', 'ci'],
    ],
    'scope-enum': [
      2,
      'always',
      ['core', 'editor', 'ui', 'web', 'tooling', 'docker', 'root'],
    ],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
  },
};
