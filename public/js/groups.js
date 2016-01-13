//haxing
$(document).ready(function(){
  window.api.get("groups/getGroups/", function(result){
    console.log("emlynizdumb")
  	swal("result", result, "success");
  })
  
  window.api.get("groups/getGroupsIn", function(result){
    console.log("getting hexed")
    swal("You are in the groups:", result[0][0]+" "+result[0][1], "success");
  })
});

