$(window).on("hashchange", function () {
	if (location.hash.slice(1) == "signup") {
		$(".page").addClass("extend");
		$("#login").removeClass("active");
		$("#signup").addClass("active");
	} else {
		$(".page").removeClass("extend");
		$("#login").addClass("active");
		$("#signup").removeClass("active");
	}
});
$(window).trigger("hashchange");

$(document).ready(function(){
    var username,password;
    $("#loginBut").click(function(){
        username=$("#username").val();
        password=$("#password").val();
		// passwordTwo = $("#role").val();
        /*
        
        */
		if (username == "" || password == "") {
			document.getElementById("errorMsg").innerHTML = "Please fill the required fields"
			return false;
		}
	
		else if (password.length < 8) {
			document.getElementById("errorMsg").innerHTML = "Your password must include atleast 8 characters"
			return false;
		}else{
			console.log("submitting form");
			document.loginForm.submit();
	

		}
		
     
    });
});