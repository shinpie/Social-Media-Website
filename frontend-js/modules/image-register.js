export default class imageRegister {
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.imageWrapper = document.querySelector("#image-register")
        this.inputElement = document.querySelector("input[type='file']")
        this.events()
    }

    // events 
    events() {
        const pond = FilePond.create(thisinputElement)
    }
}