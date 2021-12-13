import { fireEvent , screen } from "@testing-library/dom"
import { localStorageMock, sendBill} from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import Firestore, {FirestoreTest} from "../app/Firestore.js"
import firebase from "../__mocks__/firebase.js"
import { data, post } from "jquery"
import { bills } from "../fixtures/bills.js"
import userEvent from "@testing-library/user-event"
import { response } from "express"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill the new bill form should be render", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy()
    })

    describe("Given I'm on new bill page and I'm filling the form",() => {
      describe("When I choose a file to download with a bad extension", () => {
        test("Then It should not download file",() => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          const html = NewBillUI()
          document.body.innerHTML = html
  
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const firestore = null
          const newBill = new NewBill ({
            document, onNavigate, firestore, localStorage: window.localStorage
          })
  
          const file = screen.getByTestId("file")
  
          const e = {
            target:{
             __filename:"fake/test.g",
             value:"fake/test.g",
            }
          }
          
          const handleChangeFile = jest.fn(newBill.handleChangeFile)
  
        file.addEventListener("change", handleChangeFile)
        fireEvent.change(file, handleChangeFile(e))
        expect(handleChangeFile(e)).toBeFalsy()
        expect(e.target.value).toBe("")
        
        
      })
    })   
  })

  
    describe("When I fill the fields and I click on submit button",() => {
      test("Then It should render the bill page",() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBill = new NewBill ({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const formNewBill = screen.getByTestId("form-new-bill")
       
        const handleSubmit = jest.fn(newBill.handleSubmit)

        formNewBill.addEventListener("submit", handleSubmit)
        fireEvent.submit(formNewBill)
        expect(handleSubmit).toBeCalled()
        expect(screen.getByTestId('tbody')).toBeTruthy()
      })
   })

   })
  })

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new bill", () => {
    test("POST new bill to mock API POST", async () => {
      const postSpy = jest.spyOn(firebase, "post")
      beforeEach( ()=> {
        return postSpy.mockClear(data)
      })
      console.log(await (await firebase.post()).data)

      const bill = {
      email: "a@a",
      type: "transport",
      name:  "billet paris-bordeaux",
      amount: 150,
      date:  "2021-02-12",
      vat: "20",
      pct: "20",
      commentary: "Première class",
      fileUrl: "fake/test.jpg",
      fileName: "test.jpg",
      status: "pending"
    }
    const addBill =  await (await firebase.post()).data.push(bill)
    expect(postSpy).toBeCalled()
    console.log(addBill)
    expect(BillsUI({ data: bill})).toBeTruthy()
   })
   test("send bill from an API and fails with 404 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    )
    const html = BillsUI({ error: "Erreur 404" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
  test("send a bill from an API and fails with 500 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    )
    const html = BillsUI({ error: "Erreur 500" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})
})

