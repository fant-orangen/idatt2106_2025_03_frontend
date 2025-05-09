/**
 * End-to-end tests for the AdminAddNews component.
 *
 * These tests verify that the AdminAddNews component renders correctly
 * and that its key components are present and functional.
 */
describe('AdminAddNews', () => {
  const loginUrl = 'http://localhost:5173/login';
  const adminAddNewsUrl = 'http://localhost:5173/admin/news';

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

    // Mock API responses for crisis events
    cy.intercept('GET', '/public/crisis-events/all/previews*', {
      statusCode: 200,
      body: {
        content: [
          { id: 1, name: 'Flood', severity: 'red' },
          { id: 2, name: 'Fire', severity: 'yellow' },
          { id: 3, name: 'Earthquake', severity: 'green' }
        ],
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0
      }
    }).as('getCrisisEvents');

    // Mock API responses for news drafts
    cy.intercept('GET', '/public/news/drafts*', {
      statusCode: 200,
      body: {
        content: [
          { id: 1, title: 'Draft 1', content: 'Draft content 1', status: 'draft', updatedAt: '2023-05-01T12:00:00Z' },
          { id: 2, title: 'Draft 2', content: 'Draft content 2', status: 'draft', updatedAt: '2023-05-02T12:00:00Z' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 5,
        number: 0
      }
    }).as('getNewsDrafts');

    // Mock API responses for latest news
    cy.intercept('GET', '/public/news/latest*', {
      statusCode: 200,
      body: {
        content: [
          { id: 3, title: 'News 1', content: 'News content 1', status: 'published', publishedAt: '2023-05-03T12:00:00Z' },
          { id: 4, title: 'News 2', content: 'News content 2', status: 'published', publishedAt: '2023-05-04T12:00:00Z' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      }
    }).as('getLatestNews');

    // Mock API responses for news related to a crisis event
    cy.intercept('GET', '/public/news/crisis/*', {
      statusCode: 200,
      body: {
        content: [
          { id: 5, title: 'Related News 1', content: 'Related content 1', status: 'published', publishedAt: '2023-05-05T12:00:00Z' },
          { id: 6, title: 'Related News 2', content: 'Related content 2', status: 'published', publishedAt: '2023-05-06T12:00:00Z' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 3,
        number: 0
      }
    }).as('getRelatedNews');

    // Visit the login page first
    cy.visit(loginUrl);

    // Login with admin credentials
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Password1!');
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Navigate to the AdminAddNews page
    cy.visit(adminAddNewsUrl);
  });

  /**
   * Test that the AdminAddNews component renders correctly.
   */
  it('should render the AdminAddNews component', () => {
    // Check that we're on the correct page
    cy.url().should('include', '/admin/news');

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
    cy.get('input[type="text"]').should('exist');

    // Check for content textarea
    cy.get('textarea').should('exist');

    // Check for crisis event selection
    cy.get('button').contains(/select|velg/i, { matchCase: false }).should('exist');

    // Check for action buttons
    cy.get('button[type="button"]').should('have.length.at.least', 2);
  });

  /**
   * Test that the news lists are present.
   */
  it('should display news lists', () => {
    // Check for Card components
    cy.get('.card, .bg-card').should('have.length.at.least', 1);
  });

  /**
   * Test basic form interaction.
   */
  it('should allow basic form interaction', () => {
    // Type in title
    cy.get('input[type="text"]').first().type('Test News Title');

    // Type in content
    cy.get('textarea').first().type('This is a test news content with more than 10 characters');

    // Select a crisis event
    cy.get('button').contains(/select|velg/i, { matchCase: false }).click();
    cy.get('[role="option"]').first().click();

    // Form should still be valid
    cy.get('form').should('exist');
  });

  /**
   * Test form submission with mock API response.
   */
  it('should handle form submission', () => {
    // Intercept the form submission API call
    cy.intercept('POST', '**/admin/news', {
      statusCode: 201,
      body: {
        id: 7,
        title: 'Test News',
        content: 'Test Content',
        status: 'published'
      }
    }).as('createNews');

    // Fill out the form with minimum required fields
    cy.get('input[type="text"]').first().type('Test News Title');
    cy.get('textarea').first().type('This is a test news content with more than 10 characters');

    // Select a crisis event
    cy.get('button').contains(/select|velg/i, { matchCase: false }).click();
    cy.get('[role="option"]').first().click();

    // Click the post button
    cy.get('button').contains(/post|publish|publiser/i, { matchCase: false }).click();

    // Wait for the API call and check it was made
    cy.wait('@createNews').its('request.body').should('not.be.empty');
  });

});
