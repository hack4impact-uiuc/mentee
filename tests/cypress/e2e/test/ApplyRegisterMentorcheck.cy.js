describe("Registration for mentor", () => {
  it("check the validaions for Mentor are they working", () => {
    cy.visit("/apply");

    const userEmail = "test40@example.com";
    cy.get(".ant-input.ant-input-lg.css-wxm1m1").type(userEmail);
    //checking select fro Mentor
    cy.get(".ant-select-selection-search-input").click();
    cy.contains("Mentor").click();
    // click submit button
    cy.get(".ant-btn.css-wxm1m1.ant-btn-primary.ant-btn-lg").click();
    cy.wait(1000);
    cy.get(".ant-btn.css-wxm1m1.ant-btn-primary.ant-btn-lg").click({
      force: true,
    });

    cy.get('button.ant-btn[type="submit"]').click();

    cy.get("#firstName_help > div").should("be.visible");
    cy.get("#firstName_help > div").should(
      "have.text",
      "Please enter First Name"
    );

    cy.get("#lastName_help > div").should("be.visible");
    cy.get("#lastName_help > div").should(
      "have.text",
      "Please enter Last Name"
    );

    cy.get("#hearAboutUs_help > div").should("be.visible");
    cy.get("#hearAboutUs_help > div").should(
      "have.text",
      "Please enter From whom or where did you hear about us?"
    );

    cy.get("#knowledgeLocation_help > div").should("be.visible");
    cy.get("#knowledgeLocation_help > div").should(
      "have.text",
      "Please enter Please share which region(s), country(s), state(s), cities your knowledge is based in"
    );

    cy.get("#previousLocations_help > div").should("be.visible");
    cy.get("#previousLocations_help > div").should(
      "have.text",
      "Please enter Where have you lived in your life besides where you live now?"
    );

    cy.get("#employerName_help > div").should("be.visible");
    cy.get("#employerName_help > div").should(
      "have.text",
      "Please enter Full name of your company/employer"
    );

    cy.get("#jobDescription_help > div").should("be.visible");
    cy.get("#jobDescription_help > div").should(
      "have.text",
      "Please enter Your full title and a brief description of your role"
    );

    cy.get("#jobDuration_help > div").should("be.visible");
    cy.get("#jobDuration_help > div").should(
      "have.text",
      "Please enter How long have you been with this company?"
    );

    cy.get("#commitDuration_help > div").should("be.visible");
    cy.get("#commitDuration_help > div").should(
      "have.text",
      "Please enter If you are accepted as a global mentor, would you like to commit to..."
    );

    cy.get("#immigrationStatus_help > div").should("be.visible");
    cy.get("#immigrationStatus_help > div").should(
      "have.text",
      "Please enter Are you an immigrant or refugee or do you come from an immigrant family or refugee family?"
    );

    cy.get("#communityStatus_help > div").should("be.visible");
    cy.get("#communityStatus_help > div").should(
      "have.text",
      "Please enter Are you or your family from a native or aboriginal community?"
    );

    cy.get("#economicBackground_help > div").should("be.visible");
    cy.get("#economicBackground_help > div").should(
      "have.text",
      "Please enter Did you grow up economically challenged?"
    );

    cy.get("#isPersonOfColor_help > div").should("be.visible");
    cy.get("#isPersonOfColor_help > div").should(
      "have.text",
      "Please enter Would you consider yourself of person of color"
    );

    cy.get("#genderIdentification_help > div").should("be.visible");
    cy.get("#genderIdentification_help > div").should(
      "have.text",
      "Please enter What do you identify as?"
    );

    cy.get("#isMarginalized_help > div").should("be.visible");
    cy.get("#isMarginalized_help > div").should(
      "have.text",
      "Please enter Would you define yourself as having been or currently marginalized"
    );

    cy.get("#languageBackground_help > div").should("be.visible");
    cy.get("#languageBackground_help > div").should(
      "have.text",
      "Please enter Do you speak a language(s) other than English? If yes, please write the language(s) below and include your fluency level (conversational, fluent, native)"
    );

    cy.get("#referral_help > div").should("be.visible");
    cy.get("#referral_help > div").should(
      "have.text",
      "Please enter If you know someone who would be a great global mentor, please share their name, email, and we'll contact them!"
    );

    cy.get("#canDonate_help > div").should("be.visible");
    cy.get("#canDonate_help > div").should(
      "have.text",
      "Please enter MENTEE is a volunteer organization and we are sustained by donations. Are you able to offer a donation for one year?"
    );
  });

  it("Allow a user to Register as a Mentor", () => {
    cy.visit("/apply");

    const userEmail = "teta401@example.com";
    cy.get(".ant-input.ant-input-lg.css-wxm1m1").type(userEmail);
    //checking select fro Mentor
    cy.get(".ant-select-selection-search-input").click();
    cy.contains("Mentor").click();
    // click submit button
    cy.get(".ant-btn.css-wxm1m1.ant-btn-primary.ant-btn-lg").click();
    cy.wait(1000);
    cy.get(".ant-btn.css-wxm1m1.ant-btn-primary.ant-btn-lg").click({
      force: true,
    });

    cy.get("body").then(($body) => {
      if ($body.find("#firstName").length) {
        cy.get("#firstName").then(($el) => {
          if ($el.is(":visible")) {
            cy.get("#firstName").type("alex");
            cy.get("#lastName").type("john");

            cy.get("#phoneNumber").type("+44 318 540229872");

            cy.get("#hearAboutUs").type("From My company");

            cy.get("#knowledgeLocation")
              .should("have.attr", "rows", "3")
              .should(
                "have.attr",
                "placeholder",
                "Please share which region(s), country(s), state(s), cities your knowledge is based in"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .type(
                "i have knowledge of new yourk state city baffelo country is america"
              );

            cy.get("#previousLocations")
              .should("have.attr", "rows", "3")
              .should(
                "have.attr",
                "placeholder",
                "Where have you lived in your life besides where you live now?"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .type("I lived in america new yourk and now i am live from UK");

            cy.get("#employerName")
              .should(
                "have.attr",
                "placeholder",
                "Full name of your company/employer"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .type("I lived in america new yourk and now i am live from UK");

            cy.get("#jobDescription")
              .should(
                "have.attr",
                "placeholder",
                "Your full title and a brief description of your role"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .type("I am working as a tester");

            cy.get("#jobDuration")
              .should("have.attr", "type", "search")
              .should("have.attr", "autocomplete", "off")
              .should("have.class", "ant-select-selection-search-input")
              .should("have.attr", "role", "combobox")
              .should("have.attr", "aria-expanded", "false")
              .should("have.attr", "aria-haspopup", "listbox")
              .should("have.attr", "aria-owns", "jobDuration_list")
              .should("have.attr", "aria-autocomplete", "list")
              .should("have.attr", "aria-controls", "jobDuration_list")
              .should(
                "have.attr",
                "aria-activedescendant",
                "jobDuration_list_0"
              )
              .should("have.attr", "aria-required", "true")
              .click();

            cy.get(
              "body > div:nth-child(3) > div > div > div.rc-virtual-list > div.rc-virtual-list-holder > div > div > div.ant-select-item.ant-select-item-option.ant-select-item-option-active > div"
            ).click();

            cy.get("#commitDuration")
              .should("have.attr", "type", "search")
              .should("have.attr", "autocomplete", "off")
              .should("have.class", "ant-select-selection-search-input")
              .should("have.attr", "role", "combobox")
              .should("have.attr", "aria-expanded", "false")
              .should("have.attr", "aria-haspopup", "listbox")
              .should("have.attr", "aria-owns", "commitDuration_list")
              .should("have.attr", "aria-autocomplete", "list")
              .should("have.attr", "aria-controls", "commitDuration_list")
              .should(
                "have.attr",
                "aria-activedescendant",
                "commitDuration_list_0"
              )
              .should("have.attr", "aria-required", "true")
              .click();

            cy.get(
              "body > div:nth-child(4) > div > div > div.rc-virtual-list > div.rc-virtual-list-holder > div > div > div.ant-select-item.ant-select-item-option.ant-select-item-option-active > div"
            ).click();

            cy.get(
              "#immigrationStatus > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get(
              "#communityStatus > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get(
              "#economicBackground  > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get(
              "#isPersonOfColor  > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get(
              "#isPersonOfColor  > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get(
              "#isPersonOfColor  > label:nth-child(1) > span.ant-radio"
            ).click();

            cy.get("#genderIdentification")
              .should("have.attr", "type", "search")
              .should("have.attr", "autocomplete", "off")
              .should("have.class", "ant-select-selection-search-input")
              .should("have.attr", "role", "combobox")
              .should("have.attr", "aria-expanded", "false")
              .should("have.attr", "aria-haspopup", "listbox")
              .should("have.attr", "aria-owns", "genderIdentification_list")
              .should("have.attr", "aria-autocomplete", "list")
              .should("have.attr", "aria-controls", "genderIdentification_list")
              .should("have.attr", "aria-required", "true")
              .should("have.attr", "unselectable", "on")
              .should("have.value", "")
              .click();

            cy.contains("as a man").click();

            cy.get(
              "#isMarginalized > label:nth-child(1) > span:nth-child(2)"
            ).click();

            cy.get("#languageBackground")
              .should(
                "have.attr",
                "placeholder",
                "Do you speak a language(s) other than English? If yes, please write the language(s) below and include your fluency level (conversational, fluent, native)"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .should("have.attr", "type", "text")
              .type(
                "No i can speak only english no other language i can speak"
              );

            cy.get("#referral")
              .should(
                "have.attr",
                "placeholder",
                "If you know someone who would be a great global mentor, please share their name, email, and we'll contact them!"
              )
              .should("have.attr", "aria-required", "true")
              .should("have.class", "ant-input")
              .should("have.attr", "type", "text")
              .type("No i do not know nay one");

            cy.get(
              "#canDonate > label:nth-child(3) > span:nth-child(2)"
            ).click();
            cy.get('button.ant-btn[type="submit"]').click();

            cy.url().should("include", "/application-form");
          } else {
            cy.log("User Already exists.");
          }
        });
      } else {
        cy.log("User Already exists");
      }
    });
  });
});
