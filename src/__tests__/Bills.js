import {fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Actions from "./Actions.js"
import firebase from "../__mocks__/firebase"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
      expect(screen.getByTestId('tbody')).toBeTruthy()
      expect(screen.getByTestId('layout-disconnect')).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    describe('Given I am connected as an employee but it is loading', () => {
      test('Then, Loading page should be rendered', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })
    describe('Given I am connected as an employee  but back-end send an error message', () => {
      test('Then, Error page should be rendered', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })
    })
    
    
    describe("Given I am connected as an employee and I have no bill", () => {
      test("Then I no bills should be show",() => {
        const html = BillsUI([])
        document.body.innerHTML = html
    
        const table = screen.getByTestId('tbody')
        expect(table.innerText).toBe(undefined)
      })
    })


    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML) 
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

   
  })
})

describe("Given I am connected as employee I click on new bill",() => {
  test("Then it should render New Bill page", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const html = BillsUI({ data: bills})
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const firestore = null
    const bill = new Bills ({
      document, onNavigate, firestore, bills, localStorage: window.localStorage
    })

    const handleClickNewBill = jest.fn(bill.handleClickNewBill)
    const buttonNewBill = screen.getByTestId("btn-new-bill")
    expect(buttonNewBill).toBeInTheDocument()
    buttonNewBill.addEventListener('click', handleClickNewBill)
    userEvent.click(buttonNewBill)
    expect(handleClickNewBill).toHaveBeenCalled()
    expect(onNavigate).toBeTruthy()
  })
})

describe("Given I am connected as employee and I have bills and I click on the EyeIcon",() => {
  test("Then a modal should be open", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const html = BillsUI({ data: bills})
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const firestore = null
    const bill = new Bills ({
      document, onNavigate, firestore, bills, localStorage: window.localStorage
    })

    const handleClickIconEye = jest.fn(bill.handleClickIconEye)
    const eye = screen.getAllByTestId("icon-eye")
    
    eye.forEach(el => {
    
      el.addEventListener('click',(e)=> handleClickIconEye(el))
    });
    fireEvent.click(eye[Math.floor(Math.random() * eye.length)])
    expect(handleClickIconEye).toHaveBeenCalled()
    expect(document.body).toHaveClass("modal-open")
  })

  test("Then I should have an image rendered", () => {
    const eye = screen.getAllByTestId("icon-eye")
    const ModaleFile = screen.getByTestId("modaleFile")
    const billUrl = eye[Math.floor(Math.random() * eye.length)].getAttribute("data-bill-url")
    expect(billUrl).toBeTruthy()
    expect(ModaleFile.innerHTML).toBeTruthy()
  })
})


describe("Given I am connected as employee and I clik on new bill",() => {
  test("Then I should have the New Bill page open", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const html = BillsUI({ data: bills})
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const firestore = null
    const bill = new Bills ({
      document, onNavigate, firestore, bills, localStorage: window.localStorage
    })

    const handleClickNewBill = jest.fn(bill.handleClickNewBill)

    const buttonNewBill = screen.getByTestId("btn-new-bill")
    expect(buttonNewBill).toBeInTheDocument() 
 buttonNewBill.addEventListener("click", handleClickNewBill)
 jest.spyOn(bill, "onNavigate")
 
  userEvent.click(buttonNewBill)
  expect(handleClickNewBill).toHaveBeenCalled()
  expect(bill.onNavigate).toHaveBeenCalled()
  expect(bill.onNavigate).toBeCalledWith("#employee/bill/new")
  const form = screen.getByTestId("form-new-bill")
  expect(form).toBeVisible()

  })
})



// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})