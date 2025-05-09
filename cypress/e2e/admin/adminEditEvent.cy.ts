/**
 * End-to-end tests for the AdminEditEvent component.
 *
 * These tests verify that the AdminEditEvent component renders correctly
 * and that its key components are present and functional.
 */
describe('AdminEditEvent', () => {
  const loginUrl = 'http://localhost:5173/login';
  const adminEditEventUrl = 'http://localhost:5173/admin/edit-event';

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

    // Create a test event first
    cy.intercept('POST', '**/admin/crisis-events', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test Event',
        description: 'Test Description',
        epicenterLatitude: 63.4305,
        epicenterLongitude: 10.3951,
        radius: 5,
        severity: 'red',
        active: true,
        startTime: '2023-05-01T12:00:00Z',
        scenarioThemeId: 1
      }
    }).as('createEvent');

    // Mock API responses for crisis events - ensure this matches the exact format expected
    cy.intercept('GET', '**/public/crisis-events/all*', {
      statusCode: 200,
      body: {
        content: [
          {
            id: 1,
            name: 'Flood',
            severity: 'red',
            active: true,
            startTime: '2023-05-01T12:00:00Z',
            description: 'A severe flood in the area',
            epicenterLatitude: 63.4305,
            epicenterLongitude: 10.3951,
            radius: 5,
            scenarioThemeId: 1
          },
          {
            id: 2,
            name: 'Fire',
            severity: 'yellow',
            active: true,
            startTime: '2023-05-02T12:00:00Z',
            description: 'A forest fire in the area',
            epicenterLatitude: 63.4305,
            epicenterLongitude: 10.3951,
            radius: 5,
            scenarioThemeId: 2
          },
          {
            id: 3,
            name: 'Earthquake',
            severity: 'green',
            active: false,
            startTime: '2023-05-03T12:00:00Z',
            description: 'A minor earthquake in the area',
            epicenterLatitude: 63.4305,
            epicenterLongitude: 10.3951,
            radius: 5,
            scenarioThemeId: 3
          }
        ],
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0
      }
    }).as('getCrisisEvents');

    // Mock API response for scenario themes
    cy.intercept('GET', '**/public/scenario-themes/previews/all', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Flood' },
        { id: 2, name: 'Fire' },
        { id: 3, name: 'Earthquake' }
      ]
    }).as('getScenarioThemes');

    // Mock API response for specific crisis event
    cy.intercept('GET', '**/public/crisis-events/*', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Flood',
        description: 'A severe flood in the area',
        epicenterLatitude: 63.4305,
        epicenterLongitude: 10.3951,
        radius: 5,
        severity: 'red',
        active: true,
        startTime: '2023-05-01T12:00:00Z',
        scenarioThemeId: 1
      }
    }).as('getCrisisEvent');

    // Visit the login page first
    cy.visit(loginUrl);

    // Login with admin credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Password1!');
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Create a test event first by visiting the add new event page
    cy.visit('http://localhost:5173/admin/add-new-event');

    // Fill out the form with minimum required fields
    cy.get('input[type="text"]').first().type('Test Event');

    // Set coordinates by triggering a map click event
    cy.get('.leaflet-container').click(50, 50);

    // Set radius
    cy.get('input[type="number"]').eq(2).type('100');

    // Set date and time
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    cy.get('input[type="date"]').type(formattedDate);
    cy.get('input[type="time"]').type('12:00');

    // Select priority
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').first().click();

    // Type description
    cy.get('textarea[name="description"]').first().type('This is a test event description with more than 10 characters');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call and check it was made
    cy.wait('@createEvent');

    // Navigate to the AdminEditEvent page
    cy.visit(adminEditEventUrl);
  });

  /**
   * Test that the AdminEditEvent component renders correctly.
   */
  it('should render the AdminEditEvent component', () => {
    // Check that we're on the correct page
    cy.url().should('include', '/admin/edit-event');

    // Check that the component exists
    cy.get('h1').should('exist');
  });

  /**
   * Test that the breadcrumb navigation is present.
   */
  it('should display breadcrumb navigation', () => {
    cy.get('[data-testid="breadcrumb"], .breadcrumb, nav').should('exist');
  });

  /**
   * Test that the event list is present.
   */
  it('should display the event list', () => {
    // Check for the event list container
    cy.get('div.events').should('exist');

    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Check that the list items exist
    cy.get('div.listOfEvents').should('exist');
  });

  /**
   * Test selecting an event from the list.
   */
  it('should allow selecting an event from the list', () => {
    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Check that the form is displayed
    cy.get('form').should('exist');

    // Check that the "Go back" button is displayed
    cy.get('button').should('exist');
  });

  /**
   * Test that the form fields are present after selecting an event.
   */
  it('should display all required form fields after selecting an event', () => {
    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Check for title input (readonly)
    cy.get('input[type="text"][readonly]').should('exist');

    // Check for latitude and longitude inputs
    cy.get('input[type="number"]').should('have.length.at.least', 2);

    // Check for address input
    cy.get('input[name="address"]').should('exist');

    // Check for radius input
    cy.get('input[name="radius"]').should('exist');

    // Check for severity select
    cy.get('select, [role="combobox"]').should('exist');

    // Check for description textarea
    cy.get('textarea').should('exist');

    // Check for submit button
    cy.get('button[type="submit"]').should('exist');

    // Check for deactivate button
    cy.get('button[variant="destructive"]').should('exist');
  });

  /**
   * Test that the map component is present after selecting an event.
   */
  it('should display the map component after selecting an event', () => {
    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Check for map container
    cy.get('.map-area').should('exist');
  });

  /**
   * Test basic form interaction after selecting an event.
   */
  it('should allow basic form interaction after selecting an event', () => {
    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Type in address
    cy.get('input[name="address"]').type('123 Test Street');

    // Type in radius
    cy.get('input[name="radius"]').clear().type('100');

    // Select severity
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').eq(1).click();

    // Type in description
    cy.get('textarea').clear().type('This is an updated test event description with more than 10 characters');

    // Form should still be valid
    cy.get('form').should('exist');
  });

  /**
   * Test form submission with mock API response.
   */
  it('should handle form submission', () => {
    // Intercept the form submission API call
    cy.intercept('PUT', '**/admin/crisis-events/*', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Flood',
        description: 'Updated description',
        epicenterLatitude: 63.4305,
        epicenterLongitude: 10.3951,
        radius: 10,
        severity: 'yellow',
        active: true,
        startTime: '2023-05-01T12:00:00Z'
      }
    }).as('updateEvent');

    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Type in address
    cy.get('input[name="address"]').type('123 Test Street');

    // Type in radius
    cy.get('input[name="radius"]').clear().type('100');

    // Select severity
    cy.get('select, [role="combobox"]').first().click();
    cy.get('[role="option"]').eq(1).click();

    // Type in description
    cy.get('textarea').clear().type('This is an updated test event description with more than 10 characters');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API call and check it was made
    cy.wait('@updateEvent').its('request.body').should('not.be.empty');
  });

  /**
   * Test deactivating an event.
   */
  it('should handle deactivating an event', () => {
    // Intercept the deactivate API call
    cy.intercept('PUT', '**/admin/crisis-events/deactivate/*', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Flood',
        description: 'A severe flood in the area',
        epicenterLatitude: 63.4305,
        epicenterLongitude: 10.3951,
        radius: 5,
        severity: 'red',
        active: false,
        startTime: '2023-05-01T12:00:00Z'
      }
    }).as('deactivateEvent');

    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Click the deactivate button
    cy.get('button[variant="destructive"]').click();

    // Wait for the API call and check it was made
    cy.wait('@deactivateEvent');

    // Check that we're back to the event list
    cy.get('div.events').should('be.visible');
  });

  /**
   * Test canceling an update.
   */
  it('should handle canceling an update', () => {
    // Wait for the events to load
    cy.intercept('GET', '**/public/crisis-events/all*').as('getEvents');
    cy.wait('@getEvents', { timeout: 10000 });

    // Click on the first event in the list
    cy.get('div.listOfEvents').first().click();

    // Wait for the specific event to load
    cy.wait('@getCrisisEvent');

    // Click the "Go back" button
    cy.get('button').first().click();

    // Check that we're back to the event list
    cy.get('div.events').should('be.visible');
  });
});
