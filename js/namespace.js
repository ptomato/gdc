var ns = "";
var klass = "";

function createLink (url, content) {
  return "<a href=\"" +url+ "\">" +content+ "</a>";
}

function createClassItem (name) {
  return "<li>" + createLink ("#class-" + name, name) + "</li>"
}

function hideEverything () {
  $.each (["#namespace-area", "#class-area", "#functions-area"], function (index, item) {
    $(item).css ("visibility", "hidden");
    $(item).css ("display",    "none");
  });
}

function showArea (area)
{
  $(area).css ("visibility", "visible");
  $(area).css ("display", "block");
}

function clearItems (lists)
{
  $.each (lists, function (i, item) {
    $(item).html ("");
  });
}

function goToClass (className) {
  $.getJSON ("docs-test/" + ns + "." + className + ".json", function (data) {
    clearItems (["#class-properties-list",
                 "#class-methods-list",
                 "#class-signals-list",
                 "#class-constructors-list"]);
    hideEverything ();
    $("#class-area ul #namespace").html(ns);
    $("#class-area ul #class-name").html(data.name);
    $("#class-doc").html(data.doc);

    //$.each ($("span[data-xref]")
    showArea ("#class-area");

    method_prefix = ns + "." + data.name + ".prototype.";

    var tmpString = "";
    $.each (data.constructors, function (index, item) {
      tmpString = tmpString + "<li>" + method_prefix + item.name + "()</li>";
    });
    $("#class-constructors-list").html(tmpString);

    tmpString = "";
    $.each (data.methods, function (index, item) {
      tmpString = tmpString + "<li>" + method_prefix + item.name + "()</li>";
    });
    $("#class-methods-list").html(tmpString);

    tmpString = "";
    $.each (data.properties, function (index, item) {
      tmpString = tmpString + "<li>" + item.name + "</li>";
    });
    $("#class-properties-list").html(tmpString);

    tmpString = "";
    $.each (data.signals, function (index, item) {
      tmpString = tmpString + "<li>" + item.name + "()</li>";
    });
    $("#class-signals-list").html(tmpString);
  });
}

function goToNS ()
{
  hideEverything();
  showArea ("#namespace-area");
}

function onHashchange (newUrl) {
  var hash = location.hash;
  if (hash.match("^#class-"))
    goToClass(hash.replace ("#class-", ""));
  else
    goToNS ();
}

$(document).ready (function () {
  window.onhashchange = onHashchange;
  goToNS ();

  $("#class-list").html("");
  var content = "";
  $.getJSON("docs-test/Gtk-3.0.json", function (data) {
    ns = data.name;
    $.each (data.classes, function (i, item) {
      content = content + createClassItem (item.name);
    });
    $("#class-list").html(content);
  });
})
