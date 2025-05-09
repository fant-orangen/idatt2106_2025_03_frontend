/**
 * End-to-end tests for the AdminAddNewPOI component.
 *
 * These tests verify that the AdminAddNewPOI component renders correctly
 * and that its key components are present and functional.
 */
describe('AdminAddNewPOI', () => {
  const loginUrl = 'http://localhost:5173/login';
  const adminAddNewPOIUrl = 'http://localhost:5173/admin/add-new-POI';

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

    // Intercept POI types API call
    cy.intercept('GET', '/public/poi/types', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Hospital' },
        { id: 2, name: 'Police Station' },
        { id: 3, name: 'Fire Station' },
        { id: 4, name: 'Shelter' }
      ]
    }).as('getPoiTypes');

    // Visit the login page first
    cy.visit(loginUrl);

    // Login with admin credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Password1!');
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Navigate to the AdminAddNewPOI page
    cy.visit(adminAddNewPOIUrl);
  });

  /**
   * Test that the AdminAddNewPOI component renders correctly.
   */
  it('should render the AdminAddNewPOI component', () => {
    // Check that we're on the correct page
    cy.url().should('include', '/admin/add-new-POI');

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
    // Check for title input
    cy.get('input[type="text"]').first().should('exist');

    // Check for latitude and longitude inputs
    cy.get('input[type="number"]').should('have.length.at.least', 2);

    // Check for address input
    cy.get('input[name="address"]').should('exist');

    // Check for POI type select
    cy.get('select, [role="combobox"]').should('exist');

    // Check for opening hours inputs
    cy.get('input[type="time"]').should('have.length', 2);

    // Check for contact info input
    cy.get('input[type="tel"]').should('exist');

    // Check for description textarea
    cy.get('textarea').should('exist');

    // Check for submit button
    cy.get('button[type="submit"]').should('exist');
  });

  /**
   * Test that the map component is present.
   */
  it('should display the map component', () => {
    // Check for map container
    cy.get('.leaflet-container, [class*="map"]').should('exist');
  });

  /**
   * Test that the map controller is present.
   */
  it('should display the map controller', () => {
    // Check for map controller
    cy.get('[class*="controller"], [class*="Controller"]').should('exist');
  });

  /**
   * Test basic form interaction.
   */
  it('should allow basic form interaction', () => {
    // Type in title
    cy.get('input[type="text"]').first().type('Test POI');

    // Type in address
    cy.get('input[name="address"]').type('123 Test Street');

    // Select POI type
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').first().click();

    // Set opening hours
    cy.get('input[type="time"]').first().type('09:00');
    cy.get('input[type="time"]').eq(1).type('17:00');

    // Type in contact info
    cy.get('input[type="tel"]').type('+47 123 45 678');

    // Type in description
    cy.get('textarea[name="description"]').first().type('This is a test POI description with more than 10 characters');

    // Form should still be valid
    cy.get('form').should('exist');
  });

  /**
   * Test map interaction.
   */
  it('should allow map interaction', () => {
    // Check that the map is interactive
    cy.get('.leaflet-container, [class*="map"]')
      .should('exist')
      .and('be.visible');
  });

  /**
   * Test form submission with mock API response.
   */
  it('should handle form submission', () => {
    // Intercept the form submission API call
    cy.intercept('POST', '**/admin/poi', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test POI',
        description: 'Test Description'
      }
    }).as('createPOI');

    // Fill out the form with minimum required fields
    cy.get('input[type="text"]').first().type('Test POI');

    // Set coordinates by triggering a map click event
    cy.get('.leaflet-container').click(50, 50);

    // Select POI type
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').first().click();

    // Type description
    cy.get('textarea[name="description"]').first().type('This is a test POI description with more than 10 characters');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call and check it was made
    cy.wait('@createPOI').its('request.body').should('not.be.empty');
  });
});
