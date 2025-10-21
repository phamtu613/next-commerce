import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extends Next.js recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Global rules (tuỳ chỉnh nếu muốn)
  {
    rules: {
      // Ví dụ: cảnh báo unused-vars nhưng không lỗi build
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Thêm các rule bạn muốn tuỳ chỉnh khác ở đây
    },
  },

  // Overrides cho các file dev tạm thời
  {
    files: ["src/pages/dev/**/*.{ts,tsx}", "src/lib/dev/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // tắt rule cho các file dev
    },
  },
];

export default eslintConfig;
