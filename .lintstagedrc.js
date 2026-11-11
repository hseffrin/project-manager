module.exports = {
  "*.!(js|jsx|ts|tsx|mjs|cjs)":
    "prettier --ignore-unknown --ignore-path ./.prettierignore --write",
  "*.(js|jsx|ts|tsx|mjs|cjs)": [
    "eslint --fix",
    "prettier --ignore-unknown --ignore-path ./.prettierignore --write",
  ],
};
