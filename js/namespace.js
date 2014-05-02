$(document).ready (function () {
  $.getJSON("docs-test/Gio-2.0.json", function (data) {
    var content = "";
    $.each (data.classes, function (i, item) {
      content = content + "<li>" + item.name + "</li>";
    });
    $("#class-list").html(content);
  });
})
