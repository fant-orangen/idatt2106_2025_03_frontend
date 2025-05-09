/**
 * End-to-end tests for the AdminAddNewEvent component.
 *
 * These tests verify that the AdminAddNewEvent component renders correctly
 * and that its key components are present and functional.
 */
describe('AdminAddNewEvent', () => {
  const loginUrl = 'http://localhost:5173/login';
  const adminAddNewEventUrl = 'http://localhost:5173/admin/add-new-event';

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

    // Navigate to the AdminAddNewEvent page
    cy.visit(adminAddNewEventUrl);

    // Mock API responses for scenario themes
    cy.intercept('GET', '**/public/scenario-themes/previews/all', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Flood' },
        { id: 2, name: 'Fire' },
        { id: 3, name: 'Earthquake' }
      ]
    }).as('getScenarioThemes');
  });

  /**
   * Test that the AdminAddNewEvent component renders correctly.
   */
  it('should render the AdminAddNewEvent component', () => {
    // Check that we're on the correct page
    cy.url().should('include', '/admin/add-new-event');

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

    // Check for radius input
    cy.get('input[type="number"]').should('exist');

    // Check for time and date inputs
    cy.get('input[type="time"]').should('exist');
    cy.get('input[type="date"]').should('exist');

    // Check for priority select
    cy.get('select, [role="combobox"]').should('exist');

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
    cy.get('input[type="text"]').first().type('Test Event');

    // Type in radius
    cy.get('input[type="number"]').eq(2).type('100');

    // Select date and time
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    cy.get('input[type="date"]').type(formattedDate);
    cy.get('input[type="time"]').type('12:00');

    // Type in description
    cy.get('textarea[name="description"]').first().type('This is a test event description');

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
    cy.intercept('POST', '**/admin/crisis-events', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test Event',
        description: 'Test Description'
      }
    }).as('createEvent');

    // Fill out the form with minimum required fields
    cy.get('input[type="text"]').first().type('Test Event');

    // Set coordinates by triggering a map click event instead of directly typing into readonly fields
    // This simulates the user clicking on the map, which would set the latitude and longitude
    cy.get('.leaflet-container').click(50, 50);

    // Set radius
    cy.get('input[type="number"]').eq(2).type('100');

    // Set date and time
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    cy.get('input[type="date"]').type(formattedDate);
    cy.get('input[type="time"]').type('12:00');

    // Select priority (assuming it's a select element)
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').first().click();

    // Type description
    cy.get('textarea[name="description"]').first().type('This is a test event description with more than 10 characters');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call and check it was made
    cy.wait('@createEvent').its('request.body').should('not.be.empty');
  });
});
