import Search from "./modules/search";
import Chat from "./modules/chat";
import RegistrationForm from "./modules/registrationForm";
//import imageRegister from "./modules/image-register.js"

//if (document.querySelector("#image-register")) {new imageRegister()}
if (document.querySelector("#registration-form")) {new RegistrationForm()}
if (document.querySelector(".header-search-icon")) {new Search()}
if (document.querySelector("#chat-wrapper")) {new Chat()}