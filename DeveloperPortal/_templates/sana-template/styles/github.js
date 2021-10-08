var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]


function generateIssue() {
    const gitalk = new Gitalk({
        clientID: '8ffabc8037cf22ca8da8',
        // clientID: '',
        clientSecret: '',
        repo: 'SanaComments', // The repository for storing comments,
        owner: 'Dionyzoz',
        admin: [''],
        id: location.pathname,      
        distractionFreeMode: false  
    })
    gitalk.render('gitalk-container')
}

const params = new URLSearchParams(window.location.search)

if (params.has("code")) {
    window.history.replaceState({}, document.title, window.location.href.replace(/\??code.*/, ''))
    window.scrollTo(0,document.body.scrollHeight)
}

if (feedbackQuestion) {
    let createIssue = document.getElementById("createissue")
    createIssue.style.display = "none"
    // Check whether the issue exists yet then 
    fetch((`https://api.github.com/repos/Dionyzoz/SanaComments/issues?labels=Gitalk,${location.pathname}`)).then((res) => {
            return res.json()
        }).then((data) => {
            if (data.length) {
                generateIssue()
            } else {
                if (params.has("code")){
                    generateIssue()
                }
                else{
                    createIssue.style.display = "flex"
                    createIssue.onclick = (e) => {
                        createIssue.style.display = "none"
                        generateIssue()
                    }
                }
            }
        })
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
