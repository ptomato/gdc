/* global $, location, document */

// polyfill
function endsWith(string, suffix) {
  var position = string.length - suffix.length;
  var lastIndex = string.indexOf(suffix, position);
  return lastIndex !== -1 && lastIndex === position;
}

function createLink (url, content) {
  return "<a href=\"" +url+ "\">" +content+ "</a>";
}

function createListItem (item) {
  return "<li>" + item + "</li>";
}

function createNamespaceItem(name) {
  return createListItem(createLink("#ns-" + name, name));
}

function createClassItem (name) {
  return createListItem(createLink ("#class-" + name, name));
}

function hideItems(items) {
  items.forEach(function (item) { $(item).css("display", "none"); });
}

function hideEverything () {
  hideItems(["#main-area", "#namespace-area", "#class-area"]);
  $("#breadcrumb").html("");
}

function showArea (area)
{
  $(area).css ("display", "block");
}

function clearItems (lists)
{
  $.each (lists, function (i, item) {
    $(item).html ("");
  });
}

function fixMarkdown(text) {
  // Backslash escapes for cross-references
  text = text.replace(/\\%/g, "%");

  // Program listings
  while (text.indexOf("|[") !== -1) {
    var result = /\|\[/.exec(text);
    var listingStart = result.index;
    result = /\]\|/.exec(text.slice(listingStart));
    var listingEnd = listingStart + result.index;
    text = text.substring(0, listingStart) +
      "<pre class='ui blue compact stacked segment'>" +
      text.substring(listingStart + 2, listingEnd) + "</pre>" +
      text.substring(listingEnd + 2);
  }
  return text;
}

function fixLinks(ns) {
  $("span[data-xref]").each(function (ix, link) {
    var target = $(link).attr("data-xref");
    var components = target.split(".");
    var targetNs = components[0];
    var rest = components.slice(1).join(".");
    var linkType;
    if (rest.search(/^[A-Z]/) !== -1) {
      if (rest.indexOf(".") !== -1) {
        // Method
        console.log('method link', rest);
      } else if (rest.indexOf("-") !== -1) {
        // Signal/Property
        console.log('signal or property link', rest);
      } else {
        // Class
        $(link).replaceWith($("<a>").attr("href", "#class-" + ns + "." + rest).text(target));
      }
    } else {
      // Function
      console.log('function link', rest);
    }
  });
}

function createBreadcrumbDivider() {
  return $("<div>").addClass("divider").text("/");
}

function updateBreadcrumb(ns, className, method) {
  var breadcrumb = $("#breadcrumb");

  breadcrumb.append($("<i>").addClass("home icon"));
  var homeLink = $("<a>").addClass("section").attr("href", location.pathname).text("Home");
  breadcrumb.append(homeLink);

  if (!ns) {
    homeLink.addClass("active");
    return;
  }

  breadcrumb.append(createBreadcrumbDivider());
  // FIXME hash
  var nsLink = $("<a>").addClass("section").attr("href", "#ns-").text(ns);
  breadcrumb.append(nsLink);

  if (!className) {
    nsLink.addClass("active");
    return;
  }

  breadcrumb.append(createBreadcrumbDivider());
  // FIXME hash
  var classLink = $("<a>").addClass("section").attr("href", "#class-").text(className);
  breadcrumb.append(classLink);

  if (!method) {
    classLink.addClass("active");
    return;
  }

  breadcrumb.append(createBreadcrumbDivider());
  // FIXME hash
  var methodLink = $("<a>").addClass("active section").attr("href", "#").text(method);
  breadcrumb.append(methodLink);
}

function initClassItems (ns, className) {
    clearItems (["#class-property-list", "#class-method-list",
      "#class-signal-list", "#class-field-list", "#class-constructor-list",
      "#enum-member-table"]);
    hideEverything ();
    updateBreadcrumb(ns, className);
    showArea ("#class-area");
}

function generateList(list, listElement, textTransform) {
  var listContainer = listElement + "-container";

  if (!list) {
    $(listContainer).css("display", "none");
    return;
  }

  var content = list.reduce(function (content, item) {
    return content + textTransform(item);
  }, "");
  if (content !== "") {
    $(listElement).html(content);
    $(listContainer).css("display", "block");
  } else {
    $(listContainer).css("display", "none");
  }
}

