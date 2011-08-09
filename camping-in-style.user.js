// ==UserScript==
// @name          Camping in Style
// @description   Color my world with Campfire stylesheets !
// @author        Tim Harper
// @include       *.campfirenow.com/room*
// ==/UserScript==

var page;
try {
  page = unsafeWindow;
} catch(e) {
  page = window;
}

Campfire = page.Campfire;
    
if ($H) try {
  // * LIBRARY FUNCTIONS * //
  function getCSSRule(ruleName, deleteFlag) {
    ruleName=ruleName.toLowerCase(); 
    if (document.styleSheets) {      
      for (var i=0; i<document.styleSheets.length; i++) { 
        var styleSheet=document.styleSheets[i];
        var ii=0;                              
        var cssRule=false;                      
        do {                                   
          if (styleSheet.cssRules) {          
            cssRule = styleSheet.cssRules[ii];
          } else {                             
            cssRule = styleSheet.rules[ii];    
          }                                    
          if (cssRule)  {                      
            if (cssRule.selectorText.toLowerCase()==ruleName) { 
              if (deleteFlag=='delete') {    
                if (styleSheet.cssRules) {  
                  styleSheet.deleteRule(ii);
                } else {                     
                  styleSheet.removeRule(ii);
                }                            
                return true;                 
              } else {                        
                return cssRule;              
              }                               
            }                                  
          }                                     
          ii++;                                 
        } while (cssRule)                        
      }                                           
    }                                              
    return false;                                  
  }                                                  

  function killCSSRule(ruleName) {     
    return getCSSRule(ruleName,'delete');  
  }                                         

  function addCSSRule(ruleName, properties, important) {       

    if (document.styleSheets) {        
      if (!getCSSRule(ruleName)) {    
        if (document.styleSheets[0].addRule) {       
          document.styleSheets[0].addRule(ruleName, null,0);
        } else {                   
          document.styleSheets[0].insertRule(ruleName+' { }', 0);
        }        
      }           
    }
    r = getCSSRule(ruleName);
    page.$H(properties).each(function(pair) {
      r.style.setProperty(pair.key, pair.value, important ? "important" : "");
    });

    return r;
  } 

  function setColors(u, options) {
    options = options || {};

    // Text
    addCSSRule(".user_" + u + " div.body, .user_" + u + " a, .user_" + u + " code", page.Object.extend({
      "color": "#999",
      "font-size": "10px"
    }, options.text || {}), true);

    addCSSRule(".user_" + u + " span.author", page.Object.extend({
      "color"            : "#777",
      "font-size"        : "10px"
    }, options.author || {}), true);

    addCSSRule(".user_" + u + " td.person", page.Object.extend({
      "background-color" : "#fff"
    }, options.authorCell || {}), true);
    
    addCSSRule(".user_" + u + " pre", { "border": "0px", "padding": "0px" }, true);
  }

  var modifier = function(e) { };
  function addModifier(fn) {
    var superModifier = modifier;
    modifier = function(e) {
      superModifier && superModifier(e);
      return(fn(e));
    };
  }

  function initialize() {
    page.$$("table.chat > tbody > tr").each(function(e) { modifier(e); });
    
    if (typeof( Campfire.Transcript.prototype.insertMessages_without_style_hook ) == "undefined" ) Campfire.Transcript.prototype.insertMessages_without_style_hook = Campfire.Transcript.prototype.insertMessages;
    Campfire.Transcript.prototype.insertMessages = function() {
      try {
        messages = this.insertMessages_without_style_hook.apply(this, arguments);
        messages.each(function(message) {
          message_dom_id = "message_"+message.id();
          el = page.$(message_dom_id);
          if (el) modifier(el);
        });
        return messages;
      } catch(e) { alert(e); return([]);}
    };
  }

  addModifier(function(e) {
    cell = e.down("span.author");
    if(cell) {
      name = cell.innerHTML.replace(/[^a-z0-9]/i, "").toLowerCase();
      e.addClassName('user_' + name);
    }
  });
  
  /********************************************************************************* 
  Your config goes here: (the defaults serve as an example)
  *********************************************************************************/

  addCSSRule(".hudson_success div.body", {"background-color": "green", "color": "white", "padding": "3px 0px", "font-weight": "bold;"}, true);
  addCSSRule(".hudson_failure div.body", {"background-color": "red",   "color": "white", "padding": "3px 0px", "font-weight": "bold;"}, true);

  // The name is downcased with all non-alphanumeric characters removed, and added as a css class ("Silly Gilly 1994" becomes "user_sillygilly")
  // Provide the converted name (without the user_ prefix) to setColors to colorize all messages by that user.
  // Available options: author, authorCell, text (text applies to links, preformatted text (pastes) and normal text).
  setColors("bot"    , { author: {color: "#7777aa"}, authorCell: { "background-color": "#fff" } });  // Bot
  setColors("chef"   , { author: {color: "#77aa77"}, authorCell: { "background-color": "#fff" } });  // Chef
  setColors("hudson" , { author: {color: "#aa7777"}, authorCell: { "background-color": "#fff" } });  // hudson
  
  addModifier(function(e) {
    if(e.hasClassName("user_hudson")) {
      body_text = e.down("div.body").innerHTML || "";
      if(body_text.match(/SUCCESS/)) e.addClassName("hudson_success");
      if(body_text.match(/FAILURE/)) e.addClassName("hudson_failure");
    };
  });

  // This needs to go at the end!
  initialize();
  
} catch(e) { alert(e); }
