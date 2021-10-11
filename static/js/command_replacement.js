(function () {
  document.getElementById('book-search-input').removeAttribute("data-hotkeys");

  let project = "<PROJECT>"
  let stage = "<STAGE>"
  let app = "<APPNAME>"
  const projectInput = document.getElementsByName('project');
  const stageInput = document.getElementsByName('stage');
  const appInput = document.getElementsByName('app');
  const aliasSwitch = document.getElementsByName('aliasSwitch');
  const changeButton = document.getElementsByName('changeButton');
  const resetButton = document.getElementsByName('reset');
  const form = [projectInput, stageInput, appInput];
  const bannedWords = ["setops", "project", "stage", "app"]

  if (projectInput) {
    // eventlistener for enter-click
    form.forEach(nodeList => {
      nodeList.forEach(el => {
        el.addEventListener("keyup", function (event) {
          if (event.keyCode === 13) {
            replaceCommands(this);
          }
        });
      });
    });

    // eventlistener for submit button
    changeButton.forEach(button => {
      button.addEventListener("click", function (event) {
        replaceCommands(this);
      });
    });

    // eventlistener for alias switch
    aliasSwitch.forEach(el => {
      el.addEventListener('change', function () {
        if (this.checked) {
          replaceOnDocument("setops -p " + project +  " -s " + stage, "sos")
        } else {
          replaceOnDocument("sos", "setops -p " + project + " -s " + stage)
        }
      });
    });

    // eventlistener for reset button
    resetButton.forEach(button => {
      button.addEventListener("click", function (event) {
        aliasSwitch.forEach( el => {
          el.checked = false;
          replaceOnDocument("sos", "setops -p " + project + " -s " + stage);
        });
        form.forEach(nodeList => {
          nodeList.forEach(el => {
            el.value = ""
          });
        });
        replaceCommands(changeButton[0]);
      });
    });
  }

  function identifyFormFields(tag) {
    // identify project field
    projectInput.forEach(el => {
      if (el.value && el.value.match(/^ *$/) == null && !bannedWords.includes(el.value)) {
        if (tag.closest(".book-header") && el.closest(".book-header")) {
          projectVal = el.value;
          projectStore = true;
          return false;
        } else {
          projectVal = el.value;
          projectStore = true;
          return true;
        }
      } else {
        el.value = "";
        projectVal = "<PROJECT>";
        projectStore = false;
        return true;
      }
    });

    // identify stage field
    stageInput.forEach(el => {
      if (el.value && el.value.match(/^ *$/) == null && !bannedWords.includes(el.value)) {
        if (tag.closest(".book-header") && el.closest(".book-header")) {
          stageVal = el.value;
          stageStore = true;
          return false;
        } else {
          stageVal = el.value;
          stageStore = true;
          return true;
        }
      } else {
        el.value = "";
        stageVal = "<STAGE>";
        stageStore = false;
        return true;
      }
    });

    // identify app field
    appInput.forEach(el => {
      if (el.value && el.value.match(/^ *$/) == null && !bannedWords.includes(el.value)) {
        if (tag.closest(".book-header") && el.closest(".book-header")) {
          appVal = el.value;
          appStore = true;
          return false;
        } else {
          appVal = el.value;
          appStore = true;
          return true;
        }
      } else {
        el.value = "";
        appVal = "<APPNAME>";
        appStore = false;
        return true;
      }
    });
  }

  function replaceCommands(tag) {
    identifyFormFields(tag);
    if (projectVal) {
      replaceOnDocument(project, projectVal);
      project = projectVal;
      setLocalStorage("SetOpsProject", projectVal, projectStore);
    }
    if (stageVal) {
      replaceOnDocument(stage, stageVal);
      stage = stageVal;
      setLocalStorage("SetOpsStage", stageVal, stageStore);
    }
    if (appVal) {
      replaceOnDocument(app, appVal);
      app = appVal;
      setLocalStorage("SetOpsApp", appVal, appStore);
    }
  }

  const replaceOnDocument = (pattern, string, {target = document.body} = {}) => {
    pattern = new RegExp(pattern, "g");
    [
      target,
      ...target.querySelectorAll("code:not(script):not(noscript):not(style)")
    ].forEach(({childNodes: [...nodes]}) => nodes
    .filter(({nodeType}) => nodeType === document.TEXT_NODE)
    .forEach((textNode) => {
      textNode.textContent = textNode.textContent.replace(pattern, string)
    }));
  };

  // set or unset local storage variables based in command
  function setLocalStorage(key, value, command) {
    if (command) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key)
    }
  }

  // set value from local storage for project
  if (localStorage.getItem("SetOpsProject")) {
    projectInput.forEach(el => {
      el.value = localStorage.getItem("SetOpsProject");
    })
  }
  // set value from local storage for stage
  if (localStorage.getItem("SetOpsStage")) {
    stageInput.forEach(el => {
      el.value = localStorage.getItem("SetOpsStage");
    })
  }
  // set value from local storage for stage
  if (localStorage.getItem("SetOpsApp")) {
    appInput.forEach(el => {
      el.value = localStorage.getItem("SetOpsApp");
    })
  }
  replaceCommands(changeButton[0]);
})();