function populateEnum (ns, enumName, data) {
  var content = $("#class-header .content");
  content.html(ns + "." + enumName);

  hideItems(["#class-constructor-list-container", "#class-method-list-container",
    "#class-property-list-container", "#class-field-list-container",
    "#class-signal-list-container"]);
  $("#enum-member-list-container").css("display", "block");

  var rows = data.members.reduce(function (str, item) {
    return str + "<tr><td>" + ns + '.' + enumName + '.' +
      item.name.toUpperCase() + "</td><td>" + item.doc + "</td></tr>";
  }, "");
  $("#enum-member-table").html(rows);

}

function populateClass (ns, className, data) {
  var content = $("#class-header .content");
  content.html(ns + "." + className);

  generateList(data.constructors, "#class-constructor-list", function (item) {
    var staticMethodPrefix = ns + "." + className + ".";
    return createListItem(staticMethodPrefix + item.name + "()");
  });
  generateList(data.methods, "#class-method-list", function (item) {
    var methodPrefix = ns + "." + className + ".prototype.";
    return createListItem(methodPrefix + item.name + "()");
  });
  var itemName = function (item) { return createListItem(item.name); };
  generateList(data.properties, "#class-property-list", itemName);
  generateList(data.fields, "#class-field-list", itemName);
  generateList(data.signals, "#class-signal-list", itemName);
  $("#enum-member-list-container").css("display", "none");
}

// Currently classes, enums, and structs have the same #class- hashtag because
// of the structure of the generated JSON.
function goToClass (jsonName) {
  hideEverything();

  var ns = jsonName.split(".")[0];

  $.getJSON ("docs-test/" + jsonName + ".json", function (data) {
    showArea("#class-area");

    $("#class-doc").html(fixMarkdown(data.doc));

    initClassItems (ns, data.name);

    if (data.kind === "enum")
      populateEnum(ns, data.name, data);
    else
      populateClass(ns, data.name, data);
    fixLinks(ns);
  });
}

function initNS(ns) {
  clearItems(["#namespace-class-list", "#namespace-function-list",
    "#namespace-enum-list", "#namespace-struct-list"]);
  hideEverything();
  updateBreadcrumb(ns);
  showArea ("#namespace-area");
}

function populateNS (ns, data) {
  var content = $("#namespace-header .content");
  content.html(ns);
  content.append($("<div>").addClass("sub header").html("API version " + data.version));

  var classItem = function (item) { return createClassItem(ns + "." + item.name); };
  generateList(data.classes, "#namespace-class-list", classItem);
  generateList(data.enums, "#namespace-enum-list", classItem);

  generateList(data.functions, "#namespace-function-list", function (item) {
    var linkName = ns + "." + item.name;
    var displayName = linkName + "()";
    // FIXME hash
    return createListItem(createLink("#", displayName));
  });

  // MyObjectClass and MyObjectPrivate structures make no sense in GJS
  var filteredStructs = data.records.filter(function (item) {
    return !endsWith(item.name, "Class") && !endsWith(item.name, "Private");
  });
  generateList(filteredStructs, "#namespace-struct-list", classItem);
}

function goToNS (namespaceName)
{
  hideEverything();

  $.getJSON("docs-test/" + namespaceName + ".json", function (data) {
    var ns = data.name;
    initNS(ns);
    populateNS(ns, data);
  });
}

function onHashchange (newUrl) {
  var hash = location.hash;
  if (hash.match("^#class-"))
    goToClass(hash.slice("#class-".length));
  else if (hash.match("^#ns-"))
    goToNS(hash.slice("#ns-".length));
}

$(document).ready (function () {
  window.onhashchange = onHashchange;
  hideEverything();

  updateBreadcrumb();

  var namespaces = ["Gtk-3.0"].reduce(function (content, namespace) {
    return content + createNamespaceItem(namespace);
  }, "");
  $("#namespace-index ul").html(namespaces);
});
