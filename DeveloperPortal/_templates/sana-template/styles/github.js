var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]




const params = new URLSearchParams(window.location.search)

if (params.has("code")) {
    window.history.replaceState({}, document.title, window.location.href.replace(/\??code.*/, ''))
    window.scrollTo(0,document.body.scrollHeight)
}

if (feedbackQuestion) {
    let issues = new Array();
    let dropdownMenuButton = document.getElementById("dropdownMenuButton")
    let gitContainer = document.getElementById("gitalk-container")
    let createissue = document.getElementById("createissue")
    function updateIssues(issue = null){
        dropdownMenuButton.style.display = "inline-block"
        let ddmenu = document.getElementById("dd-menu")
        ddmenu.innerHTML = ''
        if(issue){
            issues.push(issue)
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
            anchor.onclick = () => {
                gitContainer.innerHTML = ''
                generateIssue(issue.title, issue.number)
            }
            ddmenu.append(anchor)
        }
    }
    function generateIssue(title, number) {
        const gitalk = new Gitalk({
            number,
            clientID: '8ffabc8037cf22ca8da8',
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
        let newIssue = prompt("How will you title your issue?")
        if (newIssue){
            gitContainer.innerHTML = ''
            generateIssue(newIssue, -1)
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
}
