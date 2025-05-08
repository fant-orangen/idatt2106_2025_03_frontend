/**
 * End-to-end tests for the login functionality.
 *
 * These tests verify the complete login flow, including:
 * - Standard login with valid credentials
 * - Login with invalid credentials
 * - Password reset workflow
 * - Two-factor authentication (2FA) workflow
 * - Form validation
 * - UI elements visibility and behavior
 */
describe('Login Page', () => {
  // Use the baseUrl from cypress.config.ts
  const loginUrl = 'http://localhost:5173/login';


  beforeEach(() => {
    // Visit the login page before each test
    cy.visit(loginUrl);

    // Intercept API calls to mock responses
    cy.intercept('POST', '/auth/login', (req) => {
      // Check if the request contains valid credentials
      if (req.body.email === 'alice@example.com' && req.body.password === 'password') {
        // Return a successful response for valid credentials
        req.reply({
          statusCode: 200,
          body: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MTIzfQ.aBcDeFgHiJkLmNoPqRsTuVwXyZ'
          }
        });
      } else if (req.body.email === '2fa@example.com' && req.body.password === 'password') {
        // Return a 2FA required response
        req.reply({
          statusCode: 202,
          body: {
            message: '2FA code required'
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
    });

    // Intercept 2FA code sending
    cy.intercept('POST', '/auth/send-2fa', {
      statusCode: 200,
      body: {
        message: '2FA code sent'
      }
    });

    // Intercept 2FA verification
    cy.intercept('POST', '/auth/verify-2fa', (req) => {
      // Check if the request contains the correct code
      if (req.body.code === 123456) {
        req.reply({
          statusCode: 200,
          body: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MTIzfQ.aBcDeFgHiJkLmNoPqRsTuVwXyZ'
          }
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Invalid 2FA code'
          }
        });
      }
    });

    // Intercept password reset
    cy.intercept('POST', '/auth/reset-password', {
      statusCode: 200,
      body: {
        message: 'Password reset email sent'
      }
    });
  });

  /**
   * Test for successful login with valid credentials.
   *
   * This test verifies that a user can successfully log in with valid credentials
   * and is redirected to the home page after login.
   */
  it('should log in with valid credentials', () => {
    // Get the email and password input fields and type in the credentials
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('password');

    // Click the submit button
    cy.get('button[type="submit"]').click();

    // Assert that the user is redirected to the home page after successful login
    cy.url().should('not.include', '/login');

    // Local storage should contain the token
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.exist;
    });
  });

  /**
   * Test for login attempt with invalid credentials.
   *
   * This test verifies that an appropriate error message is displayed
   * when a user attempts to log in with invalid credentials.
   */
  it('should display an error message with invalid credentials', () => {
    // Get the email and password input fields and type in invalid credentials
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');

    // Click the submit button
    cy.get('button[type="submit"]').click();

    // Assert that an error message is displayed
    cy.get('.error').should('be.visible');
    cy.get('.error').should('contain', 'invalid-credentials');
  });

  /**
   * Test for form validation.
   *
   * This test verifies that the login form validates input fields
   * and prevents submission with empty fields.
   */
  it('should validate form fields', () => {
    // Try to submit the form without entering any data
    cy.get('button[type="submit"]').click();

    // Form should not be submitted, we should still be on the login page
    cy.url().should('include', '/login');

    // Enter only email and try to submit
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('button[type="submit"]').click();

    // Form should still not be submitted
    cy.url().should('include', '/login');

    // Clear email and enter only password
    cy.get('input[type="email"]').clear();
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Form should still not be submitted
    cy.url().should('include', '/login');
  });

  /**
   * Test for password visibility toggle.
   *
   * This test verifies that the password visibility toggle button
   * correctly changes the password field type between 'password' and 'text'.
   */
  it('should toggle password visibility', () => {
    // Enter a password
    cy.get('input[type="password"]').type('password');

    // Password should be hidden initially
    cy.get('input[type="password"]').should('exist');

    // Click the eye icon to show password
    cy.get('button[type="button"]').find('.lucide-eye').parent().click();

    // Password should now be visible
    cy.get('input[type="text"]').should('exist');

    // Click the eye-off icon to hide password again
    cy.get('button[type="button"]').find('.lucide-eye-off').parent().click();

    // Password should be hidden again
    cy.get('input[type="password"]').should('exist');
  });

  /**
   * Test for password reset workflow.
   *
   * This test verifies that a user can initiate the password reset process
   * and receive a confirmation message.
   */
  it('should handle password reset workflow', () => {
    // Click the forgot password link (it's a button with variant="link")
    cy.get('button[variant="link"]').contains('Forgot Password').click();
    // If the above selector doesn't work, try this alternative
    // cy.contains('Forgot Password').click();

    // Dialog should be visible
    cy.get('[role="dialog"]').should('be.visible');

    // Enter the email
    cy.get('[role="dialog"]').find('input[type="email"]').type('alice@example.com');

    // Click the reset password button
    cy.get('[role="dialog"]').contains('Reset Password').click();

    // Assert that the toast notification is displayed
    cy.get('.sonner-toast').should('be.visible');
    cy.get('.sonner-toast').should('contain', 'Password reset email sent');
  });

  /**
   * Test for two-factor authentication workflow.
   *
   * This test verifies that a user is prompted for a 2FA code when required,
   * and can successfully complete the login process after entering the correct code.
   */
  it('should handle 2FA workflow with correct code', () => {
    // Enter email and password for an account that requires 2FA
    cy.get('input[type="email"]').type('2fa@example.com');
    cy.get('input[type="password"]').type('password');

    // Click the login button
    cy.get('button[type="submit"]').click();

    // Assert that the 2FA dialog is opened
    // Using the dialog-content class from the Vue component
    cy.get('.dialog-content').should('be.visible');
    cy.get('.dialog-title').should('contain', 'Two-Step Verification');

    // Enter the correct 2FA code using the pin input component
    cy.get('input[id="pin-input-0"]').type('1');
    cy.get('input[id="pin-input-1"]').type('2');
    cy.get('input[id="pin-input-2"]').type('3');
    cy.get('input[id="pin-input-3"]').type('4');
    cy.get('input[id="pin-input-4"]').type('5');
    cy.get('input[id="pin-input-5"]').type('6');

    // Assert that the user is redirected after successful 2FA verification
    cy.url().should('not.include', '/login');

    // Local storage should contain the token
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.exist;
    });
  });

  /**
   * Test for two-factor authentication with incorrect code.
   *
   * This test verifies that an appropriate error message is displayed
   * when a user enters an incorrect 2FA code.
   */
  it('should handle 2FA workflow with incorrect code', () => {
    // Enter email and password for an account that requires 2FA
    cy.get('input[type="email"]').type('2fa@example.com');
    cy.get('input[type="password"]').type('password');

    // Click the login button
    cy.get('button[type="submit"]').click();

    // Assert that the 2FA dialog is opened
    // Using the dialog-content class from the Vue component
    cy.get('.dialog-content').should('be.visible');
    cy.get('.dialog-title').should('contain', 'Two-Step Verification');

    // Intercept 2FA verification with incorrect code
    cy.intercept('POST', '/auth/verify-2fa', {
      statusCode: 401,
      body: {
        message: 'Invalid 2FA code'
      }
    });

    // Enter an incorrect 2FA code using the pin input component
    cy.get('input[id="pin-input-0"]').type('9');
    cy.get('input[id="pin-input-1"]').type('8');
    cy.get('input[id="pin-input-2"]').type('7');
    cy.get('input[id="pin-input-3"]').type('6');
    cy.get('input[id="pin-input-4"]').type('5');
    cy.get('input[id="pin-input-5"]').type('4');

    // Assert that an error message is displayed
    cy.get('.error').should('be.visible');
    cy.get('.error').should('contain', 'login failed');

    // We should still be on the login page
    cy.url().should('include', '/login');
  });
});
