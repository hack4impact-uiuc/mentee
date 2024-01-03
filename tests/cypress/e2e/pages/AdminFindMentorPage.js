export class FindMentor {
  clickFindMentor() {
    cy.get(".ant-menu-title-content").eq(1).click();
  }
  searchByName() {
    const searchTerm = "robert";
    cy.get(
      "#root > section > main > div.gallery-container > div:nth-child(1) > div > div > span > input"
    ).type(searchTerm);
    cy.get(
      "#root > section > main > div.gallery-container > div.gallery-mentor-container"
    ).should("have.length.greaterThan", 0);
    cy.get(
      "#root > section > main > div.gallery-container > div.gallery-mentor-container"
    ).each(($result) => {
      cy.wrap($result).should("include.text", searchTerm);
    });
    cy.get(
      "#root > section > main > div.gallery-container > div:nth-child(1) > div > div > span > input"
    ).clear();
  }
  selectPartner() {
    cy.get(".ant-select-selector").eq(0).click();
    cy.get(".rc-virtual-list")
      .eq(0)
      .click()
      .invoke("text")
      .then((selectedText) => {
        cy.get(
          "#root > section > main > div.gallery-container > div.gallery-mentor-container"
        ).each(($result) => {
          cy.wrap($result).should("include.text", selectedText);
        });
      });
    cy.get(".ant-select-clear").click({ force: true });
  }
  selectLanguage() {
    cy.get(".ant-select-selector").eq(1).click();
    cy.get(".ant-select-item-option-content")
      .eq(1)
      .click({ force: true })
      .invoke("text")
      .then((selectedText) => {
        cy.get(
          "#root > section > main > div.gallery-container > div.gallery-mentor-container"
        ).each(($result) => {
          cy.wrap($result).should("include.text", selectedText);
        });
      });
    cy.get(".ant-select-clear").click({ force: true });
  }
  selectSpecialization() {
    cy.get(".ant-select-selector").eq(2).click();
    cy.get(".ant-select-item-option-content")
      .eq(4)
      .click({ force: true })
      .invoke("text")
      .then((selectedText) => {
        cy.get(
          "#root > section > main > div.gallery-container > div.gallery-mentor-container"
        ).each(($result) => {
          cy.wrap($result).should("include.text", selectedText);
        });
      });
    cy.get(".ant-select-clear").click({ force: true });
  }
}
