var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]

function generateIssue() {
    const gitalk = new Gitalk({
        clientID: 'f074cbe4bcd4c3c61541',
        clientSecret: '28116a4e4308e2672dce925718a29285f53f3623',
        repo: 'DeveloperPortal', // The repository for storing comments,
        owner: 'sanacommerce',
        admin: ['sanacommerce'],
        id: location.pathname,      
        distractionFreeMode: false  
    })
    gitalk.render('gitalk-container')
}

if (feedbackQuestion) {
    // Check whether the issue exists yet then 
    let issueExists = false;
    fetch((`https://api.github.com/repos/sanacommerce/DeveloperPortal/issues?labels=Gitalk,${location.pathname}`)).then((res) => {
            return res.json()
        }).then((data) => {
            if (data.length) {
                generateIssue()
                issueExists = true
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
            if (!issueExists) {
                var createIssueDiv = document.getElementsByClassName("createIssue")[0]
                createIssueDiv.style.display = "block"
                createIssueDiv.children[1].onclick = (e) => {
                    createIssueDiv.style.display = "none"
                    generateIssue()
                }
            }

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
