var avalon = require("avalon");

avalon.ready(function(){
  avalon.define({
    $id:"contentRender",
    detailObj : "this is a test"
  });
  avalon.scan();
});
