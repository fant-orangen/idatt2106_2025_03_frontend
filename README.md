# Krisefikser Frontend

This project is the frontend for the **Krisefikser** application, built using **Vue 3** and **Vite**. The application is designed to help users prepare for and manage crisis situations by providing information, tools, and resources.

---

## Table of Contents

- [Recommended IDE Setup](#recommended-ide-setup)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Setup](#project-setup)
  - [Install Dependencies](#install-dependencies)
  - [Development](#development)
  - [Production](#production)
  - [Testing](#testing)
- [Folder Structure](#folder-structure)
- [Localization](#localization)
- [Linting and Formatting](#linting-and-formatting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Recommended IDE Setup

For the best development experience, use:

- [VSCode](https://code.visualstudio.com/)
- Install the [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed).
- Enable TypeScript support for `.vue` files using Volar.

---

## Features

- **Crisis Management Tools**: Tools to manage and prepare for crises like pandemics, extreme weather, and more.
- **Localization**: Supports multiple languages (e.g., English and Norwegian).
- **Interactive Map**: Displays points of interest (POIs) like shelters, water sources, and medical facilities.
- **Household Management**: Allows users to create and manage households for shared preparedness.
- **Admin Panel**: Tools for administrators to manage events, POIs, and activities.
- **Dark Mode**: Fully supports light and dark themes.

---

## Technologies Used

- **Vue 3**: Progressive JavaScript framework.
- **Vite**: Fast build tool and development server.
- **TypeScript**: Strongly typed JavaScript for better maintainability.
- **TailwindCSS**: Utility-first CSS framework.
- **Vue I18n**: Internationalization plugin for localization.
- **Cypress**: End-to-end testing framework.
- **Vitest**: Unit testing framework.
- **ESLint**: Linting tool for code quality.

---

## Project Setup

### Install Dependencies

```sh
npm install
```

### Development

#### Compile and Hot-Reload

Start the development server:

```sh
npm run dev
```

### Production

#### Type-Check, Compile, and Minify

Build the project for production:

```sh
npm run build
```

### Testing

#### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

#### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

For development server testing:

```sh
npm run test:e2e:dev
```

For production build testing:

```sh
npm run build
npm run test:e2e
```

---

## Folder Structure

```
src/
├── assets/          # Static assets (CSS, images, etc.)
├── components/      # Reusable Vue components
├── locales/         # Localization files (e.g., en-US.json, nb-NO.json)
├── models/          # TypeScript interfaces and types
├── router/          # Vue Router configuration
├── services/        # API service files
├── stores/          # Pinia state management
├── utils/           # Utility functions
├── views/           # Page-level components
├── App.vue          # Root Vue component
├── main.ts          # Application entry point
```

---

## Localization

This project supports multiple languages using **Vue I18n**. The localization files are located in the locales directory.

- **English**: en-US.json
- **Norwegian**: nb-NO.json

To add a new language, create a new JSON file in the `locales` folder and update the `i18n.ts` configuration.

---

## Linting and Formatting

This project uses **ESLint** for linting and **Prettier** for code formatting.

### Run Linting

```sh
npm run lint
```

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request.

Please ensure your code follows the project's linting and formatting rules.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For questions or support, contact us at: **mageik@stud.ntnu.no**

---

Enjoy building with **Krisefikser Frontend**! 🚀
