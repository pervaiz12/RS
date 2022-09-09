var express = require('express')
const router = express.Router();
var UserController = require('../controllers/userController')
var auth = require('../middleware/auth');
var upload = require('../helpers/Imageupload')




// Public Routes

router.post('/login', UserController.userLogin)
router.post('/emptype', auth, UserController.empType)

router.get('/emptype', auth, UserController.emptype)

router.post('/imageUpload',auth, upload.single('image'),  UserController.imageUpload)


// userLeaveRequest emptype imageUpload
router.get('/userLeaveRequest', auth, UserController.userLeaveRequest)
router.get('/userLeavedetail', auth, UserController.userLeaveDetail)
// userInformation

router.get('/userInformation', auth, UserController.userInformation)

//protected Routes  getAllManger
// allrequests  approved reject
router.get('/approved', UserController.approved)
router.get('/reject', UserController.reject)

router.get('/allrequests', auth, UserController.allrequest)
router.get('/que', auth, UserController.qualificationget)
router.get('/empget', auth, UserController.employmentget)
router.get('/getAllManger', auth, UserController.getAllManager)


router.post('/changepassword', auth, UserController.changeUserPassword)
router.post('/register', auth, UserController.userRegistration)

// router.post('/userprofile',auth, upload.single('img'),  UserController.userProfile)
router.post('/userprofile', auth, UserController.userProfile)

router.post('/useraccount', auth, UserController.userAccount)
router.post('/employment', auth, UserController.employment)
router.post('/quickcontact', auth, UserController.quickcontact)
router.post('/qualificationExperience', auth, UserController.qualificationExperience)
router.post('/leaveRequest', auth, UserController.leaveRequest)
router.post('/userReport', auth, UserController.assigned)





module.exports = router

// export default router