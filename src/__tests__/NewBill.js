import { fireEvent , screen } from "@testing-library/dom"
import { localStorageMock} from "../__mocks__/localStorage.js"
import { ROUTES} from "../constants/routes"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import firebase from "../__mocks__/firebase.js"
import { data} from "jquery"


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

    firebase.post.mockImplementationOnce((bill) => 
       Promise.resolve(bill)
    )
    const addBill =  await firebase.post(bill)
    expect(postSpy).toBeCalledTimes(1)
    expect(addBill).toEqual(bill)

   })
})
})

