const sw = document.getElementById("switch-style"), sw_mobile = document.getElementById("switch-style-m"), b = document.body;

if (b) {
  function toggleTheme(target, dark) {
    target.classList.toggle("dark-theme", dark)
    target.classList.toggle("light-theme", !dark)
  }

  function switchEventListener() {
    toggleTheme(b, this.checked);
    if (window.localStorage) {
      this.checked ? localStorage.setItem("theme", "dark-theme") : localStorage.setItem("theme", "light-theme")
    }
  }

  var isDarkTheme = (window.localStorage && localStorage.getItem("theme") === "dark-theme") || !(window.localStorage && localStorage.getItem("theme") === "light-theme") && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if(sw_mobile && !sw){
    sw_mobile.checked = isDarkTheme;

    sw_mobile.addEventListener("change", switchEventListener);
    
    // sync state between switches
  }

  if(sw && sw_mobile){
    sw.checked = isDarkTheme;
    sw_mobile.checked = isDarkTheme;

    sw.addEventListener("change", switchEventListener);
    sw_mobile.addEventListener("change", switchEventListener);
    
    // sync state between switches
    sw.addEventListener("change", function() {
      sw_mobile.checked = this.checked;
    });

    sw_mobile.addEventListener("change", function() {
      console.log("Here")
      sw.checked = this.checked;
    });
    

    console.log("Registered")
  }

  toggleTheme(b, isDarkTheme);
}
