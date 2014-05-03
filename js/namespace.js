var ns = "";

function createLink (url, content) {
  return "<a href=\"" +url+ "\">" +content+ "</a>";
}

function createListItem (item) {
  return "<li>" + item + "</li>";
}

function createClassItem (name) {
  return createListItem(createLink ("#class-" + name, name));
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

function initClassItems (ns, className) {
    clearItems (["#class-properties-list",
                 "#class-methods-list",
                 "#class-signals-list",
                 "#class-constructors-list"]);
    hideEverything ();
    $("#class-area ul #namespace").html(createLink(location.pathname, ns));
    $("#class-area ul #class-name").html(className);
    showArea ("#class-area");
}

function initClassSummary (ns, className, properties, signals, constructors, methods) {
  method_prefix = ns + "." + className + ".prototype.";

  var tmpString = "";
  $.each (constructors, function (index, item) {
    tmpString = tmpString + createListItem(method_prefix + item.name + "()");
  });
  $("#class-constructors-list").html(tmpString);

  tmpString = "";
  $.each (methods, function (index, item) {
    tmpString = tmpString + createListItem(method_prefix + item.name + "()");
  });
  $("#class-summary-methods-list").html(tmpString);

  tmpString = "";
  $.each (properties, function (index, item) {
    tmpString = tmpString + createListItem(item.name);
  });
  $("#class-summary-properties-list").html(tmpString);

  tmpString = "";
  $.each (signals, function (index, item) {
    tmpString = tmpString + createListItem (item.name);
  });
  $("#class-summary-signals-list").html(tmpString);
}

function goToClass (className) {
  $.getJSON ("docs-test/" + ns + "." + className + ".json", function (data) {
    $("#class-doc").html(data.doc);

    initClassItems (ns, data.name);
    initClassSummary (ns, data.name, data.properties, data.signals, data.constructors, data.methods);
    //$.each ($("span[data-xref]")
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
