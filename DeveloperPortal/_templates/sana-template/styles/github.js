var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]






if (feedbackQuestion) {
    let number;
    let clientID = "8ffabc8037cf22ca8da8"
    function getCookie (cname) {
        const name = `${cname}=`
        const ca = document.cookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') {
            c = c.substring(1)
            }
            if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length)
            }
        }
        return ''
    }
    const queryStringify = query => {
        const queryString = Object.keys(query)
            .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
            .join('&')
        return queryString
    }
    const login = () => {
        const githubOauthUrl = 'https://github.com/login/oauth/authorize'
        const query = {
        client_id: clientID,
        redirect_uri: window.location.href,
        scope: 'public_repo',
        state: 'create'
        }
        window.location.href = `${githubOauthUrl}?${queryStringify(query)}` 
    }

    let issues = new Array();
    let dropdownMenuButton = document.getElementById("dropdownMenuButton")
    let gitContainer = document.getElementById("gitalk-container")
    let createissue = document.getElementById("createissue")
    let description = document.getElementById("gitalk-description")
    let title = document.getElementById("gitalk-title")
    function updateIssues(issue = null){
        dropdownMenuButton.style.display = "inline-block"
        let ddmenu = document.getElementById("dd-menu")
        ddmenu.innerHTML = ''
        if(issue){
            issues.push(issue)
            title.innerHTML = issue.title
            description.innerHTML = issue.body
        }
        if (issues.length){
            createIssue.style.marginLeft = "10px"
        } else{
            createIssue.style.marginLeft = "0px"
        }
        for(let issue of issues){
            let anchor = document.createElement("a")
            anchor.classList.add("dropdown-item")
            anchor.innerHTML = issue.title
            if (issue.number == number){
                title.innerHTML = issue.title
                description.innerHTML = issue.body
            }
            anchor.onclick = () => {
                gitContainer.innerHTML = ''
                title.innerHTML = issue.title
                description.innerHTML = issue.body
                renderIssue(issue.title, issue.number)
            }
            ddmenu.append(anchor)
        }
    }
    function generateIssue(){
        let newIssue = prompt("How will you title your issue?")
        let body = prompt("What is the description?")
        if (newIssue){
            gitContainer.innerHTML = ''
            renderIssue(newIssue, -1, body)
        }
    }
    function renderIssue(title, number, body="") {
        const gitalk = new Gitalk({
            number,
            clientID: '8ffabc8037cf22ca8da8',
            body,
            title,
            // clientID: '',
            clientSecret: '',
            repo: 'SanaComments', // The repository for storing comments,
            owner: 'Dionyzoz',
            admin: [''],
            id: location.pathname,      
            distractionFreeMode: false,
            updateIssues
        })
        gitalk.render('gitalk-container')
        
    }   
    // Check whether the issue exists yet then 
    fetch((`https://api.github.com/repos/Dionyzoz/SanaComments/issues?labels=${location.pathname}`)).then((res) => {
        return res.json()
    }).then((data) => {
        if (data.length) {
            issues.push(...data)
            updateIssues()
        } else {
            createIssue.style.marginLeft = "0px"
        } 
    })
    let createIssue = document.getElementById("createissue")
    createIssue.style.display = "flex"
    createIssue.onclick = (e) => {
        if(getCookie('access_token')){
            generateIssue()
        } else{
            alert("You must be logged in first")
            login()
        }
    }
    feedbackQuestion.onclick = (e) => {
        if (e.target.classList[0] == "no" || e.target.classList[0] == "yes"){
            feedbackQuestion.style.display = "none"
        }
        if (e.target.classList[0] === "no") {
            // * Google analytics to record the no
            window.dataLayer.push({
                title: feedbackQuestion.dataset.forTitle,
                feedback: "no",
                event: 'feedbackSubmission'
            });
            var feedbackNo = document.getElementById("feedback-no")
            feedbackNo.style.display = "block"
            

        } else if (e.target.classList[0] === "yes") {
            // * Google analytics to record the yes
            window.dataLayer.push({
                title: feedbackQuestion.dataset.forTitle,
                feedback: 'yes',
                event: 'feedbackSubmission'
            });
            var feedbackResultYes = document.getElementById("feedback-result-yes")
            feedbackResultYes.style.display = "block"
        }
    }
    const params = new URLSearchParams(window.location.search)
    if (params.has("code")) {
        if (params.has("state")){
            const state = params.get("state")
            number = parseInt(state)
            if (number){
                renderIssue("", number)
            } else if (state == "create") {
                generateIssue()
            }
        }
        window.history.replaceState({}, document.title, window.location.href.replace(/\??code.*/, ''))
        window.scrollTo(0,document.body.scrollHeight)
    }
}
