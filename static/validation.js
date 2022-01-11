/*********************************************************************************
*  WEB322 – Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Soumik Saha     Student ID: 140721200          Date: 5th December 2021.
*
*  Online (Heroku) URL: https://arcane-escarpment-38969.herokuapp.com/
*
********************************************************************************/ 
function isValidForm() {
  hideErrorMsg();
  hidePassError();
    let form = document.querySelector('#register-form');
    console.log(form.postal.value);
    form.onsubmit = function(event) {
      console.log("ENTERED THIS FUNCTION");
      if(!form.checkValidity()) {
        return false;
      }
      if(!isValidPassword(form.password.value)) {
        return false;
      }
      if(!isValidPostalCode(form.postal.value)) {
        return false;
      }
      return true;
    }
  } 
  function isValidPostalCode(postal){
    let pattern=/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/ 
        if(pattern.test(postal)){
            hideErrorMsg();
            return true;
        }
        else 
        {
            displayErrorMsg("Invalid Postal Code! Please enter a valid postal code.");
            return false;
        }
  }
  function isValidPassword(psswrd){
    if(psswrd.length<6){
      displayPasswordError("Password must be 6 characters atleast");
      return false;
    }
    let pattern=/^(?=.*[a-z])(?=.*[A-Z])(?=..*[0-9])(?=..*[!@#\$%\^&\*])/
    if(!pattern.test(psswrd)){
      displayPasswordError("Password must contain atleast 1 Upper case character, 1 Lower case character, 2 digits, and 2 symbols.")
      return false;
    }
    hidePassError();
    return true;
  }
  function hidePassError(){
    let elem=document.querySelector("#err-msgPass");
    elem.innerHTML="";
    elem.classList.add('hidden');
  }
  function displayPasswordError(message){
    let elem=document.querySelector("#err-msgPass");
    elem.classList.remove('hidden');
    elem.innerHTML=message;
  }
  function displayErrorMsg(message){
      let elem=document.querySelector("#err-msg");
      elem.classList.remove('hidden');
      elem.innerHTML=message;
  }
  function hideErrorMsg(){
    let elem=document.querySelector("#err-msg");
    elem.innerHTML="";
    elem.classList.add('hidden');
  }
  window.onload=isValidForm();