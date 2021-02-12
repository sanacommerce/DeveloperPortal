var feedbackQuestion = document.getElementsByClassName("feedback-question")[0]
var _model = document.getElementById("_model")

console.log(JSON.parse(_model.innerHTML))

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

if (feedbackQuestion) {
    feedbackQuestion.onclick = (e) => {
        if (e.target.classList[1] === "feedback-btn-button") {
            feedbackQuestion.style.display = "none"
        }
        if (e.target.classList[0] === "no") {
            var feedbackNo = document.getElementById("feedback-no")
            feedbackNo.style.display = "block"
            var submitButton = document.getElementsByClassName("submitfeedback")[0]
            console.log(submitButton)
            submitButton.onclick = (e) => {
                // * Google analytics to record the no and the options
                var options = Array.from(document.querySelectorAll(".feedback-option > input"))
                console.log(options)
                window.dataLayer.push({
                    title: feedbackQuestion.dataset.forTitle,
                    feedback: "no",
                    "feedback-reason": options.filter((option) => option.checked).map((option) => option.value),
                    event: 'feedbackSubmission'
                });
                var feedbackResultNo = document.getElementById("feedback-result-no")
                e.currentTarget.style.display = "none"
                feedbackResultNo.style.display = "block"
                options.forEach((option) => {
                    option.disabled = true
                })
            }
        } else if (e.target.classList[0] === "yes") {
            // * Google analytics to record the yes
            window.dataLayer.push({
                title: feedbackQuestion.dataset.forTitle,
                feedback: 'yes',
                "feedback-reason": [],
                event: 'feedbackSubmission'
            });
            var feedbackResultYes = document.getElementById("feedback-result-yes")
            feedbackResultYes.style.display = "block"
        }
    }
}
