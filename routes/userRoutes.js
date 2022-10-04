var express = require('express')
const router = express.Router();
var UserController = require('../controllers/userController')
var auth = require('../middleware/auth');
var upload = require('../helpers/Imageupload')




// Public Routes

router.post('/login', UserController.userLogin)
router.post('/emptype', auth, UserController.empType)

router.get('/getReportToMember', auth, UserController.getReportToMember)
router.get('/getReportTo', auth, UserController.getReportTo)

router.get('/emptype', auth, UserController.emptype)

router.get('/getAllUsers',auth,UserController.getAllUsers)

router.get('/info',auth,UserController.getUserInfo)

//get user list on admin  getAllUsers getUserInfo Updateuserprofile getReportToMember
router.get('/GetUsersData',auth,UserController.GetUsersData)

router.post('/imageUpload',auth, upload.single('image'),  UserController.imageUpload)


// userLeaveRequest emptype imageUpload
router.get('/userLeaveRequest', auth, UserController.userLeaveRequest)
router.get('/userLeavedetail', auth, UserController.userLeaveDetail)
// router.get('/userLeaveDet', auth, UserController.userLeaveDet)

// userInformation userLeaveDet notification  notificationTotal clearNotification
router.get('/notification', auth, UserController.notification)
router.get('/notificationTotal', auth, UserController.notificationTotal)
router.get('/clearNotification', auth, UserController.clearNotification)




router.get('/userInformation', auth, UserController.userInformation)

router.get('/userlist', auth, UserController.userlist)
router.get('/friendRequests', auth, UserController.friendRequests)



router.post('/refreshToken', UserController.refreshToken)

//protected Routes  getAllManger refreshToken userlist allfriends
// allrequests  approved reject  addfriend friendRequests acceptrequect  rejectrequect
router.get('/approved', UserController.approved)
router.get('/addfriend',auth, UserController.addfriend)
router.get('/allfriends',auth, UserController.allfriends)

router.get('/acceptrequect',auth, UserController.acceptrequect)
router.get('/rejectrequect',auth, UserController.rejectrequect)




router.get('/reject', UserController.reject)

router.get('/allrequests', auth, UserController.allrequest)
router.get('/que', auth, UserController.qualificationget)
router.get('/empget', auth, UserController.employmentget)
router.get('/getAllManger', auth, UserController.getAllManager)


router.post('/changepassword', auth, UserController.changeUserPassword)
router.post('/register', auth, UserController.userRegistration)

// router.post('/userprofile',auth, upload.single('img'),  UserController.userProfile)  Updateuserprofile
router.post('/userprofile', auth, UserController.userProfile)
router.post('/Updateuserprofile', auth, UserController.Updateuserprofile)


router.post('/useraccount', auth, UserController.userAccount)
router.post('/employment', auth, UserController.employment)
router.post('/quickcontact', auth, UserController.quickcontact)
router.post('/qualificationExperience', auth, UserController.qualificationExperience)
router.post('/leaveRequest', auth, UserController.leaveRequest)
router.post('/userReport', auth, UserController.assigned)





module.exports = router

// export default router