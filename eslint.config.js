import js from "@eslint/js";
import boundariesPlugin from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  // Global ignores
  {
    ignores: [
      ".expo/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "android/**",
      "ios/**",
      "*.config.js",
      "*.config.ts",
      ".claude/**",
    ],
  },

  // Base configuration for all TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-native": reactNative,
      boundaries: boundariesPlugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        React: "readonly",
        JSX: "readonly",
        __DEV__: "readonly",
      },
    },
    settings: {
      // Define architectural boundaries
      "boundaries/elements": [
        // ============================================
        // ROOT LEVEL FILES (app/ directory - Expo Router)
        // ============================================
        {
          type: "app-entry",
          pattern: "app/**/*.{ts,tsx}",
          mode: "file",
        },

        // ============================================
        // HEXAGONAL ARCHITECTURE LAYERS
        // ============================================
        {
          type: "domain",
          pattern: "src/domain/**/*.{ts,tsx}",
          mode: "file",
        },
        {
          type: "application",
          pattern: "src/application/**/*.{ts,tsx}",
          mode: "file",
        },
        {
          type: "infrastructure",
          pattern: "src/infrastructure/**/*.{ts,tsx}",
          mode: "file",
        },

        // ============================================
        // PRESENTATION LAYER ELEMENTS
        // ============================================
        {
          type: "presentation-core",
          pattern: "src/presentation/core/**/*.{ts,tsx}",
          mode: "file",
        },
        {
          type: "presentation-shared",
          pattern: "src/presentation/shared/**/*.{ts,tsx}",
          mode: "file",
        },
        {
          type: "presentation-features",
          pattern: "src/presentation/features/**/*.{ts,tsx}",
          mode: "file",
          capture: ["featureName"],
        },
        {
          type: "presentation-lib",
          pattern: "src/presentation/lib/**/*.{ts,tsx}",
          mode: "file",
        },
        {
          type: "presentation-assets",
          pattern: "src/presentation/assets/**/*.{ts,tsx,svg,png,jpg}",
          mode: "file",
        },
      ],
      "boundaries/ignore": [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "jest.config.js",
        "jest.setup.js",
      ],
    },
    rules: {
      // ============================================
      // IMPORT ORGANIZATION
      // ============================================
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React and external packages
            ["^react", "^@?\\w"],
            // Domain layer
            ["^@domain"],
            // Application layer
            ["^@application"],
            // Infrastructure layer
            ["^@infrastructure"],
            // Presentation aliases
            ["^~/core", "^~/shared", "^~/features"],
            // Other presentation imports
            ["^~"],
            // Relative imports
            ["^\\."],
            // Style imports
            ["^.+\\.css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      // Import validation
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",

      // React hooks
      ...reactHooks.configs["recommended-latest"].rules,

      // React Native
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",

      // ============================================
      // HEXAGONAL ARCHITECTURE RULES
      // ============================================
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // APP ENTRY: Expo Router files (app/ directory)
            {
              from: "app-entry",
              allow: [
                "domain",
                "application",
                "infrastructure",
                "presentation-core",
                "presentation-shared",
                "presentation-features",
                "presentation-lib",
              ],
              message:
                "Expo Router files (app/) can import from any layer. These are the application entry points.",
            },

            // DOMAIN LAYER: Pure business logic - NO external dependencies
            {
              from: "domain",
              allow: ["domain"],
              message:
                "Domain layer can only import from domain layer. No infrastructure, application, or presentation dependencies allowed. Keep business logic pure.",
            },

            // APPLICATION LAYER: Use case implementations
            {
              from: "application",
              allow: ["domain", "application"],
              message:
                "Application layer can only import from domain and application layers. No infrastructure or presentation dependencies. Use cases orchestrate domain logic.",
            },

            // INFRASTRUCTURE LAYER: External adapters and implementations
            {
              from: "infrastructure",
              allow: ["domain", "application", "infrastructure"],
              message:
                "Infrastructure layer can import from domain (interfaces), application (use case interfaces), and infrastructure. No presentation dependencies.",
            },

            // ============================================
            // PRESENTATION LAYER RULES
            // ============================================

            // CORE: Dependency injection and global utilities
            {
              from: "presentation-core",
              allow: [
                "domain",
                "application",
                "infrastructure",
                "presentation-core",
              ],
              message:
                "Presentation core can import from domain (types), application (use cases), infrastructure (for DI setup), and other core modules. No dependencies on features, shared, or routes.",
            },

            // SHARED: Generic cross-domain components
            {
              from: "presentation-shared",
              allow: ["domain", "presentation-core", "presentation-shared"],
              message:
                "Shared components can only import from domain (for types), core (for hooks/utils), and other shared components. No dependencies on specific features, routes, or direct infrastructure.",
            },

            // FEATURES: Feature-specific components and logic
            {
              from: "presentation-features",
              allow: [
                "domain",
                "application",
                "presentation-core",
                "presentation-shared",
                "presentation-features",
              ],
              message:
                "Feature components can import from domain (types), application (use case interfaces), core (DI, hooks, utils), shared (generic components), and other features. Use DI for infrastructure access.",
            },

            // LIB: Global stores and utilities
            {
              from: "presentation-lib",
              allow: ["domain", "presentation-core", "presentation-lib"],
              message:
                "Presentation lib can import from domain (types), core (utils), and other lib modules. Used for global stores and i18n.",
            },

            // ASSETS: Static assets (images, SVGs, etc.)
            {
              from: "presentation-assets",
              allow: ["presentation-assets"],
              message:
                "Assets folder contains only static files (images, SVGs). No TypeScript imports should originate from here.",
            },
          ],
        },
      ],

      // Additional boundary checks
      "boundaries/no-unknown-files": "error",

      // ============================================
      // DEPENDENCY INJECTION ENFORCEMENT
      // ============================================
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/repositories/**"],
              message:
                "Do not import repositories directly. Use dependency injection via UseCaseProvider (~/core/providers/use-case-provider).",
            },
            {
              group: ["../../**", "../../../**"],
              message:
                "Do not use deep relative imports. Use path aliases instead: ~/ for presentation, @domain/, @application/, @infrastructure/.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // PRESENTATION LAYER SPECIFIC RULES
  // ============================================

  // All presentation files
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/repositories/**"],
              message:
                "Presentation layer should not import repositories directly. Use dependency injection via UseCaseProvider.",
            },
            {
              group: ["**/application/usecases/**/!(*.ts)"],
              message:
                "Do not import use case implementations directly. Import interfaces from domain layer and use DI.",
            },
          ],
        },
      ],
    },
  },

  // Feature screens (similar to containers in web)
  {
    files: ["src/presentation/features/**/screens/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      // Screens MUST use dependency injection
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "NewExpression[callee.name=/Repository/], NewExpression[callee.name=/UseCase/]",
          message:
            "Screens should not instantiate repositories or use cases directly. Use useUseCases() hook from UseCaseProvider.",
        },
      ],
    },
  },

  // Feature components (presentational)
  {
    files: ["src/presentation/features/**/components/**/*.{ts,tsx}"],
    rules: {
      // Components should NOT use useUseCases - only screens can
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/core/providers/use-case-provider*"],
              message:
                "Feature components should not use useUseCases hook. All business logic belongs in screens. Components are pure presentational.",
            },
            {
              group: ["**/infrastructure/**"],
              message:
                "Feature components should not import from infrastructure. All data should come from screen props.",
            },
            {
              group: ["**/application/**"],
              message:
                "Feature components should not import from application layer. All logic should be in screens.",
            },
          ],
        },
      ],
    },
  },

  // Expo Router route components (app/ directory)
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      // Routes should be relatively small
      "max-lines": [
        "warn",
        {
          max: 150,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // Hooks (both core and feature hooks)
  {
    files: [
      "src/presentation/core/hooks/**/*.{ts,tsx}",
      "src/presentation/features/**/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Core hooks (generic only)
  {
    files: ["src/presentation/core/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/**"],
              message:
                "Core hooks should be generic and not depend on specific features.",
            },
            {
              group: ["**/infrastructure/**"],
              message: "Core hooks should not import infrastructure directly.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // DOMAIN LAYER SPECIFIC RULES
  // ============================================
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      // Domain should NEVER import from infrastructure or presentation
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/**"],
              message:
                "Domain layer must not depend on infrastructure. Define interfaces/contracts that infrastructure implements.",
            },
            {
              group: ["**/presentation/**"],
              message:
                "Domain layer must not depend on presentation. Domain is pure business logic.",
            },
            {
              group: ["axios", "fetch", "@tanstack/**", "expo-*"],
              message:
                "Domain layer should not import HTTP libraries or Expo modules. Define repository interfaces instead.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // APPLICATION LAYER SPECIFIC RULES
  // ============================================
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/repositories/**"],
              message:
                "Application use cases should depend on domain repository interfaces, not concrete infrastructure implementations.",
            },
            {
              group: ["**/presentation/**"],
              message:
                "Application layer must not depend on presentation. Use cases are UI-agnostic.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // INFRASTRUCTURE LAYER SPECIFIC RULES
  // ============================================
  {
    files: ["src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/presentation/**"],
              message:
                "Infrastructure layer must not depend on presentation. Infrastructure provides implementations for domain contracts.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // SHARED COMPONENTS RULES
  // ============================================
  {
    files: ["src/presentation/shared/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/**"],
              message:
                "Shared components should not depend on specific features. Keep them generic and reusable.",
            },
            {
              group: ["**/routes/**"],
              message: "Shared components should not import from routes.",
            },
          ],
        },
      ],
    },
  },

  // ============================================
  // TEST FILES
  // ============================================
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      // Tests can import anything for mocking purposes
      "no-restricted-imports": "off",
      "boundaries/element-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
]);
