var _model = document.getElementById("_model")
console.log(JSON.parse(_model.innerHTML))

var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]
// Will only execute this block if its not an index markdown file.

function generateIssue() {
    const gitalk = new Gitalk({
        clientID: '8ffabc8037cf22ca8da8',
        clientSecret: '52b0cc1edd81b0ed5cf8db65405354893a848ccb',
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
                generateIssue()
                issueExists = true
            }
        })
    feedbackQuestion.onclick = (e) => {
        if (e.target.classList[1] === "feedback-btn-button") {
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
                createIssueDiv.children[0].onclick = (e) => {
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
