describe("Apply Form fot Mentee visibility", () => {
  it("should navigate to the correct URL on clicking the anchor tag", () => {
    cy.visit("/apply");

    const userEmail = "test6@example.com";
    cy.get("#email").type(userEmail);
    //checking select fro Mentee
    cy.get(".ant-select-selection-search-input").click();
    cy.contains("Mentee").click();
    // click submit button
    cy.get(".ant-btn").click();
    cy.wait(1000);
    cy.get(".ant-select-selection-item").click({
      force: true,
    });

    cy.get(
      ".ant-select-selection-item"
    ).click();

    cy.url().should("include", "/");
  });

  it("check the visibilty of form for mentee", () => {
    cy.visit("/apply");

    const userEmail = "testa@example.com";
    cy.get("#email").type(userEmail);
    //checking select fro Mentee
    cy.get(".ant-select-selection-search-input").click();
    cy.contains("Mentee").click();
    cy.get(".ant-select-selection-item").should("have.attr", "title", "Mentee");

    // click submit button
    cy.get(".ant-btn").click();
    cy.wait(1000);
    cy.get(".ant-select-selection-item").click({
      force: true,
    });
    cy.get(".ant-btn").click({force: true});
    cy.get(":nth-child(2) > .ant-typography")
      .invoke("text")
      .then((text) => {
        const trimmedText = text.trim();
        expect(trimmedText).to.equal("Welcome to MENTEE!");
      });

    cy.get(".ant-btn").click();
    cy.get('label[for="firstName"].ant-form-item-required').should(
      "have.text",
      "First Name"
    );

    cy.get('label[for="lastName"].ant-form-item-required').should(
      "have.text",
      "Last Name"
    );

    // cy.get('label[for="organization"].ant-form-item-required').should(
    //   "have.text",
    //   "What organization is supporting you locally or what organization are you affiliated with?"
    // );

    // cy.get('label[for="age"].ant-form-item-required').should(
    //   "have.text",
    //   "Let us know more about you"
    // );
    // Click on the label to trigger the dropdown
    // cy.get(':nth-child(6) > .ant-row > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-overflow').click();

    // // Wait for the dropdown to appear
    // cy.get('.ant-select-dropdown').should('be.visible');


   
    cy.get(
      ':nth-child(6) > .ant-row > .ant-form-item-label > .ant-form-item-required'
    ).should(
      "have.text",
      "Country"
    );

    cy.get('label[for="country"]').should(
      "have.text",
      "Country"
    );

    cy.get(
      ':nth-child(8) > .ant-row > .ant-form-item-label > .ant-form-item-required'
    ).should("have.text", "Preferred Language(s)");

    cy.get(
      ':nth-child(9) > .ant-row > .ant-form-item-label > .ant-form-item-required'
    ).should("have.text", "What special topics would you be interested in? If one is not on the list please add it in other:");

    cy.get(
      ':nth-child(10) > .ant-row > .ant-form-item-label > .ant-form-item-required'
    ).should(
      "have.text",
      "What do you currently do? Please check ALL the options that apply to you. If you select ''other'', please be specific:"
    );

    // Check if the label for 'workstate' contains the expected text
    cy.get(':nth-child(11) > .ant-row > .ant-form-item-label > .ant-form-item-required').should(
      "have.text",
      "Would you be interested in being highlighted as one of our mentees on social media?"
    );

    // Check if the label for 'socialMedia' contains the expected text
    // cy.get(
    //   ':nth-child(12) > .ant-row > .ant-form-item-label > .ant-form-item-required'
    // ).should(
    //   "have.text",
    //   "Would you be interested in being highlighted as one of our mentees on social media?"
    // );

    // Check if the first radio button option contains the text 'Yes!'
    cy.get("#socialMedia > :nth-child(1) > :nth-child(2)")
      .eq(0)
      .should("contain.text", "Yes!");

    // Check if the second radio button option contains the text 'No, thank you'
    cy.get('#socialMedia > :nth-child(2) > :nth-child(2)')
    .should("contain.text", "No, thank you");


    // Check if the third radio button option contains the text 'Other'
    cy.get("#socialMedia > :nth-child(3) > :nth-child(2)")
      .should("contain.text", "Other");

    // Check if the label for 'questions' contains the text 'Do you have any questions?'
    cy.get(
      ':nth-child(13) > .ant-row > .ant-form-item-label > label'
    ).should("have.text", "If you are currently affiliated to a partner organization, please select it from the below list, or select no-affiliation.");
  });
});
