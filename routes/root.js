const express = require('express')
const router = express.Router()

const main = require('./mainPages')
const events = require('./studyEvents')
const feed = require('./feed')
const logging = require('./logging')
const tests = require('./tests')

const game = require('./game')

const renderLanding = (req, res) => res.render('landing', {
  user: req.user,
  title: "X-Fake News"
})


const renderInstructions = (req, res) => res.render('explanationsrating', {
  user: req.user,
  title: "instructions"
})


// http://localhost:8080/instructions?task=TextAnnotation&key=2
// http://localhost:8080/instructions?task=TextRating&key=0
// http://localhost:8080/instructions?task=ImageAnnotation&key=0
// http://localhost:8080/instructions?task=ImageRating&key=0

const renderConsent = (req, res) => res.render('cnsnt', {
  user: req.user,
  title: "Consent Form"
})


const renderImageAnnotation = (req, res) => res.render('expimg', {
  user: req.user,
  title: "Main Task"
})


const renderImageRating = (req, res) => res.render('expqlty', {
  user: req.user,
  title: "Main Task"
})


const renderTextAnnotation = (req, res) => res.render('exptxt', {
  user: req.user,
  title: "Main Task"
})


const renderTextDemo = (req, res) => res.render('exptxtdemo', {
  user: req.user,
  title: "Main Task"
})


const renderTextRating = (req, res) => res.render('evltxt', {
  user: req.user,
  title: "Main Task"
})



const EndHit = (req, res) => res.render('finish', {
  user: req.user,
  title: "Main Task"
})



// const renderInformationSheet = (req, res) => res.render('study/informationSheet', {
//   // req.params.userType
//   user: req.user,
//   title: "X-Fake Information Sheet"
// })

const renderGeneralInfo = (req, res) => res.render('study/GeneralInfo', {
  user: req.user,
  title: "X-Fake Project Information"
})

const renderStudies = (req, res) => res.render('studies', {
  user: req.user,
  title: "X-Fake News - Studies"
})


/*** Basic ***/ 
router.get('/', renderLanding)

router.get('/instructions', renderInstructions)
router.get('/cnsnt', renderConsent)
router.get('/expimg', renderImageAnnotation)
router.get('/expqlty', renderImageRating)
router.get('/exptxt', renderTextAnnotation)
router.get('/misinformationdemo', renderTextDemo)
router.get('/evltxt', renderTextRating)
router.get('/finish', EndHit)


router.get('/generalinfo', renderGeneralInfo)
router.get('/studies', renderStudies)


/*** Study ***/
router.get('/begin/:studyType', events.studyStart)
router.get('/study/consent/:mturk_id', events.consentToStudy)
router.get('/study/next/:choice', events.nextTopicPlease)
router.post('/studyEvent', events.studyEvent)
router.get('/clearStudy', events.clearStudySession)
router.get('/study/completed', events.renderComplete)
router.get('/verify', events.renderVerify)
router.post('/verify', events.verify)

/*** Main Pages ***/
router.get('/study', main.renderStudyHome)
router.get('/study/infoSheet/:userType', events.renderInformationSheet)   // renderInformationSheet)
router.get('/study/questions/:questionSet', main.renderQuestions)
router.get('/study/instructions', main.renderStudyInstructions)
router.get('/study/topic/:claim_id', main.renderTopicExplorer)
router.get('/study/topic/:claim_id/:article_id', main.renderArticle)

/*** Feed ***/
router.get('/feed', feed.render)
router.post('/chooseArticle', feed.choose)
router.post('/removeArticle', feed.remove)

/*** Game ***/
router.get('/game/begin/:gameType/:gameCondition', game.renderIntro)
router.get('/game/trueOrFake', game.renderGame_TrueOrFake)
//router.get('/game/twoFakesAndATrue', game.renderGame_TwoFakes)
router.post('/guess', game.guess)


/*** Interaction Logging ***/
router.post('/logAnnotation', logging.logAnnotation)
router.get('/log/annotations', logging.allAnnotations)
router.get('/log/img_ann', logging.allImg_an)
router.get('/log/img_ann_id/:participantId', logging.allImg_an_id)
router.get('/log/img_ann_time/:participantId', logging.allImg_an_time_id)
router.get('/log/txt_ann_id/:participantId', logging.alltxt_an_id)



router.post('/log', logging.logInteraction)
router.get('/log/participants', logging.allParticipants)
router.get('/log/payment/:participantId', logging.payment)
router.get('/log/taskRuns', logging.allTaskRuns)
router.get('/log/events/', logging.allEvents)
router.get('/log/events/:participantId', logging.eventsForParticipant)
router.get('/log/surveys/', logging.allSurveys)
router.get('/log/surveys/:participantId', logging.surveyforParticipant)

// --- all qualitative surveys : post_study_survey
router.get('/log/qualsurvey/:participantId', logging.qualsurveyforParticipant)

// ---  log for  end_survey_2
router.get('/log/endsurvey/:participantId', logging.endsurveyforParticipant)

// ---  log for study time and 
router.get('/log/timesurvey/:participantId', logging.timesurveyforParticipant)

// ---  log for all interactions
router.get('/log/interaction/:participantId', logging.interactionforParticipant)

// ---  analysis of all logs
router.get('/log/analysis/:participantId', logging.interactionAnalysis)

// ---  user reliance and performance over time --> 3-points user reliance measures (T4, T8, T12)
router.get('/log/timeanalysisold/:participantId', logging.interactionAnalysisTimeOld)


// ---  user reliance over time --> 12-points user reliance measures
router.get('/log/trustanalysis/:participantId', logging.TrustAnalysisTime)

// ---  task performance: news accuracy over time --> 12-points
router.get('/log/performanalysis/:participantId', logging.PerformAnalysisTime)

// ---  user performance over time --> 12-points
router.get('/log/engageanalysis/:participantId', logging.EngagementAnalysisTime)


// ---  user confusion matrix 
router.get('/log/confmatanalysis/:participantId', logging.userConfMatrix)


// ---  user pre-study survey responses
router.get('/log/presurvey/:participantId', logging.presurveyforParticipant)


/*** Testing & Debugging***/
router.get('/unfluff', tests.unfluff)
router.get('/stats', tests.stats)
router.get('/allCSV', tests.csv)
router.get('/topics', tests.topicList)
router.get('/random', tests.renderRandom)
router.get('/topic/:claim_id', tests.renderTopic)



/*** Error Pages Misc.***/
router.get('*', function(req, res){
  res.status(404).send('Unknown page, sorry.');
});


module.exports = router
