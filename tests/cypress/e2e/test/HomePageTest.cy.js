import { HomePage } from "../pages/HomePage";
import { I18N_LANGUAGES } from "../../../../frontend/src/utils/consts";
// import { eq, isEqual } from "cypress/types/lodash"
const homePage = new HomePage();
describe("HomePage", () => {
  beforeEach("Open Home Page", () => {
    cy.visit("/");
  });
  it("Existance of Home Page Components", () => {
    homePage.componentExist();
  });
  it("Clickable components at Home Page ", () => {
    homePage.isClickable();
  });
  it('should check the behavior upon Hover on "Report A Bug" Icon', () => {
    cy.get(".anticon.anticon-form.css-15ifzd0").trigger("mouseover");
    cy.get(".ant-tooltip-inner").should("be.visible");
  });
  it('should check the behavior upon Hover or click on "Global" Icon', () => {
    cy.get(".anticon.anticon-global.ant-dropdown-trigger.css-c1sjzn").click();
    cy.get(".anticon.anticon-global.ant-dropdown-trigger.css-c1sjzn").trigger(
      "mouseover"
    );
    cy.get("span.ant-dropdown-menu-title-content")
      .should("contain.text", "English")
      .and("contain.text", "Español")
      .and("contain.text", "العربية")
      .and("contain.text", "Português")
      .and("contain.text", "فارسی")
      .and("contain.text", "Pashto");
    cy.get("span.ant-dropdown-menu-title-content").should("have.length", 6);
  });
  it("should change the language", () => {
    homePage.changeLanguage();
  });
  it('should check the behavior upon click on "Existing" Card', () => {
    homePage.clickExisting();
  });
  it('should check the behavior upon click on "New" Card', () => {
    homePage.clickNew();
  });
});