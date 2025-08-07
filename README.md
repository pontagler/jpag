# 📚 Angular CLI Commands – Angular v20

This guide provides a **comprehensive list of Angular CLI (`ng`) commands** for **Angular v20**, including generators, development tools, testing, linting, and configuration utilities.

> ✅ Compatible with **Angular 17+**, especially **v20** using **standalone components**, **ESBuild**, and **modern tooling**.

---

## 🔧 Core Commands

| Command | Description |
|--------|-------------|
| `ng new <project-name>` | Creates a new Angular workspace and app. |
| `ng generate <schematic> <name>` or `ng g <schematic> <name>` | Generates code using schematics (e.g., components, services). |
| `ng serve` or `ng serve --port=4200` | Starts dev server at `http://localhost:4200`. |
| `ng build` | Compiles app into `dist/` folder (production-ready). |
| `ng test` | Runs unit tests with Karma. |
| `ng e2e` | Runs end-to-end (E2E) tests (Cypress/Playwright). |
| `ng lint` | Lints code using ESLint. |
| `ng format` | Formats code using Angular’s built-in formatter. |
| `ng update` | Updates Angular packages to newer versions. |
| `ng add <package>` | Adds a package and runs setup schematics (e.g., `ng add @angular/material`). |
| `ng version` or `ng v` | Shows Angular CLI and project versions. |
| `ng help [command]` | Displays help for CLI commands. |
| `ng config` | Gets, sets, or removes CLI configuration values. |
| `ng doc <keyword>` | Opens Angular docs in browser (e.g., `ng doc HttpClient`). |

---

## 🧱 Code Generation (`ng generate` or `ng g`)

### 📁 Application & Workspace
| Command | Purpose |
|--------|--------|
| `ng g application <name>` | Creates a new standalone app in a monorepo. |
| `ng g library <name>` | Creates a publishable Angular library. |
| `ng g workspace <name>` | Creates a blank workspace (no app). |

---

### 💡 Components
| Command | Purpose |
|--------|--------|
| `ng g component <name>` | Creates a component with `.ts`, `.html`, `.scss`, `.spec.ts`. |
| `ng g component <name> --standalone` | Creates a standalone component (no NgModule). |
| `ng g component <name> --skip-tests` | Skips `.spec.ts` file. |
| `ng g component <name> --style=none` | No style file. |
| `ng g component <name> --inline-template` | Template in `.ts` file. |
| `ng g component <name> --inline-style` | Styles in `.ts` file. |
| `ng g component <name> --route=path --module=app` | Auto-adds route to router. |

---

### ⚙️ Services
| Command | Purpose |
|--------|--------|
| `ng g service <name>` | Creates a service class. |
| `ng g service <name> --provided-in=root` | Registers service in root injector. |
| `ng g service <name> --skip-tests` | Skips spec file. |

---

### 🔌 Directives & Pipes
| Command | Purpose |
|--------|--------|
| `ng g directive <name>` | Creates a directive. |
| `ng g pipe <name>` | Creates a pipe. |
| `ng g guard <name>` | Creates a route guard (`CanActivate`, `CanDeactivate`, etc.). |
| `ng g resolver <name>` | Creates a route resolver. |
| `ng g interceptor <name>` | Creates an HTTP interceptor. |

---

### 📂 Classes, Interfaces, Enums
| Command | Purpose |
|--------|--------|
| `ng g class <name>` | Creates a TypeScript class. |
| `ng g interface <name>` | Creates a TypeScript interface. |
| `ng g enum <name>` | Creates a TypeScript enum. |
| `ng g class <name> --type=model` | Creates `user.model.ts` (convention). |

---

### 🧩 Modules & Routing
| Command | Purpose |
|--------|--------|
| `ng g module <name>` | Creates an NgModule. |
| `ng g module <name> --routing` | Creates module with a routing file. |

---

## 🛠️ Development & Build

| Command | Purpose |
|--------|--------|
| `ng build` | Builds app for production (`dist/`). |
| `ng build --configuration=production` | Production build (minified, optimized). |
| `ng build --watch` | Rebuilds on file changes. |
| `ng serve` | Starts dev server. |
| `ng serve --open` | Opens browser automatically. |
| `ng serve --port=4300` | Custom port. |
| `ng serve --ssl` | Serve over HTTPS. |
| `ng serve --host=0.0.0.0` | Make accessible on local network. |

---

## 🧪 Testing

| Command | Purpose |
|--------|--------|
| `ng test` | Run unit tests (Karma). |
| `ng test --watch=false` | Run once (for CI/CD). |
| `ng test --code-coverage` | Generate coverage report (`coverage/` folder). |
| `ng e2e` | Run E2E tests. |
| `ng e2e --headless` | Run E2E in headless mode. |

---

## 🧹 Linting & Formatting

| Command | Purpose |
|--------|--------|
| `ng lint` | Run ESLint on project. |
| `ng lint --fix` | Fix lint issues automatically. |
| `ng format` | Format code using Angular’s formatter. |
| `ng format --check` | Check formatting (use in CI/CD). |

---

## 🔐 Configuration & Utilities

| Command | Purpose |
|--------|--------|
| `ng config` | Get/set CLI config (e.g., defaults). |
| `ng update` | Upgrade packages (e.g., `ng update @angular/core`). |
| `ng add <package>` | Add package with setup (e.g., `ng add @angular/fire`). |
| `ng deploy` | Deploys app (if builder is installed, like `@angular/fire`). |
| `ng run <project>:<target>` | Run custom target (e.g., `ng run myapp:extract-i18n`). |
| `ng xi18n` | Extracts i18n messages for translation. |

---

## 🎯 Pro Tips & Best Practices

### ✅ Use `--dry-run` to Preview Changes
```bash
ng g component user --dry-run