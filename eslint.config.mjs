import nextTypescript from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", ".open-next/**", "node_modules/**", "out/**", "public/**", "next-env.d.ts"]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // These effects synchronize browser-only storage, object URLs and form
      // state after hydration. Keep them visible as warnings without blocking
      // the production build.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn"
    }
  }
];

export default config;
