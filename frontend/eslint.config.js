import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';

export default [
  {ignores:['dist/**','node_modules/**']},
  {
    files:['src/**/*.{ts,tsx}'],
    languageOptions:{
      parser,
      parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}},
      globals:{window:'readonly',document:'readonly',console:'readonly',localStorage:'readonly',crypto:'readonly',URLSearchParams:'readonly',setTimeout:'readonly',clearTimeout:'readonly',alert:'readonly',confirm:'readonly',fetch:'readonly'}
    },
    plugins:{'@typescript-eslint':tsPlugin,'react-hooks':hooks,'react-refresh':refresh},
    rules:{
      'react-hooks/rules-of-hooks':'error',
      'react-hooks/exhaustive-deps':'off',
      'react-refresh/only-export-components':'off'
    }
  }
];
