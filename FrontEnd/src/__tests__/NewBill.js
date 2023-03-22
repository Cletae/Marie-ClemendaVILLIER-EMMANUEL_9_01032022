/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion

      const fileType = file.type;
      const $fileError = this.document.getElementById("file-error");
      const $submitBtn = this.document.getElementById("btn-send-bill");
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        $fileError.style.display = "block";
        $fileError.style.color = "red";
        $fileError.innerHTML =
          "Veuillez choisir une image ou fichier au format .jpg, .jpeg ou .png";
        $submitBtn.disabled = true;
        return;
      } else {
        $fileError.style.display = "none";
        $submitBtn.disabled = false;
      }
    });
  });
});
