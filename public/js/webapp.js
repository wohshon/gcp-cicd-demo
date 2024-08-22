var App = {
    test: function(msg) {
        console.log(msg);
    },
    submitData: function(data) {
        console.log("submit form data to backend: ${data}");
        $.ajax({
            method: "POST",
            url: "./submitForm",
            data: data,
            dataType: "text",
            success: function(data) {
                console.log(data);
                let d = JSON.parse(data);
                //console.log(d.email);
                console.log( $('response_card_body'));
                $('#response_card_body').append('<p class="card-text">'+data+'</p>')
            },
            error: function(error) {
                console.log(Object.keys(error));
                console.log(error.responseText);
                $('#response_card_body').append('<p class="card-text">'+error.responseText+'</p>')

            }
          })        
    }
};

// Declaration
class FormData {
    constructor(email, txt) {
      this.email = email;
      this.txt = txt;
    }
  }