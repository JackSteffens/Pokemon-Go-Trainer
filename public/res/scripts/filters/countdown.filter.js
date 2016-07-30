angular.module('pogobot').filter('countdownFilter', function() {
  return function(expTime) {
    var curTime = new Date().getTime();
    expTime = expTime*1000; // TODO Temp untill we've got our own scanner with parsed data.
    // console.log("exp : "+expTime+" , cur : "+curTime);
    if (expTime > curTime) {
      var returnDate = new Date(expTime - curTime);
      var minutes = returnDate.getMinutes();
      var seconds = returnDate.getSeconds();
      return minutes == 0 ? seconds+"s" : minutes+"m "+seconds+"s"
    } else {
      return "expired";
    }
  };
})
