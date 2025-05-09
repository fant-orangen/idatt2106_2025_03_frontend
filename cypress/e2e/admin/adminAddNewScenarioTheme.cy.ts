/**
 * End-to-end tests for the AdminAddNewScenarioTheme component.
 *
 * These tests verify that the AdminAddNewScenarioTheme component renders correctly
 * and that its key components are present and functional.
 */
describe('AdminAddNewScenarioTheme', () => {
  const loginUrl = 'http://localhost:5173/login';
  const adminAddNewScenarioThemeUrl = 'http://localhost:5173/admin/add-new-scenario-theme';

  beforeEach(() => {
    // Mock reCAPTCHA
    cy.window().then((win) => {
      win.grecaptcha = {
        ready: (callback) => callback(),
        execute: () => Promise.resolve('mock-recaptcha-token')
      };
    });

    // Intercept login API call to mock successful admin login
    cy.intercept('POST', '/api/auth/login', (req) => {
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
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: {
        id: 123,
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }).as('getUserInfo');

    // Visit the login page first
    cy.visit(loginUrl);

    // Login with admin credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Password1!');
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Navigate to the AdminAddNewScenarioTheme page
    cy.visit(adminAddNewScenarioThemeUrl);
  });

  /**
   * Test that the AdminAddNewScenarioTheme component renders correctly.
   */
  it('should render the AdminAddNewScenarioTheme component', () => {
    // Check that we're on the correct page
    cy.url().should('include', '/admin/add-new-scenario-theme');

    // Check that the form exists
    cy.get('form').should('exist');
  });

  /**
   * Test that the breadcrumb navigation is present.
   */
  it('should display breadcrumb navigation', () => {
    cy.get('[data-testid="breadcrumb"], .breadcrumb, nav').should('exist');
  });

  /**
   * Test that the form fields are present.
   */
  it('should display all required form fields', () => {
    // Check for name input
    cy.get('input').should('exist');

    // Check for description textarea
    cy.get('textarea').should('have.length.at.least', 4);

    // Check for submit button
    cy.get('button[type="submit"]').should('exist');
  });

  /**
   * Test basic form interaction.
   */
  it('should allow basic form interaction', () => {
    // Type in name
    cy.get('input').type('Test Scenario Theme');

    // Type in description
    cy.get('textarea').first().type('This is a test scenario theme description with more than 10 characters');

    // Type in before crisis instructions
    cy.get('textarea').eq(1).type('These are the before crisis instructions with more than 10 characters');

    // Type in during crisis instructions
    cy.get('textarea').eq(2).type('These are the during crisis instructions with more than 10 characters');

    // Type in after crisis instructions
    cy.get('textarea').eq(3).type('These are the after crisis instructions with more than 10 characters');

    // Form should still be valid
    cy.get('form').should('exist');
  });

  /**
   * Test form submission with mock API response.
   */
  it('should handle form submission', () => {
    // Intercept the form submission API call
    cy.intercept('POST', '**/admin/scenario-themes', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test Scenario Theme',
        description: 'Test Description'
      }
    }).as('createScenarioTheme');

    // Fill out the form with minimum required fields
    cy.get('input').type('Test Scenario Theme');
    cy.get('textarea').first().type('This is a test scenario theme description with more than 10 characters');
    cy.get('textarea').eq(1).type('These are the before crisis instructions with more than 10 characters');
    cy.get('textarea').eq(2).type('These are the during crisis instructions with more than 10 characters');
    cy.get('textarea').eq(3).type('These are the after crisis instructions with more than 10 characters');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call and check it was made
    cy.wait('@createScenarioTheme').its('request.body').should('not.be.empty');
  });
});
