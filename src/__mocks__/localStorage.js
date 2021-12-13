import { post } from "jquery";
import firebase from "./firebase";

export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return JSON.stringify(store[key])
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()

export const sendBill = (bill) => {
  const postSpy = jest.spyOn(firebase, "post")
    const post = firebase.post()
  if (post) {
   post
   .data
    .add(bill)
    .catch(error => error)
  }
}

