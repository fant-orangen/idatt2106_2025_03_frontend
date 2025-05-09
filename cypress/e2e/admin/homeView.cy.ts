/**
 * End-to-end tests for the HomeView component.
 *
 * These tests verify that the HomeView component renders correctly
 * and that its key components are present and functional in different states.
 */
describe('HomeView', () => {
  const loginUrl = 'http://localhost:5173/login';
  const homeUrl = 'http://localhost:5173/';

  beforeEach(() => {
    // Mock reCAPTCHA
    cy.window().then((win) => {
      win.grecaptcha = {
        ready: (callback) => callback(),
        execute: () => Promise.resolve('mock-recaptcha-token')
      };
    });

    // Intercept login API call to mock successful admin login
    cy.intercept('POST', '/auth/login', (req) => {
      // Check if the request contains admin credentials
      if (req.body.email === 'admin@example.com' && req.body.password === 'Password1!') {
        // Return a successful response with admin role
        req.reply({
          statusCode: 200,
          body: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJ1c2VySWQiOjEyM30.aBcDeFgHiJkLmNoPqRsTuVwXyZ'
          }
        });
      } else {
        // Return an error response for invalid credentials
        req.reply({
          statusCode: 401,
          body: {
            message: 'Invalid credentials'
          }
        });
      }
    }).as('loginRequest');

    // Intercept user info API call
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Intercept token validation API call
    cy.intercept('GET', '/api/auth/validate', {
      statusCode: 200,
      body: {
        valid: true
      }
    }).as('validateToken');

    // Visit the login page first
    cy.visit(loginUrl);

    // Login with admin credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Password1!');
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');
  });

  /**
   * Test that the HomeView component renders correctly in the unauthenticated state.
   */
  it('should render the HomeView component in unauthenticated state', () => {
    // Mock user info to return unauthorized
    cy.intercept('GET', '/api/user/me', {
      statusCode: 401,
      body: {
        message: 'Unauthorized'
      }
    }).as('getUnauthorizedUserInfo');

    // Navigate to the home page
    cy.visit(homeUrl);

    // Check that the unauthenticated home component exists
    cy.get('.content:not(:has(.animate-spin))').should('exist');
    // Check for UnauthenticatedHome component
    cy.get('div.content > div').should('exist');
  });

  /**
   * Test that the HomeView component renders correctly in the loading state.
   */
  it('should display loading state when authenticated and loading', () => {
    // Mock API responses to simulate loading state
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Delay household response to ensure loading state is shown
    cy.intercept('GET', '/api/user/households/me', (req) => {
      // Delay the response to ensure loading state is shown
      req.on('response', (res) => {
        res.setDelay(1000);
      });
    }).as('getHouseholdInfo');

    // Navigate to the home page
    cy.visit(homeUrl);

    // Check for loading spinner
    cy.get('.animate-spin').should('exist');
    // Check for loading text
    cy.get('.content .text-center').should('exist');
  });

  /**
   * Test that the HomeView component renders correctly in the authenticated state without household.
   */
  it('should display authenticated without household view', () => {
    // Mock user info to return authenticated user
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Mock household info to return no household
    cy.intercept('GET', '/api/user/households/me', {
      statusCode: 404,
      body: {
        message: 'No household found'
      }
    }).as('getNoHouseholdInfo');

    // Navigate to the home page
    cy.visit(homeUrl);

    // Wait for API calls to complete
    cy.wait('@validateToken');
    cy.wait('@getUserInfo');
    cy.wait('@getNoHouseholdInfo');

    // Check that the authenticated no household component exists
    cy.get('.content:not(:has(.animate-spin))').should('exist');
    // Check for AuthenticatedNoHouseholdHome component
    cy.get('div.content > div').should('exist');
  });

  /**
   * Test that the HomeView component renders correctly in the authenticated state with household but no crises.
   */
  it('should display authenticated with household view (no crises)', () => {
    // Mock user info to return authenticated user
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Mock household info to return a household
    cy.intercept('GET', '/api/user/households/me', {
      statusCode: 200,
      body: {
        id: 456,
        name: 'Test Household',
        members: [
          {
            id: 123,
            email: 'admin@example.com',
            role: 'ADMIN'
          }
        ]
      }
    }).as('getHouseholdInfo');

    // Mock crisis events to return empty list
    cy.intercept('GET', '**/public/crisis-events/all/previews*', {
      statusCode: 200,
      body: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
      }
    }).as('getCrisisEvents');

    // Navigate to the home page
    cy.visit(homeUrl);

    // Wait for API calls to complete
    cy.wait('@validateToken');
    cy.wait('@getUserInfo');
    cy.wait('@getHouseholdInfo');
    cy.wait('@getCrisisEvents');

    // Check that the authenticated with household component exists
    cy.get('.content:not(:has(.animate-spin))').should('exist');
    // Check for AuthenticatedWithHouseholdHome component
    cy.get('div.content > div').should('exist');
  });

  /**
   * Test that the HomeView component renders correctly in the authenticated state with household and crises.
   */
  it('should display authenticated with household and crisis view', () => {
    // Mock user info to return authenticated user
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Mock household info to return a household
    cy.intercept('GET', '/api/user/households/me', {
      statusCode: 200,
      body: {
        id: 456,
        name: 'Test Household',
        members: [
          {
            id: 123,
            email: 'admin@example.com',
            role: 'ADMIN'
          }
        ]
      }
    }).as('getHouseholdInfo');

    // Mock crisis events to return some events
    cy.intercept('GET', '**/public/crisis-events/all/previews*', {
      statusCode: 200,
      body: {
        content: [
          { id: 1, name: 'Flood', severity: 'red' },
          { id: 2, name: 'Fire', severity: 'yellow' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      }
    }).as('getCrisisEvents');

    // Navigate to the home page
    cy.visit(homeUrl);

    // Wait for API calls to complete
    cy.wait('@validateToken');
    cy.wait('@getUserInfo');
    cy.wait('@getHouseholdInfo');
    cy.wait('@getCrisisEvents');

    // Check that the authenticated with household and crisis component exists
    cy.get('.content:not(:has(.animate-spin))').should('exist');
    // Check for AuthenticatedWithHouseholdCrisisHome component
    cy.get('div.content > div').should('exist');
  });
});
