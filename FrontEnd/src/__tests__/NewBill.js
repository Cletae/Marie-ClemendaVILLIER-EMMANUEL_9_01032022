/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let onNavigate;

    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
    });

    test("Then I fill a txt file in the form, an error message should appear", () => {
      const file = new File(["foo"], "foo.txt", {
        type: "text/plain",
      });
      const inputFile = screen.getByTestId("file");
      const fileError = screen.getByTestId("file-error");
      const btnSubmit = screen.getByTestId("btn-send-bill");
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      fireEvent.change(inputFile, { target: { files: [file] } });
      const e = {
        preventDefault() {},
        target: {
          value: "C:\\fakepath\\foo.txt",
        },
      };
      newBill.handleChangeFile(e);
      expect(fileError.textContent).toBe(
        "Veuillez choisir uniquement un fichier au format .jpg, .jpeg ou .png"
      );
      expect(btnSubmit.disabled).toBe(true);
    });

    test("Then I fill a image file in the form, no error message should appear", () => {
      const file = new File(["foo"], "foo.jpg", {
        type: "image/jpeg",
      });
      const inputFile = screen.getByTestId("file");
      const fileError = screen.getByTestId("file-error");
      const btnSubmit = screen.getByTestId("btn-send-bill");
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      fireEvent.change(inputFile, { target: { files: [file] } });
      const e = {
        preventDefault() {},
        target: {
          value: "C:\\fakepath\\foo.jpg",
        },
      };
      newBill.handleChangeFile(e);
      expect(fileError.textContent).toBe("");
      expect(btnSubmit.disabled).toBe(false);
    });
  });

  describe("When I am on NewBill page, I filled in the form correctly and I clicked on submit button", () => {
    test("Then Bills page should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      newBill.fileName = "test.jpg";

      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);

      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

//Test intégration Post New Bill
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new bill", () => {
    test("Then a new bill should be Post with mock API POST", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      const mockedBills = newBill.store.bills();
      const spyCreate = jest.spyOn(mockedBills, "create");

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["test"], "test.jpg", {
              type: "image/jpeg",
            }),
          ],
        },
      });
      expect(spyCreate).toHaveBeenCalled();

      await spyCreate();
      expect(newBill.billId).toBe("1234");
      expect(newBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(store, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("posts bills from an API and fails with 400 message error", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage,
      });
      store.bills.mockImplementationOnce(() => {
        return {
          create() {
            return Promise.reject("Erreur 400");
          },
        };
      });

      const file = new File(["foo"], "foo.jpg", {
        type: "image/jpeg",
      });
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [file] } });

      await newBill.handleChangeFile({
        preventDefault() {},
        target: {
          value: "C:\\fakepath\\foo.jpg",
        },
      });

      expect(console.error).toHaveBeenCalled();
    });
  });
});
