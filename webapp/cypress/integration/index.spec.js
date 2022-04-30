describe('Load', () => {
  it('should navigate to index page', () => {
    cy.visit('/');
    cy.get('h1').contains('Kvitteringsskjema');
  });
});

describe('Form', () => {
  it('should be able to fill in basic fields', () => {
    cy.get('#name').type('John Doe');
    cy.get('#mailFrom').type('jon@doe.com');
    cy.get('#committee').type('webkom');
    cy.get('#mailTo').type('lisa@doe.com');
    cy.get('#accountNumber').type('1000 10 10000');
    cy.get('#amount').type('1000');
    cy.get('#date').type('1970-01-01');
    cy.get('#occasion').type('Cypress');
    cy.get('#comment').type('Cypress test');
  });
});

describe('Uploads', () => {
  it('should be able to uplaod signature', () => {
    cy.get('#signature').attachFile('abakus.png');
  });
  it('should be able to uplaod one attachment', () => {
    cy.get('#attachments').attachFile('abakus.png');

    // After uploading one image we should have one attachment
    cy.get('#uploadedAttachments').within(() => {
      cy.get('li').should('have.length', 1);
    });
  });
  it('should be able to uplaod multiple attachments', () => {
    // After uploading two image more we should have three attachments
    cy.get('#attachments').attachFile(['abakus.png', 'abakus.png']);
    cy.get('#uploadedAttachments').within(() => {
      cy.get('li').should('have.length', 3);
    });
  });
});

describe('Signature drawing', () => {
  it('should be possible to draw the signature', () => {
    cy.get('#signButton').click();
    cy.get('h3').contains('Signer i feltet under');
    cy.get('canvas');
    cy.get('button').contains('Bruk').click();
  });
});

describe('Submit', () => {
  it('should be possible to submit', () => {
    // Set up a catch for the POST request
    cy.intercept(
      {
        method: 'POST',
        url: '/kaaf',
      },
      'Kvitteringsskjema generert og sendt på mail!'
    ).as('submitResponse');

    // Sumbit
    cy.get('button').contains('Generer kvittering').click();

    // Wait for the submitResponse
    cy.wait('@submitResponse')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    // Check that response is correct
    cy.get('div').contains('Kvitteringsskjema generert og sendt på mail!');
  });
});
