const selectItem = (selector, itemValue) => {
  cy.get(selector).click();
  cy.get("div[data-slot='popover']")
    .find(`span:contains(${itemValue})`)
    .click();
};

const uploadFile = (selector, inputFiles) => {
  const files = (Array.isArray(inputFiles) ? inputFiles : [inputFiles]).map(
    (fileName) => `webapp/cypress/fixtures/${fileName}`
  );
  cy.get(selector).selectFile(files, { force: true });
};

describe('Load', () => {
  beforeEach(() => cy.visit('/'));
  it('should navigate to index page', () => {
    cy.get('h4').contains('Kvitteringsskjema');
  });
});

describe('Form', () => {
  beforeEach(() => cy.visit('/'));
  it('should be able to fill in basic fields', () => {
    cy.get('#name').type('John Doe');
    cy.get('#mailFrom').type('jon@doe.com');
    selectItem('#mailTo', 'Webkom');
    cy.get('#accountNumber').type('1234 56 78903');
    cy.get('#amount').type('1000');
    cy.get('#date').type('1970-01-01');
    cy.get('#occasion').type('Cypress');
    cy.get('#comment').type('Cypress test');
  });
});

describe('Uploads', () => {
  beforeEach(() => cy.visit('/'));
  it('should be able to upload signature', () => {
    uploadFile('#signature', 'abakus.png');
  });
  it('should be able to upload one attachment', () => {
    uploadFile('#attachments', 'abakus.png');

    // After uploading one image we should have one attachment
    cy.get('#uploadedAttachments').within(() => {
      cy.get('img').should('have.length', 1);
    });
  });
  it('should be able to upload multiple attachments', () => {
    // After uploading two image more we should have three attachments
    uploadFile('#attachments', ['abakus.png', 'favicon.png']);
    cy.get('#uploadedAttachments').within(() => {
      cy.get('img').should('have.length', 2);
    });
  });
});

describe('Signature drawing', () => {
  beforeEach(() => cy.visit('/'));
  it('should be possible to draw the signature', () => {
    cy.get('#signButton').click();
    cy.get('h3').contains('Signer i feltet under');
    cy.get('canvas');
    cy.get('button').contains('Bruk').click();
  });
});

describe('Submit', () => {
  beforeEach(() => cy.visit('/'));
  it('should be possible to submit', () => {
    // Set up a catch for the POST request
    cy.intercept(
      {
        method: 'POST',
        url: '/generate',
      },
      'Kvitteringsskjema generert og sendt på mail!'
    ).as('submitResponse');

    // Fill in values
    cy.get('#name').type('John Doe');
    cy.get('#mailFrom').type('jon@doe.com');
    selectItem('#mailTo', 'Webkom');
    cy.get('#accountNumber').type('1234 56 78903');
    cy.get('#amount').type('1000');
    cy.get('#date').type('1970-01-01');
    cy.get('#occasion').type('Cypress');
    cy.get('#comment').type('Cypress test');
    uploadFile('#signature', 'abakus.png');
    uploadFile('#attachments', 'abakus.png');

    // Verify that the attachment was uploaded
    cy.get('#uploadedAttachments').within(() => {
      cy.get('img').should('have.length', 1);
    });

    // Submit
    cy.get('button').contains('Generer og send kvittering').click();

    cy.get('button').contains('Ja, generer og send kvittering').click();

    // Wait for the submitResponse
    cy.wait('@submitResponse')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    // Check that response is correct
    cy.get('div').contains('Kvitteringsskjema generert og sendt på mail!');
  });
});
