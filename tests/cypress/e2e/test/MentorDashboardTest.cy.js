import { MentorDashboard } from "../pages/MentorDashboard";
const mentor = new MentorDashboard();
describe("Mentor Dashboard", () => {
  beforeEach("Open Mentor Dashboard", () => {
    cy.visit("/login");
    mentor.loginDashboard();
    cy.wait(2000);
  });
  it("Check The Dashboard Functionality", () => {
    mentor.dashboardFunctionality();
  });
  it("Should Change the Language", () => {
    mentor.selectEnglish();
    mentor.changeLanguage();
  });
});