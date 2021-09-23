var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]


function generateIssue() {
    const gitalk = new Gitalk({
        clientID: '8ffabc8037cf22ca8da8',
        clientSecret: '',
        repo: 'SanaComments', // The repository for storing comments,
        owner: 'Dionyzoz',
        admin: ['Dionyzoz'],
        id: location.pathname,      
        distractionFreeMode: false  
    })
    gitalk.render('gitalk-container')
}

if (feedbackQuestion) {
    // Check whether the issue exists yet then 
    let issueExists = false;
    fetch((`https://api.github.com/repos/Dionyzoz/SanaComments/issues?labels=Gitalk,${location.pathname}`)).then((res) => {
            return res.json()
        }).then((data) => {
            if (data.length) {
                issueExists = true
                var createIssueDiv = document.getElementsByClassName("createIssue")[0].children[2]
                createIssueDiv.style.display = "none"
                generateIssue()
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
                createIssueDiv.children[2].onclick = (e) => {
                    createIssueDiv.style.display = "none"
                    generateIssue()
                }
            } 
            // else {
            //     let openIssueButton = document.getElementsByClassName("openissue")[0]
            //     openIssueButton.style.display = "block";
            //     openIssueButton.onclick = (e) => {
            //         generateIssue()
            //         openIssueButton.style.display = "none";
            //     }
            // }

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
